import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { fromIso, fromUnix } from '../../lib/timestamp';
import { isTooLarge } from '../../lib/limits';
import type { Locale } from '../../i18n/locales';
import { useToolUi } from '../../i18n/useToolUi';

type Mode = 'unix' | 'iso';
type Unit = 's' | 'ms';

export default function UnixTimestamp({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('unix');
  const [unit, setUnit] = useState<Unit>('s');
  const { copy, tooLarge, err } = useToolUi(locale);
  const labels = copy.tools['unix-timestamp'];

  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: tooLarge, output: '' };
    }
    const r = mode === 'unix' ? fromUnix(input, unit) : fromIso(input);
    if (!r.ok) {
      return { error: err(r.error || null), output: '' };
    }
    const output = [
      `${labels.iso} ${r.iso}`,
      `${labels.secondsOut} ${r.seconds}`,
      `${labels.millisecondsOut} ${r.milliseconds}`,
    ].join('\n');
    return { error: null, output };
  }, [input, mode, unit, tooLarge, err, labels.iso, labels.secondsOut, labels.millisecondsOut]);

  return (
    <ToolShell error={result.error} output={result.output} locale={locale}>
      <fieldset>
        <legend>{labels.mode}</legend>
        <label>
          <input
            type="radio"
            name="ts-mode"
            checked={mode === 'unix'}
            onChange={() => setMode('unix')}
          />
          {labels.unixToIso}
        </label>
        <label>
          <input
            type="radio"
            name="ts-mode"
            checked={mode === 'iso'}
            onChange={() => setMode('iso')}
          />
          {labels.isoToUnix}
        </label>
      </fieldset>
      {mode === 'unix' ? (
        <fieldset>
          <legend>{labels.unit}</legend>
          <label>
            <input
              type="radio"
              name="ts-unit"
              checked={unit === 's'}
              onChange={() => setUnit('s')}
            />
            {labels.seconds}
          </label>
          <label>
            <input
              type="radio"
              name="ts-unit"
              checked={unit === 'ms'}
              onChange={() => setUnit('ms')}
            />
            {labels.milliseconds}
          </label>
        </fieldset>
      ) : null}
      <label>
        {mode === 'unix' ? labels.unixLabel : labels.isoLabel}
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
