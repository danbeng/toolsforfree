---
phase: 03-sql-formatter
plan: 01
subsystem: tools
tags: [sql-formatter, formatDialect, vitest, preact, catalog, CAT-04]

requires:
  - phase: 02-light-text-and-generate-tools
    provides: catalog length 14 featured 6, ToolIsland locale={locale} branches, ZH_ERRORS Phase 2 keys, WordCounter locale wiring
provides:
  - "formatSql plus SqlDialect and SqlResult; thin wrap of named formatDialect and six dialect objects"
  - "SqlFormatter island with native dialect select, isTooLarge, live useMemo, ToolShell copy"
  - "Catalog slug sql-formatter, category Format, featured false; TOOLS length 15; featured still 6"
  - "EN+ZH markdown howTo 3 / faq 3 including not-executor and not-autodetect"
  - "ZH_ERRORS Invalid SQL to 无效的 SQL; ui.en/zh tools['sql-formatter'] chrome"
  - "Direct dependency sql-formatter@15.8.2; CAT-04 JsonFormatter chunk clean"
affects:
  - later Format-tool slices
  - later catalog completeness at length 15

actuals:
  tokens: 6600
  tasks: 3
  commits: 4

plan_head_before: 5a865bff2ef2c296189e4b59df641250e4c2bc0c

tech-stack:
  added:
    - sql-formatter@15.8.2
  patterns:
    - "Thin src/lib wrap of formatDialect plus named dialect objects; never format() + language field"
    - "Heavy package imported only from that tool's src/lib; island imports ../../lib/sql"
    - "Idle trim-before-library; every library throw maps to English Invalid SQL"

key-files:
  created:
    - src/lib/sql.ts
    - src/lib/sql.test.ts
    - src/components/tools/SqlFormatter.tsx
    - src/content/tools/sql-formatter.md
    - src/content/tools/zh/sql-formatter.md
  modified:
    - package.json
    - package-lock.json
    - src/components/tools/ToolIsland.astro
    - src/data/tools.ts
    - src/data/tools.test.ts
    - src/i18n/ui.ts
    - src/i18n/errors.ts
    - src/i18n/errors.test.ts

key-decisions:
  - "Official sql-formatter@15.8.2 only; named formatDialect plus sql, postgresql, mysql, sqlite, transactsql, bigquery"
  - "Always pass keywordCase upper and tabWidth 2; empty/whitespace idle before the library"
  - "Catalog sql-formatter Format featured false; TOOLS 14 to 15; featured stays 6; relatedSlugs json-formatter, regex-tester, base64"
  - "Clone WordCounter locale wiring, HEAD HashGenerator native select, JsonFormatter live useMemo; do not clone dirty useToolUi islands"
  - "CAT-04 isolation: only sql.ts imports the package; JsonFormatter chunk has no nearley or formatDialect after fresh build"

patterns-established:
  - "First heavy-library catalog tool: named dialect-aware formatter in src/lib, island never imports the npm package"
  - "SQL-05 is throw-catch, not a linter; incomplete SELECT * FROM still formats"

requirements-completed: [SQL-01, SQL-02, SQL-03, SQL-04, SQL-05, SQL-06]

