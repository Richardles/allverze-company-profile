import { appendFile, mkdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';

/**
 * Submission audit log.
 *
 * One JSONL file, one record per event, written as `logs/contact.jsonl`.
 *
 * Two design decisions worth keeping:
 *
 * 1. `tag` is the FIRST key of every line, so a line-anchored grep finds
 *    problems without any JSON parsing:
 *      Select-String logs\contact.jsonl -Pattern '^\{"tag":"BOT"'
 *
 * 2. Writes are fire-and-forget and chained. Logging must never add latency to
 *    a contact-form response or interleave two half-written lines, so each
 *    append waits for the previous one but the caller never awaits any of it.
 *
 * Rotates at 5MB to a single `.1` file, which bounds disk exposure for a file
 * that contains real customer data.
 */

const ROTATE_BYTES = 5 * 1024 * 1024;
const CONSOLE_VALUE_MAX = 64;

/**
 * Tag vocabulary. Each tag also implies a level and whether the record counts
 * as a problem, so a consumer can filter on any of the three.
 */
const TAGS = {
  OK: { level: 'info', problem: false },
  BOT: { level: 'warn', problem: true },
  FAIL: { level: 'warn', problem: true },
  THROTTLED: { level: 'warn', problem: true },
  ERROR: { level: 'error', problem: true },
};

const ANSI = {
  OK: '\u001b[32m',
  BOT: '\u001b[35m',
  FAIL: '\u001b[33m',
  THROTTLED: '\u001b[36m',
  ERROR: '\u001b[31m',
};
const RESET = '\u001b[0m';
const DIM = '\u001b[2m';

export const SUBMISSION_TAGS = Object.keys(TAGS);

export function createSubmissionLogger(config = {}) {
  const filePath = path.resolve(config.contactLogPath || 'logs/contact.jsonl');

  // Vercel/Lambda give a read-only filesystem outside /tmp, and anything still
  // running when the response completes may be frozen away. There, the durable
  // record is the platform log stream, so we emit the same JSON line to stdout
  // instead of pretending a file would persist.
  const fileDisabled = Boolean(process.env.VERCEL);
  const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

  let queue = Promise.resolve();
  let dirReady = false;
  let warned = false;

  function warnOnce(error) {
    if (warned) return;
    warned = true;
    console.warn(
      `[submission-log] Could not append to ${filePath}: ${error?.message || error} ` +
        '(further write warnings suppressed)'
    );
  }

  async function rotateIfNeeded() {
    let size;
    try {
      size = (await stat(filePath)).size;
    } catch {
      // No file yet — nothing to rotate.
      return;
    }
    if (size < ROTATE_BYTES) return;
    const archived = `${filePath}.1`;
    // rename() onto an existing file fails on Windows, so clear it first.
    await rm(archived, { force: true });
    await rename(filePath, archived);
  }

  async function append(serialised) {
    try {
      if (!dirReady) {
        await mkdir(path.dirname(filePath), { recursive: true });
        dirReady = true;
      }
      await rotateIfNeeded();
      await appendFile(filePath, `${serialised}\n`, 'utf8');
    } catch (error) {
      warnOnce(error);
    }
  }

  function renderValue(value) {
    if (value === null || value === undefined || value === '') return '';
    const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const flat = text.replace(/\s+/g, ' ').trim();
    if (!flat) return '';
    return flat.length > CONSOLE_VALUE_MAX ? `${flat.slice(0, CONSOLE_VALUE_MAX)}…` : flat;
  }

  function mirror(record) {
    const head = `[${record.tag}]`.padEnd(12);
    const color = useColor ? ANSI[record.tag] ?? '' : '';
    const reset = useColor ? RESET : '';
    const dim = useColor ? DIM : '';

    const parts = [];
    for (const [key, value] of Object.entries(record)) {
      if (key === 'tag' || key === 'level' || key === 'time' || key === 'event') continue;
      if (key === 'problem') {
        parts.push('PROBLEM');
        continue;
      }
      const rendered = renderValue(value);
      if (rendered) parts.push(`${key}=${rendered}`);
    }

    const clock = record.time.slice(11, 19);
    console.log(
      `${color}${head}${reset}${dim}${clock}${reset}  ${record.event}  ${parts.join('  ')}`
    );
  }

  /**
   * @param {'OK'|'BOT'|'FAIL'|'THROTTLED'|'ERROR'} tag
   * @param {string} event  dotted event name, e.g. `submission.bot`
   * @param {object} [fields]
   */
  function log(tag, event, fields = {}) {
    const meta = TAGS[tag] ?? TAGS.OK;
    const { reason, ...rest } = fields;

    // Build the record key-by-key so `tag` is guaranteed to serialise first.
    const record = { tag, level: meta.level };
    if (meta.problem) record.problem = true;
    if (reason) record.reason = reason;
    record.time = new Date().toISOString();
    record.event = event;
    Object.assign(record, rest);

    const serialised = JSON.stringify(record);

    if (fileDisabled) {
      console.log(serialised);
      return;
    }

    mirror(record);
    queue = queue.then(() => append(serialised)).catch(() => {});
  }

  return {
    log,
    path: filePath,
    /** Resolves once every queued line has been written. Test-only helper. */
    flush: () => queue,
  };
}
