# Phase 4: Text Diff - Research

**Researched:** 2026-09-13
**Domain:** Astro 7 + Preact catalog tool — in-browser line-level text diff via npm `diff` (`diffLines`)
**Confidence:** HIGH (locked CONTEXT + approved UI-SPEC + unpacked `diff@9.0.0` tarball + Node probe + esbuild minify + HEAD clone targets)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Two-pane layout
- Desktop: two panes side by side; narrow view: stacked. No new layout library
- Diff render: one node per line with add/delete CSS classes — not a single unified dump in one `<pre>` (DIFF-02)
- Stats (lines added / lines removed) sit above the inputs
- Identical texts show an explicit "No differences" state (DIFF-05)

### Whitespace and size
- Toggle: ignore leading/trailing whitespace per line (DIFF-03)
- Default off (exact diff)
- Each pane independently `isTooLarge` (DIFF-06)
- Over-limit pane: too-large error, do not run diff

### Diff engine
- Mature line-level npm package (e.g. `diff`) — not a hand-rolled LCS
- Line-level only; no word-level inline this phase
- ToolShell Copy gets a unified text summary plus stats
- Both empty → idle `{ ok: false, error: '' }`; one empty and one non-empty → all adds or all deletes

### Catalog and chrome
- Catalog: slug `text-diff`, category Text, `featured: false`; bump TOOLS length 15 → 16
- relatedSlugs: word-counter, case-converter, json-formatter; do not rewrite the existing ten tools' relatedSlugs
- Highlight via CSS classes on text nodes — never concatenate untrusted HTML into `innerHTML`
- Only `src/lib/diff.ts` (or equivalent) imports the diff package; json-formatter must not inherit that chunk (CAT-04)

### Claude's Discretion
Exact npm package version after research (`diff` vs a smaller alternative). EN/ZH chrome wording including "No differences" / 无差异. Unified-copy format (standard unified diff vs labeled add/delete lines). How to name the ignore-whitespace checkbox. Related-slug order. Thin `src/lib/diff.ts` wrapper (preferred) vs calling the package from the island.

### Deferred Ideas (OUT OF SCOPE)
- Word-level / character-level inline diff
- Ignore all internal whitespace / blank-line collapsing
- Side-by-side synchronized scroll beyond CSS
- Patch-file download
- Three-way merge
- Syntax-aware language modes
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DIFF-01 | User can paste original and changed text in two panes | Island: two `<textarea>` in `div.tool-grid.split`. Labels `original` / `changed`. Live `onInput` + `useMemo`. No Generate button. |
| DIFF-02 | Line-level add/delete highlighting (not only a unified dump in `<pre>`) | `ol.diff-lines` with one child per line, classes `diff-line diff-line--add\|del\|eq`. ToolShell `<pre>` is the copy payload only. `oneChangePerToken: true` so each `ChangeObject` is one line. |
| DIFF-03 | Ignore leading/trailing whitespace | Native checkbox `ignoreWhitespace`, default unchecked. Pass `{ ignoreWhitespace }` into `diffLines`. Library uses `String.trim()` for equality only — does not collapse internal spaces. |
| DIFF-04 | Lines-added and lines-removed stats | Two `.tool-card` tiles above panes. Count `change.count` on `added` / `removed` hunks (or count `--add`/`--del` rows). Visible whenever at least one pane has characters, including identical `0` / `0`. |
| DIFF-05 | Identical texts show "No differences" | When both panes non-empty (after whole-string trim) and added=removed=0: heading `noDifferences` + body. Copy payload is the heading text so Copy is enabled. Not shown for idle. |
| DIFF-06 | Each pane size-capped | `isTooLarge(original)` and `isTooLarge(changed)` independently against `INPUT_MAX_CHARS` (`100_000`). Matching UI-SPEC error string; clear list + copy payload; do not call `diffLines`. |
| CAT-01 | Catalog row unique slug, Text, `featured: false` | Append-only `TOOLS` row; snapshot `toHaveLength(15)` → `16`; `getFeaturedTools()` stays 6. |
| CAT-02 | EN+ZH markdown | Completeness loop `existsSync` both paths. `howTo` length 3, `faq` 3–5. FAQ states computation is local / nothing uploaded. |
| CAT-03 | ToolIsland branch | Static import + `slug === 'text-diff'` + `locale={locale}`. |
| CAT-04 | json-formatter must not inherit the diff chunk | Only `src/lib/diff.ts` imports `'diff'`. After `astro build`, `dist/_astro/JsonFormatter*.js` must not contain minify-surviving identifiers listed below. |
| CAT-05 | Do not rewrite existing ten `relatedSlugs` | New row may point at existing slugs; do not edit the first ten rows' `relatedSlugs`. |
| CAT-06 | Live compute, copy, size guard, EN+ZH chrome, `ZH_ERRORS` | 8-file checklist. Size errors live in `ui.ts` (not lib). No new English lib error required if the wrapper never returns a non-empty `error`. |
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
- Clone HEAD WordCounter / SqlFormatter / JsonFormatter — never dirty worktree files that import missing `useToolUi`.
- Completeness: `existsSync(URL)` not `.pathname`; ToolIsland source-read `includes(\`slug === '${slug}'\`)`; pass `locale={locale}`.
- GSD: do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it (this research file is the GSD research artifact).
- Do not commit unrelated dirty i18n/pages. Do not pop `stash@{0}`.

## Summary

Phase 4 is the second **heavy-library** catalog slice (after SQL). Ship `text-diff` at 8-file parity: visitors paste original and changed text, optionally ignore leading/trailing whitespace per line, and see a per-line add/delete list plus added/removed stats. Computation stays in `src/lib/diff.ts` plus a Preact island. No API route, no worker, no unified-patch download (DIFF-08 deferred).

Install official `diff@9.0.0`. Call **named `diffLines`** with `{ ignoreWhitespace, oneChangePerToken: true }`. Never `createTwoFilesPatch` / `createPatch` (UI-SPEC copy payload is a labeled add/delete summary; patch APIs also double the minified graph). Never `diffWords` / `diffChars`. Empty-both (or both whitespace-only) must short-circuit to idle **before** `diffLines`: the library returns `[]` for `('', '')`, which would otherwise look like “no differences”.