coverage:
  - id: D1
    description: "Visitor can paste SQL on /tools/sql-formatter/ and see pretty-printed UPPERCASE keywords with 2-space indent"
    requirement: SQL-01
    verification:
      - kind: unit
        ref: "src/lib/sql.test.ts#pretty-prints Standard SQL with UPPER keywords and 2-space indent"
        status: pass
    human_judgment: true
    rationale: "Live textarea useMemo and Copy UX have no jsdom/tsx tests; verifier should open /tools/sql-formatter/ and /zh/tools/sql-formatter/"
  - id: D2
    description: "Native select lists Standard SQL, PostgreSQL, MySQL, SQLite, T-SQL, BigQuery; lib uses named dialect objects including transactsql"
    requirement: SQL-02
    verification:
      - kind: unit
        ref: "src/lib/sql.test.ts#smokes named dialects"
        status: pass
      - kind: unit
        ref: "src/lib/sql.test.ts#uses formatDialect and transactsql without a language field"
        status: pass
    human_judgment: false
  - id: D3
    description: "Every format call passes keywordCase upper and tabWidth 2"
    requirement: SQL-03
    verification:
      - kind: unit
        ref: "src/lib/sql.test.ts#pretty-prints Standard SQL with UPPER keywords and 2-space indent"
        status: pass
    human_judgment: false
  - id: D4
    description: "ToolShell Copy writes the formatted SQL string via existing clipboard chrome"
    requirement: SQL-04
    verification:
      - kind: unit
        ref: "src/lib/sql.test.ts#pretty-prints Standard SQL with UPPER keywords and 2-space indent"
        status: pass
    human_judgment: true
    rationale: "Copy is ToolShell navigator.clipboard; no new ToolShell test; verifier should click Copy on a formatted result"
  - id: D5
    description: "Garbage and unclosed-quote SQL return Invalid SQL; empty/whitespace is idle; incomplete SELECT * FROM still formats"
    requirement: SQL-05
    verification:
      - kind: unit
        ref: "src/lib/sql.test.ts#returns Invalid SQL for garbage input"
        status: pass
      - kind: unit
        ref: "src/lib/sql.test.ts#returns Invalid SQL for an unclosed quote"
        status: pass
      - kind: unit
        ref: "src/lib/sql.test.ts#returns empty error for empty input"
        status: pass
      - kind: unit
        ref: "src/lib/sql.test.ts#formats incomplete SELECT * FROM because the formatter is not a linter"
        status: pass
    human_judgment: false
  - id: D6
    description: "EN and ZH FAQ state the tool is not an executor and dialect is not autodetection"
    requirement: SQL-06
    verification:
      - kind: unit
        ref: "src/lib/sql.test.ts#locks EN and ZH FAQ statements"
        status: pass
    human_judgment: false
  - id: D7
    description: "Catalog slug sql-formatter Format featured false; TOOLS length 15; featured stays 6"
    requirement: SQL-01
    verification:
      - kind: unit
        ref: "src/data/tools.test.ts#has exactly 15 tools"
        status: pass
      - kind: unit
        ref: "src/data/tools.test.ts#features exactly six tools including json-formatter and jwt-decoder"
        status: pass
    human_judgment: false
  - id: D8
    description: "After astro build, JsonFormatter chunk does not contain nearley or formatDialect; only sql.ts imports sql-formatter"
    verification:
      - kind: unit
        ref: "src/lib/sql.test.ts#imports sql-formatter only from sql.ts"
        status: pass
      - kind: other
        ref: "npm run build then node check of dist/_astro/JsonFormatter*.js for nearley/formatDialect"
        status: pass
    human_judgment: false

duration: 29min
completed: 2026-09-13
status: complete
---

# Phase 3 Plan 01: SQL Formatter Summary

**In-browser SQL pretty-print via sql-formatter@15.8.2 formatDialect, six named dialects, and EN/ZH catalog parity at TOOLS length 15**

## Performance

- **Duration:** 29 min
- **Started:** 2026-09-12T18:35:00Z
- **Completed:** 2026-09-12T19:04:23Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments

- Shipped `formatSql` wrapping named `formatDialect` plus `sql`, `postgresql`, `mysql`, `sqlite`, `transactsql`, `bigquery`; keywords UPPERCASE and two-space indent; idle empty error before the library; throws map to `Invalid SQL`
- SqlFormatter island clones WordCounter locale/`INPUT_TOO_LARGE_MSG`, HEAD HashGenerator native select, live `useMemo`; ToolIsland static branch `slug === 'sql-formatter'` with `locale={locale}`
- Catalog gained slug `sql-formatter` (Format, featured false); completeness harness green at length 15 with featured still 6; EN+ZH FAQ not-executor / not-autodetect; CAT-04 JsonFormatter chunk clean after fresh build

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: failing sql-formatter tests** - `ef399a1` (test)
2. **Task 1 GREEN: sql-formatter 8-file slice** - `ea11dbc` (feat)
3. **Task 2: Dialect smokes, Invalid SQL, ZH map, FAQ source-read** - `313c2a8` (test)
4. **Task 3: CAT-04 package isolation source-read** - `d18fa58` (test)

**Plan metadata:** pending this SUMMARY commit

## Files Created/Modified

