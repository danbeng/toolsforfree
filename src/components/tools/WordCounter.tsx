import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { countText } from '../../lib/counter';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';
import { t, type Locale } from '../../i18n/ui';

export default function WordCounter({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const copy = t(locale);
  const labels = copy.tools['word-counter'];
  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: INPUT_TOO_LARGE_MSG, output: '', metrics: null };
    }
    const r = countText(input, locale === 'zh' ? 'zh-Hans' : 'en');
    const output = [
      `${labels.words}: ${r.words}`,
      `${labels.chars}: ${r.charsWithSpaces}`,
      `${labels.charsNoSpaces}: ${r.charsWithoutSpaces}`,
      `${labels.lines}: ${r.lines}`,
    ].join('\n');
    return { error: null, output, metrics: r };
  }, [input, locale, labels]);

  const metrics = result.metrics;

  return (
    <ToolShell error={result.error} output={result.output}>
      <label>
        {labels.text}
        <textarea
          rows={12}
          value={input}
          onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
        />
      </label>
      {metrics ? (
        <div class="tool-grid card-grid">
          <div class="tool-card">
            <strong>{labels.words}</strong>
            <p>{metrics.words}</p>
          </div>
          <div class="tool-card">
            <strong>{labels.chars}</strong>
            <p>{metrics.charsWithSpaces}</p>
          </div>
          <div class="tool-card">
            <strong>{labels.charsNoSpaces}</strong>
            <p>{metrics.charsWithoutSpaces}</p>
          </div>
          <div class="tool-card">
            <strong>{labels.lines}</strong>
            <p>{metrics.lines}</p>
          </div>
        </div>
      ) : null}
    </ToolShell>
  );
}
