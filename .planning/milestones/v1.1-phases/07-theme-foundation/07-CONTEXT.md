# Phase 7: Theme Foundation - Context

**Gathered:** 2026-09-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Visitors can use light or dark theme on every page without a flash, and the choice persists across visits and locales. This phase delivers CSS token split, blocking ThemeInit in `<head>`, a static header ThemeToggle, localStorage persistence, OS `prefers-color-scheme` first-visit default, `--grid-line` body pattern, and per-theme `color-scheme`. Visual only — no `src/lib`, catalog, tool islands, hamburger, spacing scale, or FAQ rewrite.

</domain>

<decisions>
## Implementation Decisions

### Light palette & tokens
- Keep current HEAD dark values on `:root`; light only under `:root[data-theme="light"]` — if the init script fails the site still looks like today
- Ship research light-hex table (`#f4f6f8` canvas, teal accent adapted); UI-SPEC / human tweak later
- Tokenize `.diff-line--add/del` as `--diff-add-*` / `--diff-del-*` so both themes stay readable
- Leave QR module colors (`#ffffff` / `#000000`) — scannable contrast is not a theme token

### Theme init & persistence
- ThemeInit always writes `data-theme="light"|"dark"` on `<html>` before first paint
- Do **not** write localStorage on first visit — `setItem` only on toggle so THM-05 still follows OS until the user clicks
- Allowlist stored values (`t === 'light' || t === 'dark'`); invalid/missing falls through to `matchMedia`; `try/catch` around getItem/setItem
- Do **not** listen to `matchMedia('change')` after a stored choice (would fight the user)

### Toggle UI & chrome
- Static `ThemeToggle.astro` + `is:inline` click script — not a Preact island
- Place inside `.nav-links` after About (HEAD Header has no locale / no ZH tree)
- Inline SVG sun/moon; visibility via `global.css` keyed off `[data-theme]`
- English `aria-label="Toggle color theme"` only — skip `ui.ts` until ZH chrome exists

### Grid, HEAD baseline & out of scope
- Add `--grid-line` + 47px/48px repeating gradient on HEAD (HEAD has no grid today); do **not** copy the dirty overlay
- Restore/edit HEAD `global.css` / `BaseLayout` / `Header` only — never the 662-line overlay; do not pop `stash@{0}`
- `color-scheme: dark` on `:root`; `color-scheme: light` on `:root[data-theme="light"]` (not `light dark`)
- New files: `ThemeInit.astro`, `ThemeToggle.astro`. Touch: those + `global.css` + `BaseLayout` + `Header`. Untouched: `src/lib`, catalog, tool islands, ToolShell, pages, hamburger/spacing/FAQ

### Claude's Discretion
- Exact light-theme hex within the research table (UI-SPEC may re-tint)
- Exact `--grid-line` rgba strength (easy CSS tweak)
- `--diff-*` token names
- Inline SVG path details for sun/moon

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/layouts/BaseLayout.astro` — single EN layout; `<head>` currently has charset/viewport/title/description/canonical only
- `src/components/Header.astro` — shared header; `.nav-links` with Tools / Blog / About
- `src/styles/global.css` — HEAD 169-line dark-only tokens (`--bg` `#121417`, `--accent` `#2dd4bf`, `color-scheme: dark`)
- `LangSwitch.astro` exists only in dirty working tree — not HEAD; do not use

### Established Patterns
- CSS custom properties on `:root`; components consume `var(--*)`
- Preact islands only for tools (`client:load`); chrome is static Astro
- No comments in `src/`; PascalCase `.astro` components; relative imports
- Vitest Node `npm test` for `src/lib/*.test.ts` — do not add jsdom theme tests

### Integration Points
- ThemeInit as first `<head>` child in BaseLayout
- ThemeToggle inside Header `.nav-links` after About
- Token cascade covers tool-panel, md-preview, and (after tokenize) diff hunks
- localStorage key `theme` is origin-scoped (will share with future `/zh/`)

</code_context>

<specifics>
## Specific Ideas

- Blocking `<script is:inline>` in `<head>` (THM-04) — Astro processed scripts are bundled; `is:inline` is required
- Two-state toggle only; three-state auto/light/dark deferred to v2
- No smooth theme transition animation
- Work from HEAD commit, not dirty CSS overlay
- Privacy: localStorage-only, no cookies, no server state

</specifics>

<deferred>
## Deferred Ideas

- Three-state toggle (auto/light/dark) — v2
- Smooth theme transition animation — v2
- Hamburger menu — Phase 8
- Card grid 3-col + spacing scale — Phase 9
- Button / tool-panel / FAQ chrome — Phase 10
- ZH `ui.ts` keys / locale Header — when ZH chrome exists
- Full WCAG audit — Phase 10 owns CHR-07

</deferred>
