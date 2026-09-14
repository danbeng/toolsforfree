# Phase 5: Markdown preview - Research

**Researched:** 2026-09-13
**Domain:** Astro 7 + Preact catalog tool — in-browser GFM preview via `marked` + `dompurify`
**Confidence:** HIGH (locked CONTEXT + approved UI-SPEC + unpacked `marked@18.0.13` / `dompurify@3.4.15` tarballs + Node/jsdom probe + esbuild minify identifiers + HEAD clone targets)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Preview and GFM
- Live preview as the user types (`useMemo`, no Generate button) (MD-01)
- GFM: headings, lists, links, code fences, tables, strikethrough, task lists
- Empty input → empty preview, not placeholder copy (MD-05)
- Preview HTML is sanitized with DOMPurify **after** Marked parse; never use Marked `sanitize` (MD-02)

### Remote images and copy
- Remote images forbidden by default so the preview does not fetch the network (MD-03)
- FORBID `img` with `http:` / `https:` `src` (and typical remote schemes); local/data URIs may be allowed only if research confirms they do not fetch the network — prefer stripping all `img` if that is the safer default
- ToolShell Copy writes the **sanitized HTML** string (MD-04)
- Size guard: `isTooLarge` on the Markdown source before parse; over-cap → too-large error, empty preview, do not run Marked/DOMPurify

### Engine and isolation
- Mature in-browser stack: `marked` + `dompurify` (exact versions after research)
- Thin `src/lib/markdown.ts` (or equivalent) wraps parse + sanitize; island does not import the packages
- Only that lib file imports `marked` and `dompurify`; json-formatter chunk must not inherit those identifiers (CAT-04)
- Never `innerHTML` of unsanitized Marked output; island may set sanitized HTML only after DOMPurify (research/plan lock the exact Preact binding — `dangerouslySetInnerHTML` of **already-sanitized** string is the expected analog; raw Marked HTML is forbidden)

### Catalog and chrome
- Catalog: slug `markdown-preview`, category Format, `featured: false`; bump TOOLS length 16 → 17
- relatedSlugs: json-formatter, text-diff, word-counter; do not rewrite the existing ten tools' relatedSlugs
- EN+ZH markdown SEO/how-to/FAQ; FAQ states nothing is uploaded and remote images are blocked
- Clone HEAD WordCounter locale/`t()` + HEAD SqlFormatter live `useMemo` + HEAD ToolShell (no locale prop) — never dirty worktree JsonFormatter that imports missing `useToolUi`

### Claude's Discretion
Exact `marked` and `dompurify` versions after research (GFM via marked options / marked-gfm-heading-id vs built-in). How to forbid remote images (DOMPurify hook vs `ALLOWED_URI_REGEXP` vs dropping `img`). Whether code fences get a CSS class only (no highlight.js this phase). Preview layout: source textarea above preview vs `.tool-grid.split`. EN/ZH chrome keys. Whether idle empty uses a blank preview pane with no empty-state heading (MD-05 says empty, not placeholder).

### Deferred Ideas (OUT OF SCOPE)
- GFM newline-as-break (`breaks`) toggle (MD-07)
- Copy source Markdown as well as HTML (MD-08)
- Mermaid, KaTeX, Markdown PDF/PNG, WYSIWYG editor
- Syntax highlighting library (highlight.js / Prism) inside fences
- Persist drafts in localStorage
- Allowlist of remote images behind an explicit toggle
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MD-01 | Paste Markdown and see a live GFM preview (headings, lists, links, code fences, tables, strikethrough, task lists) | `marked.parse` with default `gfm: true`. Probe HTML: `h1`, `ul/li`, `a`, `pre>code.language-js`, `table`, `del`, `<input disabled="" type="checkbox">`. Island: `useMemo` + `onInput`, no Generate. Layout: `div.tool-grid.split`, source first. |
| MD-02 | Sanitize with DOMPurify after Marked; never Marked `sanitize` | `DOMPurify.sanitize(marked.parse(src), CFG)` in `src/lib/markdown.ts` only. `{ sanitize: true }` is **silently ignored** by marked 18 and still emits `<script>`. Never pass `sanitize` / `sanitizer`. |
| MD-03 | Remote images forbidden; preview does not fetch the network | Strip **all** `img` via `FORBID_TAGS` (http, https, data URI). Also forbid `picture`/`source`/`video`/`audio`/`track` and `style`/`srcset`/`poster`. `USE_PROFILES: { html: true }` drops SVG `<image href>`. Do **not** use `ALLOWED_URI_REGEXP` (https still matches the default). |
| MD-04 | Copy the sanitized HTML | ToolShell `output` = sanitized HTML string. HEAD ToolShell `navigator.clipboard.writeText(props.output)`. Copy disabled when output is `''`. |
| MD-05 | Empty input → empty preview, not placeholder | Island: `input === ''` skips parse; `.md-preview` has no children and no empty heading. Do not add `emptyHeading` / `emptyBody`. Image-only leftover `<p></p>\n` must be normalized to `''` so Copy stays disabled. |
| CAT-01 | Unique slug, Format, `featured: false` | Append-only `TOOLS` row; snapshot `toHaveLength(16)` → `17`; `getFeaturedTools()` stays 6. |
| CAT-02 | EN+ZH markdown | Completeness `existsSync(URL)` both paths. `howTo` length 3, `faq` 3–5. FAQ: local / nothing uploaded / not WYSIWYG / remote images blocked. |
| CAT-03 | ToolIsland branch | Static import + `slug === 'markdown-preview'` + `locale={locale}`. |
| CAT-04 | json-formatter must not inherit marked / DOMPurify | Only `src/lib/markdown.ts` imports `'marked'` and `'dompurify'`. After `astro build`, grep JsonFormatter chunk for minify-surviving identifiers listed below. |
| CAT-05 | Do not rewrite existing ten `relatedSlugs` | New row may point at existing slugs; do not edit the first ten rows. |
| CAT-06 | Live compute, copy, size guard, EN+ZH chrome, `ZH_ERRORS` | 8-file checklist. Size error is `INPUT_TOO_LARGE_MSG`; map it in `ZH_ERRORS` this slice (UI-SPEC ZH string). No new lib parse-error key required if wrapper never returns a non-empty `error`. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Privacy: all tool computation in the browser (`src/lib`); no new API routes for tool logic.
- Parity: new tools must match existing tool quality (chrome, copy, errors, EN+ZH, FAQ).
- Stack: stay on Astro + Preact + current catalog/content-collection pattern; do not introduce a new app framework.
- QR decode is out of this phase; do not add camera / server OCR.
- Do not rewrite the existing ten tools; this milestone is additive.
- Pure logic: `src/lib/<topic>.ts` + colocated `src/lib/<topic>.test.ts`.
- Default-export Preact islands; named-export libs/data/i18n.
- Do not add `index.ts` barrels; import the concrete file.
- Vitest: `src/**/*.test.ts`, Node environment, `npm test` → `vitest run`.
- Discriminated `{ ok: true } | { ok: false, error: string }` for parsers; English lib errors; `ZH_ERRORS` for ZH.
- Size guard is `isTooLarge` / `INPUT_MAX_CHARS` only (`INPUT_MAX_BYTES` is Phase 6).
- Preact class attributes as `class` (not `className`).
- Clone HEAD WordCounter / SqlFormatter / ToolShell — never dirty worktree JsonFormatter that imports missing `useToolUi`.
- Completeness: `existsSync(URL)` not `.pathname`; ToolIsland source-read `includes(\`slug === '${slug}'\`)`; pass `locale={locale}`.
- GSD: do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it (this research file is the GSD research artifact).
- Do not commit unrelated dirty i18n/pages. Do not pop `stash@{0}`.

