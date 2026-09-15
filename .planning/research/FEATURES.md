# Feature Research — Visual Polish Milestone

**Domain:** Static developer-tools site (Astro 7 SSG + Preact islands, custom CSS)
**Researched:** 2026-09-15
**Confidence:** HIGH

## Table Stakes (Users Expect These)

Features that are non-negotiable for a developer-facing site in 2026. Missing any of these makes the product feel unfinished.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Dark/light theme toggle | Every major dev tool site (GitHub, VS Code, StackBlitz, CodePen) offers this. Developers with light-sensitivity or bright-office preferences expect it. | MEDIUM | CSS custom-property split on `:root` + class override. JS needed only for toggle click + localStorage. Must run inline before first paint to avoid flash-of-wrong-theme. |
| System preference detection (`prefers-color-scheme`) | Users who never click a toggle still expect the site to match their OS setting. Ignoring this is a visible regression. | LOW | CSS `@media (prefers-color-scheme: dark)` wraps dark-token overrides. Zero JS. Already implicit in current dark-only site; making it explicit is the work. |
| localStorage persistence | Theme choice must survive page navigation and return visits. Without this, the toggle feels broken. | LOW | `localStorage.getItem('theme')` on load, `setItem` on toggle. ~10 lines of JS. Must be in a `<script>` in `<head>` before body renders. |
| Responsive card grid (1 -> 2 -> 3 columns) | Tool catalogs at 2-col on wide screens leave dead space. 3-col at >=1080px is standard for card-heavy layouts. | LOW | Add one `@media (min-width: 1080px)` breakpoint to existing `.card-grid`. Current 720px breakpoint stays. Pure CSS. |
| Mobile hamburger menu | Header nav links wrap awkwardly on narrow screens. Every comparable site collapses to a hamburger at <=640px. | MEDIUM | CSS checkbox-toggle pattern (hidden `<input type="checkbox">` + `<label>` + sibling selector). No JS framework dependency. Needs ARIA `aria-label` and keyboard focus. |
| Focus-visible outlines on interactive elements | Keyboard users need visible focus indicators. Current `focus-visible` rule exists but only on form elements — buttons and cards need it too. | LOW | Extend existing `:focus-visible` rule to `.tool-card`, hamburger toggle, `<details>` summary. |

## Differentiators (Competitive Advantage)

Features that go beyond expectation. These align with the project's "polished, privacy-first" core value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| CSS spacing scale (4/8/12/16/24/32/48) | Consistent vertical rhythm across all pages. Current spacing is ad-hoc (`0.85rem`, `1.15rem`, `2.25rem` etc.). A scale makes future additions consistent by default. | LOW | Define `--sp-1: 4px` through `--sp-7: 48px` as `:root` variables. Replace hardcoded values incrementally. Not a rewrite — just a token layer. |
| Collapsible FAQ via `<details>`/`<summary>` | Current `<dl>` shows all answers flat. `<details>` is native HTML, zero JS, accessible by default, and visually cleaner. | LOW | Replace `<dl>` with `<details>` elements in `FaqList.astro`. Style summary with chevron rotation. |
| Button hover/active micro-interactions | Current buttons have hover (accent fill) but no active press or transition feel. Adding `transform: scale(0.97)` on `:active` and `transition` gives tactile feedback. | LOW | Pure CSS. Add `transition: background var(--ease), transform var(--ease)` and `:active { transform: scale(0.97) }` to `.tool-panel button`. |
| Tool-panel chrome refinement | Current LED + chrome bar is distinctive but borders/shadows are inconsistent across tools. Standardize `box-shadow`, border-radius, and spacing. | LOW | CSS-only adjustments to `.tool-panel`, `.tool-panel__chrome`, `.tool-panel__body`. |
| Theme-aware body grid pattern | Current body background grid lines are dark-only (`rgba(36, 48, 64, 0.35)`). Light mode needs a lighter variant or the grid looks broken. | LOW | Use `var(--grid-line)` CSS token that changes with theme. Two lines of CSS variable definition. |
| Color-scheme meta for native elements | Setting `color-scheme: light` or `dark` makes browser-native scrollbars, form controls, and `<details>` markers match the theme. | LOW | `color-scheme` property on `:root` controlled by the same class toggle. |

## Anti-Features (Commonly Requested, Often Problematic)

