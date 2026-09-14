# Phase 2: Light text and generate tools - Research

**Researched:** 2026-09-11
**Domain:** Astro 7 + Preact zero-dep catalog tools (word-counter, case-converter, lorem-ipsum, password-generator)
**Confidence:** HIGH (in-repo seams + locked CONTEXT); MEDIUM (Segmenter fallback tokenization; lorem corpus size)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Slicing
- Four sequential vertical slices: word-counter → case-converter → lorem-ipsum → password-generator; each must keep Phase 1 completeness tests green before the next
- Clone JsonFormatter + `src/lib/json.ts` as the template (has a lib). Do not clone UuidGenerator
- Categories: word-counter and case-converter → Text; lorem-ipsum and password-generator → Generate
- All four `featured: false` (featured set stays six)

### Counter and Case/Slug
- Word count via `Intl.Segmenter` `granularity: 'word'` when available; fallback: whitespace split plus each CJK ideograph counts as one word
- Sentences split on `. ? !` and fullwidth `。？！`
- Title Case: Unicode-aware first letter of whitespace-separated words; no acronym exception table
- Slug: keep CJK letters; NFKD strip Latin diacritics; strip punctuation; collapse hyphens. No pinyin. Han must not become empty

### Lorem and Password
- Embed a classic Latin word list in `src/lib/lorem.ts`; no `fetch`, no npm lorem package
- “By words” = N space-separated words ending with a period
- Password defaults: lowercase, uppercase, digits, symbols all on; exclude-similar off
- Symbol set: `!@#$%^&*-_=+` (URL/copy-safe). CSPRNG: `crypto.getRandomValues` + rejection sampling. Empty charset errors. Length 8–128, default 16

### UI and wiring
- Case converter: Color Converter-style multi-row outputs with per-row copy (UPPER, lower, Title, camel, Pascal, snake, kebab, CONSTANT, slug)
- Counter: metric tiles (words, chars ± spaces, lines, sentences, paragraphs) plus textarea — not a single ToolShell `<pre>` dump
- New tools interlink via `relatedSlugs`; do not rewrite existing ten tools' related lists
- Every English lib error gets a `ZH_ERRORS` entry in the same slice

### Claude's Discretion
Exact Segmenter fallback implementation, lorem corpus size, password regenerate button placement, metric-tile CSS using existing global classes, FAQ copy wording.

### Deferred Ideas (OUT OF SCOPE)
- Sentence case / line-by-line convert (CASE-05/06 v2)
- Entropy-bits hint (PASS-07 v2)
- Reading time / UTF-8 bytes (COUNT-05/06 v2)
- `<p>` wrap for lorem (LORM-06 v2)
- Rewiring old tools' relatedSlugs
- SQL / Diff / Markdown / QR (later phases)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COUNT-01 | Word count, chars with spaces, chars without spaces, line count | `countText` in `src/lib/counter.ts` returns those four metrics. Chars use JS `string.length` (same unit as `INPUT_MAX_CHARS`). Lines: empty → 0; else split on `\r\n\|\n\|\r`. |
| COUNT-02 | Sentence and paragraph counts | Sentences: split on `. ? !` and `。？！`. Paragraphs: non-empty blocks split on blank lines (`\n\s*\n`). |
| COUNT-03 | CJK counted with Unicode segmentation | Primary: `Intl.Segmenter` `{ granularity: 'word' }` + `isWordLike`. Fallback: whitespace tokens; each `\p{Script=Han}` is one word. |
| COUNT-04 | Counts update live as the user types | Island `useMemo` over textarea `onInput`, same as JsonFormatter. Size guard `isTooLarge` first. |
| CASE-01 | Fan-out UPPER, lower, Title, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE | `convertCases` in `src/lib/cases.ts`. Title = Unicode first code point of whitespace-separated words. Identifier cases tokenize on whitespace / `[_-]+` / punctuation. |
| CASE-02 | URL slug (lowercase kebab, strip punctuation/marks, collapse repeat hyphens) | `slugify`: `normalize('NFKD')`, strip `\p{M}`, keep `\p{Letter}\p{Number}` (Han included), hyphenate the rest, collapse/trim hyphens. |
| CASE-03 | CJK letters preserved in slug (Han must not collapse to empty) | Never filter with `[a-z0-9]`. Test `'你好世界'` slug is non-empty and contains those letters. |
| CASE-04 | Copy each output row | Island children: nine labeled rows + per-row `navigator.clipboard.writeText`. Also pass newline-joined dump to `ToolShell` for copy-all (ColorConverter analog). |
| LORM-01 | Dummy text from a local corpus (no network fetch) | `WORDS` const array in `src/lib/lorem.ts`. No `fetch`, no npm package. |
| LORM-02 | Generate by paragraphs or by words | `generateLorem({ mode: 'words' \| 'paragraphs', count, classic })`. Words mode: N space-separated words + period. |
| LORM-03 | Toggle classic "Lorem ipsum dolor sit amet" opening | When `classic`, prefix those five words (then continue from corpus). |
| LORM-04 | Copy the result | `ToolShell` output + existing Copy button. |
| LORM-05 | Body is Latin dummy text; chrome/labels are EN+ZH | Lib emits Latin only. `ui.ts` `tools['lorem-ipsum']` holds EN+ZH chrome. |
| PASS-01 | Length 8–128 (default 16) and generate | `generatePassword`. Out-of-range → English error. Default length 16. |
| PASS-02 | Toggle lowercase, uppercase, digits, symbols | Charsets concatenated from toggles. Symbols exactly `!@#$%^&*-_=+`. |
| PASS-03 | Exclude similar (i/l/1/O/0) | Strip those five code points from the charset when the toggle is on. |
| PASS-04 | `crypto.getRandomValues` + rejection sampling (not `Math.random`, not biased modulo) | `randomIndex` below. Vitest source-read: file contains `getRandomValues`, does not contain `Math.random`. |
| PASS-05 | Copy and regenerate | `ToolShell` copy; Generate button in children (Uuid-style click, JsonFormatter-style lib). |
| PASS-06 | Empty charset shows an error instead of generating | `{ ok: false, error: 'Select at least one character set' }` + `ZH_ERRORS` in the same slice. |
| CAT-01..06 | Phase 1 completeness stays green | Per-slice bump `toHaveLength(10)` → 11/12/13/14; `featured: false`; EN+ZH md; `slug ===` branch; no `src/lib/index.ts`; no rewrite of existing ten `relatedSlugs`. |
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
- GSD: do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it (this research file is the GSD research artifact).

