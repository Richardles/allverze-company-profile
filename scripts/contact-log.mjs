#!/usr/bin/env node
/**
 * Reads logs/contact.jsonl and prints a readable timeline.
 *
 * The file itself is JSONL so it stays machine-readable; this exists so you do
 * not need jq to answer "what happened at 21:10?".
 *
 * Usage:
 *   npm run logs:contact                  last 20 records
 *   npm run logs:contact -- --tail 5      last 5
 *   npm run logs:contact -- --all         everything
 *   npm run logs:contact -- --problems    BOT + FAIL + ERROR + THROTTLED only
 *   npm run logs:contact -- --bots        honeypot hits only
 *   npm run logs:contact -- --failures    rejected + errored only
 *   npm run logs:contact -- --json        raw lines, no rendering
 *   npm run logs:contact -- --path <p>    different file
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const flagValue = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

if (has('--help') || has('-h')) {
  console.log(
    [
      'Usage: npm run logs:contact [-- --tail N | --all] [--problems | --bots | --failures] [--json] [--path FILE]',
      '',
      '  --tail N      show the last N records (default 20)',
      '  --all         show every record',
      '  --problems    BOT + FAIL + ERROR + THROTTLED only',
      '  --bots        honeypot hits only',
      '  --failures    rejected submissions and hard errors only',
      '  --json        print raw JSONL lines instead of a rendered view',
      '  --path FILE   read a different log file',
    ].join('\n')
  );
  process.exit(0);
}

const USE_COLOR = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const ANSI = {
  OK: '\u001b[32m',
  BOT: '\u001b[35m',
  FAIL: '\u001b[33m',
  THROTTLED: '\u001b[36m',
  ERROR: '\u001b[31m',
};
const RESET = '\u001b[0m';
const DIM = '\u001b[2m';
const PROBLEM_TAGS = new Set(['BOT', 'FAIL', 'ERROR', 'THROTTLED']);

const MAX_VALUE = 56;
const SKIP = new Set(['tag', 'level', 'time', 'event', 'problem']);

const filePath = path.resolve(
  flagValue('--path', process.env.CONTACT_LOG_PATH || 'logs/contact.jsonl')
);

let raw;
try {
  raw = await readFile(filePath, 'utf8');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log(`No log file yet at ${filePath}`);
    console.log('Submit the contact form once, or set CONTACT_LOG_PATH.');
    process.exit(0);
  }
  throw error;
}

const records = [];
for (const line of raw.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  try {
    records.push(JSON.parse(trimmed));
  } catch {
    // A partial final line can exist if the process died mid-write. Skip it
    // rather than failing the whole view.
  }
}

let filtered = records;
let filterLabel = '';
if (has('--bots')) {
  filtered = records.filter((r) => r.tag === 'BOT');
  filterLabel = 'bots';
} else if (has('--failures')) {
  filtered = records.filter((r) => r.tag === 'FAIL' || r.tag === 'ERROR');
  filterLabel = 'failures';
} else if (has('--problems')) {
  filtered = records.filter((r) => r.tag === 'THROTTLED' || PROBLEM_TAGS.has(r.tag));
  filterLabel = 'problems';
}

const tailArg = flagValue('--tail', '20');
const tailCount = has('--all') ? Infinity : Math.max(1, Number.parseInt(tailArg, 10) || 20);
const shown = filtered.slice(-tailCount);

if (has('--json')) {
  for (const record of shown) console.log(JSON.stringify(record));
  process.exit(0);
}

const renderValue = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  const flat = text.replace(/\s+/g, ' ').trim();
  if (!flat) return '';
  return flat.length > MAX_VALUE ? `${flat.slice(0, MAX_VALUE)}…` : flat;
};

const paint = (tag, text) => (USE_COLOR ? `${ANSI[tag] ?? ''}${text}${RESET}` : text);
const dim = (text) => (USE_COLOR ? `${DIM}${text}${RESET}` : text);

console.log(
  `${dim(`${filePath}  ${shown.length} of ${records.length} record(s)${filterLabel ? ` · ${filterLabel}` : ''}`)}`
);
console.log('');

for (const record of shown) {
  const clock = (record.time ?? '').slice(11, 19);
  const tag = String(record.tag ?? '?').padEnd(10);
  const event = String(record.event ?? '').replace(/^submission\./, '').padEnd(9);

  const parts = [];
  for (const [key, value] of Object.entries(record)) {
    if (SKIP.has(key)) continue;
    const rendered = renderValue(value);
    if (rendered) parts.push(`${key}=${rendered}`);
  }

  const line = `${dim(clock)}  ${paint(record.tag, tag)} ${event} ${parts.join('  ')}`;
  console.log(record.problem ? paint(record.tag, `PROBLEM  ${line.replace(/\s+$/, '')}`) : line);
}

if (records.length === 0) {
  console.log(dim('No records parsed. Is the file empty or not JSONL?'));
}
