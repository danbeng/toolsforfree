---
phase: 01-additive-tool-contract
plan: 01
subsystem: testing
tags: [vitest, catalog, completeness, conventions, tool-island]

requires: []
provides:
  - "CI completeness harness: every TOOLS slug needs a ToolIsland slug-equals branch"
  - "CI completeness harness: every TOOLS slug needs EN and ZH markdown on disk"
  - "Catalog snapshot locked at 10; featured locked at 6; grouping follows TOOLS.length"
  - "8-file add-a-tool checklist and island-split / no-lib-barrel rule in CONVENTIONS.md"
affects:
  - 02-light-text-and-generate-tools
  - later catalog slices (Phases 2-6)

actuals:
  tokens: 1061
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Source-read ToolIsland.astro with readFileSync(URL) + includes slug-equals"
    - "existsSync(URL) EN+ZH markdown loop over TOOLS"
    - "Grouping count === TOOLS.length; snapshot toHaveLength(10)"

key-files:
  created:
    - src/components/tools/ToolIsland.test.ts
  modified:
    - src/data/tools.test.ts
    - .planning/codebase/CONVENTIONS.md

key-decisions:
  - "Sibling ToolIsland.test.ts source-reads ToolIsland.astro; asserts includes of slug === 'kebab' per TOOLS slug"
  - "Markdown completeness uses existsSync(URL) from import.meta.url, never URL.pathname"
  - "Grouping assertion uses TOOLS.length; catalog snapshot stays at 10 this phase"
  - "Copied existing ZH markdown into the worktree so the harness could go green; left untracked per the three-path allowlist"

patterns-established:
  - "Completeness loops TOOLS, never a copied slug array"
  - "New tools clone JsonFormatter.tsx plus src/lib/json.ts and land featured false"
  - "No src/lib barrel; heavy libs import only from that tool island or lib"

requirements-completed: [CAT-01, CAT-02, CAT-03, CAT-04, CAT-05, CAT-06]

coverage:
  - id: D1
    description: "ToolIsland coverage test fails when a catalog slug has no slug-equals branch"
    requirement: CAT-03
    verification:
      - kind: unit
        ref: "src/components/tools/ToolIsland.test.ts#maps every catalog slug to a slug === branch"
        status: pass
    human_judgment: false
  - id: D2
    description: "Catalog tests fail when EN or ZH markdown is missing for any TOOLS slug"
    requirement: CAT-02
    verification:
      - kind: unit
        ref: "src/data/tools.test.ts#has EN and ZH markdown for every catalog slug"
        status: pass
    human_judgment: false
  - id: D3
    description: "Catalog snapshot stays 10, featured stays 6, grouping follows TOOLS.length, unique slugs and getters remain"
    requirement: CAT-01
    verification:
      - kind: unit
        ref: "src/data/tools.test.ts#has exactly 10 tools / features exactly six / groups by category"
        status: pass
    human_judgment: false
  - id: D4
    description: "CONVENTIONS.md 8-file checklist and island-split / no-barrel rule; product files untouched by plan commits"
    requirement: CAT-04
    verification:
      - kind: unit
        ref: "npm test (catalog length 10 still green)"
        status: pass
      - kind: other
        ref: "git log allowlist: src/data/tools.test.ts, src/components/tools/ToolIsland.test.ts, .planning/codebase/CONVENTIONS.md"
        status: pass
    human_judgment: true
    rationale: "Working tree still has untracked src/content/tools/zh/ copied so existsSync could pass; a human should confirm those files stay out of this plan's commits."
  - id: D5
    description: "Existing ten tools and relatedSlugs untouched; 8-file checklist documents live compute, copy, size guard, EN+ZH, ZH_ERRORS"
    requirement: CAT-05
    verification:
      - kind: unit
        ref: "npm test (47 tests passed; tools.ts and ToolIsland.astro not in plan commits)"
        status: pass
    human_judgment: false
  - id: D6
    description: "8-file add-a-tool checklist in CONVENTIONS.md including featured false, ZH_ERRORS, EN md, ZH md"
    requirement: CAT-06
    verification:
      - kind: other
        ref: ".planning/codebase/CONVENTIONS.md#Adding a tool (8-file checklist)"
        status: pass
    human_judgment: false

