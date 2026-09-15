# Stack Research

**Domain:** Astro 7 + Preact static site -- visual polish milestone (light/dark theme, mobile nav, responsive grid, spacing scale, interactive chrome)
**Researched:** 2026-09-15
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

This milestone requires **zero new npm packages**. Every feature is achievable with CSS custom properties, media queries, CSS Grid, and a small inline `<script>` in the Astro layout. The existing stack is already sufficient.

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| CSS Custom Properties | native | Light/dark theme tokens, spacing scale | Already in use (`:root` variables in `global.css`); split into `@media (prefers-color-scheme)` blocks + a `.light` class override for manual toggle |
| CSS `color-scheme` | native | Browser-native dark/light form controls and scrollbars | One declaration per theme; signals UA to adjust built-in widgets |
| `@media (prefers-color-scheme)` | native | System preference detection | Zero JS; respects OS setting as the default before any toggle interaction |
| CSS Grid | native | Responsive card grid (1/2/3 columns) | Already in use (`.card-grid`); add one more breakpoint at 1080px |
| CSS `:has()` + `<details>` | native | FAQ collapsible | Replace `<dl>` with `<details><summary>` pattern; no JS needed |

### Supporting Libraries

None required. The following are already installed and sufficient:

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| astro | ^7.3.2 | Static site generation, content collections | Already installed -- no upgrade needed |
| preact | ^10.29.8 | Interactive islands (tools) | Already installed -- no upgrade needed |
| @astrojs/preact | ^6.0.5 | Astro-Preact integration | Already installed -- no upgrade needed |

### Theme Toggle Mechanism

**Approach:** Inline `<script>` in `BaseLayout.astro` (not a Preact island).

**Why not a Preact island:** The theme toggle is a single boolean toggle with no reactive state, no rendering logic, and no interaction with tool computation. A 15-line inline script is smaller than the Preact hydration payload. Astro's `is:inline` directive keeps it out of the bundle.

**Pattern:**

```html
<!-- In BaseLayout.astro <head>, before any render -->
<script is:inline>
  const stored = localStorage.getItem('theme');
  const prefers = matchMedia('(prefers-color-scheme: light)').matches;
  if (stored === 'light' || (!stored && prefers)) {
    document.documentElement.classList.add('light');
  }
</script>
```

This runs synchronously before first paint (no FOUC). The toggle button in `Header.astro` flips the class and writes to `localStorage`.

### CSS Token Architecture

**Current state:** All tokens live in `:root` with `color-scheme: dark`. One set of values.

**Target state:** Dark as default (unchanged), `.light` class on `<html>` overrides color tokens.

```css
:root {
  color-scheme: dark;
  /* existing dark tokens stay as-is */
}

:root.light {
  color-scheme: light;
  --bg: #f8f9fb;
  --bg-elev: #ffffff;
  --panel: #f0f2f5;
  --text: #1a1e24;
  --muted: #5a6672;
  --border: #d4dbe4;
  --accent: #0d8f83;
  --accent-dim: #e0f5f2;
  --danger: #d93b45;
  --led: #0d8f83;
}
```

Also override body background-image for light mode (the grid-line pattern needs lighter opacity).

### Spacing Scale

**Approach:** CSS custom properties, not a library.

```css
:root {
  --sp-1: 0.25rem;   /* 4px */
  --sp-2: 0.5rem;    /* 8px */
  --sp-3: 0.75rem;   /* 12px */
  --sp-4: 1rem;      /* 16px */
  --sp-6: 1.5rem;    /* 24px */
  --sp-8: 2rem;      /* 32px */
  --sp-12: 3rem;     /* 48px */
}
```

Adopt incrementally: replace hardcoded `rem` values in `.card-grid`, `.tool-panel`, `.hero`, `.faq`, etc. Not a one-shot rewrite -- phase by phase.

### Hamburger Menu

**Approach:** CSS checkbox hack + `<label>`. No JS framework dependency.

**Why CSS-only:** Works with Astro's static output. The checkbox state toggles `nav-links` visibility via `~` sibling selector. Keyboard-accessible via `<label for="nav-toggle">` with `role="button"` and `aria-expanded`. A small inline script syncs `aria-expanded` for screen readers.

**Breakpoint:** Collapse at `@media (max-width: 640px)`.

**Integration point:** `Header.astro` -- add the checkbox input before `.nav-links`, style the `<label>` as the hamburger icon with CSS `content` or SVG.

### Card Grid Breakpoints

**Current:** 1-col default, 2-col at 720px.

**Target:**

```css
.card-grid {
  grid-template-columns: 1fr;
}
@media (min-width: 720px) {
  .card-grid { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 1080px) {
  .card-grid { grid-template-columns: 1fr 1fr 1fr; }
}
```

1080px chosen because: at 3 columns with 0.85rem gap inside a 64rem max-width container, each card gets ~20rem (320px) -- enough for the current card content (eyebrow + title + description).

### Button/Panel Polish

**No new libraries.** CSS pseudo-classes only:

- `button:hover:not(:disabled)` -- already exists, refine `background` transition
- `button:active:not(:disabled)` -- add `transform: scale(0.97)` for tactile feedback
- `button:focus-visible` -- already exists, ensure consistent across all interactive elements
- `.tool-panel` -- add subtle `box-shadow` in light mode (dark mode keeps flat borders)