## Summary

Phase 2 is the first **product** slice on the Phase 1 additive contract. Ship four zero-dependency tools at 8-file parity: `word-counter` and `case-converter` in category `Text`; `lorem-ipsum` and `password-generator` in category `Generate`. Every row is `featured: false` so `getFeaturedTools()` stays length 6. Each slice clones `src/lib/json.ts` + `JsonFormatter.tsx` (result union, English errors, `useMemo`, `isTooLarge`, `useToolUi`). Do **not** clone `UuidGenerator.tsx` (no lib, logic in the island, no colocated test).

Case-converter UI fans out like Color Converter (nine labeled rows, per-row copy) rather than a single formatted string. Word-counter shows metric tiles plus a textarea — not metrics-only in `ToolShell`'s `<pre>`. Password generation is CSPRNG: `crypto.getRandomValues` with rejection sampling; `Math.random` and biased `x % n` are forbidden. Lorem uses an embedded Latin word list — no `fetch`, no npm.

**Primary recommendation:** Four sequential 8-file slices (word-counter → case-converter → lorem-ipsum → password-generator). Per slice: catalog row + lib/test + island + `ToolIsland.astro` static import/`slug ===` branch + EN/ZH `ui.ts` + `ZH_ERRORS` + EN/ZH markdown. Bump `expect(TOOLS).toHaveLength(10)` by +1 each slice. Zero new npm packages.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Catalog row, slug, category, `relatedSlugs`, `featured: false` | API / Backend (static `TOOLS`) | CDN / Static (`getStaticPaths`) | `TOOLS` is the routing source of truth. Markdown is SEO only. |
| Word/case/lorem/password algorithms | Browser / Client (`src/lib/*.ts` hydrated in island) | API / Backend (Vitest Node) | Privacy model: compute in the visitor's browser. Tests run the same modules in Node 22. |
| Live island UI, copy, size guard | Browser / Client (Preact island + `ToolShell`) | — | `isTooLarge` in the island, not the parser. |
| CJK word segmentation | Browser / Client (`Intl.Segmenter`) | API / Backend (Node `Intl.Segmenter` in Vitest) | Feature-detect; fallback is also in `src/lib/counter.ts`. |
| Password CSPRNG | Browser / Client (`crypto.getRandomValues`) | API / Backend (Node `crypto.getRandomValues` in Vitest) | Web Crypto is available in this Node 22. Do not use `Math.random`. |
| EN+ZH chrome and FAQ | CDN / Static (`ui.ts` + content collections) | Browser / Client (`localizeError`) | Lib errors stay English; island maps via `ZH_ERRORS`. |
| Completeness harness | API / Backend (Vitest source-read / existsSync) | Frontend Server (SSG blank panel if branch missing) | Phase 1 tests must stay green as the catalog grows. |

## Standard Stack

This phase installs **zero** packages. Use the repo as it is.

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | `^7.3.2` | SSG, `getStaticPaths` from `TOOLS`, content collections | Already the app. `[VERIFIED: package.json:14]` quote: `"astro": "^7.3.2"` |
| Preact | `^10.29.8` | Tool islands | Already the island runtime. `[VERIFIED: package.json:15]` quote: `"preact": "^10.29.8"` |
| `@astrojs/preact` | `^6.0.5` | `client:load` | Already wired. `[VERIFIED: package.json:12]` quote: `"@astrojs/preact": "^6.0.5"` |
| Vitest | `^5.0.0` | Colocated `src/**/*.test.ts`, Node env | `npm test` → `vitest run`. `[VERIFIED: package.json:9,19]` quotes: `"test": "vitest run"` / `"vitest": "^5.0.0"` |
| TypeScript | `^7.0.2` | Strict Astro tsconfig | `[VERIFIED: package.json:18]` quote: `"typescript": "^7.0.2"` |
| Web Crypto `crypto.getRandomValues` | Platform (Node 22.22.2 probed) | Password CSPRNG | MDN: cryptographically strong; `Math.random` is the non-crypto counterpart. `[CITED: Context7 /mdn/content getRandomValues]` |
| `Intl.Segmenter` | Platform (Node 22.22.2 `typeof Intl.Segmenter === 'function'`) | Word count | MDN: `granularity: "word"` + `isWordLike`. `[CITED: Context7 /mdn/content Intl.Segmenter]` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `node:fs` `existsSync` | Node built-in | Completeness markdown asserts | Already used in `src/data/tools.test.ts`. Do not add memfs. |
| `String.prototype.normalize('NFKD')` | Language built-in | Strip Latin diacritics for slugs | Locked. `[CITED: Context7 /mdn/content String.prototype.normalize]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Embedded `WORDS` in `src/lib/lorem.ts` | npm `lorem-ipsum` | Forbidden. Extra dep + network-looking API. **Do not install.** |
| `crypto.getRandomValues` + rejection sampling | `Math.random`, `crypto.randomUUID`, biased `%` | UUID is the wrong alphabet; `Math.random` is not CSPRNG; `%` without rejection is biased. **Locked: rejection sampling.** |
| `Intl.Segmenter` | npm `word-count` / grapheme libs | Extra dep. Segmenter is on Node 22 and modern browsers. Fallback is 20 lines. |
| Clone `UuidGenerator.tsx` | Clone `JsonFormatter.tsx` | Uuid has no lib and no tests. **Locked: clone JsonFormatter.** |
| Pinyin slug | Keep Han | Locked: no pinyin; Han must not become empty. |

**Installation:** none.

```bash
# No npm install this phase.
npm test
```

**Version verification:** `package.json` read this session. No new registry packages.

## Package Legitimacy Audit

No external packages are installed this phase.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| — | — | — | — | — | — | none |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```text
Visitor (EN /zh/)
    │
    ▼
