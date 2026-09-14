# Phase 5: Markdown preview - Context

**Gathered:** 2026-09-13
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase ships the `markdown-preview` catalog tool at existing-tool parity: visitors paste Markdown, see a live GFM preview (headings, lists, links, code fences, tables, strikethrough, task lists), with HTML sanitized by DOMPurify before render. Marked's removed `sanitize` option is never used. Remote images are forbidden by default so the preview does not fetch the network. Empty input shows an empty preview, not placeholder copy. User can copy the sanitized HTML. Computation stays in `src/lib` plus the Preact island; no new API routes. Completeness harness from Phase 1 stays green; catalog snapshot 16 → 17; featured stays 6. json-formatter must not inherit marked / DOMPurify chunks (CAT-04).

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `WordCounter.tsx` locale/`t()` wiring; `SqlFormatter.tsx` live `useMemo`
- `ToolIsland.astro` — add static import + `slug === 'markdown-preview'` + `locale={locale}`
- `src/data/tools.ts` / `tools.test.ts` — append-only row; snapshot 16 → 17; featured 6
- `src/i18n/ui.ts` — append `tools['markdown-preview']`; do not drop Phase 2/3/4 keys
- Completeness harness: `existsSync(URL)` not `.pathname`; ToolIsland source-read `includes(\`slug === '${slug}'\`)`
- `isTooLarge` / `INPUT_MAX_CHARS` in `src/lib/limits.ts` — apply to Markdown source
- Phase 3/4 CAT-04: minify-surviving identifiers, not minified-away function names; only the tool lib imports the heavy packages

### Established Patterns
- 8-file additive checklist: lib + test, island, ToolIsland branch, catalog, ui.ts, EN+ZH markdown
- Parsers return discriminated `{ ok: true, ... } | { ok: false, error: string }`; never throw to UI
- English default unprefixed URLs; ZH under `src/pages/zh/`
- No `src/lib/index.ts` barrel
- Do not rewrite the existing ten tools
- Heavy packages imported only from that tool's `src/lib`

### Integration Points
- `src/pages/tools/[slug].astro` and `src/pages/zh/tools/[slug].astro` already pass `<ToolIsland slug={slug} locale={locale} />`
- Catalog `TOOLS` is the source of truth
- Markdown is SEO/how-to/FAQ only (`howTo` 3, `faq` 3–5)
- ROADMAP **UI hint: yes** — generate UI-SPEC before planning

</code_context>

<specifics>
## Specific Ideas

- XSS payloads in the source must not execute after sanitize
- Remote `![alt](https://…)` must not cause a network fetch
- FAQ: computation is local; nothing uploaded; not a WYSIWYG editor; remote images blocked
- Confirm during research/plan that json-formatter page bundle does not contain marked / DOMPurify identifiers

</specifics>

<deferred>
## Deferred Ideas

- GFM newline-as-break (`breaks`) toggle (MD-07)
- Copy source Markdown as well as HTML (MD-08)
- Mermaid, KaTeX, Markdown PDF/PNG, WYSIWYG editor
- Syntax highlighting library (highlight.js / Prism) inside fences
- Persist drafts in localStorage
- Allowlist of remote images behind an explicit toggle

</deferred>
