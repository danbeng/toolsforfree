---
phase: 08-mobile-hamburger-menu
verified: 2026-09-16T09:48:52Z
status: passed
score: 19/19 must-haves verified
covered_files:
  - .planning/REQUIREMENTS.md
  - .planning/phases/08-mobile-hamburger-menu/08-01-PLAN.md
  - .planning/phases/08-mobile-hamburger-menu/08-01-SUMMARY.md
  - src/components/Header.astro
  - src/components/NavMenu.astro
  - src/i18n/ui.ts
  - src/styles/global.css
covered_digest: "v1:sha256:d84972a9d3b0287e5a1a5952a36aaa1af1b3135a391ab22854470819302ce014"
behavior_unverified: 0
overrides_applied: 0
decision_coverage:
  honored: 0
  total: 0
  not_honored: []
re_verification:
  previous_status: passed
  previous_score: 19/19
  previous_verified: 2026-09-16T08:01:21Z
  previous_digest: "v1:sha256:0304e1681ddfca8c5d96e07db5d24be21add868f219c4d89fd3a9e6e573ad949"
  gaps_closed: []
  gaps_remaining: []
  regressions: []
  note: "Stale passed report refreshed after CR-01 CSS source-order fix (commit 39d10b2) and completed 10/10 UAT. Prior report had no gaps: block."
---

# Phase 8: Mobile Hamburger Menu Verification Report

**Phase Goal:** Visitors on small screens can open, close, and keyboard-navigate site navigation without a wrapping header
**Verified:** 2026-09-16T09:48:52Z
**Status:** passed
**Re-verification:** Yes — post-review CSS fix (CR-01) plus completed human UAT; prior report had no `gaps:`

