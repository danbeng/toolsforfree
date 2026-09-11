---
phase: 02-light-text-and-generate-tools
plan: 04
subsystem: tools
tags: [password-generator, csprng, vitest, preact, generate, catalog]

requires:
  - phase: 02-light-text-and-generate-tools
    provides: lorem-ipsum slice at TOOLS length 13, ToolIsland locale={locale}, featured 6, ZH_ERRORS lorem count key
provides:
  - "generatePassword plus unexported randomIndex rejection sampling (crypto.getRandomValues)"
  - "PasswordGenerator island with generate on mount and click; ToolShell copies the password"
  - "Catalog slug password-generator, category Generate, featured false; TOOLS length 14; featured still 6"
  - "EN+ZH markdown howTo 3 / faq 4 and ui.en/zh tools['password-generator'] chrome"
  - "ZH_ERRORS keys Select at least one character set and Length must be between 8 and 128"
affects:
  - later Phase 2 catalog completeness
  - later generate-tool slices

actuals:
  tokens: 5220
  tasks: 3
  commits: 4

plan_head_before: 2a0d148948d75efdb3c96828971e96d0265d73e4

tech-stack:
  added: []
  patterns:
    - "CSPRNG randomIndex: crypto.getRandomValues, reject x >= limit, then x % n"
    - "Password generation lives in src/lib/password.ts; island never calls getRandomValues"
    - "Empty charset and out-of-range length are ok false English errors, localized via ZH_ERRORS"

key-files:
  created:
    - src/lib/password.ts
    - src/lib/password.test.ts
    - src/components/tools/PasswordGenerator.tsx
    - src/components/tools/PasswordGenerator.test.ts
    - src/content/tools/password-generator.md
    - src/content/tools/zh/password-generator.md
  modified:
    - src/components/tools/ToolIsland.astro
    - src/data/tools.ts
    - src/data/tools.test.ts
    - src/i18n/ui.ts
    - src/i18n/errors.ts
    - src/i18n/errors.test.ts

key-decisions:
  - "Copied RESEARCH randomIndex and generatePassword exactly; CSPRNG stays in the lib"
  - "UuidGenerator used only for Generate-button placement and useEffect-on-mount"
  - "Category Generate, featured false; bump catalog snapshot 13 to 14; featured stays 6"
  - "Do not require one character from each class; no entropy hint (PASS-07 deferred)"
  - "Appended password-generator keys onto ui.ts without dropping prior Phase 2 tools"

patterns-established:
  - "Phase 2 generate tool: catalog row featured false, lib+test, island, ToolIsland static branch, EN+ZH ui, ZH_ERRORS, EN+ZH markdown"
  - "Generator island: button type=button above toggles; generate on mount and click; toggles do not auto-regen"

requirements-completed: [PASS-01, PASS-02, PASS-03, PASS-04, PASS-05, PASS-06]

coverage:
  - id: D1
    description: "Visitor can generate a password of length 8-128 default 16 on /tools/password-generator/"
    requirement: PASS-01
    verification:
      - kind: unit
        ref: "src/lib/password.test.ts#returns ok true and length 16 with default options"
        status: pass
      - kind: unit
        ref: "src/lib/password.test.ts#accepts length 8 and 128 when charset is non-empty"
        status: pass
      - kind: unit
        ref: "src/lib/password.test.ts#rejects length 7"
        status: pass
    human_judgment: false
  - id: D2
    description: "Toggles lowercase, uppercase, digits, symbols; symbols exactly !@#$%^&*-_=+; island defaults all four on"
    requirement: PASS-02
    verification:
      - kind: unit
        ref: "src/lib/password.test.ts#emits only lowercase at length 32"
        status: pass
      - kind: unit
        ref: "src/lib/password.test.ts#emits only locked symbols at length 32"
        status: pass
    human_judgment: false
  - id: D3
    description: "Exclude similar strips i l 1 O 0 from the charset when on; default off"
    requirement: PASS-03
    verification:
      - kind: unit
        ref: "src/lib/password.test.ts#strips i l 1 O 0 from a length-128 password with all sets and excludeSimilar"
        status: pass
    human_judgment: false
  - id: D4
    description: "Generation uses crypto.getRandomValues plus rejection sampling; Math.random is absent from password.ts"
    requirement: PASS-04
    verification:
      - kind: unit
        ref: "src/lib/password.test.ts#uses crypto.getRandomValues and does not use Math.random"
        status: pass
      - kind: unit
        ref: "src/lib/password.test.ts#rejects biased remainder until x is below the limit"
        status: pass
    human_judgment: false
  - id: D5
    description: "Copy via ToolShell; Generate button above toggles; generate on mount and click; toggles do not auto-regen"
    requirement: PASS-05
    verification:
      - kind: unit
        ref: "src/components/tools/PasswordGenerator.test.ts#calls generatePassword from the lib and copies via ToolShell output"
        status: pass
      - kind: unit
        ref: "src/components/tools/PasswordGenerator.test.ts#places Generate above toggles and does not auto-regen on toggle"
        status: pass
    human_judgment: true
    rationale: "Island generate/Copy UX has no jsdom/tsx tests; verifier should open /tools/password-generator/ and /zh/tools/password-generator/"
  - id: D6
    description: "Empty charset returns Select at least one character set; ZH_ERRORS in this slice; catalog length 14 featured 6"
    requirement: PASS-06
    verification:
      - kind: unit
        ref: "src/lib/password.test.ts#returns Select at least one character set when all charset flags are false"
        status: pass
      - kind: unit
        ref: "src/i18n/errors.test.ts#maps empty charset and length errors in ZH_ERRORS"
        status: pass
      - kind: unit
        ref: "src/data/tools.test.ts#has exactly 14 tools"
        status: pass
    human_judgment: false

