---
phase: 13-islands-without-led
plan: 01
subsystem: ui
tags: [preact, astro, i18n, locale, ToolShell]

requires:
  - phase: 11-i18n-kernel
    provides: Locale type, t(locale) copy/copied, useToolUi
  - phase: 12-pages-langswitch
    provides: EN/ZH slug pages already pass locale into ToolIsland
provides:
  - no-LED ToolShell with required locale and t(locale) Copy/Copied
  - ToolIsland required Locale with locale={locale} on all 18 islands
  - original-ten dirty useToolUi islands (UuidGenerator t(locale)) wrapping no-LED ToolShell
  - later-eight ToolShell call sites all pass locale={locale} while keeping t(locale)
affects: [14-ci-overlay-free-build]

actuals:
  tokens: 7541
  tasks: 3
  commits: 3

plan_head_before: ecc534db57cccc254f3de3efead1b6eaec925e9b

tech-stack:
  added: []
  patterns:
    - HEAD ToolShell DOM (children, error, pre, button) plus required locale
    - Path-limited land of dirty original-ten islands; never git add -A
    - Later eight keep t(locale); only ToolShell opening tags gain locale={locale}

key-files:
  created: []
  modified:
    - src/components/ToolShell.tsx
    - src/components/tools/ToolIsland.astro
    - src/components/tools/JsonFormatter.tsx
    - src/components/tools/WordCounter.tsx
    - src/components/tools/JwtDecoder.tsx
    - src/components/tools/Base64Tool.tsx
    - src/components/tools/UrlEncode.tsx
    - src/components/tools/HashGenerator.tsx
    - src/components/tools/UuidGenerator.tsx
    - src/components/tools/RegexTester.tsx
    - src/components/tools/UnixTimestamp.tsx
    - src/components/tools/CrontabExplainer.tsx
    - src/components/tools/ColorConverter.tsx
    - src/components/tools/CaseConverter.tsx
    - src/components/tools/LoremIpsum.tsx
    - src/components/tools/PasswordGenerator.tsx
    - src/components/tools/SqlFormatter.tsx
    - src/components/tools/TextDiff.tsx
    - src/components/tools/MarkdownPreview.tsx
    - src/components/tools/QrCode.tsx

key-decisions:
  - "ToolShell is HEAD layout plus required locale; overlay LED chrome was not restaged"
  - "Original ten landed dirty; UuidGenerator keeps t(locale); the other nine use useToolUi"
  - "Later eight keep t(locale)/localizeError; only ToolShell opening tags received locale={locale}"
  - "src/lib/crontab.ts stayed unstaged; stash@{0} and stash@{1} were not popped"

patterns-established:
  - "Pattern 1: Required locale on ToolShell and ToolIsland; no en fallback"
  - "Pattern 2: Path-limited git add of allowlisted islands only"

requirements-completed: [ISLE-01, ISLE-02, ISLE-03, ISLE-04]

coverage:
  - id: D1
    description: "No-LED ToolShell accepts required locale and localizes Copy/Copied via t(locale)"
    requirement: ISLE-01
    verification:
      - kind: unit
        ref: "npx vitest run src/i18n/useToolUi.test.ts src/i18n/locales.test.ts"
        status: pass
    human_judgment: true
    rationale: "Idle/hover Copy contrast and EN Copy vs ZH 复制/已复制 were tracer human UAT (approved 2026-09-21)"
  - id: D2
    description: "ToolIsland requires Locale from locales.ts and passes locale={locale} to all 18 islands"
    requirement: ISLE-02
    verification:
      - kind: unit
        ref: "src/components/tools/ToolIsland.test.ts"
        status: pass
    human_judgment: false
  - id: D3
    description: "Original ten islands land with required locale wrapping no-LED ToolShell (UuidGenerator t(locale))"
    requirement: ISLE-03
    verification:
      - kind: unit
        ref: "npx vitest run src/i18n/useToolUi.test.ts src/data/tools.test.ts src/components/tools/ToolIsland.test.ts"
        status: pass
    human_judgment: false
  - id: D4
    description: "All eight later-eight ToolShell call sites pass locale={locale} and keep t(locale)"
    requirement: ISLE-01
    verification:
      - kind: unit
        ref: "npx vitest run src/data/tools.test.ts src/components/tools/ToolIsland.test.ts src/i18n/useToolUi.test.ts src/i18n/locales.test.ts"
        status: pass
    human_judgment: false
  - id: D5
    description: "Completeness tests unchanged and green (EN+ZH markdown and ToolIsland slug === branches)"
    requirement: ISLE-04
    verification:
      - kind: unit
        ref: "src/data/tools.test.ts"
        status: pass
      - kind: unit
        ref: "src/components/tools/ToolIsland.test.ts"
        status: pass
    human_judgment: false

duration: 5min
completed: 2026-09-21
status: complete
---

# Phase 13 Plan 01: Islands without LED Summary

**No-LED ToolShell with required locale Copy/Copied, ToolIsland locale on all 18 islands, original-ten useToolUi land, later-eight ToolShell locale={locale}**

## Performance