Worked from HEAD chrome (`NavMenu.astro`, `Header.astro`, `global.css`, `ui.ts`). `git diff HEAD --` on those four paths is empty. Dirty overlay (`LangSwitch.astro`, `src/pages/zh/`) is untracked and is not the implementation.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | At ≤640px, visitor sees a hamburger button and header nav links are collapsed; at wider widths the full nav stays visible | ✓ VERIFIED | `#navToggle { display: none }` then `inline-flex` inside `@media (max-width: 640px)`; `.nav-links { visibility: hidden }` and `.nav.is-open .nav-links { visibility: visible }`. UAT test 1 pass. |
| 2 | Visitor can open and close the menu with a real `<button>`; `aria-expanded` / `aria-controls` match the open state; the control label is EN or ZH to match the page | ✓ VERIFIED | `NavMenu.astro` `type=button` `id=navToggle` `aria-expanded=false` `aria-controls=navMenu`; `open()`/`close()` write `'true'`/`'false'` and swap `data-label-*`. EN baked via `BaseLayout` `<Header />`. UAT tests 3 and 4 pass. |
| 3 | Visitor can close the open menu with Escape and focus returns to the hamburger button | ✓ VERIFIED | `keydown` ignores non-Escape and closed menu; `close(); toggle.focus()`. UAT test 7 pass. |
| 4 | When the menu is collapsed, hidden nav links are not keyboard-focusable | ✓ VERIFIED | `setInertForViewport()` sets `inert` when `mq.matches && !isOpen()`; CSS `visibility: hidden` at 640px. UAT test 8 pass (closed tab order skips Tools/Blog/About). |
| 5 | Control names come from `ui.ts` nested `nav.menu` / `nav.close` on both en and zh; script swaps `aria-label` from `data-label-menu` / `data-label-close` and does not hardcode English | ✓ VERIFIED | `en.nav` = Open menu / Close menu; `zh` = 打开菜单 / 关闭菜单. Button uses `copy.nav.*`. IIFE uses `getAttribute`/`setAttribute` only. No English literal in the script. |
| 6 | ThemeToggle stays a sibling outside `#navMenu` and remains visible at every width | ✓ VERIFIED | Header DOM: logo, `NavMenu`, `#navMenu` three links, then `<ThemeToggle />`. `#themeToggle { display: inline-flex }` is not gated by 640px. |
| 7 | Open menu is an overlay under `header.site` (`position: absolute`) and does not push page content | ✓ VERIFIED | At 640px `.nav-links` is `position: absolute; top: 100%; left: 0; right: 0`; `header.site` is `position: relative; z-index: 20`. UAT tests 2 and 3 pass (covers, does not push). |
| 8 | Pointer-down outside `header.site` closes an open menu; clicks inside the header including ThemeToggle do not | ✓ VERIFIED | `pointerdown` on `document`: if open and `!header.contains(e.target)` then `close()`. UAT tests 5 and 6 pass. |
| 9 | Widening past 640px force-closes: removes `is-open`, sets `aria-expanded` false, restores `nav.menu` label, and removes inert so desktop links stay operable | ✓ VERIFIED | `mq.addEventListener('change')` calls `close()` when `!mq.matches`; `close()` → `setInertForViewport()` removes inert when the query does not match. No `resize` listener. UAT test 9 pass. |
| 10 | No body scroll lock and no focus trap; tab may leave the open overlay into main | ✓ VERIFIED | NavMenu has no `overflow` lock, no trap, no `role=alert`. UAT test 8 pass (open order ends in main). |
| 11 | Menu open state is DOM-only; a new page load is always collapsed; NavMenu does not write web storage | ✓ VERIFIED | No `setItem`, `localStorage`, `document.cookie` in `NavMenu.astro`. Markup starts `aria-expanded=false` with no `is-open`. UAT test 4 pass (new page collapsed). |
| 12 | First paint is the closed header; NavMenu is static Astro with `is:inline`; no skeleton, spinner, or hydration wait | ✓ VERIFIED | Static Astro button + `<script is:inline>` IIFE; no `client:load`, no Preact, no skeleton/spinner. Dist inlines `navToggle`. UAT test 10 pass. |
| 13 | Open/close is DOM class plus ARIA only; script failure has no `role=alert` and no error copy | ✓ VERIFIED | Null-check `toggle`/`menu`/`nav`/`header` then `return`. No alert chrome. |
| 14 | Nav is a fixed three-link set; never render empty-nav chrome, a placeholder icon, or No pages copy | ✓ VERIFIED | Header always emits Tools/Blog/About. No empty-state copy in NavMenu/Header. |
| 15 | Overlay is `flex-direction: column`; three links wrap with `overflow-wrap: anywhere` and no inner scroll; header row does not wrap | ✓ VERIFIED | 640px `.nav-links { flex-direction: column; gap: 16px }` and `.nav-links a { overflow-wrap: anywhere }`. No overlay `overflow-y`. `.nav` has no `flex-wrap` (default nowrap). |
| 16 | Happy path is the existing SSG Tools/Blog/About hrefs and labels; count is fixed at three; no collection empty/partial/populated chrome | ✓ VERIFIED | `href="/tools/"`, `"/blog/"`, `"/about/"` with Tools/Blog/About labels verbatim. |
| 17 | At max-width 640px the header stays one row (logo, 44×44 hamburger, 44×44 theme toggle) and the three nav links overlay under the header instead of wrapping the bar | ✓ VERIFIED | UI-SPEC backstop. 44px boxes, overlay `position:absolute`, and CR-01 source-order `#themeToggle { margin-left: auto }` after Phase 7 `margin: 0`. Directly observed: UAT tests 1 and 2 pass. |
| 18 | Files are authored from HEAD chrome; do not apply stash entries; do not commit `src/pages/zh` or LangSwitch | ✓ VERIFIED | Phase commits `0d12a31`, `4d42f52`, `39d10b2` touch only NavMenu, Header, `global.css`, `ui.ts`. `LangSwitch.astro` and `src/pages/zh/` are untracked. Header has no LangSwitch. |
| 19 | Zero new npm packages; no Playwright; no `src/lib`; no Preact island | ✓ VERIFIED | `git diff HEAD -- package.json package-lock.json` empty. No `src/lib/nav.ts`. NavMenu has no `from 'preact'` and no `client:load`. |

**Score:** 19/19 truths verified (0 present, behavior-unverified)

Prior pass left 7 truths PRESENT_BEHAVIOR_UNVERIFIED and 1 backstop abstain. Those are now VERIFIED: code still present and wired, and `08-UAT.md` records 10/10 human checks passed after the CR-01 CSS fix.

### Advisory (New Scope, Unevidenced)

None.

### CR-01 source order (post-review fix)

Review finding: mobile `#themeToggle { margin-left: auto }` was overridden by later Phase 7 `#themeToggle { margin: 0 }`.

HEAD `src/styles/global.css` now:

1. Overlay `@media (max-width: 640px)` (lines 86–116) — hamburger + overlay only; **no** `#themeToggle { margin-left: auto }` in this block.
2. Phase 7 `#themeToggle` box including `margin: 0` (lines 117–131).
3. Second `@media (max-width: 640px)` **after** that box (lines 140–143): `#themeToggle { margin-left: auto }`.

