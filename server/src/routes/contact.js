import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { extractIntent } from '../lib/intents.js';
import { validateContactInput } from '../validation.js';

/**
 * The response SLA we hold ourselves to. Exceeding it is not an error — the
 * lead is already safe by then — but it is worth a loud line in the log so
 * breaches are countable instead of guessed at.
 */
const RESPONSE_SLA_MS = 3000;

/**
 * Pulls the human-facing fields out of a raw request body for the log.
 *
 * The intent is embedded in the message as a `[Intent: X]` prefix, so it is
 * split out here — the log should show both the readable intent and the message
 * the visitor actually typed.
 */
function describeBody(body = {}) {
  const rawMessage = typeof body?.message === 'string' ? body.message : '';
  const { label, cleanMessage } = extractIntent(rawMessage);
  return {
    name: body?.name,
    email: body?.email,
    phone: body?.phone,
    intent: label,
    stage: body?.stage,
    timezone: body?.timezone,
    message: cleanMessage || rawMessage,
  };
}

export function createContactRouter(emailService, submissionLog) {
  const router = Router();
  const log = (tag, event, fields) => submissionLog?.log(tag, event, fields);

  router.post('/', async (req, res, next) => {
    const startedAt = performance.now();
    const receivedAtEpoch = Date.now();
    // Our own id, so every line for one submission is correlated even when the
    // lead reference has not been minted yet (bots, rejections, hard failures).
    const id = `sub_${randomUUID().slice(0, 8)}`;
    const ip = req.ip;

    try {
      if (req.body?.botcheck) {
        log('BOT', 'submission.bot', {
          reason: 'honeypot',
          id,
          ip,
          botcheck: req.body.botcheck,
          ...describeBody(req.body),
        });
        // Same reply a real visitor gets, so a bot learns nothing.
        return res.json({ success: true, confirmation: 'skipped' });
      }

      const validation = validateContactInput(req.body ?? {});
      const validatedMs = Math.round(performance.now() - startedAt);
      if (!validation.ok) {
        log('FAIL', 'submission.rejected', {
          reason: validation.message,
          id,
          ip,
          ...describeBody(req.body ?? {}),
        });
        return res.status(400).json({ success: false, message: validation.message });
      }

      const data = validation.data;

      // Logged before the sends, and carries the message body, so a lead that
      // never reaches Resend is still on record. The body appears exactly once
      // per submission — later events reference it by `id` / `leadRef`.
      log('OK', 'submission.received', {
        id,
        ip,
        ...describeBody(data),
        clickedAt: data.clickedAt,
        clockSkewMs: data.clickedAt ? receivedAtEpoch - data.clickedAt : undefined,
        warnings: validation.warnings?.length ? validation.warnings : undefined,
      });

      const result = await emailService.processInquiry(data);
      const totalMs = Math.round(performance.now() - startedAt);

      // Wall-clock time the concurrent dispatch saved. Serialised these two
      // sends would have cost inboundMs + confirmationMs; running them
      // together costs roughly max(), so the difference is the win.
      const inboundMs = result.timings?.inboundMs ?? 0;
      const confirmationMs = result.timings?.confirmationMs ?? 0;
      const waitedMs = result.timings?.waitedMs ?? 0;
      const overlapMs = Math.max(0, inboundMs + confirmationMs - totalMs);
      const slaMet = totalMs <= RESPONSE_SLA_MS;

      // Surfaced so the real send latency is measurable in DevTools
      // (Network -> Timing) instead of guessed at. `confirm-wait` is the part
      // of the response that was spent waiting on the customer copy —
      // `pending` means it hit the budget and was left running.
      res.set(
        'Server-Timing',
        [
          `validate;dur=${validatedMs}`,
          `inbound;dur=${inboundMs}`,
          `confirmation;dur=${confirmationMs}`,
          `confirm-wait;dur=${waitedMs}`,
          `overlap;dur=${overlapMs}`,
          `total;dur=${totalMs}`,
        ].join(', ')
      );

      console.log(
        `[contact-timing] leadRef=${result.leadRef} validate=${validatedMs}ms ` +
          `inbound=${inboundMs}ms confirmation=${confirmationMs}ms ` +
          `confirm-wait=${waitedMs}ms overlap=${overlapMs}ms total=${totalMs}ms ` +
          `status=${result.confirmation}`
      );

      if (!slaMet) {
        console.warn(
          `[contact-sla] BREACH leadRef=${result.leadRef} total=${totalMs}ms > ${RESPONSE_SLA_MS}ms ` +
            `(inbound=${inboundMs}ms confirmation=${confirmationMs}ms status=${result.confirmation})`
        );
      }

      // Total time from the visitor's click to the moment the browser could
      // start rendering the success card.
      const clickToResponseMs = data.clickedAt
        ? receivedAtEpoch - data.clickedAt + totalMs
        : undefined;

      log('OK', 'submission.response', {
        id,
        leadRef: result.leadRef,
        validateMs: validatedMs,
        responseMs: totalMs,
        clickedToResponseMs: clickToResponseMs,
        inboundMs,
        confirmationMs,
        confirmWaitMs: waitedMs,
        confirmation: result.confirmation,
        slaMet,
      });

      // `completion` settles only when BOTH sends have actually finished, which
      // may be well after this response. That is the true end of the journey.
      if (result.completion?.then) {
        result.completion
          .then((outcome) => {
            const confirmationFailed = outcome.confirmation === 'failed';
            log(confirmationFailed ? 'FAIL' : 'OK', 'submission.complete', {
              ...(confirmationFailed
                ? { reason: 'confirmation email not delivered' }
                : {}),
              id,
              leadRef: result.leadRef,
              emails: { inbound: outcome.inbound, confirmation: outcome.confirmation },
              responseBeforeConfirmation: outcome.responseBeforeConfirmation,
              settledMsFromStart: outcome.settledMsFromStart,
              bothSettledMsFromClick: data.clickedAt
                ? receivedAtEpoch - data.clickedAt + outcome.settledMsFromStart
                : undefined,
            });
          })
          .catch((error) => {
            log('ERROR', 'submission.complete', {
              reason: error?.message || 'completion handler failed',
              id,
              leadRef: result.leadRef,
            });
          });
      }

      return res.json({ success: true, confirmation: result.confirmation, leadRef: result.leadRef });
    } catch (error) {
      log('ERROR', 'submission.error', {
        reason: error?.message || 'unknown error',
        id,
        ip,
      });
      return next(error);
    }
  });

  return router;
}
