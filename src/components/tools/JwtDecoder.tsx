import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { decodeJwt } from '../../lib/jwt';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';

export default function JwtDecoder() {
  const [input, setInput] = useState('');
  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: INPUT_TOO_LARGE_MSG, output: '' };
    }
    const r = decodeJwt(input);
    if (!r.ok) {
      return { error: r.error || null, output: '' };
    }
    const output =
      `Header\n${JSON.stringify(r.header, null, 2)}\n\nPayload\n${JSON.stringify(r.payload, null, 2)}`;
    return { error: null, output };
  }, [input]);

  return (
    <ToolShell error={result.error} output={result.output}>
      <label>
        JWT
        <textarea
          rows={12}
          value={input}
          onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
        />
      </label>
      <p>Decoding is not verification. Signatures are ignored.</p>
    </ToolShell>
  );
}
