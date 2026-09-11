---
phase: 02-light-text-and-generate-tools
plan: 03
subsystem: tools
tags: [lorem-ipsum, vitest, preact, generate, catalog]

requires:
  - phase: 02-light-text-and-generate-tools
    provides: case-converter slice at TOOLS length 12, ToolIsland locale={locale}, featured 6
provides:
  - "WORDS embedded corpus and generateLorem words|paragraphs classic boolean"
  - "LoremIpsum island with generate button; ToolShell copies Latin body"
  - "Catalog slug lorem-ipsum, category Generate, featured false; TOOLS length 13; featured still 6"
  - "EN+ZH markdown howTo 3 / faq 4 and ui.en/zh tools['lorem-ipsum'] chrome"
  - "ZH_ERRORS key Enter a count of at least 1"
affects:
  - 02-04-PLAN.md
  - later Phase 2 catalog slices

actuals:
  tokens: 4410
  tasks: 3
  commits: 3

plan_head_before: 2d8268ca19093de36d446b7a6a28949d9236ddb7

tech-stack:
  added: []
  patterns:
    - "Embedded WORDS round-robin from index 0; no PRNG, no fetch, no npm lorem package"
    - "Classic opening is a boolean on generateLorem, not a second catalog slug"
    - "Words mode = N space-separated words ending with a period"
    - "Paragraphs = groups of 50 words joined by newline-newline; no HTML p wrapping"

key-files:
  created:
    - src/lib/lorem.ts
    - src/lib/lorem.test.ts
    - src/components/tools/LoremIpsum.tsx
    - src/components/tools/LoremIpsum.test.ts
    - src/i18n/errors.ts
    - src/i18n/errors.test.ts
    - src/content/tools/lorem-ipsum.md
    - src/content/tools/zh/lorem-ipsum.md
  modified:
    - src/components/tools/ToolIsland.astro
    - src/data/tools.ts
    - src/data/tools.test.ts
    - src/i18n/ui.ts

key-decisions:
  - "Cloned JsonFormatter plus src/lib/json.ts; did not clone UuidGenerator for logic"
  - "Created src/i18n/errors.ts because the worktree had no ZH_ERRORS module"
  - "Classic opening prefixes five words then continues round-robin; count 5 classic is exactly the opening plus period"
  - "Appended lorem-ipsum keys onto ui.ts without dropping word-counter or case-converter"

patterns-established:
  - "Phase 2 generate tool: catalog row featured false, lib+test, island, ToolIsland static branch, EN+ZH ui, ZH_ERRORS, EN+ZH markdown"
  - "Generator island: button type=button calls lib; ToolShell output is the copyable body"

requirements-completed: [LORM-01, LORM-02, LORM-03, LORM-04, LORM-05]

coverage:
  - id: D1
    description: "Visitor can generate dummy Latin on /tools/lorem-ipsum/ from an embedded WORDS list with no network client"
    requirement: LORM-01
    verification:
      - kind: unit
        ref: "src/lib/lorem.test.ts#does not contain a network client"
        status: pass
      - kind: unit
        ref: "src/lib/lorem.test.ts#exports an embedded WORDS corpus"
        status: pass
    human_judgment: false
  - id: D2
    description: "User chooses words or paragraphs and a count of at least 1; words mode is N space-separated words ending with a period"
    requirement: LORM-02
    verification:
      - kind: unit
        ref: "src/lib/lorem.test.ts#emits five space-separated Latin words ending with a period"
        status: pass
      - kind: unit
        ref: "src/lib/lorem.test.ts#keeps two non-empty Latin paragraphs separated by a blank line"
        status: pass
      - kind: unit
        ref: "src/lib/lorem.test.ts#rejects a count of 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "Classic opening is a boolean on generateLorem; when true, prefix Lorem ipsum dolor sit amet then continue"
    requirement: LORM-03
    verification:
      - kind: unit
        ref: "src/lib/lorem.test.ts#prefixes the classic opening when classic is true"
        status: pass
      - kind: unit
        ref: "src/lib/lorem.test.ts#continues from the corpus after the classic opening when count is greater than 5"
        status: pass
    human_judgment: false
  - id: D4
    description: "ToolShell Copy works on the generated Latin body; chrome/labels EN+ZH while body stays Latin"
    requirement: LORM-04
    verification:
      - kind: unit
        ref: "src/components/tools/LoremIpsum.test.ts#calls generateLorem from the lib and copies via ToolShell output"
        status: pass
      - kind: unit
        ref: "src/i18n/errors.test.ts#shares lorem-ipsum chrome keys on en and zh"
        status: pass
    human_judgment: true
    rationale: "Island generate/Copy UX has no jsdom/tsx tests; verifier should open /tools/lorem-ipsum/ and /zh/tools/lorem-ipsum/"
  - id: D5
    description: "Generated body is dummy Latin; invalid count maps via ZH_ERRORS; catalog length 13 featured 6"
    requirement: LORM-05
    verification:
      - kind: unit
        ref: "src/lib/lorem.test.ts#emits Latin letters, spaces, commas, and periods only"
        status: pass
      - kind: unit
        ref: "src/i18n/errors.test.ts#maps Enter a count of at least 1 in ZH_ERRORS"
        status: pass
      - kind: unit
        ref: "src/data/tools.test.ts#has exactly 13 tools"
        status: pass
    human_judgment: false

