---
phase: "03"
slug: "sql-formatter"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-09-13"
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^5.0.0 |
| **Config file** | `vitest.config.ts` (`include: ['src/**/*.test.ts']`, `environment: 'node'`) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Phase gate** | `npm test` then `npm run build` then CAT-04 JsonFormatter-chunk grep |
| **Estimated runtime** | ~5 seconds for tests; build is extra for task 3 |

No coverage script. No Playwright. Do not add `.tsx` tests except if an existing analog already tests islands in `.ts`. Phase gate also runs `npm run build` so content collections Zod-parse EN/ZH markdown and CAT-04 can read `dist/_astro/JsonFormatter*.js`.

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green (`npm test` + `npm run build` + CAT-04 grep)
- **Max feedback latency:** 15 seconds for `npm test`; build is slower and only required on task 3

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | SQL-01 | T-03-02 | `isTooLarge` before `formatSql` | unit | `npm test` | ❌ W0 | ⬜ pending |
| 03-01-01 | 01 | 1 | SQL-02 | T-03-04 | Named `formatDialect` + six dialect objects; no `language:` | unit | `npm test` | ❌ W0 | ⬜ pending |
| 03-01-01 | 01 | 1 | SQL-03 | — | `keywordCase: 'upper'`, `tabWidth: 2` | unit | `npm test` | ❌ W0 | ⬜ pending |
| 03-01-01 | 01 | 1 | SQL-04 | T-03-01 | Formatted string is ToolShell output (text, not HTML) | unit / file | `npm test` | ✅ | ⬜ pending |
| 03-01-01 | 01 | 1 | CAT-01 | — | TOOLS length 15, featured 6, slug unique | unit | `npm test` | ✅ | ⬜ pending |
| 03-01-02 | 01 | 1 | SQL-05 | T-03-06 | Throw → `'Invalid SQL'`; idle empty error; never dump parser | unit | `npm test` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | SQL-06 | T-03-03 | EN+ZH FAQ: not executor; dialect not autodetection | unit | `npm test` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | CAT-06 | T-03-06 | `ZH_ERRORS['Invalid SQL']` = `无效的 SQL` | unit | `npm test` | ✅ | ⬜ pending |
| 03-01-03 | 01 | 1 | CAT-04 | T-03-SC | Only `src/lib/sql.ts` imports `sql-formatter`; JsonFormatter chunk has no `nearley` / `formatDialect` | unit + build smoke | `npm test && npm run build && node … CAT-04` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/sql.test.ts` — SQL-01, SQL-02, SQL-03, SQL-05, CAT-04 source isolation
- [ ] `src/i18n/errors.test.ts` — `'Invalid SQL'` mapping (do not drop Phase 2 describes)
- [ ] `src/data/tools.test.ts` — bump `toHaveLength(14)` → `15`
- [ ] EN/ZH markdown so completeness `existsSync` passes
- [ ] Framework install: `npm install sql-formatter@15.8.2`
- [ ] Post-build CAT-04 grep of `dist/_astro/JsonFormatter*.js` (fails on missing chunk or leak)
- Existing `src/components/tools/ToolIsland.test.ts` covers CAT-03 as catalog grows
- Existing EN+ZH `existsSync` loop covers CAT-02 as markdown lands

*Framework install: `sql-formatter@15.8.2` only. Vitest already configured.*