### FAQ Collapsible

**Replace `<dl>` with `<details><summary>` in `FaqList.astro`.** This is native HTML, no JS needed.

```astro
<details class="faq-item">
  <summary>{item.question}</summary>
  <p>{item.answer}</p>
</details>
```

Style with CSS: custom marker, smooth open/close via `details[open] summary ~ *`.

## Installation

```bash
# No new packages to install.
# All changes are in:
#   src/styles/global.css       (tokens, theme, grid, spacing, polish)
#   src/layouts/BaseLayout.astro (inline theme script)
#   src/components/Header.astro  (hamburger menu, theme toggle button)
#   src/components/FaqList.astro (<details> instead of <dl>)
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| CSS custom properties for theme | `prefers-color-scheme` media queries only | If you never need a manual toggle -- media queries alone cannot persist user choice |
| CSS checkbox hamburger | JS-based hamburger (Preact island or Alpine) | If you need complex animation (e.g., slide-out drawer with overlay). The checkbox hack is simpler but limited to show/hide |
| Inline `<script is:inline>` | Preact island for theme toggle | If the toggle needs to participate in reactive UI (e.g., changing icon based on theme state rendered by Preact). The inline script is smaller |
| CSS Grid 3-col breakpoint | CSS container queries | If card layout should respond to container width, not viewport. Container queries are newer but add complexity for a layout that only appears in full-width contexts |
| `<details>/<summary>` | JS accordion component | If you need animation on open/close, exclusive-open behavior (only one FAQ open at a time), or custom easing. `<details>` is zero-JS but limited styling |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Tailwind CSS | Adds ~300KB of utility classes to a site that already has a working 660-line CSS file. Config overhead, build step change, and the existing custom property architecture is cleaner for a theme toggle | CSS custom properties + existing `global.css` |
| CSS-in-JS (styled-components, Emotion, vanilla-extract) | Runtime cost, hydration mismatch risk with Astro SSG, breaks the "no JS for chrome" principle | Scoped `<style>` blocks in `.astro` files + `global.css` |
| Framer Motion / GSAP / any animation library | Adds 15-50KB for transitions achievable with CSS `transition` + `transform`. The site already uses `var(--ease)` | CSS `transition` property (already in use) |
| Alpine.js / Petite-Vue | Adds a reactive framework for two interactions (theme toggle, hamburger). Overkill when a 15-line inline script and CSS checkbox hack suffice | Inline `<script is:inline>` + CSS `:checked` selector |
| Open Props / other CSS token libraries | A full token system when you only need 7 spacing values and 10 color pairs. Adds a dependency for what is 20 lines of custom properties | Hand-written CSS custom properties in `:root` |
| PostCSS plugins (autoprefixer, etc.) | Astro 7 handles vendor prefixing via Vite/esbuild. Adding PostCSS is redundant | Let Astro's built-in bundler handle it |

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| astro ^7.3.2 | Vite 6.x (bundled) | Handles CSS modules, scoped styles, `is:inline` scripts. No CSS toolchain needed |
| preact ^10.29.8 | @astrojs/preact ^6.0.5 | Already paired correctly. No changes needed for this milestone |
| TypeScript ^7.0.2 | astro ^7.3.2 | Type-checking `.astro` frontmatter and `.tsx` components. No TS config changes needed |

## Integration Points

| Feature | Files Modified | Integration Detail |
|---------|---------------|-------------------|
| Light/dark tokens | `src/styles/global.css` | Add `:root.light` block overriding color tokens; adjust `body` background-image for light mode |
| Theme toggle script | `src/layouts/BaseLayout.astro` | Inline `<script is:inline>` in `<head>` (before paint, no FOUC) |
| Theme toggle button | `src/components/Header.astro` | Button in `.nav-links` or new `.nav-actions` container; toggles `.light` on `document.documentElement` and writes `localStorage` |
| Hamburger menu | `src/components/Header.astro` | Hidden checkbox + label at `max-width: 640px`; `.nav-links` collapses to vertical dropdown |
| 3-col grid | `src/styles/global.css` | Add `@media (min-width: 1080px)` rule to `.card-grid` |
| Spacing scale | `src/styles/global.css` | Add `--sp-*` variables to `:root`; adopt incrementally in component styles |
| Button polish | `src/styles/global.css` | Add `:active` state, refine `transition`, add light-mode `box-shadow` |
| Panel polish | `src/styles/global.css` | Light-mode `box-shadow` for `.tool-panel`; consistent border-radius |
| FAQ collapsible | `src/components/FaqList.astro` | Replace `<dl>` with `<details><summary>`; style in `global.css` |

## Sources

- Project codebase: `src/styles/global.css` (663 lines, current token architecture), `src/components/Header.astro` (49 lines, current nav structure), `src/components/FaqList.astro` (18 lines, current FAQ markup)
- Astro docs (Context7: /withastro/docs) -- `is:inline` script directive, scoped styles, static output
- CSS `color-scheme` spec (MDN) -- native dark/light form control signaling
- CSS `prefers-color-scheme` spec (MDN) -- system preference detection
- CSS `:checked` sibling selector pattern -- standard CSS-only hamburger technique

---
*Stack research for: Devtoolbox v1.1 Frontend Polish milestone*
*Researched: 2026-09-15*
