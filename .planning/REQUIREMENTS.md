# Requirements: Devtoolbox — Frontend Polish

**Defined:** 2026-09-15
**Core Value:** A visitor gets a polished, accessible, responsive experience across all 18 tools and every page — light or dark theme, desktop or mobile — without compromising the browser-local privacy model.

## v1.1 Requirements

### Theme

- [x] **THM-01**: CSS custom properties split into shared + dark (`:root`) + light (`:root[data-theme="light"]`) tokens
- [x] **THM-02**: Theme toggle button in header with sun/moon icon, toggles `data-theme` on `<html>`
- [x] **THM-03**: Theme preference persisted to `localStorage` and restored on page load
- [x] **THM-04**: Blocking `<script is:inline>` in `<head>` reads `localStorage` before first paint (no FOUC)
- [x] **THM-05**: System preference detection via `prefers-color-scheme` when no `localStorage` entry exists
- [x] **THM-06**: Body grid-line background adapted for light mode via CSS variable (`--grid-line`)
- [x] **THM-07**: `color-scheme` property set per theme for native widget theming (scrollbar, inputs)

### Navigation

- [x] **NAV-01**: Hamburger menu button visible at ≤640px, collapses nav links
- [x] **NAV-02**: Hamburger uses `<button>` with `aria-expanded` and `aria-controls` attributes
- [x] **NAV-03**: Escape key closes hamburger menu and returns focus to button
- [x] **NAV-04**: Hidden nav links are not focusable when menu is collapsed (via `inert` or `visibility: hidden`)
- [x] **NAV-05**: Menu toggle label localized in EN and ZH (`ui.ts` keys)

### Layout

- [x] **LAY-01**: Card grid 3-column layout at ≥1080px breakpoint (existing 720px 2-col unchanged)
- [x] **LAY-02**: CSS spacing scale variables defined (`--sp-1` through `--sp-12`: 4/8/12/16/24/32/48/64/80/96/120/144px)
- [x] **LAY-03**: Existing hardcoded spacing values in touched selectors migrated to spacing scale tokens

### Chrome

- [x] **CHR-01**: Button `:hover` state with visible background/color transition
- [x] **CHR-02**: Button `:active` state with pressed appearance (slight scale or darken)
- [x] **CHR-03**: Button `:focus-visible` ring consistent with site accent color
- [x] **CHR-04**: Tool-panel border/shadow refined for both light and dark themes
- [x] **CHR-05**: FAQ rewritten from `<dl>` to `<details>/<summary>` with native collapse behavior
- [x] **CHR-06**: FAQ `<details>` styled with open/close indicator (CSS `::marker` or custom)
- [x] **CHR-07**: All chrome elements have sufficient contrast in both themes (WCAG AA 4.5:1)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Three-state toggle (auto/light/dark) | Two-state sufficient for v1.1; defer to v2 |
| Smooth theme transition animation | Defer until flash prevention proven stable |
| Card grid 4-col at 1440px | Only if catalog grows past 24 tools |
| Full WCAG audit | Fix obvious issues only, not a comprehensive pass |
| Tailwind / CSS-in-JS / animation libs | Stay with custom CSS variables |
| New npm packages | CSS-only approach confirmed by research |
| Tool logic changes (`src/lib/*`) | Visual layer only |
| New tool additions | This milestone is pure visual polish |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| THM-01 | Phase 7 | Complete |
| THM-02 | Phase 7 | Complete |
| THM-03 | Phase 7 | Complete |
| THM-04 | Phase 7 | Complete |
| THM-05 | Phase 7 | Complete |
| THM-06 | Phase 7 | Complete |
| THM-07 | Phase 7 | Complete |
| NAV-01 | Phase 8 | Complete |
| NAV-02 | Phase 8 | Complete |
| NAV-03 | Phase 8 | Complete |
| NAV-04 | Phase 8 | Complete |
| NAV-05 | Phase 8 | Complete |
| LAY-01 | Phase 9 | Complete |
| LAY-02 | Phase 9 | Complete |
| LAY-03 | Phase 9 | Complete |
| CHR-01 | Phase 10 | Complete |
| CHR-02 | Phase 10 | Complete |
| CHR-03 | Phase 10 | Complete |
| CHR-04 | Phase 10 | Complete |
| CHR-05 | Phase 10 | Complete |
| CHR-06 | Phase 10 | Complete |
| CHR-07 | Phase 10 | Complete |

**Coverage:**

- v1.1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-15*
*Last updated: 2026-09-15 after initial definition*
