import {
  formatDialect,
  sql,
  postgresql,
  mysql,
  sqlite,
  transactsql,
  bigquery,
} from 'sql-formatter';

const DIALECTS = { sql, postgresql, mysql, sqlite, transactsql, bigquery } as const;

export type SqlDialect = keyof typeof DIALECTS;

export type SqlResult =
  | { ok: true; formatted: string }
  | { ok: false; error: string };

export function formatSql(input: string, dialect: SqlDialect): SqlResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: '' };
  try {
    const formatted = formatDialect(trimmed, {
      dialect: DIALECTS[dialect],
      keywordCase: 'upper',
      tabWidth: 2,
    });
    return { ok: true, formatted };
  } catch {
    return { ok: false, error: 'Invalid SQL' };
  }
}
