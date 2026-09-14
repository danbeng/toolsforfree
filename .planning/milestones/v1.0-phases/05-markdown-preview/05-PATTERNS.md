# Phase 5: Markdown preview - Pattern Map

**Mapped:** 2026-09-13
**Files analyzed:** 13
**Analogs found:** 13 / 13

Clone **git HEAD** only (`git show HEAD:<path>`). Do not clone dirty worktree `JsonFormatter.tsx` (missing `useToolUi`) or dirty `ToolShell.tsx` (adds a `locale` prop HEAD does not have).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/markdown.ts` | utility | transform | HEAD `src/lib/json.ts` + `src/lib/sql.ts` | exact (union) / role-match (heavy import) |
| `src/lib/markdown.test.ts` | test | transform | HEAD `src/lib/sql.test.ts` | exact |
| `src/components/tools/MarkdownPreview.tsx` | component | request-response | HEAD `WordCounter.tsx` + `SqlFormatter.tsx` + `ToolShell.tsx` | role-match (compose) |
| `src/components/tools/ToolIsland.astro` | component | request-response | HEAD `src/components/tools/ToolIsland.astro` | exact |
| `src/data/tools.ts` | config | transform | HEAD `src/data/tools.ts` (text-diff / sql-formatter rows) | exact |
| `src/data/tools.test.ts` | test | transform | HEAD `src/data/tools.test.ts` | exact |
| `src/i18n/ui.ts` | config | transform | HEAD `src/i18n/ui.ts` (`sql-formatter` / `text-diff` keys) | exact |
| `src/i18n/errors.ts` | config | transform | HEAD `src/i18n/errors.ts` (`ZH_ERRORS` entries) | exact |
| `src/i18n/errors.test.ts` | test | transform | HEAD `src/i18n/errors.test.ts` (sql-formatter + text-diff describes) | role-match |
| `src/content/tools/markdown-preview.md` | config | file-I/O | HEAD `src/content/tools/sql-formatter.md` | exact |
| `src/content/tools/zh/markdown-preview.md` | config | file-I/O | HEAD `src/content/tools/zh/sql-formatter.md` | exact |
| `src/styles/global.css` | config | transform | HEAD `src/styles/global.css` (`.tool-grid.split` + additive `.diff-lines`) | role-match |

Do **not** modify: `src/components/ToolShell.tsx`, `JsonFormatter.tsx`, first ten `relatedSlugs`, `src/lib/index.ts` (do not create), dirty pages.

## Pattern Assignments

### `src/lib/markdown.ts` (utility, transform)

**Analog:** HEAD `src/lib/json.ts` (idle + discriminated union, never throw) + HEAD `src/lib/sql.ts` (package-root import **only** from this file).

**Union / never throw** (HEAD `src/lib/json.ts` entire file):

```typescript
export type JsonResult =
  | { ok: true; formatted: string }
  | { ok: false; error: string };

export function formatJson(input: string): JsonResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: '' };
  try {
    const value = JSON.parse(trimmed);
    return { ok: true, formatted: JSON.stringify(value, null, 2) };
  } catch {
    return { ok: false, error: 'Invalid JSON' };
  }
}
```

**Idle for this file is NOT json trim.** Copy: `if (!input) return { ok: false, error: '' }` — empty string only. Do **not** `.trim()` before parse (whitespace-only may still parse). Catch → `{ ok: false, error: '' }` (no non-empty English parse error). `normalizeEmpty` leftover `<p></p>` → `''`.

**Heavy-package import isolation** (HEAD `src/lib/sql.ts` lines 1–10):

```typescript
import {
  formatDialect,
  sql,
  postgresql,
  mysql,
  sqlite,
  transactsql,
  bigquery,
} from 'sql-formatter';
```

**Copy for this file:** `import { marked } from 'marked'` and `import DOMPurify from 'dompurify'` **only here**. Never import `jsdom` from this file. Never Marked `sanitize`. Never `FORBID_TAGS: ['input']`. Locked CFG: `USE_PROFILES: { html: true }`, `FORBID_TAGS` includes `img`/`picture`/`source`/`video`/`audio`/`track`/`iframe`/`object`/`embed`/`form`, `FORBID_ATTR: ['style', 'srcset', 'poster']`, `KEEP_CONTENT: false`. Call `marked.parse` then `DOMPurify.sanitize`. Do not add `src/lib/index.ts`.

---

### `src/lib/markdown.test.ts` (test, transform)

**Analog:** HEAD `src/lib/sql.test.ts`

**First line (this phase only):** `// @vitest-environment jsdom`

**Isolation source-read** (HEAD `src/lib/sql.test.ts`):

