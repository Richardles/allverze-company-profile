import { Router } from 'express';
import { validateContactInput } from '../validation.js';

export function createContactRouter(emailService) {
  const router = Router();

  router.post('/', async (req, res, next) => {
    const startedAt = performance.now();

    try {
      if (req.body?.botcheck) {
        return res.json({ success: true, confirmation: 'skipped' });
      }

      const validation = validateContactInput(req.body ?? {});
      const validatedMs = Math.round(performance.now() - startedAt);
      if (!validation.ok) {
        return res.status(400).json({ success: false, message: validation.message });
      }

      const result = await emailService.processInquiry(validation.data);
      const totalMs = Math.round(performance.now() - startedAt);

      // Wall-clock time the concurrent dispatch saved. Serialised these two
      // sends would have cost inboundMs + confirmationMs; running them
      // together costs roughly max(), so the difference is the win.
      const inboundMs = result.timings?.inboundMs ?? 0;
      const confirmationMs = result.timings?.confirmationMs ?? 0;
      const overlapMs = Math.max(0, inboundMs + confirmationMs - totalMs);

      // Surfaced so the real send latency is measurable in DevTools
      // (Network -> Timing) instead of guessed at.
      res.set(
        'Server-Timing',
        [
          `validate;dur=${validatedMs}`,
          `inbound;dur=${inboundMs}`,
          `confirmation;dur=${confirmationMs}`,
          `overlap;dur=${overlapMs}`,
          `total;dur=${totalMs}`,
        ].join(', ')
      );

      console.log(
        `[contact-timing] leadRef=${result.leadRef} validate=${validatedMs}ms ` +
          `inbound=${inboundMs}ms confirmation=${confirmationMs}ms ` +
          `overlap=${overlapMs}ms total=${totalMs}ms`
      );

      return res.json({ success: true, confirmation: result.confirmation, leadRef: result.leadRef });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
