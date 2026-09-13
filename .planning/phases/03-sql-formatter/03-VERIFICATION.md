---
phase: 03-sql-formatter
verified: 2026-09-13T03:35:00Z
status: passed
score: 7/8 must-haves verified
covered_files:
  - .planning/REQUIREMENTS.md
  - .planning/phases/03-sql-formatter/03-01-PLAN.md
  - .planning/phases/03-sql-formatter/03-01-SUMMARY.md
  - package-lock.json
  - package.json
  - src/components/tools/SqlFormatter.tsx
  - src/components/tools/ToolIsland.astro
  - src/content/tools/sql-formatter.md
  - src/content/tools/zh/sql-formatter.md
  - src/data/tools.test.ts
  - src/data/tools.ts
  - src/i18n/errors.test.ts
  - src/i18n/errors.ts
  - src/i18n/ui.ts
  - src/lib/sql.test.ts
  - src/lib/sql.ts
covered_digest: "v1:sha256:46e78bcd756a95779c93d34fb0a8bfd25d51a429ada6dfb47cabc8eacfc39037"
behavior_unverified: 0
overrides_applied: 0
decision_coverage:
  honored: 0
  total: 0
  not_honored: []
  reason: could-not-parse
human_verification:
  - test: "打开 /tools/sql-formatter/ 与 /zh/tools/sql-formatter/，粘贴 select * from t; 再切换方言；点 Copy；再粘贴垃圾输入 not sql at all !!!"
    expected: "输出为 UPPERCASE 关键字与 2 空格缩进；切换方言立即重排；Copy 写入格式化后的 SQL；垃圾输入 EN 显示 Invalid SQL、ZH 显示 无效的 SQL；首页 featured 仍为 6"
    why_human: "PLAN 将 live textarea/useMemo 与 ToolShell clipboard 标为 human_judgment；无 jsdom/tsx 岛屿测试，grep 看不到浏览器里实际粘贴与复制"
  - test: "在不含无关脏改动的工作树上执行 npm run build，再检查 dist/_astro/JsonFormatter*.js 是否包含 nearley 或 formatDialect"
    expected: "存在至少一个 JsonFormatter*.js chunk，且其中不含 nearley / formatDialect"
    why_human: "本核验工作树 astro build 因 src/pages/index.astro 引用缺失的 ../i18n/path 失败（非本阶段文件）；无法在此复现 CAT-04 的 dist grep。源码隔离已由单元测试证明，chunk 级证据需干净构建"
---

# Phase 3: SQL formatter Verification Report

**Phase Goal:** Visitors can pretty-print SQL in the browser with an explicit dialect, without executing it
**Verified:** 2026-09-13T03:35:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

**MVP note:** ROADMAP.md `mode: mvp`，但 ROADMAP 阶段目标不是标准 User Story（`user-story.validate` → false）。未中止核验：User Flow 使用 PLAN 目标（`valid: true`，role=visitor using Devtoolbox）。与 Phase 2 初验处理一致。

## User Flow Coverage

User story: As a visitor using Devtoolbox, I want to paste SQL and choose an explicit dialect to pretty-print it in the browser, so that I get copyable UPPERCASE-keyword SQL without executing the query or uploading anything.

| Step | Expected | Evidence | Status |
|------|----------|----------|--------|
| Open EN/ZH page | `/tools/sql-formatter/` 与 `/zh/tools/sql-formatter/` 由 `TOOLS` SSG，island 收 `locale={locale}` | `src/pages/tools/[slug].astro` / `src/pages/zh/tools/[slug].astro` `getStaticPaths` 来自 `TOOLS`；`ToolIsland.astro` `slug === 'sql-formatter'` + `client:load locale={locale}` | ✓ |
| Paste SQL | 边输入边看到 pretty-print，关键字 UPPERCASE，2 空格缩进 | `SqlFormatter.tsx` `onInput` → `useMemo` → `formatSql`；`sql.ts` `keywordCase: 'upper'`, `tabWidth: 2`；命名测试 + `node` 调用得到 `SELECT\n  *\nFROM\n  tbl` | ✓ |
| Choose dialect | 原生 select：Standard SQL / PostgreSQL / MySQL / SQLite / T-SQL / BigQuery；默认 sql；切换立即重排 | `DIALECT_OPTIONS` + `useState('sql')`；`formatDialect` + 六个命名方言对象（含 `transactsql`）；无 `language:` | ✓ |
| Copy | Copy 写入格式化后的 SQL 字符串 | `ToolShell` `navigator.clipboard.writeText(props.output)`（HEAD，本阶段未改 ToolShell）；island 把 `r.formatted` 传给 `output` | ✓ |
| Invalid / idle | 垃圾或未闭合引号报错，不静默半格式化；空输入 idle | `formatSql('not sql at all !!!')` → `{ ok: false, error: 'Invalid SQL' }`；ZH_ERRORS `无效的 SQL`；空/空白 `{ ok: false, error: '' }` | ✓ |
| Outcome | 得到可复制的 UPPERCASE SQL，不执行、不上传 | 无 API / fetch / sql.js；FAQ EN/ZH 锁定 not-executor 与 not-autodetect | ✓ |

