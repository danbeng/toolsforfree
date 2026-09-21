import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { testRegex, type RegexMatch } from '../../lib/regex';
import { isTooLarge } from '../../lib/limits';
import type { Locale } from '../../i18n/locales';
import { useToolUi } from '../../i18n/useToolUi';

export default function RegexTester({ locale }: { locale: Locale }) {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');
  const { copy, tooLarge, err } = useToolUi(locale);
  const labels = copy.tools['regex-tester'];

  const result = useMemo(() => {
    if (isTooLarge(pattern) || isTooLarge(text)) {
      return { error: tooLarge, output: '' };
    }
    const r = testRegex(pattern, flags, text);
    if (!r.ok) {
      return { error: err(r.error || null), output: '' };
    }
    return {
      error: null,
      output: r.matches
        .map((m: RegexMatch) => {
          const line = `${m.index}: ${m.text}`;
          if (!m.groups.length) return line;
          return `${line}\n${labels.groups}: ${m.groups.join(', ')}`;
        })
        .join('\n'),
    };
  }, [pattern, flags, text, tooLarge, err, labels.groups]);

  return (
    <ToolShell error={result.error} output={result.output} locale={locale}>
      <label>
        {labels.pattern}
        <input
          type="text"
          value={pattern}
          onInput={(e) => setPattern((e.target as HTMLInputElement).value)}
          spellcheck={false}
        />
      </label>
      <label>
        {labels.flags}
        <input
          type="text"
          value={flags}
          onInput={(e) => setFlags((e.target as HTMLInputElement).value)}
          spellcheck={false}
        />
      </label>
      <label>
        {labels.testString}
        <textarea
          rows={12}
          value={text}
          onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
        />
      </label>
    </ToolShell>
  );
}
