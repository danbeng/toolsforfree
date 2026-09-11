import { describe, expect, it } from 'vitest';
import { countText, countWords, countWordsFallback } from './counter';

const ZEROS = {
  ok: true as const,
  words: 0,
  charsWithSpaces: 0,
  charsWithoutSpaces: 0,
  lines: 0,
  sentences: 0,
  paragraphs: 0,
};

describe('countText', () => {
  it('returns empty zeros for empty and whitespace-only input', () => {
    expect(countText('')).toEqual(ZEROS);
    expect(countText('   ')).toEqual(ZEROS);
  });

  it('counts hello world as 2 words', () => {
    const result = countText('hello world');
    expect(result.ok).toBe(true);
    expect(result.words).toBe(2);
    expect(result.charsWithSpaces).toBe(11);
    expect(result.charsWithoutSpaces).toBe(10);
    expect(result.lines).toBe(1);
  });

  it('splits lines on CR LF or LF or CR', () => {
    expect(countText('a\nb').lines).toBe(2);
    expect(countText('a\r\nb').lines).toBe(2);
    expect(countText('a\rb').lines).toBe(2);
  });
});

describe('countWords and countWordsFallback', () => {
  it('counts hello world as 2 on both paths', () => {
    expect(countWords('hello world')).toBe(2);
    expect(countWordsFallback('hello world')).toBe(2);
  });

  it('counts empty as 0 on both paths', () => {
    expect(countWords('')).toBe(0);
    expect(countWordsFallback('')).toBe(0);
    expect(countWords('   ')).toBe(0);
    expect(countWordsFallback('   ')).toBe(0);
  });
});
