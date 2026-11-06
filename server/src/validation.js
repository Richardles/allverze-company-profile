const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const PHONE_PATTERN = /^[+]?[\d\s\-()]{7,20}$/;
const TIMEZONE_PATTERN = /^[A-Za-z_+\-/]{1,64}$/;

const STAGE_MAX_LENGTH = 80;

/**
 * Client clocks drift, and a hand-crafted request can send anything at all.
 * `clickedAt` is only used to measure "click -> both emails settled", so a value
 * wildly far from server time is dropped rather than trusted or rejected.
 */
const CLICKED_AT_MAX_SKEW_MS = 10 * 60 * 1000;

function normalizeClickedAt(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  const epoch = Math.round(value);
  if (Math.abs(Date.now() - epoch) > CLICKED_AT_MAX_SKEW_MS) return undefined;
  return epoch;
}

/**
 * Project stage is a free-text, optional field: no allowlist, so stages can be
 * added or renamed on the client without a server change. Anything unusable is
 * dropped rather than rejected — an optional field must never block a real lead.
 * HTML escaping happens in the email templates, which treat it as untrusted.
 */
function normalizeStage(value) {
  if (typeof value !== 'string') return undefined;
  const cleaned = value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return undefined;
  return cleaned.slice(0, STAGE_MAX_LENGTH);
}

function isValidTimezone(value) {
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function validateContactInput(input) {
  const { name, email, phone, message, timezone, stage, clickedAt } = input;
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof phone !== 'string' ||
    typeof message !== 'string' ||
    !trimmedName ||
    !EMAIL_PATTERN.test(trimmedEmail) ||
    !PHONE_PATTERN.test(trimmedPhone) ||
    !trimmedMessage
  ) {
    return {
      ok: false,
      message: 'Please provide a valid name, email address, phone number, and message.',
    };
  }

  const validTimezone =
    typeof timezone === 'string' && TIMEZONE_PATTERN.test(timezone) && isValidTimezone(timezone)
      ? timezone
      : undefined;

  const validStage = normalizeStage(stage);
  const warnings = [];
  if (stage !== undefined && validStage === undefined) {
    warnings.push('dropped unusable project stage');
  }

  const validClickedAt = normalizeClickedAt(clickedAt);
  if (clickedAt !== undefined && validClickedAt === undefined) {
    warnings.push('dropped unusable clickedAt');
  }

  return {
    ok: true,
    data: {
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      message: trimmedMessage,
      timezone: validTimezone,
      stage: validStage,
      clickedAt: validClickedAt,
    },
    // Returned rather than console-warned so the caller can attach them to the
    // lead's log record; a bare warning would have no identity next to it.
    warnings,
  };
}
