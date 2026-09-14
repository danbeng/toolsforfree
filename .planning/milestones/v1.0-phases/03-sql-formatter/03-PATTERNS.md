# Phase 3: SQL formatter - Pattern Map

**Mapped:** 2026-09-13
**Files analyzed:** 12
**Analogs found:** 12 / 12

Clone **HEAD / Phase 2** islands (`WordCounter`, `CaseConverter`, HEAD `HashGenerator` / `ToolShell`), **not** the dirty worktree `JsonFormatter.tsx` / `HashGenerator.tsx` that import missing `useToolUi` / `i18n/locales`.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/sql.ts` | utility | transform | `src/lib/json.ts` | exact |
| `src/lib/sql.test.ts` | test | transform | `src/lib/json.test.ts` | exact |
| `src/components/tools/SqlFormatter.tsx` | component | request-response | `src/components/tools/WordCounter.tsx` + HEAD `HashGenerator.tsx` select | role-match |
| `src/components/tools/ToolIsland.astro` | component | request-response | same file (Phase 2 branches) | exact |
| `src/data/tools.ts` | config | CRUD | same file (`word-counter` row) | exact |
| `src/data/tools.test.ts` | test | CRUD | same file (length 14 + existsSync) | exact |
| `src/i18n/ui.ts` | config | request-response | same file (`word-counter` keys) | exact |
| `src/i18n/errors.ts` | utility | transform | same file (`ZH_ERRORS`) | exact |
| `src/i18n/errors.test.ts` | test | transform | same file (password-generator describe) | exact |
| `src/content/tools/sql-formatter.md` | config | file-I/O | `src/content/tools/json-formatter.md` | exact |
| `src/content/tools/zh/sql-formatter.md` | config | file-I/O | `src/content/tools/json-formatter.md` (ZH twin) | role-match |
| `package.json` / lockfile | config | transform | existing deps (`sql-formatter@15.8.2` Wave 0) | none-in-src |

## Pattern Assignments

### `src/lib/sql.ts` (utility, transform)

**Analog:** `src/lib/json.ts` (git-tracked)

**Imports / result union** (lines 1–13):
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

**Copy for SQL:** same idle `trim` + empty `{ ok: false, error: '' }` + empty `catch` mapping to `'Invalid SQL'`. Replace `JSON.parse` with named `formatDialect` + six dialect objects from `'sql-formatter'` (`sql`, `postgresql`, `mysql`, `sqlite`, `transactsql`, `bigquery`). Always pass `{ keywordCase: 'upper', tabWidth: 2 }`. Never import `format` or `{ language: }`. Only this file imports `sql-formatter`.

---

### `src/lib/sql.test.ts` (test, transform)

**Analog:** `src/lib/json.test.ts` (lines 1–26)

```typescript
import { describe, expect, it } from 'vitest';
import { formatJson } from './json';

describe('formatJson', () => {
  it('returns Invalid JSON for truncated input', () => {
    expect(formatJson('{')).toEqual({ ok: false, error: 'Invalid JSON' });
  });
  it('returns empty error for empty input', () => {
    expect(formatJson('')).toEqual({ ok: false, error: '' });
    expect(formatJson('   ')).toEqual({ ok: false, error: '' });
  });
});
```

**Copy:** Vitest `describe`/`it`; idle `''` / `'   '`; invalid English string. SQL-05 fixtures must throw (`not sql at all !!!`, unclosed quote) — not `SELECT * FROM`. Also source-read `src/lib/sql.ts` for `formatDialect` and absence of `\blanguage\s*:`.

---

### `src/components/tools/SqlFormatter.tsx` (component, request-response)

**Analog (locale + size + ToolShell):** `src/components/tools/WordCounter.tsx` lines 1–32

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
      <label>
        {labels.text}
        <textarea rows={12} value={input}
          onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
        />
      </label>
```

**Analog (native select):** HEAD `src/components/tools/HashGenerator.tsx` (git `HEAD`, not dirty disk)

```tsx
<select
  value={alg}
  onChange={(e) => setAlg((e.target as HTMLSelectElement).value as HashAlg)}
>
  <option value="SHA-256">SHA-256</option>
  <option value="SHA-1">SHA-1</option>
</select>
```

**HEAD ToolShell** (`src/components/ToolShell.tsx`): props are `{ error, output, children }` — **no `locale`**. Copy uses `navigator.clipboard.writeText(props.output)`.

**Do not copy:** worktree `JsonFormatter.tsx` `useToolUi` / `../../i18n/locales`. Default dialect `'sql'`. `useMemo` deps include `dialect`. `localizeError(locale, r.error || null)` from `src/i18n/errors.ts`. Default export. `class` not `className`.

---

### `src/components/tools/ToolIsland.astro` (component, request-response)

**Analog:** same file lines 12–33 (Phase 2 locale islands)

```astro
import WordCounter from './WordCounter';
{slug === 'word-counter' && <WordCounter client:load locale={locale} />}
```

Add `import SqlFormatter from './SqlFormatter'` and `{slug === 'sql-formatter' && <SqlFormatter client:load locale={locale} />}`. Do **not** import `sql-formatter` here. Coverage: `src/components/tools/ToolIsland.test.ts` lines 10–15 `source.includes(\`slug === '${slug}'\`)`.

