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

      // Both emails are dispatched CONCURRENTLY, then both awaited.
      //
      // This deliberately replaced a `setTimeout(3000)` that used to sit between
      // the two sends, which put a hard 3-second floor under every contact-form
      // submission. The two recipients are independent, so there is nothing to
      // gain by serialising them — and because we still await both before
      // responding, the work is safe on serverless hosts (Vercel) where work
      // started after the response is discarded.
      //
      // Both promises are created before either is awaited; that ordering is
      // what makes the two network calls actually overlap.
      const startedAt = performance.now();

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
      });

      await inboundPromise;
      console.log(`[inbound-email] Sent inquiry ${leadRef} to ${config.contactEmail}`);

      const confirmation = await confirmationPromise;
      const totalMs = Math.round(performance.now() - startedAt);

      return {
        confirmation,
        leadRef,
        timings: { inboundMs, confirmationMs, totalMs },
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