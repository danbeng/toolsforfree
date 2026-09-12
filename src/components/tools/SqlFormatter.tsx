import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { formatSql, type SqlDialect } from '../../lib/sql';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';
import { t, type Locale } from '../../i18n/ui';
import { localizeError } from '../../i18n/errors';

const DIALECT_OPTIONS: { value: SqlDialect; label: string }[] = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'transactsql', label: 'T-SQL' },
  { value: 'bigquery', label: 'BigQuery' },
];

export default function SqlFormatter({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const [dialect, setDialect] = useState<SqlDialect>('sql');
  const copy = t(locale);
  const labels = copy.tools['sql-formatter'];
  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: INPUT_TOO_LARGE_MSG, output: '' };
    }
    const r = formatSql(input, dialect);
    return {
      error: r.ok ? null : localizeError(locale, r.error || null),
      output: r.ok ? r.formatted : '',
    };
  }, [input, dialect, locale]);

  return (
    <ToolShell error={result.error} output={result.output}>
      <label>
        {labels.dialect}
        <select
          value={dialect}
          onChange={(e) =>
            setDialect((e.target as HTMLSelectElement).value as SqlDialect)
          }
        >
          {DIALECT_OPTIONS.map((opt) => (
            <option value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>
        {labels.sql}
        <textarea
          rows={12}
          value={input}
          onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
        />
      </label>
    </ToolShell>
  );
}
