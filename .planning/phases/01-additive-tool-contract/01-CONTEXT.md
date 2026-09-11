# Phase 1: Additive tool contract - Context

**Gathered:** 2026-09-11
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the additive contract so later slices can add tools without rewriting the existing ten, and so catalog mistakes fail tests instead of shipping a blank island or an extra featured card.

It does **not** ship any of the eight new tools. Catalog stays at 10 rows. No heavy libraries. No `INPUT_MAX_BYTES`. No ToolShell HTML prop. No relatedSlugs rewiring to future slugs.

Visitor-facing: the existing ten tools on EN and `/zh/` keep current behavior; homepage still features exactly six tools.

</domain>

<decisions>
## Implementation Decisions

### Completeness harness
- Extend existing `src/data/tools.test.ts` and add a ToolIsland coverage test — match current Vitest layout
- Fail a missing island branch by reading `ToolIsland.astro` source and asserting every `TOOLS` slug has a `slug === '…'` branch
- Do not insert the eight new slugs in Phase 1; catalog remains 10 tools; tests lock “every catalog slug has island + EN/ZH markdown”
- Lock featured count: `getFeaturedTools().length === 6`; new tools (when added later) must be `featured: false`

### Island split
- Do not install heavy libs in Phase 1. Document the rule: no `src/lib/index.ts` barrel; heavy deps import only from that tool’s island/`src/lib`. From Phase 3 onward, regress via `dist/_astro/`
- Keep `ToolIsland.astro` static imports. Astro forbids `client:*` on dynamic tags. Light tools stay static; SQL/MD/QR will `import()` inside their island later
- Write the 8-file checklist + island-split rule into `.planning/codebase/CONVENTIONS.md`, plus a short comment next to the tests
- Do not convert the existing ten static imports to dynamic imports

### Catalog tests
- Evolve grouping tests to `=== TOOLS.length`; keep a “currently 10 tools” snapshot assertion that later phases update when they add tools
- Assert each catalog slug has `src/content/tools/{slug}.md` and `src/content/tools/zh/{slug}.md`
- 8-file checklist: catalog row, `src/lib` + test, Preact island, ToolIsland branch, EN/ZH `ui.ts`, `ZH_ERRORS`, EN md, ZH md
- Do not change existing `relatedSlugs` in this phase (CAT-05)

### Phase 1 delivery boundary
- Almost no product-code change. Existing ten islands/pages stay as-is; only tests + `CONVENTIONS.md`
- Prove old tools via existing Vitest green; do not add Playwright or a manual click-through of all ten
- Do not add `INPUT_MAX_BYTES` now — leave it for Phase 6
- CAT-01/02/06 in this phase mean harness + rules that go green as the catalog grows; the eight tools themselves are written in Phases 2–6, not as empty shells here

### Claude's Discretion
Implementation details of how to parse `ToolIsland.astro` in tests (regex vs simple includes), exact CONVENTIONS.md wording, and whether the island-coverage test lives in `tools.test.ts` vs a sibling `ToolIsland.test.ts` that reads the `.astro` file as text.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/data/tools.ts` — `TOOLS`, `getFeaturedTools`, `getRelatedTools`, `getTool`, `getToolsByCategory`
- `src/data/tools.test.ts` — already asserts length 10, unique slugs, featured === 6
- `src/components/tools/ToolIsland.astro` — static import + `slug ===` if-chain with `client:load`
- `src/lib/limits.ts` — `INPUT_MAX_CHARS` only
- Content collections: `src/content/tools/*.md` and `src/content/tools/zh/*.md`

### Established Patterns
- Vitest colocated next to source (`src/data/tools.test.ts`, `src/lib/*.test.ts`)
- Result unions, English lib errors, `ZH_ERRORS` mapping
- Catalog is routing source of truth (`getStaticPaths` from `TOOLS`)
- No `src/lib` barrel today

### Integration Points
- Completeness tests should grow with `TOOLS` so Phase 2–6 keep CI green by adding the 8 files per tool
- Do not touch Preact islands or `[slug].astro` except if a test needs to import nothing from them

</code_context>

<specifics>
## Specific Ideas

User accepted all recommended grey-area answers in autonomous smart discuss. Prefer the smallest Phase 1 diff that makes the contract enforceable in CI.

</specifics>

<deferred>
## Deferred Ideas

- Dynamic `import()` of SQL/Markdown/QR inside their islands — Phases 3, 5, 6
- `dist/_astro/` chunk regression — from first heavy lib (Phase 3)
- `INPUT_MAX_BYTES` — Phase 6
- Eight new catalog rows / markdown / islands — Phases 2–6
- Playwright E2E of existing tools
- Per-slug Astro wrappers for ToolIsland
- Rewiring `relatedSlugs` to future tools

</deferred>