**Primary recommendation:** One 8-file slice. Thin `src/lib/diff.ts` wrapping `diffLines`; island clones HEAD WordCounter locale/`t()` wiring + HEAD PasswordGenerator checkbox-in-label + HEAD SqlFormatter live `useMemo`; catalog `text-diff` / Text / `featured: false`; TOOLS 15 → 16; UI-SPEC copy keys verbatim; after `astro build`, grep the json-formatter island chunk for minify-surviving `diff` identifiers (`oneChangePerToken`, `newlineIsToken`, `stripTrailingCr`, `ignoreNewlineAtEof`, `createTwoFilesPatch`).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Catalog row, slug, Text, `featured: false`, relatedSlugs | API / Backend (static `TOOLS`) | CDN / Static (`getStaticPaths`) | `TOOLS` is routing source of truth. Markdown is SEO only. |
| Line-level Myers diff (`diffLines`) | Browser / Client (`src/lib/diff.ts` in island) | API / Backend (Vitest Node) | Privacy: compute in the visitor browser. Same module runs in Vitest. |
| Two-pane layout + per-line CSS highlight | Browser / Client (Preact island) | CDN / Static (additive CSS) | DIFF-02 is a DOM structure, not a `<pre>` dump. No layout library. |
| Ignore-whitespace toggle | Browser / Client (native checkbox) | — | Locked UI. Default unchecked. Passed into lib as boolean. |
| Stats + No differences + copy payload | Browser / Client (island + `ToolShell`) | — | Copy is `ToolShell`. Visual list is **not** the `<pre>`. |
| Per-pane size guard | Browser / Client (`isTooLarge` in island) | — | Size guard in UI, not the parser. Do not call `diffLines` when over cap. |
| EN+ZH SEO / how-to / FAQ | CDN / Static (content collections) | — | `howTo` 3, `faq` 3–5; local-only FAQ lives here. |
| Bundle isolation (CAT-04) | CDN / Static (Vite island chunks) | Browser / Client | `'diff'` imported only from `src/lib/diff.ts` used by `TextDiff.tsx`. |
| Completeness harness | API / Backend (Vitest source-read / existsSync) | — | Phase 1 tests stay green as catalog grows to 16. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `diff` (jsdiff) | **9.0.0** (`^9.0.0`) | Line-level Myers diff via named `diffLines` | Locked family. BSD-3-Clause. Zero runtime deps. Types bundled (`libesm/index.d.ts`). ESM `exports["."].import` = `./libesm/index.js`. [CITED: unpacked `diff@9.0.0` `package.json` + `README.md`] |
| Astro | `^7.3.2` | SSG, `getStaticPaths` from `TOOLS` | Already the app. [VERIFIED: package.json:14] quote: `"astro": "^7.3.2"` |
| Preact | `^10.29.8` | Tool islands | [VERIFIED: package.json:15] quote: `"preact": "^10.29.8"` |
| `@astrojs/preact` | `^6.0.5` | `client:load` | [VERIFIED: package.json:12] quote: `"@astrojs/preact": "^6.0.5"` |
| Vitest | `^5.0.0` | Colocated `src/**/*.test.ts`, Node env | [VERIFIED: package.json:9,19] quotes: `"test": "vitest run"` / `"vitest": "^5.0.0"` |
| TypeScript | `^7.0.2` | Strict Astro tsconfig | [VERIFIED: package.json:18] quote: `"typescript": "^7.0.2"` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `diff/lib/diff/line.js` subpath | same package | Alternate import of `diffLines` only | Do **not** use. Root `from 'diff'` already tree-shakes to the same 3446 B minified graph. Match SQL: package-root named import. |
| `@types/diff` | n/a | DefinitelyTyped | Do **not** install. Types ship in the package since v8. [CITED: unpacked `diff@9.0.0` `release-notes.md` v8.0.0] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `diffLines` + `{ ignoreWhitespace }` | `diffTrimmedLines` | Same engine with `ignoreWhitespace: true` forced. Wrapper must pass the checkbox through — use `diffLines` only. |
| `diffLines` | `createTwoFilesPatch` | **Forbidden.** UI-SPEC copy payload is labeled add/delete lines, not a unified patch. Patch entry also minifies to **7682 B** and embeds `Index:` / `@@ ` (CAT-04 noise). DIFF-08 deferred. |
| `diffLines` | `diffWords` / `diffChars` | **Forbidden this phase.** Word/char inline is DIFF-07. |
| `diff@9.0.0` | `diff@8.0.4` | 8.x keeps ES5. This app is Node 20.19+/22.12+ and modern browsers. Use latest 9.0.0. |
| npm `diff` | Hand-rolled LCS | **Forbidden.** CONTEXT locked a mature package. |
| Thin `src/lib/diff.ts` | Call `diffLines` from the island | Locked preference: wrap like `json.ts` / `sql.ts` so Vitest covers idle / ignore-ws / stats without rendering. |

**Installation:**

```bash
npm install diff@9.0.0
```

**Version verification:** `npm view diff version` → `9.0.0`. `time['9.0.0']` `2026-04-13T12:39:24.498Z`. License BSD-3-Clause. Homepage `https://github.com/kpdecker/jsdiff#readme`. Repository `https://github.com/kpdecker/jsdiff.git`. Weekly downloads **102,115,667** (`https://api.npmjs.org/downloads/point/last-week/diff`). No `scripts.postinstall`. No runtime `dependencies`. Do **not** install `@types/diff`.

`engines` quote: `"node": ">=0.3.1"` [VERIFIED: unpacked `diff@9.0.0` `package.json:28-30`]. Present constraint — Node 22 satisfies it.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `diff` | npm | first publish `1.0.0` 2011-03-29; `9.0.0` 2026-04-13 | 102,115,667/wk | github.com/kpdecker/jsdiff | Seam `SUS` (null signals: unknown-age / unknown-downloads / no-repository) | **Approved** — seam lookup failed (all `signals` null). Independent tarball README + `npm view` repo + 102M/wk + no postinstall. Not a slopsquat. Planner: **no** `checkpoint:human-verify`. |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** seam flagged `diff` because metadata lookup returned nulls, not because the package is new/unmaintained. Treat as Approved.

The package name is confirmed by the official tarball README (`npm install diff --save`) **but** `gsd_run query package-legitimacy check` did not return `OK`, so the name is **not** tagged `[VERIFIED: npm registry]`. Tag: `[CITED: unpacked diff@9.0.0 README.md:8-11]`.

## Architecture Patterns

### System Architecture Diagram

```text
Visitor paste (original textarea + changed textarea) + ignoreWhitespace checkbox
        │
        ▼
TextDiff.tsx  (Preact island, client:load, locale prop)
        │  isTooLarge(original) or isTooLarge(changed)?
        │     yes ──► ToolShell error = UI-SPEC per-pane / both string
        │             visual list omitted, output="", do not call lib
        │     no
        ▼
src/lib/diff.ts  diffText(original, changed, { ignoreWhitespace })
        │  both whole-string trim empty? ──yes──► { ok:false, error:'' }  (idle)
        │  no
        ▼
diffLines(original, changed, { ignoreWhitespace, oneChangePerToken: true })
        │
        ├─ added=0 and removed=0 and both sides non-empty
        │     ──► { ok:true, lines:[eq...], added:0, removed:0, identical:true }
        ├─ otherwise
        │     ──► { ok:true, lines:[{kind,text}], added, removed, identical:false }
        │
        ▼
Island
  stats tiles (hidden if idle)
  checkbox
  two panes
  visual: idle copy | No differences | ol.diff-lines (one node per line, class + text child)
  ToolShell error + <pre> copy payload (labeled summary, not a patch)

ToolIsland.astro ── static import TextDiff
                 ── {slug === 'text-diff' && <TextDiff client:load locale={locale} />}
                 ── json-formatter branch does NOT import 'diff'

astro build ── dist/_astro/TextDiff.*.js     may contain oneChangePerToken / newlineIsToken
           ── dist/_astro/JsonFormatter.*.js MUST NOT contain those identifiers
```

### Recommended Project Structure

