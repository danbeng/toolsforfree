# Phase 8: Mobile Hamburger Menu - Context

**Gathered:** 2026-09-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Visitors on small screens can open, close, and keyboard-navigate site navigation without a wrapping header. This phase delivers a ≤640px hamburger `<button>` that collapses Tools/Blog/About, `aria-expanded` / `aria-controls` matching open state, EN/ZH control labels via `ui.ts`, Escape-to-close with focus return, and collapsed links that are not keyboard-focusable. Visual only — no `src/lib`, catalog, tool islands, spacing scale, or FAQ rewrite.

</domain>

<decisions>
## Implementation Decisions

### Markup & placement
- Place the hamburger after the logo and before `.nav-links`; ThemeToggle stays a sibling **outside** the collapsible group
- ThemeToggle remains always visible on narrow screens — do not put it inside the drawer (Phase 7 control stays independent)
- Open menu is an overlay panel under the header (`position: absolute`); do not push page content or use a fullscreen drawer
- Implement as static Astro + `is:inline` click/Escape script — not a Preact island, not `<details>`/`<summary>`

### Interaction & a11y
- Collapsed nav uses `inert` **and** `visibility: hidden` so hidden links are not keyboard-focusable (NAV-04)
- Escape closes an open menu and returns focus to the hamburger button (NAV-03)
- Pointer-down outside the header closes the open menu (common hamburger; not in ROADMAP but in scope)
- Do **not** lock body scroll and do **not** add a focus trap — ROADMAP does not require them

### Labels, i18n & breakpoint
- Add `ui.ts` keys `nav.menu` / `nav.close` (NAV-05); Header reads them from a locale prop
- Header gets an optional `locale` prop defaulting to `'en'` (HEAD Header has no locale today; match tool-island pattern)
- Show the hamburger and collapse links at `@media (max-width: 640px)` (NAV-01); wider widths keep the full nav
- Leaving ≤640px force-closes the menu and clears `aria-expanded` so a leftover overlay cannot persist on desktop

### Chrome, HEAD/ZH & out of scope
- Inline 3-line SVG icon (same chrome family as ThemeToggle sun/moon) — no `☰` glyph, no icon pack
- Hit target 44×44, matching `#themeToggle`
- Ship `ui.ts` + Header `locale` prop this phase; **do not** commit the dirty `src/pages/zh/` overlay. EN pages use default `'en'`; future ZH pages pass `'zh'`
- Do not change ThemeToggle, `src/lib`, or the catalog. No focus trap, scroll lock, animation library, or stash pop (`stash@{0}` overlay chrome, `stash@{1}` i18n)

### Claude's Discretion
- Exact overlay panel tokens (background, border, z-index) within existing `--panel` / `--border`
- Exact 3-line SVG path geometry
- Whether `matchMedia('(max-width: 640px)')` listener or `resize` closes on widen — both must force-close
- Whether hamburger lives as `NavMenu.astro` or inline in `Header.astro` (prefer a small dedicated component if Header would exceed current size)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/Header.astro` — sticky header; `.nav-links` with Tools / Blog / About plus Phase 7 `ThemeToggle`
- `src/components/ThemeToggle.astro` — static Astro + `is:inline` click; 44×44 hit target; pattern to clone
- `src/styles/global.css` — `.nav` flex row, `.nav-links { margin-left: auto }`, `#themeToggle` 44px; no hamburger rules yet
- `src/i18n/ui.ts` — EN/ZH dictionaries exist for tools; no `nav.menu` / `nav.close` keys yet
- `src/layouts/BaseLayout.astro` — `<Header />` with no locale prop; `html lang="en"` only on HEAD

### Established Patterns
- Chrome is static Astro, not Preact (`client:load` is tools-only)
- Phase 7: `is:inline` scripts, try/catch around storage, English aria-label on ThemeToggle (ZH deferred until chrome locale exists)
- CSS custom properties; no Tailwind; no new npm packages
- Work from HEAD chrome, not the dirty overlay (`LangSwitch.astro`, `src/pages/zh/`)

### Integration Points
- Hamburger button in Header after logo, before `.nav-links`
- ThemeToggle stays last in the header row (always visible)
- `ui.ts` `nav.menu` / `nav.close` consumed by Header via `locale` prop
- `@media (max-width: 640px)` in `global.css` for collapse; JS only for open/close/Escape/outside/widen
- Future ZH tree can pass `locale="zh"` without this phase committing overlay pages

</code_context>

<specifics>
## Specific Ideas

- Real `<button>` with `aria-expanded` and `aria-controls` (NAV-02) — not a checkbox hack (PROJECT.md Key Decisions updated after Phase 7)
- Two-state open/closed only; no animation library
- Do not pop `stash@{0}` (`gsd-phase7-overlay-chrome-temp`) or `stash@{1}` (`pre-02-01-merge unrelated i18n`)
- Privacy unchanged: no cookies, no server; menu state is DOM-only (not localStorage)

</specifics>

<deferred>
## Deferred Ideas

- Focus trap and body scroll lock — not in ROADMAP; revisit if UAT shows overlay issues
- Committing dirty `src/pages/zh/` / `LangSwitch` — later i18n milestone or overlay merge, not this phase
- ThemeToggle ZH `aria-label` via `ui.ts` — Phase 7 deferred until ZH chrome exists; still out of Phase 8 unless Header locale wiring makes it free (do not expand ThemeToggle unless planner proves zero extra risk)
- Spacing scale (Phase 9), button/FAQ chrome (Phase 10)

</deferred>
