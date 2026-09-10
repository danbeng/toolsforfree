import { describe, expect, it } from 'vitest';
import { testRegex } from './regex';

describe('testRegex', () => {
  it('captures groups for an email-like pattern', () => {
    const r = testRegex('([^@]+)@(.+)', '', 'a@b.com');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.matches[0].groups).toEqual(['a', 'b.com']);
    }
  });

  it('finds multiple matches with g', () => {
    const r = testRegex('a+', 'g', 'aa-aaa');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.matches.map((m) => m.text)).toEqual(['aa', 'aaa']);
  });

  it('returns Invalid regular expression for a dangling backslash', () => {
    expect(testRegex('\\', '', 'x')).toEqual({
      ok: false,
      error: 'Invalid regular expression',
    });
  });
});