```
src/lib/diff.ts                            # NEW — diffText + DiffResult
src/lib/diff.test.ts                       # NEW — idle, add/delete, ignore-ws, identical, isolation
src/components/tools/TextDiff.tsx          # NEW — two panes + checkbox + stats + line list + ToolShell
src/components/tools/ToolIsland.astro      # ADD static import + slug === 'text-diff'
src/data/tools.ts                          # APPEND text-diff row; do not edit first ten relatedSlugs
src/data/tools.test.ts                     # toHaveLength(15) → 16
src/i18n/ui.ts                             # APPEND tools['text-diff'] EN+ZH (UI-SPEC keys)
src/i18n/errors.ts                         # no new lib error required (see CAT-06)
src/i18n/errors.test.ts                    # APPEND chrome-key assert for text-diff
src/content/tools/text-diff.md             # NEW EN, howTo 3, faq 3–5
src/content/tools/zh/text-diff.md          # NEW ZH
src/styles/global.css                      # APPEND only .diff-lines / .diff-line--* rules (do not retokenize :root)
```

Do **not** add `src/lib/index.ts`. Do **not** import `'diff'` from `ToolIsland.astro`, `json.ts`, or `JsonFormatter.tsx`. Do **not** edit dirty `src/i18n/useToolUi.ts` / `src/i18n/locales.ts` (they are not on HEAD). Do **not** rewrite `JsonFormatter.tsx` or `ToolShell.tsx`.

### Pattern 1: Thin lib wrapping `diffLines`

**What:** `src/lib/diff.ts` mirrors `src/lib/json.ts`: idle empty, never throw, discriminated union. The island owns size-guard and chrome strings.
**When to use:** Always this phase (locked preference).
**Example:**

```typescript
// Source: clone src/lib/json.ts:1-13 plus unpacked diff@9.0.0
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
// diffLines signature [VERIFIED: unpacked diff@9.0.0 libesm/diff/line.d.ts:16]:
//   export declare function diffLines(oldStr: string, newStr: string, options?: DiffLinesOptionsNonabortable): ChangeObject<string>[];
// ChangeObject [VERIFIED: unpacked diff@9.0.0 libesm/types.d.ts:1-19]:
//   export interface ChangeObject<ValueT> {
//     value: ValueT;
//     added: boolean;
//     removed: boolean;
//     count: number;
//   }
// ignoreWhitespace [VERIFIED: unpacked diff@9.0.0 README.md:73]:
//   ignoreWhitespace: true to ignore leading and trailing whitespace characters when checking if two lines are equal. Defaults to false.
// oneChangePerToken [VERIFIED: unpacked diff@9.0.0 README.md:225]:
//   oneChangePerToken: if true, the array of change objects returned will contain one change object per token (e.g. one per line if calling diffLines)
// LineDiff.equals trim [VERIFIED: unpacked diff@9.0.0 libesm/diff/line.js:16-22]:
//   if (options.ignoreWhitespace) {
//     if (!options.newlineIsToken || !left.includes('\n')) {
//       left = left.trim();
//     }
//     if (!options.newlineIsToken || !right.includes('\n')) {
//       right = right.trim();
//     }
//   }

import { diffLines } from 'diff';

export type DiffLineKind = 'add' | 'del' | 'eq';

export type DiffLine = { kind: DiffLineKind; text: string };

export type DiffResult =
  | {
      ok: true;
      lines: DiffLine[];
      added: number;
      removed: number;
      identical: boolean;
    }
  | { ok: false; error: string };

export function diffText(
  original: string,
  changed: string,
  options: { ignoreWhitespace: boolean },
): DiffResult {
  if (!original.trim() && !changed.trim()) return { ok: false, error: '' };
  const changes = diffLines(original, changed, {
    ignoreWhitespace: options.ignoreWhitespace,
    oneChangePerToken: true,
  });
  const lines: DiffLine[] = [];
  let added = 0;
  let removed = 0;
  for (const change of changes) {
    const kind: DiffLineKind = change.added ? 'add' : change.removed ? 'del' : 'eq';
    if (kind === 'add') added += 1;
    if (kind === 'del') removed += 1;
    const text = change.value.replace(/\r?\n$/, '');
    lines.push({ kind, text });
  }
  return {
    ok: true,
    lines,
    added,
    removed,
    identical: added === 0 && removed === 0,
  };
}
```

Exact import path: **`from 'diff'`** (package root). [VERIFIED: unpacked `diff@9.0.0` `package.json` `exports["."]`]

Do **not** pass `newlineIsToken: true` (UI-SPEC is line-level rows, not newline tokens). Do **not** pass `stripTrailingCr` unless a later phase asks (exact diff treats CRLF vs LF as different — probe confirmed). Do **not** pass `callback` (async mode returns `undefined` from the sync call).

Idle uses **whole-string** `.trim()` on both panes (UI-SPEC: “both panes empty or whitespace-only”). Ignore-whitespace uses **per-line** trim inside the library. Do not pre-trim each line in our wrapper — that would mutate displayed text.

### Pattern 2: Island = two panes + checkbox + stats + line list + ToolShell

**What:** `TextDiff.tsx` default export `{ locale }: { locale: Locale }`. `useState` for original, changed, ignoreWhitespace (default `false`). `useMemo` depends on those plus `locale`. Native checkbox inside `<label>` (PasswordGenerator). Visual list is island children, **not** ToolShell `<pre>`.
**When to use:** This tool. Clone **committed HEAD** `WordCounter.tsx` locale/`t()` wiring, HEAD `PasswordGenerator` checkbox, HEAD `SqlFormatter` live `useMemo`. **Not** dirty `JsonFormatter.tsx` (imports missing `useToolUi`). **Not** dirty `ToolShell.tsx` (adds a `locale` prop that HEAD does not have).
**Example:**

```tsx
// Source: WordCounter locale + limits [VERIFIED: src/components/tools/WordCounter.tsx:1-14]
//   import { t, type Locale } from '../../i18n/ui';
//   export default function WordCounter({ locale }: { locale: Locale }) {
//   const copy = t(locale);
//   const labels = copy.tools['word-counter'];
//   if (isTooLarge(input)) { return { error: INPUT_TOO_LARGE_MSG, output: '', ...
// PasswordGenerator HEAD checkbox [VERIFIED: git show HEAD src/components/tools/PasswordGenerator.tsx]:
//   <label>
//     <input
//       type="checkbox"
//       checked={excludeSimilar}
//       onChange={(e) => setExcludeSimilar((e.target as HTMLInputElement).checked)}
//     />
//     {labels.excludeSimilar}
//   </label>
// HEAD ToolShell [VERIFIED: git show HEAD src/components/ToolShell.tsx]:
//   export function ToolShell(props: { error: string | null; output: string; children: ComponentChildren; })
//   await navigator.clipboard.writeText(props.output);
//   {copied ? 'Copied' : 'Copy'}
// limits [VERIFIED: src/lib/limits.ts:1-7]:
//   export const INPUT_MAX_CHARS = 100_000;
//   export const INPUT_TOO_LARGE_MSG =
//     'Input too large to process in the browser.';
//   export function isTooLarge(input: string): boolean {
//     return input.length > INPUT_MAX_CHARS;
//   }

import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { diffText } from '../../lib/diff';
import { isTooLarge } from '../../lib/limits';
import { t, type Locale } from '../../i18n/ui';

export default function TextDiff({ locale }: { locale: Locale }) {
  const [original, setOriginal] = useState('');
  const [changed, setChanged] = useState('');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const copy = t(locale);
  const labels = copy.tools['text-diff'];
  const result = useMemo(() => {
    const origBig = isTooLarge(original);
    const chgBig = isTooLarge(changed);
    if (origBig || chgBig) {
      const error = origBig && chgBig
        ? labels.tooLargeBoth
        : origBig
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
      {/* stats, checkbox, tool-grid.split panes, then visual list — see UI-SPEC order */}
    </ToolShell>
  );
}
```

