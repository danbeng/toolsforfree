# Phase 9: Grid & Spacing - Context

**Gathered:** 2026-09-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Catalog cards use a three-column layout on wide screens and spacing follows one token scale. This phase delivers `.card-grid` on home featured tools and `/tools/` category lists (1-col default, 2-col at ≥720px, 3-col at ≥1080px), `--sp-1` through `--sp-12` tokens, and migration of touched layout selectors (grid gap, tool-card padding, wrap padding, nav gap) onto that scale. Visual only — no `src/lib`, catalog data, hamburger rewrite, FAQ, or button chrome.

</domain>

<decisions>
## Implementation Decisions

### Catalog grid markup
- Wrap home featured tools and `/tools/` per-category lists in `.card-grid` (LAY-01 home/catalog)
- Breakpoints: 1 column default; `min-width: 720px` → 2 columns (same as existing `.tool-grid.split`); `min-width: 1080px` → 3 columns
- CSS `display: grid` + tokenized `gap`; cards `min-width: 0` so long titles wrap instead of overflowing
- Add wrappers on HEAD `src/pages/index.astro` and `src/pages/tools/index.astro` only — do not import overlay hero/kicker markup

### Spacing scale tokens
- Define `--sp-1`…`--sp-12` as 4/8/12/16/24/32/48/64/80/96/120/144px on `:root` (LAY-02)
- Migrate touched layout selectors only: `.card-grid` gap, `.tool-card` padding, `.wrap` horizontal padding, `.nav` gap (LAY-03)
- Do **not** retokenize `.tool-panel`, `.diff-lines`, `.md-preview` (Phase 10)
- Convert existing `1rem` / `1.25rem` in touched selectors to nearest `--sp-*` (16px / 24px)

### Card chrome (layout-only)
- Minimal `.tool-card`: `display: block`, padding `--sp-4`, `border: 1px solid var(--border)`, background `var(--panel)`; hover may use existing `--accent` text color — no new button `:active` / focus ring (Phase 10)
- Keep HEAD `ToolCard.astro` content (`<strong>` + shortDescription); do not add overlay eyebrow/locale
- Each `/tools/` category `<section>` gets its own `.card-grid`; space `h2` from the grid with `--sp-4` / `--sp-6`
- Keep `.tool-grid` for in-tool split panes; catalog uses `.card-grid` only

### HEAD vs overlay & out of scope
- Edit HEAD English pages only; **do not** commit dirty `src/pages/zh/`
- Use `@media (min-width: 1080px)` to match the existing 720px convention
- No 4-col at 1440px, no spacing animation, no `src/lib` / `TOOLS` data changes, no stash pop, no FAQ/button chrome
- Keep HEAD `--content` max-width; 3 columns fit inside the current canvas

### Claude's Discretion
- Exact `.tool-card` hover (color only vs border-color) within `--accent` / `--border`
- Whether `.card-grid` gap is `--sp-4` (16px) or `--sp-5` (24px) — pick one and use it on both home and catalog
- Whether nav `gap: 1.25rem` becomes `--sp-5` (24px) or `--sp-4` (16px)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- HEAD `src/pages/index.astro` — featured tools mapped as sibling `ToolCard`s with **no** grid wrapper
- HEAD `src/pages/tools/index.astro` — per-category `<section>` with sibling `ToolCard`s, no grid
- HEAD `src/components/ToolCard.astro` — `<a class="tool-card">` with `tool.name` + `tool.shortDescription`; no locale prop
- `src/styles/global.css` — `.tool-grid` is 1-col / 2-col at 720px for **tool islands**, not catalog cards; no `.card-grid` yet
- Phase 7/8 chrome: `--bg` / `--panel` / `--border` / `--accent`; hamburger overlay already uses literal 8/16px (leave those unless they sit on a touched selector)

### Established Patterns
- CSS custom properties on `:root`; components consume `var(--*)`
- Chrome is static Astro; no Tailwind; no new npm packages
- Work from HEAD, not dirty overlay (`LangSwitch`, `src/pages/zh/`, locale-aware ToolCard)

### Integration Points
- `.card-grid` class in `global.css`; wrappers in HEAD home + tools index
- `--sp-*` on `:root` next to existing color tokens
- `.tool-card` rules in `global.css` (currently none on HEAD)
- Do not change `src/data/tools.ts`

</code_context>

<specifics>
## Specific Ideas

- 720px 2-col must remain for mid-width; 1080px is additive
- Cards and sections must not overlap after token swap
- Dirty overlay `index.astro` already has `.card-grid` + locale — do not treat it as HEAD

</specifics>

<deferred>
## Deferred Ideas

- Card grid 4-col at 1440px — v2
- Committing dirty `src/pages/zh/` catalog pages — later i18n merge
- Tool-panel / FAQ / button chrome spacing — Phase 10
- Overlay hero / kicker / eyebrow ToolCard — out of this milestone unless a later visual pass owns it

</deferred>