## Summary

Phase 5 is the third **heavy-library** catalog slice (after SQL and Diff). Ship `markdown-preview` at 8-file parity: visitors paste Markdown, see a live GFM preview as sanitized HTML, and copy that HTML. Computation stays in `src/lib/markdown.ts` plus a Preact island. No API route, no worker, no highlight.js, no remote-image allowlist.

Install official `marked@18.0.13` and `dompurify@3.4.15`. Call **`marked.parse` then `DOMPurify.sanitize`**. Never Marked `sanitize` (removed; passing it is a silent no-op that still emits `<script>`). GFM is **built-in** (`gfm: true` in `getDefaults`); do **not** install `marked-gfm-heading-id`. Strip **all** `img` (safer default — data URIs still become `<img src="data:…">` under default DOMPurify and would decode/paint). Also block other fetch vectors (`picture`/`source`/`video`/`audio`/`track`, `style`/`srcset`/`poster`) and drop SVG via `USE_PROFILES: { html: true }`. Do **not** `FORBID_TAGS: ['input']` — that deletes GFM task-list checkboxes.

**Primary recommendation:** One 8-file slice. Thin `src/lib/markdown.ts` wrapping `marked.parse` + `DOMPurify.sanitize` with the locked CFG; island clones HEAD WordCounter locale/`t()` + HEAD SqlFormatter live `useMemo` + HEAD ToolShell (no locale prop); catalog `markdown-preview` / Format / `featured: false`; TOOLS 16 → 17; UI-SPEC copy keys verbatim; after `astro build`, grep the json-formatter island chunk for minify-surviving `DOMPurify` / `FORBID_TAGS` / `ALLOWED_URI_REGEXP` / `uponSanitizeElement` / `listIsTask` / `listReplaceTask` / `github.com/markedjs/marked`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Catalog row, slug, Format, `featured: false`, relatedSlugs | API / Backend (static `TOOLS`) | CDN / Static (`getStaticPaths`) | `TOOLS` is routing source of truth. Markdown collection is SEO only. |
| GFM parse (`marked.parse`) | Browser / Client (`src/lib/markdown.ts` in island) | API / Backend (Vitest) | Privacy: compute in the visitor browser. Same module runs in tests. |
| HTML sanitize (DOMPurify) | Browser / Client (`src/lib/markdown.ts`) | API / Backend (Vitest + jsdom window) | XSS sink is `dangerouslySetInnerHTML`. Sanitize **before** that sink. |
| Live split preview + copy payload | Browser / Client (Preact island + `ToolShell`) | CDN / Static (additive `.md-preview` CSS) | Visual surface is `.md-preview`; `<pre class="tool-output">` is copy payload only. |
| Size guard | Browser / Client (`isTooLarge` in island) | — | Size guard in UI, not the parser. Do not call Marked/DOMPurify when over cap. |
| Remote-image / network forbid | Browser / Client (DOMPurify CFG) | — | Strip tags that would fetch. No server proxy. |
| EN+ZH SEO / how-to / FAQ | CDN / Static (content collections) | — | `howTo` 3, `faq` 3–5; privacy + remote-image copy lives here. |
| Bundle isolation (CAT-04) | CDN / Static (Vite island chunks) | Browser / Client | `'marked'` and `'dompurify'` imported only from `src/lib/markdown.ts` used by `MarkdownPreview.tsx`. |
| Completeness harness | API / Backend (Vitest source-read / existsSync) | — | Phase 1 tests stay green as catalog grows to 17. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `marked` | **18.0.13** (`^18.0.13`) | GFM → HTML via named `marked.parse` | Locked family. MIT. Zero runtime deps. Types `./lib/marked.d.ts`. ESM `exports["."]`. `engines.node` `>= 20`. GFM default on. [CITED: unpacked `marked@18.0.13` `package.json` + `README.md` + `lib/marked.esm.js` `getDefaults`] |
| `dompurify` | **3.4.15** (`^3.4.15`) | Sanitize Marked HTML before render | Locked. `(MPL-2.0 OR Apache-2.0)`. Types bundled (`dist/purify.es.d.mts`). ESM `exports["."].import`. Official Marked README recommended sanitizer. [CITED: unpacked `dompurify@3.4.15` `package.json` + `README.md`] |
| Astro | `^7.3.2` | SSG, `getStaticPaths` from `TOOLS` | Already the app. [VERIFIED: package.json:14] quote: `"astro": "^7.3.2"` |
| Preact | `^10.29.8` | Tool islands | [VERIFIED: package.json:15] quote: `"preact": "^10.29.8"` |
| `@astrojs/preact` | `^6.0.5` | `client:load` | [VERIFIED: package.json:12] quote: `"@astrojs/preact": "^6.0.5"` |
| Vitest | `^5.0.0` | Colocated `src/**/*.test.ts` | [VERIFIED: package.json:9,19] quotes: `"test": "vitest run"` / `"vitest": "^5.0.0"` |
| TypeScript | `^7.0.2` | Strict Astro tsconfig | [VERIFIED: package.json:18] quote: `"typescript": "^7.0.2"` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `jsdom` | **30.0.1** (`^30.0.1`) **devDependency only** | Window for Vitest so `DOMPurify.sanitize` exists | `markdown.test.ts` environment only. **Never** import from `src/lib/markdown.ts` (would ship jsdom into the island). Official DOMPurify Node recipe. [VERIFIED: npm registry] legitimacy `OK`; [CITED: unpacked DOMPurify README Node section] |
| `marked-gfm-heading-id` | n/a | GFM heading ids | Do **not** install. Built-in `gfm: true` already covers MD-01. Heading anchors are not in UI-SPEC. |
| `highlight.js` / `Prism` / `marked-highlight` | n/a | Fence token colors | **Forbidden this phase** (deferred). Fences keep `class="language-*"` with no token CSS. |
| `@types/dompurify` | n/a | DefinitelyTyped stub | Do **not** install. npm `deprecated`: `"This is a stub types definition. dompurify provides its own type definitions, so you do not need this installed."` |
| `isomorphic-dompurify` | n/a | Node+browser wrapper | Do **not** install. Pulls `jsdom` + `dompurify` into runtime. CAT-04 leak. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `FORBID_TAGS: ['img']` | `ALLOWED_URI_REGEXP` that rejects `https?` | **Rejected.** Default regexp **allows** `https` and `data:` (probe: both survive). Restricting it is XSS-sensitive ReDoS surface and still misses `<picture>`/`srcset`/`poster`/SVG. UI-SPEC locked strip-all-`img`. |
| `FORBID_TAGS: ['img']` | `uponSanitizeElement` hook that `node.remove()`s `IMG` | Works, but hooks are **global/persistent** on the DOMPurify instance. Per-call CFG is enough. Do not `addHook`. |
| `USE_PROFILES: { html: true }` | Default HTML+SVG+MathML | Default **keeps** `<svg><image href="https://…">` (probe). HTML profile drops SVG. Required for MD-03. |
| `KEEP_CONTENT: false` | default `true` | Empty `<img>` has no content either way (probe both → `<p></p>\n`). Keep `false` so forbidden media/form tags do not leak children. |
| Built-in `gfm: true` | `marked-gfm-heading-id` | Extra package. Heading ids not required. |
| `dangerouslySetInnerHTML` of sanitized string | `innerHTML` on a ref | Preact analog is `dangerouslySetInnerHTML={{ __html }}`. Do not assign `el.innerHTML` of Marked output. |
| Thin `src/lib/markdown.ts` | Import `marked`/`dompurify` from the island | Locked: only the lib file imports the packages (CAT-04). |
| jsdom devDependency | Mock `DOMPurify.sanitize` in tests | Mock would not prove XSS/img stripping. Official sanitizer tests need a window. |

