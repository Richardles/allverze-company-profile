const DEFAULTS = {
  port: 3001,
  fromEmail: 'hello@allverze.com',
  contactEmail: 'hello@allverze.com',
  publicEmail: 'hello@allverze.com',
  whatsappNumber: '6281283812336',
  frontendUrl: 'http://localhost:5173',
  timezone: 'Asia/Jakarta',
  timezoneLabel: 'WIB',
};

/**
 * Only the Resend API key is strictly required now that we send over HTTPS.
 *
 * NOTE: the env var is still called SMTP_PASS so no dashboard change is needed
 * on an already-deployed host (its value was always a Resend API key). It is
 * surfaced internally as `resendApiKey`, which is what it actually is.
 */
const REQUIRED_ENV = ['SMTP_PASS'];

export function loadConfig() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    console.error(`[config] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  return {
    port: Number(process.env.PORT || DEFAULTS.port),
    resendApiKey: process.env.SMTP_PASS,
    fromEmail: process.env.SMTP_FROM || process.env.PUBLIC_EMAIL || DEFAULTS.fromEmail,
    contactEmail: process.env.CONTACT_EMAIL || DEFAULTS.contactEmail,
    publicEmail: process.env.PUBLIC_EMAIL || DEFAULTS.publicEmail,
    whatsappNumber: process.env.WHATSAPP_NUMBER || DEFAULTS.whatsappNumber,
    frontendUrl: process.env.FRONTEND_URL || DEFAULTS.frontendUrl,
    timezone: process.env.TIMEZONE || DEFAULTS.timezone,
    timezoneLabel: process.env.TIMEZONE_LABEL || DEFAULTS.timezoneLabel,
  };
}