---
phase: "02"
slug: "light-text-and-generate-tools"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-11"
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^5.0.0 |
| **Config file** | `vitest.config.ts` (`include: ['src/**/*.test.ts']`, `environment: 'node'`) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

No coverage script. No jsdom. Do not add `.tsx` tests. Phase gate also runs `npm run build` so content collections Zod-parse the four EN/ZH markdown files.

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green (`npm test` + `npm run build`)
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | COUNT-01 | T-02-03 | `isTooLarge` before lib | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | COUNT-02 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | COUNT-03 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | COUNT-04 | T-02-03 | Size guard in island | unit / file | `npm test` | ✅ | ⬜ pending |
| 02-02-01 | 02 | 2 | CASE-01 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | CASE-02 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 2 | CASE-03 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 2 | CASE-04 | T-02-04 | No `innerHTML`; text rows | unit / file | `npm test` | ✅ | ⬜ pending |
| 02-03-01 | 03 | 3 | LORM-01 | T-02-05 | No `fetch` in lorem lib | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 3 | LORM-02 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-03-03 | 03 | 3 | LORM-03 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-03-04 | 03 | 3 | LORM-04 | — | N/A | unit | `npm test` | ✅ | ⬜ pending |
| 02-03-05 | 03 | 3 | LORM-05 | T-02-05 | Latin body only; no network | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 4 | PASS-01 | T-02-03 | Length 8–128 bounds | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-04-02 | 04 | 4 | PASS-02 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-04-03 | 04 | 4 | PASS-03 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-04-04 | 04 | 4 | PASS-04 | T-02-01 T-02-02 | `getRandomValues` + rejection sampling; no `Math.random` | unit | `npm test` | ❌ W0 | ⬜ pending |
| 02-04-05 | 04 | 4 | PASS-05 | — | N/A | unit / file | `npm test` | ✅ | ⬜ pending |
| 02-04-06 | 04 | 4 | PASS-06 | T-02-06 | Empty charset error, not empty success | unit | `npm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

Task IDs are placeholders until the planner assigns real IDs. Wave 0 files land in the same slice as the matching lib.

---

## Wave 0 Requirements

- [ ] `src/lib/counter.test.ts` — COUNT-01..03 (new file)
- [ ] `src/lib/cases.test.ts` — CASE-01..03 (new file)
- [ ] `src/lib/lorem.test.ts` — LORM-01..03, LORM-05 (new file; source-read: no `fetch`)
- [ ] `src/lib/password.test.ts` — PASS-01..04, PASS-06 (new file; source-read: `getRandomValues` present, `Math.random` absent)
- [ ] `src/data/tools.test.ts` — bump `toHaveLength` per slice (file exists)
- Existing `src/components/tools/ToolIsland.test.ts` covers CAT-03 as catalog grows
- Existing EN+ZH `existsSync` loop covers CAT-02 as markdown lands

*Framework install: none. Vitest already configured.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Counts update live as the user types | COUNT-04 | No jsdom / no `*.test.tsx` | Open `/tools/word-counter/`; type; tiles update. Size-guard via `isTooLarge` in island (same as JsonFormatter). |
| Copy each case-converter output row | CASE-04 | Clipboard in island | Open `/tools/case-converter/`; paste text; copy one row. |
| Copy lorem result | LORM-04 | ToolShell copy already proven | Open `/tools/lorem-ipsum/`; generate; Copy. |
| Copy and regenerate password | PASS-05 | Button in island | Open `/tools/password-generator/`; Generate; Copy; Generate again. |

Island chrome matches existing ten tools (untested islands). Do not add Playwright this phase.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