**Installation:**

```bash
npm install marked@18.0.13 dompurify@3.4.15
npm install -D jsdom@30.0.1
```

**Version verification:**

| Package | `npm view` version | `time` of that version | License | Weekly downloads | postinstall |
|---------|--------------------|------------------------|---------|------------------|-------------|
| `marked` | `18.0.13` | `2026-09-12T21:44:16.925Z` | MIT | 55,366,240 | none |
| `dompurify` | `3.4.15` | `2026-09-06T11:39:57.312Z` (legitimacy `publishedAt`) | `(MPL-2.0 OR Apache-2.0)` | 47,844,016 | none (`scripts.prepare` is husky in the tarball; **not** `postinstall`) |
| `jsdom` | `30.0.1` | legitimacy `publishedAt` `2026-07-29T04:18:42.378Z` | MIT (not re-quoted from tarball this session) | 72,650,923 | none |

`marked` `engines` quote: `"node": ">= 20"` [VERIFIED: unpacked `marked@18.0.13` `package.json`]. Present constraint — Node `v22.22.2` satisfies it.

DOMPurify tarball has **no** `engines` field. Do not claim an engines range. README affirmatively states they run Node.js v20, v22, v24, v25 and v26 with jsdom [CITED: unpacked `dompurify@3.4.15` `README.md`].

Do **not** install `@types/marked` or `@types/dompurify`.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `marked` | npm | first npm time.created `2022-01-26`; `18.0.13` 2026-09-12 | 55,366,240/wk | github.com/markedjs/marked | Seam `SUS` (`too-new` on latest publish) | **Approved** — official Marked README `npm install marked`; 55M/wk; no postinstall; not a slopsquat. Planner: **no** `checkpoint:human-verify`. |
| `dompurify` | npm | README: started Feb 2014; `3.4.15` current | 47,844,016/wk | github.com/cure53/DOMPurify | Seam `SUS` (`too-new`) | **Approved** — official README; 47M/wk; types bundled; no postinstall. Planner: **no** checkpoint. |
| `jsdom` | npm | `30.0.1` 2026-07-29 | 72,650,923/wk | github.com/jsdom/jsdom | OK | **Approved as devDependency only** |
| `isomorphic-dompurify` | npm | `4.2.0` 2026-09-08 | 4,267,398/wk | github.com/kkomelin/isomorphic-dompurify | Seam `SUS` (`too-new`) | **REMOVED** from recommendations — would pull jsdom into the island |
| `@types/dompurify` | npm | stub `3.2.0` | 5,203,406/wk | none | Seam `SUS` (deprecated, no-repository) | **REMOVED** — deprecated stub |
| `marked-gfm-heading-id` | npm | `4.1.4` 2026-04-07 | 185,942/wk | github.com/markedjs/marked-gfm-heading-id | OK | **Not installed** — GFM already built-in |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** seam flagged `marked` / `dompurify` because latest publish is recent (`too-new`), not because the packages are unknown. Treat as Approved.

The names `marked` and `dompurify` come from official tarball READMEs **but** `package-legitimacy check` did not return `OK`, so they are **not** tagged `[VERIFIED: npm registry]`. Tag: `[CITED: unpacked marked@18.0.13 README.md]` / `[CITED: unpacked dompurify@3.4.15 README.md]`. `jsdom` is `[VERIFIED: npm registry]` (official DOMPurify README + seam `OK`).

## Architecture Patterns

### System Architecture Diagram

```text
Visitor paste (Markdown textarea)
        │
        ▼
MarkdownPreview.tsx  (Preact island, client:load, locale prop)
        │  input === '' ? ──yes──► idle: blank .md-preview, output="", Copy disabled
        │                         do not call lib
        │  isTooLarge(input)? ──yes──► ToolShell error = localized INPUT_TOO_LARGE_MSG
        │                             blank .md-preview, output="", do not call lib
        │  no
        ▼
src/lib/markdown.ts  renderMarkdown(source)
        │  marked.parse(source)          // gfm default true; breaks false
        │  DOMPurify.sanitize(html, CFG) // NEVER marked sanitize
        │  normalize empty <p></p> → ''
        │
        ├─ { ok:true, html }   html may be '' after strip
        └─ catch             { ok:false, error:'' }  (do not throw)
                │
                ▼
Island
  div.tool-grid.split
    source textarea (spellcheck=false)
    label preview + div.md-preview
      html === '' → no children
      else → dangerouslySetInnerHTML={{ __html: html }}   // sanitized only
  ToolShell error + <pre> copy payload = html

ToolIsland.astro ── static import MarkdownPreview
                 ── {slug === 'markdown-preview' && <MarkdownPreview client:load locale={locale} />}
                 ── json-formatter branch does NOT import marked / dompurify

astro build ── dist/_astro/MarkdownPreview.*.js  MAY contain DOMPurify / listIsTask
           ── dist/_astro/JsonFormatter.*.js     MUST NOT contain those identifiers
```

### Recommended Project Structure

```
src/lib/markdown.ts                              # NEW — renderMarkdown + MarkdownResult
src/lib/markdown.test.ts                         # NEW — idle, GFM fixtures, XSS, img strip, isolation
src/components/tools/MarkdownPreview.tsx         # NEW — split panes + .md-preview + ToolShell
src/components/tools/ToolIsland.astro            # ADD static import + slug === 'markdown-preview'
src/data/tools.ts                                # APPEND markdown-preview row; do not edit first ten relatedSlugs
src/data/tools.test.ts                           # toHaveLength(16) → 17
src/i18n/ui.ts                                   # APPEND tools['markdown-preview'] EN+ZH (UI-SPEC keys only)
src/i18n/errors.ts                               # APPEND ZH_ERRORS[INPUT_TOO_LARGE_MSG]
src/i18n/errors.test.ts                          # APPEND chrome-key assert + too-large ZH map
src/content/tools/markdown-preview.md            # NEW EN, howTo 3, faq 3–5
src/content/tools/zh/markdown-preview.md         # NEW ZH
src/styles/global.css                            # APPEND only .md-preview rules (do not retokenize :root)
```

Do **not** add `src/lib/index.ts`. Do **not** import `'marked'` or `'dompurify'` from `ToolIsland.astro`, `json.ts`, or `JsonFormatter.tsx`. Do **not** import `'jsdom'` from `src/lib/markdown.ts`. Do **not** edit dirty `src/i18n/useToolUi.ts` / dirty `ToolShell.tsx` / dirty `JsonFormatter.tsx`. Do **not** rewrite `ToolShell.tsx`.

### Pattern 1: Thin lib wrapping `marked.parse` then `DOMPurify.sanitize`

**What:** `src/lib/markdown.ts` mirrors `src/lib/json.ts`: idle empty, never throw, discriminated union. Island owns size-guard and chrome strings.
**When to use:** Always this phase (locked).
**Example:**

