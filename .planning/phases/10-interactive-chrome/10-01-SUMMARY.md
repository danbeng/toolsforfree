---
phase: 10-interactive-chrome
plan: 01
subsystem: ui
tags: [astro, css, faq-details, tool-panel, button-states]

requires:
  - phase: 09-grid-spacing
    provides: Phase 9 --sp-1 through --sp-12, catalog .card-grid, HEAD English pages
provides:
  - Native FaqList details/summary in div.faq with English h2 FAQ
  - .tool-panel box-shadow 0 1px 2px var(--border) and padding var(--sp-4)
  - .tool-panel button hover invert and color-mix active with reduced-motion none
  - .faq summary::marker and summary:focus-visible 2px accent ring
affects: [verify-work, ui-review]

actuals:
  tokens: 757
  tasks: 3
  commits: 2

plan_head_before: 18e518074620c2f138cee95b3f24e26e9f5465ac

tech-stack:
  added: []
  patterns:
    - FAQ is independent native details/summary; no name, no open, UA ::marker
    - Panel/button chrome is CSS only; HEAD ToolShell Copy stays unclassed
    - Hover/active scoped to .tool-panel button:hover:not(:disabled) / :active:not(:disabled)

key-files:
  created: []
  modified:
    - src/styles/global.css
    - src/components/FaqList.astro

key-decisions:
  - "Worked from HEAD FaqList; did not pop stash@{0} or stash@{1}; did not commit LangSwitch, src/pages/zh/, or ToolShell"
  - "Copied 10-UI-SPEC Token implementation and FAQ chrome verbatim; no transform scale"
  - "Dirty overlay broke astro build; isolated overlay to .git/gsd-overlay-backup-10-01 for T-10-01, then restored"

patterns-established:
  - "Pattern: native details/summary FAQ with items-only Props and English h2 FAQ"
  - "Pattern: .tool-panel button invert hover and color-mix active; hamburger/theme stay 44px icon chrome"

requirements-completed: [CHR-01, CHR-02, CHR-03, CHR-04, CHR-05, CHR-06, CHR-07]

coverage:
  - id: D1
    description: "HEAD FaqList is items-only native details/summary in div.faq with English h2 FAQ; .tool-panel has --border shadow, var(--sp-4) padding, radius 8px; .tool-panel button uses :hover:not(:disabled) invert and :active:not(:disabled) color-mix plus 120ms transition and reduced-motion none"
    requirement: CHR-01
    verification:
      - kind: unit
        ref: "npm test (155 tests, 23 files)"
        status: pass
      - kind: other
        ref: "rg button:hover:not(:disabled) / button:active:not(:disabled) / color-mix / box-shadow 0 1px 2px var(--border) / padding var(--sp-4) / details / summary / FAQ / class=faq"
        status: pass
    human_judgment: false
  - id: D2
    description: ".faq details spacing, summary 16px/600, summary::marker --text, summary:focus-visible 2px accent; UA triangle not hidden; global 2px focus and 44px hit targets remain"
    requirement: CHR-03
    verification:
      - kind: other
        ref: "rg summary::marker / .faq summary:focus-visible / .faq details / padding var(--sp-2) 0 / width 44px / gap 1rem / --content 52rem / font-weight 650; no webkit-details-marker / tool-panel button:focus / transform:"
        status: pass
      - kind: unit
        ref: "npm test"
        status: pass
    human_judgment: false
  - id: D3
    description: "Isolated production dist HTML contains details and tool-panel; no src/lib/chrome.ts; package.json and TOOLS match HEAD; overlay stashes still present; ZH tree, LangSwitch, and ToolShell unstaged"
    requirement: CHR-04
    verification:
      - kind: other
        ref: "npm run build (isolated HEAD+plan) && rg details/tool-panel dist --glob *.html; test ! -f src/lib/chrome.ts; git diff HEAD -- package.json package-lock.json src/data/tools.ts; git stash list"
        status: pass
      - kind: unit
        ref: "npm test"
        status: pass
    human_judgment: false
  - id: D4
    description: "In both themes, idle Copy accent-on-panel, hover --bg-on-accent, active darkened-accent with --bg text, FAQ --text on canvas eyeball at 4.5:1; disabled Copy stays 0.45 with no hover invert; FAQ closed first paint with UA triangle"
    requirement: CHR-07
    verification: []
    human_judgment: true
    rationale: "Contrast, hover invert, active darken, FAQ triangle, and both-theme 4.5:1 eyeball require human viewport judgment; Playwright and CSS unit tests were prohibited this phase."

duration: 9min
completed: 2026-09-18
status: complete
---

# Phase 10 Plan 01: Interactive Chrome Summary

**Native FAQ details/summary plus .tool-panel --border shadow, --sp-4 padding, and invert hover / color-mix active on .tool-panel button**

## Performance

