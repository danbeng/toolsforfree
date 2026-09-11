import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { WORDS, generateLorem } from './lorem';

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
});

describe('lorem source', () => {
  it('does not contain a network client', () => {
    const source = readFileSync(new URL('./lorem.ts', import.meta.url), 'utf8');
    expect(source.includes('fetch')).toBe(false);
  });
});