```typescript
// Source: clone src/lib/json.ts:1-13 plus unpacked marked@18.0.13 / dompurify@3.4.15
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
// Marked README [CITED: unpacked marked@18.0.13 README.md]:
//   Warning: Marked does not sanitize the output HTML. Please use a sanitize library, like DOMPurify (recommended)
//   DOMPurify.sanitize(marked.parse(`<img src="x" onerror="alert('not happening')">`));
//   import { marked } from 'marked';
//   const html = marked.parse('# Marked in Node.js');
// getDefaults [VERIFIED: unpacked marked@18.0.13 lib/marked.esm.js:13]:
//   function A(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}
// MarkedOptions.gfm [VERIFIED: unpacked marked@18.0.13 lib/marked.d.ts:461-464]:
//   /**
//    * Enable GitHub flavored markdown.
//    */
//   gfm?: boolean;
// DOMPurify README [CITED: unpacked dompurify@3.4.15 README.md]:
//   import DOMPurify from 'dompurify';
//   const clean = DOMPurify.sanitize('<b>hello there</b>');
//   const clean = DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
//   const clean = DOMPurify.sanitize(dirty, { FORBID_TAGS: ['style'] });
//   const clean = DOMPurify.sanitize(dirty, { FORBID_ATTR: ['style'] });
//   const clean = DOMPurify.sanitize(dirty, { KEEP_CONTENT: false });
// Node without window [VERIFIED: probe this session]:
//   THROW no window TypeError DOMPurify.sanitize is not a function

import { marked } from 'marked';
import DOMPurify from 'dompurify';

export type MarkdownResult =
  | { ok: true; html: string }
  | { ok: false; error: string };

const PURIFY_CFG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['img', 'picture', 'source', 'video', 'audio', 'track', 'iframe', 'object', 'embed', 'form'],
  FORBID_ATTR: ['style', 'srcset', 'poster'],
  KEEP_CONTENT: false,
} as const;

function purify(dirty: string): string {
  const bound = DOMPurify as unknown as {
    sanitize?: (html: string, cfg: typeof PURIFY_CFG) => string;
  };
  if (typeof bound.sanitize !== 'function') {
    throw new Error('DOMPurify requires a window');
  }
  return bound.sanitize(dirty, PURIFY_CFG);
}

function normalizeEmpty(html: string): string {
  const collapsed = html.replace(/<p>\s*<\/p>/g, '').trim();
  return collapsed === '' ? '' : html;
}

export function renderMarkdown(input: string): MarkdownResult {
  if (!input) return { ok: false, error: '' };
  try {
    const raw = marked.parse(input) as string;
    const html = normalizeEmpty(purify(raw));
    return { ok: true, html };
  } catch {
    return { ok: false, error: '' };
  }
}
```

Exact import paths: **`from 'marked'`** and **`from 'dompurify'`** (package roots).

Do **not** pass `{ sanitize: true }` (probe: still emits `<script>alert(1)</script>`). Do **not** pass `{ breaks: true }` (MD-07 deferred; default `breaks: false`). Do **not** call `marked.use()` / `marked.setOptions()` (mutates the singleton). Pass nothing, or `{ gfm: true, breaks: false }` as a fresh object — do not spread user JSON into options.

Idle: **`if (!input) return { ok: false, error: '' }`** — empty string only. Do **not** `.trim()` before parse: UI-SPEC says whitespace-only may still parse. `marked.parse('   ')` and `marked.parse('\n\n')` both return `''` (probe), so whitespace-only becomes `{ ok: true, html: '' }` after sanitize+normalize, which the island treats as Copy-disabled blank preview.

Do **not** `FORBID_TAGS: ['input']`. Probe: that turns `- [ ] todo` into `<li> todo</li>` with no checkbox (MD-01 task lists). `input` / `checked` / `disabled` / `type` / `class` are on the default allow-lists [VERIFIED: unpacked `dompurify@3.4.15` `src/tags.ts:61-62` ` 'img',\n  'input'` and `src/attrs.ts:18-20,35` ` 'checked',\n  'cite',\n  'class'` / ` 'disabled'`].

### Pattern 2: Island = split panes + `.md-preview` + ToolShell

**What:** `MarkdownPreview.tsx` default export `{ locale }: { locale: Locale }`. `useState` for source. `useMemo` depends on source + locale. Visual preview is island children, **not** ToolShell `<pre>`.
**When to use:** This tool. Clone **committed HEAD** `WordCounter.tsx` locale/`t()` wiring + HEAD `SqlFormatter` live `useMemo`. **Not** dirty `JsonFormatter.tsx`. **Not** dirty `ToolShell.tsx` (adds a `locale` prop that HEAD does not have).
**Example:**

```tsx
// Source: WordCounter locale + limits [VERIFIED: src/components/tools/WordCounter.tsx:1-14]
//   import { t, type Locale } from '../../i18n/ui';
//   export default function WordCounter({ locale }: { locale: Locale }) {
//   const copy = t(locale);
//   const labels = copy.tools['word-counter'];
//   if (isTooLarge(input)) { return { error: INPUT_TOO_LARGE_MSG, output: '', ...
// SqlFormatter live useMemo [VERIFIED: src/components/tools/SqlFormatter.tsx:22-31]:
//   const result = useMemo(() => {
//     if (isTooLarge(input)) {
//       return { error: INPUT_TOO_LARGE_MSG, output: '' };
//     }
//     const r = formatSql(input, dialect);
//     return {
//       error: r.ok ? null : localizeError(locale, r.error || null),
//       output: r.ok ? r.formatted : '',
//     };
//   }, [input, dialect, locale]);
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
// Preact innerHTML [VERIFIED: node_modules/preact/src/index.d.ts:68-70]:
//   dangerouslySetInnerHTML?: {
//     __html: Parameters<DOMParser['parseFromString']>[0];
//   };
// UI-SPEC locked keys: name, shortDescription, markdown, preview
// UI-SPEC too-large ZH: 输入过长，无法在浏览器中处理。

import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { renderMarkdown } from '../../lib/markdown';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';
import { t, type Locale } from '../../i18n/ui';
import { localizeError } from '../../i18n/errors';

export default function MarkdownPreview({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const copy = t(locale);
  const labels = copy.tools['markdown-preview'];
  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return {
        error: localizeError(locale, INPUT_TOO_LARGE_MSG),
        output: '',
        html: '',
      };
    }
    if (input === '') {
      return { error: null, output: '', html: '' };
    }
    const r = renderMarkdown(input);
    const html = r.ok ? r.html : '';
    return { error: null, output: html, html };
  }, [input, locale]);

  return (
    <ToolShell error={result.error} output={result.output}>
      <div class="tool-grid split">
        <label>
          {labels.markdown}
          <textarea
            rows={12}
            value={input}
            onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
            spellcheck={false}
          />
        </label>
        <div>
          <label id="md-preview-label">{labels.preview}</label>
          <div
            class="md-preview"
            aria-labelledby="md-preview-label"
            {...(result.html
              ? { dangerouslySetInnerHTML: { __html: result.html } }
              : {})}
          />
        </div>
      </div>
    </ToolShell>
  );
}
```

HEAD `ToolShell` has **no** `locale` prop. Do not pass `locale={locale}` into `ToolShell`. Dirty worktree `ToolShell.tsx` does — that is uncommitted dirt.

Do **not** render an empty-state heading inside or beside `.md-preview`. Do **not** put the visual preview only inside ToolShell `<pre>`.

Too-large: map `INPUT_TOO_LARGE_MSG` in `ZH_ERRORS` this slice (UI-SPEC ZH). Do not invent a second error string. [VERIFIED: src/i18n/errors.ts:1-7] current keys are `'Enter a count of at least 1'`, `'Count exceeds the maximum'`, `'Select at least one character set'`, `'Length must be between 8 and 128'`, `'Invalid SQL'` — `INPUT_TOO_LARGE_MSG` is **not** yet mapped.

`.tool-grid.split` already stacks below 720px and is `1fr 1fr` at `min-width: 720px`. [VERIFIED: src/styles/global.css:521-524] quote: `.tool-grid { display: grid; gap: 1rem; }` / `@media (min-width: 720px) {` / `.tool-grid.split { grid-template-columns: 1fr 1fr; }`

### Pattern 3: ToolIsland static import (not dynamic tag)

