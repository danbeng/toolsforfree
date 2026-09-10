import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { testRegex, type RegexMatch } from '../../lib/regex';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';

function formatMatch(m: RegexMatch): string {
  const line = `${m.index}: ${m.text}`;
  if (!m.groups.length) return line;
  return `${line}\ngroups: ${m.groups.join(', ')}`;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');

  const result = useMemo(() => {
    if (isTooLarge(pattern) || isTooLarge(text)) {
      return { error: INPUT_TOO_LARGE_MSG, output: '' };
    }
    const r = testRegex(pattern, flags, text);
    if (!r.ok) {
      return { error: r.error || null, output: '' };
    }
    return {
      error: null,
      output: r.matches.map(formatMatch).join('\n'),
    };
  }, [pattern, flags, text]);

  return (
    <ToolShell error={result.error} output={result.output}>
      <label>
        Pattern
        <input
          type="text"
          value={pattern}
          onInput={(e) => setPattern((e.target as HTMLInputElement).value)}
          spellcheck={false}
        />
      </label>
      <label>
        Flags
        <input
          type="text"
          value={flags}
          onInput={(e) => setFlags((e.target as HTMLInputElement).value)}
          spellcheck={false}
        />
      </label>
      <label>
        Test string
        <textarea
          rows={12}
          value={text}
          onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
        />
      </label>
    </ToolShell>
  );
}