```typescript
it('imports sql-formatter only from sql.ts', () => {
  const sqlSource = readFileSync(new URL('./sql.ts', import.meta.url), 'utf8');
  const island = readFileSync(
    new URL('../components/tools/SqlFormatter.tsx', import.meta.url),
    'utf8',
  );
  const toolIsland = readFileSync(
    new URL('../components/tools/ToolIsland.astro', import.meta.url),
    'utf8',
  );
  const jsonLib = readFileSync(new URL('./json.ts', import.meta.url), 'utf8');
  const jsonIsland = readFileSync(
    new URL('../components/tools/JsonFormatter.tsx', import.meta.url),
    'utf8',
  );
  expect(sqlSource).toContain("from 'sql-formatter'");
  expect(island).toContain('formatSql');
  expect(island).toContain('../../lib/sql');
  expect(island).not.toMatch(/from ['"]sql-formatter['"]/);
  expect(toolIsland).not.toMatch(/from ['"]sql-formatter['"]/);
  expect(jsonLib).not.toMatch(/from ['"]sql-formatter['"]/);
  expect(jsonIsland).not.toMatch(/from ['"]sql-formatter['"]/);
});
```

**Copy for this file:** same `readFileSync` + `new URL(..., import.meta.url)` — never `.pathname`. Assert `from 'marked'` and `from 'dompurify'` only in `markdown.ts`; island contains `renderMarkdown` and `../../lib/markdown` and does **not** `from 'marked'` / `from 'dompurify'`; `mdSource` does **not** `from 'jsdom'`. Also idle `''` → `{ ok: false, error: '' }`, GFM fixtures, XSS strip, img strip, `normalizeEmpty` image-only → `html === ''`. FAQ source-read: local / nothing uploaded / not WYSIWYG / remote images blocked.

---

### `src/components/tools/MarkdownPreview.tsx` (component, request-response)

**Analogs (HEAD only):**

1. `src/components/tools/WordCounter.tsx` — locale / `t()` / `isTooLarge` / `ToolShell` without locale / `spellcheck={false}` / `class` not `className`
2. `src/components/tools/SqlFormatter.tsx` — live `useMemo` (no Generate button) + `localizeError`
3. HEAD `src/components/ToolShell.tsx` — **no** `locale` prop

**Imports + locale + size + ToolShell** (HEAD `WordCounter.tsx`):

```tsx
import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { countText } from '../../lib/counter';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';
import { t, type Locale } from '../../i18n/ui';

export default function WordCounter({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const copy = t(locale);
  const labels = copy.tools['word-counter'];
  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: INPUT_TOO_LARGE_MSG, output: '', metrics: null };
    }
    // ...
  }, [input, locale, labels]);

  return (
    <ToolShell error={result.error} output={result.output}>
```

This phase **does** map too-large via `localizeError(locale, INPUT_TOO_LARGE_MSG)` (unlike Phase 4). Do **not** pass `locale` into `ToolShell`. Do **not** import `useToolUi`. Island must **not** `from 'marked'` / `from 'dompurify'`.

**Live useMemo** (HEAD `SqlFormatter.tsx`):

```tsx
const result = useMemo(() => {
  if (isTooLarge(input)) {
    return { error: INPUT_TOO_LARGE_MSG, output: '' };
  }
  const r = formatSql(input, dialect);
  return {
    error: r.ok ? null : localizeError(locale, r.error || null),
    output: r.ok ? r.formatted : '',
  };
}, [input, dialect, locale]);
```

**Copy:** size-guard **before** parse; `input === ''` skip lib; `output` = sanitized HTML; visual `.md-preview` is **children**, not the only view in `<pre>`. `dangerouslySetInnerHTML` **only** of already-sanitized `html` when non-empty. Layout: `div.tool-grid.split`, source textarea first (`spellcheck={false}`).

**HEAD ToolShell contract** (`src/components/ToolShell.tsx`):

```tsx
export function ToolShell(props: {
  error: string | null;
  output: string;
  children: ComponentChildren;
}) {
```

Copy: `{copied ? 'Copied' : 'Copy'}`, `disabled={!props.output}`, `navigator.clipboard.writeText(props.output)`. Do not add a second copy widget.

---

### `src/components/tools/ToolIsland.astro` (component, request-response)

**Analog:** HEAD last branch is `text-diff`.

```astro
import TextDiff from './TextDiff';
---
{slug === 'text-diff' && <TextDiff client:load locale={locale} />}
```

**Add:** `import MarkdownPreview from './MarkdownPreview';` and `{slug === 'markdown-preview' && <MarkdownPreview client:load locale={locale} />}`. Completeness: `ToolIsland.test.ts` already `source.includes(\`slug === '${slug}'\`)`. Do not `import('marked')` / `import('dompurify')` here. Do not use dynamic tags with `client:load`.

---

### `src/data/tools.ts` (config, transform)