Astro SSG  src/pages/tools/[slug].astro
    │  getStaticPaths() ← TOOLS
    │  toolPages collection (SEO / howTo / faq)
    ▼
ToolIsland.astro
    │  static import + {slug === 'word-counter' && <WordCounter client:load />}
    ▼
Preact island
    │  isTooLarge(input)? → tooLarge copy
    │  else lib(input) → { ok:true } | { ok:false, error }
    │  err() localizes English error via ZH_ERRORS
    ▼
ToolShell (chrome, error alert, Copy)
    + children: textarea / toggles / metric tiles / per-row copy
    │
    ▼
src/lib/counter.ts | cases.ts | lorem.ts | password.ts
    │  browser-local; no fetch; no API route
    ▼
Vitest (Node 22): colocated *.test.ts
    + tools.test.ts length snapshot + featured === 6
    + ToolIsland.test.ts source-read slug === branch
```

### Recommended Project Structure

```
src/lib/counter.ts                 # COUNT metrics + Segmenter/fallback
src/lib/counter.test.ts
src/lib/cases.ts                   # CASE fan-out + slugify
src/lib/cases.test.ts
src/lib/lorem.ts                   # embedded WORDS + generateLorem
src/lib/lorem.test.ts
src/lib/password.ts                # CSPRNG generatePassword
src/lib/password.test.ts
src/components/tools/WordCounter.tsx
src/components/tools/CaseConverter.tsx
src/components/tools/LoremIpsum.tsx
src/components/tools/PasswordGenerator.tsx
src/components/tools/ToolIsland.astro   # +4 static imports and slug === branches
src/data/tools.ts                       # +4 rows, featured: false; do not edit existing relatedSlugs
src/i18n/ui.ts                          # en+zh tools[slug]
src/i18n/errors.ts                      # ZH_ERRORS in the same slice
src/content/tools/{slug}.md
src/content/tools/zh/{slug}.md
src/data/tools.test.ts                  # bump toHaveLength per slice
# DO NOT CREATE src/lib/index.ts
```

### Pattern 1: JsonFormatter island + lib (clone this)

**What:** Discriminated result union in `src/lib`; island `useState` + `useMemo` + `isTooLarge` + `useToolUi` + `ToolShell`.
**When to use:** Every Phase 2 tool.
**Example:**

```typescript
// Source: src/lib/json.ts:1-13 [VERIFIED]
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