Features that seem good for a visual polish milestone but create disproportionate problems.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| Tailwind CSS | "Utility classes make styling faster" | Requires new build config, PostCSS pipeline, and class rewiring of every existing component. Enormous churn for a brownfield site with working custom CSS. | Keep CSS custom properties. Add a spacing scale as variables — same consistency benefit, zero migration. |
| CSS-in-JS (styled-components, Emotion) | "Scoped styles, dynamic theming" | Adds runtime JS bundle, conflicts with Astro's static CSS extraction, and Preact islands don't benefit from it. | Scoped `<style>` blocks in `.astro` files + global CSS variables for theming. Already the project pattern. |
| JS animation library (Framer Motion, GSAP) | "Smooth theme transitions, animated menus" | Adds 10-50KB to every page for effects achievable with CSS `transition`. Violates the "no new framework" constraint. | CSS `transition` on `background-color`, `color`, `transform`. Respect `prefers-reduced-motion`. |
| Auto-detect theme from system + override with no manual option | "Simpler, fewer UI elements" | Users in mixed environments (dark OS, bright room) need manual override. Not offering a toggle is a regression from competitor sites. | Three-state: auto (default) / light / dark. `localStorage` stores `"auto"` | `"light"` | `"dark"`. |
| CSS-only hamburger (no JS at all) | "Zero JavaScript for navigation" | The checkbox hack works visually but `aria-expanded` cannot be toggled without JS. Screen readers get stale state. | Use the checkbox hack for visual toggle + a tiny inline `<script>` (5 lines) that syncs `aria-expanded`. No framework dependency. |
| Animated hamburger-to-X icon | "Looks polished" | Complex CSS for marginal UX gain. The three-bar icon is universally understood. | Keep static hamburger icon. Focus effort on accessible open/close behavior. |
| Separate light.css / dark.css files | "Clean separation" | Doubles the CSS file count, requires conditional loading logic, and makes shared tokens harder to maintain. | Single `global.css` with CSS custom properties. Theme class on `:root` swaps token values. One file, one import. |
| `prefers-color-scheme` only (no manual toggle) | "Respects user choice automatically" | ~15-20% of users want to override their OS setting. Not offering a toggle is a deliberate UX regression. | System detection as default + explicit toggle as override. The two approaches are complementary, not alternatives. |

## Feature Dependencies

```
CSS Spacing Scale (--sp-1..--sp-7)
    └──used-by──> Card Grid 3-col (gap values)
    └──used-by──> Tool Panel Refinement (padding values)
    └──used-by──> Button Polish (padding values)

Theme Tokens (light/dark CSS variables)
    └──used-by──> Body Grid Pattern (var(--grid-line))
    └──used-by──> Tool Panel Refinement (border/shadow colors)
    └──used-by──> Button Polish (hover colors)
    └──used-by──> FAQ Collapsible (summary colors)
    └──used-by──> Card Grid (card background/border)

Theme Toggle (JS + localStorage)
    └──requires──> Theme Tokens (CSS variable split must exist first)
    └──requires──> Inline <script> in <head> (flash prevention)

Hamburger Menu (CSS + minimal ARIA JS)
    └──requires──> Header Component (modifies Header.astro)
    └──independent-of──> Theme Toggle (no dependency)

Card Grid 3-col
    └──requires──> CSS Spacing Scale (for consistent gap)
    └──independent-of──> Theme Toggle (uses same grid class)

FAQ Collapsible
    └──requires──> Theme Tokens (summary styling)
    └──independent-of──> Card Grid
```

### Dependency Notes

- **Theme tokens must come first.** Every other visual feature (panels, buttons, FAQ, cards, body background) references CSS custom properties. Splitting the current dark-only tokens into light/dark pairs is the foundation.
- **Spacing scale is independent but early.** It can be defined before any component changes and used incrementally. Defining it alongside theme tokens avoids a second pass through global.css.
- **Hamburger menu is fully independent.** It touches only `Header.astro` and a small CSS block. Can be done in parallel with theme work.
- **Card grid, buttons, panels, and FAQ all consume theme tokens.** They should be done after the token split, but can be done in any order relative to each other.

## MVP Definition

### Launch With (v1.1)

These are the minimum to ship the "visual polish" milestone as described in PROJECT.md.

- [ ] **Light/dark CSS variable split** — define `--bg`, `--text`, `--muted`, `--border`, `--panel`, `--accent`, `--grid-line` for both themes in `:root` with `.theme-dark` / `.theme-light` class overrides
- [ ] **Theme toggle button in header** — sun/moon icon or text label, toggles class on `<html>`, persists to `localStorage`
- [ ] **Flash-prevention inline script** — `<script>` in `<head>` reads `localStorage` before body paint
- [ ] **Mobile hamburger menu** — collapse `.nav-links` at <=640px, checkbox-toggle pattern, accessible label
- [ ] **Card grid 3-col breakpoint** — `@media (min-width: 1080px) { .card-grid { grid-template-columns: repeat(3, 1fr); } }`
- [ ] **FAQ `<details>` conversion** — replace `<dl>` with `<details>/<summary>` in `FaqList.astro`
- [ ] **Button hover/active polish** — transition + `:active` scale on `.tool-panel button`

### Add After Core Ships (v1.1.x)

These improve consistency but are not blockers for the milestone.

