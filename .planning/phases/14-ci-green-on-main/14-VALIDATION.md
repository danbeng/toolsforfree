---
phase: "14"
slug: "ci-green-on-main"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-22"
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.x + Astro build |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run build` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** `npm test` if source touched; workflow file is YAML
- **After every plan wave:** `npm test` then `npm run build`
- **Before `/gsd-verify-work`:** Both must be green; `src/lib/crontab.ts` still unstaged
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 14-01-01 | 01 | 1 | CI-01 | — | N/A | rg | `rg "node-version: 22" .github/workflows/ci.yml` | ❌ W0 | ⬜ pending |
| 14-01-02 | 01 | 1 | CI-02 | T-14-01 | crontab.ts stays unstaged | build | `npm test && npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None. Workflow file is created by the plan. Proof commands already exist.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Remote Actions run | CI-01 | No GitHub remote | File only. Do not `gh repo create`. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] No watch-mode flags
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
