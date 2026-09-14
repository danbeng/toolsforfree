import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { renderMarkdown } from '../../lib/markdown';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';
import { t, type Locale } from '../../i18n/ui';
import { localizeError } from '../../i18n/errors';

export default function MarkdownPreview({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const copy = t(locale);
  const labels = copy.tools['markdown-preview'];
  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return {
        error: localizeError(locale, INPUT_TOO_LARGE_MSG),
        output: '',
        html: '',
      };
    }
    if (input === '') {
      return { error: null, output: '', html: '' };
    }
    const r = renderMarkdown(input);
    const html = r.ok ? r.html : '';
    return { error: null, output: html, html };
  }, [input, locale]);

  return (
    <ToolShell error={result.error} output={result.output}>
      <div class="tool-grid split">
        <label>
          {labels.markdown}
          <textarea
            rows={12}
            value={input}
            onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
            spellcheck={false}
          />
        </label>
        <div>
          <label id="md-preview-label">{labels.preview}</label>
          <div
            class="md-preview"
            aria-labelledby="md-preview-label"
            {...(result.html
              ? { dangerouslySetInnerHTML: { __html: result.html } }
              : {})}
          />
        </div>
      </div>
    </ToolShell>
  );
}
