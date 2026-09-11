# Stack Research

**Domain:** Browser-local developer utility tools (additive milestone on existing Astro 7 + Preact islands catalog)
**Researched:** 2026-09-11
**Confidence:** MEDIUM (Context7 official docs + `npm view` the same day; bundle-size gzip figures from third-party indexes are not treated as authoritative)

Do not replace the existing app stack. This milestone adds eight tools to Devtoolbox. New packages are allowed only when the algorithm is too large or too unsafe to maintain in `src/lib`. Everything else stays a tested local processor, matching JSON / JWT / hash / cron.

## Recommended Stack

### Core Technologies (locked — do not change)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Astro | `^7.3.2` (existing) | SSG, routing, content collections | Already the site. Islands keep tool JS off marketing pages. |
| Preact | `^10.29.8` + `@astrojs/preact` `^6.0.5` | Tool UI islands | Existing `ToolShell` / `client:load` pattern. Do not add React. |
| TypeScript | `^7.0.2` | `src/lib`, islands, Vitest | Existing strict `astro/tsconfigs/strict`. |
| Vitest | `^5.0.0` | Unit tests for `src/lib/*.ts` | Keep Node environment. New libs chosen so formatters/diff/QR encode test without jsdom. |
| Catalog + content collections | existing | Routing + SEO/FAQ markdown | `src/data/tools.ts` remains source of truth; tool markdown stays SEO-only. |

### New runtime libraries (install these five)

| Library | Version (verified 2026-09-11) | Purpose | Why Recommended |
|---------|-------------------------------|---------|-----------------|
| `marked` | **18.0.12** (`^18.0.12`) | Markdown → HTML | Fast, ESM, bundled types, GFM via `gfm: true`, works in browser and Vitest. ~lighter than `markdown-it`. Official docs: does **not** sanitize; `sanitize` option was removed. |
| `dompurify` | **3.4.15** (`^3.4.15`) | Sanitize marked HTML before `innerHTML` | Marked's own README requires this. Browser-native; bundled types. Default config is the right XSS default. |
| `sql-formatter` | **15.8.2** (`^15.8.2`) | Pretty-print SQL in-browser | Dialect-aware (PostgreSQL, MySQL, SQLite, T-SQL, BigQuery, …). Pure JS. Use `formatDialect` + named dialect imports so unused dialects tree-shake (`sideEffects: false`). |
| `diff` (jsdiff) | **9.0.0** (`^9.0.0`) | Line/word/unified text diff | `diffLines`, `diffWords` (optional `Intl.Segmenter`), `createTwoFilesPatch`. ESM + bundled types. Small enough for an island. |
| `qr` (paulmillr) | **0.7.0** (`^0.7.0`) | QR generate **and** decode | One maintained 0-dep library. Encode: SVG / GIF data-url / raw matrix. Decode: `qr/decode.js` from `ImageData` (file → `createImageBitmap` → canvas). README sizes: ~5.4 KB gzip encode-only, ~11.5 KB encode+decode. Faster than `qrcode` / jsQR on the author's 2026-08 benches. |

### Implement in `src/lib` — do not add a package

| Tool | Module | Why no library |
|------|--------|----------------|
| Case / Slug converter | `src/lib/case.ts` | camel/snake/kebab/title are ~80 tested lines. `change-case@5.4.4` is tiny but does not produce URL slugs or CJK-safe slugs; a second slug lib would still be required. Match existing zero-dep processors. |
| Password generator | `src/lib/password.ts` | `crypto.getRandomValues` + rejection sampling (same Web Crypto family as `hash.ts` / `crypto.randomUUID()`). `generate-password` is stale and not CSPRNG-honest. |
| Word / character counter | `src/lib/count.ts` | `Intl.Segmenter` (`grapheme` + `word`) with a code-point fallback. No credible package beats the platform API for CJK. |
| Lorem ipsum | `src/lib/lorem.ts` | Fixed public-domain word list + paragraph/word counts. `lorem-ipsum@3.0.0` is unnecessary surface area. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest `^5` (existing) | `src/lib/*.test.ts` | Keep `environment: 'node'`. `marked`, `sql-formatter`, `diff`, `qr` encode all run in Node. |
| happy-dom (optional, only if needed) | DOMPurify unit tests | **Do not** add `isomorphic-dompurify` / `jsdom` to production. Prefer: test `marked.parse` in Node; call `DOMPurify.sanitize` only inside the Preact island; skip Node sanitizer tests unless a failure mode appears. |
| `astro build` chunk inspection | Prove heavy islands do not leak | After adding SQL / Markdown / QR, inspect `dist/_astro/` so `sql-formatter` / `marked` / `qr/decode` are **not** on `/tools/json-formatter/`. |

