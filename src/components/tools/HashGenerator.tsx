import { useEffect, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { hashText, type HashAlg } from '../../lib/hash';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [alg, setAlg] = useState<HashAlg>('SHA-256');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isTooLarge(input)) {
      setError(INPUT_TOO_LARGE_MSG);
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
  }, [input, alg]);

  return (
    <ToolShell error={error} output={output}>
      <label>
        Algorithm
        <select
          value={alg}
          onChange={(e) => setAlg((e.target as HTMLSelectElement).value as HashAlg)}
        >
          <option value="SHA-256">SHA-256</option>
          <option value="SHA-1">SHA-1</option>
        </select>
      </label>
      <label>
        Text
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