HEAD `ToolShell` has **no** `locale` prop. Do not pass `locale={locale}` into `ToolShell`. Dirty worktree `ToolShell.tsx` does — that is uncommitted dirt.

Too-large strings are **island chrome** (UI-SPEC), not `INPUT_TOO_LARGE_MSG` and not `ZH_ERRORS`. Put them on `ui.en.tools['text-diff']` / `ui.zh.tools['text-diff']`.

### Pattern 3: ToolIsland static import (not dynamic tag)

**What:** Add a static import and a `slug === 'text-diff'` branch with `client:load` and `locale={locale}`.
**When to use:** CAT-03. Astro forbids `client:*` on dynamic tags.
**Example:**

```astro
---
// Source: ToolIsland.astro HEAD tail [VERIFIED: git show HEAD src/components/tools/ToolIsland.astro]
import TextDiff from './TextDiff';
---
{slug === 'text-diff' && <TextDiff client:load locale={locale} />}
```

Coverage test already source-reads `includes(\`slug === '${slug}'\`)`. [VERIFIED: src/components/tools/ToolIsland.test.ts:10-16] quote: `source.includes(\`slug === '${slug}'\`)`

Do **not** `import('diff')` from `ToolIsland.astro`.

### Pattern 4: Catalog append-only

**What:** One new `TOOLS` row. Snapshot 15 → 16. Featured stays 6. `featured: false`.
**When to use:** CAT-01.
**Example values:**

```typescript
// [VERIFIED: src/data/tools.ts:1-8] ToolCategory includes 'Text'
//   | 'Format'
//   | 'Auth'
//   | 'Encode'
//   | 'Generate'
//   | 'Text'
//   | 'Time'
//   | 'Color';
// [VERIFIED: src/data/tools.test.ts:12-13] expect(TOOLS).toHaveLength(15);
// [VERIFIED: src/data/tools.test.ts:21-23] expect(featured).toHaveLength(6);
// last current row [VERIFIED: src/data/tools.ts:132-139]:
//   slug: 'sql-formatter',
//   name: 'SQL Formatter',
//   category: 'Format',
//   shortDescription: 'Pretty-print SQL in your browser.',
//   relatedSlugs: ['json-formatter', 'regex-tester', 'base64'],
//   featured: false,
{
  slug: 'text-diff',
  name: 'Text Diff',
  category: 'Text',
  shortDescription: 'Compare two texts line by line in your browser.',
  relatedSlugs: ['word-counter', 'case-converter', 'json-formatter'],
  featured: false,
}
```

Discretion locked here: related trio **`word-counter`, `case-converter`, `json-formatter`** in that order. Do **not** add `text-diff` to those tools’ `relatedSlugs` (CAT-05 / D-13).

### Pattern 5: Copy payload (labeled summary, not a patch)

UI-SPEC locked format (not `createTwoFilesPatch`):

```
Added: 2
Removed: 1

- deleted line
+ added line
  unchanged line
```

First two lines use EN `Added` / `Removed` when `locale === 'en'`, ZH `新增` / `删除` when `locale === 'zh'`. Body prefixes: `- ` / `+ ` / two spaces. Empty payload when idle or too-large. Identical: payload is the No differences heading only (`No differences` / `无差异`) so Copy is enabled.

Build this string in the island from `DiffResult` + `labels.added` / `labels.removed`. Do not call `createTwoFilesPatch`.

### Pattern 6: Additive CSS for line highlighting

HEAD `src/styles/global.css` already has `.tool-grid` / `.tool-grid.split` at `min-width: 720px` [VERIFIED: git show HEAD `src/styles/global.css`]:

```
.tool-grid { display: grid; gap: 1rem; }
@media (min-width: 720px) {
  .tool-grid.split { grid-template-columns: 1fr 1fr; }
}
```

HEAD does **not** define `.tool-card` rules or add/delete colors. WordCounter already uses `class="tool-card"` anyway. Append **only** diff-line rules — do not retokenize `:root`, do not rewrite dirty visual CSS.

UI-SPEC colors (approved):

- Add: `#3dd68c` on `#13291f`, 3px left border. Never `--accent`.
- Delete: `#f07178` (`--danger` on dirty tree; HEAD `--danger` is `#f87171` — use the UI-SPEC literal `#f07178` on `.diff-line--del` so add/delete do not depend on which `:root` is checked out).
- Prefixes `+` / `-` / two spaces with `aria-hidden="true"` (color is not the only signal).
- List `max-height: 384px; overflow-y: auto; overflow-x: auto`; line text `white-space: pre-wrap; overflow-wrap: anywhere`.

Render: `class={'diff-line diff-line--' + kind}` and `{line.text}` as a text child. Forbidden: `innerHTML`, `dangerouslySetInnerHTML`, string-concatenated markup.

### Anti-Patterns to Avoid

- **`createTwoFilesPatch` / `createPatch` as the visual or the copy payload:** Forbidden by UI-SPEC and DIFF-08. Also pulls `Index:` / `@@ ` into the chunk.
- **`oneChangePerToken` omitted:** Consecutive adds coalesce (`count: 2`, `value: "X\nY\n"`). DIFF-02 needs one DOM node per line — either split on `\n` yourself or pass `oneChangePerToken: true`. Use the option.
- **Calling `diffLines('', '')` and treating `[]` as identical:** Idle must run first. Probe: empty-empty → `[]`; `'hello\n'` vs `'hello\n'` → one equal hunk.
- **Pre-trimming lines in the wrapper when the checkbox is on:** Displayed `value` would lose the user’s spaces. Library trims only for equality; `value` comes from the **new** string.
- **`ignoreWhitespace` as collapse-all-spaces:** Probe: `'foo  bar\n'` vs `'foo bar\n'` with the flag **on** is still a delete+add. Internal spaces stay significant.
- **`innerHTML` / `dangerouslySetInnerHTML`:** XSS. UI-SPEC + CONTEXT.
- **Importing `'diff'` from the island or ToolIsland:** CAT-04 leak.
- **Cloning dirty `JsonFormatter.tsx` / dirty `ToolShell.tsx`:** missing `useToolUi` / extra `locale` prop.
- **`src/lib/index.ts` barrel.**
- **Passing `locale` into HEAD `ToolShell`.**
- **Using `--accent` (`#3ecfbf` dirty / `#2dd4bf` HEAD) for added lines.**
- **Rewriting the first ten `relatedSlugs` or existing ten tool islands.**
- **Word-level `diffWords`.** Deferred DIFF-07.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Line-level LCS / Myers diff | Custom longest-common-subsequence | `diff` `diffLines` | Myers O(ND), newline tokenization, ignore-whitespace equality, coalescing. Hand-rolling fails on CRLF, blank lines, and large edits. |
| Unified patch formatting | String-concat `---`/`+++`/`@@` | Not this phase | DIFF-08 deferred. Copy payload is the UI-SPEC labeled summary. |
| Clipboard copy chrome | New copy bar | Existing HEAD `ToolShell` | Empty-disabled Copy + Copied timeout. |
| Input size cap | New helper | `isTooLarge` / `INPUT_MAX_CHARS` | Shared 100_000 char cap. [VERIFIED: src/lib/limits.ts:1-7] |
| Two-pane grid | New layout library | Existing `.tool-grid.split` | Already 1fr 1fr at 720px. |
| EN→ZH chrome | Ad-hoc island strings | `ui.ts` `tools['text-diff']` | CAT-06. Size errors are chrome, not lib errors. |