Same specificity; later source order wins. Trailing-edge theme toggle at ≤640px is in contract. Commit `39d10b2` (`fix(08): keep mobile ThemeToggle at the trailing edge`).

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/components/NavMenu.astro` | Static `#navToggle` button, 3-line SVG, `is:inline` IIFE for click/Escape/pointerdown/matchMedia/inert | ✓ VERIFIED | 72 lines. Exists, substantive, imported by Header, inlined in `dist/*.html`. |
| `src/components/Header.astro` | Optional locale default en; DOM order logo, NavMenu, `#navMenu` three links, ThemeToggle sibling | ✓ VERIFIED | `locale ?? 'en'`. Wired into `BaseLayout.astro` as `<Header />`. |
| `src/styles/global.css` | `#navToggle` 44px box default `display: none`; max-width 640px overlay and `inline-flex` hamburger | ✓ VERIFIED | 44px box, `z-index: 20`, column overlay, `--panel` / `--border`. CR-01 margin rule after `#themeToggle` box. |
| `src/i18n/ui.ts` | Nested `en.nav` and `zh.nav` menu/close as sibling of `tools` | ✓ VERIFIED | Nested objects, not dotted keys. Consumed by NavMenu via `t(locale)`. |

`gsd_run query verify.artifacts`: 4/4 passed.

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `src/components/Header.astro` | `src/components/NavMenu.astro` | NavMenu rendered after logo with `locale={locale}` | ✓ WIRED | `import NavMenu` and `<NavMenu locale={locale} />` after logo |
| `src/components/Header.astro` | `src/components/ThemeToggle.astro` | ThemeToggle sibling after `#navMenu`, not inside `.nav-links` | ✓ WIRED | `<ThemeToggle />` after the `#navMenu` div |
| `src/components/NavMenu.astro` | `#navMenu` | `aria-controls=navMenu`; boot on DOMContentLoaded because `#navMenu` is a later sibling | ✓ WIRED | `aria-controls="navMenu"`; `getElementById('navMenu')` inside `boot()` after `DOMContentLoaded` when `readyState === 'loading'` |
| `src/components/NavMenu.astro` | `src/i18n/ui.ts` | `t(locale).nav.menu` / `nav.close` baked into `aria-label` and `data-label-*` | ✓ WIRED | `copy.nav.menu` / `copy.nav.close` on the button |
| `src/styles/global.css` | `nav.nav.is-open` | `@media (max-width: 640px) .nav.is-open .nav-links visibility visible` | ✓ WIRED | Rule present at line 113 |

`gsd_run query verify.key-links`: 5/5 verified.

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `NavMenu.astro` | `copy.nav.menu` / `copy.nav.close` | `t(Astro.props.locale)` → `src/i18n/ui.ts` | Yes — SSG attribute bake | ✓ FLOWING |
| `Header.astro` | `locale` | `Astro.props.locale ?? 'en'` | Yes — default en on every HEAD page via BaseLayout | ✓ FLOWING |
| `Header.astro` | logo text | `SITE_NAME` from `src/data/site.ts` | Yes | ✓ FLOWING |
| `Header.astro` | Tools/Blog/About hrefs | SSG literals `/tools/`, `/blog/`, `/about/` | Yes — fixed chrome, not a stub list | ✓ FLOWING |
| Dist HTML | `aria-label` / `data-label-*` | Built attributes `Open menu` / `Close menu` | Yes — `dist/*.html` contains raw `id="navToggle"` plus inline IIFE (25 files) | ✓ FLOWING |

No fetch/API. Overlay copy is not a collection. Hollow-prop not applicable.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| NavMenu exists with IIFE contract | file + pattern checks (`is:inline`, `navToggle`, `inert`, `Escape`, `pointerdown`, `matchMedia`, `DOMContentLoaded`) | All present | ✓ PASS |
| Dist HTML inlines `navToggle` | `rg -l navToggle dist --glob '*.html'` | 25 HTML files | ✓ PASS |
| No storage / Preact / innerHTML in NavMenu | negative rg | no matches | ✓ PASS |
| `package.json` unchanged | `git diff HEAD -- package.json package-lock.json` | empty | ✓ PASS |
| No `src/lib/nav.ts` | `test ! -f src/lib/nav.ts` | absent | ✓ PASS |
| CR-01 `#themeToggle` margin-left after box | `git show HEAD:src/styles/global.css` lines 117–143 | `margin: 0` at 126; `margin-left: auto` at 140–143 | ✓ PASS |
| Four chrome files match HEAD | `git diff HEAD --` those paths | empty | ✓ PASS |
| Viewport / keyboard / FOUC | `08-UAT.md` 10/10 | human UAT complete after CSS fix | ✓ PASS (human) |

