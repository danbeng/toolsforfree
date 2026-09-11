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

  it('title-cases ASCII words without an acronym table', () => {
    const result = convertCases('hello WORLD');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe('Hello World');
    }
  });

  it('title-cases mixed Han and ASCII whitespace words', () => {
    const result = convertCases('hello 世界');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe('Hello 世界');
    }
  });

  it('tokenizes mixed underscore and hyphen identifiers', () => {
    const result = convertCases('hello_world-foo');
    expect(result).toEqual({
      ok: true,
      value: {
        upper: 'HELLO_WORLD-FOO',
        lower: 'hello_world-foo',
        title: 'Hello_world-foo',
        camel: 'helloWorldFoo',
        pascal: 'HelloWorldFoo',
        snake: 'hello_world_foo',
        kebab: 'hello-world-foo',
        constant: 'HELLO_WORLD_FOO',
        slug: 'hello-world-foo',
      },
    });
  });
});

describe('slugify', () => {
  it('strips Latin diacritics via NFKD', () => {
    expect(slugify('café')).toBe('cafe');
  });

  it('turns punctuation into collapsed hyphens', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('collapses repeated punctuation and trims hyphens', () => {
    expect(slugify('---Hello,,, World!!!---')).toBe('hello-world');
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
