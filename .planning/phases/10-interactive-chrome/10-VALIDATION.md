---
phase: "10"
slug: "interactive-chrome"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-18"
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest `^5.0.0` |
| **Config file** | `vitest.config.ts` (`include: ['src/**/*.test.ts']`, `environment: 'node'`, `passWithNoTests: true`) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` (`vitest run`) |
| **Estimated runtime** | ~5 seconds |

Do **not** add Playwright. Do **not** add CSS/jsdom tests. Chrome behavior is document CSS + native `<details>`; Nyquist coverage is **file assertions + build + human UAT**, matching Phase 7–9.

Do **not** edit `src/lib`, `src/data/tools.ts`, or `ToolShell.tsx` unless a class is strictly required (CONTEXT: prefer CSS).

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test` && `npm run build`
- **Before `/gsd-verify-work`:** Full suite green + file assertions + human hover/active/FAQ/contrast checklist
- **Max feedback latency:** 30 seconds (`npm test`); build ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | CHR-01 | — | N/A | smoke (file) | `rg -F -- "button:hover:not(:disabled)" src/styles/global.css`; `rg -F -- "background: var(--accent)" src/styles/global.css` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | CHR-02 | — | N/A | smoke (file) | `rg -F -- "button:active:not(:disabled)" src/styles/global.css`; `rg -F -- "color-mix" src/styles/global.css`; `rg -n "transform:" src/styles/global.css` must not appear on `.tool-panel button` | ❌ W0 | ⬜ pending |
| 10-01-03 | 01 | 1 | CHR-03 | — | N/A | smoke (file) | `rg -F -- "a:focus-visible, button:focus-visible" src/styles/global.css`; `rg -F -- ".faq summary:focus-visible" src/styles/global.css` | ❌ W0 | ⬜ pending |
| 10-01-04 | 01 | 1 | CHR-04 | — | N/A | smoke (file) | `rg -F -- "box-shadow: 0 1px 2px var(--border)" src/styles/global.css`; `rg -F -- "padding: var(--sp-4)" src/styles/global.css`; `rg -F -- "border-radius: 8px" src/styles/global.css` | ❌ W0 | ⬜ pending |
| 10-01-05 | 01 | 1 | CHR-05 | — | N/A | smoke (file) | `rg -n "<details>" src/components/FaqList.astro`; `rg -n "<summary>" src/components/FaqList.astro`; `rg -n "<dl>" src/components/FaqList.astro` must print no matches | ❌ W0 | ⬜ pending |
| 10-01-06 | 01 | 1 | CHR-06 | — | N/A | smoke (file) | `rg -F -- "summary::marker" src/styles/global.css`; `rg -n "list-style: none" src/styles/global.css` must not target `.faq summary`; `rg -n "webkit-details-marker" src/styles/global.css` must print no matches | ❌ W0 | ⬜ pending |
| 10-01-07 | 01 | 1 | overlay | T-10-01 | Path-limited add; no zh / LangSwitch / ToolShell unless required | smoke (git) | `git diff --cached --name-only` must not list `src/pages/zh/` or `LangSwitch.astro` | ❌ W0 | ⬜ pending |
| 10-01-08 | 01 | 1 | regression | — | N/A | unit | `npm test` | ✅ | ⬜ pending |
| 10-01-09 | 01 | 1 | build | — | HEAD FaqList + CSS compile | smoke | `npm run build` | ❌ W0 | ⬜ pending |
| 10-01-10 | 01 | 1 | CHR-07 | — | N/A | manual / backstop | Hover/active/FAQ/disabled in both themes; 4.5:1 eyeball | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

Existing `src/lib/*.test.ts` must stay green (`npm test`) as a regression gate — they do not cover CHR-*.

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Gaps are verification steps, not missing test files in `src/`:

- [ ] Plan tasks must include `git checkout HEAD -- src/components/FaqList.astro` **before** markup edits
- [ ] Plan tasks must include `rg` / `npm test` / `npm run build` verification
- [ ] No automated contrast/viewport test — **manual-only is justified**. Do not add Playwright
- [ ] Do **not** create CSS unit tests or edit Vitest environment
- Framework install: none — Vitest already present

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Copy hover invert both themes | CHR-01 | Needs pointer + theme | On a tool page, hover enabled Copy in dark then light: fill `--accent`, text `--bg` |
| Disabled Copy does not invert | CHR-01 | Needs empty output | Empty output: hover disabled Copy — no invert, opacity 0.45 |
| Copy pressed darkens fill | CHR-02 | Needs pointer | `:active` fill darker than hover; no scale |
| Focus ring 2px accent | CHR-03 | Needs keyboard | Tab to Copy and to an FAQ summary — 2px `--accent` outline |
| Panel shadow readable both themes | CHR-04 | Needs eyeball | `.tool-panel` 1px border + small `--border` shadow in light and dark |
| FAQ native collapse | CHR-05 | Needs click | Click summary: opens; click again: closes; two items can be open together |
| FAQ triangle marker visible | CHR-06 | Needs eyeball | UA `::marker` triangle present; not replaced by +/− |
| Contrast AA | CHR-07 | Needs eyeball | Idle / hover / active / FAQ text vs canvas ≥ 4.5:1 both themes |
| Overlay not committed | HEAD | Needs git | `git diff --cached --name-only` has no `src/pages/zh/` or `LangSwitch.astro` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (`npm test`)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
