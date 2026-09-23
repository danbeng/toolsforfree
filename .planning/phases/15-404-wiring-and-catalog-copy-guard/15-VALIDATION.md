---
phase: "15"
slug: "404-wiring-and-catalog-copy-guard"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-23"
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 5 (`npm test` → `vitest run`) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run build` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | GUARD-01, GUARD-02, GUARD-03 | — | 404 does not advertise `/zh/404/`; document is noindex | build grep | `npm run build` then search `dist` for `zh/404` (must be empty) and confirm `noindex` on `dist/404.html` | ✅ | ⬜ pending |
| 15-01-02 | 01 | 1 | GUARD-04, GUARD-05 | — | Missing `copy.tools[slug]` does not throw; fallback is catalog name | unit | `npm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] A colocated test (or a small node assertion the plan names) that a missing `copy.tools` key falls back to `tool.name` / `tool.shortDescription` and does not throw. Vitest already exists. Do not add a package.

*Existing `npm test` covers the rest of the suite. Do not use `vitest -x` (unsupported on Vitest 5).*

---

## Manual-Only Verifications

All phase behaviors have automated verification. Visual spot-check of the 404 page is optional, not a gate.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