**Key insight:** The expensive part is a correct line tokenizer + Myers, not the UI. Pay 3.4 kB minified for named `diffLines`, keep the island as thin as SqlFormatter, and never let the patch formatter into the graph.

## Common Pitfalls

### Pitfall 1: Empty-empty is `[]`, not “No differences”

**What goes wrong:** `diffLines('', '')` returns `[]` (Node probe). If the island maps “zero hunks” to DIFF-05, idle shows “No differences” and Copy enables with that heading.
**Why it happens:** No tokens → no change objects.
**How to avoid:** Whole-string trim both panes; if both empty, return `{ ok: false, error: '' }` **before** `diffLines`. UI-SPEC: whitespace-only both is also idle. Stats hidden. Visual uses empty-state heading/body, not `noDifferences`.
**Warning signs:** Opening the tool shows “No differences”. Copy is enabled with no paste.

### Pitfall 2: Coalesced hunks vs one node per line

**What goes wrong:** Probe `diffLines('a\nb\nc\n', 'a\nX\nY\nc\n')` yields one added hunk `{ count: 2, value: "X\nY\n" }`. Rendering `change.value` as a single node fails DIFF-02.
**Why it happens:** Default coalesces consecutive same-kind tokens.
**How to avoid:** `{ oneChangePerToken: true }` (probe splits to one object per line). Unit-test two consecutive added lines produce two `kind: 'add'` rows.
**Warning signs:** A block add is one fat row; stats `added` is 1 instead of 2 if you count hunks not `count`.

### Pitfall 3: `ignoreWhitespace` is trim, not collapse

**What goes wrong:** FAQ or tests expect `'foo  bar'` == `'foo bar'` with the toggle on. Probe: still add/delete.
**Why it happens:** `LineDiff.equals` calls `left.trim()` / `right.trim()` only. [VERIFIED: unpacked `diff@9.0.0` `libesm/diff/line.js:16-22`]
**How to avoid:** Tests: `'foo \n'` vs `'foo\n'` with flag on → identical; `'foo  bar\n'` vs `'foo bar\n'` with flag on → not identical. UI-SPEC label: `Ignore leading/trailing whitespace` / `忽略行首行尾空白`.
**Warning signs:** Internal-space-only edits disappear.

### Pitfall 4: CAT-04 grep of `jsdiff` / `diffLines` is a false clean

**What goes wrong:** User-suggested greps `jsdiff` / `createPatch` / `Diff.diffLines` are **absent even in the TextDiff chunk** after esbuild minify (function names rewritten; `jsdiff` never appears). A leak of the Myers engine would still be invisible to those strings.
**Why it happens:** Minify. Named `diffLines` bundle is 3446 bytes and still contains option **property** names.
**How to avoid:** Grep minify-surviving identifiers (present in the 3446 B named-lines bundle, absent from a json-only graph):

- `oneChangePerToken`
- `newlineIsToken`
- `stripTrailingCr`
- `ignoreNewlineAtEof`
- `createTwoFilesPatch` (must stay absent everywhere except if someone imports patch APIs)

Also source-read like Phase 3: only `src/lib/diff.ts` contains `from 'diff'`. After `astro build`, `dist/_astro/JsonFormatter*.js` must not match those five strings.
**Warning signs:** Plan verifies `jsdiff` only; a leaked chunk still ships.

### Pitfall 5: Per-pane too-large vs shared `INPUT_TOO_LARGE_MSG`

**What goes wrong:** Island reuses WordCounter’s `INPUT_TOO_LARGE_MSG` (`'Input too large to process in the browser.'`). UI-SPEC locked three distinct EN/ZH strings (original / changed / both).
**Why it happens:** Clone-target gravity.
**How to avoid:** Call `isTooLarge` twice; pick `tooLargeOriginal` / `tooLargeChanged` / `tooLargeBoth` from `labels`. Do not run `diffText` if either pane is over cap. Cap is `100_000` chars per pane, not combined.
**Warning signs:** Oversize original shows the generic English string on the ZH page.

### Pitfall 6: Cloning the dirty worktree

**What goes wrong:** Disk `JsonFormatter.tsx` imports `useToolUi` (file **not** on HEAD). Disk `ToolShell.tsx` requires `locale`. Disk `src/pages/index.astro` may import missing `../i18n/path` (Phase 3 verify could not `astro build`).
**Why it happens:** Uncommitted i18n/visual refactor.
**How to avoid:** Clone HEAD `WordCounter.tsx`, HEAD `SqlFormatter.tsx`, HEAD `PasswordGenerator.tsx`, HEAD `ToolShell.tsx` (no locale prop). Do not introduce `useToolUi` / `i18n/locales`. Do not rewrite JsonFormatter, ToolShell, or dirty pages. Do not pop `stash@{0}`. CAT-04 `npm run build` must run on a tree that actually compiles — if dirty pages break the build, stash or path-ignore them for the grep; do not “fix” them in this phase.
**Warning signs:** New island imports `useToolUi`. Typecheck fails on `ToolShell` extra/missing `locale`.

### Pitfall 7: Completeness snapshot not bumped

**What goes wrong:** `expect(TOOLS).toHaveLength(15)` fails after append. Missing EN/ZH markdown fails `existsSync`. Missing `slug === 'text-diff'` fails ToolIsland coverage.
**How to avoid:** Same 8-file checklist as Phase 3. Bump 15 → 16 in the same slice as the catalog row. Markdown paths: `src/content/tools/text-diff.md` and `src/content/tools/zh/text-diff.md` via `new URL(..., import.meta.url)` — never `.pathname`.
**Warning signs:** `npm test` red on `has exactly 15 tools`.

### Pitfall 8: Visual list only inside ToolShell `<pre>`

**What goes wrong:** Executor puts highlighted output solely in `output=` and calls it a day. DIFF-02 fails even if classes exist as text inside `<pre><code>`.
**Why it happens:** Every prior tool uses ToolShell `<pre>` as the result view.
**How to avoid:** `<pre class="tool-output">` is the **copyable labeled summary**. Highlighted rows are sibling children **above** ToolShell’s error/output wrap (inside `children`).
**Warning signs:** View-source of the island has no `diff-line--add`.

## Code Examples

Verified patterns from official / in-repo sources:

### `diffLines` probe (unpacked `diff@9.0.0`, Node 22)

