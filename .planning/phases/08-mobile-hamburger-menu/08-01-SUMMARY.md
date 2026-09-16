---
phase: 08-mobile-hamburger-menu
plan: 01
subsystem: ui
tags: [astro, hamburger, aria, matchMedia, inert, i18n]

requires:
  - phase: 07-theme-foundation
    provides: ThemeToggle sibling chrome and HEAD global.css tokens
provides:
  - Accessible max-width 640px hamburger overlay for Tools/Blog/About
  - NavMenu.astro is:inline disclosure with Escape, pointerdown, matchMedia, inert
  - Nested en/zh nav.menu and nav.close in ui.ts
affects: [09-card-grid, 10-chrome-polish, zh-header-locale]

actuals:
  tokens: 1366
  tasks: 3
  commits: 2

plan_head_before: ae395487b145adf6dc3045a31827dc9cf9669bf8

tech-stack:
  added: []
  patterns:
    - Static Astro + is:inline IIFE for chrome (clone ThemeToggle, DOMContentLoaded boot)
    - Nested ui.ts nav keys baked into data-label-* then swapped with setAttribute
    - Overlay via CSS max-width 640px plus inert only while that query matches

key-files:
  created:
    - src/components/NavMenu.astro
  modified:
    - src/components/Header.astro
    - src/styles/global.css
    - src/i18n/ui.ts

key-decisions:
  - "Hamburger lives in dedicated NavMenu.astro; links stay in Header #navMenu"
  - "Boot #navMenu work on DOMContentLoaded because classic is:inline runs before the sibling"
  - "inert is set only when max-width 640px matches and the menu is closed"
  - "Worked from HEAD chrome; did not pop stash or commit src/pages/zh or LangSwitch"

patterns-established:
  - "Pattern: chrome disclosure is static Astro + is:inline IIFE, not a Preact island"
  - "Pattern: locale strings via t(locale).nav.* and data-label-* attribute copy"

requirements-completed: [NAV-01, NAV-02, NAV-03, NAV-04, NAV-05]

coverage:
  - id: D1
    description: "NavMenu button + Header DOM order + 640px overlay visibility + nested EN/ZH nav labels"
    requirement: NAV-01
    verification:
      - kind: unit
        ref: "npm test (155 tests, 23 files)"
        status: pass
      - kind: other
        ref: "rg NavMenu/navMenu/ThemeToggle/is:inline/navToggle/aria-controls/inert/DOMContentLoaded/Escape/pointerdown/matchMedia/max-width: 640px/Open menu/打开菜单"
        status: pass
    human_judgment: false
  - id: D2
    description: "44px #navToggle box and overlay panel tokens (z-index 20, column, --panel, --border)"
    requirement: NAV-01
    verification:
      - kind: other
        ref: "rg #navToggle, max-width: 640px, z-index: 20, flex-direction: column, visibility: hidden, display: none in src/styles/global.css"
        status: pass
      - kind: unit
        ref: "npm test"
        status: pass
    human_judgment: false
  - id: D3
    description: "Production HTML inlines navToggle; no storage, innerHTML, Preact, or new packages"
    requirement: NAV-02
    verification:
      - kind: other
        ref: "npm run build && rg navToggle dist --glob *.html"
        status: pass
      - kind: other
        ref: "negative rg setItem/innerHTML/document.cookie/localStorage/preact/client:load; package.json matches HEAD; no src/lib/nav.ts"
        status: pass
    human_judgment: false
  - id: D4
    description: "At 640px one header row, Escape/outside-pointer close, tab order, widen force-close"
    requirement: NAV-03
    verification: []
    human_judgment: true
    rationale: "Needs a real viewport, focus, and pointer — Task 3 human-check; harvested at end-of-phase UAT"

duration: 9min
completed: 2026-09-16
status: complete
---

# Phase 8 Plan 01: Mobile Hamburger Menu Summary

**Accessible 640px hamburger overlay on HEAD chrome: static NavMenu button, inert+visibility hide, Escape/outside-pointer/widen close, EN/ZH labels from ui.ts**

## Performance

- **Duration:** 9 min
- **Started:** 2026-09-16T07:23:40Z
- **Completed:** 2026-09-16T07:32:58Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Visitor at max-width 640px gets a real `#navToggle` button that opens Tools/Blog/About as an overlay under `header.site`
- Collapsed links are not focusable (`inert` on `#navMenu` plus `visibility: hidden`); widen past 640px removes leftover inert
- Escape closes and returns focus to `#navToggle`; pointer-down outside `header.site` closes without a focus trap
- Control names come from nested `ui.ts` `nav.menu` / `nav.close` on en and zh, swapped via `data-label-*`

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end hamburger open/close — one path** - `0d12a31` (feat)
2. **Task 2: Hamburger 44px chrome and overlay panel tokens** - `4d42f52` (feat)
3. **Task 3: Production inline menu script and safety gates** - verification only (working tree already clean)

**Plan metadata:** pending docs commit

_Note: Task 3 did not change files after Task 2._

## Files Created/Modified

- `src/components/NavMenu.astro` - `#navToggle` 3-line SVG plus is:inline IIFE (click, Escape, pointerdown, matchMedia, inert)
- `src/components/Header.astro` - optional locale default en; DOM order logo, NavMenu, `#navMenu`, ThemeToggle sibling
- `src/styles/global.css` - `#navToggle` 44px default display none; 640px overlay panel tokens
- `src/i18n/ui.ts` - nested `nav.menu` / `nav.close` on en and zh

## Decisions Made

- Dedicated `NavMenu.astro` for the button and script; links remain in Header so `#navMenu` is the collapsible group
- Classic `is:inline` boots on `DOMContentLoaded` because `#navMenu` is a later sibling
- `inert` only while `(max-width: 640px)` matches and the menu is closed
- Restored HEAD Header and global.css before edits; did not pop stash or commit overlay pages

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 8 plan 01 is the only plan; chrome hamburger is on the agent branch for merge
- Manual 640px keyboard/viewport checklist is Task 3 human-check for `/gsd-verify-work`
- Future ZH pages can pass `locale="zh"` into Header without this plan committing `src/pages/zh`

---
*Phase: 08-mobile-hamburger-menu*
*Completed: 2026-09-16*

## Self-Check: PASSED