```tsx
// Source: src/components/tools/JsonFormatter.tsx:1-33 [VERIFIED]
import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { formatJson } from '../../lib/json';
import { isTooLarge } from '../../lib/limits';
import type { Locale } from '../../i18n/locales';
import { useToolUi } from '../../i18n/useToolUi';

export default function JsonFormatter({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const { copy, tooLarge, err } = useToolUi(locale);
  const labels = copy.tools['json-formatter'];
  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: tooLarge, output: '' };
    }
    const r = formatJson(input);
    return { error: r.ok ? null : err(r.error || null), output: r.ok ? r.formatted : '' };
  }, [input, tooLarge, err]);

  return (
    <ToolShell error={result.error} output={result.output} locale={locale}>
      <label>
        {labels.json}
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

Empty-input contract for **parsers** (case, invalid password options): `{ ok: false, error: '' }`. Counter may return `{ ok: true, ...zeros }` for empty text so tiles show 0. Lorem/password are generators (button/options), not empty-paste parsers.

### Pattern 2: ColorConverter fan-out (case-converter UI)

**What:** Multiple labeled fields in `ToolShell` children; a joined dump still goes to `ToolShell` output for copy-all.
**When to use:** `case-converter` nine rows with per-row copy.
**Do not** change `ToolShell.tsx` (would rewrite the existing ten). Add per-row copy buttons in children; pass newline-joined values as `output`.

ColorConverter today joins into one string `[VERIFIED: src/components/tools/ColorConverter.tsx:8-11]`:

```typescript
function formatColor(r: Extract<ColorResult, { ok: true }>): string {
  const { hex, rgb, hsl } = r.value;
  return `${hex}\nrgb(${rgb.r}, ${rgb.g}, ${rgb.b})\nhsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}
```

Case-converter extends that: one row per CASE-01/02 label (`UPPER`, `lower`, `Title`, `camel`, `Pascal`, `snake`, `kebab`, `CONSTANT`, `slug`), each with its own Copy using `navigator.clipboard.writeText` (same API as `ToolShell` `[VERIFIED: src/components/ToolShell.tsx:15-17]` quote: `await navigator.clipboard.writeText(props.output);`).

### Pattern 3: 8-file slice + ToolIsland static branch

**What:** CONVENTIONS checklist. Light tools stay static imports because Astro forbids `client:*` on dynamic tags.
**When to use:** Each of the four slices.

Catalog types `[VERIFIED: src/data/tools.ts:1-17]`:

```typescript
export type ToolCategory =
  | 'Format'
  | 'Auth'
  | 'Encode'
  | 'Generate'
  | 'Text'
  | 'Time'
  | 'Color';

export interface Tool {
  slug: string;
  name: string;
  category: ToolCategory;
  shortDescription: string;
  relatedSlugs: string[];
  featured: boolean;
}
```

`ToolIsland.astro` branch shape `[VERIFIED: src/components/tools/ToolIsland.astro:17-26]`:

```
{slug === 'json-formatter' && <JsonFormatter client:load locale={locale} />}
{slug === 'color-converter' && <ColorConverter client:load locale={locale} />}
```

Coverage test `[VERIFIED: src/components/tools/ToolIsland.test.ts:10-16]`:

```typescript
it('maps every catalog slug to a slug === branch', () => {
  for (const { slug } of TOOLS) {
    expect(
      source.includes(`slug === '${slug}'`),
      `missing ToolIsland branch for ${slug}`,
    ).toBe(true);
  }
});
```

Content schema `[VERIFIED: src/content.config.ts:15-29]`:

```typescript
locale: z.enum(['en', 'zh']),
title: z.string(),
description: z.string(),
intro: z.string(),
howTo: z.tuple([z.string(), z.string(), z.string()]),
faq: z
  .array(
    z.object({
      question: z.string(),
      answer: z.string(),
    }),
  )
  .min(3)
  .max(5),
```

Build throws `[VERIFIED: src/pages/tools/[slug].astro:25]` quote: `throw new Error(\`Missing content for ${slug}\`);` and `[VERIFIED: src/pages/zh/tools/[slug].astro:25]` quote: `throw new Error(\`Missing zh content for ${slug}\`);`.

### Pattern 4: i18n copy + ZH_ERRORS in the same slice

`ui.ts` tool entry shape `[VERIFIED: src/i18n/ui.ts:64-69]` (EN `json-formatter`):

```typescript
'json-formatter': {
  name: 'JSON Formatter / Validator',
  shortDescription: 'Format and validate JSON in your browser.',
  json: 'JSON',
},
```

Mirror under `ui.zh.tools` in the same commit. `useToolUi` `[VERIFIED: src/i18n/useToolUi.ts:5-11]`:

```typescript
export function useToolUi(locale: Locale) {
  const copy = t(locale);
  return {
    copy,
    tooLarge: copy.tooLarge,
    err: (error: string | null) => localizeError(locale, error),
  };
}
```

`ZH_ERRORS` `[VERIFIED: src/i18n/errors.ts:4-14]`:

```typescript
const ZH_ERRORS: Record<string, string> = {
  'Invalid JSON': '无效的 JSON',
  'Not a JWT': '不是有效的 JWT',
  'Invalid Base64': '无效的 Base64',
  'Invalid URL encoding': '无效的 URL 编码',
  'Invalid regular expression': '无效的正则表达式',
  'Invalid timestamp': '无效的时间戳',
  'Only five-field cron expressions are supported.': '仅支持五段 cron 表达式。',
  'Invalid cron field': '无效的 cron 字段',
  'Invalid color': '无效的颜色',
};
```

Add new English keys in the same slice they are introduced. Size-guard copy is already localized via `tooLarge` (`'Input too large to process in the browser.'` / `'输入过大，无法在浏览器中处理。'`).

### Anti-Patterns to Avoid

- **Clone UuidGenerator:** `[VERIFIED: src/components/tools/UuidGenerator.tsx:1-21]` — no `src/lib` import, `crypto.randomUUID()` in the island, no colocated test. Password must not live in the `.tsx`.
- **`src/lib/index.ts` barrel:** CONVENTIONS: import the concrete file. Heavy-chunk isolation in later phases depends on this.
- **`Math.random` or `x % charset.length` without rejection:** biased / non-CSPRNG. PASS-04 fails.
- **Slug via `[a-z0-9-]`:** Han collapses to empty. CASE-03 fails.
- **Word count via `split(/\s+/)` only:** Chinese paragraph becomes 1 word. COUNT-03 fails.
- **Rewriting existing ten `relatedSlugs`:** CAT-05 / CONTEXT locked.
- **`featured: true` on new rows:** `getFeaturedTools()` length 6 must stay green `[VERIFIED: src/data/tools.test.ts:20-23]`.
- **Leaving `toHaveLength(10)` after adding a row:** completeness snapshot `[VERIFIED: src/data/tools.test.ts:12-14]`.
- **Component `.tsx` tests:** Vitest `include` is `src/**/*.test.ts` only `[VERIFIED: vitest.config.ts:5-6]`.
- **npm lorem / fetch corpus / pinyin / sentence-case / entropy hint:** deferred or forbidden.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSPRNG index into charset | `Math.random()`, `crypto.randomUUID()`, `byte % n` | `crypto.getRandomValues` + rejection sampling (algorithm below) | UUID alphabet is wrong; modulo bias when `256 % n !== 0`; `Math.random` is not crypto. |
| Word boundaries | `split(' ')` / npm segmenter | `Intl.Segmenter` `{ granularity: 'word' }` + `isWordLike`; named fallback export | MDN: filter non-words with `isWordLike`. |
| Latin dummy text | npm `lorem-ipsum`, `fetch('/lorem.txt')` | `const WORDS = [...]` in `src/lib/lorem.ts` | Zero-dep + no network. Tests stay deterministic with round-robin. |
| Diacritic stripping | Hand-rolled accent maps | `input.normalize('NFKD').replace(/\p{M}+/gu, '')` | Unicode combining marks, not a Latin-1 table. |
| Copy button | New clipboard helper package | `navigator.clipboard.writeText` already in `ToolShell` | Match existing UX. |
| Size cap | New byte-cap | `isTooLarge` / `INPUT_MAX_CHARS` (`100_000`) | `INPUT_MAX_BYTES` is Phase 6. |

**Key insight:** These four tools are “light” because the platform already has Segmenter, NFKD, and Web Crypto. Adding packages would fight the island-split rule Phase 3 will rely on.

## CSPRNG rejection sampling algorithm

Use this exact method in `src/lib/password.ts`. Charset length this tool can produce is ≤ 74 (26+26+10+12), so a `Uint8Array` (0–255) is enough.

```typescript
// Planner/executor: copy this. Do not use Math.random. Do not use `x % n` without the limit check.
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*-_=+'; // locked
const SIMILAR = new Set(['i', 'l', '1', 'O', '0']);

function randomIndex(n: number): number {
  if (n <= 0 || n > 256) {
    throw new Error('charset length out of range'); // internal; UI never hits this if empty-charset is handled first
  }
  const max = 256;
  const limit = max - (max % n); // largest multiple of n that is <= 256
  const buf = new Uint8Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    const x = buf[0];
    if (x < limit) return x % n; // unbiased: rejected region is the biased tail
  }
}

export type PasswordResult =
  | { ok: true; password: string }
  | { ok: false; error: string };

export function generatePassword(opts: {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
}): PasswordResult {
  if (opts.length < 8 || opts.length > 128) {
    return { ok: false, error: 'Length must be between 8 and 128' };
  }
  let charset = '';
  if (opts.lower) charset += LOWER;
  if (opts.upper) charset += UPPER;
  if (opts.digits) charset += DIGITS;
  if (opts.symbols) charset += SYMBOLS;
  if (opts.excludeSimilar) {
    charset = [...charset].filter((c) => !SIMILAR.has(c)).join('');
  }
  if (!charset) return { ok: false, error: 'Select at least one character set' };
  let out = '';
  for (let i = 0; i < opts.length; i++) {
    out += charset[randomIndex(charset.length)];
  }
  return { ok: true, password: out };
}
```

Why not biased modulo: if `n = 10` (digits only), `256 % 10 = 6`, so values 0–5 appear one extra time when taking `byte % 10` over 0–255. Rejection drops bytes `>= 250`, leaving 25 full cycles of 10.

Do **not** require “one character from each selected class” — that is extra policy, not PASS-01..06, and it complicates the CSPRNG.

Vitest: assert length, charset membership, empty charset, similar exclusion, out-of-range length, and source-read `password.ts` for `getRandomValues` present / `Math.random` absent (same technique as `ToolIsland.test.ts`).

Defaults in the island (not the lib): `length = 16`, all four sets `true`, `excludeSimilar = false`.

Regenerate button (discretion): place a `<button type="button">` in children **above** the toggles, labeled from `ui.ts` (`generate`). Call `generatePassword` on mount (`useEffect`, like UuidGenerator) **and** on click. Changing toggles does not auto-regen (user may have copied). Still a lib call — unlike UuidGenerator.

## Intl.Segmenter fallback

Primary path (MDN / Context7): construct `new Intl.Segmenter(localeTag, { granularity: 'word' })`, iterate `segmenter.segment(text)`, count segments where `isWordLike` is true. Spaces and punctuation are `isWordLike: false`. Japanese/Chinese example counts ideographs as word-like.

Locale tag from island locale `[VERIFIED: src/i18n/locales.ts:8-10]`:

```
en: { htmlLang: 'en', hreflang: 'en', label: 'English', nativeLabel: 'EN' },
zh: { htmlLang: 'zh-Hans', hreflang: 'zh-Hans', label: '中文', nativeLabel: '中文' },
```

Pass `'en'` or `'zh-Hans'` into Segmenter. Lib can take `localeTag: string`.

Feature detect and fallback (discretion — locked behavior, recommended implementation):

```typescript
export function countWords(text: string, localeTag = 'en'): number {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const seg = new Intl.Segmenter(localeTag, { granularity: 'word' });
    let n = 0;
    for (const part of seg.segment(text)) {
      if (part.isWordLike) n += 1;
    }
    return n;
  }
  return countWordsFallback(text);
}

/** Exported so Vitest covers the no-Segmenter path even on Node 22. */
export function countWordsFallback(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  let n = 0;
  for (const token of trimmed.split(/\s+/)) {
    const parts = token.split(/(\p{Script=Han})/u).filter(Boolean);
    for (const p of parts) {
      if (/^\p{Script=Han}$/u.test(p)) n += 1;
      else n += 1; // Latin/other run = one word
    }
  }
  return n;
}
```

Tests (must cover both):

- `'hello world'` → 2 (Segmenter and fallback)
- `'你好世界'` → 4 (each Han ideograph; not 1)
- `'hello 世界'` → 3
- `''` / `'   '` → 0

Other metrics (same module):

| Metric | Rule |
|--------|------|
| charsWithSpaces | `text.length` |
| charsWithoutSpaces | `text.replace(/\s/g, '').length` |
| lines | `text === '' ? 0 : text.split(/\r\n|\n|\r/).length` |
| sentences | count of non-empty pieces split on `/[.?!。？！]+/` after trim; empty → 0 |
| paragraphs | `text.split(/\n\s*\n/).filter((p) => p.trim()).length` |

Empty document: all zeros, `ok: true` (tiles, not idle error).

## Common Pitfalls

### Pitfall 1: Math.random / biased modulo (PASS-04)

**What goes wrong:** Passwords are predictable or some charset indexes are over-represented.
**Why it happens:** Copying tutorial `charset[Math.floor(Math.random() * n)]` or `byte % n`.
**How to avoid:** Only `crypto.getRandomValues` + `x < limit` then `x % n`. Source-read test.
**Warning signs:** `Math.random` in `src/lib/password.ts`; no loop around `getRandomValues`.

### Pitfall 2: CJK slug empty (CASE-03)

**What goes wrong:** `'你好世界'` slugifies to `''`.
**Why it happens:** `[a-z0-9]` or `\W` after lowercasing; Han is not `[a-z]`.
**How to avoid:** Keep `\p{Letter}` (includes Han). NFKD + strip `\p{M}` only for Latin diacritics (`café` → `cafe`). No pinyin.
**Warning signs:** Test `'你好世界'` expects empty or ASCII-only.

### Pitfall 3: Segmenter missing / `split(/\s+/)` only (COUNT-03)

**What goes wrong:** A Chinese paragraph is 1 word. Firefox/older engines without Segmenter throw if you `new Intl.Segmenter` unguarded.
**Why it happens:** Feature not detected; fallback not exported so Vitest on Node 22 never exercises it.
**How to avoid:** `typeof Intl.Segmenter === 'function'` guard; export `countWordsFallback`; test Han on both paths.
**Warning signs:** No `isWordLike`; no fallback function.

### Pitfall 4: TOOLS length snapshot (CAT-01 harness)

**What goes wrong:** Slice adds a catalog row; `it('has exactly 10 tools')` fails.
**Why it happens:** `[VERIFIED: src/data/tools.test.ts:12-14]` quote: `it('has exactly 10 tools', () => { expect(TOOLS).toHaveLength(10); });`
**How to avoid:** Bump +1 **in the same slice** (11, then 12, then 13, then 14). Prefer per-slice so CI stays true.
**Warning signs:** Completeness test red after only editing `tools.ts`.

### Pitfall 5: Featured set of six

**What goes wrong:** Homepage gains extra featured cards.
**Why it happens:** Copy-pasting a `featured: true` row (json-formatter etc. are true).
**How to avoid:** New rows `featured: false`. Keep `[VERIFIED: src/data/tools.test.ts:20-23]` `expect(featured).toHaveLength(6);`.
**Warning signs:** `getFeaturedTools().length !== 6`.

### Pitfall 6: No lib barrel

**What goes wrong:** `src/lib/index.ts` re-exports password + future SQL; json-formatter inherits heavy chunks in Phase 3.
**Why it happens:** “Convenience” barrel. CONVENTIONS forbid it. Glob this session: no `src/lib/index.ts`.
**How to avoid:** `import { countText } from '../../lib/counter'` only.
**Warning signs:** Any `src/lib/index.ts`.

### Pitfall 7: UuidGenerator template

**What goes wrong:** Password/lorem logic in the island; no unit tests; no English error/`ZH_ERRORS`.
**Why it happens:** Uuid looks like a “generate” tool.
**How to avoid:** Clone JsonFormatter. Uuid is only a **placement** hint for the Generate button.
**Warning signs:** Island calls `crypto.getRandomValues` directly; no `src/lib/password.ts`.

### Pitfall 8: ToolIsland missing branch / missing markdown

**What goes wrong:** Blank panel (build still succeeds) or `Missing content for ${slug}` at build.
**How to avoid:** 8-file checklist; `slug === 'word-counter'` string must match the test `includes`.
**Warning signs:** `ToolIsland coverage` red; `astro build` throw.

### Pitfall 9: howTo/faq schema

**What goes wrong:** `astro build` Zod fail.
**Why it happens:** `howTo` is a **tuple of exactly 3**; faq **3–5**.
**How to avoid:** Copy `src/content/tools/json-formatter.md` frontmatter shape (`locale: en`, three howTo bullets, three faq items).

### Pitfall 10: Metric tiles as a `<pre>` dump

**What goes wrong:** COUNT UI is unreadable; CONTEXT forbids single ToolShell dump for metrics.
**Why it happens:** Cloning JsonFormatter output literally.
**How to avoid:** Tiles in children using existing `.card-grid` / `.tool-grid` / `.tool-card` (no new BEM required). Still pass a copyable summary string to `ToolShell` so CAT-06 Copy works.

## Code Examples

### Catalog row (featured false, Text / Generate)

```typescript
// Append to TOOLS. Do not edit existing relatedSlugs.
// Categories [VERIFIED: src/data/tools.ts:1-8] include 'Generate' | 'Text'
{
  slug: 'word-counter',
  name: 'Word Counter',
  category: 'Text',
  shortDescription: 'Count words, characters, lines, sentences, and paragraphs locally.',
  relatedSlugs: ['case-converter', 'regex-tester', 'lorem-ipsum'],
  featured: false,
},
```

Forward `relatedSlugs` to not-yet-shipped Phase 2 tools are OK: `getRelatedTools` filters missing `[VERIFIED: src/data/tools.ts:127-132]`.

### Size guard (do not change)

```typescript
// Source: src/lib/limits.ts:1-7 [VERIFIED]
export const INPUT_MAX_CHARS = 100_000;
export const INPUT_TOO_LARGE_MSG =
  'Input too large to process in the browser.';

export function isTooLarge(input: string): boolean {
  return input.length > INPUT_MAX_CHARS;
}
```

### Slugify (CJK-safe)

```typescript
export function slugify(input: string): string {
  const stripped = input.normalize('NFKD').replace(/\p{M}+/gu, '');
  return stripped
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

### Lorem (deterministic, local)

```typescript
export const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  // ~80–120 classic lipsum tokens total (discretion). No fetch.
] as const;