```text
diffLines('a\nb\nc\n', 'a\nB\nc\n')
  eq "a\n" / del "b\n" / add "B\n" / eq "c\n"

diffLines('', '')                          → []
diffLines('', 'x\ny\n')                    → add count=2 value="x\ny\n"
diffLines('x\ny\n', '')                    → del count=2 value="x\ny\n"
diffLines('foo \n', 'foo\n')               → del+add (exact)
diffLines('foo \n', 'foo\n', { ignoreWhitespace: true })
                                           → eq value="foo\n"   // value from NEW string
diffLines('foo  bar\n', 'foo bar\n', { ignoreWhitespace: true })
                                           → del+add            // internal spaces kept
diffLines('\n', '   \n', { ignoreWhitespace: true })
                                           → eq value="   \n"   // blank vs spaces-only
diffLines('a\nb\nc\n', 'a\nX\nY\nc\n')     → added hunk count=2  // coalesced
diffLines(..., { oneChangePerToken: true }) → one object per line
diffLines('a\r\nb\r\n', 'a\nb\n')          → del+add (CRLF vs LF)
diffLines(..., { stripTrailingCr: true })  → eq                 // do not enable this phase
```

[VERIFIED: Node probe of unpacked `diff@9.0.0` `libesm/index.js`]

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

UI-SPEC too-large copy (use these, not `INPUT_TOO_LARGE_MSG`):

- EN original: `Original text is too large to process in the browser.`
- EN changed: `Changed text is too large to process in the browser.`
- EN both: `Original and changed text are too large to process in the browser.`
- ZH original: `原文过长，无法在浏览器中处理。`
- ZH changed: `改后文本过长，无法在浏览器中处理。`
- ZH both: `原文和改后文本都过长，无法在浏览器中处理。`

### i18n keys (append both locales; do not drop Phase 2/3 keys)

```typescript
// [VERIFIED: src/i18n/errors.ts:1-7] current ZH_ERRORS keys:
//   'Enter a count of at least 1'
//   'Count exceeds the maximum'
//   'Select at least one character set'
//   'Length must be between 8 and 128'
//   'Invalid SQL'
// No new ZH_ERRORS entry required unless the lib returns a non-empty English error.
// Chrome keys (UI-SPEC Copywriting Contract) under ui.en/zh.tools['text-diff']:
name, shortDescription, original, changed, added, removed,
ignoreWhitespace, noDifferences,
emptyHeading, emptyBody, noDifferencesBody,
tooLargeOriginal, tooLargeChanged, tooLargeBoth
```

Locked control labels (verbatim UI-SPEC):

| Key | EN | ZH |
|-----|----|----|
| `name` | Text Diff | 文本对比 |
| `shortDescription` | Compare two texts line by line in your browser. | 在浏览器里逐行对比两段文本。 |
| `original` | Original | 原文 |
| `changed` | Changed | 改后 |
| `added` | Added | 新增 |
| `removed` | Removed | 删除 |
| `ignoreWhitespace` | Ignore leading/trailing whitespace | 忽略行首行尾空白 |
| `noDifferences` | No differences | 无差异 |

Empty heading/body (verbatim UI-SPEC): EN `Paste original and changed text` / `Diff runs in your browser. Nothing is uploaded.` ZH `粘贴原文和改后文本` / `比较在浏览器本地完成，不会上传内容。`

No differences body: EN `The two texts match.` ZH `两段文本相同。`

Stats display: `{n} {added}` / `{n} {removed}` — EN `2 Added` / `1 Removed`, ZH `2 新增` / `1 删除`. Integer only. Never “2 lines added”.

### Markdown schema

```yaml
# [VERIFIED: src/content.config.ts:16-29] disk schema (dirty may add locale; HEAD schema omits locale)
#   title, description, intro
#   howTo: z.tuple([z.string(), z.string(), z.string()])
#   faq: .min(3).max(5)
# Sibling Phase 3 files include `locale: en` / `locale: zh` — keep that field so dirty
# content.config (which requires locale) still builds.
locale: en
title: Text Diff
description: Compare two texts line by line in your browser. Nothing is uploaded.
intro: Paste original and changed text. The diff runs locally.
howTo:
  - Paste the original text in the left (or top) pane and the changed text in the other pane.
  - Optionally check Ignore leading/trailing whitespace. The diff updates as you type.
  - Copy the labeled summary with the Copy button.
faq:
  - question: Is my text uploaded?
    answer: No. The comparison runs in your browser. Nothing is uploaded.
  - question: What does Ignore leading/trailing whitespace do?
    answer: It trims spaces and tabs at the start and end of each line before comparing. Spaces in the middle of a line still count. Blank-line collapsing is not offered.
  - question: Can I download a unified patch?
    answer: Not in this tool. Copy gives a labeled add/delete summary. Patch download is not included.
```

ZH FAQ must state local/no-upload. `faq` length 3–5. `howTo` length 3.

### CAT-04 verification (post-build)

```bash
npm test
npm run build
# JsonFormatter island chunk must NOT contain minify-surviving diff identifiers
# TextDiff island chunk MAY contain oneChangePerToken / newlineIsToken
```

Planner: add a verification step that **fails** if `dist/_astro/JsonFormatter*.js` matches any of:

`oneChangePerToken` | `newlineIsToken` | `stripTrailingCr` | `ignoreNewlineAtEof` | `createTwoFilesPatch`

Do **not** treat absence of `jsdiff` / `diffLines` / `createPatch` as sufficient (they minify away). Do not trust a stale `dist/_astro/`. Always rebuild. If dirty pages break `astro build`, do not rewrite them — isolate the build the same way Phase 3 verify noted (`../i18n/path` missing). Source isolation test still lands in `src/lib/diff.test.ts` regardless.

esbuild 0.28.2 probe (project `node_modules/esbuild`, unpacked `diff@9.0.0`, `--bundle --format=esm --minify --platform=browser`):

| Entry | Minified bytes | `createTwoFilesPatch` | `oneChangePerToken` |
|-------|----------------|----------------------|---------------------|
| `import { diffLines } from 'diff'` | 3446 | absent | present |
| `import { diffLines } from 'diff/lib/diff/line.js'` | 3446 | absent | present |
| `import * as Diff from 'diff'` (only `Diff.diffLines` used) | 3446 | absent | present |
| `import { createTwoFilesPatch } from 'diff'` | 7682 | absent as ident (minified) but `Index:` / `@@ ` present | present |

[VERIFIED: esbuild 0.28.2 against unpacked `diff@9.0.0`]

### Isolation unit test (clone SQL)

```typescript
// Source: src/lib/sql.test.ts:86-95 [VERIFIED: src/lib/sql.test.ts:86-95]
//   expect(sqlSource).toContain("from 'sql-formatter'");
//   expect(island).not.toMatch(/from ['"]sql-formatter['"]/);
//   expect(jsonIsland).not.toMatch(/from ['"]sql-formatter['"]/);

expect(diffSource).toContain("from 'diff'");
expect(island).toContain('diffText');
expect(island).toContain('../../lib/diff');
expect(island).not.toMatch(/from ['"]diff['"]/);
expect(toolIsland).not.toMatch(/from ['"]diff['"]/);
expect(jsonLib).not.toMatch(/from ['"]diff['"]/);
expect(jsonIsland).not.toMatch(/from ['"]diff['"]/);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@types/diff` on DefinitelyTyped | Types bundled in `libesm/*.d.ts` | jsdiff v8.0.0 | Do not install `@types/diff` |
| `sideEffects` unmarked | `libesm/package.json` `"sideEffects": false` | v8.0.2 | Named `diffLines` tree-shakes to ~3.4 kB |
| ES5 target | ES6 / Baseline widely-available | v9.0.0 (2026-04-13) | Fine for this Node/browser app |
| `added`/`removed` omitted when false | Always boolean | v6.0.0 | `change.added === false` is safe |
| `oneChangePerToken` undocumented | First-class option | v6.0.0 | Use it for DIFF-02 |