Did not re-run the full Vitest suite. SUMMARY's "155 tests" do not exercise hamburger behavior.

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No `scripts/*/tests/probe-*.sh`; PLAN/SUMMARY do not declare probes | N/A |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| NAV-01 | 08-01-PLAN.md | Hamburger visible at ≤640px, collapses nav links | ✓ SATISFIED | CSS + markup wired; UAT test 1 pass |
| NAV-02 | 08-01-PLAN.md | Real `<button>` with `aria-expanded` and `aria-controls` | ✓ SATISFIED | Button attributes in NavMenu and dist HTML; UAT test 3 pass |
| NAV-03 | 08-01-PLAN.md | Escape closes and returns focus to the button | ✓ SATISFIED | IIFE present; UAT test 7 pass |
| NAV-04 | 08-01-PLAN.md | Hidden links not focusable (`inert` or `visibility: hidden`) | ✓ SATISFIED | Both mechanisms wired; UAT test 8 pass |
| NAV-05 | 08-01-PLAN.md | Menu toggle label localized EN and ZH (`ui.ts` keys) | ✓ SATISFIED | Nested `nav.menu` / `nav.close` on en and zh; baked into `data-label-*` |

Orphaned requirements mapped to Phase 8 but missing from PLAN: none. LAY-* and CHR-* belong to later phases.

### Decision Coverage

No trackable decisions in CONTEXT.md.

CONTEXT D-01 through D-04 are still visible in the shipped artifacts (static Astro + overlay, inert/Escape/outside pointer, ui.ts + 640px + force-close, HEAD-only files). Gate is non-blocking.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| none | NAV-01..05 | 0 | 0 | no | — | No requirement-linked automated tests (phase forbids Playwright and `src/lib` tests). Behavior proven by UAT 10/10. |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** SUMMARY D1 cites `npm test (155 tests)` for NAV-01 — those tests do not cover hamburger behavior. Warning only; not a blocker. Human UAT is the behavioral evidence.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | No TBD/FIXME/XXX in phase files | — | — |

Phase commits do not touch `ThemeToggle.astro`, `ThemeInit.astro`, `BaseLayout.astro`, `src/lib`, or `astro.config.mjs`. Dirty `Footer.astro` / `LangSwitch` / `src/pages/zh` overlay is out of scope.

### Human Verification (completed evidence)

Harvested PLAN task 3 `<human-check>` items and prior behavior-unverified / backstop truths. Recorded in `08-UAT.md` as 10/10 pass after the CR-01 CSS fix (user selected All good). Not pending.

| # | Test | Expected | UAT result |
| --- | ---- | -------- | ---------- |
| 1 | DevTools 640px vs 641px chrome | One header row + collapsed links at 640; full nav, hamburger out of tab order at 641 | pass |
| 2 | Backstop one-row header | Header does not wrap; overlay under `header.site` covering not pushing | pass |
| 3 | Click hamburger | Overlay, `aria-expanded=true`, Close menu; ThemeToggle stays in row | pass |
| 4 | Click a nav link | New page loads collapsed | pass |
| 5 | ThemeToggle while open | Theme flips; menu stays open | pass |
| 6 | Pointer-down on main | Menu closes; focus not moved | pass |
| 7 | Escape while open | Menu closes; focus on `#navToggle` | pass |
| 8 | Closed then open tab order | Closed skips Tools/Blog/About; open hamburger → Tools → Blog → About → ThemeToggle → main (no trap) | pass |
| 9 | Open at 640 then drag to 900 | Overlay clears; leftover inert gone; desktop links work | pass |
| 10 | First paint closed header | Closed header; no skeleton/spinner; no wrapping-header flash; desktop does not flash a hamburger | pass |

### Gaps Summary

No implementation gaps. Artifacts exist, are substantive, and are wired. HEAD chrome only; overlay ZH pages and LangSwitch were not committed. CR-01 source-order fix is in HEAD after the Phase 7 `#themeToggle` box. Human UAT 10/10 passed. Phase goal achieved.

---

_Verified: 2026-09-16T09:48:52Z_
_Verifier: Claude (gsd-verifier)_