---

### `src/data/tools.ts` (config, CRUD)

**Analog:** same file `word-counter` row (lines 100–107)

```typescript
{
  slug: 'word-counter',
  name: 'Word Counter',
  category: 'Text',
  shortDescription: 'Count words, characters, lines, sentences, and paragraphs locally.',
  relatedSlugs: ['case-converter', 'regex-tester', 'lorem-ipsum'],
  featured: false,
},
```

Append only:

```typescript
{
  slug: 'sql-formatter',
  name: 'SQL Formatter',
  category: 'Format',
  shortDescription: 'Pretty-print SQL in your browser.',
  relatedSlugs: ['json-formatter', 'regex-tester', 'base64'],
  featured: false,
}
```

Do not edit first ten `relatedSlugs`.

---

### `src/data/tools.test.ts` (test, CRUD)

**Analog:** lines 12–13, 21–23, 46–52

```typescript
it('has exactly 14 tools', () => {
  expect(TOOLS).toHaveLength(14);
});
expect(featured).toHaveLength(6);
expect(existsSync(en), `missing EN markdown for ${slug}`).toBe(true);
```

Bump **14 → 15**. Featured stays 6. Completeness uses `existsSync(URL)` not `.pathname`.

---

### `src/i18n/ui.ts` (config, request-response)

**Analog:** `ui.en.tools['word-counter']` / `ui.zh.tools['word-counter']` (lines 4–14, 54–64)

Append `tools['sql-formatter']` on **both** `en` and `zh` with shared keys (`name`, `shortDescription`, `sql`, `dialect`). Do not drop Phase 2 keys. `t(locale)` stays as lines 107–109.

---

### `src/i18n/errors.ts` (utility, transform)

**Analog:** lines 1–12

```typescript
export const ZH_ERRORS: Record<string, string> = {
  'Enter a count of at least 1': '请输入至少为 1 的数量',
  // ...
};

export function localizeError(locale: 'en' | 'zh', error: string | null): string | null {
  if (!error) return error;
  if (locale !== 'zh') return error;
  return ZH_ERRORS[error] ?? error;
}
```

Append `'Invalid SQL': '无效的 SQL'`. Do not drop Phase 2 keys.

---

### `src/i18n/errors.test.ts` (test, transform)

**Analog:** `password-generator` describe (lines 24–51) — map `ZH_ERRORS` + `localizeError` + shared `ui.en`/`ui.zh` chrome keys.

Add a `sql-formatter` describe; keep existing lorem/password describes.

---

### `src/content/tools/sql-formatter.md` + `zh/sql-formatter.md` (config, file-I/O)

**Analog:** `src/content/tools/json-formatter.md` lines 1–17

```yaml
---
locale: en
title: JSON Formatter / Validator
description: Format and validate JSON in your browser. Nothing is uploaded.
intro: ...
howTo:
  - ...
faq:
  - question: ...
    answer: ...
---
```

Schema: `src/content.config.ts` lines 16–29 — `howTo` tuple of 3, `faq` min 3 max 5. SQL-06: FAQ must state not an executor and dialect is not autodetection (ZH: 不是执行器 / 方言不是自动检测).

---

### `package.json` (config)

No in-repo analog for adding `sql-formatter`. Wave 0: `npm install sql-formatter@15.8.2`. Do not add `@types/sql-formatter`. Do not import `nearley` or `argparse`.

## Shared Patterns

### Size guard (island, not lib)
**Source:** `src/lib/limits.ts` lines 1–7; `WordCounter.tsx` lines 12–14
**Apply to:** `SqlFormatter.tsx`
```typescript
export const INPUT_MAX_CHARS = 100_000;
export const INPUT_TOO_LARGE_MSG =
  'Input too large to process in the browser.';
export function isTooLarge(input: string): boolean {
  return input.length > INPUT_MAX_CHARS;
}
```

### Parser contract
**Source:** `src/lib/json.ts`
**Apply to:** `src/lib/sql.ts`
Empty → `{ ok: false, error: '' }`. Invalid → English string. Never throw to UI. Never surface Nearley `e.message`.

### Locale wiring
**Source:** `WordCounter.tsx` / `CaseConverter.tsx`
**Apply to:** `SqlFormatter.tsx`
`import { t, type Locale } from '../../i18n/ui'` — not `useToolUi`.

### ToolIsland static import
**Source:** `ToolIsland.astro` Phase 2
**Apply to:** CAT-03
`client:load` + `locale={locale}` on new island only. JsonFormatter branch must stay without SQL imports (CAT-04).

### Completeness 8-file checklist
**Source:** `tools.test.ts` + `ToolIsland.test.ts`
lib + test, island, ToolIsland branch, catalog row, ui.ts, errors.ts, EN+ZH markdown.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `package.json` (`sql-formatter`) | config | transform | New npm dep; install from RESEARCH Wave 0, not a src analog |

## Metadata

**Analog search scope:** `src/lib`, `src/components/tools`, `src/data`, `src/i18n`, `src/content/tools`, `src/content.config.ts` (git-tracked only)
**Files scanned:** 16 tracked analogs
**Pattern extraction date:** 2026-09-13
**Tracked-source gate:** all analog paths passed `git ls-files`
