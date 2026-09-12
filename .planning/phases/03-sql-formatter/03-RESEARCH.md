# Phase 3: SQL formatter - Research

**Researched:** 2026-09-13
**Domain:** Astro 7 + Preact catalog tool — in-browser SQL pretty-print via `sql-formatter` `formatDialect`
**Confidence:** HIGH (locked CONTEXT + unpacked `sql-formatter@15.8.2` tarball + Node probe + esbuild sizes + in-repo seams)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Dialect selector
- Default dialect is Standard (sql), not autodetection and not a remembered last choice
- Dialect control is a native `<select>` with the six named dialects: Standard, PostgreSQL, MySQL, SQLite, T-SQL, BigQuery
- Changing dialect immediately reformats via `useMemo` (same live-update as JsonFormatter)
- Import six named `formatDialect` entry points — never `format()` plus a string language (SQL-02)

### Invalid SQL and errors
- Invalid SQL: catch library throw, return `{ ok: false, error: English }` — do not treat a mangled half-format as success (SQL-05)
- Empty / whitespace input: `{ ok: false, error: '' }` idle contract (json / cases)
- English lib error strings plus matching `ZH_ERRORS` in this same slice (CAT-06)
- `isTooLarge` on the paste before format (T-02-03 class)

### Format defaults and island
- Keywords UPPERCASE and indent 2 spaces; no extra knobs this phase (SQL-03)
- Clone JsonFormatter island: textarea + dialect select + ToolShell Copy — not a two-pane editor, no line numbers
- Depend on the official `sql-formatter` npm package with named `formatDialect` imports
- Catalog: slug `sql-formatter`, category Format, `featured: false`; bump TOOLS length 14 → 15

### Bundle isolation and FAQ
- Only the sql-formatter island statically imports the SQL package; json-formatter must not import it (CAT-04)
- FAQ must state the tool is not an executor and dialect is not autodetection (SQL-06)
- New relatedSlugs may point at existing Format tools; do not rewrite the existing ten tools' relatedSlugs (D-13)
- Planning must confirm `formatDialect` tree-shakes in Astro 7 / Vite so other tool pages do not carry SQL strings

### Claude's Discretion
Wording of EN/ZH chrome and FAQ beyond the two required statements. Exact English error string for invalid SQL (must still map in ZH_ERRORS). How to name the Standard dialect in the select (e.g. "Standard SQL"). Related-slug trio among existing Format tools. Whether to wrap the library in a thin `src/lib/sql.ts` (preferred, matches json.ts) vs calling it from the island.

### Deferred Ideas (OUT OF SCOPE)
- Remember last dialect in localStorage
- Keyword-case / indent knobs
- Two-pane editor or line numbers
- Query execution / connection UI
- Additional dialects beyond the six locked names
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SQL-01 | User can paste SQL and see pretty-printed output as they type | Island `useMemo` over textarea `onInput` calling `formatSql` in `src/lib/sql.ts`. Same live path as `formatJson` in `JsonFormatter`. Size-guard first. |
| SQL-02 | Dialect list Standard, PostgreSQL, MySQL, SQLite, T-SQL, BigQuery via named `formatDialect` imports — not `format()` + string language | Import `formatDialect`, `sql`, `postgresql`, `mysql`, `sqlite`, `transactsql`, `bigquery` from `sql-formatter`. T-SQL object is `transactsql` (no `tsql` export). Native `<select>` default `sql`. |
| SQL-03 | Keywords UPPERCASE and indent 2 spaces by default | Pass `{ keywordCase: 'upper', tabWidth: 2 }` on every `formatDialect` call. Library default `keywordCase` is `'preserve'` — omitting it fails SQL-03. `tabWidth` default is already `2`. No extra knobs. |
| SQL-04 | User can copy formatted SQL | Pass formatted string as `ToolShell` `output`. Existing Copy button writes `navigator.clipboard.writeText(props.output)` when output is non-empty. |
| SQL-05 | Invalid SQL shows an error instead of silently mangling the input | Catch library throws (`Error` message starts with `Parse error`). Return `{ ok: false, error: 'Invalid SQL' }`. Do **not** treat incomplete-but-parseable SQL (`SELECT * FROM`) as invalid — the library pretty-prints it. Empty/whitespace is idle, not an error. |
| SQL-06 | FAQ states the tool is not an executor and dialect is not autodetection | EN `src/content/tools/sql-formatter.md` and ZH `src/content/tools/zh/sql-formatter.md` `faq` 3–5 items; two of them must state those facts. Schema: `howTo` length 3, `faq` min 3 max 5. |
| CAT-01 | Catalog row unique slug, Format, `featured: false` | Append-only `TOOLS` row; snapshot `toHaveLength(14)` → `15`; `getFeaturedTools()` stays 6. |
| CAT-02 | EN+ZH markdown | Completeness loop `existsSync` both paths. |
| CAT-03 | ToolIsland branch | Static import + `slug === 'sql-formatter'` + `locale={locale}`. |
| CAT-04 | json-formatter must not inherit the SQL chunk | `sql-formatter` imported only from `src/lib/sql.ts`. After `astro build`, `dist/_astro/JsonFormatter*.js` must not contain `formatDialect` / `nearley`. |
| CAT-05 | Do not rewrite existing ten `relatedSlugs` | New row may point at existing slugs; do not edit the first ten rows' `relatedSlugs`. |
| CAT-06 | Live compute, copy, size guard, EN+ZH chrome, `ZH_ERRORS` | 8-file checklist. English `'Invalid SQL'` → ZH in the same slice. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Privacy: all tool computation in the browser (`src/lib`); no new API routes for tool logic.
- Parity: new tools must match existing tool quality (chrome, copy, errors, EN+ZH, FAQ).
- Stack: stay on Astro + Preact + current catalog/content-collection pattern; do not introduce a new app framework.
- Do not rewrite the existing ten tools; this milestone is additive.
- Pure logic: `src/lib/<topic>.ts` + colocated `src/lib/<topic>.test.ts`.
- Default-export Preact islands; named-export libs/data/i18n.
- Do not add `index.ts` barrels; import the concrete file.
- Vitest: `src/**/*.test.ts`, Node environment, `npm test` → `vitest run`.
- Discriminated `{ ok: true } | { ok: false, error: string }` for parsers; English lib errors; `ZH_ERRORS` for ZH.
- Size guard is `isTooLarge` / `INPUT_MAX_CHARS` only (`INPUT_MAX_BYTES` is Phase 6).
- Preact class attributes as `class` (not `className`).
- GSD: do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it (this research file is the GSD research artifact).

