const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*-_=+';
const SIMILAR = new Set(['i', 'l', '1', 'O', '0']);

function randomIndex(n: number): number {
  if (n <= 0 || n > 256) {
    throw new Error('charset length out of range');
  }
  const max = 256;
  const limit = max - (max % n);
  const buf = new Uint8Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    const x = buf[0];
    if (x < limit) return x % n;
  }
}

export type PasswordResult =
  | { ok: true; password: string }
  | { ok: false; error: string };

export function generatePassword(opts: {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
}): PasswordResult {
  if (!Number.isInteger(opts.length) || opts.length < 8 || opts.length > 128) {
    return { ok: false, error: 'Length must be between 8 and 128' };
  }
  let charset = '';
  if (opts.lower) charset += LOWER;
  if (opts.upper) charset += UPPER;
  if (opts.digits) charset += DIGITS;
  if (opts.symbols) charset += SYMBOLS;
  if (opts.excludeSimilar) {
    charset = [...charset].filter((c) => !SIMILAR.has(c)).join('');
  }
  if (!charset) return { ok: false, error: 'Select at least one character set' };
  let out = '';
  for (let i = 0; i < opts.length; i++) {
    out += charset[randomIndex(charset.length)];
  }
  return { ok: true, password: out };
}
