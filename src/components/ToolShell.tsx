import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

export function ToolShell(props: {
  error: string | null;
  output: string;
  children: ComponentChildren;
}) {
  const [copied, setCopied] = useState(false);

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
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