## Summary

Phase 3 is the first **heavy-library** catalog slice. Ship `sql-formatter` at 8-file parity: visitors paste SQL, pick an explicit dialect, and copy pretty-printed SQL. Computation stays in `src/lib/sql.ts` plus a Preact island. No API route, no executor, no localStorage dialect memory.

Install official `sql-formatter@15.8.2`. Call **`formatDialect` with six named dialect objects**. Never `format()` + `{ language: 'mysql' }` — that path `import * as allDialects` and esbuild-minified to **293 776 bytes** versus **115 780 bytes** for the six named dialects (one dialect **59 071 bytes**). Default `keywordCase` is `'preserve'`; SQL-03 requires an explicit `'upper'`. Invalid SQL that the Nearley parser rejects **throws** `Error` (`Parse error: …`); wrap as `{ ok: false, error: 'Invalid SQL' }` and never render the Nearley dump. Empty input is handled **before** the library (the library returns `""` for `""`, which would look like success).

**Primary recommendation:** One 8-file slice. Thin `src/lib/sql.ts` wrapping `formatDialect` + six dialect objects; island clones WordCounter locale wiring + HashGenerator native `<select>` + JsonFormatter live textarea/`useMemo`; catalog `sql-formatter` / Format / `featured: false`; TOOLS 14 → 15; EN+ZH markdown FAQ names “not an executor” and “not autodetection”; after `astro build`, grep the json-formatter island chunk for SQL identifiers.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Catalog row, slug, Format, `featured: false`, relatedSlugs | API / Backend (static `TOOLS`) | CDN / Static (`getStaticPaths`) | `TOOLS` is routing source of truth. Markdown is SEO only. |
| Pretty-print SQL (`formatDialect`) | Browser / Client (`src/lib/sql.ts` in island) | API / Backend (Vitest Node) | Privacy: compute in the visitor browser. Same module runs in Vitest. |
| Dialect selector (explicit, not auto) | Browser / Client (native `<select>`) | — | Locked UI. Default `sql` each page load. |
| Live reformat + copy + size guard | Browser / Client (Preact island + `ToolShell`) | — | `isTooLarge` in the island, not the parser. Copy is `ToolShell`. |
| Invalid SQL error + ZH map | Browser / Client (`localizeError`) | CDN / Static (`ZH_ERRORS`) | Lib returns English `'Invalid SQL'`; island maps ZH. |
| EN+ZH SEO / how-to / FAQ | CDN / Static (content collections) | — | `howTo` 3, `faq` 3–5; SQL-06 copy lives here, not in the island. |
| Bundle isolation (CAT-04) | CDN / Static (Vite island chunks) | Browser / Client | `sql-formatter` imported only from `src/lib/sql.ts` used by `SqlFormatter.tsx`. |
| Completeness harness | API / Backend (Vitest source-read / existsSync) | — | Phase 1 tests stay green as catalog grows to 15. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `sql-formatter` | **15.8.2** (`^15.8.2`) | Pretty-print SQL with named dialects | Locked. MIT. `sideEffects: false`. ESM `exports["."].import` = `./dist/esm/index.js`. Adjacent `dist/esm/index.d.ts` (no top-level `"types"` field). [VERIFIED: npm view 15.8.2 + unpacked `package.json`] |
| Astro | `^7.3.2` | SSG, `getStaticPaths` from `TOOLS` | Already the app. [VERIFIED: package.json:14] quote: `"astro": "^7.3.2"` |
| Preact | `^10.29.8` | Tool islands | [VERIFIED: package.json:15] quote: `"preact": "^10.29.8"` |
| `@astrojs/preact` | `^6.0.5` | `client:load` | [VERIFIED: package.json:12] quote: `"@astrojs/preact": "^6.0.5"` |
| Vitest | `^5.0.0` | Colocated `src/**/*.test.ts`, Node env | [VERIFIED: package.json:9,19] quotes: `"test": "vitest run"` / `"vitest": "^5.0.0"` |
| TypeScript | `^7.0.2` | Strict Astro tsconfig | [VERIFIED: package.json:18] quote: `"typescript": "^7.0.2"` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `nearley` | `^2.20.1` (transitive) | Parser generator used inside `sql-formatter` | Do **not** import directly. Ships in the SQL island chunk. [VERIFIED: unpacked `package.json` `dependencies`] |
| `argparse` | `^2.0.1` (transitive, CLI) | `sql-formatter` CLI only | Do **not** import. Browser esbuild of `formatDialect` did not include `argparse`. |
| `node:fs` `existsSync` | Node built-in | Completeness markdown asserts | Already used in `src/data/tools.test.ts`. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `formatDialect` + named dialect objects | `format(sql, { language: 'mysql' })` | **Forbidden (SQL-02).** `format()` imports `allDialects` and bundled **293 776 B** minified vs **115 780 B** for six dialects. |
| `sql-formatter` | Prettier + `prettier-plugin-sql` | Editor toolchain, not an island. Out of scope. |
| `sql-formatter` | `pg_format` / sqlfluff | Node/CLI, needs a backend. Forbidden by privacy constraint. |
| Named `transactsql` | String `'tsql'` | `'tsql'` exists only as a `format()` language alias. There is **no** `tsql` ESM export. |
| Thin `src/lib/sql.ts` | Call `formatDialect` from the island | Locked preference: wrap like `json.ts` so Vitest covers errors without rendering. |

