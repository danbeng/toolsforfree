---
phase: 02-light-text-and-generate-tools
plan: 01
subsystem: tools
tags: [word-counter, vitest, preact, intl-segmenter, catalog]

requires:
  - phase: 01-additive-tool-contract
    provides: completeness harness (TOOLS length snapshot, EN+ZH existsSync, ToolIsland slug-equals)
provides:
  - "countText / countWords / countWordsFallback with CounterResult zeros for empty input"
  - "WordCounter island with metric tiles and copyable ToolShell summary"
  - "Catalog slug word-counter, category Text, featured false; TOOLS length 11; featured still 6"
  - "EN+ZH markdown howTo 3 / faq 3-5 and ui.en/zh tools['word-counter'] chrome"
affects:
  - 02-02-PLAN.md
  - later Phase 2 catalog slices

actuals:
  tokens: 3194
  tasks: 3
  commits: 3

plan_head_before: 8c4627cfdb2a490170ad33c055383896e8ca6300

tech-stack:
  added: []
  patterns:
    - "Empty/whitespace counter returns ok true with zeros (tiles, not idle error)"
    - "Intl.Segmenter word granularity plus Han ideograph split so 你好世界 is 4"
    - "Metric tiles in children; newline-joined summary on ToolShell output"
    - "Minimal src/i18n/ui.ts for word-counter only (baseline had no i18n layer)"

key-files:
  created:
    - src/lib/counter.ts
    - src/lib/counter.test.ts
    - src/components/tools/WordCounter.tsx
    - src/i18n/ui.ts
    - src/content/tools/word-counter.md
    - src/content/tools/zh/word-counter.md
  modified:
    - src/components/tools/ToolIsland.astro
    - src/data/tools.ts
    - src/data/tools.test.ts

key-decisions:
  - "Cloned JsonFormatter plus src/lib/json.ts; did not clone UuidGenerator"
  - "Created a minimal ui.ts because the worktree baseline has no i18n/ui.ts or useToolUi; ToolShell was not edited"
  - "zh-Hans Segmenter word-like groups were split by Han ideographs so COUNT-03 (你好世界 = 4) holds"

patterns-established:
  - "Phase 2 light tool: catalog row featured false, lib+test, island, ToolIsland static branch, EN+ZH ui, EN+ZH markdown"
  - "Forward relatedSlugs to not-yet-shipped slugs are OK because getRelatedTools drops missing"

requirements-completed: [COUNT-01, COUNT-02, COUNT-03, COUNT-04]

coverage:
  - id: D1
    description: "Visitor can paste text and see word, character (± spaces), and line counts"
    requirement: COUNT-01
    verification:
      - kind: unit
        ref: "src/lib/counter.test.ts#counts hello world as 2 words"
        status: pass
      - kind: unit
        ref: "src/lib/counter.test.ts#splits lines on CR LF or LF or CR"
        status: pass
    human_judgment: false
  - id: D2
    description: "Sentence split on . ? ! and fullwidth 。？！; paragraphs are non-empty blank-line blocks"
    requirement: COUNT-02
    verification:
      - kind: unit
        ref: "src/lib/counter.test.ts#splits sentences on ASCII . ? ! and fullwidth 。？！"
        status: pass
      - kind: unit
        ref: "src/lib/counter.test.ts#counts non-empty blank-line blocks as paragraphs"
        status: pass
    human_judgment: false
  - id: D3
    description: "CJK Han is not one word: 你好世界 is 4 and hello 世界 is 3 on Segmenter and fallback"
    requirement: COUNT-03
    verification:
      - kind: unit
        ref: "src/lib/counter.test.ts#counts 你好世界 as 4 on Segmenter and fallback"
        status: pass
      - kind: unit
        ref: "src/lib/counter.test.ts#counts hello 世界 as 3 on Segmenter and fallback"
        status: pass
    human_judgment: false
  - id: D4
    description: "Counts recompute from textarea onInput via useMemo after isTooLarge; tiles in children; copyable summary"
    requirement: COUNT-04
    verification:
      - kind: unit
        ref: "npm test (catalog length 11, featured 6, ToolIsland slug-equals, EN+ZH existsSync)"
        status: pass
    human_judgment: true
    rationale: "Island live-update and Copy UX have no jsdom/tsx tests; verifier should open /tools/word-counter/ and /zh/tools/word-counter/"

duration: 26min
completed: 2026-09-11
status: complete
---

# Phase 2 Plan 01: Word Counter Slice Summary

**In-browser word-counter with Intl.Segmenter plus Han fallback, six metric tiles, and EN/ZH catalog parity at TOOLS length 11**

## Performance

