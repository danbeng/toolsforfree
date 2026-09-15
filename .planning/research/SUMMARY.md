# Research Summary: Devtoolbox v1.1 Frontend Polish

**Project:** Devtoolbox — Visual Polish Milestone
**Domain:** Astro 7 + Preact static site — CSS theming, responsive layout, interactive chrome
**Researched:** 2026-09-15
**Confidence:** HIGH

## Executive Summary

This is a **pure frontend polish milestone** on an existing Astro 7 SSG + Preact island static site. The site ships 18 browser-local developer tools with dark-only styling. The milestone adds light/dark theming, a mobile hamburger menu, a 3-column card grid, CSS spacing scale, and interactive element polish — all without changing tool logic or adding new npm packages.

The recommended approach is **CSS custom properties + blocking inline script** for theming, **button + ARIA script** for mobile nav, and **native `<details>` elements** for FAQ collapse. Every feature is achievable with CSS, one inline `<script>` in `<head>`, and ~10 lines of ARIA-sync JS. No new dependencies, no Preact islands for chrome, no build config changes.

The primary risk is **FOUC (Flash of Wrong Theme)** — if the theme init script is not blocking and inline, users see a jarring flash on every page load. Secondary risks include hamburger menu accessibility violations and CSS variable cascade breakage when splitting dark-only tokens into light/dark pairs.

## Key Findings

- **Zero new npm packages needed.** All features use native CSS and minimal inline JS.
- **Theme uses `data-theme` attribute on `<html>`**, not class toggling — more semantic, avoids specificity conflicts.
- **`<script is:inline>` in `<head>`** for FOUC prevention — must be synchronous, before first paint.
- **ThemeToggle is a static Astro component**, not a Preact island — zero reactive state, CSS-driven icon visibility.
- **Hamburger uses `<button>` + ARIA + small inline script** — CSS-only checkbox hack violates WCAG 4.1.2.
- **3-column grid at 1080px** — `repeat(3, 1fr)` inside 64rem container.
- **FAQ switches from `<dl>` to `<details>/<summary>`** — native HTML, zero JS, accessible.
- **Spacing scale is additive** — define `--sp-1` through `--sp-12`, convert existing hardcoded values in same phase.
- **Body grid pattern needs light-mode adaptation** — grid line colors must become CSS variables.

## Stack Additions

**None.** Existing Astro 7 + Preact + CSS custom properties stack is sufficient.

NOT to use: Tailwind, CSS-in-JS, Framer Motion/GSAP, Alpine.js, separate light.css/dark.css.

## Feature Priorities

**Must have (P1):**
- Light/dark CSS variable split
- Theme toggle + localStorage persistence
- Flash-prevention inline script
- Mobile hamburger menu (accessible)
- Card grid 3-col breakpoint
- FAQ `<details>` collapsible
- Button hover/active polish

**Should have (P2):**
- CSS spacing scale (`--sp-1` through `--sp-12`)
- Tool-panel chrome refinement
- Theme-aware body grid pattern
- `color-scheme` property for native widgets

**Defer (v2+):**
- Three-state toggle (auto/light/dark)
- Smooth theme transition on body
- Card grid 4-col at 1440px

## Architecture Decisions

- **`data-theme` on `<html>`** — CSS targets via `:root[data-theme="dark"]` and `:root[data-theme="light"]`
- **New files:** `ThemeInit.astro` (blocking inline script), `ThemeToggle.astro` (static button with SVG)
- **Modified files:** `global.css` (token split + spacing + grid + polish), `BaseLayout.astro` (import ThemeInit), `Header.astro` (import ThemeToggle + hamburger), `FaqList.astro` (dl → details), `ui.ts` (i18n keys)
- **Untouched:** All `src/lib/*.ts`, all `src/components/tools/*.tsx`, `ToolShell.tsx`, `src/data/tools.ts`, `src/content/`, `src/pages/`

## Watch Out For

1. **FOUC** — Blocking `<script is:inline>` in `<head>`; must execute before first paint. **Phase 1.**
2. **Hamburger Accessibility** — `<button>` with `aria-expanded`, `aria-controls`, Escape key handler. **Phase 2.**
3. **CSS Variable Cascade Breakage** — Audit every color value before splitting. Hardcoded colors in `.diff-line`, `.md-preview` are fragile. **Phase 1.**
4. **Body Background Grid** — `rgba(36, 48, 64, 0.35)` assumes dark canvas. Define as CSS variable. **Phase 1.**
5. **Theme Toggle State Desync (EN/ZH)** — localStorage is origin-scoped (works across `/` and `/zh/`), but toggle UI must sync with applied theme. **Phase 1.**

## Implications for Roadmap

### Phase 1: Theme Foundation
Split `global.css` tokens into shared + dark + light via `[data-theme]`. Create `ThemeInit.astro` and `ThemeToggle.astro`. Modify `BaseLayout.astro` and `Header.astro`. Update `ui.ts` i18n keys. Adapt body grid pattern.

### Phase 2: Mobile Hamburger Menu
Add hamburger markup to `Header.astro` with `<button>` + ARIA. Add CSS collapse at 640px. Inline script for `aria-expanded` and Escape key.

### Phase 3: Grid & Spacing
Add spacing scale variables. Add 1080px breakpoint to `.card-grid`. Migrate existing hardcoded spacing values in touched selectors.

### Phase 4: Interactive Chrome
Button hover/active/focus-visible polish. Tool-panel shadow/border refinement. Rewrite `FaqList.astro` from `<dl>` to `<details>/<summary>`. FAQ collapsible styles.

### Phase Ordering Rationale
- Phase 1 first — all other features reference CSS custom properties
- Phase 2 after Phase 1 — shares `Header.astro`
- Phase 3 after Phase 1 — spacing scale used in grid gap definitions
- Phase 4 last — polish pass consumes theme tokens from Phase 1

## Sources

- `.planning/research/STACK.md`
- `.planning/research/FEATURES.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`
- Project codebase: `src/styles/global.css`, `src/components/Header.astro`, `src/components/FaqList.astro`, `src/components/ToolShell.tsx`

---

*Research completed: 2026-09-15*
*Ready for roadmap: yes*