**What:** Add a static import and a `slug === 'markdown-preview'` branch with `client:load` and `locale={locale}`.
**When to use:** CAT-03. Astro forbids `client:*` on dynamic tags.
**Example:**

```astro
---
import MarkdownPreview from './MarkdownPreview';
---
{slug === 'markdown-preview' && <MarkdownPreview client:load locale={locale} />}
```

Coverage test already source-reads `includes(\`slug === '${slug}'\`)`. [VERIFIED: src/components/tools/ToolIsland.test.ts:10-16] quote: `source.includes(\`slug === '${slug}'\`)`

Current last branch [VERIFIED: src/components/tools/ToolIsland.astro:37]: `{slug === 'text-diff' && <TextDiff client:load locale={locale} />}`

Do **not** `import('marked')` / `import('dompurify')` from `ToolIsland.astro`.

### Pattern 4: Catalog append-only

**What:** One new `TOOLS` row. Snapshot 16 → 17. Featured stays 6. `featured: false`.
**When to use:** CAT-01.
**Example values:**

```typescript
// [VERIFIED: src/data/tools.ts:1-8] ToolCategory includes 'Format'
//   | 'Format'
//   | 'Auth'
//   | 'Encode'
//   | 'Generate'
//   | 'Text'
//   | 'Time'
//   | 'Color';
// [VERIFIED: src/data/tools.test.ts:12-13] expect(TOOLS).toHaveLength(16);
// [VERIFIED: src/data/tools.test.ts:21-23] expect(featured).toHaveLength(6);
// last current row [VERIFIED: src/data/tools.ts:140-147]:
//   slug: 'text-diff',
//   name: 'Text Diff',
//   category: 'Text',
//   shortDescription: 'Compare two texts line by line in your browser.',
//   relatedSlugs: ['word-counter', 'case-converter', 'json-formatter'],
//   featured: false,
{
  slug: 'markdown-preview',
  name: 'Markdown Preview',
  category: 'Format',
  shortDescription: 'Preview GitHub-flavored Markdown in your browser.',
  relatedSlugs: ['json-formatter', 'text-diff', 'word-counter'],
  featured: false,
}
```

`name` / `shortDescription` are UI-SPEC locked EN chrome (also duplicated on the catalog row, matching sql-formatter / text-diff).

### Pattern 5: Additive `.md-preview` CSS only

**What:** Append rules under `.md-preview`. Do not retokenize `:root`. Do not reuse Phase 4 `#3dd68c` / `#13291f`.
**When to use:** UI-SPEC GFM node table.
**Locked pane chrome (UI-SPEC):** `min-height: 160px; max-height: 384px; overflow-y: auto; overflow-x: auto; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 16px; font-family: var(--sans); font-size: 16px; line-height: 1.5; color: var(--text);`

`:root` tokens already match UI-SPEC [VERIFIED: src/styles/global.css:3-15]: `--bg: #0c1014;` `--bg-elev: #12181f;` `--panel: #151c24;` `--text: #e7edf3;` `--muted: #8b9aab;` `--border: #243040;` `--accent: #3ecfbf;` `--danger: #f07178;` `--mono: "IBM Plex Mono"` `--sans: "IBM Plex Sans"` `--display: Syne`.

Fenced `language-*` class: **no token colors**. `img` rules are unnecessary because `img` is stripped.

### Anti-Patterns to Avoid

- **`marked.parse` into `dangerouslySetInnerHTML` without DOMPurify:** XSS. Probe: `<script>alert(1)</script>` and `<img onerror>` survive Marked.
- **Passing `{ sanitize: true }` to marked:** Silent no-op in v18; still emits `<script>`.
- **`ALLOWED_URI_REGEXP` to block https images:** Default already allows https/data; custom regexp is XSS/ReDoS risk and misses other fetch tags.
- **`FORBID_TAGS: ['input']`:** Kills GFM task lists.
- **`addHook` instead of per-call CFG:** Hooks persist on the singleton.
- **Importing `jsdom` / `isomorphic-dompurify` from `src/lib`:** CAT-04 leak; jsdom is Node-only.
- **Importing `marked`/`dompurify` from the island or ToolIsland:** CAT-04 leak.
- **Cloning dirty JsonFormatter / dirty ToolShell:** missing `useToolUi`; HEAD ToolShell has no `locale` prop.
- **Empty-state heading in `.md-preview`:** MD-05 / UI-SPEC forbid it.
- **highlight.js / Prism:** deferred.
- **`marked.use()` global config:** Mutates singleton; breaks later parses.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GFM parse (tables, task lists, strike, fences) | Regex / custom tokenizer | `marked.parse` | GFM edge cases (nested lists, fence lang, task checkboxes) are already implemented. |
| XSS sanitization | Regex strip of `<script>` | `DOMPurify.sanitize` | Marked README forbids trusting output. Bypass classes are why DOMPurify exists. |
| Remote-image block | CSS `img { display:none }` | `FORBID_TAGS: ['img', …]` | Hidden `img` still fetches. Must not emit the node. |
| Syntax highlighting | Hand-rolled span tokens | Nothing this phase | Deferred. Class-only is enough. |
| Heading ids | `marked-gfm-heading-id` | Built-in GFM without ids | Not in MD-01 / UI-SPEC. |

**Key insight:** Marked is a parser, not a sanitizer. The XSS boundary is **DOMPurify then** `dangerouslySetInnerHTML`. Skipping either side fails MD-02 or MD-01.

## Common Pitfalls

### Pitfall 1: Marked `sanitize` looks like it works
**What goes wrong:** Passing `{ sanitize: true }` type-checks as excess property (or is ignored) and XSS still executes.
**Why it happens:** Option removed; v18 `parse` spreads unknown keys into defaults without using them. Probe: `marked.parse('<script>alert(1)</script>', { sanitize: true })` → `"<script>alert(1)</script>"`.
**How to avoid:** Never pass `sanitize`. Always `DOMPurify.sanitize` after parse. Unit-test a `<script>` fixture is stripped.
**Warning signs:** Preview executes alert; copy payload contains `<script>`.

### Pitfall 2: Default DOMPurify still allows remote `img`
**What goes wrong:** `![x](https://evil.example/x.png)` becomes `<img src="https://…">` and the browser fetches.
**Why it happens:** `img` is on the default HTML tag list; `https` matches `ALLOWED_URI_REGEXP`; `data:` images also survive. Probe: both http and data img remain under default sanitize.
**How to avoid:** Locked CFG `FORBID_TAGS` includes `img`. Do not “just sanitize” without CFG.
**Warning signs:** Network panel shows the image URL; broken-image icon (UI-SPEC forbids both).

### Pitfall 3: `FORBID_TAGS: ['input']` “to be safe”
**What goes wrong:** Task lists render as plain `li` text without checkboxes. MD-01 fails.
**Why it happens:** Marked emits `<input disabled="" type="checkbox">`.
**How to avoid:** Keep `input`. Task checkboxes stay `disabled` (preview is not an editor). CSS: native size, 4px gap.
**Warning signs:** `- [ ]` looks like a bullet with leftover spaces.

### Pitfall 4: CAT-04 grep of `marked` / `sanitize` is a false clean
**What goes wrong:** Function names minify away; grepping `marked` or `sanitize` misses a leak or false-positives on unrelated strings.
**Why it happens:** Same class as Phase 4 `diffLines` / `jsdiff`.
**How to avoid:** Grep minify-surviving identifiers (present in the 73 487 B combined minified graph, absent from a json-only 198 B graph):

- `DOMPurify`
- `FORBID_TAGS`
- `ALLOWED_URI_REGEXP`
- `uponSanitizeElement`
- `listIsTask`
- `listReplaceTask`
- `github.com/markedjs/marked`

