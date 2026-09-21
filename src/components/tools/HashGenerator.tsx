import { useEffect, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { hashText, type HashAlg } from '../../lib/hash';
import { isTooLarge } from '../../lib/limits';
import type { Locale } from '../../i18n/locales';
import { useToolUi } from '../../i18n/useToolUi';

export default function HashGenerator({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const [alg, setAlg] = useState<HashAlg>('SHA-256');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { copy, tooLarge } = useToolUi(locale);
  const labels = copy.tools['hash-generator'];

  useEffect(() => {
    if (isTooLarge(input)) {
      setError(tooLarge);
      setOutput('');
      return;
    }
    setError(null);
    let cancelled = false;
    hashText(input, alg).then((hex) => {
      if (!cancelled) setOutput(hex);
    });
    return () => {
      cancelled = true;
    };
  }, [input, alg, tooLarge]);

  return (
    <ToolShell error={error} output={output} locale={locale}>
      <label>
        {labels.algorithm}
        <select
          value={alg}
          onChange={(e) => setAlg((e.target as HTMLSelectElement).value as HashAlg)}
        >
          <option value="SHA-256">SHA-256</option>
          <option value="SHA-1">SHA-1</option>
        </select>
      </label>
      <label>
        {labels.text}
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