export function generateLorem(opts: {
  mode: 'words' | 'paragraphs';
  count: number;
  classic: boolean;
}): { ok: true; text: string } | { ok: false; error: string } {
  // words: N space-separated words ending with a period
  // classic: start with "Lorem ipsum dolor sit amet" then continue round-robin
  // paragraphs: groups of ~40–60 words separated by \n\n
  // invalid count → { ok: false, error: 'Enter a count of at least 1' }
}
```

Do not use `Math.random` in lorem (flaky tests). Round-robin from index 0.

### ui.ts keys to add (both `en` and `zh`)

Minimum per tool (plus field labels): `name`, `shortDescription`. Suggested extra keys:

- word-counter: `text`, `words`, `chars`, `charsNoSpaces`, `lines`, `sentences`, `paragraphs`
- case-converter: `text`, plus row labels `upper`, `lower`, `title`, `camel`, `pascal`, `snake`, `kebab`, `constant`, `slug`
- lorem-ipsum: `mode`, `words`, `paragraphs`, `count`, `classic`, `generate`
- password-generator: `length`, `lowercase`, `uppercase`, `digits`, `symbols`, `excludeSimilar`, `generate`

### English lib errors to register in ZH_ERRORS (same slice)

| English (lib) | ZH |
|---------------|----|
| `Select at least one character set` | `请至少选择一种字符集` |
| `Length must be between 8 and 128` | `长度必须在 8 到 128 之间` |
| `Enter a count of at least 1` | `请输入至少为 1 的数量` |

(Counter/case empty states use `error: ''` and need no ZH entry.)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `str.split(/\s+/).length` | `Intl.Segmenter` + `isWordLike` | Intl Segmenter in modern engines / Node 20+ | CJK word count is real |
| `Math.random` passwords | `crypto.getRandomValues` + rejection sampling | Web Crypto | Unbiased CSPRNG |
| npm lorem packages | Embedded word list | This catalog's zero-dep rule | No extra chunk |
| ASCII slug `[a-z0-9]` | `\p{Letter}` after NFKD | Unicode property escapes | Han preserved |

**Deprecated/outdated:**

- Marked `sanitize` option — not this phase (Phase 5).
- `INPUT_MAX_BYTES` — Phase 6 only.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Paragraphs = blocks split on blank lines (`\n\s*\n`) | COUNT-02 | Off-by-one vs “every newline is a paragraph”. Confirm only if user objects; CONTEXT left this to implementation. |
| A2 | Character counts use UTF-16 `string.length` (same as `INPUT_MAX_CHARS`) | COUNT-01 | Grapheme/code-point counts would differ for emoji. COUNT-06 (UTF-8 bytes) is deferred. |
| A3 | Lorem corpus ~80–120 classic words; round-robin, not `Math.random` | LORM | FAQ wording / repetition. Discretion. |
| A4 | Identifier cases (camel/Pascal/snake/kebab/CONSTANT) tokenize on whitespace, `[_-]+`, and punctuation; Title Case stays whitespace-only per lock | CASE-01 | Edge strings like `helloWorld` already camel may not re-split. Acceptable v1. |
| A5 | Password does not force one char from each selected class | PASS | Slightly weaker vs “must include each class”; not in v1 reqs. |
| A6 | Metric tiles reuse `.card-grid` / `.tool-grid` / `.tool-card`; no new CSS module | Counter UI | Visual density. Discretion allows existing global classes. |
| A7 | Suggested ZH strings in the error table | ZH_ERRORS | Wording. Must exist; exact Chinese is discretion. |

## Open Questions

All grey-area items were accepted in autonomous discuss (CONTEXT). Treat as **RESOLVED**:

1. **Keep CJK in slugs?** RESOLVED: yes. No pinyin. Han must not become empty.
2. **Password CSPRNG?** RESOLVED: non-negotiable. `crypto.getRandomValues` + rejection sampling.
3. **Segmenter fallback?** RESOLVED (discretion): whitespace split + each Han ideograph = one word; export `countWordsFallback` for tests.
4. **Lorem corpus size?** RESOLVED (discretion): ~80–120 classic Latin tokens embedded in `src/lib/lorem.ts`.
5. **Regenerate button placement?** RESOLVED (discretion): children, above toggles; generate on mount + click; no auto-regen on toggle change.
6. **Metric-tile CSS?** RESOLVED (discretion): existing `.card-grid` / `.tool-grid` / `.tool-card`.
7. **FAQ wording?** RESOLVED (discretion): match json-formatter privacy FAQ plus tool-specific notes (CJK counting; not a password manager; lorem is dummy Latin; slug keeps Han).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vitest, Astro, `Intl.Segmenter`, `crypto.getRandomValues` | ✓ | v22.22.2 | — |
| npm | `npm test` | ✓ | 11.9.0 | — |
| `Intl.Segmenter` | COUNT-03 | ✓ | `typeof === 'function'` in this Node | `countWordsFallback` |
| `crypto.getRandomValues` | PASS-04 | ✓ | `typeof === 'function'` | none (blocking if missing — not the case here) |
| `crypto.randomUUID` | **Do not use** for passwords | ✓ | — | N/A |
| New npm packages | — | not needed | — | — |
| Playwright | — | out of scope | — | — |

**Missing dependencies with no fallback:** none

**Missing dependencies with fallback:** `Intl.Segmenter` in older browsers — `countWordsFallback`.

**Step 2.6:** probed. No extra CLIs required. Phase is code-only on the existing stack.

## Validation Architecture

`workflow.nyquist_validation` is `true` in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^5.0.0` |
| Config file | `vitest.config.ts` (`include: ['src/**/*.test.ts']`, `environment: 'node'`) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