**Analog:** HEAD last row `text-diff` / `sql-formatter` (`src/data/tools.ts`).

```typescript
{
  slug: 'sql-formatter',
  name: 'SQL Formatter',
  category: 'Format',
  shortDescription: 'Pretty-print SQL in your browser.',
  relatedSlugs: ['json-formatter', 'regex-tester', 'base64'],
  featured: false,
},
{
  slug: 'text-diff',
  name: 'Text Diff',
  category: 'Text',
  shortDescription: 'Compare two texts line by line in your browser.',
  relatedSlugs: ['word-counter', 'case-converter', 'json-formatter'],
  featured: false,
},
```

**Append only:**

```typescript
{
  slug: 'markdown-preview',
  name: 'Markdown Preview',
  category: 'Format',
  shortDescription: 'Preview GitHub-flavored Markdown in your browser.',
  relatedSlugs: ['json-formatter', 'text-diff', 'word-counter'],
  featured: false,
}
```

Do **not** edit the first ten tools’ `relatedSlugs` (or any existing row). Category `'Format'` already exists.

---

### `src/data/tools.test.ts` (test, transform)

**Analog:** HEAD `src/data/tools.test.ts`.

```typescript
it('has exactly 16 tools', () => {
  expect(TOOLS).toHaveLength(16);
});
// ...
expect(featured).toHaveLength(6);
```

Bump **16 → 17**. Featured stays **6**. Markdown completeness already `existsSync(en)` / `existsSync(zh)` via `new URL(...)` — keep that; new md files make it pass.

---

### `src/i18n/ui.ts` (config, transform)

**Analog:** HEAD `src/i18n/ui.ts` `sql-formatter` / `text-diff` blocks (append both `en` and `zh`).

```typescript
'sql-formatter': {
  name: 'SQL Formatter',
  shortDescription: 'Pretty-print SQL in your browser.',
  sql: 'SQL',
  dialect: 'Dialect',
},
```

Append `tools['markdown-preview']` with UI-SPEC keys **only** on both locales: `name`, `shortDescription`, `markdown`, `preview`. Do **not** add `emptyHeading` / `emptyBody`. Do not drop Phase 2/3/4 keys.

Locked copy:

| Key | EN | ZH |
|-----|----|----|
| `name` | Markdown Preview | Markdown 预览 |
| `shortDescription` | Preview GitHub-flavored Markdown in your browser. | 在浏览器里预览 GitHub 风格 Markdown。 |
| `markdown` | Markdown | Markdown |
| `preview` | Preview | 预览 |

---

### `src/i18n/errors.ts` (config, transform)

**Analog:** HEAD `src/i18n/errors.ts` — **this phase DOES map** `INPUT_TOO_LARGE_MSG` (Phase 4 did not).

```typescript
export const ZH_ERRORS: Record<string, string> = {
  'Enter a count of at least 1': '请输入至少为 1 的数量',
  'Count exceeds the maximum': '数量超过上限',
  'Select at least one character set': '请至少选择一种字符集',
  'Length must be between 8 and 128': '长度必须在 8 到 128 之间',
  'Invalid SQL': '无效的 SQL',
};
```

**Append:**

```typescript
'Input too large to process in the browser.': '输入过长，无法在浏览器中处理。',
```

Do not drop existing keys. Do not invent a second too-large string.

---

### `src/i18n/errors.test.ts` (test, transform)

**Analog:** HEAD sql-formatter describe (ZH map) + text-diff describe (chrome keys). **Append** a `markdown-preview` describe; do not drop Phase 2/3/4 describes.

```typescript
describe('sql-formatter chrome and errors', () => {
  it('maps Invalid SQL in ZH_ERRORS', () => {
    expect(ZH_ERRORS['Invalid SQL']).toBe('无效的 SQL');
    expect(localizeError('zh', 'Invalid SQL')).toBe('无效的 SQL');
    expect(localizeError('en', 'Invalid SQL')).toBe('Invalid SQL');
  });

  it('shares sql-formatter chrome keys on en and zh', () => {
    const keys = ['name', 'shortDescription', 'sql', 'dialect'];
    for (const key of keys) {
      expect(ui.en.tools['sql-formatter']).toHaveProperty(key);
      expect(ui.zh.tools['sql-formatter']).toHaveProperty(key);
    }
  });
});
```

**Add:** chrome keys `name`, `shortDescription`, `markdown`, `preview` on en+zh; plus `ZH_ERRORS[INPUT_TOO_LARGE_MSG]` / `localizeError('zh', INPUT_TOO_LARGE_MSG)` → `输入过长，无法在浏览器中处理。`.

---

### `src/content/tools/markdown-preview.md` / `src/content/tools/zh/markdown-preview.md` (config, file-I/O)

**Analog:** HEAD `src/content/tools/sql-formatter.md` and `zh/sql-formatter.md`.

