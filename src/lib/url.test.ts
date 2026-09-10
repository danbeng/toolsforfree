import { describe, expect, it } from 'vitest';
import { decodeUrl, encodeUrl } from './url';

describe('url', () => {
  it('encodes a space as %20', () => {
    expect(encodeUrl('a b')).toBe('a%20b');
  });

  it('decodes %20 back to a space', () => {
    expect(decodeUrl('a%20b')).toEqual({ ok: true, text: 'a b' });
  });

  it('rejects invalid percent encoding', () => {
    expect(decodeUrl('%zz')).toEqual({
      ok: false,
      error: 'Invalid URL encoding',
    });
  });
});
