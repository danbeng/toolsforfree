---
phase: 09-grid-spacing
plan: 01
subsystem: ui
tags: [astro, css-grid, spacing-tokens, catalog, card-grid]

requires:
  - phase: 08-mobile-hamburger-menu
    provides: HEAD global.css hamburger 44px overlay and ThemeToggle sibling chrome
provides:
  - Catalog .card-grid 1-col / 2-col@720 / 3-col@1080 on home featured and /tools/ categories
  - --sp-1 through --sp-12 on :root (4/8/12/16/24/32/48/64/80/96/120/144px)
  - Layout-only .tool-card chrome; .wrap padding --sp-4; .nav gap --sp-5
affects: [10-interactive-chrome]

actuals:
  tokens: 888
  tasks: 3
  commits: 2

plan_head_before: 058419af1adff57283911a1f96a30aa7b4d7cebb

tech-stack:
  added: []
  patterns:
    - Catalog uses .card-grid; in-tool split stays .tool-grid (720px 2-col only)
    - Spacing tokens on :root only; light theme selector does not duplicate --sp-*
    - Card hover is color var(--accent) only; no fill, border-color, or :active

key-files:
  created: []
  modified:
    - src/styles/global.css
    - src/pages/index.astro
    - src/pages/tools/index.astro

key-decisions:
  - "Catalog wrappers on HEAD English home and /tools/ only; ToolCard markup unchanged"
  - "Did not pop stash@{0} or stash@{1}; did not commit LangSwitch or src/pages/zh/"
  - "Dirty overlay broke astro build; isolated overlay to git-dir backup for T-09-01 build, then restored"

patterns-established:
  - "Pattern: catalog lists wrap maps in .card-grid; tool islands keep .tool-grid"
  - "Pattern: --sp-* live on :root next to color tokens; touched layout selectors consume var(--sp-*)"

requirements-completed: [LAY-01, LAY-02, LAY-03]

coverage:
  - id: D1
    description: "HEAD home featured and each /tools/ category wrap maps in .card-grid; :root has --sp-1 through --sp-12 before the light selector; catalog CSS is 1-col / 2-col at 720px / 3-col at 1080px; .tool-grid stays gap 1rem"
    requirement: LAY-01
    verification:
      - kind: unit
        ref: "npm test (155 tests, 23 files)"
        status: pass
      - kind: other
        ref: "rg card-grid / min-width 720 / min-width 1080 / --sp-1..--sp-12 / Featured tools / View all tools / All tools / tool-grid / gap: 1rem"
        status: pass
    human_judgment: false
  - id: D2
    description: ".wrap padding 0 var(--sp-4); .nav gap var(--sp-5); h2:has(+ .card-grid); main section spacing; layout-only .tool-card with idle --text and hover --accent; 44px / gap 1rem / --content 52rem / logo 650 unchanged"
    requirement: LAY-03
    verification:
      - kind: other
        ref: "rg padding: 0 var(--sp-4) / gap: var(--sp-5) / h2:has(+ .card-grid) / main section / .tool-card / width: 44px / gap: 1rem / --content: 52rem / font-weight: 650"
        status: pass
      - kind: unit
        ref: "npm test"
        status: pass
    human_judgment: false
  - id: D3
    description: "Production dist HTML contains card-grid and tool-card; no src/lib/layout.ts; package.json and TOOLS match HEAD; overlay stashes still present"
    requirement: LAY-02
    verification:
      - kind: other
        ref: "npm run build && rg card-grid/tool-card dist --glob *.html; test ! -f src/lib/layout.ts; git diff HEAD -- package.json package-lock.json src/data/tools.ts; git stash list"
        status: pass
      - kind: unit
        ref: "npm test"
        status: pass
    human_judgment: false
  - id: D4
    description: "DevTools 719 / 720 / 1079 / 1080 column counts, Auth one-track, no overlap/scroll, hover/focus/theme on catalog cards"
    requirement: LAY-01
    verification: []
    human_judgment: true
    rationale: "Column counts, card overlap, and hover/theme appearance require human viewport judgment; Playwright and jsdom were prohibited this phase."

duration: 9min
completed: 2026-09-17
status: complete
---

# Phase 9 Plan 01: Grid & Spacing Summary

**Catalog `.card-grid` at 1/2/3 columns plus `:root` `--sp-1`…`--sp-12` on HEAD English home featured and `/tools/` category lists**

## Performance