**Installation:**

```bash
npm install sql-formatter@15.8.2
```

**Version verification:** `npm view sql-formatter version` → `15.8.2`. `time.modified` `2026-06-21T10:50:30.253Z`. License MIT. Homepage `https://github.com/sql-formatter-org/sql-formatter#readme`. Do **not** install `@types/sql-formatter` (stale v4 API). Adjacent `.d.ts` ships in the package.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `sql-formatter` | npm | first publish 2022-01-26; 15.8.2 on 2026-06-21 | 3 268 734/wk | github.com/sql-formatter-org/sql-formatter | OK | Approved — install `^15.8.2` |
| `nearley` | npm | last publish 2020-12-06 | 5 753 229/wk | github.com/hardmath123/nearley | OK | Transitive only — do not import |
| `argparse` | npm | latest publish 2026-09-10 (seam `too-new`) | 189 374 172/wk | github.com/nodeca/argparse | SUS | Transitive CLI dep. **Do not import.** No `checkpoint:human-verify` unless a future slice imports it. |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** `argparse` (transitive, CLI-only; not a direct install)

`sql-formatter` was confirmed via the official tarball README + `package.json` **and** `gsd_run query package-legitimacy check` verdict `OK`, so the name is tagged [VERIFIED: npm registry].

## Architecture Patterns

### System Architecture Diagram

```text
Visitor paste (textarea) + dialect <select>
        │
        ▼
SqlFormatter.tsx  (Preact island, client:load)
        │  isTooLarge(input)? ──yes──► ToolShell error=INPUT_TOO_LARGE_MSG, output=""
        │  no
        ▼
src/lib/sql.ts  formatSql(input, dialect)
        │  trim empty? ──yes──► { ok:false, error:'' }  (idle)
        │  no
        ▼
formatDialect(trimmed, {
  dialect: DIALECTS[dialect],   // sql | postgresql | mysql | sqlite | transactsql | bigquery
  keywordCase: 'upper',
  tabWidth: 2
})
        │
        ├─ returns string ──► { ok:true, formatted }
        └─ throws Error    ──► { ok:false, error:'Invalid SQL' }
                                      │
                                      ▼
                         ToolShell output / role="alert"
                         Copy → clipboard (text only, <pre><code>)

ToolIsland.astro ── static import SqlFormatter
                 ── {slug === 'sql-formatter' && <SqlFormatter client:load locale={locale} />}
                 ── json-formatter branch does NOT import sql-formatter

astro build ── dist/_astro/SqlFormatter.*.js  contains nearley + six dialects
           ── dist/_astro/JsonFormatter.*.js  MUST NOT contain formatDialect / nearley
```

### Recommended Project Structure

```
src/lib/sql.ts                         # NEW — formatSql + SqlDialect union
src/lib/sql.test.ts                    # NEW — idle, pretty-print, Invalid SQL, dialect names
src/components/tools/SqlFormatter.tsx  # NEW — textarea + native select + ToolShell
src/components/tools/ToolIsland.astro  # ADD static import + slug === 'sql-formatter'
src/data/tools.ts                      # APPEND sql-formatter row; do not edit first ten relatedSlugs
src/data/tools.test.ts                 # toHaveLength(14) → 15
src/i18n/ui.ts                         # APPEND tools['sql-formatter'] EN+ZH
src/i18n/errors.ts                     # APPEND 'Invalid SQL' → ZH
src/i18n/errors.test.ts                # APPEND mapping assert
src/content/tools/sql-formatter.md     # NEW EN, howTo 3, faq 3–5
src/content/tools/zh/sql-formatter.md  # NEW ZH
```

Do **not** add `src/lib/index.ts`. Do **not** import `sql-formatter` from `ToolIsland.astro`, `json.ts`, or `JsonFormatter.tsx`.

### Pattern 1: Thin lib wrapping `formatDialect`

**What:** `src/lib/sql.ts` mirrors `src/lib/json.ts`: trim, idle empty, try/catch, discriminated union.
**When to use:** Always this phase (locked preference).
**Example:**

```typescript
// Source: clone src/lib/json.ts:1-13 plus sql-formatter@15.8.2 dist/esm/sqlFormatter.d.ts
// json.ts verbatim [VERIFIED: src/lib/json.ts:1-13]:
//   export type JsonResult =
//     | { ok: true; formatted: string }
//     | { ok: false; error: string };
//   export function formatJson(input: string): JsonResult {
//     const trimmed = input.trim();
//     if (!trimmed) return { ok: false, error: '' };
//     try {
//       const value = JSON.parse(trimmed);
//       return { ok: true, formatted: JSON.stringify(value, null, 2) };
//     } catch {
//       return { ok: false, error: 'Invalid JSON' };
//     }
//   }
// sql-formatter exports verbatim [VERIFIED: sql-formatter@15.8.2 dist/esm/index.d.ts]:
//   export { formatDialect } from './sqlFormatter.js';
//   export { bigquery } from './languages/bigquery/bigquery.formatter.js';
//   export { mysql } from './languages/mysql/mysql.formatter.js';
//   export { postgresql } from './languages/postgresql/postgresql.formatter.js';
//   export { sqlite } from './languages/sqlite/sqlite.formatter.js';
//   export { sql } from './languages/sql/sql.formatter.js';
//   export { transactsql } from './languages/transactsql/transactsql.formatter.js';
// formatDialect signature [VERIFIED: sql-formatter@15.8.2 dist/esm/sqlFormatter.d.ts]:
//   export declare const formatDialect: (query: string, { dialect, ...cfg }: FormatOptionsWithDialect) => string;
// KeywordCase [VERIFIED: sql-formatter@15.8.2 dist/esm/FormatOptions.d.ts]:
//   export type KeywordCase = 'preserve' | 'upper' | 'lower';
// defaultOptions [VERIFIED: sql-formatter@15.8.2 dist/esm/sqlFormatter.js]:
//   tabWidth: 2,
//   useTabs: false,
//   keywordCase: 'preserve',

import {
  formatDialect,
  sql,
  postgresql,
  mysql,
  sqlite,
  transactsql,
  bigquery,
} from 'sql-formatter';

const DIALECTS = { sql, postgresql, mysql, sqlite, transactsql, bigquery } as const;

export type SqlDialect = keyof typeof DIALECTS;

export type SqlResult =
  | { ok: true; formatted: string }
  | { ok: false; error: string };

export function formatSql(input: string, dialect: SqlDialect): SqlResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: '' };
  try {
    const formatted = formatDialect(trimmed, {
      dialect: DIALECTS[dialect],
      keywordCase: 'upper',
      tabWidth: 2,
    });
    return { ok: true, formatted };
  } catch {
    return { ok: false, error: 'Invalid SQL' };
  }
}
```