## Per-tool decisions

### 1. Markdown preview — `marked` + `dompurify`

**Use:** `import { marked } from 'marked'` then `DOMPurify.sanitize(marked.parse(src, { gfm: true }))`.

**Why:** Marked 18 is the current compiler (npm `time.modified` 2026-09-07). It is the library Marked's own docs pair with DOMPurify. GFM (tables, strikethrough, autolinks) is what users of a “markdown preview” expect.

**Do not use `markdown-it@15`:** larger plugin core; extra GFM plugins for tables/task lists; it-tools uses it, but we optimize for island weight. markdown-it is safer *by default* when `html: false`, but we still need a sanitizer if we ever allow raw HTML, and Marked+DOMPurify is the documented pair.

**Do not use `isomorphic-dompurify@4.2.0`:** it depends on `jsdom@^30`. That belongs on a server. This site has no server.

**Do not use `sanitize-html`:** pulls `htmlparser2` + `postcss`; Node-oriented.

**UI constraint:** `ToolShell` renders output in `<pre><code>`. Preview HTML must go in a separate `div.markdown-preview` with `innerHTML` of **sanitized** markup (or `dangerouslySetInnerHTML` in Preact). Do not install `github-markdown-css`; add a small preview stylesheet in `global.css` so the island does not pull GitHub's full CSS.

**Confidence:** MEDIUM (Context7 `/markedjs/marked`, `/cure53/dompurify`; `npm view` 18.0.12 / 3.4.15).

### 2. Text Diff — `diff@9`

**Use:** `diffLines` for the default readable view; `createTwoFilesPatch` if we also offer a copy-as-unified-patch action; `ignoreWhitespace` option. Optional later: `diffWords({ intlSegmenter })` for intra-line.

**Why:** Myers/LCS in a maintained ESM package with types. Monaco Diff Editor (it-tools) is ~97 MB unpacked — incompatible with this static catalog.

**Do not use `diff-match-patch`:** last meaningful npm activity years ago; worse API for line-oriented developer diffs.

**Do not write our own LCS.** Easy to get wrong on large inputs; jsdiff is the standard.

**Limits:** keep `isTooLarge` (100k chars). Diff is O(n·d); two 100k buffers can hitch the main thread. Debounce input; do not add a worker this milestone (existing architecture: no workers).

**Confidence:** MEDIUM (Context7 `/kpdecker/jsdiff`; `npm view diff@9.0.0`).

### 3. SQL formatter — `sql-formatter@15` with `formatDialect`

**Use:**

```ts
import { formatDialect, sql, postgresql, mysql, sqlite, transactsql, bigquery } from 'sql-formatter';
```

MVP dialects: Standard SQL, PostgreSQL, MySQL, SQLite, T-SQL, BigQuery. Wrap in `src/lib/sql.ts` returning `{ ok, formatted } | { ok: false, error }` like `formatJson`.

**Why:** This is the library it-tools and most in-browser SQL beautifiers use. Version 15.8.2 (2026-06-21). Official docs: `format(sql, { language })` **bundles every dialect**. `formatDialect` + named imports is the v12+ tree-shake API (`sideEffects: false`).

**Do not use `format()` with a string `language`.** That is the bundle-size footgun.

