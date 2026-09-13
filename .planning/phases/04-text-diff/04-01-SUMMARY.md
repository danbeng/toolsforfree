---
phase: 04-text-diff
plan: 01
subsystem: tools
tags: [text-diff, diff, preact, astro, vitest]

requires:
  - phase: 03-sql-formatter
    provides: 8-file catalog slice, CAT-04 isolation pattern, TOOLS length 15
provides:
  - "diffText wrapping named diffLines with idle-before-engine"
  - "TextDiff two-pane island with per-line list and labeled copy payload"
  - "Catalog slug text-diff, Text, featured false; TOOLS length 16"
  - "EN+ZH markdown, ui.ts chrome, additive .diff-lines CSS"
  - "CAT-04: only src/lib/diff.ts imports the diff package"
affects: [05-markdown-preview, catalog completeness]

actuals:
  tokens: 4754
  tasks: 3
  commits: 4

plan_head_before: 050e3e88bee62d7b4fa86001e033b744f1264b62

tech-stack:
  added: [diff@9.0.0]
  patterns:
    - "Thin src/lib wrapper of a heavy package-root named import"
    - "Idle whole-string trim before the engine"
    - "Per-pane isTooLarge with ui.ts too-large variants"

key-files:
  created:
    - src/lib/diff.ts
    - src/lib/diff.test.ts
    - src/components/tools/TextDiff.tsx
    - src/content/tools/text-diff.md
    - src/content/tools/zh/text-diff.md
  modified:
    - package.json
    - package-lock.json
    - src/components/tools/ToolIsland.astro
    - src/data/tools.ts
    - src/data/tools.test.ts
    - src/i18n/ui.ts
    - src/i18n/errors.test.ts
    - src/styles/global.css

key-decisions:
  - "Named diffLines from package root with ignoreWhitespace and oneChangePerToken true"
  - "Copy payload is UI-SPEC labeled Added/Removed summary, not createTwoFilesPatch"
  - "Too-large strings live in ui.ts, not INPUT_TOO_LARGE_MSG or ZH_ERRORS"

patterns-established:
  - "Idle both-empty/whitespace-only returns ok false empty error before the engine"
  - "Visual ol.diff-lines is island children; ToolShell pre is copy-only"
  - "CAT-04 greps minify-surviving identifiers, not jsdiff/diffLines"

requirements-completed: [DIFF-01, DIFF-02, DIFF-03, DIFF-04, DIFF-05, DIFF-06]

coverage:
  - id: D1
    description: "Visitor pastes original and changed text and sees a live line-level add/delete list"
    requirement: DIFF-01
    verification:
      - kind: unit
        ref: src/lib/diff.test.ts#emits one del and one add for a changed line
        status: pass
    human_judgment: true
    rationale: "Two-pane layout at 720px is visual; unit tests cover lib inputs only"
  - id: D2
    description: "One DOM node per line with add/delete/eq classes; consecutive adds stay two rows"
    requirement: DIFF-02
    verification:
      - kind: unit
        ref: src/lib/diff.test.ts#emits one row per consecutive added line
        status: pass
    human_judgment: false
  - id: D3
    description: "Ignore leading/trailing whitespace trims line edges and does not collapse internal spaces"
    requirement: DIFF-03
    verification:
      - kind: unit
        ref: src/lib/diff.test.ts#treats leading/trailing-only edits as identical when ignoreWhitespace is true
        status: pass
      - kind: unit
        ref: src/lib/diff.test.ts#does not treat internal-space-only edits as identical when ignoreWhitespace is true
        status: pass
    human_judgment: false
  - id: D4
    description: "Added and Removed stats count lines not hunks, including identical 0/0"
    requirement: DIFF-04
    verification:
      - kind: unit
        ref: src/lib/diff.test.ts#emits one row per consecutive added line
        status: pass
      - kind: unit
        ref: src/lib/diff.test.ts#treats identical non-empty texts as identical
        status: pass
    human_judgment: true
    rationale: "Tile visibility and 20px/600 stat styling need human visual check"
  - id: D5
    description: "Identical non-empty texts show No differences / 无差异; both empty is idle"
    requirement: DIFF-05
    verification:
      - kind: unit
        ref: src/lib/diff.test.ts#returns empty error for both-empty before the engine
        status: pass
      - kind: unit
        ref: src/lib/diff.test.ts#treats identical non-empty texts as identical
        status: pass
    human_judgment: false
  - id: D6
    description: "Each pane is independently size-capped; over-cap uses ui.ts too-large strings and skips diffText"
    requirement: DIFF-06
    verification:
      - kind: unit
        ref: src/lib/diff.test.ts#source-reads per-pane isTooLarge and FAQ local-only wording
        status: pass
    human_judgment: false
  - id: D7
    description: "Catalog slug text-diff, Text, featured false; TOOLS length 16; featured stays 6"
    requirement: DIFF-01
    verification:
      - kind: unit
        ref: src/data/tools.test.ts#has exactly 16 tools
        status: pass
      - kind: unit
        ref: src/data/tools.test.ts#features exactly six tools including json-formatter and jwt-decoder
        status: pass
    human_judgment: false
  - id: D8
    description: "Only src/lib/diff.ts imports the diff package; JsonFormatter chunk has none of the five minify-surviving identifiers"
    verification:
      - kind: unit
        ref: src/lib/diff.test.ts#imports the diff package only from diff.ts
        status: pass
      - kind: other
        ref: npm run build && node CAT-04 JsonFormatter identifier grep
        status: pass
    human_judgment: false

