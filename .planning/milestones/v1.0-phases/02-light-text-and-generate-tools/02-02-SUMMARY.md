---
phase: 02-light-text-and-generate-tools
plan: 02
subsystem: tools
tags: [case-converter, vitest, preact, slugify, catalog]

requires:
  - phase: 02-light-text-and-generate-tools
    provides: word-counter slice at TOOLS length 11, ToolIsland word-counter branch, featured 6
provides:
  - "convertCases / slugify with CaseResult idle empty error for blank input"
  - "CaseConverter island with nine labeled rows, per-row clipboard write, joined ToolShell dump"
  - "Catalog slug case-converter, category Text, featured false; TOOLS length 12; featured still 6"
  - "EN+ZH markdown howTo 3 / faq 3 and ui.en/zh tools['case-converter'] chrome"
  - "ToolIsland locale prop passed as locale={locale} to WordCounter and CaseConverter"
affects:
  - 02-03-PLAN.md
  - later Phase 2 catalog slices

actuals:
  tokens: 2800
  tasks: 3
  commits: 4

plan_head_before: 85588da docs(02-01): complete word-counter plan

tech-stack:
  added: []
  patterns:
    - "Parser idle: convertCases blank/whitespace → ok false error empty string (json contract)"
    - "ColorConverter-style fan-out: nine labeled rows in children; newline-joined dump on ToolShell"
    - "slugify NFKD + strip marks + keep Letter/Number so Han stays; no pinyin"
    - "ToolIsland accepts locale and passes locale={locale} (not locale=\"en\")"

key-files:
  created:
    - src/lib/cases.ts
    - src/lib/cases.test.ts
    - src/components/tools/CaseConverter.tsx
    - src/content/tools/case-converter.md
    - src/content/tools/zh/case-converter.md
  modified:
    - src/components/tools/ToolIsland.astro
    - src/data/tools.ts
    - src/data/tools.test.ts
    - src/i18n/ui.ts

key-decisions:
  - "Cloned JsonFormatter plus src/lib/json.ts idle contract; did not clone UuidGenerator"
  - "Title Case: first Unicode code point of whitespace-separated words; no acronym table"
  - "Slug keeps Han via \\p{Letter}; café → cafe via NFKD"
  - "Appended case-converter keys onto ui.ts without dropping word-counter"
  - "Fixed 02-01 locale=\"en\" hardcode: ToolIsland now takes locale and passes locale={locale}"

patterns-established:
  - "Phase 2 light tool: catalog row featured false, lib+test, island, ToolIsland static branch, EN+ZH ui, EN+ZH markdown"
  - "Fan-out tools: per-row copy via navigator.clipboard.writeText plus joined ToolShell output"

requirements-completed: [CASE-01, CASE-02, CASE-03, CASE-04]

coverage:
  - id: D1
    description: "Visitor can paste on case-converter and see nine labeled rows: UPPER, lower, Title, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and URL slug"
    requirement: CASE-01
    verification:
      - kind: unit
        ref: "src/lib/cases.test.ts#fans out eight cases plus slug for hello world"
        status: pass
    human_judgment: true
    rationale: "Nine-row island chrome has no jsdom/tsx tests; verifier should open /tools/case-converter/"
  - id: D2
    description: "Identifier cases tokenize whitespace, underscore, hyphen, and punctuation; Title Case has no acronym table"
    requirement: CASE-02
    verification:
      - kind: unit
        ref: "src/lib/cases.test.ts#tokenizes mixed underscore and hyphen identifiers"
        status: pass
      - kind: unit
        ref: "src/lib/cases.test.ts#title-cases ASCII words without an acronym table"
        status: pass
    human_judgment: false
  - id: D3
    description: "Slug keeps CJK letters: 你好世界 is non-empty and contains those Han letters; café → cafe; punctuation collapses"
    requirement: CASE-03
    verification:
      - kind: unit
        ref: "src/lib/cases.test.ts#keeps Han letters in 你好世界"
        status: pass
      - kind: unit
        ref: "src/lib/cases.test.ts#strips Latin diacritics via NFKD"
        status: pass
      - kind: unit
        ref: "src/lib/cases.test.ts#collapses repeated punctuation and trims hyphens"
        status: pass
    human_judgment: false
  - id: D4
    description: "Each row has its own Copy via clipboard writeText; joined dump on ToolShell; catalog length 12 featured 6"
    requirement: CASE-04
    verification:
      - kind: unit
        ref: "npm test (catalog length 12, featured 6, ToolIsland slug-equals, EN+ZH existsSync)"
        status: pass
    human_judgment: true
    rationale: "Per-row copy UX has no jsdom tests; verifier should copy one row and copy-all"

