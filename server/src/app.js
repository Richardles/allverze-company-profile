import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createContactRouter } from './routes/contact.js';
import { healthRouter } from './routes/health.js';
import { createEmailService } from './services/emailService.js';
import { createSubmissionLogger } from './lib/submissionLog.js';

const CONTACT_LIMITER_OPTIONS = {
  windowMs: 15 * 60 * 1000,
  max: 20,
};

const RATE_LIMIT_MESSAGE = 'Too many requests. Please try again later.';

export function createApp(config) {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: config.frontendUrl, credentials: true }));
  app.use(express.json({ limit: '10kb' }));

  const submissionLog = createSubmissionLogger(config);

  const contactLimiter = rateLimit({
    ...CONTACT_LIMITER_OPTIONS,
    standardHeaders: true,
    legacyHeaders: false,
    // A custom handler (instead of the `message` option) so throttling is
    // recorded too: this middleware runs before the route, so the router's own
    // logging never sees these requests.
    handler: (req, res) => {
      submissionLog.log('THROTTLED', 'submission.throttled', {
        reason: `rate limit (${CONTACT_LIMITER_OPTIONS.max}/${CONTACT_LIMITER_OPTIONS.windowMs / 60000}min)`,
        ip: req.ip,
      });
      res.status(429).json({ success: false, message: RATE_LIMIT_MESSAGE });
    },
  });

  const emailService = createEmailService(config);

  app.use('/api/health', healthRouter);
  app.use('/api/contact', contactLimiter, createContactRouter(emailService, submissionLog));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: 'Not found.' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  console.error('[error]', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
}