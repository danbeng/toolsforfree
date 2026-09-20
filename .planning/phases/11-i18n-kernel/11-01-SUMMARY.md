---
phase: 11-i18n-kernel
plan: 01
subsystem: i18n
tags: [astro, i18n, locales, path-helpers, useToolUi, vitest]

requires: []
provides:
  - LOCALES, Locale, and LOCALE_META from locales.ts
  - localizedPath, switchLocalePath, localeFromPathname from path.ts
  - useToolUi copy / tooLarge / err helper
  - EN+ZH chrome keys, categories, original-ten tools[slug], fill, Locale re-export
affects: [12-pages-langswitch, 13-islands-without-led]

actuals:
  tokens: 4558
  tasks: 3
  commits: 3

plan_head_before: 71fd48b42c7248ff6a90cbdb11e1ad46ba086812

tech-stack:
  added: []
  patterns:
    - Locale sourced from LOCALES in locales.ts and re-exported by ui.ts
    - Pure path helpers with slash collapse and illegal locale as en
    - useToolUi as a named pure function wrapping t() and localizeError

key-files:
  created:
    - src/i18n/locales.ts
    - src/i18n/locales.test.ts
    - src/i18n/path.ts
    - src/i18n/path.test.ts
    - src/i18n/useToolUi.ts
    - src/i18n/useToolUi.test.ts
  modified:
    - src/i18n/ui.ts

key-decisions:
  - "Locale lives in locales.ts; ui.ts re-exports it so Header still compiles"
  - "Path helpers never throw; illegal locale is en; results never start with //"
  - "useToolUi is a pure named function; err('') and err(null) return null"

patterns-established:
  - "Pattern 1: locales.ts is a leaf; path.ts and ui.ts import Locale from it"
  - "Pattern 2: fill() replaces {token} from a string record; missing keys become empty"
  - "Pattern 3: useToolUi maps empty/null to null before localizeError"

requirements-completed: [KERN-01, KERN-02, KERN-03, KERN-04]

coverage:
  - id: D1
    description: locales.ts exports LOCALES (en then zh), Locale, and LOCALE_META with zh-Hans
    requirement: KERN-01
    verification:
      - kind: unit
        ref: src/i18n/locales.test.ts#is en then zh
        status: pass
      - kind: unit
        ref: src/i18n/locales.test.ts#exposes zh-Hans meta
        status: pass
    human_judgment: false
  - id: D2
    description: Path helpers emit EN unprefixed URLs, ZH /zh/ URLs, trailing slashes, no two-slash prefix
    requirement: KERN-02
    verification:
      - kind: unit
        ref: src/i18n/path.test.ts#localizedPath / switchLocalePath / localeFromPathname
        status: pass
    human_judgment: false
  - id: D3
    description: useToolUi returns copy, tooLarge, and err; empty/null err is null
    requirement: KERN-03
    verification:
      - kind: unit
        ref: src/i18n/useToolUi.test.ts#returns copy, tooLarge, err
        status: pass
    human_judgment: false
  - id: D4
    description: ui.ts chrome keys, PascalCase categories, original-ten labels, fill, Locale re-export
    requirement: KERN-04
    verification:
      - kind: unit
        ref: src/i18n/locales.test.ts#ui chrome and fill
        status: pass
      - kind: unit
        ref: src/i18n/errors.test.ts#later-eight chrome keys
        status: pass
    human_judgment: false

duration: 17min
completed: 2026-09-20
status: complete
---

# Phase 11 Plan 01: i18n Kernel Summary

EN unprefixed / ZH `/zh/` path helpers, locale registry, chrome dictionary, and `useToolUi` so Phase 12/13 can mount LangSwitch and islands without rewriting callers.

## Performance

- **Duration:** 17 min
- **Started:** 2026-09-20T03:59:47Z
- **Completed:** 2026-09-20T04:16:29Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Shipped `LOCALES`, `Locale`, and `LOCALE_META` (`en` / `zh-Hans`) from `src/i18n/locales.ts`
- Shipped `localizedPath`, `switchLocalePath`, and `localeFromPathname` with trailing slashes, `/zhfoo` as EN, and no `//` prefix
- Expanded `ui.ts` with chrome keys, PascalCase `categories`, original-ten `tools[slug]`, `fill()`, and Locale re-export
- Added pure `useToolUi` returning `copy` / `tooLarge` / `err()` with empty-to-null

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end locale plus path kernel** - `52780b0` (feat)
2. **Task 2: Expand ui.ts chrome, categories, original-ten labels, fill, Locale re-export** - `e91081e` (feat)
3. **Task 3: Add useToolUi copy, tooLarge, and err helper with tests** - `1f01c0a` (feat)

## Files Created/Modified

- `src/i18n/locales.ts` - LOCALES, Locale, LOCALE_META
- `src/i18n/locales.test.ts` - LOCALES order, meta, chrome/fill asserts
- `src/i18n/path.ts` - localizedPath, switchLocalePath, localeFromPathname
- `src/i18n/path.test.ts` - path table including /zhfoo, empty, illegal locale, two-slash
- `src/i18n/ui.ts` - chrome keys, categories, original-ten labels, fill, Locale re-export
- `src/i18n/useToolUi.ts` - copy / tooLarge / err helper
- `src/i18n/useToolUi.test.ts` - empty-to-null and tooLarge contract

## Decisions Made

- Locale is derived from `LOCALES` in `locales.ts`; `ui.ts` re-exports it so Header/WordCounter keep compiling
- Path helpers are pure strings; illegal locale is treated as `en`; results never start with `//`
- `useToolUi` is not a Preact hook; `err('')` / `err(null)` return `null` before `localizeError`
- `ui.en.tooLarge` byte-matches `INPUT_TOO_LARGE_MSG`; categories use PascalCase ToolCategory keys

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Vitest 5 rejects `-x`**
- **Found during:** Task 1 verify
- **Issue:** Plan verify command used `npx vitest run ... -x`; Vitest 5.0.0 throws `Unknown option -x`
- **Fix:** Ran the same file list without `-x`
- **Files modified:** none
- **Verification:** `npx vitest run src/i18n/locales.test.ts src/i18n/path.test.ts src/i18n/errors.test.ts` — 3 files, 27 tests passed
- **Committed in:** n/a (command-only)

**Total deviations:** 1 auto-fixed (Rule 3)
**Impact on plan:** Verify command adjusted for Vitest 5. No scope creep.

## Issues Encountered

Probing `gsd-tools query commit "test"` without `--files` committed planning cache files onto main. Mixed-reset `HEAD~1` (no `--hard`, no stash) restored HEAD to `71fd48b` before the tracer allowlist commit. Stashes were not popped.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 12 can mount LangSwitch and the ZH tree against `locales.ts`, `path.ts`, and `ui.ts` chrome keys. Phase 13 can wire `useToolUi` into islands. Hard fences held: LED ToolShell, crontab.ts, LangSwitch, and `src/pages/zh/` were not committed; `SITE_ORIGIN` remains `https://example.com`; no new packages.

## Self-Check: PASSED

---
*Phase: 11-i18n-kernel*
*Completed: 2026-09-20*