- `src/lib/sql.ts` - Named export formatSql; formatDialect plus six dialect objects; keywordCase upper; tabWidth 2
- `src/lib/sql.test.ts` - Idle, pretty-print, throw fixtures, dialect smokes, source isolation, FAQ lock
- `src/components/tools/SqlFormatter.tsx` - Default-export island; native dialect select default sql; isTooLarge then formatSql
- `src/components/tools/ToolIsland.astro` - Static SqlFormatter import and slug === 'sql-formatter' with locale={locale}
- `src/data/tools.ts` - Append-only sql-formatter row; existing ten relatedSlugs untouched
- `src/data/tools.test.ts` - Snapshot toHaveLength 15; featured length 6 unchanged
- `src/i18n/ui.ts` - EN+ZH tools['sql-formatter'] chrome keys name, shortDescription, sql, dialect
- `src/i18n/errors.ts` - ZH_ERRORS Invalid SQL to 无效的 SQL; Phase 2 keys kept
- `src/i18n/errors.test.ts` - sql-formatter describe for mapping and shared chrome keys
- `src/content/tools/sql-formatter.md` - locale en, howTo 3, faq 3
- `src/content/tools/zh/sql-formatter.md` - locale zh, howTo 3, faq 3
- `package.json` / `package-lock.json` - Direct dependency sql-formatter@15.8.2

## Decisions Made

- Official sql-formatter@15.8.2; never format() plus string language; T-SQL import is transactsql
- Always pass keywordCase upper (package default is preserve) and tabWidth 2
- Empty/whitespace returns `{ ok: false, error: '' }` before the library
- Related slugs json-formatter, regex-tester, base64; do not rewrite existing ten relatedSlugs
- Clone WordCounter + HEAD HashGenerator select + JsonFormatter live memo; do not introduce useToolUi
- No src/lib barrel; only sql.ts imports the npm package

## TDD Gate Compliance

Plan type is `execute` with per-task `tdd="true"` on tasks 1–2.

- **RED:** `ef399a1` — formatSql idle/pretty-print and catalog length 15 failed on assertion (stub returned ok true empty formatted; TOOLS length 14)
- **GREEN:** `ea11dbc` — formatSql + 8-file slice; `npm test` 111 passed
- **EXPAND:** `313c2a8` dialect/throw/FAQ tests; `d18fa58` isolation test
- No INVALID_RED: target tests failed on expected assertions, not fixture/load errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Isolation specifier matched catalog slug**
- **Found during:** Task 3 (CAT-04 source isolation)
- **Issue:** `SqlFormatter.tsx` contains `copy.tools['sql-formatter']`, so `not.toContain('sql-formatter')` failed even though the island does not import the npm package
- **Fix:** Assert the package specifier `from 'sql-formatter'` in sql.ts and `not.toMatch(/from ['"]sql-formatter['"]/)` in the other four files
- **Files modified:** src/lib/sql.test.ts
- **Verification:** npm test 120 passed
- **Committed in:** d18fa58 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Isolation still proves only sql.ts imports the package. No scope creep.

## Issues Encountered

Isolation test first used a raw `sql-formatter` substring, which collided with the catalog slug in the island. Narrowed to the import specifier.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None — no new API routes, auth paths, or schema trust boundaries. T-03-01 (ToolShell text output), T-03-02 (isTooLarge before formatSql), T-03-03 (format only, FAQ not an executor), T-03-04 (typed DIALECTS map), T-03-06 (empty catch to Invalid SQL), and T-03-SC (sql-formatter@15.8.2 only) are in the lib and island.

## User Setup Required

None - no external service configuration required.

## Verification

`npm test` after each task: 20 files, 120 tests passed (final run). Completeness: TOOLS length 15, featured 6, ToolIsland slug-equals, EN+ZH existsSync. Fresh `npm run build`; `dist/_astro/JsonFormatter.DGQoUZOb.js` contains neither `nearley` nor `formatDialect`. sql.ts contains formatDialect and transactsql and does not contain a language field. No Playwright.

## Next Phase Readiness

SQL formatter shipped at 8-file parity. Catalog snapshot is 15; featured stays 6. Ready for later phases that consume the additive catalog contract. Human UAT still needed for live paste/Copy on `/tools/sql-formatter/` and `/zh/tools/sql-formatter/`.

---
*Phase: 03-sql-formatter*
*Completed: 2026-09-13*

## Self-Check: PASSED
