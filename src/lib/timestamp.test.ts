import { describe, expect, it } from 'vitest';
import { fromIso, fromUnix } from './timestamp';

describe('timestamp', () => {
  it('converts unix seconds 0 to epoch ISO', () => {
    expect(fromUnix('0', 's')).toEqual({
      ok: true,
      iso: '1970-01-01T00:00:00.000Z',
      seconds: 0,
      milliseconds: 0,
    });
  });

  it('converts unix milliseconds 1000 to epoch-plus-one-second ISO', () => {
    expect(fromUnix('1000', 'ms')).toEqual({
      ok: true,
      iso: '1970-01-01T00:00:01.000Z',
      seconds: 1,
      milliseconds: 1000,
    });
  });

  it('converts epoch ISO to unix seconds 0', () => {
    const r = fromIso('1970-01-01T00:00:00.000Z');
    expect(r).toEqual({
      ok: true,
      iso: '1970-01-01T00:00:00.000Z',
      seconds: 0,
      milliseconds: 0,
    });
  });

  it('rejects non-numeric unix input', () => {
    expect(fromUnix('nope', 's')).toEqual({
      ok: false,
      error: 'Invalid timestamp',
    });
  });

  it('returns empty error for empty unix input', () => {
    expect(fromUnix('', 's')).toEqual({ ok: false, error: '' });
  });

  it('returns empty error for empty iso input', () => {
    expect(fromIso('')).toEqual({ ok: false, error: '' });
  });
});