**Deprecated/outdated:**

- `diffTrimmedLines`: still exported; it only sets `ignoreWhitespace: true`. Use `diffLines` + the checkbox. [VERIFIED: unpacked `diff@9.0.0` `libesm/diff/line.js:39-42`]
- `createTwoFilesPatch` as this tool’s copy format: product-deferred (DIFF-08), not library-deprecated.
- Hand-rolled LCS: forbidden by CONTEXT.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | After a fresh `astro build`, Vite will keep `diff` out of `JsonFormatter*.js` the same way named `sql-formatter` imports stayed isolated | Bundle isolation | CAT-04 fails; planner adds a dynamic `import('diff')` **inside** `diff.ts` only as a last resort — never from ToolIsland. Confirm with build; do not skip. |
| A2 | Seam `SUS` on `diff` is a metadata-lookup failure, not a slopsquat | Package legitimacy | If a different `diff` package were intended, the official jsdiff README would not say `npm install diff`. Low risk. |
| A3 | HEAD `src/pages/` has no committed `zh/` tree (`git ls-files src/pages` is EN-only). EN `[slug].astro` already maps every `TOOLS` slug. Dirty `src/pages/zh/` must not be edited or committed this phase. | Catalog routing | `/zh/tools/text-diff/` may be missing on a clean HEAD checkout. CAT-02 is markdown; ROADMAP SC5 “EN+ZH pages” is already how `[slug].astro` + a parallel zh tree work when that tree exists. Do not invent a new i18n router. |

**If A1 is the only execution risk:** All other claims were verified from tarball + probe + in-repo Reads.

## Open Questions (RESOLVED)

Resolved for planning — do not re-ask:

1. **Exact npm package / version** — RESOLVED: `diff@9.0.0` (`^9.0.0`). Named `diffLines` from `'diff'`. Not 8.x, not a smaller alternative (3.4 kB is already small).
2. **EN/ZH chrome including “No differences” / 无差异** — RESOLVED: UI-SPEC Copywriting Contract verbatim. Keys listed above.
3. **Unified-copy format** — RESOLVED: labeled add/delete summary (UI-SPEC). **Not** `createTwoFilesPatch`.
4. **Checkbox name** — RESOLVED: `ignoreWhitespace` / EN `Ignore leading/trailing whitespace` / ZH `忽略行首行尾空白`.
5. **Related-slug order** — RESOLVED: `['word-counter', 'case-converter', 'json-formatter']`.
6. **Thin wrapper** — RESOLVED: yes, `src/lib/diff.ts`. Island does not import `'diff'`.
7. **Idle vs identical** — RESOLVED: both whole-string-trim empty → idle; identical non-empty → No differences + Copy enabled with heading text.
8. **Clone target** — RESOLVED: HEAD WordCounter locale wiring + HEAD PasswordGenerator checkbox + HEAD SqlFormatter/`JsonFormatter` live `useMemo`. Not dirty `useToolUi`. HEAD ToolShell (no `locale` prop).
9. **CAT-04 grep strings** — RESOLVED: minify-surviving `oneChangePerToken`, `newlineIsToken`, `stripTrailingCr`, `ignoreNewlineAtEof`, `createTwoFilesPatch`. Do not rely on `jsdiff` / `diffLines`.
10. **CRLF / `stripTrailingCr` / `newlineIsToken`** — RESOLVED: leave all default `false`. Exact diff.
11. **Lib errors / ZH_ERRORS** — RESOLVED: wrapper does not throw and has no invalid-input English error. Size strings live in `ui.ts`. Do not add a dummy `ZH_ERRORS` key.
12. **Stats when identical** — RESOLVED: tiles visible at `0` / `0` whenever at least one pane has characters.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vitest, `astro build`, npm | ✓ | v22.22.2 | — |
| npm | `npm install diff@9.0.0` | ✓ | 11.9.0 | — |
| esbuild (transitive via Astro) | CAT-04 size/identifier probe this session | ✓ | 0.28.2 | — |
| Git | HEAD clone targets | ✓ | mingw64 git | — |
| `diff` npm package | DIFF engine | ✗ (not in `package.json` yet) | install `9.0.0` | — |
| Context7 CLI (`ctx7`) | Docs lookup | ✗ | — | Unpacked tarball README + `.d.ts` (used) |
| Knowledge graph | Cross-doc discovery | ✗ | no `.planning/graphs/graph.json` | Skipped |

**Missing dependencies with no fallback:**
- none that block planning. Executor must `npm install diff@9.0.0` in Wave 0.

**Missing dependencies with fallback:**
- Context7 MCP/CLI — tarball README / types used instead.

