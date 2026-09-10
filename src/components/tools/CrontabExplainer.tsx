import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { explainCron } from '../../lib/crontab';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';

export default function CrontabExplainer() {
  const [input, setInput] = useState('');

  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: INPUT_TOO_LARGE_MSG, output: '' };
    }
    const r = explainCron(input);
    if (!r.ok) {
      return { error: r.error || null, output: '' };
    }
    return { error: null, output: r.lines.join('\n') };
  }, [input]);

  return (
    <ToolShell error={result.error} output={result.output}>
      <label>
        Five-field cron
        <textarea
          rows={4}
          value={input}
          onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
          placeholder="*/15 0 1,15 * 1-5"
        />
      </label>
    </ToolShell>
  );
}
