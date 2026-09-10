import { describe, expect, it } from 'vitest';
import { decodeJwt } from './jwt';

const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');
const payload = btoa(JSON.stringify({ sub: '123' }))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');

describe('decodeJwt', () => {
  it('decodes header and payload', () => {
    const result = decodeJwt(`${header}.${payload}.sig`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.header).toEqual({ alg: 'none', typ: 'JWT' });
      expect(result.payload).toEqual({ sub: '123' });
    }
  });

  it('rejects two-part tokens', () => {
    expect(decodeJwt('a.b')).toEqual({ ok: false, error: 'Not a JWT' });
  });

  it('returns empty error for empty input', () => {
    expect(decodeJwt('')).toEqual({ ok: false, error: '' });
  });
});
