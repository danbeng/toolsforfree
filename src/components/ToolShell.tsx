import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { Locale } from '../i18n/locales';
import { t } from '../i18n/ui';

export function ToolShell(props: {
  error: string | null;
  output: string;
  locale: Locale;
  children: ComponentChildren;
}) {
  const [copied, setCopied] = useState(false);
  const copy = t(props.locale);

  async function onCopy() {
    if (!props.output) return;
    await navigator.clipboard.writeText(props.output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div class="tool-panel">
      {props.children}
      {props.error ? <p class="tool-error" role="alert">{props.error}</p> : null}
      <pre class="tool-output"><code>{props.output}</code></pre>
      <button type="button" onClick={onCopy} disabled={!props.output}>
        {copied ? copy.copied : copy.copy}
      </button>
    </div>
  );
}
