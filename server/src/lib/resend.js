/**
 * Minimal Resend HTTP API client.
 *
 * Why HTTP instead of SMTP: nodemailer had to negotiate a multi-step SMTP
 * session (EHLO -> STARTTLS -> TLS handshake -> AUTH) before a single byte of
 * mail could flow. That handshake dominated our contact-form latency. Resend's
 * REST endpoint is one HTTPS request, so the send is a single roundtrip.
 *
 * Uses the global `fetch` shipped with Node 18+ — this adds no dependency.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/**
 * Hang-guard only. Resend normally answers in a few hundred ms; this exists so
 * a stalled socket can never hold the HTTP request open indefinitely.
 */
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Sends one transactional email.
 *
 * @param {object} config          Resolved app config (needs fromEmail + resendApiKey).
 * @param {object} mail
 * @param {string} mail.fromName   Display name used in the From header.
 * @param {string} mail.to         Recipient address.
 * @param {string} mail.subject
 * @param {string} mail.text       text/plain body.
 * @param {string} mail.html       text/html body.
 * @param {string} [mail.replyTo]  Reply-To address.
 * @param {string} [mail.idempotencyKey]
 *        Stable key (max 256 chars). Repeat sends with the same key within 24h
 *        are de-duplicated by Resend, so a retry after an ambiguous network
 *        failure cannot deliver the same email twice.
 * @returns {Promise<{id?: string}>} Parsed Resend response.
 */
export async function sendEmail(config, mail) {
  const payload = {
    from: `${mail.fromName} <${config.fromEmail}>`,
    to: [mail.to],
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  };

  if (mail.replyTo) {
    payload.reply_to = mail.replyTo;
  }

  const headers = {
    Authorization: `Bearer ${config.resendApiKey}`,
    'Content-Type': 'application/json',
  };

  if (mail.idempotencyKey) {
    headers['Idempotency-Key'] = mail.idempotencyKey;
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const reason = data?.message || data?.name || 'no reason given';
    throw new Error(`Resend rejected the send (HTTP ${response.status}): ${reason}`);
  }

  return data ?? {};
}
