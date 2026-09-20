---
phase: "13"
slug: "islands-without-led"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-20"
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.x |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/data/tools.test.ts src/components/tools/ToolIsland.test.ts src/i18n/useToolUi.test.ts src/i18n/locales.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick command plus file `rg` on ToolShell / ToolIsland
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 40 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | ISLE-01 | T-13-01 | Committed ToolShell has no LED / tool-panel__chrome | unit + rg | `npx vitest run src/i18n/useToolUi.test.ts` | ✅ | ⬜ pending |
| 13-01-02 | 01 | 1 | ISLE-02 | — | N/A | rg | `rg "locale={locale}" src/components/tools/ToolIsland.astro` counts 18 | ✅ | ⬜ pending |
| 13-01-03 | 01 | 2 | ISLE-03 | — | N/A | unit | `npx vitest run src/i18n/useToolUi.test.ts src/data/tools.test.ts` | ✅ | ⬜ pending |
| 13-01-04 | 01 | 2 | ISLE-04 | — | N/A | unit | `npx vitest run src/data/tools.test.ts src/components/tools/ToolIsland.test.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Optional file-read asserts that ToolShell source lacks `tool-panel__chrome` and contains `locale`

Existing completeness tests cover ISLE-04.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Copy/Copied locale on a tool page | ISLE-01 | Hydrated island | Open EN and ZH json-formatter; Copy then Copied / 复制 then 已复制 |
| Overlay-free astro build | CI-02 | Phase 14 | Do not treat dirty-tree build failure as Phase 13 blocker |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 40s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
