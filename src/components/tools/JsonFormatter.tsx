import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { formatJson } from '../../lib/json';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: INPUT_TOO_LARGE_MSG, output: '' };
    }
    const r = formatJson(input);
    return { error: r.ok ? null : r.error || null, output: r.ok ? r.formatted : '' };
  }, [input]);

  return (
    <ToolShell error={result.error} output={result.output}>
      <label>
        JSON
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