Do **not** treat absence of `marked.parse` / `sanitize` as sufficient.
**Warning signs:** JsonFormatter chunk contains `DOMPurify` or `listIsTask`.

### Pitfall 5: Vitest Node has no `DOMPurify.sanitize`
**What goes wrong:** `renderMarkdown('# h')` throws `DOMPurify.sanitize is not a function` / `DOMPurify requires a window`.
**Why it happens:** Default export is a factory until bound to a window. Vitest `environment: 'node'`. [VERIFIED: probe this session]
**How to avoid:** `jsdom` **devDependency**. `markdown.test.ts` first line: `// @vitest-environment jsdom` so `window` exists **before** the lib import. Never import `jsdom` from `src/lib/markdown.ts`. Isolation tests that only `readFileSync` can stay in the default Node environment (same file is fine if the whole file is jsdom).
**Warning signs:** `npm test` fails only on markdown tests with `sanitize is not a function`.

### Pitfall 6: Image-only source enables Copy with `<p></p>`
**What goes wrong:** Sanitizer returns `"<p></p>\n"`; Copy is enabled; preview looks blank.
**Why it happens:** Marked wraps the image in `<p>`; stripping `img` leaves an empty paragraph. Probe: image-only KEEP true/false both `"<p></p>\n"`.
**How to avoid:** `normalizeEmpty` in the lib so `html === ''`. UI-SPEC: Copy disabled if payload `''`.
**Warning signs:** Copy button enabled on a blank preview after pasting only `![x](https://…)`.

### Pitfall 7: Cloning dirty ToolShell / JsonFormatter
**What goes wrong:** Type errors (`locale` required, missing `useToolUi`); CAT-04 `astro build` fails on unrelated dirty pages.
**Why it happens:** Worktree ToolShell adds `locale: Locale`; HEAD does not.
**How to avoid:** Clone HEAD `WordCounter.tsx`, HEAD `SqlFormatter.tsx`, HEAD `ToolShell.tsx` (no locale prop). Do not introduce `useToolUi`. Do not rewrite JsonFormatter, ToolShell, or dirty pages. Do not pop `stash@{0}`. If dirty pages break `astro build`, isolate the build the same way Phase 3/4 verify noted; do not “fix” them in this phase.

### Pitfall 8: Other fetch tags besides `img`
**What goes wrong:** Raw HTML `<picture><source srcset=https://…>` / `<video poster=https://…>` / `<p style="background:url(https://…)">` still fetches after `FORBID_TAGS: ['img']` only. Probe: html profile still kept `picture/source`, `video poster`, `audio src`, `style=background:url`.
**How to avoid:** Locked CFG also forbids those tags/attrs and uses HTML profile (drops SVG `image href`).
**Warning signs:** Network panel activity on a “Markdown” paste that includes raw HTML.

## Code Examples

### GFM parse (no sanitize)

```javascript
// Source: unpacked marked@18.0.13 README.md + Node probe this session
import { marked } from 'marked';
marked.parse('# Hello');
// "<h1>Hello</h1>\n"
marked.parse('```js\nconst a = 1;\n```');
// "<pre><code class=\"language-js\">const a = 1;\n</code></pre>\n"
marked.parse('- [ ] todo\n- [x] done');
// "<ul>\n<li><input disabled=\"\" type=\"checkbox\"> todo</li>\n<li><input checked=\"\" disabled=\"\" type=\"checkbox\"> done</li>\n</ul>\n"
marked.parse('~~nope~~');
// "<p><del>nope</del></p>\n"
marked.parse('| a | b |\n| - | - |\n| 1 | 2 |');
// table thead/tbody
marked.parse('<script>alert(1)</script>');
// "<script>alert(1)</script>"  // NOT safe
```

Fence renderer quote [VERIFIED: unpacked `marked@18.0.13` `lib/marked.esm.js:59`]: `'<pre><code class="language-'+R(i)+'">'`

Checkbox renderer quote [VERIFIED: unpacked `marked@18.0.13` `lib/marked.esm.js:68`]: `return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox"> '`

### Sanitize after parse (locked CFG)

```javascript
// Source: unpacked dompurify@3.4.15 README.md + jsdom probe this session
import DOMPurify from 'dompurify';
const CFG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['img', 'picture', 'source', 'video', 'audio', 'track', 'iframe', 'object', 'embed', 'form'],
  FORBID_ATTR: ['style', 'srcset', 'poster'],
  KEEP_CONTENT: false,
};
DOMPurify.sanitize(marked.parse(src), CFG);
```

Probe results with this CFG (jsdom + DOMPurify 3.4.15):

| Input | Output |
|-------|--------|
| GFM heading/list/link/fence/table/strike/task | Kept (`language-js`, `del`, disabled checkbox) |
| `<script>alert(1)</script>` | `""` |
| `![x](https://e/x.png)` | `"<p></p>\n"` before normalize |
| `![x](data:image/png;base64,AAAA)` | `"<p></p>\n"` |
| `[x](javascript:alert(1))` | `"<p><a>x</a></p>\n"` (href stripped) |
| `<p style="background:url(https://e/x.png)">x</p>` | `"<p>x</p>"` |
| `<picture>…` / `<video poster>` / `<audio src>` / `<svg><image href>` / `<form>` | `""` |
| `- [ ] todo` | checkbox kept |

### Isolation unit test (clone SQL/Diff)

```typescript
// Source: src/lib/sql.test.ts:86-95 [VERIFIED: src/lib/sql.test.ts:86-95]
//   expect(sqlSource).toContain("from 'sql-formatter'");
//   expect(island).not.toMatch(/from ['"]sql-formatter['"]/);
//   expect(jsonIsland).not.toMatch(/from ['"]sql-formatter['"]/);
// Source: src/lib/diff.test.ts:90-111 [VERIFIED: src/lib/diff.test.ts:105-111]
//   expect(diffSource).toContain("from 'diff'");
//   expect(island).not.toMatch(/from ['"]diff['"]/);

expect(mdSource).toContain("from 'marked'");
expect(mdSource).toContain("from 'dompurify'");
expect(island).not.toMatch(/from ['"]marked['"]/);
expect(island).not.toMatch(/from ['"]dompurify['"]/);
expect(toolIsland).not.toMatch(/from ['"]marked['"]/);
expect(jsonIsland).not.toMatch(/from ['"]marked['"]/);
expect(jsonIsland).not.toMatch(/from ['"]dompurify['"]/);
expect(mdSource).not.toMatch(/from ['"]jsdom['"]/);
```

### Completeness markdown paths

```typescript
// [VERIFIED: src/data/tools.test.ts:46-52]
//   const en = new URL(`../content/tools/${slug}.md`, import.meta.url);
//   const zh = new URL(`../content/tools/zh/${slug}.md`, import.meta.url);
//   expect(existsSync(en), `missing EN markdown for ${slug}`).toBe(true);
```

Schema [VERIFIED: src/content.config.ts:16-29]: `locale: z.enum(['en', 'zh'])`, `howTo: z.tuple([z.string(), z.string(), z.string()])`, `faq` `.min(3).max(5)`.

### CAT-04 verification (post-build)

```bash
npm test
npm test && npm run build
# JsonFormatter island chunk must NOT contain minify-surviving marked/DOMPurify identifiers
# MarkdownPreview island chunk MAY contain DOMPurify / listIsTask
```

Planner: add a verification step that **fails** if `dist/_astro/JsonFormatter*.js` matches any of:

`DOMPurify` | `FORBID_TAGS` | `ALLOWED_URI_REGEXP` | `uponSanitizeElement` | `listIsTask` | `listReplaceTask` | `github.com/markedjs/marked`

