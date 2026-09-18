# Roadmap: Devtoolbox — Frontend Polish

## Overview

v1.0 shipped 18 browser-local tools. v1.1 is a visual-only polish pass: light/dark theme with no flash, an accessible mobile hamburger, a wider catalog grid with a spacing scale, then button/panel/FAQ chrome — CSS variables plus tiny inline scripts, no new packages, no `src/lib` changes.

## Milestones

- ✅ **v1.0 More Tools** — Phases 1-6 (shipped 2026-09-14)
- 🚧 **v1.1 Frontend Polish** — Phases 7-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 More Tools (Phases 1-6) — SHIPPED 2026-09-14</summary>

- [x] Phase 1: Additive tool contract (1/1 plans) — completed 2026-09-11
- [x] Phase 2: Light text and generate tools (4/4 plans) — completed 2026-09-12
- [x] Phase 3: SQL formatter (1/1 plans) — completed 2026-09-13
- [x] Phase 4: Text Diff (1/1 plans) — completed 2026-09-13
- [x] Phase 5: Markdown preview (1/1 plans) — completed 2026-09-14
- [x] Phase 6: QR generate and decode (1/1 plans) — completed 2026-09-14

</details>

Archive: `.planning/milestones/v1.0-ROADMAP.md`

- [x] **Phase 7: Theme Foundation** - Light/dark CSS tokens, header toggle, persistence, no FOUC (completed 2026-09-16)
- [x] **Phase 8: Mobile Hamburger Menu** - Accessible ≤640px nav collapse on EN and ZH (completed 2026-09-16)
- [x] **Phase 9: Grid & Spacing** - 3-column catalog at ≥1080px and spacing scale tokens (completed 2026-09-18)
- [ ] **Phase 10: Interactive Chrome** - Button states, tool-panel polish, collapsible FAQ

## Phase Details

### Phase 7: Theme Foundation

**Goal**: Visitors can use light or dark theme on every page without a flash, and the choice persists across visits and locales
**Depends on**: Nothing (v1.0 complete)
**Requirements**: THM-01, THM-02, THM-03, THM-04, THM-05, THM-06, THM-07
**Success Criteria** (what must be TRUE):

  1. Visitor can toggle light and dark from the header (sun/moon control) on both EN and ZH pages; the document restyles immediately via `data-theme` on `<html>`
  2. Visitor's chosen theme is restored on the next page load with no flash of the wrong theme
  3. First-time visitor with no stored preference sees a theme matching their OS `prefers-color-scheme`
  4. Light theme shows an adapted body grid-line background, and native widgets (scrollbar, inputs) follow the active `color-scheme`

**Plans**: 1/1 plans executed

Plans:

- [x] 07-01-PLAN.md — FOUC-safe light/dark tokens, ThemeInit, header ThemeToggle, persistence, grid, color-scheme

**UI hint**: yes

### Phase 8: Mobile Hamburger Menu

**Goal**: Visitors on small screens can open, close, and keyboard-navigate site navigation without a wrapping header
**Depends on**: Phase 7
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05
**Success Criteria** (what must be TRUE):

  1. At ≤640px, visitor sees a hamburger button and header nav links are collapsed; at wider widths the full nav stays visible
  2. Visitor can open and close the menu with a real `<button>`; `aria-expanded` / `aria-controls` match the open state; the control label is EN or ZH to match the page
  3. Visitor can close the open menu with Escape and focus returns to the hamburger button
  4. When the menu is collapsed, hidden nav links are not keyboard-focusable

**Plans**: 1/1 plans executed

Plans:

- [x] 08-01-PLAN.md — Accessible ≤640px hamburger, overlay, EN/ZH labels, Escape/inert/widen

**UI hint**: yes

### Phase 9: Grid & Spacing

**Goal**: Catalog cards use a three-column layout on wide screens and spacing follows one token scale
**Depends on**: Phase 7
**Requirements**: LAY-01, LAY-02, LAY-03
**Success Criteria** (what must be TRUE):

  1. Visitor viewing home/catalog at ≥1080px sees a 3-column card grid; the existing 2-column layout at ≥720px and <1080px is unchanged
  2. Visitor sees consistent gaps, padding, and margins on touched layout (the 4/8/12/16/24/32/48px rhythm) instead of one-off pixel values
  3. Cards and sections do not overlap or collapse after spacing tokens replace hardcoded values in those selectors

**Plans:** 1/1 plans complete

Plans:

- [x] 09-01-PLAN.md — HEAD catalog .card-grid, --sp-* tokens, layout-only card chrome

**UI hint**: yes

### Phase 10: Interactive Chrome

**Goal**: Buttons, tool panels, and FAQs feel polished and readable in both themes
**Depends on**: Phase 7, Phase 9
**Requirements**: CHR-01, CHR-02, CHR-03, CHR-04, CHR-05, CHR-06, CHR-07
**Success Criteria** (what must be TRUE):

  1. Visitor sees button hover, pressed (`:active`), and keyboard `:focus-visible` states using the site accent
  2. Visitor sees tool panels with consistent borders and shadows that remain readable in both light and dark themes
  3. Visitor can expand and collapse FAQ items natively, with a visible open/close indicator
  4. Chrome text and controls meet WCAG AA contrast (4.5:1) in both themes

**Plans:** 1 plans

Plans:
- [ ] 10-01-PLAN.md — HEAD FAQ details/summary, tool-panel shadow/--sp-4, button hover/active

**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 7. Theme Foundation | 1/1 | Complete    | 2026-09-16 |
| 8. Mobile Hamburger Menu | 1/1 | Complete    | 2026-09-16 |
| 9. Grid & Spacing | 1/1 | Complete    | 2026-09-18 |
| 10. Interactive Chrome | 0/1 | Not started | - |