Exact import path: **`from 'sql-formatter'`** (package root). The package `exports` map has only `"."` and `"./package.json"` — there is no `sql-formatter/postgresql` subpath. [VERIFIED: unpacked `package.json` `exports`]

T-SQL: import **`transactsql`**, not `tsql`. The `format()` language map aliases `tsql: 'transactsql'`; that alias is irrelevant because we never call `format()`. Dialect object `.name` values from probe: `sql`, `postgresql`, `mysql`, `sqlite`, `transactsql`, `bigquery`.

### Pattern 2: Island = live textarea + native select + ToolShell

**What:** `SqlFormatter.tsx` default export `{ locale }: { locale: Locale }`. `useState` for input and dialect (default `'sql'`). `useMemo` depends on `[input, dialect, …]`. Native `<select>`, no extra UI library.
**When to use:** This tool. Clone **committed** Phase 2 `WordCounter.tsx` locale/`t()`/`INPUT_TOO_LARGE_MSG` wiring plus HEAD `HashGenerator` `<select>` plus JsonFormatter live `useMemo` — not the dirty worktree `JsonFormatter.tsx` that imports missing `useToolUi`.
**Example:**

```tsx
// Source: WordCounter.tsx locale + limits [VERIFIED: src/components/tools/WordCounter.tsx:1-14, 29]
//   import { t, type Locale } from '../../i18n/ui';
//   export default function WordCounter({ locale }: { locale: Locale }) {
//   const copy = t(locale);
//   const labels = copy.tools['word-counter'];
//   if (isTooLarge(input)) { return { error: INPUT_TOO_LARGE_MSG, output: '', ...
// HashGenerator HEAD select [VERIFIED: git show HEAD HashGenerator.tsx]:
//   <select value={alg} onChange={(e) => setAlg((e.target as HTMLSelectElement).value as HashAlg)}>
//     <option value="SHA-256">SHA-256</option>
//   </select>
// ToolShell copy [VERIFIED: git show HEAD src/components/ToolShell.tsx]:
//   export function ToolShell(props: { error: string | null; output: string; children: ComponentChildren; })
//   await navigator.clipboard.writeText(props.output);

import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { formatSql, type SqlDialect } from '../../lib/sql';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';
import { t, type Locale } from '../../i18n/ui';
import { localizeError } from '../../i18n/errors';

const DIALECT_OPTIONS: { value: SqlDialect; label: string }[] = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'transactsql', label: 'T-SQL' },
  { value: 'bigquery', label: 'BigQuery' },
];

export default function SqlFormatter({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const [dialect, setDialect] = useState<SqlDialect>('sql');
  const copy = t(locale);
  const labels = copy.tools['sql-formatter'];
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

  return (
    <ToolShell error={result.error} output={result.output}>
      <label>
        {labels.dialect}
        <select
          value={dialect}
          onChange={(e) =>
            setDialect((e.target as HTMLSelectElement).value as SqlDialect)
          }
        >
          {DIALECT_OPTIONS.map((opt) => (
            <option value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>
        {labels.sql}
        <textarea
          rows={12}
          value={input}
          onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
        />
      </label>
    </ToolShell>
  );
}
```

Discretion locked here: Standard option label **Standard SQL**; English error **Invalid SQL**.

### Pattern 3: ToolIsland static import (not dynamic tag)

**What:** Add a static import and a `slug === 'sql-formatter'` branch with `client:load` and `locale={locale}`.
**When to use:** CAT-03. Astro forbids `client:*` on dynamic tags — do not convert the chain to `const Comp = islands[slug]`.
**Example:**

```astro
---
// Source: ToolIsland.astro current tail [VERIFIED: src/components/tools/ToolIsland.astro:1-34]
import SqlFormatter from './SqlFormatter';
---
{slug === 'sql-formatter' && <SqlFormatter client:load locale={locale} />}
```

Coverage test already source-reads `includes(\`slug === '${slug}'\`)`. [VERIFIED: src/components/tools/ToolIsland.test.ts:10-16]

Do **not** `import('sql-formatter')` from `ToolIsland.astro`. Phase 1 CONVENTIONS mentioned a possible dynamic import *inside* the heavy island; named `formatDialect` imports in `src/lib/sql.ts` are the locked API and still tree-shake (see Bundle isolation). A dynamic `import('sql-formatter')` would likely pull `format` + `allDialects` and undo SQL-02.

### Pattern 4: Catalog append-only

**What:** One new `TOOLS` row. Snapshot 14 → 15. Featured stays 6. `featured: false`.
**When to use:** CAT-01.
**Example values (verbatim constraints):**

