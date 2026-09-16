---
phase: 07-theme-foundation
plan: 01
subsystem: ui
tags: [theme, css-variables, data-theme, localStorage, astro, fouc]

requires:
  - phase: HEAD chrome
    provides: dark-only :root tokens, BaseLayout head, Header Tools/Blog/About
provides:
  - FOUC-safe ThemeInit blocking head IIFE
  - Static header ThemeToggle sun/moon control
  - Light/dark CSS token split with --grid-line and --diff-*
  - Per-theme color-scheme on :root
affects: [08-hamburger, 09-spacing, 10-button-faq, later polish inheriting data-theme]

actuals:
  tokens: 1633
  tasks: 3
  commits: 2

plan_head_before: a8e4db9d78e084b7dd06a9e59f453b1c3785498c

tech-stack:
  added: []
  patterns:
    - Blocking script is:inline first in head for FOUC-safe data-theme
    - Static Astro ThemeToggle (not a Preact island)
    - Dark tokens on :root; light override on :root[data-theme="light"]

key-files:
  created:
    - src/components/ThemeInit.astro
    - src/components/ThemeToggle.astro
  modified:
    - src/styles/global.css
    - src/layouts/BaseLayout.astro
    - src/components/Header.astro

key-decisions:
  - "Dark HEAD hex stays on :root; light lives only under :root[data-theme=light]"
  - "ThemeInit never writes storage; ThemeToggle setItem only on click"
  - "Allowlist light|dark before setAttribute; try/catch around storage"
  - "ThemeToggle is static Astro with English aria-label Toggle color theme"
  - "Worked from HEAD chrome (~169-line global.css), not the dirty overlay"

patterns-established:
  - "Pattern: ThemeInit first child of head before charset"
  - "Pattern: ThemeToggle inside .nav-links after About"
  - "Pattern: body repeating-linear-gradient consumes --grid-line at 47px/48px"

requirements-completed: [THM-01, THM-02, THM-03, THM-04, THM-05, THM-06, THM-07]

coverage:
  - id: D1
    description: Shared plus dark :root plus light :root[data-theme="light"] tokens, including --diff-* used by diff hunks
    requirement: THM-01
    verification:
      - kind: other
        ref: rg data-theme="light" / --diff-add-fg / --diff-add-bg / --diff-del-fg in src/styles/global.css
        status: pass
      - kind: unit
        ref: npm test (155 tests)
        status: pass
    human_judgment: false
  - id: D2
    description: Header button with sun/moon toggles data-theme on html; 44px hit target; two clicks restore start theme
    requirement: THM-02
    verification:
      - kind: other
        ref: rg ThemeToggle in Header.astro; #themeToggle min-width 44px and theme-moon rules in global.css
        status: pass
    human_judgment: true
    rationale: Icon flip, two-click idempotency, and desktop one-row header require visual confirmation
  - id: D3
    description: Toggle writes the theme key; init restores it; first visit does not write storage
    requirement: THM-03
    verification:
      - kind: other
        ref: ThemeToggle.astro setItem in click handler; ThemeInit.astro has no setItem
        status: pass
    human_judgment: true
    rationale: Persistence across hard refresh and navigation needs a real browser
  - id: D4
    description: Blocking is:inline IIFE in head and in dist HTML (not only a hashed module)
    requirement: THM-04
    verification:
      - kind: other
        ref: npm run build; rg localStorage.getItem('theme') dist/**/*.html
        status: pass
    human_judgment: false
  - id: D5
    description: Missing or invalid storage follows prefers-color-scheme and does not write the key
    requirement: THM-05
    verification:
      - kind: other
        ref: ThemeInit.astro allowlist then matchMedia; no setItem
        status: pass
    human_judgment: true
    rationale: OS emulate plus empty-storage hard refresh is paint-time behavior
  - id: D6
    description: Body repeating-linear-gradient consumes --grid-line at 47px/48px
    requirement: THM-06
    verification:
      - kind: other
        ref: rg --grid-line and 47px in src/styles/global.css
        status: pass
    human_judgment: true
    rationale: Light-theme grid visibility is a visual check
  - id: D7
    description: color-scheme dark on :root, light on the light selector; missing data-theme still uses :root dark
    requirement: THM-07
    verification:
      - kind: other
        ref: rg color-scheme in src/styles/global.css
        status: pass
    human_judgment: true
    rationale: Native scrollbar/textarea color-scheme follow-through needs a browser
  - id: D8
    description: Manual FOUC checklist after production build
    verification: []
    human_judgment: true
    rationale: No Playwright this phase; hard-refresh flash, OS default, and header row are paint/visual