- **Duration:** 9 min
- **Started:** 2026-09-18T03:33:53Z
- **Completed:** 2026-09-18T03:42:54Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- HEAD `FaqList.astro` rewritten from `<dl>` to independent native `<details>` / `<summary>` / `<p>` inside `div.faq`, English `h2` FAQ, items-only Props
- `.tool-panel` keeps 1px `--border`, adds `box-shadow: 0 1px 2px var(--border)`, padding `var(--sp-4)`, radius 8px
- `.tool-panel button:hover:not(:disabled)` invert and `:active:not(:disabled)` `color-mix(in srgb, var(--accent) 72%, #000000)`; disabled Copy stays opacity 0.45; `prefers-reduced-motion: reduce` turns the 120ms color transition off
- `.faq` chrome: UA `summary::marker`, 16px/600 questions, `--text` answers, 2px accent `:focus-visible` on summary
- Isolated production HTML emits `details` and `tool-panel`; overlay ZH tree, `LangSwitch.astro`, and dirty `ToolShell.tsx` were not staged

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end FAQ details plus panel and button chrome — one path** - `1894858` (feat)
2. **Task 2: Ship FAQ marker, type, and summary focus chrome** - `d6059ca` (feat)
3. **Task 3: Production build and overlay-commit safety gates** - no extra production commit (in-scope files already at HEAD)

**Plan metadata:** pending docs commit after STATE/ROADMAP update

_Note: Tracer `<verify>` is automated-only and `HUMAN_VERIFY_MODE` is `end-of-phase`, so expansion continued without a checkpoint after `⚡ Tracer verified end-to-end — expanding`._

## Files Created/Modified

- `src/components/FaqList.astro` - HEAD items-only Props; native details/summary/p in `div.faq`
- `src/styles/global.css` - Token implementation panel/button block plus FAQ chrome from 10-UI-SPEC.md
- `src/components/ToolShell.tsx` - left dirty in the worktree; not edited; not staged

## Decisions Made

- Restored HEAD `FaqList.astro` before markup (`git checkout HEAD -- src/components/FaqList.astro`); did not checkout `global.css` or `ToolShell.tsx`
- Copied 10-UI-SPEC Token implementation and FAQ chrome verbatim (120ms ease, `0 1px 2px var(--border)`, unclassed Copy, `color-mix` 72%)
- Did not pop `stash@{0}` (`gsd-phase7-overlay-chrome-temp`) or `stash@{1}` (`pre-02-01-merge unrelated i18n`)
- Path-limited git add of `src/styles/global.css` and `src/components/FaqList.astro` only; never `git add -A`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Overlay i18n imports blocked `astro build`**
- **Found during:** Task 3 (Production build and overlay-commit safety gates)
- **Issue:** Dirty overlay `src/pages/404.astro` (and siblings) import missing `src/i18n/path`; `npm run build` failed with `UNRESOLVED_IMPORT`. Overlay is out of this plan's scope.
- **Fix:** Copied overlay files (including `src/content.config.ts`) to `.git/gsd-overlay-backup-10-01`, restored those paths to HEAD, moved untracked `LangSwitch.astro` / `src/pages/zh/`, ran `npm run build` on HEAD+10-01, `rg` `details` / `tool-panel` in `dist` while isolated, then restored the overlay. Did not pop git stash. Did not re-run `npm run build` after restore. Did not commit overlay files.
- **Files modified:** none committed; overlay restored to pre-isolation dirty state
- **Verification:** isolated `npm run build` exit 0; 18 dist HTML files contain `details` and `tool-panel`; `git stash list` still has both named entries; `LangSwitch.astro` and `src/pages/zh/` remain untracked
- **Committed in:** n/a (verification-only isolation)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Build proof used HEAD+10-01 isolation because the dirty overlay cannot SSG. No scope creep. Overlay remains uncommitted.

## Issues Encountered

None beyond the expected overlay SSG failure (same UNRESOLVED_IMPORT class as Phase 9 T-09-01).

## Authentication Gates

None.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 10 plan 01 production CSS/markup is on `main` (`1894858`, `d6059ca`)
- Human UAT remains: hover/active/disabled Copy, hamburger/theme non-invert, panel shadow, FAQ collapse/triangle/focus, both-theme 4.5:1 eyeball (coverage D4). Do not invent UAT results.
- Overlay ZH tree and `LangSwitch.astro` still dirty/untracked; dirty `ToolShell.tsx` remains in the worktree
- Phase complete, ready for `/gsd-verify-work 10`

## Self-Check: PASSED

- FOUND: src/styles/global.css
- FOUND: src/components/FaqList.astro
- FOUND: .planning/phases/10-interactive-chrome/10-01-SUMMARY.md
- FOUND: 1894858
- FOUND: d6059ca

---
*Phase: 10-interactive-chrome*
*Completed: 2026-09-18*
