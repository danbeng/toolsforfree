# Phase 4: Text Diff - Pattern Map

**Mapped:** 2026-09-13
**Files analyzed:** 11
**Analogs found:** 11 / 11

Clone **git HEAD** only (`git show HEAD:<path>`). Do not clone dirty worktree `JsonFormatter.tsx` (missing `useToolUi`) or dirty `ToolShell.tsx` (adds a `locale` prop HEAD does not have).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/diff.ts` | utility | transform | `src/lib/json.ts` + `src/lib/sql.ts` | exact (union) / role-match (heavy import) |
| `src/lib/diff.test.ts` | test | transform | `src/lib/sql.test.ts` | exact |
| `src/components/tools/TextDiff.tsx` | component | request-response | HEAD `WordCounter.tsx` + `PasswordGenerator.tsx` + `SqlFormatter.tsx` | role-match (compose) |
| `src/components/tools/ToolIsland.astro` | component | request-response | HEAD `src/components/tools/ToolIsland.astro` | exact |
| `src/data/tools.ts` | config | transform | HEAD `src/data/tools.ts` (sql-formatter row) | exact |
| `src/data/tools.test.ts` | test | transform | HEAD `src/data/tools.test.ts` | exact |
| `src/i18n/ui.ts` | config | transform | HEAD `src/i18n/ui.ts` (`sql-formatter` keys) | exact |
| `src/i18n/errors.test.ts` | test | transform | HEAD `src/i18n/errors.test.ts` (sql-formatter describe) | role-match |
| `src/content/tools/text-diff.md` | config | file-I/O | HEAD `src/content/tools/sql-formatter.md` | exact |
| `src/content/tools/zh/text-diff.md` | config | file-I/O | HEAD `src/content/tools/zh/sql-formatter.md` | exact |
| `src/styles/global.css` | config | transform | HEAD `src/styles/global.css` (`.tool-grid.split`) | partial |

Do **not** modify: `src/i18n/errors.ts` (no new lib error), `src/components/ToolShell.tsx`, `JsonFormatter.tsx`, first ten `relatedSlugs`.

## Pattern Assignments

### `src/lib/diff.ts` (utility, transform)

**Analog:** HEAD `src/lib/json.ts` (idle + discriminated union) + HEAD `src/lib/sql.ts` (package-root named import only from this file).

**Imports / union / idle** (`src/lib/json.ts` entire HEAD file):

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

**Copy for this file:** `import { diffLines } from 'diff'` **only here**. Idle: `if (!original.trim() && !changed.trim()) return { ok: false, error: '' }` **before** `diffLines`. Never throw. No non-empty English `error` (size strings live in `ui.ts`). Call `diffLines(original, changed, { ignoreWhitespace, oneChangePerToken: true })`. Do not import `createTwoFilesPatch` / `diffWords`. Do not add `src/lib/index.ts`.

---

### `src/lib/diff.test.ts` (test, transform)

**Analog:** HEAD `src/lib/sql.test.ts`

**Isolation source-read** (HEAD `src/lib/sql.test.ts` isolation test):

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

**FAQ lock** (same file, `readFileSync(new URL('../content/tools/sql-formatter.md', import.meta.url))`).

**Copy for this file:** same `readFileSync` + `new URL(..., import.meta.url)` — never `.pathname`. Assert `from 'diff'` only in `diff.ts`; island contains `diffText` and `../../lib/diff` and does **not** `from 'diff'`. Also idle empty, one-empty add/del, ignore-ws trim vs internal spaces, identical, one row per consecutive add, island source contains `isTooLarge(original)` and `isTooLarge(changed)`. FAQ: local / nothing uploaded.

---

### `src/components/tools/TextDiff.tsx` (component, request-response)

**Analogs (HEAD only):**

1. `src/components/tools/WordCounter.tsx` — locale / `t()` / `isTooLarge` / `ToolShell` without locale / `.tool-card` stats
2. `src/components/tools/PasswordGenerator.tsx` — checkbox inside `<label>`
3. `src/components/tools/SqlFormatter.tsx` — live `useMemo` (no Generate button)

**Imports + locale + size + ToolShell** (HEAD `WordCounter.tsx` lines 1–14, 30):

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

**Do not** reuse `INPUT_TOO_LARGE_MSG`. Call `isTooLarge` **twice** (original + changed) and pick `labels.tooLargeOriginal` / `tooLargeChanged` / `tooLargeBoth`. Do **not** pass `locale` into `ToolShell`. Do **not** import `useToolUi`.

**Checkbox-in-label** (HEAD `PasswordGenerator.tsx`):

```tsx
<label>
  <input
    type="checkbox"
    checked={excludeSimilar}
    onChange={(e) => setExcludeSimilar((e.target as HTMLInputElement).checked)}
  />
  {labels.excludeSimilar}
