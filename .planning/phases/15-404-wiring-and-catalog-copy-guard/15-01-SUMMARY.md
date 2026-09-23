---
phase: 15-404-wiring-and-catalog-copy-guard
plan: 01
subsystem: i18n
tags: [astro, 404, noindex, catalog-copy, vitest]

requires: []
provides:
  - Optional LangSwitch path override so the 404 page links home instead of /zh/404/
  - Optional BaseLayout noindex that omits hreflang and keeps canonical on the given path
  - toolLabels fallback to catalog name and short description when UI copy is missing
affects: [16-remote, catalog-cards, related-tools]

actuals:
  tokens: 1898
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "404 opt-out is a page prop, not a path.ts special case"
    - "Missing UI copy falls back per slug via toolLabels"

key-files:
  created:
    - src/i18n/catalog-copy.ts
    - src/i18n/catalog-copy.test.ts
  modified:
    - src/components/LangSwitch.astro
    - src/components/Header.astro
    - src/layouts/BaseLayout.astro
    - src/pages/404.astro
    - src/components/ToolCard.astro
    - src/components/RelatedTools.astro

key-decisions:
  - "404 LangSwitch override is / so both hrefs are home, not /404/ or /zh/404/"
  - "noindex canonical uses the layout path as given and does not call switchLocalePath"
  - "A present copy.tools entry is returned unchanged; only a missing key uses catalog fields"

patterns-established:
  - "Header threads langSwitchPath only when set; other pages omit it"
  - "toolLabels is the only catalog label lookup for ToolCard and RelatedTools"

requirements-completed: [GUARD-01, GUARD-02, GUARD-03, GUARD-04, GUARD-05]

coverage:
  - id: D1
    description: "404 LangSwitch links to / and /zh/, never /zh/404/"
    requirement: GUARD-01
    verification:
      - kind: automated_ui
        ref: "npm run build; dist/404.html LangSwitch hrefs are / and /zh/"
        status: pass
    human_judgment: false
  - id: D2
    description: "404 canonical is SITE_ORIGIN/404/ and hreflang alternates are omitted"
    requirement: GUARD-02
    verification:
      - kind: automated_ui
        ref: "dist/404.html canonical https://example.com/404/ and no rel=alternate"
        status: pass
    human_judgment: false
  - id: D3
    description: "404 document is noindex; other pages are not"
    requirement: GUARD-03
    verification:
      - kind: automated_ui
        ref: "dist grep noindex matches only dist/404.html"
        status: pass
    human_judgment: false
  - id: D4
    description: "ToolCard keeps a present UI-copy entry and falls back to catalog name and short description when the key is missing"
    requirement: GUARD-04
    verification:
      - kind: unit
        ref: "src/i18n/catalog-copy.test.ts#toolLabels"
        status: pass
    human_judgment: false
  - id: D5
    description: "RelatedTools uses toolLabels name only and does not throw on a missing key"
    requirement: GUARD-05
    verification:
      - kind: unit
        ref: "npm test (191 passed)"
        status: pass
    human_judgment: false

duration: 23min
completed: 2026-09-23
status: complete
plan_head_before: 01c91eab4746f91a7f35c17941523ba522171f45
commits: 3
---

# Phase 15 Plan 01: 404 wiring and catalog-copy guard Summary

**The 404 page no longer advertises `/zh/404/`, and catalog cards fall back to catalog fields when UI copy is missing.**

## Performance

- **Duration:** 23 min
- **Started:** 2026-09-23T05:05:53Z
- **Completed:** 2026-09-23T05:28:40Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- 404 LangSwitch hrefs are `/` and `/zh/`. Built `dist` has no `zh/404` string.
- `dist/404.html` canonical is `https://example.com/404/`, has `<meta name="robots" content="noindex">`, and has no alternate links. Other pages still emit hreflang and are not noindex.
- `toolLabels` returns a present UI-copy entry unchanged and returns `tool.name` / `tool.shortDescription` for a missing slug. ToolCard and RelatedTools both call it.

## Task Commits

Each task was committed atomically:

1. **Task 1: Failing test for missing catalog copy** - `bb477f5` (test)
2. **Task 2: 404 path override and noindex, end to end** - `31a9894` (feat)
3. **Task 3: Catalog fallback in both components** - `f98fa72` (feat)

## Files Created/Modified

- `src/i18n/catalog-copy.ts` - `toolLabels` returns UI copy when present, catalog fields when missing
- `src/i18n/catalog-copy.test.ts` - present entry, missing key, and per-slug isolation
- `src/components/LangSwitch.astro` - optional `path`, default `Astro.url.pathname`
- `src/components/Header.astro` - optional `langSwitchPath`, passed only when set
- `src/layouts/BaseLayout.astro` - optional `noindex` omits alternates and skips `switchLocalePath` for canonical
- `src/pages/404.astro` - `noindex` and `langSwitchPath="/"`
- `src/components/ToolCard.astro` - title and paragraph from `toolLabels`
- `src/components/RelatedTools.astro` - link text from `toolLabels` name only

## Decisions Made

- Followed the locked decisions: no zh 404 page, no `/404/` branch in `path.ts`, no new copy, no `SITE_ORIGIN` change.
- RED required a throwing `toolLabels` stub so the suite loaded and failed on assertions. A missing module was a load failure, not a valid RED.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] RED stub so the target test could fail on an assertion**
- **Found during:** Task 1 (Failing test for missing catalog copy)
- **Issue:** Importing a missing `./catalog-copy` failed the suite before any test ran (0 tests). That is not a valid RED for the missing-key behavior.
- **Fix:** Added a throwing `toolLabels` in the same commit as the test. Task 3 replaced the throw with the fallback.
- **Files modified:** `src/i18n/catalog-copy.ts`
- **Commit:** `bb477f5`

## TDD Gate Compliance

- RED: `bb477f5` `test(15-01): add failing test for missing catalog copy`. Target test `returns catalog name and short description when the key is missing` failed because `toolLabels` threw `not implemented`. `check tdd-red-evidence` returned `RED_EVIDENCE_OK`.
- GREEN: `f98fa72` `feat(15-01): fall back to catalog labels when UI copy is missing`. `npm test` then passed 191/191.
- REFACTOR: none. The helper was already the small function the plan asked for.

## Authentication Gates

None.

## Known Stubs

None. The throwing stub was replaced before the plan finished.

## Threat Flags

None. The noindex and fallback paths are the mitigations already in the plan threat model (T-15-01, T-15-03).

## Self-Check: PASSED

- FOUND: src/i18n/catalog-copy.ts
- FOUND: src/i18n/catalog-copy.test.ts
- FOUND: src/pages/404.astro
- FOUND: bb477f5
- FOUND: 31a9894
- FOUND: f98fa72
- `npm test`: 28 files, 191 tests passed
- `npm run build`: 49 pages. `dist` search for `zh/404` empty. `dist/404.html` contains `noindex` and `https://example.com/404/`, no `rel="alternate"`. `dist/index.html` still has `rel="alternate"`. `src/pages/zh/404.astro` absent. `src/i18n/path.ts` has no 404 branch.

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED | `bb477f5` | PASS — target test failed on `not implemented` |
| GREEN | `f98fa72` | PASS — `npm test` 191/191 |
| REFACTOR | — | skipped, nothing to clean |