- [ ] **CSS spacing scale variables** — define `--sp-1` through `--sp-7` and replace ad-hoc values incrementally across global.css
- [ ] **Tool-panel chrome refinement** — consistent shadow, border-radius, padding across all tool panels
- [ ] **Theme-aware body grid pattern** — `--grid-line` token swaps between light/dark variants
- [ ] **`color-scheme` property** — set per theme so native browser elements match

### Future Consideration (v1.2+)

- [ ] **Three-state toggle (auto/light/dark)** — adds complexity to toggle UI; two-state (light/dark) with system detection as default is sufficient for launch
- [ ] **Smooth theme transition on body** — `transition: background-color 0.3s, color 0.3s` on `body`; defer until flash prevention is proven stable
- [ ] **Card grid 4-col at >=1440px** — only valuable if catalog grows past 24 tools

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Light/dark CSS variable split | HIGH | MEDIUM | P1 |
| Theme toggle + localStorage | HIGH | LOW | P1 |
| Flash-prevention script | HIGH | LOW | P1 |
| Mobile hamburger menu | HIGH | MEDIUM | P1 |
| Card grid 3-col breakpoint | MEDIUM | LOW | P1 |
| FAQ `<details>` collapsible | MEDIUM | LOW | P1 |
| Button hover/active polish | LOW | LOW | P1 |
| CSS spacing scale | MEDIUM | LOW | P2 |
| Tool-panel chrome refinement | LOW | LOW | P2 |
| Theme-aware body grid | MEDIUM | LOW | P2 |
| `color-scheme` property | LOW | LOW | P2 |
| Three-state toggle | LOW | MEDIUM | P3 |
| Smooth theme transition | LOW | LOW | P3 |

**Priority key:**
- P1: Must ship for milestone to be considered complete
- P2: Should ship; improves consistency but not a blocker
- P3: Nice to have; defer to next milestone if time-pressured

## Competitor Feature Analysis

| Feature | Dev.to | CodePen | StackBlitz | Devtoolbox (Ours) |
|---------|--------|---------|------------|-------------------|
| Dark/light toggle | Yes (3-state) | Yes | Yes (auto + manual) | P1: 2-state toggle with system detection default |
| Mobile hamburger | Yes | Yes | Yes | P1: CSS checkbox + ARIA sync |
| Card grid | 3-col responsive | Masonry | 3-col | P1: 1->2->3 breakpoint system |
| Spacing scale | Custom | Tailwind-based | Custom tokens | P2: CSS variable scale (4-48px) |
| Collapsible FAQ | N/A | N/A | N/A | P1: native `<details>` |

## Implementation Notes

### Theme Toggle: Flash Prevention Pattern

The most critical implementation detail. Without this, users see a flash of the wrong theme on every page load.

```html
<!-- In <head>, before any visible content -->
<script>
  (function() {
    var t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.classList.add('theme-' + t);
    }
    // else: no class added, CSS @media(prefers-color-scheme) takes over
  })();
</script>
```

This script must be inline (not `src=`) and must execute synchronously before `<body>`.

### Hamburger Menu: CSS Checkbox Pattern

```html
<input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle navigation" />
<label for="nav-toggle" class="hamburger" aria-hidden="true">
  <span></span><span></span><span></span>
</label>
<nav class="nav-links">...</nav>
```

```css
.nav-toggle { display: none; }
@media (max-width: 640px) {
  .nav-toggle { /* visually hidden but focusable */ }
  .hamburger { display: flex; }
  .nav-links { display: none; }
  .nav-toggle:checked ~ .nav-links { display: flex; }
}
```

Plus a tiny inline script to sync `aria-expanded` on the checkbox change event.

### Card Grid: Third Breakpoint

```css
.card-grid { grid-template-columns: 1fr; }
@media (min-width: 720px) { .card-grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1080px) { .card-grid { grid-template-columns: repeat(3, 1fr); } }
```

### Spacing Scale Tokens

```css
:root {
  --sp-1: 4px;   /* tight */
  --sp-2: 8px;   /* compact */
  --sp-3: 12px;  /* default-small */
  --sp-4: 16px;  /* default */
  --sp-5: 24px;  /* comfortable */
  --sp-6: 32px;  /* spacious */
  --sp-7: 48px;  /* section gap */
}
```

These map to the existing ad-hoc values: `0.85rem` ~ `--sp-3`, `1.25rem` ~ `--sp-4`, `2.25rem` ~ `--sp-5`.

## Sources

- Current codebase: `src/styles/global.css`, `src/components/Header.astro`, `src/components/FaqList.astro`, `src/components/ToolShell.tsx`
- PROJECT.md requirements and constraints
- CSS `color-scheme` spec: https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme
- `<details>` HTML spec: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details
- `prefers-color-scheme` spec: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme

---
*Feature research for: Devtoolbox v1.1 Frontend Polish*
*Researched: 2026-09-15*