```typescript
// [VERIFIED: src/data/tools.ts:1-8] ToolCategory includes 'Format'
// [VERIFIED: src/data/tools.test.ts:12-13] expect(TOOLS).toHaveLength(14);
// [VERIFIED: src/data/tools.test.ts:20-23] expect(featured).toHaveLength(6);
{
  slug: 'sql-formatter',
  name: 'SQL Formatter',
  category: 'Format',
  shortDescription: 'Pretty-print SQL in your browser.',
  relatedSlugs: ['json-formatter', 'regex-tester', 'base64'],
  featured: false,
}
```

Discretion: related trio **`json-formatter`, `regex-tester`, `base64`**. Existing Format category currently contains only `json-formatter` [VERIFIED: src/data/tools.ts:20-26]. Do **not** add `sql-formatter` to `json-formatter.relatedSlugs` (D-13).

### Anti-Patterns to Avoid

- **`format()` + `{ language: 'mysql' }`:** Pulls every dialect. Forbidden by SQL-02. Source-read `src/lib/sql.ts` and assert it does not contain `format(` as a call (only `formatDialect`) and does not contain `language:`.
- **Omitting `keywordCase: 'upper'`:** Library default is `'preserve'`. `select * from t` stays lowercase. Fails SQL-03.
- **Treating library `""` for empty input as success:** `formatDialect('', { dialect: sql })` returns `""` (probe OK). Idle contract must `trim()` first like `formatJson`.
- **Using Nearley `e.message` as the UI error:** Dumps can be thousands of characters of grammar expectations. Map every throw to `'Invalid SQL'`.
- **Expecting `SELECT * FROM` to error:** Probe returns pretty-printed SQL. SQL-05 tests must use throwing fixtures (`not sql at all !!!`, unclosed quote).
- **Importing `tsql`:** Not an ESM export. Use `transactsql`.
- **Rewriting JsonFormatter / ToolShell / the first ten `relatedSlugs`.**
- **Depending on `src/i18n/useToolUi.ts` or `src/i18n/locales.ts`:** Neither exists on HEAD. Worktree `JsonFormatter.tsx` currently imports them — that is uncommitted dirt, not the clone target.
- **`src/lib/index.ts` barrel.**
- **Executing SQL / in-browser SQLite.** Out of scope.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SQL pretty-print + dialects | Custom tokenizer / indent rewriter | `sql-formatter` `formatDialect` | Dialects, comments, placeholders, Nearley grammar. Hand-rolling fails on vendor SQL. |
| Clipboard copy chrome | New copy bar | Existing `ToolShell` | Already handles empty-disabled Copy + Copied timeout. |
| Input size cap | New byte/char helper | `isTooLarge` / `INPUT_MAX_CHARS` | Shared 100_000 char cap. [VERIFIED: src/lib/limits.ts:1-7] |
| EN→ZH error map | Ad-hoc island strings | `ZH_ERRORS` + `localizeError` | CAT-06 same-slice rule. |
| Dialect autodetection | Heuristic on keywords | Explicit `<select>` | Locked; FAQ must say so. |

**Key insight:** The expensive part is the dialect grammars, not the UI. Pay for six named objects, not `format()`'s full registry, and keep the island as thin as JsonFormatter.

## Common Pitfalls

### Pitfall 1: `format()` bundles every dialect

**What goes wrong:** `format('select 1', { language: 'sql' })` minified to 293 776 bytes and contained clickhouse/snowflake/plsql/… identifiers. `formatDialect` + `sql` only: 59 071 bytes. Six dialects: 115 780 bytes.
**Why it happens:** `format()` does `import * as allDialects from './allDialects.js'` then `allDialects[canonicalDialectName]`. [VERIFIED: sql-formatter@15.8.2 dist/esm/sqlFormatter.js]
**How to avoid:** Named imports only. Vitest source-read `src/lib/sql.ts` contains `formatDialect` and does not contain `\blanguage\s*:`. After `astro build`, grep json-formatter chunk.
**Warning signs:** json-formatter network panel loads a 100k+ extra chunk; `dist/_astro/JsonFormatter*.js` contains `nearley`.

### Pitfall 2: Default `keywordCase` is `'preserve'`

**What goes wrong:** SQL-03 requires UPPERCASE keywords. Probe: `formatDialect('select * from t', { dialect: sql, tabWidth: 2 })` → `"select\n  *\nfrom\n  t"`. With `keywordCase: 'upper'` → `"SELECT\n  *\nFROM\n  t"`.
**Why it happens:** `defaultOptions.keywordCase = 'preserve'`.
**How to avoid:** Always pass `keywordCase: 'upper'`. Unit-test `select * from t` contains `SELECT` and a 2-space indent (`\n  *`).
**Warning signs:** Output keywords still lowercase.

### Pitfall 3: SQL-05 is throw-catch, not a semantic validator

**What goes wrong:** Planner writes a test that `SELECT * FROM` or `SELECT * FORM t` returns `{ ok: false }`. Both **succeed** and pretty-print (probe). Only lexer/parser failures throw (`not sql at all !!!`, unclosed `'`, `{{{{`).
**Why it happens:** sql-formatter is a formatter, not a SQL linter. README FAQ: wrong dialect (T-SQL `[col]` under `sql`) throws `Parse error`.
**How to avoid:** Invalid fixtures = garbage / unclosed string. Document in tests that incomplete statements may still format. Catch all throws as `'Invalid SQL'` — do not special-case message text (dumps differ by dialect and include “default sql dialect” hints).
**Warning signs:** Tests fail on `SELECT * FROM`; UI shows a multi-kilobyte Nearley trace.

### Pitfall 4: Empty input vs library `""`

**What goes wrong:** Calling `formatDialect` on `""` / `"   "` returns `""` with no throw. If the island treats `ok: true, formatted: ''` like success, ToolShell shows empty output instead of idle (and Copy stays disabled anyway, but the contract diverges from json).
**Why it happens:** Formatter of empty is empty.
**How to avoid:** `trim()` then `{ ok: false, error: '' }` before the library, identical to `formatJson`. [VERIFIED: src/lib/json.ts:7-8] quote: `if (!trimmed) return { ok: false, error: '' };`
**Warning signs:** `formatSql('   ')` returns `{ ok: true, formatted: '' }`.