Do **not** treat absence of `marked.parse` / `sanitize` / `gfm` as sufficient. Do not trust a stale `dist/_astro/`. Always rebuild. If dirty pages break `astro build`, do not rewrite them — isolate the build the same way Phase 3/4 verify noted. Source isolation test still lands in `src/lib/markdown.test.ts` regardless.

esbuild 0.28.2 probe (project `node_modules/esbuild`, unpacked tarballs, `--bundle --format=esm --minify --platform=browser`):

| Entry | Minified bytes | `DOMPurify` | `listIsTask` | `github.com/markedjs/marked` |
|-------|----------------|-------------|--------------|------------------------------|
| `marked.parse` + `DOMPurify.sanitize` | 73487 | present | present | present |
| `marked.parse` only | 44374 | absent | present | present |
| `DOMPurify.sanitize` only | 28840 | present | absent | absent |
| json-only fixture | 198 | absent | absent | absent |

[VERIFIED: esbuild 0.28.2 against unpacked `marked@18.0.13` + `dompurify@3.4.15`]

Also surviving in the combined graph (do not need all of these in the grep, but they must not appear in JsonFormatter): `KEEP_CONTENT`, `USE_PROFILES`, `FORBID_ATTR`, `listReplaceTask`, `listTaskCheckbox`, `delLDelim`, `ADD_DATA_URI_TAGS`, `SANITIZE_NAMED_PROPS`.

### EN FAQ skeleton (content collection)

```yaml
# howTo length 3, faq 3–5 [VERIFIED: src/content.config.ts:20-29]
locale: en
title: Markdown Preview
description: Preview GitHub-flavored Markdown in your browser. Nothing is uploaded.
intro: Paste Markdown. Preview and sanitization run locally. Remote images are blocked.
howTo:
  - Paste Markdown into the source pane.
  - The preview updates as you type. Formatting runs in your browser.
  - Copy the sanitized HTML with the Copy button.
faq:
  - question: Is my Markdown uploaded?
    answer: No. Parsing and sanitization run in your browser. Nothing is uploaded.
  - question: Are remote images shown?
    answer: No. Remote images are blocked so the preview does not fetch the network. Data URIs are also stripped.
  - question: Is this a WYSIWYG editor?
    answer: No. This is a preview. You paste Markdown on the left; you do not edit the rendered HTML.
```

ZH FAQ must state local/no-upload and remote images blocked. `faq` length 3–5. `howTo` length 3.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Marked `sanitize` / `sanitizer` option | External sanitizer (DOMPurify) after `parse` | marked v8.0.0 (removed); still gone in 18.0.13 | Never pass `sanitize`. |
| Separate GFM plugin for tables/strike | Built-in `gfm: true` default | long-standing; confirmed in 18.0.13 `getDefaults` | No extra GFM package. |
| HTML+SVG+MathML default sanitize | `USE_PROFILES: { html: true }` plus `FORBID_TAGS` | DOMPurify 3.x profiles | Required so SVG `<image>` cannot fetch. |
| `@types/dompurify` | Types bundled in `dompurify` | stub deprecated 2024-11-19 | Do not install the stub. |

**Deprecated/outdated:**

- Marked `sanitize`: removed; passing it does nothing.
- `@types/dompurify`: deprecated stub.
- `isomorphic-dompurify` as the island import: extra jsdom runtime.
- happy-dom + DOMPurify: official README says **not considered safe**.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vitest 5 honors `// @vitest-environment jsdom` on `src/lib/markdown.test.ts` when `jsdom` is a devDependency | Pitfall 5 / Validation | Tests throw `sanitize is not a function`. Fallback: set `environmentMatchGlobs` in `vitest.config.ts` for that file only — do not switch the whole suite to jsdom. |
| A2 | After a fresh `astro build`, Vite will keep `marked`/`dompurify` out of `JsonFormatter*.js` the same way named `sql-formatter` / `diff` imports stayed isolated | CAT-04 | CAT-04 fails; planner adds a dynamic `import()` **inside** `markdown.ts` only as a last resort — never from ToolIsland. Confirm with build; do not skip. |

## Open Questions

1. **Exact marked + dompurify versions** — RESOLVED: `marked@18.0.13`, `dompurify@3.4.15`. GFM via built-in `gfm: true`. Do not install `marked-gfm-heading-id`.
2. **How to forbid remote images** — RESOLVED: `FORBID_TAGS` strip-all-`img` (plus picture/source/video/audio/track) and `FORBID_ATTR` `style`/`srcset`/`poster`, `USE_PROFILES: { html: true }`. Not `ALLOWED_URI_REGEXP`. Not a hook.
3. **Code fences CSS class only** — RESOLVED: Marked already emits `class="language-js"`. No highlight.js. No token colors.
4. **Preview layout** — RESOLVED by approved UI-SPEC: `div.tool-grid.split`, source first; 720px two-column; below 720px source then preview.
5. **EN/ZH chrome keys** — RESOLVED by UI-SPEC: `name`, `shortDescription`, `markdown`, `preview` only. No `emptyHeading` / `emptyBody`.
6. **Idle empty preview** — RESOLVED by UI-SPEC + MD-05: blank `.md-preview`, no empty-state heading.
7. **CAT-04 grep strings** — RESOLVED: minify-surviving `DOMPurify`, `FORBID_TAGS`, `ALLOWED_URI_REGEXP`, `uponSanitizeElement`, `listIsTask`, `listReplaceTask`, `github.com/markedjs/marked`.
8. **Preact binding for sanitized HTML** — RESOLVED: `dangerouslySetInnerHTML={{ __html: sanitized }}` only when `html !== ''`. Never of raw Marked output.
9. **Data URIs** — RESOLVED: strip (default DOMPurify still emits `<img src="data:…">`; UI-SPEC prefers strip-all-`img`).
10. **Vitest + DOMPurify window** — RESOLVED with A1: `jsdom` devDependency + per-file jsdom environment. Not imported from `src/lib`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | marked `engines` `>= 20`; Vitest; Astro | ✓ | v22.22.2 | — |
| npm | install marked/dompurify/jsdom | ✓ | 11.9.0 | — |
| esbuild (transitive via Astro) | CAT-04 size/identifier probe this session | ✓ | 0.28.2 | — |
| `marked` (npm) | MD-01 parse | ✗ not in package.json yet | install 18.0.13 | — |
| `dompurify` (npm) | MD-02 sanitize | ✗ not in package.json yet | install 3.4.15 | — |
| `jsdom` (npm, dev) | Vitest sanitize tests | ✗ not in package.json yet | install 30.0.1 dev | A1 fallback config |
| ctx7 CLI | docs lookup | ✗ | — | Unpacked npm tarballs (used) |

**Missing dependencies with no fallback:**
- `marked@18.0.13` and `dompurify@3.4.15` must be installed in Wave 0 before lib implementation.

