import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { formatJson } from '../../lib/json';
import { isTooLarge } from '../../lib/limits';
import type { Locale } from '../../i18n/locales';
import { useToolUi } from '../../i18n/useToolUi';

export default function JsonFormatter({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const { copy, tooLarge, err } = useToolUi(locale);
  const labels = copy.tools['json-formatter'];
  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: tooLarge, output: '' };
    }
    const r = formatJson(input);
    return { error: r.ok ? null : err(r.error || null), output: r.ok ? r.formatted : '' };
  }, [input, tooLarge, err]);

  return (
    <ToolShell error={result.error} output={result.output} locale={locale}>
      <label>
        {labels.json}
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