### Pitfall 5: CAT-04 leak via ToolIsland or a lib barrel

**What goes wrong:** Importing `sql-formatter` from `ToolIsland.astro` or `src/lib/index.ts` puts SQL strings on every tool page.
**Why it happens:** `ToolIsland.astro` statically imports every island, but Vite still emits **per-island** client graphs when each island is a separate `client:load` component. The leak happens if a *shared* module (json.ts, a barrel, ToolShell) imports SQL.
**How to avoid:** Only `src/lib/sql.ts` imports `sql-formatter`. Only `SqlFormatter.tsx` imports `../../lib/sql`. No barrel. Verification: `astro build` then assert `JsonFormatter` chunk has no `nearley` / `formatDialect`. Stale `dist/_astro/` currently has JsonFormatter/HashGenerator chunks but **not** Phase 2 islands — always rebuild.
**Warning signs:** `src/lib/index.ts` appears; `json.ts` gains an sql-formatter import.

### Pitfall 6: Cloning the dirty worktree JsonFormatter

**What goes wrong:** Disk `JsonFormatter.tsx` imports `useToolUi` from `../../i18n/useToolUi` and `Locale` from `../../i18n/locales`. Those files **do not exist** on HEAD (`git ls-files src/i18n/` is `errors.ts`, `errors.test.ts`, `ui.ts` only). Phase 2 islands use `import { t, type Locale } from '../../i18n/ui'` and `INPUT_TOO_LARGE_MSG`.
**Why it happens:** Uncommitted i18n refactor of existing ten tools in the worktree.
**How to avoid:** Clone `WordCounter.tsx` + HEAD `ToolShell` (no `locale` prop) + HEAD HashGenerator `<select>`. Do not introduce `useToolUi` in this phase. Do not rewrite JsonFormatter to make the SQL island compile.
**Warning signs:** New island imports `useToolUi` or `i18n/locales`.

### Pitfall 7: Completeness snapshot not bumped

**What goes wrong:** `expect(TOOLS).toHaveLength(14)` fails after append. Missing EN/ZH markdown fails `existsSync`. Missing `slug === 'sql-formatter'` fails ToolIsland coverage.
**How to avoid:** Same 8-file checklist as Phase 2. Bump 14 → 15 in the same slice as the catalog row.
**Warning signs:** `npm test` red on `has exactly 14 tools`.

## Code Examples

### Valid pretty-print (probe, `keywordCase: 'upper'`, `tabWidth: 2`)

```text
input:  select * from tbl where id = 1
output: SELECT\n  *\nFROM\n  tbl\nWHERE\n  id = 1
```

[VERIFIED: Node probe of sql-formatter@15.8.2 `formatDialect`]

### Idle and invalid (required tests)

```typescript
// Source: json.test.ts idle/invalid [VERIFIED: src/lib/json.test.ts:14-20]
//   expect(formatJson('{')).toEqual({ ok: false, error: 'Invalid JSON' });
//   expect(formatJson('')).toEqual({ ok: false, error: '' });
//   expect(formatJson('   ')).toEqual({ ok: false, error: '' });

expect(formatSql('', 'sql')).toEqual({ ok: false, error: '' });
expect(formatSql('   ', 'sql')).toEqual({ ok: false, error: '' });
expect(formatSql('not sql at all !!!', 'sql')).toEqual({
  ok: false,
  error: 'Invalid SQL',
});
expect(formatSql("SELECT 'unterminated", 'sql')).toEqual({
  ok: false,
  error: 'Invalid SQL',
});
```

Throwing probe messages (do **not** surface these): `Parse error: Unexpected "!!!" at line 1 column 16.` [VERIFIED: Node probe]

Non-throwing “looks invalid” inputs (must **not** be SQL-05 fixtures): `SELECT * FROM`, `SELECT * FORM t`, `SELEC * FROM t`. [VERIFIED: Node probe]

### Dialect-specific smoke (one each)

```typescript
expect(formatSql('SELECT TOP 1 * FROM t', 'transactsql').ok).toBe(true);
expect(formatSql('SELECT * FROM t RETURNING *', 'postgresql').ok).toBe(true);
expect(formatSql('SELECT `foo` FROM t', 'mysql').ok).toBe(true);
expect(formatSql('CREATE TABLE t (id INTEGER PRIMARY KEY AUTOINCREMENT)', 'sqlite').ok).toBe(true);
expect(formatSql('SELECT * EXCEPT (a) FROM t', 'bigquery').ok).toBe(true);
```

[VERIFIED: Node probe — all `OK`]

### Size guard (island, not lib)

```typescript
// [VERIFIED: src/lib/limits.ts:1-7]
//   export const INPUT_MAX_CHARS = 100_000;
//   export const INPUT_TOO_LARGE_MSG =
//     'Input too large to process in the browser.';
//   export function isTooLarge(input: string): boolean {
//     return input.length > INPUT_MAX_CHARS;
//   }
```

### ZH_ERRORS append

```typescript
// Current keys [VERIFIED: src/i18n/errors.ts:1-6]:
//   'Enter a count of at least 1'
//   'Count exceeds the maximum'
//   'Select at least one character set'
//   'Length must be between 8 and 128'
// Append — do not drop Phase 2 keys:
'Invalid SQL': '无效的 SQL',
```

### Markdown schema

