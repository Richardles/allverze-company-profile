import { extractIntent } from '../lib/intents.js';
import { buildLeadRef } from '../lib/leadRef.js';
import { formatWhatsAppDisplay, formatReceivedAt, formatUserReceivedAt } from '../lib/format.js';
import { sendEmail } from '../lib/resend.js';
import { buildCompanyWhatsAppHref, buildLeadWhatsAppHref } from '../lib/whatsapp.js';
import { renderConfirmation } from '../templates/confirmation.js';
import { renderInbound } from '../templates/inbound.js';

const SEND_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1000;
const FROM_NAME = 'Allverze Corporation';

/**
 * Wall-clock budget for the HTTP response, measured from the moment the request
 * reaches this service.
 *
 * Only the CUSTOMER CONFIRMATION wait is bounded by it: once the lead email has
 * been handed to Resend, the visitor is done and should not be made to sit
 * through a slow courtesy copy. 2700ms leaves ~300ms of headroom under the 3s
 * SLA for Express + network transit.
 *
 * The inbound (lead) send is never capped — see the await below.
 */
const RESPONSE_BUDGET_MS = 2700;

export function createEmailService(config) {
  return {
    async processInquiry(contact) {
      const receivedAt = formatReceivedAt(new Date(), config.timezone, config.timezoneLabel);
      const userReceivedAt =
        contact.timezone && contact.timezone !== config.timezone
          ? formatUserReceivedAt(new Date(), contact.timezone)
          : null;
      const { label: intentLabel, cleanMessage } = extractIntent(contact.message);
      const stage = contact.stage ?? undefined;
      const leadRef = buildLeadRef(intentLabel, config.timezone);

      const waHref = buildLeadWhatsAppHref({ name: contact.name, phone: contact.phone, leadRef });
      const waCompanyHref = buildCompanyWhatsAppHref({
        name: contact.name,
        companyNumber: config.whatsappNumber,
        leadRef,
      });

      // Both emails are dispatched CONCURRENTLY. The response then waits for the
      // LEAD only.
      //
      // This deliberately replaced a `setTimeout(3000)` that used to sit between
      // the two sends, which put a hard 3-second floor under every contact-form
      // submission. The two recipients are independent, so there is nothing to
      // gain by serialising them.
      //
      // Both promises are created before either is awaited; that ordering is
      // what makes the two network calls actually overlap.
      const startedAt = performance.now();
      const marks = { receivedAt: Date.now(), inboundSettledAt: null, confirmationSettledAt: null };

      // Each send is timed independently from the moment it STARTS, so the
      // numbers reported are each send's own duration — not its marginal
      // contribution. `total` being close to max(inbound, confirmation)
      // rather than their sum is the proof that they really did overlap.
      const inboundStart = performance.now();
      let inboundMs = 0;

      const inboundPromise = sendWithRetry(() =>
        sendEmail(config, {
          fromName: FROM_NAME,
          to: config.contactEmail,
          replyTo: contact.email,
          idempotencyKey: `${leadRef}-inbound`,
          ...renderInbound({
            leadRef,
            receivedAt,
            userReceivedAt,
            intentLabel,
            stage,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            message: cleanMessage,
            waHref,
          }),
        })
      ).finally(() => {
        inboundMs = Math.round(performance.now() - inboundStart);
        marks.inboundSettledAt = Date.now();
      });

      const confirmationStart = performance.now();
      let confirmationMs = 0;

      const confirmationPromise = sendConfirmation({
        contact,
        cleanMessage,
        intentLabel,
        stage,
        leadRef,
        receivedAt,
        userReceivedAt,
        waCompanyHref,
      }).finally(() => {
        confirmationMs = Math.round(performance.now() - confirmationStart);
        marks.confirmationSettledAt = Date.now();
      });

      // THE LEAD IS NEVER ABANDONED. If the inbound send alone blows the entire
      // budget we still wait for it — a slow response is recoverable, a silently
      // lost lead is not. Whatever the outcome, the route reports the truth.
      await inboundPromise;
      console.log(`[inbound-email] Sent inquiry ${leadRef} to ${config.contactEmail}`);

      const inboundWaitMs = Math.round(performance.now() - startedAt);

      // The customer confirmation is a courtesy copy, so the response stops
      // waiting for it once the budget runs out. The promise is NOT cancelled:
      // it keeps running and settles later, which is why the route may report
      // `pending` and the submission log can record the true "both sent" end.
      const confirmation = await settleWithin(
        confirmationPromise,
        RESPONSE_BUDGET_MS - inboundWaitMs
      );

      const totalMs = Math.round(performance.now() - startedAt);
      const waitedMs = totalMs - inboundWaitMs;

      if (confirmation === 'pending') {
        console.warn(
          `[confirmation-email] Deferred ${leadRef}: still in flight after ${totalMs}ms ` +
            `(budget ${RESPONSE_BUDGET_MS}ms). Responding without it; delivery continues in the background.`
        );
        // Observe the late settlement so the log tells the truth either way and
        // a late rejection can never surface as an unhandled rejection.
        confirmationPromise.then(
          (late) =>
            console.log(
              `[confirmation-email] Late delivery for ${leadRef}: "${late}" at ` +
                `${Math.round(performance.now() - startedAt)}ms (response left at ${totalMs}ms)`
            ),
          (error) =>
            console.error(
              `[confirmation-email] Late failure for ${leadRef}:`,
              error?.message || error
            )
        );
      }

      // Resolves when BOTH sends have actually settled, however long that takes.
      // This is what lets the caller record the real end of the journey even
      // though the HTTP response has already been sent.
      const completion = Promise.allSettled([inboundPromise, confirmationPromise]).then(
        ([inboundOutcome, confirmationOutcome]) => ({
          inbound: inboundOutcome.status === 'fulfilled' ? 'sent' : 'failed',
          confirmation:
            confirmationOutcome.status === 'fulfilled' ? confirmationOutcome.value : 'failed',
          settledMsFromStart: Math.round(performance.now() - startedAt),
          responseBeforeConfirmation: confirmation === 'pending',
        })
      );

      return {
        confirmation,
        leadRef,
        timings: { inboundMs, confirmationMs, totalMs, waitedMs },
        marks,
        completion,
      };
    },
  };

  async function sendConfirmation({ contact, cleanMessage, intentLabel, stage, leadRef, receivedAt, userReceivedAt, waCompanyHref }) {
    try {
      await sendWithRetry(() =>
        sendEmail(config, {
          fromName: FROM_NAME,
          to: contact.email,
          idempotencyKey: `${leadRef}-confirmation`,
          ...renderConfirmation({
            leadRef,
            receivedAt,
            userReceivedAt,
            intentLabel,
            stage,
            name: contact.name,
            phone: contact.phone,
            message: cleanMessage,
            publicEmail: config.publicEmail,
            whatsappDisplay: formatWhatsAppDisplay(config.whatsappNumber),
            waCompanyHref,
          }),
        })
      );
      console.log(`[confirmation-email] Confirmation sent to ${contact.email} for ${leadRef}`);
      return 'sent';
    } catch (confirmError) {
      console.error(
        `[confirmation-email] Failed to send confirmation to ${contact.email} (${leadRef}):`,
        confirmError.message || confirmError
      );
      return 'failed';
    }
  }
}

/**
 * Waits for `promise` at most `budgetMs`, then resolves `'pending'` while the
 * promise carries on in the background.
 *
 * Deliberately never rejects and never cancels: the underlying send keeps
 * running, and its own `.then`/`.catch` handles the late outcome. A budget that
 * could abort work would turn a slow Resend into a lost confirmation.
 *
 * An already-settled promise wins over a zero budget, because promise callbacks
 * are microtasks and run before the timer macrotask.
 */
function settleWithin(promise, budgetMs) {
  return new Promise((resolve) => {
    let done = false;
    let timer;

    function finish(value) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(value);
    }

    timer = setTimeout(() => finish('pending'), Math.max(0, budgetMs));
    promise.then(finish, (error) => {
      console.error('[confirmation-email] Confirmation promise rejected:', error?.message || error);
      finish('failed');
    });
  });
}

/**
 * Retries a send on transient failure.
 *
 * Takes a thunk rather than a mail object so each attempt performs a fresh
 * request. The `Idempotency-Key` set in the caller stays constant across
 * attempts, so a retry can never produce a duplicate email.
 */
async function sendWithRetry(send, attempts = SEND_ATTEMPTS) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await send();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await delay(RETRY_DELAY_MS);
      }
    }
  }
  throw lastError;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}