No coverage script. No jsdom. Do not add `.tsx` tests.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COUNT-01 | words/chars±spaces/lines | unit | `npx vitest run src/lib/counter.test.ts` | ❌ Wave 0 |
| COUNT-02 | sentences + paragraphs | unit | `npx vitest run src/lib/counter.test.ts` | ❌ Wave 0 |
| COUNT-03 | CJK via Segmenter + fallback | unit | `npx vitest run src/lib/counter.test.ts` | ❌ Wave 0 |
| COUNT-04 | live `useMemo` on input | manual-only | island untested (no jsdom / no `*.test.tsx`) | N/A — prove via lib + typecheck |
| CASE-01 | eight identifier cases | unit | `npx vitest run src/lib/cases.test.ts` | ❌ Wave 0 |
| CASE-02 | slug punctuation/hyphens | unit | `npx vitest run src/lib/cases.test.ts` | ❌ Wave 0 |
| CASE-03 | Han slug non-empty | unit | `npx vitest run src/lib/cases.test.ts` | ❌ Wave 0 |
| CASE-04 | per-row copy | manual-only | clipboard in island; lib returns all rows | N/A |
| LORM-01 | local corpus, no fetch | unit | `npx vitest run src/lib/lorem.test.ts` (source-read: no `fetch`) | ❌ Wave 0 |
| LORM-02 | words vs paragraphs | unit | `npx vitest run src/lib/lorem.test.ts` | ❌ Wave 0 |
| LORM-03 | classic opening | unit | `npx vitest run src/lib/lorem.test.ts` | ❌ Wave 0 |
| LORM-04 | copy | manual-only | `ToolShell` already copies | N/A |
| LORM-05 | Latin body | unit | generated text matches `/^[a-zA-Z\s.,]+$/` | ❌ Wave 0 |
| PASS-01 | length 8–128 default 16 | unit | `npx vitest run src/lib/password.test.ts` | ❌ Wave 0 |
| PASS-02 | charset toggles | unit | membership asserts | ❌ Wave 0 |
| PASS-03 | exclude i/l/1/O/0 | unit | generated chars not in similar set | ❌ Wave 0 |
| PASS-04 | CSPRNG rejection sampling | unit + source-read | `getRandomValues` present, `Math.random` absent | ❌ Wave 0 |
| PASS-05 | copy + regenerate | manual-only | button in island | N/A |
| PASS-06 | empty charset error | unit | `{ ok: false, error: 'Select at least one character set' }` | ❌ Wave 0 |
| CAT-01 | unique slugs, featured 6, length snapshot | unit | `npx vitest run src/data/tools.test.ts` | ✅ bump length |
| CAT-02 | EN+ZH markdown exists | unit | same file `existsSync` loop | ✅ |
| CAT-03 | ToolIsland branch per slug | unit | `npx vitest run src/components/tools/ToolIsland.test.ts` | ✅ |
| CAT-05 | existing relatedSlugs untouched | review | diff `src/data/tools.ts` existing objects | ✅ (do not edit) |
| CAT-06 | ZH_ERRORS keys | unit (optional) or review | assert each new English error is a key of `ZH_ERRORS` | ❌ optional Wave 0 `src/i18n/errors.test.ts` — skip unless cheap; planner may grep instead |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** `npm test` green + `npm run build` so content collections Zod-parse the four EN/ZH markdown files

