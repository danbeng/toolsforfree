import { describe, expect, it } from 'vitest';
import { convertCases, slugify } from './cases';

describe('convertCases', () => {
  it('returns empty error for empty input', () => {
    expect(convertCases('')).toEqual({ ok: false, error: '' });
    expect(convertCases('   ')).toEqual({ ok: false, error: '' });
  });

  it('fans out eight cases plus slug for hello world', () => {
    const result = convertCases('hello world');
    expect(result).toEqual({
      ok: true,
      value: {
        upper: 'HELLO WORLD',
        lower: 'hello world',
        title: 'Hello World',
        camel: 'helloWorld',
        pascal: 'HelloWorld',
        snake: 'hello_world',
        kebab: 'hello-world',
        constant: 'HELLO_WORLD',
        slug: 'hello-world',
      },
    });
  });
});

describe('slugify', () => {
  it('strips Latin diacritics via NFKD', () => {
    expect(slugify('café')).toContain('cafe');
  });

  it('turns punctuation into collapsed hyphens', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('keeps Han letters in 你好世界', () => {
    const slug = slugify('你好世界');
    expect(slug).toBeTruthy();
    expect(slug).toContain('你');
    expect(slug).toContain('好');
    expect(slug).toContain('世');
    expect(slug).toContain('界');
  });
});
