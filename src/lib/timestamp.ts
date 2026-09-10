export type TimestampResult =
  | { ok: true; iso: string; seconds: number; milliseconds: number }
  | { ok: false; error: string };

function fromMs(ms: number): TimestampResult {
  const date = new Date(ms);
  if (!Number.isFinite(ms) || Number.isNaN(date.getTime())) {
    return { ok: false, error: 'Invalid timestamp' };
  }
  return {
    ok: true,
    iso: date.toISOString(),
    seconds: ms / 1000,
    milliseconds: ms,
  };
}

export function fromUnix(value: string, unit: 's' | 'ms'): TimestampResult {
  if (!value.trim()) {
    return { ok: false, error: '' };
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return { ok: false, error: 'Invalid timestamp' };
  }
  const ms = unit === 's' ? n * 1000 : n;
  return fromMs(ms);
}

export function fromIso(value: string): TimestampResult {
  if (!value.trim()) {
    return { ok: false, error: '' };
  }
  const date = new Date(value);
  const ms = date.getTime();
  if (!Number.isFinite(ms)) {
    return { ok: false, error: 'Invalid timestamp' };
  }
  return fromMs(ms);
}