```yaml
# [VERIFIED: src/content.config.ts:16-29]
# locale: z.enum(['en', 'zh'])
# howTo: z.tuple([z.string(), z.string(), z.string()])
# faq: .min(3).max(5)
locale: en
title: SQL Formatter
description: Pretty-print SQL in your browser. Nothing is uploaded.
intro: Paste SQL and choose a dialect. Formatting runs locally. This tool does not execute queries.
howTo:
  - Paste SQL into the input.
  - Choose a dialect (default Standard SQL). Output updates as you type or change dialect.
  - Copy the formatted SQL with the Copy button.
faq:
  - question: Does this SQL formatter execute my query?
    answer: No. It only pretty-prints SQL in your browser. There is no database connection and nothing is uploaded.
  - question: Does the tool autodetect my SQL dialect?
    answer: No. The default is Standard SQL. Pick PostgreSQL, MySQL, SQLite, T-SQL, or BigQuery explicitly. Changing dialect reformats immediately.
  - question: What happens if my SQL is invalid?
    answer: The tool shows an error instead of a half-formatted result. Incomplete statements may still pretty-print because this is a formatter, not a linter.
```

ZH FAQ must carry the same two locked statements (不是执行器 / 方言不是自动检测). `faq` length 3–5.

### CAT-04 verification (post-build)

```bash
npm test
npm run build
# JsonFormatter island chunk must not contain SQL parser identifiers
# SqlFormatter island chunk may contain nearley
```

Planner: add a verification step that fails if `dist/_astro/JsonFormatter*.js` matches `nearley` or `formatDialect`. Do not trust the current `dist/_astro/` listing — it predates Phase 2 islands.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `format(sql, { language })` | `formatDialect(sql, { dialect })` | v12 (`formatDialect` since version 12; README) | Named dialect objects tree-shake; string language does not |
| `@types/sql-formatter@4` | Types shipped next to `dist/esm/index.js` | v5+ package rewrite | Do not install DefinitelyTyped |
| Default keyword case preserve | Product wants UPPER | library default unchanged in 15.8.2 | Always pass `keywordCase: 'upper'` |

**Deprecated/outdated:**

- `indentStyle` tabular options: README marks `indentStyle` **deprecated**. Do not expose. Leave library default `'standard'`.
- `format()` + string `language` for this island: forbidden, not deprecated in the library, but the bundle-size footgun.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | After a fresh `astro build`, Vite 8 will keep `sql-formatter` out of `JsonFormatter*.js` the same way esbuild tree-shook named imports | Bundle isolation | CAT-04 fails; planner adds a dynamic-import fallback inside `sql.ts` **without** switching to `format()`. Confirm with build, do not skip. |
| A2 | ZH string `无效的 SQL` is the right localization for `'Invalid SQL'` | Discretion | Copy tweak only; mapping key must stay `'Invalid SQL'`. |
| A3 | Related slugs `json-formatter`, `regex-tester`, `base64` | Discretion | Harmless catalog UX; do not rewrite the ten. |

No other `[ASSUMED]` implementation claims. Tree-shake **sizes** are [VERIFIED: esbuild 0.27.3 via project `node_modules/esbuild` against sql-formatter@15.8.2]. Astro-chunk isolation still needs the build gate (A1) because this session did not run `astro build` after adding the package.

## Open Questions

Resolved for planning — do not re-ask:

1. **English error string** — `'Invalid SQL'` / ZH `'无效的 SQL'` (mirrors `'Invalid JSON'`).
2. **Standard dialect label** — `Standard SQL` (value `sql`).
3. **Related slugs** — `['json-formatter', 'regex-tester', 'base64']`. Do not edit existing ten.
4. **Lib wrap** — yes, `src/lib/sql.ts`.
5. **T-SQL import name** — `transactsql`.
6. **Incomplete SQL** — not an error. SQL-05 = catch throw only.
7. **Clone target** — WordCounter locale wiring + HashGenerator native select + JsonFormatter live memo. Not dirty `useToolUi`.
8. **Tree-shake** — named `formatDialect` imports do drop unused dialect *implementations* (esbuild 59 kB vs 293 kB). `dialectNameMap` **strings** still appear in the `formatDialect` module even for one dialect. CAT-04 still requires a post-build grep of the json-formatter chunk (A1).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install, Vitest, `astro build` | ✓ | v22.22.2 | — |
| npm | install `sql-formatter` | ✓ | 11.9.0 | — |
| `sql-formatter` in app `package.json` | SQL-01..05 | ✗ (not installed yet) | — | Install `sql-formatter@15.8.2` in Wave 0 |
| Vite (via Astro) | island split | ✓ | 8.2.2 (`node_modules/vite`) | — |
| esbuild (via Vite) | tree-shake probe this session | ✓ | bundled with Vite | — |
| PostgreSQL / Redis / Docker | — | n/a | — | Not used |

**Missing dependencies with no fallback:**

- App dependency `sql-formatter@15.8.2` — Wave 0 `npm install`.

**Missing dependencies with fallback:** none