Outcome 条款在代码里可观察为真；浏览器走查仍需人工（见 Human Verification）。

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | User can paste SQL on `sql-formatter` and see pretty-printed output as they type, with keywords UPPERCASE and 2-space indent by default (SQL-01, SQL-03 / ROADMAP SC1) | ✓ VERIFIED | `formatSql('select * from tbl where id = 1','sql')` → `SELECT\n  *\nFROM\n  tbl\nWHERE\n  id = 1`。命名测试 `pretty-prints Standard SQL with UPPER keywords and 2-space indent` 通过。Island：`isTooLarge` 后 `formatSql`，`useMemo` deps `[input, dialect, locale]`，`onInput` 写 `input`。 |
| 2 | User can choose dialect from Standard, PostgreSQL, MySQL, SQLite, T-SQL, and BigQuery (named `formatDialect` imports, not autodetection) (SQL-02 / ROADMAP SC2) | ✓ VERIFIED | `sql.ts` 从 `'sql-formatter'` 导入 `formatDialect` + `sql, postgresql, mysql, sqlite, transactsql, bigquery`；`DIALECTS[dialect]`；源码无 `\blanguage\s*:`。Select 六项，T-SQL value=`transactsql`，默认 `'sql'`。方言 smoke 测试通过。 |
| 3 | User can copy formatted SQL; invalid SQL shows an error instead of silently mangling the input (SQL-04, SQL-05 / ROADMAP SC3) | ✓ VERIFIED | Copy：HEAD `ToolShell` `writeText(props.output)`；island `output: r.ok ? r.formatted : ''`。Invalid：垃圾/未闭合引号 → `'Invalid SQL'`；`SELECT * FROM` 仍 `ok: true`（非 linter）；`ZH_ERRORS['Invalid SQL'] === '无效的 SQL'`。空 catch，不把 `e.message` 渲到 UI。 |
| 4 | FAQ states the tool is not an executor and dialect is not autodetection; EN+ZH catalog pages exist (SQL-06 / ROADMAP SC4 前半) | ✓ VERIFIED | EN faq：`does not execute queries` + `Dialect is not autodetection`。ZH faq：`不是执行器` + `方言不是自动检测`。howTo 各 3 条，faq 各 3 条。`sql.test.ts#locks EN and ZH FAQ statements` 通过。`existsSync` 完整性循环覆盖该 slug。 |
| 5 | Catalog slug `sql-formatter`, category Format, `featured: false`; `TOOLS` length 15; `getFeaturedTools` stays 6; relatedSlugs `json-formatter`, `regex-tester`, `base64`; existing ten relatedSlugs unchanged (CAT-01, CAT-05) | ✓ VERIFIED | `node`：`TOOLS.length === 15`，featured 6（json-formatter, jwt-decoder, hash-generator, regex-tester, unix-timestamp, crontab-explainer）。sql-formatter `featured: false`, `category: 'Format'`。`tools.test.ts` `toHaveLength(15)` 与 featured 6 通过。前十 `relatedSlugs` 与 `git show HEAD` 一致。 |
| 6 | After astro build, `dist/_astro/JsonFormatter*.js` does not contain SQL parser identifiers; only `src/lib/sql.ts` imports the sql-formatter package (CAT-04 / ROADMAP SC4 后半) | ? UNCERTAIN | 源码隔离已证：仅 `sql.ts` 含 `from 'sql-formatter'`；`SqlFormatter.tsx` / `ToolIsland.astro` / `json.ts` / `JsonFormatter.tsx` 无该 specifier；`sql.test.ts#imports sql-formatter only from sql.ts` 通过；无 `src/lib/index.ts` barrel。**dist 级证据未能复现：** 本工作树 `npm run build` 在 `src/pages/index.astro` 无法解析 `../i18n/path` 处失败（该文件不在本阶段 `files_modified`）；`dist/_astro` 不存在。SUMMARY 声称执行时 chunk 干净，核验不采信 SUMMARY。 |
| 7 | Garbage or unclosed-quote SQL returns `{ ok: false, error: 'Invalid SQL' }` mapped in ZH_ERRORS to `无效的 SQL`; empty/whitespace is idle `{ ok: false, error: '' }` before the library runs (SQL-05 细节) | ✓ VERIFIED | 与 #3 同源。`formatSql('', 'sql')` 与 `'   '` 在 `trim` 后提前返回，不调用 `formatDialect`。`errors.test.ts` sql-formatter describe 通过。 |
| 8 | Native select lists the six dialects; default Standard (sql) each load; changing dialect reformats immediately; T-SQL import is `transactsql` (SQL-02 细节) | ✓ VERIFIED | 与 #2 同源。`useState<SqlDialect>('sql')` 无 localStorage（CONTEXT deferred）。`useMemo` 含 `dialect`。 |

