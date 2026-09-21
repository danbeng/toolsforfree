import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { explainCron } from '../../lib/crontab';
import { isTooLarge } from '../../lib/limits';
import type { Locale } from '../../i18n/locales';
import { useToolUi } from '../../i18n/useToolUi';

export default function CrontabExplainer({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const { copy, tooLarge, err } = useToolUi(locale);
  const labels = copy.tools['crontab-explainer'];

  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: tooLarge, output: '' };
    }
    const r = explainCron(input);
    if (!r.ok) {
      return { error: err(r.error || null), output: '' };
    }
    return { error: null, output: r.lines.join('\n') };
  }, [input, locale, tooLarge, err]);

  return (
    <ToolShell error={result.error} output={result.output} locale={locale}>
      <label>
        {labels.fieldLabel}
        <textarea
          rows={4}
          value={input}
          onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
          placeholder="*/15 0 1,15 * 1-5"
        />
      </label>
    </ToolShell>
  );
}