**Do not use Prettier + `prettier-plugin-sql`:** Prettier is an editor toolchain, not an island.

**Do not use Node CLI formatters (`pg_format`, sqlfluff).** No backend.

**Types:** do **not** install `@types/sql-formatter@4` (stale v4 API). Verify shipped `.d.ts` after install.

**Confidence:** MEDIUM (Context7 `/sql-formatter-org/sql-formatter` language.md + dialect.md; `npm view` 15.8.2).

### 4. Case / Slug — custom `src/lib/case.ts`

**Implement:** `upper`, `lower`, `title`, `camel`, `pascal`, `snake`, `kebab`, `constant`, plus `slug`.

**Slug rules (opinionated):** NFKC; trim; lowercase Latin; whitespace → `-`; collapse repeats; strip punctuation; **keep CJK/letter characters** (GitHub-style unicode slugs). Do **not** add `pinyin-pro` (large, Chinese-only transliteration, wrong default for a bilingual EN/ZH *dev* tool). Do not use `github-slugger` (stateful heading uniqueness we do not need).

**Why not `change-case@5.4.4`:** correct for camel/snake, silent on URL slugs and CJK. One local module is simpler to test and i18n-document than a dep + a custom slug anyway.

**Confidence:** MEDIUM.

### 5. Password generator — custom `src/lib/password.ts`

**Implement:** charset checkboxes (A–Z, a–z, 0–9, symbols, optional “exclude similar `O0Il1`”); length 8–128 (default 16); `crypto.getRandomValues` with **rejection sampling** (`limit = 256 - (256 % charset.length)`) so `byte % len` is unbiased. Guarantee at least one char from each selected set by filling then shuffling with CSPRNG swaps.

**Do not use `Math.random()`, `generate-password`, or `nanoid`.** Nanoid is an ID generator, not a policy password generator. Existing UUID tool already uses Web Crypto.

**Confidence:** MEDIUM (platform Web Crypto; CSPRNG pattern is standard).

### 6. Word / character counter — custom `src/lib/count.ts`

**Implement:** characters (code points via `Array.from`), characters excluding whitespace, graphemes (`Intl.Segmenter` `granularity: 'grapheme'` when present), words (Segmenter `granularity: 'word'` + `isWordLike` when present; otherwise whitespace split), lines, bytes (`TextEncoder`). Optional reading-time at 200 wpm as a derived stat — not a library.

**Why:** CJK has no spaces; `\s+`.split under-counts Chinese. Segmenter is Baseline in current Chromium/Firefox/Safari. Feature-detect and fall back.

**Confidence:** MEDIUM.

### 7. Lorem ipsum — custom `src/lib/lorem.ts`

**Implement:** classic word list, `paragraphs` / `words` counts, optional leading “Lorem ipsum dolor sit amet…”, copy via existing `ToolShell`. Deterministic tests: inject RNG or use a seeded helper; production can use `crypto.getRandomValues` or a simple index walk.

**Do not add `lorem-ipsum@3`.**

**Confidence:** HIGH for “no library needed”; the feature is a word list.

### 8. QR generate + decode — `qr@0.7.0`

**Generate:**

```ts
import encodeQR from 'qr';
const svg = encodeQR(text, 'svg', { ecc: 'medium', scale: 4, border: 2 });
```

PNG download: draw the `raw` boolean matrix (or SVG) onto a canvas and `canvas.toDataURL('image/png')`, or `svgToPng` from `qr/dom.js` **without** importing camera helpers. Prefer canvas-from-matrix in `src/lib` so Vitest can test encode without `qr/dom.js`.

**Decode (file only, no camera):**

```ts
import decodeQR from 'qr/decode.js';
const bitmap = await createImageBitmap(file);
// draw to canvas → ImageData
decodeQR(imageData, { effort: Infinity, timeLimit: Infinity });
```

