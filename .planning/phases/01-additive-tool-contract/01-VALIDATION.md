---
phase: "01"
slug: "additive-tool-contract"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-11"
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^5 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | CAT-01 | — | N/A | unit | `npm test` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | CAT-02 | — | N/A | unit | `npm test` | ✅ | ⬜ pending |
| 01-01-03 | 01 | 1 | CAT-03 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | CAT-04 | — | No `src/lib/index.ts` barrel | unit / file | `npm test` | ✅ | ⬜ pending |
| 01-01-05 | 01 | 1 | CAT-05 | — | Existing ten tools untouched | unit | `npm test` | ✅ | ⬜ pending |
| 01-01-06 | 01 | 1 | CAT-06 | — | 8-file checklist documented | file | `npm test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/tools/ToolIsland.test.ts` — source-read coverage for CAT-03 (new file)
- Existing `src/data/tools.test.ts` covers CAT-01 featured/unique/length; extend for CAT-02 markdown exists and grouping `TOOLS.length`

*Existing infrastructure covers catalog tests; Wave 0 is the new ToolIsland source-read test file.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visitor can still use all ten existing tools on EN and `/zh/` | CAT-05 | No Playwright this phase | Spot-check that `git diff` product paths are empty besides tests + CONVENTIONS.md |

All catalog/island contract behaviors have automated verification.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
