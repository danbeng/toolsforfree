# Phase 4: Text Diff - Context

**Gathered:** 2026-09-13
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase ships the `text-diff` catalog tool at existing-tool parity: visitors paste original and changed text in two panes, see line-level add/delete highlighting plus added/removed stats, optionally ignore leading/trailing whitespace per line, and get a clear "No differences" state when texts match. Each pane is size-capped with the existing `isTooLarge` guard. Computation stays in `src/lib` plus the Preact island; no new API routes. Completeness harness from Phase 1 stays green; catalog snapshot 15 → 16; featured stays 6. json-formatter must not inherit the diff chunk.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `WordCounter.tsx` locale/`INPUT_TOO_LARGE_MSG` wiring; `SqlFormatter.tsx` native select analog if a control is needed
- `ToolIsland.astro` — add static import + `slug === 'text-diff'` + `locale={locale}`
- `src/data/tools.ts` / `tools.test.ts` — append-only row; snapshot 15 → 16; featured 6
- `src/i18n/ui.ts` — append `tools['text-diff']`; do not drop Phase 2/3 keys
- Completeness harness: `existsSync(URL)` not `.pathname`; ToolIsland source-read `includes(\`slug === '${slug}'\`)`
- `isTooLarge` / `INPUT_MAX_CHARS` in `src/lib/limits.ts` — apply per pane

### Established Patterns
- 8-file additive checklist: lib + test, island, ToolIsland branch, catalog, ui.ts, EN+ZH markdown
- Parsers return discriminated `{ ok: true, ... } | { ok: false, error: string }`; never throw to UI
- English default unprefixed URLs; ZH under `src/pages/zh/`
- No `src/lib/index.ts` barrel
- Do not rewrite the existing ten tools
- Heavy packages imported only from that tool's `src/lib`

### Integration Points
- `src/pages/tools/[slug].astro` and `src/pages/zh/tools/[slug].astro` already pass `<ToolIsland slug={slug} locale={locale} />`
- Catalog `TOOLS` is routing source of truth
- Markdown is SEO/how-to/FAQ only (`howTo` 3, `faq` 3–5)
- ROADMAP **UI hint: yes** — generate UI-SPEC before planning if the ui-plan-gate says frontend

</code_context>

<specifics>
## Specific Ideas

- Line-level add/delete highlighting must be visible as rows, not only a unified dump
- Ignore whitespace is per-line trim, not collapse-all-spaces
- FAQ: computation is local; nothing uploaded
- Confirm during research/plan that json-formatter page bundle does not contain the diff package identifiers

</specifics>

<deferred>
## Deferred Ideas

- Word-level / character-level inline diff
- Ignore all internal whitespace / blank-line collapsing
- Side-by-side synchronized scroll beyond CSS
- Patch-file download
- Three-way merge
- Syntax-aware language modes

</deferred>
