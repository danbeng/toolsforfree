import { describe, expect, it } from 'vitest';
import { formatSql } from './sql';

describe('formatSql', () => {
  it('returns empty error for empty input', () => {
    expect(formatSql('', 'sql')).toEqual({ ok: false, error: '' });
    expect(formatSql('   ', 'sql')).toEqual({ ok: false, error: '' });
  });

  it('pretty-prints Standard SQL with UPPER keywords and 2-space indent', () => {
    const result = formatSql('select * from tbl where id = 1', 'sql');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.formatted).toContain('SELECT');
      expect(result.formatted).toContain('FROM');
      expect(result.formatted).toContain('WHERE');
      expect(result.formatted).toContain('\n');
      expect(result.formatted).toContain('\n  *');
    }
  });
});
