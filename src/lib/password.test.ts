import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generatePassword } from './password';

const DEFAULTS = {
  length: 16,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  excludeSimilar: false,
};

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*-_=+';
const SIMILAR = ['i', 'l', '1', 'O', '0'];
const EMPTY_CHARSET = {
  ok: false as const,
  error: 'Select at least one character set',
};

describe('generatePassword', () => {
  it('returns ok true and length 16 with default options', () => {
    const result = generatePassword(DEFAULTS);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.password).toHaveLength(16);
  });

  it('rejects length 7', () => {
    expect(generatePassword({ ...DEFAULTS, length: 7 })).toEqual({
      ok: false,
      error: 'Length must be between 8 and 128',
    });
  });

  it('rejects length 129', () => {
    expect(generatePassword({ ...DEFAULTS, length: 129 })).toEqual({
      ok: false,
      error: 'Length must be between 8 and 128',
    });
  });

  it('rejects NaN length', () => {
    expect(generatePassword({ ...DEFAULTS, length: Number.NaN })).toEqual({
      ok: false,
      error: 'Length must be between 8 and 128',
    });
  });

  it('rejects a fractional length', () => {
    expect(generatePassword({ ...DEFAULTS, length: 16.5 })).toEqual({
      ok: false,
      error: 'Length must be between 8 and 128',
    });
  });

  it('accepts length 8 and 128 when charset is non-empty', () => {
    const eight = generatePassword({ ...DEFAULTS, length: 8 });
    const max = generatePassword({ ...DEFAULTS, length: 128 });
    expect(eight.ok).toBe(true);
    expect(max.ok).toBe(true);
    if (eight.ok) expect(eight.password).toHaveLength(8);
    if (max.ok) expect(max.password).toHaveLength(128);
  });

  it('returns Select at least one character set when all charset flags are false', () => {
    expect(
      generatePassword({
        length: 16,
        lower: false,
        upper: false,
        digits: false,
        symbols: false,
        excludeSimilar: false,
      }),
    ).toEqual({
      ok: false,
      error: 'Select at least one character set',
    });
  });

  it('emits only digits for digits-only length 8', () => {
    const result = generatePassword({
      length: 8,
      lower: false,
      upper: false,
      digits: true,
      symbols: false,
      excludeSimilar: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.password).toHaveLength(8);
    expect([...result.password].every((c) => DIGITS.includes(c))).toBe(true);
  });

  it('emits only lowercase at length 32', () => {
    const result = generatePassword({
      length: 32,
      lower: true,
      upper: false,
      digits: false,
      symbols: false,
      excludeSimilar: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.password).toHaveLength(32);
    expect([...result.password].every((c) => LOWER.includes(c))).toBe(true);
  });

  it('emits only uppercase at length 32', () => {
    const result = generatePassword({
      length: 32,
      lower: false,
      upper: true,
      digits: false,
      symbols: false,
      excludeSimilar: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.password).toHaveLength(32);
    expect([...result.password].every((c) => UPPER.includes(c))).toBe(true);
  });

  it('emits only digits at length 32', () => {
    const result = generatePassword({
      length: 32,
      lower: false,
      upper: false,
      digits: true,
      symbols: false,
      excludeSimilar: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.password).toHaveLength(32);
    expect([...result.password].every((c) => DIGITS.includes(c))).toBe(true);
  });

  it('emits only locked symbols at length 32', () => {
    const result = generatePassword({
      length: 32,
      lower: false,
      upper: false,
      digits: false,
      symbols: true,
      excludeSimilar: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.password).toHaveLength(32);
    expect([...result.password].every((c) => SYMBOLS.includes(c))).toBe(true);
  });

  it('strips similar characters when excludeSimilar is on with lower and digits', () => {
    const result = generatePassword({
      length: 32,
      lower: true,
      upper: false,
      digits: true,
      symbols: false,
      excludeSimilar: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect([...result.password].some((c) => SIMILAR.includes(c))).toBe(false);
  });

  it('strips i l 1 O 0 from a length-128 password with all sets and excludeSimilar', () => {
    const result = generatePassword({ ...DEFAULTS, length: 128, excludeSimilar: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.password).toHaveLength(128);
    expect([...result.password].some((c) => SIMILAR.includes(c))).toBe(false);
  });

  it('returns empty-charset error when excludeSimilar cannot invent a charset', () => {
    expect(
      generatePassword({
        length: 16,
        lower: false,
        upper: false,
        digits: false,
        symbols: false,
        excludeSimilar: true,
      }),
    ).toEqual(EMPTY_CHARSET);
  });
});

describe('password.ts CSPRNG source-read', () => {
  const source = readFileSync(new URL('./password.ts', import.meta.url), 'utf8');

  it('uses crypto.getRandomValues and does not use Math.random', () => {
    expect(source.includes('getRandomValues')).toBe(true);
    expect(source.includes('Math.random')).toBe(false);
  });

  it('rejects biased remainder until x is below the limit', () => {
    expect(source.includes('x < limit')).toBe(true);
    expect(source.includes('x % n')).toBe(true);
  });
});