**Why this over `qrcode` + `jsQR`:** one dependency instead of two; encode+decode ~11.5 KB gzip per the library README; last publish 2026-08-31 vs `qrcode@1.5.4` (2024-08) and `jsQR@1.4.0` (effectively frozen). Decode takes `ImageData`, which matches “selected image file, not camera.”

**Do not import `qr/dom.js` camera (`rearCamera`, `frameLoop`).** Out of scope.

**Do not use `@zxing/browser` + `@zxing/library`:** unpacked sizes 5.8 MB + 11.8 MB; camera-oriented; peer-dep pair. Overkill for file decode.

**Do not use `html5-qrcode`:** camera UI kit, last 2.3.8 in 2023.

**Do not use `qr-code-styling`:** logos/gradients, not a spec tool.

**Do not call a server QR API.** Violates SITE_TAGLINE.

**Confidence:** MEDIUM (`npm view qr@0.7.0` README encode/decode/file path; Context7 had no paulmillr/qr ID, so decode API is from the package README, not Context7).

## Installation

```bash
# New tool engines only — do not add React, jsdom, monaco, or isomorphic-dompurify
npm install marked@^18.0.12 dompurify@^3.4.15 sql-formatter@^15.8.2 diff@^9.0.0 qr@^0.7.0
```

No new `@types/*`. These packages ship types: `marked`, `dompurify`, `diff`, `qr`. After install, confirm `sql-formatter` resolves types; if not, add a local ambient module — never `@types/sql-formatter@4` or `@types/dompurify` / `@types/diff` stubs.

Do not install:

