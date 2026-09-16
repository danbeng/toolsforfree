---
phase: "7"
slug: "theme-foundation"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-16"
---

# Phase 7 — Validation Strategy

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

Do **not** add `*.test.tsx` or switch Vitest to jsdom. Theme behavior is document CSS + inline scripts; Nyquist coverage is **build + file assertions + manual FOUC**, not DOM unit tests. Do **not** create `src/lib/theme.test.ts`.

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test` && `npm run build`
- **Before `/gsd-verify-work`:** Full suite green + `dist` contains inline theme IIFE + manual FOUC checklist
- **Max feedback latency:** 30 seconds (`npm test`); build ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | THM-01 | — | N/A | smoke (file) | `rg -n "data-theme=\"light\"" src/styles/global.css` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | THM-02 | — | N/A | smoke (file) | `rg ThemeToggle src/components/Header.astro` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | THM-03 | T-7-01 | Allowlist `light`\|`dark` before `setAttribute`; try/catch around storage | manual | hard refresh after toggle | ❌ W0 | ⬜ pending |
| 07-01-04 | 01 | 1 | THM-04 | T-7-01 | Init script is `is:inline` IIFE, not bundled `type="module"` | smoke | `npm run build` then `rg "localStorage.getItem\\('theme'\\)" dist` | ❌ W0 | ⬜ pending |
| 07-01-05 | 01 | 1 | THM-05 | — | N/A | manual | DevTools emulate `prefers-color-scheme`, empty storage, hard refresh | ❌ W0 | ⬜ pending |
| 07-01-06 | 01 | 1 | THM-06 | — | N/A | smoke (file) | `rg --grid-line src/styles/global.css` | ❌ W0 | ⬜ pending |
| 07-01-07 | 01 | 1 | THM-07 | — | N/A | smoke (file) | `rg "color-scheme" src/styles/global.css` | ❌ W0 | ⬜ pending |
| 07-01-08 | 01 | 1 | regression | — | N/A | unit | `npm test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

Existing `src/lib/*.test.ts` must stay green (`npm test`) as a regression gate — they do not cover THM-*.

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Gaps are verification steps, not missing test files in `src/`:

- [ ] No automated FOUC test — **manual-only is justified** (needs real paint + localStorage). Do not add Playwright this phase (new package forbidden).
- [ ] Plan tasks must include `rg` / `git show HEAD` / `npm run build` verification steps (these are the automated commands above).
- [ ] Do **not** create `src/lib/theme.test.ts`.
- Framework install: none — Vitest already present.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No flash of wrong theme on hard refresh with stored `theme=light` | THM-04 | Needs real first paint | Hard refresh with `theme=light` in localStorage — no dark flash |
| No flash of wrong theme on hard refresh with stored `theme=dark` | THM-04 | Needs real first paint | Hard refresh with `theme=dark` — no light flash |
| First visit follows OS light | THM-05 | Needs empty storage + UA emulate | Clear storage, emulate `prefers-color-scheme: light`, hard refresh — light on load |
| First visit follows OS dark | THM-05 | Needs empty storage + UA emulate | Clear storage, emulate dark, hard refresh — dark on load |
| Preference persists across pages | THM-03 | Multi-route navigation | Toggle, then `/` → `/tools/` → `/about/` — preference sticks |
| Light body grid + native widgets | THM-06, THM-07 | Visual | Light theme: body grid visible; textarea / scrollbar match light `color-scheme` |
| Diff hunks readable in both themes | THM-01 | Visual | Diff tool add/del lines readable in both themes |
| Production HTML inlines init script | THM-04 | Built artifact check after `npm run build` | Confirm `dist/**/*.html` still contains the raw IIFE, not only a hashed module |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (`npm test`)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