Step 2.6 not skipped: this phase installs an external package.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^5.0.0` |
| Config file | `vitest.config.ts` (`include: ['src/**/*.test.ts']`, `environment: 'node'`) |
| Quick run command | `npx vitest run src/lib/sql.test.ts src/data/tools.test.ts src/components/tools/ToolIsland.test.ts src/i18n/errors.test.ts` |
| Full suite command | `npm test` (`vitest run`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SQL-01 | `select * from tbl where id = 1` pretty-prints with newlines | unit | `npx vitest run src/lib/sql.test.ts -t "formats valid"` | ❌ Wave 0 |
| SQL-02 | Named dialects; source-read no `format(`+language | unit | `npx vitest run src/lib/sql.test.ts` + source-read of `src/lib/sql.ts` | ❌ Wave 0 |
| SQL-03 | Keywords UPPER; indent two spaces | unit | `npx vitest run src/lib/sql.test.ts -t "upper"` | ❌ Wave 0 |
| SQL-04 | Non-empty `formatted` is what ToolShell copies | unit (lib) + reuse ToolShell | Lib returns `formatted`; no new ToolShell test | ✅ ToolShell exists |
| SQL-05 | Garbage / unclosed quote → `{ ok:false, error:'Invalid SQL' }`; empty → idle | unit | `npx vitest run src/lib/sql.test.ts -t "Invalid\\|empty"` | ❌ Wave 0 |
| SQL-06 | EN+ZH FAQ mention executor + autodetection | unit | `npx vitest run src/data/tools.test.ts` (files exist) **plus** source-read faq strings in `sql.test.ts` or a content test | ❌ Wave 0 |
| CAT-01 | `TOOLS` length 15, featured 6, unique slugs | unit | `npx vitest run src/data/tools.test.ts` | ✅ file exists; snapshot still 14 |
| CAT-02 | EN+ZH markdown paths | unit | same | ✅ harness; files missing until slice |
| CAT-03 | `slug === 'sql-formatter'` in ToolIsland.astro | unit | `npx vitest run src/components/tools/ToolIsland.test.ts` | ✅ harness |
| CAT-04 | json-formatter chunk has no `nearley`/`formatDialect` | smoke | `npm run build` then grep `dist/_astro/JsonFormatter*.js` | ❌ Wave 0 (build gate) |
| CAT-06 | `'Invalid SQL'` in `ZH_ERRORS` | unit | `npx vitest run src/i18n/errors.test.ts` | ✅ file exists; key missing |

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/sql.test.ts src/data/tools.test.ts src/components/tools/ToolIsland.test.ts src/i18n/errors.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** `npm test` green **and** `npm run build` CAT-04 grep green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/lib/sql.test.ts` — covers SQL-01, SQL-02, SQL-03, SQL-05
- [ ] `src/i18n/errors.test.ts` — add `'Invalid SQL'` mapping (do not drop lorem/password describes)
- [ ] `src/data/tools.test.ts` — bump `toHaveLength(14)` → `15`
- [ ] EN/ZH markdown files so completeness `existsSync` passes
- [ ] Framework install: `npm install sql-formatter@15.8.2`
- [ ] Post-build CAT-04 grep (not a Vitest file today; planner should add a script or a Node test that reads `dist/` only after build)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No accounts |
| V3 Session Management | no | Session-only React state; no cookies |
| V4 Access Control | no | Public static pages |
| V5 Input Validation | yes | `isTooLarge` (`INPUT_MAX_CHARS = 100_000`) before format; English error union; output is text in `<pre><code>{props.output}</code></pre>` — not `innerHTML` |
| V6 Cryptography | no | No secrets; do not add hashing here |

### Known Threat Patterns for sql-formatter island

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via formatted SQL | Tampering / XSS | Keep output in `ToolShell` text node. Do not `innerHTML` SQL. Nearley dumps never rendered. |
| HTML/`<script>` in paste | XSS | Probe: `SELECT 1; <script>alert(1)</script>` pretty-prints as SQL tokens into a text node. Still do not interpret as HTML. |
| ReDoS / parser hang | Denial of service | `isTooLarge` first. No worker (architecture: no workers). 100k cap matches other tools. |
| SQL execution / injection against a backend | Elevation | There is no backend. FAQ: not an executor. Do not add `sql.js` / WASM SQLite. |
| Prototype pollution via dialect string | Tampering | Dialect is a typed union mapped to imported objects — never `allDialects[userString]` via `format()`. |
| Supply-chain (`argparse` postinstall) | Tampering | Direct install is only `sql-formatter`. Do not import `argparse`. Legitimacy: `sql-formatter` OK, no postinstall. |
| Privacy leak | Information disclosure | No `fetch`. No localStorage dialect memory (deferred). |

## Sources

### Primary (HIGH confidence)

- Unpacked npm tarball `sql-formatter@15.8.2` (`package.json`, `README.md`, `dist/esm/index.d.ts`, `dist/esm/sqlFormatter.js`, `dist/esm/FormatOptions.d.ts`) — API, defaults, `sideEffects: false`, exports map
- Node probe of installed `sql-formatter@15.8.2` — throw vs pretty-print matrix, dialect `.name` values, `keywordCase` default
- esbuild bundle of `format` vs `formatDialect`+one vs six dialects — CAT-04 size evidence
- In-repo files read this session: `src/lib/json.ts`, `src/lib/json.test.ts`, `src/lib/limits.ts`, `src/data/tools.ts`, `src/data/tools.test.ts`, `src/components/tools/ToolIsland.astro`, `src/components/tools/ToolIsland.test.ts`, `src/components/tools/WordCounter.tsx`, `src/i18n/ui.ts`, `src/i18n/errors.ts`, `src/content.config.ts`, `package.json`, `vitest.config.ts`
- `gsd_run query package-legitimacy check --ecosystem npm sql-formatter` → `OK`

### Secondary (MEDIUM confidence)

- sql-formatter README configuration list (`dialect` since v12, `keywordCase`, `tabWidth`) and FAQ “Parse error: Unexpected …”
- Phase 1 CONVENTIONS.md island-split rule (static ToolIsland imports; no lib barrel)
- Milestone `.planning/research/STACK.md` (15.8.2 + formatDialect) — corroborated by tarball this session

### Tertiary (LOW confidence)

- Astro 7 client-chunk isolation after adding this package (A1) — confirm with `astro build`, do not treat stale `dist/_astro/` as proof
- `gsd_run query classify-confidence --provider npm --verified` returned `LOW` for the provider id; claims above are tagged from tarball/probe instead of that seam

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — npm view + unpacked package.json + legitimacy OK
- Architecture: HIGH — in-repo 8-file pattern + locked CONTEXT; MEDIUM only on the final Astro chunk grep (A1)
- Pitfalls: HIGH — probe matrix + esbuild sizes + json.ts idle contract

**Research date:** 2026-09-13
**Valid until:** 2026-10-13 (sql-formatter 15.x is slow-moving; re-check if 16.x ships)
