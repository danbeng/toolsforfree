import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { decodeBase64, encodeBase64 } from '../../lib/base64';
import { isTooLarge } from '../../lib/limits';
import type { Locale } from '../../i18n/locales';
import { useToolUi } from '../../i18n/useToolUi';

type Mode = 'encode' | 'decode';

export default function Base64Tool({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');
  const { copy, tooLarge, err } = useToolUi(locale);
  const labels = copy.tools.base64;

  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: tooLarge, output: '' };
    }
    if (!input.trim()) {
      return { error: null, output: '' };
    }
    if (mode === 'encode') {
      return { error: null, output: encodeBase64(input) };
    }
    const r = decodeBase64(input);
    return { error: r.ok ? null : err(r.error || null), output: r.ok ? r.text : '' };
  }, [input, mode, tooLarge, err]);

  return (
    <ToolShell error={result.error} output={result.output} locale={locale}>
      <fieldset>
        <legend>{labels.mode}</legend>
        <label>
          <input
            type="radio"
            name="base64-mode"
            checked={mode === 'encode'}
            onChange={() => setMode('encode')}
          />
          {labels.encode}
        </label>
        <label>
          <input
            type="radio"
            name="base64-mode"
            checked={mode === 'decode'}
            onChange={() => setMode('decode')}
          />
          {labels.decode}
        </label>
      </fieldset>
      <label>
        {mode === 'encode' ? labels.text : labels.base64}
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
