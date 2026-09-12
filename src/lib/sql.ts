export type SqlDialect =
  | 'sql'
  | 'postgresql'
  | 'mysql'
  | 'sqlite'
  | 'transactsql'
  | 'bigquery';

export type SqlResult =
  | { ok: true; formatted: string }
  | { ok: false; error: string };

export function formatSql(_input: string, _dialect: SqlDialect): SqlResult {
  return { ok: true, formatted: '' };
}
