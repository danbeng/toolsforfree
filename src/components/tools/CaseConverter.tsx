import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { convertCases, type CaseValue } from '../../lib/cases';
import { isTooLarge } from '../../lib/limits';
import { t, type Locale } from '../../i18n/ui';

const ROW_KEYS = [
  'upper',
  'lower',
  'title',
  'camel',
  'pascal',
  'snake',
  'kebab',
  'constant',
  'slug',
] as const;

function joinCases(value: CaseValue): string {
  return ROW_KEYS.map((key) => value[key]).join('\n');
}

export default function CaseConverter({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<(typeof ROW_KEYS)[number] | null>(null);
  const copy = t(locale);
  const labels = copy.tools['case-converter'];

  async function onCopyRow(key: (typeof ROW_KEYS)[number], value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1500);
  }

  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: copy.tooLarge, output: '', value: null as CaseValue | null };
    }
    const r = convertCases(input);
    if (!r.ok) {
      return { error: r.error || null, output: '', value: null as CaseValue | null };
    }
    return { error: null, output: joinCases(r.value), value: r.value };
  }, [input, copy.tooLarge]);

  return (
    <ToolShell error={result.error} output={result.output} locale={locale}>
      <label>
        {labels.text}
        <textarea
          rows={8}
          value={input}
          onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
        />
      </label>
      {result.value
        ? ROW_KEYS.map((key) => (
            <label key={key}>
              {labels[key]}
              <input type="text" value={result.value![key]} readOnly spellcheck={false} />
              <button type="button" onClick={() => onCopyRow(key, result.value![key])}>
                {copiedKey === key ? copy.copied : copy.copy}
              </button>
            </label>
          ))
        : null}
    </ToolShell>
  );
}
