---
phase: "12"
slug: "pages-langswitch"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-20"
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.x |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/i18n src/data/tools.test.ts src/components/tools/ToolIsland.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick command plus file `rg` on touched files
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 40 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | PAGE-01 | T-12-01 | LangSwitch hrefs never start with `//` | unit + rg | `npx vitest run src/i18n` | ✅ | ⬜ pending |
| 12-01-02 | 01 | 1 | PAGE-05 | — | N/A | rg | `rg "htmlLang" src/layouts/BaseLayout.astro` | ✅ | ⬜ pending |
| 12-01-03 | 01 | 2 | PAGE-03 | — | N/A | rg | `rg "heading=" src/pages/zh/tools/[slug].astro src/pages/tools/[slug].astro` must be empty | ✅ | ⬜ pending |
| 12-01-04 | 01 | 2 | PAGE-04 | — | N/A | unit | `npx vitest run src/data/tools.test.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Optional `src/i18n/pages-land.test.ts` — file-read asserts LangSwitch in Header, no `heading=` on slug pages, `.lang-switch` in `global.css`

Existing Vitest covers kernel + catalog completeness.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Isolated `astro build` if overlay still breaks | PAGE-03 | Dirty ToolShell/islands can fail SSG | Isolate overlay; rg `lang-switch` in `dist/**/*.html`; full overlay-free build is Phase 14 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 40s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
