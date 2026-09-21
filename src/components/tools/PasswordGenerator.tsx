import { useEffect, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { generatePassword } from '../../lib/password';
import { t, type Locale } from '../../i18n/ui';
import { localizeError } from '../../i18n/errors';

export default function PasswordGenerator({ locale }: { locale: Locale }) {
  const copy = t(locale);
  const labels = copy.tools['password-generator'];
  const [length, setLength] = useState(16);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState('');

  function err(message: string | null): string | null {
    return localizeError(locale, message);
  }

  function onGenerate() {
    const r = generatePassword({
      length,
      lower,
      upper,
      digits,
      symbols,
      excludeSimilar,
    });
    if (!r.ok) {
      setError(err(r.error || null));
      setOutput('');
      return;
    }
    setError(null);
    setOutput(r.password);
  }

  useEffect(() => {
    onGenerate();
  }, []);

  return (
    <ToolShell error={error} output={output} locale={locale}>
      <button type="button" onClick={onGenerate}>
        {labels.generate}
      </button>
      <label>
        {labels.length}
        <input
          type="number"
          min={8}
          max={128}
          step={1}
          value={length}
          onInput={(e) => {
            const n = Number((e.target as HTMLInputElement).value);
            if (Number.isInteger(n)) setLength(n);
          }}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={lower}
          onChange={(e) => setLower((e.target as HTMLInputElement).checked)}
        />
        {labels.lowercase}
      </label>
      <label>
        <input
          type="checkbox"
          checked={upper}
          onChange={(e) => setUpper((e.target as HTMLInputElement).checked)}
        />
        {labels.uppercase}
      </label>
      <label>
        <input
          type="checkbox"
          checked={digits}
          onChange={(e) => setDigits((e.target as HTMLInputElement).checked)}
        />
        {labels.digits}
      </label>
      <label>
        <input
          type="checkbox"
          checked={symbols}
          onChange={(e) => setSymbols((e.target as HTMLInputElement).checked)}
        />
        {labels.symbols}
      </label>
      <label>
        <input
          type="checkbox"
          checked={excludeSimilar}
          onChange={(e) => setExcludeSimilar((e.target as HTMLInputElement).checked)}
        />
        {labels.excludeSimilar}
      </label>
    </ToolShell>
  );
}