### Wave 0 Gaps

- [ ] `src/lib/counter.test.ts` — COUNT-01..03
- [ ] `src/lib/cases.test.ts` — CASE-01..03
- [ ] `src/lib/lorem.test.ts` — LORM-01..03, LORM-05
- [ ] `src/lib/password.test.ts` — PASS-01..04, PASS-06
- [ ] `src/data/tools.test.ts` — bump `toHaveLength` per slice (file exists)
- [ ] Framework install: none

COUNT-04, CASE-04, LORM-04, PASS-05 are island/chrome behaviors. Existing tools also leave islands untested. Do not add Playwright (CONTEXT / Phase 1 deferred).

## Security Domain

`security_enforcement` is enabled (ASVS level 1).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No accounts |
| V3 Session Management | no | Session-only UI state; no localStorage drafts (out of scope) |
| V4 Access Control | no | Public static site |
| V5 Input Validation | yes | `isTooLarge` / `INPUT_MAX_CHARS = 100_000`; length bounds 8–128; lorem count ≥ 1; do not throw from libs |
| V6 Cryptography | yes | Password: `crypto.getRandomValues` + rejection sampling. Never `Math.random`. Never hand-roll a PRNG. Hash tool already uses `crypto.subtle` — do not reuse `randomUUID` here |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Predictable passwords | Information disclosure / Spoofing | CSPRNG rejection sampling; no `Math.random` |
| Modulo bias shrinking charset | Tampering (weak generator) | Reject `x >= limit` before `% n` |
| Client DoS via huge paste | Denial of service | `isTooLarge` before lib |
| XSS via tool output | Tampering | Output is text in `<pre>`/`<code>` / form values; no `innerHTML`. (Markdown XSS is Phase 5.) |
| Data exfiltration | Information disclosure | No API routes; no `fetch` in lorem; privacy FAQ |
| Empty charset → empty “password” shown as success | Elevation / misleading | PASS-06 error string |
| `crypto.randomUUID` mistaken for password CSPRNG | Information disclosure | Wrong alphabet (`0-9a-f-`); locked against UuidGenerator clone |