duration: 21min
completed: 2026-09-11
status: complete
---

# Phase 2 Plan 03: Lorem Ipsum Slice Summary

**In-browser lorem generator with embedded Latin WORDS, words/paragraphs/classic toggle, and EN/ZH catalog parity at TOOLS length 13**

## Performance

- **Duration:** 21 min
- **Started:** 2026-09-11T17:23:42Z
- **Completed:** 2026-09-11T17:44:23Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments

- Shipped `WORDS` (~100 classic Latin tokens) and `generateLorem` so count &lt; 1 returns `Enter a count of at least 1`, words mode emits N space-separated words ending with a period, and classic true prefixes `Lorem ipsum dolor sit amet`
- LoremIpsum island clones the JsonFormatter lib-call pattern (generate button placement only from Uuid): mode/count/classic controls, `generateLorem` from `../../lib/lorem`, ToolShell output is the Latin body
- Catalog gained slug `lorem-ipsum` (Generate, featured false); completeness harness is green at length 13 with featured still 6; EN+ZH markdown howTo 3 / faq 4; ZH_ERRORS in this same slice

## Task Commits

Each task was committed atomically:

1. **Task 1: Lorem-ipsum 8-file slice** - `3e08d91` (feat)
2. **Task 2: Paragraph grouping, classic-plus-count, determinism** - `0a6563b` (test)
3. **Task 3: EN/ZH chrome, ZH_ERRORS, dummy-Latin FAQ locks** - `089818d` (test)

**Plan metadata:** pending this SUMMARY commit

## Files Created/Modified

- `src/lib/lorem.ts` - Named exports WORDS, generateLorem; round-robin, no fetch
- `src/lib/lorem.test.ts` - Invalid count, words, classic, paragraphs, Latin body, source-read, determinism
- `src/components/tools/LoremIpsum.tsx` - Default-export island; generate button type=button
- `src/components/tools/LoremIpsum.test.ts` - Source-read lib import, ToolShell output, no fetch/HTML
- `src/components/tools/ToolIsland.astro` - Static LoremIpsum import and slug === 'lorem-ipsum' with locale={locale}
- `src/data/tools.ts` - Append-only lorem-ipsum row; existing ten relatedSlugs untouched
- `src/data/tools.test.ts` - Snapshot toHaveLength 13; featured length 6 unchanged
- `src/i18n/ui.ts` - EN+ZH tools['lorem-ipsum'] chrome keys appended after case-converter
- `src/i18n/errors.ts` - ZH_ERRORS for Enter a count of at least 1
- `src/i18n/errors.test.ts` - Count error mapping and shared chrome keys
- `src/content/tools/lorem-ipsum.md` - locale en, howTo 3, faq 4
- `src/content/tools/zh/lorem-ipsum.md` - locale zh, howTo 3, faq 4

## Decisions Made

- Clone JsonFormatter + json result union, not UuidGenerator for generation logic
- Category Generate, featured false; bump catalog snapshot 12 → 13
- Classic opening is a boolean option on generateLorem, not a second catalog identity
- Words mode: exactly N tokens joined by spaces, then a period
- Paragraphs: 50-word groups joined by blank lines; no HTML p wrapping (LORM-06 deferred)
- Round-robin from WORDS index 0; no PRNG; no npm lorem package; no lib barrel
- Do not rewrite existing ten relatedSlugs; forward relatedSlugs include password-generator
- Append ui.ts keys; do not replace word-counter or case-converter dictionaries

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical] Created src/i18n/errors.ts because ZH_ERRORS was absent**
- **Found during:** Task 1
- **Issue:** Plan assumed `src/i18n/errors.ts` and `useToolUi`. This worktree only has `src/i18n/ui.ts` (from 02-01/02-02). WordCounter/CaseConverter localize via `t(locale)` and ToolShell has no locale prop.
- **Fix:** Added `errors.ts` with ZH_ERRORS plus `localizeError`. Island uses `t(locale)` for chrome and `localizeError` as `err()`. Did not rewrite ToolShell or the existing ten tools.
- **Files modified:** `src/i18n/errors.ts`, `src/components/tools/LoremIpsum.tsx`
- **Commit:** `3e08d91`

**Total deviations:** 1 auto-fixed (missing-critical). **Impact:** Count errors localize on `/zh/` without rewriting existing islands.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None — no new API routes, auth paths, or schema trust boundaries. T-02-05 (embedded WORDS, source-read forbids fetch) and T-02-04 (Latin string into ToolShell text) are in the lib and island.

## Verification

`npm test` after each task: 17 files, 81 tests passed (final run). Completeness: TOOLS length 13, featured 6, ToolIsland slug-equals, EN+ZH existsSync. No Playwright.

## Next Phase Readiness

Ready for 02-04-PLAN.md (password-generator). Catalog snapshot is now 13; that plan must bump to 14. Featured stays 6.

## Self-Check: PASSED
