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

  it('counts 你好世界 as 4 on Segmenter and fallback', () => {
    expect(countWords('你好世界', 'zh-Hans')).toBe(4);
    expect(countWordsFallback('你好世界')).toBe(4);
  });

  it('counts hello 世界 as 3 on Segmenter and fallback', () => {
    expect(countWords('hello 世界', 'zh-Hans')).toBe(3);
    expect(countWordsFallback('hello 世界')).toBe(3);
  });
});

describe('sentences and paragraphs', () => {
  it('splits sentences on ASCII . ? ! and fullwidth 。？！', () => {
    expect(countText('Hello. World!').sentences).toBe(2);
    expect(countText('你好。世界！').sentences).toBe(2);
    expect(countText('Ready? Go!').sentences).toBe(2);
    expect(countText('结束？开始！').sentences).toBe(2);
  });

  it('counts non-empty blank-line blocks as paragraphs', () => {
    expect(countText('one\n\ntwo').paragraphs).toBe(2);
    expect(countText('one\n  \ntwo').paragraphs).toBe(2);
    expect(countText('single').paragraphs).toBe(1);
  });
});