```yaml
---
locale: en
title: SQL Formatter
description: Pretty-print SQL in your browser. Nothing is uploaded.
intro: Paste SQL and choose a dialect. Formatting runs locally. This tool does not execute queries.
howTo:
  - Paste SQL into the input.
  - Choose a dialect (default Standard SQL). Output updates as you type or change dialect.
  - Copy the formatted SQL with the Copy button.
faq:
  - question: ...
    answer: ...
---
```

Keep `locale: en` / `locale: zh`. `howTo` length **3**. `faq` **3–5**. FAQ must state: local / nothing uploaded / not a WYSIWYG editor / remote images blocked.

---

### `src/styles/global.css` (config, transform)

**Analog:** HEAD `.tool-grid.split` (reuse, do not retokenize) + additive Phase 4 `.diff-lines` (same append style). This phase appends **only** `.md-preview` rules. Do not retokenize `:root`. Do not reuse Phase 4 `#3dd68c` / `#13291f`.

HEAD already:

```css
.tool-grid { display: grid; gap: 1rem; }
@media (min-width: 720px) {
  .tool-grid.split { grid-template-columns: 1fr 1fr; }
}
```

**Append only** `.md-preview` pane chrome from UI-SPEC: `min-height: 160px; max-height: 384px; overflow-y: auto; overflow-x: auto; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 16px; font-family: var(--sans); font-size: 16px; line-height: 1.5; color: var(--text);` plus GFM child rules (`h1`–`h6`, lists, `code`/`pre`, table, blockquote, `hr`, `del`). No highlight.js token colors. No `img` rules (tags are stripped).

## Shared Patterns

### Discriminated union, never throw
**Source:** HEAD `src/lib/json.ts`
**Apply to:** `src/lib/markdown.ts`
Empty string → `{ ok: false, error: '' }` **before** Marked. Do not trim. Catch empty `error`.

### Size guard in the island
**Source:** HEAD `src/lib/limits.ts` + `WordCounter.tsx`
```typescript
export const INPUT_MAX_CHARS = 100_000;
export const INPUT_TOO_LARGE_MSG =
  'Input too large to process in the browser.';
export function isTooLarge(input: string): boolean {
  return input.length > INPUT_MAX_CHARS;
}
```
**Apply to:** `MarkdownPreview.tsx` on Markdown **source**. Do not call `renderMarkdown` when over cap. This phase maps `INPUT_TOO_LARGE_MSG` in `ZH_ERRORS`.

### Locale chrome via `t(locale)`
**Source:** HEAD `WordCounter.tsx` / `SqlFormatter.tsx`
`import { t, type Locale } from '../../i18n/ui'` — not `useToolUi`, not `i18n/locales`.

### HEAD ToolShell (no locale)
**Source:** HEAD `src/components/ToolShell.tsx`
`error` + `output` + `children` only. Visual preview is children (`.md-preview`); `<pre class="tool-output">` is the sanitized HTML copy payload.

### Completeness 8-file checklist
**Source:** HEAD `tools.test.ts` + `ToolIsland.test.ts`
`existsSync(URL)` not `.pathname`; `slug === '${slug}'` source-read; `locale={locale}` on the new branch.

### CAT-04 isolation
**Source:** HEAD `src/lib/sql.test.ts`
Only `src/lib/markdown.ts` contains `from 'marked'` and `from 'dompurify'`. Never `'jsdom'` from lib. After build, `dist/_astro/JsonFormatter*.js` must not contain minify-surviving: `DOMPurify`, `FORBID_TAGS`, `ALLOWED_URI_REGEXP`, `uponSanitizeElement`, `listIsTask`, `listReplaceTask`, `github.com/markedjs/marked`. Do not grep `marked.parse` / `sanitize` as sufficient.

### XSS / innerHTML
`dangerouslySetInnerHTML` **only** of DOMPurify output. Forbidden: `innerHTML` / `dangerouslySetInnerHTML` of raw Marked HTML; concatenating source into HTML.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | `.md-preview` GFM child CSS is new; planner uses UI-SPEC node table + HEAD `.tool-grid.split`. Preact `dangerouslySetInnerHTML` has no in-repo analog — follow RESEARCH + UI-SPEC (sanitized string only). |

## Metadata

**Analog search scope:** git HEAD `src/lib`, `src/components/tools`, `src/components/ToolShell.tsx`, `src/data`, `src/i18n`, `src/content/tools`, `src/styles/global.css`
**Files scanned:** 19 tracked analogs (all `git ls-files` non-empty)
**Pattern extraction date:** 2026-09-13
**Wave 0 install:** `npm install marked@18.0.13 dompurify@3.4.15` and `npm install -D jsdom@30.0.1` (not yet in `package.json`)