duration: 40min
completed: 2026-09-12
status: complete
---

# Phase 2 Plan 02: Case Converter Slice Summary

**In-browser case/slug converter with nine fan-out rows, CJK-preserving slugify, and EN/ZH catalog parity at TOOLS length 12**

## Performance

- **Duration:** ~40 min (executor 503'd while writing SUMMARY; closed out after merge)
- **Started:** 2026-09-11
- **Completed:** 2026-09-12
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Shipped `convertCases` / `slugify` so blank input is idle `{ ok: false, error: '' }`, `hello world` fans out eight identifier cases plus slug, and `你好世界` slug stays non-empty with Han
- CaseConverter island renders nine labeled rows with per-row `navigator.clipboard.writeText` and a newline-joined ToolShell dump
- Catalog gained slug `case-converter` (Text, featured false); completeness harness is green at length 12 with featured still 6; EN+ZH markdown howTo 3 / faq 3
- ToolIsland now accepts `locale` and passes `locale={locale}` to WordCounter and CaseConverter (fixes 02-01 `locale="en"` hardcode)

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end case-converter** - `316c52b` (feat)
2. **Task 2: Title, identifier, slug edges** - `d7380e4` (test)
3. **Task 3: Per-row copy feedback** - `d22d306` (feat)

**Plan metadata:** this SUMMARY commit

## Files Created/Modified

- `src/lib/cases.ts` - Named exports convertCases, slugify, CaseResult
- `src/lib/cases.test.ts` - Idle, hello world fan-out, Title, identifiers, Han slug, café, punctuation
- `src/components/tools/CaseConverter.tsx` - Default-export island with nine rows and per-row copy
- `src/components/tools/ToolIsland.astro` - Static CaseConverter import, locale prop, locale={locale}
- `src/data/tools.ts` - Append-only case-converter row; existing ten relatedSlugs untouched
- `src/data/tools.test.ts` - Snapshot toHaveLength 12; featured length 6 unchanged
- `src/i18n/ui.ts` - EN+ZH tools['case-converter'] chrome keys appended after word-counter
- `src/content/tools/case-converter.md` - locale en, howTo 3, faq 3
- `src/content/tools/zh/case-converter.md` - locale zh, howTo 3, faq 3

## Decisions Made

- Clone JsonFormatter + json idle contract, not UuidGenerator
- Category Text, featured false; bump catalog snapshot 11 → 12
- Title Case: first Unicode code point of whitespace words; rest of word lower; no acronym table
- slugify: NFKD, strip marks, keep Letter and Number (Han included)
- Do not rewrite existing ten relatedSlugs; no lib barrel; zero new npm packages
- Append ui.ts keys; do not replace the word-counter dictionary

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] ToolIsland locale="en" from 02-01**
- **Found during:** Task 1
- **Issue:** 02-01 hardcoded `locale="en"` on WordCounter so `/zh/tools/word-counter/` would still render English chrome.
- **Fix:** ToolIsland declares `locale?: 'en' | 'zh'` and passes `locale={locale}` to WordCounter and CaseConverter.
- **Files modified:** `src/components/tools/ToolIsland.astro`
- **Commit:** `316c52b`

**Total deviations:** 1 auto-fixed. **Impact:** ZH pages for Phase 2 islands receive the page locale.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None — no new API routes. T-02-03 (`isTooLarge` before `convertCases`) and T-02-04 (row values as text inputs) are in the island.

## Verification

`npm test` after merge: 14 files, 65 tests passed. Completeness: TOOLS length 12, featured 6, ToolIsland slug-equals, EN+ZH existsSync. No Playwright.

## Next Phase Readiness

Ready for 02-03-PLAN.md (lorem-ipsum). Catalog snapshot is now 12; that plan must bump to 13. Featured stays 6.

## Self-Check: PASSED

- FOUND: src/lib/cases.ts
- FOUND: src/lib/cases.test.ts
- FOUND: src/components/tools/CaseConverter.tsx
- FOUND: src/content/tools/case-converter.md
- FOUND: src/content/tools/zh/case-converter.md
- FOUND: 316c52b, d7380e4, d22d306
