import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MAX_PARAGRAPHS, MAX_WORDS, WORDS, generateLorem } from './lorem';

const LATIN_BODY = /^[a-zA-Z\s.,]+$/;

describe('generateLorem', () => {
  it('rejects a count of 0', () => {
    expect(generateLorem({ mode: 'words', count: 0, classic: false })).toEqual({
      ok: false,
      error: 'Enter a count of at least 1',
    });
  });

  it('rejects a negative count', () => {
    expect(generateLorem({ mode: 'words', count: -3, classic: false })).toEqual({
      ok: false,
      error: 'Enter a count of at least 1',
    });
  });

  it('rejects a non-integer count', () => {
    expect(generateLorem({ mode: 'words', count: 3.5, classic: false })).toEqual({
      ok: false,
      error: 'Enter a count of at least 1',
    });
  });

  it('rejects more than MAX_WORDS', () => {
    expect(
      generateLorem({ mode: 'words', count: MAX_WORDS + 1, classic: false }),
    ).toEqual({
      ok: false,
      error: 'Count exceeds the maximum',
    });
  });

  it('accepts MAX_WORDS', () => {
    const result = generateLorem({ mode: 'words', count: MAX_WORDS, classic: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.text.slice(0, -1).split(' ')).toHaveLength(MAX_WORDS);
  });

  it('rejects more than MAX_PARAGRAPHS', () => {
    expect(
      generateLorem({ mode: 'paragraphs', count: MAX_PARAGRAPHS + 1, classic: false }),
    ).toEqual({
      ok: false,
      error: 'Count exceeds the maximum',
    });
  });

  it('accepts MAX_PARAGRAPHS', () => {
    const result = generateLorem({
      mode: 'paragraphs',
      count: MAX_PARAGRAPHS,
      classic: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.text.split('\n\n')).toHaveLength(MAX_PARAGRAPHS);
  });

  it('emits five space-separated Latin words ending with a period', () => {
    const result = generateLorem({ mode: 'words', count: 5, classic: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.text.endsWith('.')).toBe(true);
    const body = result.text.slice(0, -1);
    const tokens = body.split(' ');
    expect(tokens).toHaveLength(5);
    expect(tokens.every((w) => w.length > 0)).toBe(true);
    expect(LATIN_BODY.test(result.text)).toBe(true);
  });

  it('prefixes the classic opening when classic is true', () => {
    const result = generateLorem({ mode: 'words', count: 5, classic: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.text.startsWith('Lorem ipsum dolor sit amet')).toBe(true);
    expect(result.text).toBe('Lorem ipsum dolor sit amet.');
  });

  it('joins two paragraphs with a blank line', () => {
    const result = generateLorem({ mode: 'paragraphs', count: 2, classic: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const parts = result.text.split('\n\n');
    expect(parts).toHaveLength(2);
    expect(parts[0].trim().length).toBeGreaterThan(0);
    expect(parts[1].trim().length).toBeGreaterThan(0);
    expect(LATIN_BODY.test(result.text)).toBe(true);
  });

  it('emits Latin letters, spaces, commas, and periods only', () => {
    const result = generateLorem({ mode: 'words', count: 12, classic: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(LATIN_BODY.test(result.text)).toBe(true);
  });

  it('exports an embedded WORDS corpus', () => {
    expect(Array.isArray(WORDS)).toBe(true);
    expect(WORDS.length).toBeGreaterThanOrEqual(80);
    expect(WORDS.length).toBeLessThanOrEqual(120);
  });

  it('emits a single paragraph without a blank line', () => {
    const one = generateLorem({ mode: 'paragraphs', count: 1, classic: false });
    expect(one.ok).toBe(true);
    if (!one.ok) return;
    expect(one.text.includes('\n\n')).toBe(false);
    expect(one.text.trim().length).toBeGreaterThan(0);
    expect(LATIN_BODY.test(one.text)).toBe(true);
  });

  it('keeps two non-empty Latin paragraphs separated by a blank line', () => {
    const two = generateLorem({ mode: 'paragraphs', count: 2, classic: false });
    expect(two.ok).toBe(true);
    if (!two.ok) return;
    expect(two.text.includes('\n\n')).toBe(true);
    const parts = two.text.split('\n\n');
    expect(parts).toHaveLength(2);
    for (const part of parts) {
      expect(part.trim().length).toBeGreaterThan(0);
      expect(LATIN_BODY.test(part)).toBe(true);
    }
  });

  it('continues from the corpus after the classic opening when count is greater than 5', () => {
    const result = generateLorem({ mode: 'words', count: 8, classic: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.text.startsWith('Lorem ipsum dolor sit amet ')).toBe(true);
    expect(result.text).not.toBe('Lorem ipsum dolor sit amet.');
    const tokens = result.text.slice(0, -1).split(' ');
    expect(tokens).toHaveLength(8);
    expect(tokens.slice(0, 5)).toEqual(['Lorem', 'ipsum', 'dolor', 'sit', 'amet']);
    expect(tokens.slice(5)).toEqual([WORDS[0], WORDS[1], WORDS[2]]);
    expect(LATIN_BODY.test(result.text)).toBe(true);
  });

  it('returns identical output for the same options', () => {
    const opts = { mode: 'paragraphs' as const, count: 2, classic: true };
    const a = generateLorem(opts);
    const b = generateLorem(opts);
    expect(a).toEqual(b);
  });
});

describe('lorem source', () => {
  it('does not contain a network client', () => {
    const source = readFileSync(new URL('./lorem.ts', import.meta.url), 'utf8');
    expect(source.includes('fetch')).toBe(false);
  });
});
