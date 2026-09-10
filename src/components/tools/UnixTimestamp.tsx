import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { fromIso, fromUnix } from '../../lib/timestamp';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';

type Mode = 'unix' | 'iso';
type Unit = 's' | 'ms';

export default function UnixTimestamp() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('unix');
  const [unit, setUnit] = useState<Unit>('s');

  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: INPUT_TOO_LARGE_MSG, output: '' };
    }
    const r = mode === 'unix' ? fromUnix(input, unit) : fromIso(input);
    if (!r.ok) {
      return { error: r.error || null, output: '' };
    }
    const output = [
      `ISO ${r.iso}`,
      `Seconds ${r.seconds}`,
      `Milliseconds ${r.milliseconds}`,
    ].join('\n');
    return { error: null, output };
  }, [input, mode, unit]);

  return (
    <ToolShell error={result.error} output={result.output}>
      <fieldset>
        <legend>Mode</legend>
        <label>
          <input
            type="radio"
            name="ts-mode"
            checked={mode === 'unix'}
            onChange={() => setMode('unix')}
          />
          Unix → ISO
        </label>
        <label>
          <input
            type="radio"
            name="ts-mode"
            checked={mode === 'iso'}
            onChange={() => setMode('iso')}
          />
          ISO → Unix
        </label>
      </fieldset>
      {mode === 'unix' ? (
        <fieldset>
          <legend>Unit</legend>
          <label>
            <input
              type="radio"
              name="ts-unit"
              checked={unit === 's'}
              onChange={() => setUnit('s')}
            />
            Seconds
          </label>
          <label>
            <input
              type="radio"
              name="ts-unit"
              checked={unit === 'ms'}
              onChange={() => setUnit('ms')}
            />
            Milliseconds
          </label>
        </fieldset>
      ) : null}
      <label>
        {mode === 'unix' ? 'Unix timestamp' : 'ISO 8601'}
        <textarea
          rows={6}
          value={input}
          onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
        />
      </label>
    </ToolShell>
  );
}
