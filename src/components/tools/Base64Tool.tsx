import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { decodeBase64, encodeBase64 } from '../../lib/base64';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';

type Mode = 'encode' | 'decode';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');

  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: INPUT_TOO_LARGE_MSG, output: '' };
    }
    if (!input.trim()) {
      return { error: null, output: '' };
    }
    if (mode === 'encode') {
      return { error: null, output: encodeBase64(input) };
    }
    const r = decodeBase64(input);
    return { error: r.ok ? null : r.error || null, output: r.ok ? r.text : '' };
  }, [input, mode]);

  return (
    <ToolShell error={result.error} output={result.output}>
      <fieldset>
        <legend>Mode</legend>
        <label>
          <input
            type="radio"
            name="base64-mode"
            checked={mode === 'encode'}
            onChange={() => setMode('encode')}
          />
          Encode
        </label>
        <label>
          <input
            type="radio"
            name="base64-mode"
            checked={mode === 'decode'}
            onChange={() => setMode('decode')}
          />
          Decode
        </label>
      </fieldset>
      <label>
        {mode === 'encode' ? 'Text' : 'Base64'}
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
