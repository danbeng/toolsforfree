import { readFileSync } from 'node:fs';
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

  it('returns Invalid SQL for garbage input', () => {
    expect(formatSql('not sql at all !!!', 'sql')).toEqual({
      ok: false,
      error: 'Invalid SQL',
    });
  });

  it('returns Invalid SQL for an unclosed quote', () => {
    expect(formatSql("SELECT 'unterminated", 'sql')).toEqual({
      ok: false,
      error: 'Invalid SQL',
    });
  });

  it('formats incomplete SELECT * FROM because the formatter is not a linter', () => {
    expect(formatSql('SELECT * FROM', 'sql').ok).toBe(true);
  });

  it('smokes named dialects', () => {
    expect(formatSql('SELECT TOP 1 * FROM t', 'transactsql').ok).toBe(true);
    expect(formatSql('SELECT * FROM t RETURNING *', 'postgresql').ok).toBe(true);
    expect(formatSql('SELECT `foo` FROM t', 'mysql').ok).toBe(true);
    expect(formatSql('CREATE TABLE t (id INTEGER PRIMARY KEY AUTOINCREMENT)', 'sqlite').ok).toBe(
      true,
    );
    expect(formatSql('SELECT * EXCEPT (a) FROM t', 'bigquery').ok).toBe(true);
  });

  it('uses formatDialect and transactsql without a language field', () => {
    const source = readFileSync(new URL('./sql.ts', import.meta.url), 'utf8');
    expect(source).toContain('formatDialect');
    expect(source).toContain('transactsql');
    expect(source).toContain('postgresql');
    expect(source).toContain('mysql');
    expect(source).toContain('sqlite');
    expect(source).toContain('bigquery');
    expect(source).not.toMatch(/\blanguage\s*:/);
  });

  it('locks EN and ZH FAQ statements', () => {
    const en = readFileSync(new URL('../content/tools/sql-formatter.md', import.meta.url), 'utf8');
    const zh = readFileSync(
      new URL('../content/tools/zh/sql-formatter.md', import.meta.url),
      'utf8',
    );
    expect(en.toLowerCase()).toMatch(/not execute|does not execute|do not execute/);
    expect(en.toLowerCase()).toMatch(/not autodetect/);
    expect(zh).toContain('不是执行器');
    expect(zh).toContain('方言不是自动检测');
  });
});