```bash
# NOT these
# markdown-it isomorphic-dompurify sanitize-html github-markdown-css
# monaco-editor diff-match-patch prettier prettier-plugin-sql
# change-case github-slugger pinyin-pro lorem-ipsum generate-password nanoid
# qrcode @types/qrcode jsqr @zxing/browser @zxing/library html5-qrcode qr-code-styling
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `marked` + `dompurify` | `markdown-it` (html off, no sanitizer) | If we forbid raw HTML forever and want markdown-it's default link protocol blocklist without DOMPurify. Still larger. |
| `marked` + `dompurify` | `micromark` + `mdast` + `hast` | Building a custom AST pipeline / MDAST plugins. Too much for a preview island. |
| `diff@9` | Monaco Diff Editor | Full IDE UX. ~97 MB unpacked; kills SSG catalog. |
| `diff@9` | Hand-rolled LCS | Never, except a 20-line char diff toy. |
| `sql-formatter` `formatDialect` | `format()` + `language` | Never in this app — pulls all dialects. |
| `sql-formatter` | Prettier SQL plugin | Editor integrations, not a 10 KB island. |
| Custom case/slug | `change-case@5.4.4` | If we drop URL slug and CJK from the tool. We are not dropping them. |
| Custom password | `generate-password` | Never — stale, not Web Crypto. |
| `qr@0.7` | `qrcode@1.5.4` + `jsQR@1.4.0` | Only if `qr` decode quality fails UAT on real screenshots. Then generate with `qrcode` (has `browser` field / `toDataURL`) and decode with jsQR; still no camera, still no server. |
| `qr@0.7` | `@zxing/library` | Messy camera-style photos as a future “scan” product. Not this milestone. |
| Custom lorem | `lorem-ipsum@3` | If we need many locales of filler. We need Latin placeholder only. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| React / Vue islands | Second runtime next to Preact | Preact + existing `ToolShell` |
| New API routes / serverless QR or SQL | Breaks “Nothing is uploaded.” | `src/lib` only |
| `isomorphic-dompurify` + jsdom | jsdom in the client (or a fake server) | `dompurify` in the island |
| Marked `{ sanitize: true }` | Option **removed** in current Marked | DOMPurify on the HTML string |
| `markdown-it` + highlight.js | Highlight.js is huge; not needed for preview | marked + existing CSS |
| `monaco-editor` | Unpacked ~97 MB | `diff` + simple CSS |
| `sql-formatter` `format()` | Bundles every dialect | `formatDialect` + named dialects |
| `@types/sql-formatter`, `@types/marked`, `@types/dompurify`, `@types/diff` | Stubs / old majors | Bundled types |
| `qrcode` CLI/`yargs`/`pngjs` Node path | Easy to accidentally import Node entry | `qr` encode, or `qrcode` `browser` field only if we revert |
| jsQR as default decoder | Unmaintained; slow on large photos | `qr/decode.js` |
| `@zxing/browser` | Camera helpers + giant `@zxing/library` peer | `qr/decode.js` from file `ImageData` |
| `html5-qrcode` | Camera UX kit | File input + `createImageBitmap` |
| Live camera / `getUserMedia` | Explicitly out of scope | `<input type="file" accept="image/*">` |
| `pinyin-pro` | Large; forces Chinese→Latin slugs | Unicode-preserving slug |
| Workers | Existing architecture: no workers | Debounce + `isTooLarge`; QR lib is fast enough |
| `client:load` of **all** tools from one static import graph | Today every tool is zero-dep so the shared `ToolIsland.astro` if-chain is cheap. SQL/Markdown/QR are not. | Import **only** the island for the current slug (see below) |

## Stack Patterns by Variant

**If `astro build` shows `sql-formatter` / `marked` / `qr` on unrelated tool URLs:**

- Stop using a single `ToolIsland.astro` that statically imports every `*.tsx`.
- Load one island per slug, e.g. `import.meta.glob` of per-tool Astro wrappers, or a slug → `await import()` map in `src/pages/tools/[slug].astro` (and the ZH twin).
- Keep the if-chain only if production HTML for `/tools/json-formatter/` contains no SQL/Markdown/QR chunks.

**If QR decode UAT fails on screenshots of screens (glare/perspective):**

- Keep `qr` for generate.
- Add jsQR as a fallback decoder only, still file-based.
- Do not add ZXing or a WASM engine in the same phase.

**If Markdown users need syntax-colored fences:**

- Do **not** add highlight.js / shiki to the island (Shiki is already an Astro build dep for pages; do not send it to the client).
- Escape fence bodies as `<pre><code class="language-…">` and leave unhighlighted, or defer highlighting.

**If we allow raw HTML in Markdown:**

- Still run DOMPurify. Never `innerHTML = marked.parse(...)` unsanitized.

## Island / bundle rules (Astro 7 + Preact)

Existing pattern: `ToolIsland.astro` statically imports ten TSX files and hydrates the match with `client:load`. That is correct **only while islands are tiny and zero-dep**.

For this milestone:

1. One Preact file per tool (`src/components/tools/*.tsx`) wrapping `ToolShell` (or a small HTML/image variant for Markdown + QR).
2. Logic in `src/lib/<tool>.ts` + colocated `*.test.ts`.
3. Heavy packages imported only from that tool's lib/island — never from `src/data/tools.ts`, layout, or a barrel `src/lib/index.ts`.
4. `sql-formatter`: named dialect imports only.
5. `qr`: `import encodeQR from 'qr'` in generate path; `import decodeQR from 'qr/decode.js'` in decode path so encode-only does not have to pull decode if we split UI modes — pulling both on the QR page is fine (~11.5 KB gzip claimed).
6. Verify with `astro build` that other tool routes do not contain those module names.

Astro islands hydrate independently, but a page that **statically imports** every island still puts every island on that page's module graph. `[slug].astro` is shared by all tools, so this is the real bundling risk.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Astro `^7.3.2` | Preact `^10.29.8`, `@astrojs/preact` `^6.0.5` | Locked. |
| `marked@18` | `dompurify@3` | Official pairing. No Marked built-in sanitizer. |
| `dompurify@3.4` | Browser DOM; Vitest Node **without** jsdom | Call sanitize in the island, not in Node tests. |
| `sql-formatter@15` | Bundlers honoring `sideEffects: false` | Astro 7 / Vite does. Use `formatDialect`. |
| `diff@9` | Bundled types in `libesm` | Do not add `@types/diff@8`. |
| `qr@0.7` | Browser `createImageBitmap` + canvas for decode | Vitest can test `encodeQR` in Node; decode tests need fake `ImageData`. |
| TypeScript 7 | All of the above | Prefer packages with bundled `.d.ts`. |

## What to put in `package.json` after the milestone

```json
{
  "dependencies": {
    "@astrojs/preact": "^6.0.5",
    "@astrojs/sitemap": "^3.7.4",
    "astro": "^7.3.2",
    "diff": "^9.0.0",
    "dompurify": "^3.4.15",
    "marked": "^18.0.12",
    "preact": "^10.29.8",
    "qr": "^0.7.0",
    "sql-formatter": "^15.8.2"
  }
}
```

DevDependencies stay `typescript` + `vitest` only unless sanitizer tests force `happy-dom`.

## Sources

- Context7 `/markedjs/marked` — `marked.parse`, GFM, sanitizer **removed**, “use DOMPurify” (MEDIUM)
- Context7 `/cure53/dompurify` — `DOMPurify.sanitize`; isomorphic wrapper uses jsdom (MEDIUM)
- Context7 `/sql-formatter-org/sql-formatter` — `format` vs `formatDialect`, dialect list, bundle-size warning (MEDIUM)
- Context7 `/kpdecker/jsdiff` — `diffLines`, `diffWords`, `createTwoFilesPatch`, `intlSegmenter` (MEDIUM)
- Context7 `/soldair/node-qrcode` — `toDataURL` browser API (rejected in favor of `qr`) (MEDIUM)
- Context7 `/cozmo/jsqr` — `ImageData` decode (rejected as default) (MEDIUM)
- Context7 `/zxing-js/browser` — `decodeFromImageElement` (rejected: camera stack / size) (MEDIUM)
- Context7 `/markdown-it/markdown-it` — default `html: false` + protocol blocklist (alternative) (MEDIUM)
- Context7 `/blakeembrey/change-case` — case APIs, no slug (reason to implement locally) (MEDIUM)
- Context7 `/withastro/docs` — `client:load` / `client:visible` islands (MEDIUM)
- `npm view` 2026-09-11 — versions: marked 18.0.12, dompurify 3.4.15, sql-formatter 15.8.2, diff 9.0.0, qr 0.7.0, qrcode 1.5.4, jsqr 1.4.0, @zxing/browser 0.2.1, @zxing/library 0.23.0, markdown-it 15.0.1, change-case 5.4.4, isomorphic-dompurify 4.2.0 (jsdom ^30), monaco-editor 0.56.0 unpackedSize 97911464 (MEDIUM as registry readout; classify-confidence maps generic `npm` → LOW, so versions are cross-checked against Context7 where possible)
- `qr@0.7.0` README via `npm view` — encode outputs, `qr/decode.js` file-image example, `{ effort: Infinity, timeLimit: Infinity }`, claimed gzip sizes, 2026-08 speed table vs qrcode/jsQR/zxing (MEDIUM; not Context7)
- [Marked docs](https://marked.js.org) / [Marked GitHub README security warning](https://github.com/markedjs/marked)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [sql-formatter language.md](https://github.com/sql-formatter-org/sql-formatter/blob/master/docs/language.md) / [dialect.md](https://github.com/sql-formatter-org/sql-formatter/blob/master/docs/dialect.md)
- [jsdiff](https://github.com/kpdecker/jsdiff)
- [paulmillr/qr](https://github.com/paulmillr/qr)
- [Astro islands](https://docs.astro.build/en/concepts/islands/)
- it-tools (`markdown-it`, `sql-formatter`, Monaco, `qrcode`) as competitor stack — **not** copied where it fights island size ([it-tools](https://github.com/CorentinTh/it-tools))

---
*Stack research for: Devtoolbox eight-tool milestone (Markdown, Diff, SQL, Case/Slug, Password, Counter, Lorem, QR)*
*Researched: 2026-09-11*
