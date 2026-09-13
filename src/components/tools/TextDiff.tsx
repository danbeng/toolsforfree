import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { diffText, type DiffResult } from '../../lib/diff';
import { isTooLarge } from '../../lib/limits';
import { t, type Locale } from '../../i18n/ui';

type DiffOk = Extract<DiffResult, { ok: true }>;

function formatCopyPayload(
  r: DiffOk,
  labels: { added: string; removed: string },
): string {
  const header = `${labels.added}: ${r.added}\n${labels.removed}: ${r.removed}\n`;
  const body = r.lines
    .map((line) => {
      const prefix = line.kind === 'add' ? '+ ' : line.kind === 'del' ? '- ' : '  ';
      return `${prefix}${line.text}`;
    })
    .join('\n');
  return `${header}\n${body}`;
}

function prefixFor(kind: 'add' | 'del' | 'eq'): string {
  if (kind === 'add') return '+ ';
  if (kind === 'del') return '- ';
  return '  ';
}

export default function TextDiff({ locale }: { locale: Locale }) {
  const [original, setOriginal] = useState('');
  const [changed, setChanged] = useState('');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const copy = t(locale);
  const labels = copy.tools['text-diff'];
  const result = useMemo(() => {
    if (isTooLarge(original) || isTooLarge(changed)) {
      const error =
        isTooLarge(original) && isTooLarge(changed)
          ? labels.tooLargeBoth
          : isTooLarge(original)
            ? labels.tooLargeOriginal
            : labels.tooLargeChanged;
      return { error, output: '', view: 'error' as const, diff: null };
    }
    const r = diffText(original, changed, { ignoreWhitespace });
    if (!r.ok) {
      return { error: null, output: '', view: 'idle' as const, diff: null };
    }
    if (r.identical) {
      return {
        error: null,
        output: labels.noDifferences,
        view: 'identical' as const,
        diff: r,
      };
    }
    return {
      error: null,
      output: formatCopyPayload(r, labels),
      view: 'diff' as const,
      diff: r,
    };
  }, [original, changed, ignoreWhitespace, labels]);

  return (
    <ToolShell error={result.error} output={result.output}>
      {result.view !== 'idle' && result.diff ? (
        <div class="tool-grid card-grid">
          <div class="tool-card">
            <strong>{String(result.diff.added)}</strong>
            <p>{labels.added}</p>
          </div>
          <div class="tool-card">
            <strong>{String(result.diff.removed)}</strong>
            <p>{labels.removed}</p>
          </div>
        </div>
      ) : null}
      <label>
        <input
          type="checkbox"
          checked={ignoreWhitespace}
          onChange={(e) => setIgnoreWhitespace((e.target as HTMLInputElement).checked)}
        />
        {labels.ignoreWhitespace}
      </label>
      <div class="tool-grid split">
        <label>
          {labels.original}
          <textarea
            rows={12}
            value={original}
            onInput={(e) => setOriginal((e.target as HTMLTextAreaElement).value)}
            spellcheck={false}
          />
        </label>
        <label>
          {labels.changed}
          <textarea
            rows={12}
            value={changed}
            onInput={(e) => setChanged((e.target as HTMLTextAreaElement).value)}
            spellcheck={false}
          />
        </label>
      </div>
      {result.view === 'idle' ? (
        <div>
          <p>{labels.emptyHeading}</p>
          <p>{labels.emptyBody}</p>
        </div>
      ) : null}
      {result.view === 'identical' ? (
        <div>
          <p>{labels.noDifferences}</p>
          <p>{labels.noDifferencesBody}</p>
        </div>
      ) : null}
      {result.view === 'diff' && result.diff ? (
        <ol class="diff-lines">
          {result.diff.lines.map((line, i) => (
            <li class={'diff-line diff-line--' + line.kind} key={i}>
              <span aria-hidden="true">{prefixFor(line.kind)}</span>
              {line.text}
            </li>
          ))}
        </ol>
      ) : null}
    </ToolShell>
  );
}