duration: 7min
completed: 2026-09-16
status: complete
---

# Phase 7 Plan 01: Theme Foundation Summary

**FOUC-safe two-state light/dark theming via blocking ThemeInit, static header ThemeToggle, and HEAD CSS token split**

## Performance

- **Duration:** 7 min
- **Started:** 2026-09-16T03:25:33Z
- **Completed:** 2026-09-16T03:32:15Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Blocking `ThemeInit.astro` IIFE is the first `<head>` child; it allowlists `light`/`dark`, falls back to `prefers-color-scheme`, and always `setAttribute('data-theme', …)` without writing storage
- Static `ThemeToggle.astro` in `.nav-links` after About flips `data-theme` on first click (no hydration) and writes the origin-scoped `theme` key
- HEAD `global.css` keeps dark hex on `:root`, adds `:root[data-theme="light"]`, `--grid-line` 47px/48px body grid, per-theme `color-scheme`, `#themeToggle` 44px chrome, and tokenized `.diff-line--add/--del`

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end theme toggle without FOUC — one path** - `935089d` (feat)
2. **Task 2: Toggle chrome CSS and readable diff tokens** - `f4ce2a9` (feat)
3. **Task 3: Production inline init and safety gates** - no extra source diff (verify-only; five in-scope files already committed)

## Files Created/Modified

- `src/components/ThemeInit.astro` - Blocking `is:inline` IIFE; storage get + matchMedia; never `setItem`
- `src/components/ThemeToggle.astro` - Static sun/moon button; click sets `data-theme` then storage
- `src/layouts/BaseLayout.astro` - Import ThemeInit; render as first head child before charset; Props unchanged
- `src/components/Header.astro` - Import ThemeToggle after About; HEAD Tools/Blog/About hrefs unchanged
- `src/styles/global.css` - Token split, grid, color-scheme, diff vars, `#themeToggle` rules

## Decisions Made

- Followed 07-UI-SPEC.md token tables exactly, including light `--danger: #b91c1c` (not research `#dc2626`)
- ThemeInit never writes localStorage so first visit keeps following OS until the user clicks (D-02, THM-05)
- ThemeToggle is static Astro, not a Preact island (D-03)
- Restored/edited HEAD chrome only; did not pop stash or copy the 662-line overlay (D-04)
- No `src/lib/theme.ts`, no new npm packages, no Playwright

## Deviations from Plan

None - plan executed exactly as written.

Task 3 produced no additional commit because the five in-scope files were already committed in tasks 1–2 and verification required no further source edits.

## Issues Encountered

None. `npm test` 155/155 green. `npm run build` complete. Dist HTML contains the raw `localStorage.getItem('theme')` IIFE.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Later polish phases inherit `data-theme` on `html`; dark tokens remain the `:root` fallback
- Deferred: three-state toggle, motion, hamburger (Phase 8), spacing scale (Phase 9), button/FAQ chrome and ZH `ui.ts` keys (Phase 10)
- End-of-phase human FOUC checklist lives in task 3 `<human-check>` for `/gsd-verify-work`

---
*Phase: 07-theme-foundation*
*Completed: 2026-09-16*

## Self-Check: PASSED
