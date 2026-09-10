export type CrontabResult =
  | { ok: true; lines: string[] }
  | { ok: false; error: string };

const FIVE_FIELD_ONLY = 'Only five-field cron expressions are supported.';
const INVALID_FIELD = 'Invalid cron field';

const FIELDS: { label: string; min: number; max: number }[] = [
  { label: 'minute', min: 0, max: 59 },
  { label: 'hour', min: 0, max: 23 },
  { label: 'day of month', min: 1, max: 31 },
  { label: 'month', min: 1, max: 12 },
  { label: 'day of week', min: 0, max: 7 },
];

export function explainCron(input: string): CrontabResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: '' };

  const tokens = trimmed.split(/\s+/);
  if (tokens[0].startsWith('@') || tokens.length !== 5) {
    return { ok: false, error: FIVE_FIELD_ONLY };
  }

  const lines: string[] = [];
  for (let i = 0; i < 5; i++) {
    const explained = explainField(tokens[i], FIELDS[i]);
    if (explained === null) return { ok: false, error: INVALID_FIELD };
    lines.push(explained);
  }
  return { ok: true, lines };
}

function explainField(
  token: string,
  field: { label: string; min: number; max: number },
): string | null {
  const parts = token.split(',');
  if (parts.length === 0 || parts.some((p) => p === '')) return null;

  const phrases: string[] = [];
  for (const part of parts) {
    const phrase = explainPart(part, field);
    if (phrase === null) return null;
    phrases.push(phrase);
  }
  return `${field.label}: ${phrases.join(', ')}`;
}

function explainPart(
  part: string,
  field: { label: string; min: number; max: number },
): string | null {
  const stepSplit = part.split('/');
  if (stepSplit.length > 2) return null;

  const base = stepSplit[0];
  const stepRaw = stepSplit[1];
  let step: number | undefined;
  if (stepRaw !== undefined) {
    step = parseIntStrict(stepRaw);
    if (step === null || step <= 0) return null;
  }

  if (base === '*') {
    if (step !== undefined) return `every ${step} ${field.label}s`;
    return `every ${field.label}`;
  }

  const range = base.split('-');
  if (range.length > 2) return null;

  const start = parseIntStrict(range[0]);
  if (start === null || start < field.min || start > field.max) return null;

  if (range.length === 1) {
    if (step !== undefined) {
      if (start + step > field.max && start !== field.min) {
        // still valid: from start to max by step
      }
      return `every ${step} ${field.label}s from ${start} through ${field.max}`;
    }
    return String(start);
  }

  const end = parseIntStrict(range[1]);
  if (end === null || end < field.min || end > field.max || start > end) return null;

  if (step !== undefined) {
    return `every ${step} ${field.label}s from ${start} through ${end}`;
  }
  return `${start} through ${end}`;
}

function parseIntStrict(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  return Number(raw);
}