plan_head_before: a792fbf00b64a8add1d1250406869971b910171a
duration: 20min
completed: 2026-09-11
status: complete
---

# Phase 01 Plan 01: Additive tool contract Summary

**Vitest completeness harness that fails a missing ToolIsland slug-equals branch or missing EN/ZH markdown, with catalog snapshot 10 / featured 6 / grouping TOOLS.length and the 8-file island-split checklist in CONVENTIONS.md**

## Performance

- **Duration:** 20 min
- **Started:** 2026-09-11T05:37:13Z
- **Completed:** 2026-09-11T05:57:39Z
- **Tasks:** 3
- **Files modified:** 3 (plan commits); untracked ZH markdown copies remain on disk

## Accomplishments

- ToolIsland coverage test source-reads `ToolIsland.astro` via `readFileSync(new URL(...))` and requires `slug === '<slug>'` for every `TOOLS` row
- Catalog tests assert EN and ZH markdown with `existsSync(URL)` per catalog slug
- Grouping count follows `TOOLS.length` while `toHaveLength(10)` and featured length 6 stay locked
- CONVENTIONS.md documents the 8-file add-a-tool checklist and island-split / no-lib-barrel rule

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end catalog completeness** - `94fb784` (test)
2. **Task 2: Lock catalog snapshot, featured six, grouping via TOOLS.length** - `b37cf68` (test)
3. **Task 3: Append 8-file checklist and island-split rule** - `3e8482b` (docs)

**Plan metadata:** pending final docs commit

## Files Created/Modified

- `src/components/tools/ToolIsland.test.ts` - Source-read coverage over `TOOLS` slugs
- `src/data/tools.test.ts` - EN/ZH existsSync loop; grouping uses `TOOLS.length`
- `.planning/codebase/CONVENTIONS.md` - 8-file checklist and island-split sections

## Decisions Made

- Sibling `ToolIsland.test.ts` (not mixed into `tools.test.ts`); `includes` of the single-quoted slug-equals form, no regex, no import-line asserts
- Pass `URL` objects to `readFileSync` / `existsSync` (Windows-safe; no `.pathname`)
- Keep `it('has exactly 10 tools')`; change only the grouping `toBe(10)` to `TOOLS.length`
- Clone target documented as `JsonFormatter.tsx` plus `src/lib/json.ts`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree lacked ZH markdown that the completeness loop requires**
- **Found during:** Task 1 (`npm test`)
- **Issue:** This worktree has EN `src/content/tools/{slug}.md` only. `src/content/tools/zh/` is untracked on the main checkout and was never part of HEAD, so `existsSync` failed with `missing ZH markdown for json-formatter`.
- **Fix:** Copied the existing ten ZH markdown files from the main checkout into the worktree so the harness could go green. Did **not** stage or commit them (diff allowlist is tests + CONVENTIONS.md only).
- **Files modified:** untracked `src/content/tools/zh/*.md` (not in plan commits)
- **Verification:** `npm test` — 12 files, 47 tests passed
- **Committed in:** none (intentionally untracked)

---

**Total deviations:** 1 auto-fixed (Rule 3)
**Impact on plan:** Required for CAT-02 to pass on this checkout. A clean clone of this branch without those untracked files will fail the new markdown test until ZH content is committed by a later, allowlisted content slice or the in-progress bilingual work on main.

## Issues Encountered

- Tracer `npm test` failed once on missing ZH markdown; resolved by copying existing files, not by weakening the assertion.
- Tracer feedback gate (`end-of-phase`, automated-only verify): re-ran `npm test` (green) and continued expansion. No human-verify halt.

## Auth Gates

None.

## Known Stubs

None in the three allowlisted files.

## Threat Flags

None. No new network endpoints, auth paths, or schema changes. Completeness tests use real `node:fs` only (T-01-04).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 can add catalog rows by satisfying the completeness tests and the 8-file checklist
- Bump `toHaveLength(10)` when the catalog grows; keep featured at 6 and new tools `featured: false`
- ZH markdown for the existing ten tools still needs to land in git (currently untracked) or Phase 2 CI will fail CAT-02 on a clean tree

---
*Phase: 01-additive-tool-contract*
*Completed: 2026-09-11*

## Self-Check: PASSED
