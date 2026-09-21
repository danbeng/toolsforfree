import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { decodeJwt } from '../../lib/jwt';
import { isTooLarge } from '../../lib/limits';
import type { Locale } from '../../i18n/locales';
import { useToolUi } from '../../i18n/useToolUi';

export default function JwtDecoder({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const { copy, tooLarge, err } = useToolUi(locale);
  const labels = copy.tools['jwt-decoder'];
  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: tooLarge, output: '' };
    }
    const r = decodeJwt(input);
    if (!r.ok) {
      return { error: err(r.error || null), output: '' };
    }
    const output =
      `${labels.header}\n${JSON.stringify(r.header, null, 2)}\n\n${labels.payload}\n${JSON.stringify(r.payload, null, 2)}`;
    return { error: null, output };
  }, [input, tooLarge, err, labels.header, labels.payload]);

  return (
    <ToolShell error={result.error} output={result.output} locale={locale}>
      <label>
        {labels.jwt}
        <textarea
          rows={12}
          value={input}
          onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
        />
      </label>
      <p>{labels.note}</p>
    </ToolShell>
  );
}
