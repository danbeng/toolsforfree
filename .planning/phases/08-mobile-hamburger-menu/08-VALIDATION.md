---
phase: "8"
slug: "mobile-hamburger-menu"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-16"
---

# Phase 8 — Validation Strategy

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

Do **not** add Playwright. Do **not** add `theme.test.ts`. Do **not** add `*.test.tsx` or switch Vitest to jsdom. Hamburger behavior is document CSS + inline script; Nyquist coverage is **file assertions + build + manual keyboard/viewport**, matching Phase 7.

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test` && `npm run build`
- **Before `/gsd-verify-work`:** Full suite green + file assertions + manual 640px checklist
- **Max feedback latency:** 30 seconds (`npm test`); build ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | NAV-01 | — | N/A | smoke (file) | `rg -n "max-width: 640px" src/styles/global.css` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | NAV-02 | — | N/A | smoke (file) | `rg -n "aria-controls" src/components/NavMenu.astro` | ❌ W0 | ⬜ pending |
| 08-01-03 | 01 | 1 | NAV-03 | — | N/A | manual | DevTools 640px; open; Escape; focus on hamburger | ❌ W0 | ⬜ pending |
| 08-01-04 | 01 | 1 | NAV-04 | — | N/A | smoke (file) + manual | `rg -n "visibility: hidden" src/styles/global.css`; `rg -n "inert" src/components/NavMenu.astro` | ❌ W0 | ⬜ pending |
| 08-01-05 | 01 | 1 | NAV-05 | — | Labels from `ui.ts` / `data-label-*`; no `innerHTML` | smoke (file) | `rg -n "nav:" src/i18n/ui.ts` | ❌ W0 | ⬜ pending |
| 08-01-06 | 01 | 1 | regression | — | N/A | unit | `npm test` | ✅ | ⬜ pending |
| 08-01-07 | 01 | 1 | build | T-08-01 | `is:inline` IIFE in dist HTML, not only a hashed module | smoke | `npm run build` then `rg "navToggle" dist` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

Existing `src/lib/*.test.ts` must stay green (`npm test`) as a regression gate — they do not cover NAV-*.

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Gaps are verification steps, not missing test files in `src/`:

- [ ] No automated keyboard/viewport test — **manual-only is justified**. Do not add Playwright this phase (new package forbidden).
- [ ] Plan tasks must include `rg` / `git show HEAD` / `npm run build` verification steps.
- [ ] Do **not** create `src/lib/nav.ts` or `theme.test.ts`.
- Framework install: none — Vitest already present.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hamburger visible, links collapsed at 640px; full nav at 641px | NAV-01 | Needs viewport | DevTools width 640 vs 641 |
| `aria-expanded` flips; label Open menu / Close menu | NAV-02, NAV-05 | Needs click + a11y tree | Inspect `#navToggle` after open/close |
| Escape closes and focus returns | NAV-03 | Needs real focus | Open, press Escape |
| Closed mobile: tab logo → hamburger → ThemeToggle → main (no Tools/Blog/About) | NAV-04 | Needs real tab order | Keyboard only, menu closed |
| Open mobile: tab hamburger → Tools → Blog → About → ThemeToggle → main (no trap) | NAV-03 deferred trap | Needs real tab order | Keyboard, menu open |
| Pointer-down on `main` closes; ThemeToggle click does not | CONTEXT outside pointer | Needs pointer | Open, click main vs sun/moon |
| Widen past 640px while open clears overlay and desktop links work | NAV-01 leftover | Needs resize across breakpoint | Open at 640, drag to 900 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (`npm test`)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