</label>
```

Default `ignoreWhitespace` **false**. Cast `(e.target as HTMLInputElement).checked`. Use `class` not `className`.

**Live useMemo** (HEAD `SqlFormatter.tsx` lines 22–32):

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

TextDiff `useMemo` deps: `[original, changed, ignoreWhitespace, labels]`. Empty lib result → idle (empty error, empty output). Identical → `output: labels.noDifferences`. Else labeled copy payload. Visual `ol.diff-lines` is **children**, not the only view in `<pre>`. Island must **not** `import { diffLines } from 'diff'`.

**HEAD ToolShell contract** (`src/components/ToolShell.tsx`):

```tsx
export function ToolShell(props: {
  error: string | null;
  output: string;
  children: ComponentChildren;
}) {
```

Copy button: `{copied ? 'Copied' : 'Copy'}`, `disabled={!props.output}`. Do not add a second copy widget.

---

### `src/components/tools/ToolIsland.astro` (component, request-response)

**Analog:** HEAD `src/components/tools/ToolIsland.astro` (sql-formatter branch).

```astro
import SqlFormatter from './SqlFormatter';
---
{slug === 'sql-formatter' && <SqlFormatter client:load locale={locale} />}
```

**Add:** `import TextDiff from './TextDiff';` and `{slug === 'text-diff' && <TextDiff client:load locale={locale} />}`. Completeness: `src/components/tools/ToolIsland.test.ts` already `source.includes(\`slug === '${slug}'\`)`. Do not `import('diff')` here. Do not use dynamic tags with `client:load`.

---

### `src/data/tools.ts` (config, transform)

**Analog:** HEAD last row `sql-formatter` (`src/data/tools.ts`).

```typescript
{
  slug: 'sql-formatter',
  name: 'SQL Formatter',
  category: 'Format',
  shortDescription: 'Pretty-print SQL in your browser.',
  relatedSlugs: ['json-formatter', 'regex-tester', 'base64'],
  featured: false,
},
```

**Append only:**

```typescript
{
  slug: 'text-diff',
  name: 'Text Diff',
  category: 'Text',
  shortDescription: 'Compare two texts line by line in your browser.',
  relatedSlugs: ['word-counter', 'case-converter', 'json-formatter'],
  featured: false,
}
```

Do **not** edit the first ten tools’ `relatedSlugs` (or any existing row). Category `'Text'` already exists on `ToolCategory`.

---

### `src/data/tools.test.ts` (test, transform)

**Analog:** HEAD `src/data/tools.test.ts` lines 12–13 and 21–23.

```typescript
it('has exactly 15 tools', () => {
  expect(TOOLS).toHaveLength(15);
});
// ...
expect(featured).toHaveLength(6);
```

Bump **15 → 16**. Featured stays **6**. Markdown completeness already `existsSync(en)` / `existsSync(zh)` via `new URL(...)` — keep that; new md files make it pass.

---

### `src/i18n/ui.ts` (config, transform)

**Analog:** HEAD `src/i18n/ui.ts` `sql-formatter` / `word-counter` blocks (append both `en` and `zh`).

```typescript
'sql-formatter': {
  name: 'SQL Formatter',
  shortDescription: 'Pretty-print SQL in your browser.',
  sql: 'SQL',
  dialect: 'Dialect',
},
```

Append `tools['text-diff']` with UI-SPEC keys verbatim on **both** locales: `name`, `shortDescription`, `original`, `changed`, `added`, `removed`, `ignoreWhitespace`, `noDifferences`, `emptyHeading`, `emptyBody`, `noDifferencesBody`, `tooLargeOriginal`, `tooLargeChanged`, `tooLargeBoth`. Do not drop Phase 2/3 keys.

---

### `src/i18n/errors.test.ts` (test, transform)

**Analog:** HEAD `src/i18n/errors.test.ts` sql-formatter chrome-key describe (not the ZH_ERRORS mapping — no new lib error).

```typescript
describe('sql-formatter chrome and errors', () => {
  it('shares sql-formatter chrome keys on en and zh', () => {
    const keys = ['name', 'shortDescription', 'sql', 'dialect'];
    for (const key of keys) {
      expect(ui.en.tools['sql-formatter']).toHaveProperty(key);
      expect(ui.zh.tools['sql-formatter']).toHaveProperty(key);
    }
  });
});
```

**Add** a `text-diff` describe that asserts the chrome keys listed above on `ui.en.tools['text-diff']` and `ui.zh.tools['text-diff']`. Do **not** add a dummy `ZH_ERRORS` key.

---

### `src/content/tools/text-diff.md` / `src/content/tools/zh/text-diff.md` (config, file-I/O)

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

Keep `locale: en` / `locale: zh`. `howTo` length **3**. `faq` **3–5**. At least one FAQ: comparison runs in the browser / nothing uploaded. Include `locale` so dirty `content.config` still builds.

---

### `src/styles/global.css` (config, transform)

**Analog:** HEAD `.tool-grid` / `.tool-grid.split` (do not retokenize `:root`).

HEAD already:

```css
.tool-grid { display: grid; gap: 1rem; }
@media (min-width: 720px) {
  .tool-grid.split { grid-template-columns: 1fr 1fr; }
}
```

**Append only** `.diff-lines` / `.diff-line` / `.diff-line--add` / `.diff-line--del` / `.diff-line--eq`. Add color literals from UI-SPEC (`#3dd68c` on `#13291f`; delete `#f07178`). List `max-height: 384px; overflow-y: auto; overflow-x: auto`. Line text `white-space: pre-wrap; overflow-wrap: anywhere`. Do not use `--accent` for added lines. Do not rewrite dirty visual CSS.

## Shared Patterns

### Discriminated union, never throw
**Source:** HEAD `src/lib/json.ts`
**Apply to:** `src/lib/diff.ts`
Empty/whitespace-only both panes → `{ ok: false, error: '' }` before calling the engine.

### Size guard in the island
**Source:** HEAD `src/lib/limits.ts` + `WordCounter.tsx`
```typescript
export const INPUT_MAX_CHARS = 100_000;
export function isTooLarge(input: string): boolean {
  return input.length > INPUT_MAX_CHARS;
}
```
**Apply to:** `TextDiff.tsx` per pane. Cap is per pane, not combined. Do not call `diffText` if either pane is over cap.

### Locale chrome via `t(locale)`
**Source:** HEAD `WordCounter.tsx` / `SqlFormatter.tsx`
`import { t, type Locale } from '../../i18n/ui'` — not `useToolUi`, not `i18n/locales`.

### HEAD ToolShell (no locale)
**Source:** HEAD `src/components/ToolShell.tsx`
`error` + `output` + `children` only. Visual diff list is children; `<pre class="tool-output">` is the labeled copy payload.

### Completeness 8-file checklist
**Source:** HEAD `tools.test.ts` + `ToolIsland.test.ts`
`existsSync(URL)` not `.pathname`; `slug === '${slug}'` source-read; `locale={locale}` on the new branch.

### CAT-04 isolation
**Source:** HEAD `src/lib/sql.test.ts`
Only `src/lib/diff.ts` contains `from 'diff'`. After build, `dist/_astro/JsonFormatter*.js` must not contain `oneChangePerToken`, `newlineIsToken`, `stripTrailingCr`, `ignoreNewlineAtEof`, `createTwoFilesPatch`. Do not grep `jsdiff` / `diffLines` (they minify away).

### XSS
Render line text as Preact children + `class={'diff-line diff-line--' + kind}`. Forbidden: `innerHTML`, `dangerouslySetInnerHTML`, `convertChangesToXML`.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | Per-line highlighted `ol.diff-lines` is new UI; CSS append has no existing `.diff-line` rules. Planner uses UI-SPEC colors + HEAD `.tool-grid.split`. |

## Metadata

**Analog search scope:** git HEAD `src/lib`, `src/components/tools`, `src/components/ToolShell.tsx`, `src/data`, `src/i18n`, `src/content/tools`, `src/styles/global.css`
**Files scanned:** 16 tracked analogs (all `git ls-files` non-empty)
**Pattern extraction date:** 2026-09-13
**Wave 0 install:** `npm install diff@9.0.0` (not yet in `package.json`)