- **Duration:** 5 min (this continuation; Task 1 tracer already committed as 195e560)
- **Started:** 2026-09-21T09:37:49Z
- **Completed:** 2026-09-21T09:43:28Z
- **Tasks:** 3
- **Files modified:** 20

## Accomplishments

- ToolShell is HEAD DOM order (children, error, pre, Copy) with required `locale` and `t(locale)` Copy/Copied; no LED / `tool-panel__chrome`
- ToolIsland types `locale: Locale` from `locales.ts` and passes `locale={locale}` to all 18 `client:load` islands
- Remaining original ten islands landed dirty with `locale={locale}` on ToolShell; UuidGenerator keeps `t(locale)`
- Remaining later-eight ToolShell call sites gained `locale={locale}` while keeping `t(locale)` / `localizeError`
- Completeness tests unchanged and green; `crontab.ts` unstaged; stashes untouched

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end no-LED Copy/Copied — ToolShell, ToolIsland required locale, json-formatter, WordCounter** - `195e560` (feat)
2. **Task 2: Land remaining original-ten islands with locale and no-LED ToolShell** - `4b9d97c` (feat)
3. **Task 3: Add locale={locale} on remaining later-eight ToolShell call sites** - `aff772d` (feat)

**Plan metadata:** pending docs commit after this summary

_Note: Tracer Task 1 was human-verified and approved 2026-09-21 before this continuation._

## Files Created/Modified

- `src/components/ToolShell.tsx` - Required locale; t(locale) Copy/Copied; HEAD layout; no LED
- `src/components/tools/ToolIsland.astro` - Required Locale; locale={locale} on all 18 islands
- `src/components/tools/JsonFormatter.tsx` - Original-ten analog: useToolUi + ToolShell locale={locale}
- `src/components/tools/WordCounter.tsx` - Later-eight analog: t(locale) + ToolShell locale={locale}
- `src/components/tools/JwtDecoder.tsx` - Dirty useToolUi island landed
- `src/components/tools/Base64Tool.tsx` - Dirty useToolUi island landed
- `src/components/tools/UrlEncode.tsx` - Dirty useToolUi island landed
- `src/components/tools/HashGenerator.tsx` - Dirty useToolUi island landed
- `src/components/tools/UuidGenerator.tsx` - t(locale) equivalent + ToolShell locale={locale}
- `src/components/tools/RegexTester.tsx` - Dirty useToolUi island landed
- `src/components/tools/UnixTimestamp.tsx` - Dirty useToolUi island landed
- `src/components/tools/CrontabExplainer.tsx` - Dirty useToolUi island landed (crontab.ts not committed)
- `src/components/tools/ColorConverter.tsx` - Dirty useToolUi island landed
- `src/components/tools/CaseConverter.tsx` - ToolShell locale={locale}; keeps t(locale)
- `src/components/tools/LoremIpsum.tsx` - ToolShell locale={locale}; keeps t(locale)
- `src/components/tools/PasswordGenerator.tsx` - ToolShell locale={locale}; keeps t(locale)
- `src/components/tools/SqlFormatter.tsx` - ToolShell locale={locale}; keeps t(locale)
- `src/components/tools/TextDiff.tsx` - ToolShell locale={locale}; keeps t(locale)
- `src/components/tools/MarkdownPreview.tsx` - ToolShell locale={locale}; keeps t(locale)
- `src/components/tools/QrCode.tsx` - ToolShell locale={locale}; keeps t(locale)

## Decisions Made

- ToolShell rewritten from HEAD layout plus required locale; dirty LED chrome was never staged (T-13-01)
- Original ten landed as written; UuidGenerator may keep t(locale)
- Later eight were not migrated onto useToolUi
- Sequential on main working tree (isolation none); path-limited add only
- Overlay-free astro build remains Phase 14

## Deviations from Plan

None - plan executed exactly as written.

---

**Total deviations:** 0 auto-fixed
**Impact on plan:** No scope creep. ToolIsland already had all 18 locale={locale} from the tracer, so Task 2 and Task 3 did not restage it.

## Issues Encountered

None

## Authentication Gates

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Islands and no-LED ToolShell locale chrome are committed; Phase 14 can run overlay-free astro build
- `src/lib/crontab.ts` remains dirty and uncommitted by design
- stash@{0} and stash@{1} still present; do not pop
- SITE_ORIGIN still `https://example.com`; no new npm packages

---
*Phase: 13-islands-without-led*
*Completed: 2026-09-21*

## Self-Check: PASSED

- FOUND: src/components/ToolShell.tsx
- FOUND: src/components/tools/ToolIsland.astro
- FOUND: src/components/tools/JsonFormatter.tsx
- FOUND: src/components/tools/WordCounter.tsx
- FOUND: src/data/tools.test.ts
- FOUND: src/components/tools/ToolIsland.test.ts
- FOUND: .planning/phases/13-islands-without-led/13-01-SUMMARY.md
- FOUND: 195e560
- FOUND: 4b9d97c
- FOUND: aff772d
- COMMITS_ACTUAL=3 from plan_head_before ecc534db57cccc254f3de3efead1b6eaec925e9b
- ToolIsland locale={locale} count=18
- crontab.ts unstaged; stash@{0} and stash@{1} present
- Completeness tests unchanged vs plan_head_before