Step 2.6: audited. No Docker/DB/Redis.

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^5.0.0` (Node environment) |
| Config file | `vitest.config.ts` [VERIFIED: vitest.config.ts:1-9] quote: `include: ['src/**/*.test.ts']` / `environment: 'node'` |
| Quick run command | `npx vitest run src/lib/diff.test.ts src/data/tools.test.ts src/components/tools/ToolIsland.test.ts src/i18n/errors.test.ts -x` |
| Full suite command | `npm test` (`vitest run`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DIFF-01 | Two string inputs reach `diffText` | unit | `npx vitest run src/lib/diff.test.ts -t "one empty" -x` | ❌ Wave 0 |
| DIFF-02 | One row per line (`kind` add/del/eq); two consecutive adds → two rows | unit | `npx vitest run src/lib/diff.test.ts -t "one row per line" -x` | ❌ Wave 0 |
| DIFF-03 | Trim equality; internal spaces still differ | unit | `npx vitest run src/lib/diff.test.ts -t "ignoreWhitespace" -x` | ❌ Wave 0 |
| DIFF-04 | `added`/`removed` count lines not hunks | unit | `npx vitest run src/lib/diff.test.ts -t "counts added" -x` | ❌ Wave 0 |
| DIFF-05 | Identical non-empty → `identical: true`, added=0, removed=0 | unit | `npx vitest run src/lib/diff.test.ts -t "identical" -x` | ❌ Wave 0 |
| DIFF-06 | Island calls `isTooLarge` per pane; lib is not the cap | unit + source-read | `npx vitest run src/lib/diff.test.ts src/components/tools/ToolIsland.test.ts -x` plus assert island source contains `isTooLarge(original)` and `isTooLarge(changed)` | ❌ Wave 0 (island source-read in `diff.test.ts`) |
| CAT-01 | `TOOLS` length 16, featured 6, slug `text-diff`, category Text, `featured: false` | unit | `npx vitest run src/data/tools.test.ts -x` | ✅ exists; bump 15→16 |
| CAT-02 | EN+ZH markdown `existsSync` | unit | `npx vitest run src/data/tools.test.ts -t "markdown" -x` | ✅ harness; files ❌ Wave 0 |
| CAT-03 | `slug === 'text-diff'` in ToolIsland | unit | `npx vitest run src/components/tools/ToolIsland.test.ts -x` | ✅ harness |
| CAT-04 | only `src/lib/diff.ts` imports `'diff'`; JsonFormatter chunk clean | unit + build grep | source-read in `diff.test.ts`; `npm run build` then grep identifiers | ❌ Wave 0 |
| CAT-05 | first ten `relatedSlugs` unchanged | unit / git | compare first ten rows to HEAD | planner step |
| CAT-06 | chrome keys on en+zh; live `useMemo`; Copy via ToolShell | unit + human | `npx vitest run src/i18n/errors.test.ts -t "text-diff" -x` | ❌ Wave 0 append |
| Idle | both empty / both whitespace → `{ ok:false, error:'' }` | unit | `npx vitest run src/lib/diff.test.ts -t "empty" -x` | ❌ Wave 0 |
| Partial | original only → all `del`; changed only → all `add` | unit | `npx vitest run src/lib/diff.test.ts -t "one empty" -x` | ❌ Wave 0 |

Human-only (no jsdom/tsx island tests on HEAD): two-pane layout at 720px, add/delete CSS colors, Copy clipboard, ZH chrome. Same class as Phase 3 UAT.

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/diff.test.ts src/data/tools.test.ts src/components/tools/ToolIsland.test.ts -x`
- **Per wave merge:** `npm test`
- **Phase gate:** `npm test && npm run build` then JsonFormatter chunk grep; full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/lib/diff.ts` — wrapper
- [ ] `src/lib/diff.test.ts` — idle / one-empty / ignore-ws internal-spaces / identical / one-row-per-line / isolation / FAQ local-only lock
- [ ] `src/i18n/errors.test.ts` — append `text-diff` chrome-key describe (mirror sql-formatter describe)
- [ ] `src/data/tools.test.ts` — `toHaveLength(15)` → `16`
- [ ] Framework install: `npm install diff@9.0.0` — package not in `package.json` yet
- [ ] `src/content/tools/text-diff.md` and `src/content/tools/zh/text-diff.md`

Existing infrastructure (`vitest.config.ts`, `npm test`, completeness loops) covers CAT-01..03 once files land. No new test runner.

## Security Domain

> `workflow.security_enforcement` is `true` (ASVS level 1).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Static catalog; no accounts |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | No authz |
| V5 Input Validation | yes | `isTooLarge` per pane (`INPUT_MAX_CHARS` 100_000); lib never `eval`s; user text rendered as Preact text children |
| V6 Cryptography | no | No hashes/secrets this phase |

### Known Threat Patterns for Astro + Preact in-browser diff

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via diff HTML | Tampering | CSS `class` + text children. Never `innerHTML` / `dangerouslySetInnerHTML` / `convertChangesToXML` |
| ReDoS / memory bomb in `parsePatch` | Denial of Service | Do not import `parsePatch` / patch APIs (fixed in 8.0.3 anyway). Size-cap each pane at 100_000 chars before `diffLines` |
| Data exfiltration | Information Disclosure | No `fetch`, no API route, no localStorage. FAQ states nothing is uploaded |
| Prototype pollution via options | Tampering | Pass a fresh `{ ignoreWhitespace, oneChangePerToken: true }` object; do not spread user JSON into options |
| Supply-chain postinstall | Tampering | `diff@9.0.0` has no `scripts.postinstall` and no runtime deps |

## Sources

### Primary (HIGH confidence)

- Unpacked npm tarball `diff-9.0.0.tgz` — `README.md` (diffLines, ignoreWhitespace, Change objects, oneChangePerToken, createTwoFilesPatch), `libesm/index.d.ts`, `libesm/diff/line.d.ts`, `libesm/types.d.ts`, `libesm/diff/line.js`, `libesm/package.json` (`sideEffects: false`), `package.json`, `release-notes.md`, `LICENSE`
- Node 22 probe of unpacked `libesm/index.js` — empty/identical/ignore-ws/coalesce/CRLF
- esbuild 0.28.2 minify sizes + surviving identifiers
- In-repo HEAD: `src/lib/json.ts`, `src/lib/limits.ts`, `src/lib/sql.ts`, `src/lib/sql.test.ts`, `src/data/tools.ts`, `src/data/tools.test.ts`, `src/components/tools/WordCounter.tsx`, `src/components/tools/SqlFormatter.tsx`, `src/components/tools/PasswordGenerator.tsx`, `src/components/tools/JsonFormatter.tsx`, `src/components/tools/ToolIsland.astro`, `src/components/tools/ToolIsland.test.ts`, `src/components/ToolShell.tsx`, `src/i18n/ui.ts`, `src/i18n/errors.ts`, `src/content.config.ts`, `package.json`, `vitest.config.ts`
- `.planning/phases/04-text-diff/04-CONTEXT.md`, `04-UI-SPEC.md`, `.planning/REQUIREMENTS.md`, `.planning/config.json`
- `npm view diff` + `https://api.npmjs.org/downloads/point/last-week/diff`

### Secondary (MEDIUM confidence)

- Phase 3 `03-RESEARCH.md` / `03-VERIFICATION.md` — CAT-04 process, clone-target discipline, dirty-tree build break (`../i18n/path`)
- `.planning/codebase/CONVENTIONS.md` — 8-file checklist, island split

### Tertiary (LOW confidence)

- `gsd_run query package-legitimacy check --ecosystem npm diff` → `SUS` with null signals (lookup failure; contradicted by npm view + tarball)
- `gsd_run query classify-confidence --provider webfetch --verified` → `LOW` (seam; tarball Reads still used as source-of-truth)
- Context7 MCP/CLI unavailable this session (`ctx7 not found`; no MCP tools)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — tarball + npm view + weekly downloads + esbuild sizes
- Architecture: HIGH — locked CONTEXT/UI-SPEC + HEAD clone targets + Phase 3 island-split
- Pitfalls: HIGH — Node probe of empty/`[]`, coalescing, trim-vs-collapse, minify-surviving identifiers

**Research date:** 2026-09-13
**Valid until:** 2026-10-13 (diff 9.x is stable; re-check if `diff` latest moves)

## Planner notes (non-negotiable)

1. Install `diff@9.0.0`. Import `{ diffLines } from 'diff'` only in `src/lib/diff.ts`.
2. UI-SPEC is approved — copy, order, colors, checkbox name, copy-payload shape are locked.
3. CAT-04 grep identifiers: `oneChangePerToken`, `newlineIsToken`, `stripTrailingCr`, `ignoreNewlineAtEof`, `createTwoFilesPatch`.
4. Clone HEAD islands; do not touch dirty `useToolUi` / `ToolShell` locale / `src/pages` i18n refactor.
5. Do not commit unrelated dirty files. Do not pop `stash@{0}`.
6. Completeness: `existsSync(URL)` already in `tools.test.ts`; ToolIsland `includes(\`slug === '${slug}'\`)`; pass `locale={locale}` on the new branch.