**Score:** 7/8 truths verified (0 present, behavior-unverified; 1 uncertain — CAT-04 dist grep)

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/lib/sql.ts` | formatSql + SqlDialect/SqlResult；薄封装 named dialect objects | ✓ VERIFIED | 存在、实质、被 island 导入。`formatDialect(..., { dialect: DIALECTS[dialect], keywordCase: 'upper', tabWidth: 2 })`。空 catch → `'Invalid SQL'`。 |
| `src/lib/sql.test.ts` | idle / pretty-print / throw / dialect smokes / isolation | ✓ VERIFIED | 9 个 it，无 skip。命名 pretty-print 测试本轮通过。 |
| `src/components/tools/SqlFormatter.tsx` | default-export island；native select；isTooLarge；live useMemo；ToolShell | ✓ VERIFIED | 导入 `formatSql` from `../../lib/sql`，不导入 npm 包。`class` 而非 `className`。不把 locale 传给 ToolShell（匹配 HEAD ToolShell，无 locale prop）。 |
| `src/components/tools/ToolIsland.astro` | static SqlFormatter import + slug 分支 + locale | ✓ VERIFIED | `import SqlFormatter from './SqlFormatter'`；`slug === 'sql-formatter' && <SqlFormatter client:load locale={locale} />`。 |
| `src/data/tools.ts` | sql-formatter 行 featured false category Format | ✓ VERIFIED | 第 15 条。relatedSlugs 三元组正确。 |
| `src/data/tools.test.ts` | toHaveLength 15；featured 仍 6 | ✓ VERIFIED | 断言已改 15；featured 6 未改。 |
| `src/i18n/ui.ts` | en/zh tools['sql-formatter'] name shortDescription sql dialect | ✓ VERIFIED | EN+ZH 四键齐全；Phase 2 四工具键保留。 |
| `src/i18n/errors.ts` | ZH_ERRORS Invalid SQL → 无效的 SQL | ✓ VERIFIED | 同片追加；Phase 2 键保留。 |
| `src/content/tools/sql-formatter.md` | locale en howTo 3 faq 含 not-executor / not-autodetect | ✓ VERIFIED | Zod tuple 3 / faq 3。 |
| `src/content/tools/zh/sql-formatter.md` | locale zh；不是执行器 / 方言不是自动检测 | ✓ VERIFIED | 同上。 |
| `package.json` | 直接依赖 sql-formatter 15.8.2 | ✓ VERIFIED | `"sql-formatter": "^15.8.2"`；`node_modules/sql-formatter` version `15.8.2`。无 `@types/sql-formatter`。 |

`gsd_run query verify.artifacts`：11/11 passed。

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `SqlFormatter.tsx` | `src/lib/sql.ts` | formatSql after isTooLarge | ✓ WIRED | `if (isTooLarge(input))` 先返回；否则 `formatSql(input, dialect)` |
| `src/lib/sql.ts` | sql-formatter | named formatDialect + six dialect objects | ✓ WIRED | 包根 named import；无 `format()` + language |
| `SqlFormatter.tsx` | `src/lib/limits.ts` | isTooLarge(input) before formatSql | ✓ WIRED | 同文件 `INPUT_TOO_LARGE_MSG` |
| `ToolIsland.astro` | `SqlFormatter.tsx` | static import + slug === 'sql-formatter' client:load | ✓ WIRED | 第 16、35 行 |
| `tools.test.ts` | `tools.ts` | expect(TOOLS).toHaveLength(15) | ✓ WIRED | 快照已升 15 |
| `errors.ts` | formatSql errors | ZH_ERRORS same-slice key | ✓ WIRED | `'Invalid SQL': '无效的 SQL'` |

`gsd_run query verify.key-links`：6/6 verified。

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `SqlFormatter.tsx` | `result.output` | `formatSql` → sql-formatter `formatDialect` | 是（node 调用得到真实 pretty-print，非空字面量） | ✓ FLOWING |
| `SqlFormatter.tsx` | `result.error` | idle `''` / `'Invalid SQL'` / `INPUT_TOO_LARGE_MSG`，经 `localizeError` | 是（库 throw 映射，非硬编码空数组） | ✓ FLOWING |
| `SqlFormatter.tsx` | `input` / `dialect` | textarea `onInput` / select `onChange` | 用户输入，无静态 fallback | ✓ FLOWING |
| `ToolShell` output | `props.output` | island 传入 `r.formatted` | Copy 与 `<pre><code>` 同源 | ✓ FLOWING |

无 API、无 DB、无 hollow prop。计算在浏览器内。

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| 全量测试 | `npm test` | Test Files 20 passed；Tests 120 passed | ✓ PASS |
| 命名 pretty-print | `npx vitest run src/lib/sql.test.ts -t "pretty-prints Standard SQL..."` | 1 passed / 8 skipped | ✓ PASS |
| formatSql 实调 | `node --input-type=module` import `./src/lib/sql.ts` | `SELECT\n  *\nFROM\n  tbl\nWHERE\n  id = 1`；garbage Invalid SQL；idle empty error | ✓ PASS |
| catalog 15 / featured 6 | node import `tools.ts` | len 15；featured 6；sql-formatter featured false Format | ✓ PASS |
| formatDialect、无 language: | 读 `src/lib/sql.ts` | 有 `formatDialect`；无 `language:` | ✓ PASS |
| CAT-04 dist grep | `npm run build` + JsonFormatter chunk | 构建失败：`Could not resolve '../i18n/path' in src/pages/index.astro`；无 `dist/_astro` | ? SKIP |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | 本阶段无 `scripts/*/tests/probe-*.sh`，PLAN 未声明 probe | SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| SQL-01 | 03-01-PLAN.md | paste SQL，边输入边 pretty-print | ✓ SATISFIED | formatSql + useMemo island；命名测试通过 |
| SQL-02 | 03-01-PLAN.md | 六方言 named formatDialect，非 autodetection | ✓ SATISFIED | 六个 named objects；select；无 language 字段 |
| SQL-03 | 03-01-PLAN.md | 关键字 UPPERCASE，缩进 2 空格 | ✓ SATISFIED | 每次调用都传 keywordCase upper + tabWidth 2 |
| SQL-04 | 03-01-PLAN.md | 可复制格式化 SQL | ✓ SATISFIED | ToolShell clipboard + formatted output；UX 待人工点 Copy |
| SQL-05 | 03-01-PLAN.md | 非法 SQL 报错而非静默半格式化 | ✓ SATISFIED | throw → Invalid SQL；idle 空错误；非 linter |
| SQL-06 | 03-01-PLAN.md | FAQ 不是执行器、方言不是自动检测 | ✓ SATISFIED | EN+ZH markdown + 源码锁定测试 |
| CAT-01 | 03-01-PLAN.md（附加） | TOOLS 注册 slug/category/relatedSlugs/featured false | ✓ SATISFIED | tools.ts 第 15 行 |
| CAT-04 | 03-01-PLAN.md（附加） | 重库只在本工具页；json-formatter 不继承 SQL chunk | ? NEEDS HUMAN | 源码隔离绿；dist grep 因无关脏树未能复跑 |
| CAT-05 | 03-01-PLAN.md（附加） | 既有十工具 relatedSlugs 不改 | ✓ SATISFIED | 与 HEAD 前十 relatedSlugs 字节级一致 |
| CAT-06 | 03-01-PLAN.md（附加） | live compute、copy、isTooLarge、EN+ZH、ZH_ERRORS 同片 | ✓ SATISFIED | island + errors.ts |

REQUIREMENTS.md 映射到 Phase 3 的 ID：SQL-01..SQL-06，全部被 PLAN `requirements:` 声明。无 orphaned Phase 3 需求。CAT-* 由 Phase 1 完成契约，本阶段作为切片约束再次满足（CAT-04 dist 待干净构建确认）。

v2 SQL-07/SQL-08（keyword case / indent knobs）明确不在本阶段，不记为 gap。

### Decision Coverage

Decision coverage verify (warning): could not parse decisions — possible format mismatch. Check the formatting of the CONTEXT.md decisions block.

CONTEXT.md `<decisions>` 人工核对（非阻塞）：默认 Standard sql、六方言 native select、live useMemo、formatDialect 而非 format()+language、Invalid SQL throw-catch、idle 空错误、UPPER + tabWidth 2、官方 sql-formatter、FAQ not-executor/not-autodetect、仅 sql.ts 导入重包、catalog featured false 14→15、不改既有十 relatedSlugs — 均在 shipped artifacts 中。解析失败不影响 Step 9。

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `src/lib/sql.test.ts` | SQL-01..06, CAT-04 | 9 | 0 | no | Value / behavioral（pretty-print 含 SELECT/`\n  *`；throw fixtures 精确 toEqual） | OK |
| `src/data/tools.test.ts` | CAT-01, CAT-05 | 7 | 0 | no | Value（length 15 / featured 6 / existsSync） | OK |
| `src/i18n/errors.test.ts` | CAT-06, SQL-05 | sql-formatter describe 2 | 0 | no | Value（ZH map + chrome keys） | OK |
| `src/components/tools/ToolIsland.test.ts` | CAT-03 | 1 | 0 | no | Source-read slug === | OK |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** 1 WARNING — 方言 smoke 只断言 `.ok === true`，不断言方言特有排版；符合 PLAN “smokes” 范围，不升 BLOCKER。
**CAT-04 dist：** 不在 Vitest 内，属 build smoke；本轮未能复跑。

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | 本阶段修改文件无 TBD/FIXME/XXX；无 TODO/HACK；无 return null stub；无 fetch/sql.js/执行路径 | — | — |

工作树中 `ToolShell.tsx` 脏改动要求 `locale` prop，而本阶段 `SqlFormatter` 按 PLAN/HEAD 不传 locale。这是**无关脏文件**，不是本阶段缺口。HEAD `ToolShell` 无 locale，与 island 一致。核验以 HEAD ToolShell + 本阶段文件为准。

`npm run build` 失败根因 `src/pages/index.astro` → `../i18n/path`，不在 03-01 `files_modified`。不记为本阶段 BLOCKER。

### Human Verification Required

PLAN task 3 `<human-check>`（`workflow.human_verify_mode = end-of-phase`）已收割：

### 1. Live paste / dialect / Copy / invalid / featured

**Test:** 打开 `/tools/sql-formatter/` 与 `/zh/tools/sql-formatter/`。粘贴 `select * from t;`。切换方言。点 Copy。再粘贴 `not sql at all !!!`。看首页 featured 数量。
**Expected:** 输出 UPPERCASE 关键字、2 空格缩进；切换方言立即重排；Copy 写入格式化字符串；垃圾输入 EN=`Invalid SQL`、ZH=`无效的 SQL`；首页 featured 仍为六个。
**Why human:** 无 jsdom/tsx 测 textarea 与 clipboard；live UX grep 看不见。

### 2. CAT-04 JsonFormatter chunk on a clean tree

**Test:** 在去掉无关脏改动（至少修复或还原 `src/pages/index.astro` 对缺失 `../i18n/path` 的引用）后执行 `npm run build`，读取每个 `dist/_astro/JsonFormatter*.js`。
**Expected:** 至少一个 JsonFormatter js chunk 存在，且不含 `nearley` 或 `formatDialect`。
**Why human:** 本核验工作树无法完成 astro build；源码隔离已自动化，chunk 级证据缺一次干净构建。

### Gaps Summary

无 BLOCKER。8 条 must-have 中 7 条已在代码与 Vitest 中证实：`formatSql` 使用 `formatDialect`（无 `language:`）、六命名方言、`keywordCase upper` / `tabWidth 2`、idle/Invalid SQL、EN+ZH FAQ、目录 15 / featured 6、sql-formatter@15.8.2。

剩余人工项：(1) 浏览器走查粘贴/方言/Copy；(2) 干净树上复跑 CAT-04 dist grep。后者因工作树中非本阶段脏文件导致 `astro build` 失败，不能当作本阶段实现缺失。

---

_Verified: 2026-09-13T03:35:00Z_
_Verifier: Claude (gsd-verifier)_
