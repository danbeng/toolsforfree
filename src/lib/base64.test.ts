import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeBase64 } from './base64';

describe('base64', () => {
  it('round-trips UTF-8 text', () => {
    const encoded = encodeBase64('hi ✓');
    const decoded = decodeBase64(encoded);
    expect(decoded).toEqual({ ok: true, text: 'hi ✓' });
  });

  it('rejects invalid Base64', () => {
    expect(decodeBase64('***')).toEqual({ ok: false, error: 'Invalid Base64' });
  });
});