duration: 24min
completed: 2026-09-11
status: complete
---

# Phase 2 Plan 04: Password Generator Summary

**In-browser CSPRNG password generator with rejection sampling, charset toggles, and EN/ZH catalog parity at TOOLS length 14**

## Performance

- **Duration:** 24 min
- **Started:** 2026-09-11T17:53:31Z
- **Completed:** 2026-09-11T18:17:15Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments

- Shipped `generatePassword` with RESEARCH `randomIndex` so length 8-128 succeeds, empty charset returns `Select at least one character set`, and out-of-range length returns `Length must be between 8 and 128`
- PasswordGenerator island clones JsonFormatter lib-call wiring (Generate button placement only from Uuid): generate on mount and click, toggles do not auto-regen, ToolShell copies the password string
- Catalog gained slug `password-generator` (Generate, featured false); completeness harness is green at length 14 with featured still 6; EN+ZH markdown howTo 3 / faq 4; ZH_ERRORS in this same slice

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: failing password tests** - `578b77c` (test)
2. **Task 1 GREEN: password-generator 8-file slice** - `e90aafe` (feat)
3. **Task 2: Charset membership, similar-exclusion, empty-charset** - `a5f7b42` (test)
4. **Task 3: EN/ZH chrome, ZH_ERRORS, and not-a-manager FAQ** - `cc8909d` (test)

**Plan metadata:** pending this SUMMARY commit

## Files Created/Modified

- `src/lib/password.ts` - Named export generatePassword; unexported randomIndex CSPRNG
- `src/lib/password.test.ts` - Length bounds, charset membership, similar exclusion, empty charset, source-read CSPRNG
- `src/components/tools/PasswordGenerator.tsx` - Default-export island; generate button type=button above toggles
- `src/components/tools/PasswordGenerator.test.ts` - Source-read lib import, ToolShell output, Generate placement, FAQ
- `src/components/tools/ToolIsland.astro` - Static PasswordGenerator import and slug === 'password-generator' with locale={locale}
- `src/data/tools.ts` - Append-only password-generator row; existing ten relatedSlugs untouched
- `src/data/tools.test.ts` - Snapshot toHaveLength 14; featured length 6 unchanged
- `src/i18n/ui.ts` - EN+ZH tools['password-generator'] chrome keys appended after lorem-ipsum
- `src/i18n/errors.ts` - ZH_ERRORS for empty charset and length bounds; lorem count key kept
- `src/i18n/errors.test.ts` - Password error mapping and shared chrome keys
- `src/content/tools/password-generator.md` - locale en, howTo 3, faq 4
- `src/content/tools/zh/password-generator.md` - locale zh, howTo 3, faq 4

## Decisions Made

- Clone JsonFormatter + json result union, not UuidGenerator for generation logic
- Category Generate, featured false; bump catalog snapshot 13 to 14
- CSPRNG is `crypto.getRandomValues` with rejection sampling; never `Math.random`; never biased remainder
- Island defaults: length 16, all four sets on, excludeSimilar off
- Symbols charset exactly `!@#$%^&*-_=+`
- Do not force one character from each selected class; no entropy hint
- Do not rewrite existing ten relatedSlugs; no lib barrel; zero new packages
- Append ui.ts keys; do not replace word-counter, case-converter, or lorem-ipsum dictionaries

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None — no new API routes, auth paths, or schema trust boundaries. T-02-01/T-02-02 (CSPRNG source-read), T-02-03 (length bounds), T-02-04 (password string into ToolShell text), and T-02-06 (empty charset error) are in the lib and island.

## Verification

`npm test` after each task: 19 files, 102 tests passed (final run). Completeness: TOOLS length 14, featured 6, ToolIsland slug-equals, EN+ZH existsSync. Source-read `password.ts` contains `getRandomValues` and does not contain `Math.random`. No Playwright.

## Next Phase Readiness

Phase 2 four tools shipped. Catalog snapshot is 14; featured stays 6. Ready for later phases that consume the additive catalog contract.

---
*Phase: 02-light-text-and-generate-tools*
*Completed: 2026-09-11*

## Self-Check: PASSED
