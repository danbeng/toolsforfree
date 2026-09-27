---
phase: "11"
slug: "i18n-kernel"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-20"
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.x |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/i18n` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/i18n`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | KERN-01 | — | N/A | unit | `npx vitest run src/i18n/locales.test.ts` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 1 | KERN-02 | T-11-01 | Path helpers never emit `//` protocol-relative URLs | unit | `npx vitest run src/i18n/path.test.ts` | ❌ W0 | ⬜ pending |
| 11-01-03 | 01 | 2 | KERN-04 | — | N/A | unit + rg | `npx vitest run src/i18n` | ✅ | ⬜ pending |
| 11-01-04 | 01 | 2 | KERN-03 | — | `err('')`/`err(null)` return `null` | unit | `npx vitest run src/i18n/useToolUi.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/i18n/locales.test.ts` — stubs for KERN-01
- [ ] `src/i18n/path.test.ts` — stubs for KERN-02
- [ ] `src/i18n/useToolUi.test.ts` — stubs for KERN-03

Existing `src/i18n/errors.test.ts` and `vitest.config.ts` cover the rest. No new framework.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
