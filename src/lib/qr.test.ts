import { describe, expect, it } from 'vitest';
import { encodeQr } from './qr';

describe('encodeQr', () => {
  it('returns empty error for empty and whitespace input', () => {
    expect(encodeQr('')).toEqual({ ok: false, error: '' });
    expect(encodeQr('   ')).toEqual({ ok: false, error: '' });
  });

  it('returns a matrix for hello', () => {
    const result = encodeQr('hello');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.matrix.length).toBeGreaterThan(0);
      expect(result.matrix[0].length).toBeGreaterThan(0);
      expect(typeof result.matrix[0][0]).toBe('boolean');
    }
  });
});