- **Duration:** 9 min
- **Started:** 2026-09-17T18:44:59Z
- **Completed:** 2026-09-17T18:54:33Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Home featured map and each `/tools/` category map wrap in `.card-grid`
- `:root` defines `--sp-1` through `--sp-12` (4px…144px) before the light theme selector
- Touched layout uses the scale (`.card-grid` gap `--sp-4`, `.wrap` padding `--sp-4`, `.nav` gap `--sp-5`, `.tool-card` padding `--sp-4`) with layout-only card chrome and accent hover text only
- `.tool-grid` still `gap: 1rem` and 2-col at 720px only; hamburger 44px, `--content: 52rem`, logo `font-weight: 650` unchanged
- Production `dist/index.html` and `dist/tools/index.html` emit `card-grid` / `tool-card`; overlay ZH tree and `LangSwitch.astro` were not staged

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end 3-column catalog grid — one path** - `abe7151` (feat)
2. **Task 2: Tokenize wrap/nav and ship layout-only card chrome** - `7332634` (feat)
3. **Task 3: Production build and overlay-commit safety gates** - no extra production commit (in-scope files already at HEAD)

**Plan metadata:** pending docs commit after STATE/ROADMAP update

_Note: Task 1 was already implemented in the dirty tree from a previous executor; it was verified then committed. Tracer `<verify>` is automated-only and `HUMAN_VERIFY_MODE` is `end-of-phase`, so expansion continued without a checkpoint._

## Files Created/Modified

- `src/pages/index.astro` - HEAD home chrome; featured map wrapped in `.card-grid`
- `src/pages/tools/index.astro` - HEAD tools index; one `.card-grid` per category section
- `src/styles/global.css` - `--sp-*` tokens, `.card-grid` 1/2/3-col, wrap/nav tokens, layout-only `.tool-card`
- `src/components/ToolCard.astro` - unchanged vs HEAD (`<a class="tool-card">` + name + shortDescription); not staged

## Decisions Made

- Worked from HEAD English catalog pages; did not import overlay hero/kicker or localize ToolCard
- Hover is `color: var(--accent)` only, matching 09-UI-SPEC discretion
- Did not pop `stash@{0}` (`gsd-phase7-overlay-chrome-temp`) or `stash@{1}` (`pre-02-01-merge unrelated i18n`)
- Path-limited git add of in-scope files only; never `git add -A`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Overlay i18n imports blocked `astro build`**
- **Found during:** Task 3 (Production build and overlay-commit safety gates)
- **Issue:** Dirty overlay `src/pages/404.astro` (and siblings) import missing `src/i18n/path`; `npm run build` failed with `UNRESOLVED_IMPORT`. Overlay is out of this plan's scope.
- **Fix:** Copied overlay files to `.git/gsd-overlay-backup-09-01`, restored those paths to HEAD (plus moved untracked `LangSwitch.astro` / `src/pages/zh/`), ran `npm run build` on HEAD+09-01, then restored the overlay from the backup. Did not pop git stash. Did not commit overlay files.
- **Files modified:** none committed; overlay restored to pre-isolation dirty state
- **Verification:** `npm run build` exit 0; `dist/index.html` and `dist/tools/index.html` contain `card-grid` and `tool-card`; `git stash list` still has both named entries; `LangSwitch.astro` and `src/pages/zh/` remain untracked
- **Committed in:** n/a (verification-only isolation)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Build proof used HEAD+09-01 isolation because the dirty overlay cannot SSG. No scope creep. Overlay remains uncommitted.

## Issues Encountered

- Previous executor died after implementing Task 1 in the working tree with no commit and no SUMMARY. Resume treated Task 1 as implemented-but-uncommitted, re-ran verify, then committed `abe7151`.

## Authentication Gates

None.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 9 plan 01 production CSS/markup is on `main` (`abe7151`, `7332634`)
- Human UAT remains: DevTools 719 / 720 / 1079 / 1080 column checklist, Auth one-track, hover/focus/theme (coverage D4). Do not invent viewport results.
- Phase 10 can polish buttons, tool-panel, and FAQ without inheriting overlay catalog markup or a 3-col in-tool split
- Overlay ZH tree and `LangSwitch.astro` still dirty/untracked; do not mix into Phase 10 commits

## Self-Check: PASSED

- FOUND: src/styles/global.css
- FOUND: src/pages/index.astro
- FOUND: src/pages/tools/index.astro
- FOUND: src/components/ToolCard.astro
- FOUND: .planning/phases/09-grid-spacing/09-01-SUMMARY.md
- FOUND: abe7151
- FOUND: 7332634

---
*Phase: 09-grid-spacing*
*Completed: 2026-09-17*