**Missing dependencies with fallback:**
- `jsdom` — needed for markdown unit tests that call `renderMarkdown`. Isolation-only tests can run in Node; GFM/XSS tests cannot.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^5.0.0` |
| Config file | `vitest.config.ts` (`include: ['src/**/*.test.ts']`, `environment: 'node'`) [VERIFIED: vitest.config.ts:3-8] |
| Quick run command | `npm test` |
| Full suite command | `npm test && npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MD-01 | GFM heading/list/link/fence/table/strike/task in `html` | unit | `npx vitest run src/lib/markdown.test.ts -t GFM` | ❌ Wave 0 |
| MD-02 | `<script>` / `onerror` stripped; source does not contain `sanitize:` option | unit | `npx vitest run src/lib/markdown.test.ts -t XSS` | ❌ Wave 0 |
| MD-03 | `https` and `data:` images absent from `html`; no `<img` | unit | `npx vitest run src/lib/markdown.test.ts -t img` | ❌ Wave 0 |
| MD-04 | island passes sanitized string as ToolShell `output` | unit (source-read) | `npx vitest run src/lib/markdown.test.ts -t output` | ❌ Wave 0 |
| MD-05 | `''` → `{ ok:false, error:'' }`; no emptyHeading in ui keys; image-only → `html === ''` | unit | `npx vitest run src/lib/markdown.test.ts -t idle` | ❌ Wave 0 |
| CAT-01 | TOOLS length 17, featured 6, slug unique | unit | `npx vitest run src/data/tools.test.ts` | ✅ (update length) |
| CAT-02 | EN+ZH markdown `existsSync(URL)` | unit | `npx vitest run src/data/tools.test.ts` | ✅ (files missing until Wave 0) |
| CAT-03 | `slug === 'markdown-preview'` in ToolIsland.astro | unit | `npx vitest run src/components/tools/ToolIsland.test.ts` | ✅ (branch missing until Wave 0) |
| CAT-04 | only `markdown.ts` imports packages; JsonFormatter chunk clean | unit + build grep | source-read in `markdown.test.ts`; `npm run build` then grep identifiers | ❌ Wave 0 |
| CAT-06 | chrome keys EN+ZH; `ZH_ERRORS` maps too-large | unit | `npx vitest run src/i18n/errors.test.ts` | ✅ (append describe) |
| CAT-05 | first ten `relatedSlugs` unchanged | manual in plan diff / do-not-edit | — | — |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test && npm run build`
- **Phase gate:** Full suite green before `/gsd-verify-work`, plus JsonFormatter chunk grep

### Wave 0 Gaps

- [ ] `src/lib/markdown.ts` — `renderMarkdown`
- [ ] `src/lib/markdown.test.ts` — idle, GFM, XSS, img, normalizeEmpty, isolation; `// @vitest-environment jsdom`
- [ ] `src/components/tools/MarkdownPreview.tsx`
- [ ] `src/content/tools/markdown-preview.md` + `src/content/tools/zh/markdown-preview.md`
- [ ] `src/i18n/ui.ts` keys + `src/i18n/errors.ts` too-large map
- [ ] Framework packages: `npm install marked@18.0.13 dompurify@3.4.15` and `npm install -D jsdom@30.0.1`

Existing test infrastructure (Vitest + completeness loops) covers CAT-01/02/03 once files/rows exist. New behavior tests are Wave 0.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Static catalog; no accounts |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | No authz |
| V5 Input Validation | yes | `isTooLarge` / `INPUT_MAX_CHARS` `100_000` before parse; DOMPurify CFG after Marked; never trust Marked HTML |
| V6 Cryptography | no | No new crypto this phase |

### Known Threat Patterns for marked + DOMPurify + `dangerouslySetInnerHTML`

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Stored XSS via Markdown / raw HTML (`<script>`, `onerror`, `javascript:` href) | Elevation of Privilege / Tampering | `DOMPurify.sanitize` **after** `marked.parse`; `dangerouslySetInnerHTML` only of that string; never Marked `sanitize` |
| Remote image / tracking pixel fetch | Information Disclosure | `FORBID_TAGS` strip `img` (all schemes including data/http/https) plus `picture`/`source`/`video`/`audio`/`track`; `FORBID_ATTR` `style`/`srcset`/`poster`; HTML profile drops SVG `image` |
| CSS `url()` fetch via `style` | Information Disclosure | `FORBID_ATTR: ['style']` (GFM does not need inline style) |
| Form exfiltration (`<form action=https://…>`) | Information Disclosure | `FORBID_TAGS` includes `form` (not `input` — task lists) |
| Prototype pollution via options | Tampering | Pass a fresh CFG object; do not spread user JSON into marked/DOMPurify options |
| Sanitizer bypass by mutating HTML after sanitize | Tampering | Do not post-process sanitized markup except `normalizeEmpty` of empty `<p>` |
| CAT-04 supply-chain surprise on json-formatter | Tampering | Only `markdown.ts` imports the packages; grep minify-surviving identifiers |
| jsdom XSS if used as production sanitizer host | Elevation of Privilege | jsdom is **devDependency / tests only**. Browser island uses the real `window`. Do not sanitize user HTML in Node in production (there is no Node production) |
| ReDoS via custom `ALLOWED_URI_REGEXP` | Denial of Service | Do not override `ALLOWED_URI_REGEXP` |
| `innerHTML` of unsanitized Marked output | Elevation of Privilege | Forbidden. Preact `dangerouslySetInnerHTML` of sanitized string only |

DOMPurify README foot-gun [CITED: unpacked README]: if you first sanitize HTML and then modify it afterwards, you void sanitization. `normalizeEmpty` only deletes empty `<p></p>` wrappers / trims; it must not concatenate source into HTML.

## Sources

### Primary (HIGH confidence)

- Unpacked npm tarball `marked-18.0.13.tgz` — `README.md` (DOMPurify warning, `import { marked }`, `marked.parse`), `package.json` (version, engines `>= 20`, MIT, exports, zero deps), `lib/marked.d.ts` (`gfm?: boolean`, `breaks?: boolean`), `lib/marked.esm.js` (`getDefaults` `gfm:!0` `breaks:!1`, fence `language-` renderer, checkbox renderer)
- Unpacked npm tarball `dompurify-3.4.15.tgz` — `README.md` (v3.4.15, `import DOMPurify from 'dompurify'`, Node/jsdom factory, `FORBID_TAGS`, `FORBID_ATTR`, `USE_PROFILES`, `KEEP_CONTENT`, `ALLOWED_URI_REGEXP` default, hooks `uponSanitizeElement`, happy-dom unsafe), `package.json` (license, exports, types), `src/config.ts`, `src/tags.ts` (`img`/`input`), `src/attrs.ts` (`checked`/`class`/`disabled`), `src/regexp.ts` (`IS_ALLOWED_URI`)
- Node probe this session: marked GFM HTML; `{ sanitize: true }` no-op; empty/whitespace → `''`; DOMPurify without window → no `sanitize`; jsdom CFG matrix
- esbuild 0.28.2 minify identifier probe this session
- In-repo HEAD clone targets and completeness tests (Read this session)

### Secondary (MEDIUM confidence)

- [marked.js.org/using_advanced](https://marked.js.org/using_advanced) — `gfm` default true; `sanitize` listed as old/removed (WebSearch summary; page itself not fetched — WebFetch blocked)
- [cure53/DOMPurify README](https://github.com/cure53/DOMPurify) — same content as unpacked tarball
- Phase 3 `03-RESEARCH.md` / Phase 4 `04-RESEARCH.md` — CAT-04 process, clone-target discipline, dirty-tree build break

### Tertiary (LOW confidence)

- Vitest 5 per-file `// @vitest-environment jsdom` pragma — not re-read from Vitest docs this session (A1)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — unpacked tarballs + `npm view` + legitimacy seam + engines quote
- Architecture: HIGH — locked CONTEXT + approved UI-SPEC + in-repo 8-file pattern + Node/jsdom probe
- Pitfalls: HIGH — probes of sanitize no-op, default img allow, FORBID input, minify-surviving identifiers, Node window miss, empty `<p></p>` leftover

**Research date:** 2026-09-13
**Valid until:** 2026-10-13 (30 days; pin exact versions in the plan)

## UI-SPEC honor (planner)

Approved `05-UI-SPEC.md`. Copy, layout (split at 720px, source first), empty preview is blank, fonts, colors, `.md-preview` chrome, no highlight.js, no `aria-live`, `spellcheck={false}`, Copy payload is sanitized HTML. Do not reopen those decisions.
