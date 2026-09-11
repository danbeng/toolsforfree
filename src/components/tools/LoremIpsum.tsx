import { useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { generateLorem, MAX_PARAGRAPHS, MAX_WORDS } from '../../lib/lorem';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';
import { t, type Locale } from '../../i18n/ui';
import { localizeError } from '../../i18n/errors';

type Mode = 'words' | 'paragraphs';

export default function LoremIpsum({ locale }: { locale: Locale }) {
  const copy = t(locale);
  const labels = copy.tools['lorem-ipsum'];
  const [mode, setMode] = useState<Mode>('paragraphs');
  const [count, setCount] = useState('3');
  const [classic, setClassic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState('');

  function err(message: string | null): string | null {
    return localizeError(locale, message);
  }

  function onGenerate() {
    const n = Number(count);
    const r = generateLorem({ mode, count: n, classic });
    if (!r.ok) {
      setError(err(r.error || null));
      setOutput('');
      return;
    }
    if (isTooLarge(r.text)) {
      setError(INPUT_TOO_LARGE_MSG);
      setOutput('');
      return;
    }
    setError(null);
    setOutput(r.text);
  }

  return (
    <ToolShell error={error} output={output}>
      <label>
        {labels.mode}
        <select
          value={mode}
          onChange={(e) => setMode((e.target as HTMLSelectElement).value as Mode)}
        >
          <option value="words">{labels.words}</option>
          <option value="paragraphs">{labels.paragraphs}</option>
        </select>
      </label>
      <label>
        {labels.count}
        <input
          type="number"
          min={1}
          max={mode === 'words' ? MAX_WORDS : MAX_PARAGRAPHS}
          step={1}
          value={count}
          onInput={(e) => setCount((e.target as HTMLInputElement).value)}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={classic}
          onChange={(e) => setClassic((e.target as HTMLInputElement).checked)}
        />
        {labels.classic}
      </label>
      <button type="button" onClick={onGenerate}>
        {labels.generate}
      </button>
    </ToolShell>
  );
}