duration: 28min
completed: 2026-09-13
status: complete
---

# Phase 4 Plan 01: Text Diff Summary

**In-browser line-level text-diff via named `diffLines` (diff@9.0.0), two-pane island, labeled copy payload, catalog 16**

## Performance

- **Duration:** 28 min
- **Started:** 2026-09-13T12:50:33Z
- **Completed:** 2026-09-13T13:18:48Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments

- Thin `src/lib/diff.ts` wraps named `diffLines` with idle whole-string trim before the engine and `{ ignoreWhitespace, oneChangePerToken: true }`
- `TextDiff` island: two panes, checkbox default off, stats tiles, `ol.diff-lines` visual list, ToolShell labeled Added/Removed copy payload
- Catalog slug `text-diff` / Text / `featured: false`; TOOLS 15 → 16; featured stays 6; EN+ZH markdown FAQ states local / nothing uploaded
- CAT-04 green after fresh `astro build`: JsonFormatter chunk has none of `oneChangePerToken`, `newlineIsToken`, `stripTrailingCr`, `ignoreNewlineAtEof`, `createTwoFilesPatch`

## Task Commits

Each task was committed atomically:

1. **Task 1 RED:** `d282cb6` (test) add failing tests for idle, identical, add/delete, catalog length 16
2. **Task 1 GREEN:** `dc5efb7` (feat) ship text-diff island wrapping named diffLines
3. **Task 2:** `208c9b2` (test) lock ignore-ws, one-row-per-line, chrome keys, and FAQ
4. **Task 3:** `b5b1234` (test) prove diff package is imported only from diff.ts

**Plan metadata:** pending docs(04-01) SUMMARY commit

_Note: Tracer TDD produced RED then GREEN; no REFACTOR commit (implementation stayed the thin wrap)._

## Files Created/Modified

- `src/lib/diff.ts` - `diffText` + `DiffResult` / `DiffLine`; idle before `diffLines`
- `src/lib/diff.test.ts` - idle, identical, add/delete, ignore-ws, one-row-per-line, isolation, FAQ lock
- `src/components/tools/TextDiff.tsx` - default-export island; per-pane `isTooLarge`; live `useMemo`
- `src/components/tools/ToolIsland.astro` - static TextDiff import and `slug === 'text-diff'`
- `src/data/tools.ts` - append-only `text-diff` row
- `src/data/tools.test.ts` - `toHaveLength(16)`
- `src/i18n/ui.ts` - EN/ZH `tools['text-diff']` UI-SPEC keys
- `src/i18n/errors.test.ts` - text-diff chrome-key describe
- `src/content/tools/text-diff.md` - EN SEO/how-to/FAQ
- `src/content/tools/zh/text-diff.md` - ZH SEO/how-to/FAQ
- `src/styles/global.css` - additive `.diff-lines` / `.diff-line--add` / `.diff-line--del`
- `package.json` / `package-lock.json` - direct dependency `diff@9.0.0`

## Decisions Made

- Official `diff@9.0.0`; named `{ diffLines } from 'diff'` only in `src/lib/diff.ts`
- Copy payload is the UI-SPEC labeled summary (`Added: n` / `Removed: n` plus `- ` / `+ ` / two-space body), not a unified patch
- Too-large strings are three EN/ZH variants in `ui.ts`; no dummy `ZH_ERRORS` key
- Clone HEAD WordCounter locale/`t()`, PasswordGenerator checkbox-in-label, SqlFormatter live `useMemo`, HEAD ToolShell with no locale prop

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Fresh `npm run build` succeeded on the clean worktree without dirty-page isolation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 4 plan 01 complete; catalog completeness is 16 / featured 6
- Ready for phase verify-work (human visual of two-pane layout, CSS colors, Copy clipboard, ZH chrome)
- Do not rewrite existing ten tools; next heavy-library slice should keep CAT-04 isolation

---
*Phase: 04-text-diff*
*Completed: 2026-09-13*

## Self-Check: PASSED