Do not log user input. Do not add `console.log` in libs or islands.

## Sources

### Primary (HIGH confidence)

- `src/lib/json.ts`, `src/components/tools/JsonFormatter.tsx`, `src/components/tools/ColorConverter.tsx`, `src/components/tools/UuidGenerator.tsx`, `src/components/ToolShell.tsx` — clone vs anti-clone
- `src/data/tools.ts`, `src/data/tools.test.ts`, `src/components/tools/ToolIsland.astro`, `src/components/tools/ToolIsland.test.ts` — catalog + completeness
- `src/i18n/ui.ts`, `src/i18n/errors.ts`, `src/i18n/useToolUi.ts`, `src/i18n/locales.ts` — copy + ZH
- `src/content.config.ts`, `src/content/tools/json-formatter.md` — markdown schema
- `src/lib/limits.ts`, `vitest.config.ts`, `package.json` — size guard + test runner
- `.planning/codebase/CONVENTIONS.md` — 8-file checklist, no barrel, clone JsonFormatter
- `.planning/phases/02-light-text-and-generate-tools/02-CONTEXT.md` — locked decisions
- `.planning/REQUIREMENTS.md` — COUNT/CASE/LORM/PASS IDs
- `.claude/CLAUDE.md` — project constraints
- Context7 `/mdn/content` — `Intl.Segmenter` `isWordLike`; `crypto.getRandomValues`; `String.prototype.normalize('NFKD')`

### Secondary (MEDIUM confidence)

- Node 22.22.2 probe this session: `Intl.Segmenter` and `crypto.getRandomValues` are functions
- Paragraph-split rule and identifier-case tokenizer (not locked in CONTEXT) — tagged `[ASSUMED]` in the log

### Tertiary (LOW confidence)

- Exact ZH error wording (discretion)
- Lorem corpus length 80–120 (discretion)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new packages; versions from `package.json` this session
- Architecture: HIGH — clone JsonFormatter; 8-file checklist already in CONVENTIONS
- Pitfalls: HIGH — snapshot length, featured 6, CJK slug, Math.random, UuidGenerator, no barrel are all in-repo
- Segmenter fallback details / paragraph definition: MEDIUM — behavior locked, exact tokenizer is discretion

**Research date:** 2026-09-11
**Valid until:** 2026-10-11 (stable APIs; no registry churn)
