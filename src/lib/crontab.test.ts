import { describe, expect, it } from 'vitest';
import { explainCron } from './crontab';

describe('explainCron', () => {
  it('explains a five-field expression', () => {
    const r = explainCron('*/15 0 1,15 * 1-5');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.lines).toHaveLength(5);
      expect(r.lines[0].toLowerCase()).toContain('minute');
    }
  });

  it('rejects @daily', () => {
    expect(explainCron('@daily')).toEqual({
      ok: false,
      error: 'Only five-field cron expressions are supported.',
    });
  });

  it('rejects six fields', () => {
    expect(explainCron('0 0 0 1 1 *')).toEqual({
      ok: false,
      error: 'Only five-field cron expressions are supported.',
    });
  });

  it('returns empty error for empty input', () => {
    expect(explainCron('')).toEqual({ ok: false, error: '' });
    expect(explainCron('   ')).toEqual({ ok: false, error: '' });
  });

  it('rejects invalid tokens', () => {
    expect(explainCron('foo 0 * * *')).toEqual({
      ok: false,
      error: 'Invalid cron field',
    });
  });

  it('rejects out-of-range values', () => {
    expect(explainCron('60 0 * * *')).toEqual({
      ok: false,
      error: 'Invalid cron field',
    });
  });
});