- **Duration:** 26 min
- **Started:** 2026-09-11T13:19:31Z
- **Completed:** 2026-09-11T13:45:58Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Shipped `countText` / `countWords` / `countWordsFallback` so empty input is ok-true zeros, English `hello world` is 2 words, and CJK `你好世界` is 4 on both Segmenter and fallback
- WordCounter island clones JsonFormatter (`isTooLarge` then lib, `useMemo`, `onInput`) and renders six metric tiles in children while ToolShell gets a copyable newline summary
- Catalog gained slug `word-counter` (Text, featured false); completeness harness is green at length 11 with featured still 6; EN+ZH markdown howTo 3 / faq 4

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end word-counter** - `06ce3c0` (feat)
2. **Task 2: Sentences, paragraphs, CJK Segmenter, fallback Han** - `7af4ee0` (feat)
3. **Task 3: EN/ZH chrome, CJK FAQ, completeness at 11** - `e49d045` (docs)

**Plan metadata:** pending final docs commit

## Files Created/Modified

- `src/lib/counter.ts` - Named exports for countText, countWords, countWordsFallback
- `src/lib/counter.test.ts` - English, empty zeros, lines, Han, sentences, paragraphs
- `src/components/tools/WordCounter.tsx` - Default-export island with tiles and ToolShell summary
- `src/components/tools/ToolIsland.astro` - Static WordCounter import and slug === 'word-counter'
- `src/data/tools.ts` - Append-only word-counter row; existing ten relatedSlugs untouched
- `src/data/tools.test.ts` - Snapshot toHaveLength 11; featured length 6 unchanged
- `src/i18n/ui.ts` - EN+ZH tools['word-counter'] chrome keys
- `src/content/tools/word-counter.md` - locale en, howTo 3, faq 4
- `src/content/tools/zh/word-counter.md` - locale zh, howTo 3, faq 4

## Decisions Made

- Clone JsonFormatter + `src/lib/json.ts`, not UuidGenerator
- Category Text, featured false; bump catalog snapshot 10 → 11 in this slice
- Word count: Intl.Segmenter granularity word + isWordLike; export countWordsFallback (whitespace + each Han ideograph = 1 word)
- Empty/whitespace-only: ok true with all metrics 0
- Metric tiles in children; copyable summary on ToolShell
- Do not rewrite existing ten relatedSlugs; no lib barrel; zero new npm packages
- Worktree baseline had no `src/i18n/ui.ts` / `useToolUi` / locale on ToolShell. Added a minimal `ui.ts` for this slug only and passed `locale="en"` from ToolIsland. Did not edit ToolShell.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical] Minimal ui.ts because i18n layer is absent in this worktree**
- **Found during:** Task 1
- **Issue:** Plan assumed `src/i18n/ui.ts`, `useToolUi`, and locale on JsonFormatter/ToolIsland. Committed baseline has English-only JsonFormatter and ToolShell with no locale prop. Creating a full i18n rewrite of the existing ten tools is out of scope.
- **Fix:** Added `src/i18n/ui.ts` with only `tools['word-counter']` on en and zh. WordCounter takes `{ locale: Locale }` and reads labels via `t(locale)`. ToolIsland passes `locale="en"`. ToolShell, limits.ts, json.ts, and JsonFormatter were not edited.
- **Files modified:** `src/i18n/ui.ts`, `src/components/tools/WordCounter.tsx`, `src/components/tools/ToolIsland.astro`
- **Commit:** `06ce3c0`

**2. [Rule 1 - Bug] zh-Hans Segmenter counted 你好世界 as 2 words**
- **Found during:** Task 2
- **Issue:** `Intl.Segmenter('zh-Hans', { granularity: 'word' })` groups Chinese into dictionary words (`你好` + `世界` = 2). COUNT-03 / D-04 require each Han ideograph = 1 word (4 and 3).
- **Fix:** After `isWordLike`, count each `\p{Script=Han}` in the segment (non-Han word-like still +1). Fallback already split Han.
- **Files modified:** `src/lib/counter.ts`
- **Commit:** `7af4ee0`

**Total deviations:** 2 auto-fixed (1 missing-critical, 1 bug). **Impact:** COUNT-03 now holds on Node 22 Segmenter and fallback; later Phase 2 tools still need a shared i18n layer if the main tree has not landed one.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None — no new API routes, auth paths, or schema trust boundaries. T-02-03 (`isTooLarge` before `countText`) and T-02-04 (metrics as text nodes) are in the island.

## Verification

`npm test` after each task: 13 files, 56 tests passed (final run). Completeness: TOOLS length 11, featured 6, ToolIsland slug-equals, EN+ZH existsSync. No Playwright.

## Next Phase Readiness

Ready for 02-02-PLAN.md (case-converter). Catalog snapshot is now 11; that plan must bump to 12. Featured stays 6.

## Self-Check: PASSED

- FOUND: src/lib/counter.ts
- FOUND: src/lib/counter.test.ts
- FOUND: src/components/tools/WordCounter.tsx
- FOUND: src/i18n/ui.ts
- FOUND: src/content/tools/word-counter.md
- FOUND: src/content/tools/zh/word-counter.md
- FOUND: 06ce3c0, 7af4ee0, e49d045
