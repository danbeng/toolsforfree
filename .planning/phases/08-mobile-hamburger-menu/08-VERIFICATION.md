---
phase: 08-mobile-hamburger-menu
verified: 2026-09-16T08:01:21Z
status: human_needed
score: 11/19 must-haves verified
covered_files:
  - .planning/REQUIREMENTS.md
  - .planning/phases/08-mobile-hamburger-menu/08-01-PLAN.md
  - .planning/phases/08-mobile-hamburger-menu/08-01-SUMMARY.md
  - src/components/Header.astro
  - src/components/NavMenu.astro
  - src/i18n/ui.ts
  - src/styles/global.css
covered_digest: "v1:sha256:0304e1681ddfca8c5d96e07db5d24be21add868f219c4d89fd3a9e6e573ad949"
behavior_unverified: 7
overrides_applied: 0
decision_coverage:
  honored: 0
  total: 0
  not_honored: []
behavior_unverified_items:
  - truth: "At ≤640px, visitor sees a hamburger button and header nav links are collapsed; at wider widths the full nav stays visible"
    test: "Resize DevTools to 640px then 641px and observe #navToggle plus Tools/Blog/About"
    expected: "At 640px #navToggle is visible and the three links are collapsed; at 641px the hamburger is gone and the full nav row is visible"
    why_human: "CSS display/visibility rules are present; actual paint and tab order at those viewports are not exercised by any test"
  - truth: "Visitor can open and close the menu with a real button; aria-expanded / aria-controls match the open state; the control label is EN or ZH to match the page"
    test: "Click #navToggle twice; inspect aria-expanded, aria-controls, and aria-label after each click"
    expected: "Open sets aria-expanded=true and Close menu; close sets aria-expanded=false and Open menu; aria-controls stays navMenu"
    why_human: "Button markup and setAttribute wiring exist; the open/close state transition is not exercised by a named test"
  - truth: "Visitor can close the open menu with Escape and focus returns to the hamburger button"
    test: "Open the menu at 640px, press Escape"
    expected: "is-open is gone, aria-expanded=false, and document.activeElement is #navToggle"
    why_human: "keydown Escape + toggle.focus() is in the IIFE; focus return is a runtime state transition"
  - truth: "When the menu is collapsed, hidden nav links are not keyboard-focusable"
    test: "At 640px with the menu closed, Tab from the logo through the header into main"
    expected: "Tools/Blog/About are skipped; order is logo, hamburger, ThemeToggle, main"
    why_human: "inert plus visibility:hidden are wired; keyboard focusability cannot be proven by grep"
  - truth: "Pointer-down outside header.site closes an open menu; clicks inside the header including ThemeToggle do not"
    test: "Open the menu; pointer-down on main; reopen and click ThemeToggle"
    expected: "Outside pointer closes without moving focus; ThemeToggle flips theme and the menu stays open"
    why_human: "pointerdown listener and header.contains guard are present; the close vs stay-open branch is untested"
  - truth: "Widening past 640px force-closes: removes is-open, sets aria-expanded false, restores nav.menu label, and removes inert so desktop links stay operable"
    test: "Open the menu at 640px, then drag the viewport to 900px"
    expected: "Overlay clears, hamburger hides, desktop Tools/Blog/About are clickable and focusable (no leftover inert)"
    why_human: "matchMedia change calls close() when matches becomes false; leftover-inert cleanup is a viewport state transition"
  - truth: "No body scroll lock and no focus trap; tab may leave the open overlay into main"
    test: "Open the menu at 640px and Tab past About / ThemeToggle"
    expected: "Focus leaves the overlay into main; body does not lock scroll"
    why_human: "Absence of overflow lock and trap is greppable; tab order out of the open overlay is not"
behavior_unverified_items_note: "Backstop header-row layout is insufficient_spec (not counted in behavior_unverified); see human_verification"
human_verification:
  - test: "DevTools width 640px: inspect the header row (logo, 44px hamburger, 44px theme toggle) and collapsed links. Width 641px: no hamburger; Tools/Blog/About in one row."
    expected: "At 640px one header row with collapsed links; at 641px full nav and #navToggle not in tab order"
    why_human: "Viewport paint and tab order cannot be proven without a browser; no Playwright in this phase"
  - test: "At max-width 640px confirm the header stays one row (logo, 44×44 hamburger, 44×44 theme toggle) and the three nav links overlay under the header instead of wrapping the bar"
    expected: "Header does not wrap; overlay drops under header.site covering content rather than pushing it"
    why_human: "UI-SPEC backstop (verification: backstop). Presence of 44px box, flex nowrap default, and position:absolute is not evidence of first-paint layout"
  - test: "Click hamburger: overlay under header, aria-expanded true, label Close menu; ThemeToggle still in the header row; page content covered not pushed"
    expected: "Panel uses --panel fill and --border hairline; ARIA and label match open; ThemeToggle remains a header sibling"
    why_human: "Open is a DOM class/ARIA transition; overlay covering vs pushing is visual"
  - test: "Click a nav link from the open overlay"
    expected: "Navigation occurs; the new page loads with the menu collapsed"
    why_human: "DOM-only state means a new document should be collapsed; needs a real navigation"
  - test: "Click ThemeToggle while the menu is open"
    expected: "Theme flips; menu stays open (target is inside header.site)"
    why_human: "Inside-header pointer guard is untested at runtime"
  - test: "Pointer-down on main while open"
    expected: "Menu closes; focus is not moved"
    why_human: "pointerdown close path is a state transition with a focus invariant"
  - test: "Escape while open"
    expected: "Menu closes; focus is on #navToggle"
    why_human: "Escape plus focus return is a keyboard state transition"
  - test: "Closed mobile tab order, then open mobile tab order"
    expected: "Closed: skip link (if any) → logo → hamburger → ThemeToggle → main (no Tools/Blog/About). Open: hamburger → Tools → Blog → About → ThemeToggle → main (no trap)"
    why_human: "inert + visibility:hidden and lack of a focus trap are greppable; actual tab order is not"
  - test: "Open at 640 then drag to 900"
    expected: "Overlay clears; leftover inert is gone; desktop links work"
    why_human: "matchMedia force-close and inert cleanup are viewport transitions"
  - test: "Load a page at desktop width and at 640px; watch first paint before interacting"
    expected: "First paint is the closed header; no skeleton, spinner, or wrapping-header flash; desktop does not flash a hamburger"
    why_human: "FOUC-equivalent paint cannot be proven from static HTML alone"
---

# Phase 8: Mobile Hamburger Menu Verification Report

**Phase Goal:** Visitors on small screens can open, close, and keyboard-navigate site navigation without a wrapping header
**Verified:** 2026-09-16T08:01:21Z
**Status:** human_needed
**Re-verification:** No — initial verification

Worked from HEAD chrome (`NavMenu.astro`, `Header.astro`, `global.css`, `ui.ts`). Dirty overlay (`LangSwitch.astro`, `src/pages/zh/`) is untracked and is not the implementation.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | At ≤640px, visitor sees a hamburger button and header nav links are collapsed; at wider widths the full nav stays visible | PRESENT_BEHAVIOR_UNVERIFIED | `#navToggle { display: none }` then `inline-flex` inside `@media (max-width: 640px)`; `.nav-links { visibility: hidden }` and `.nav.is-open .nav-links { visibility: visible }`. No viewport test. |
| 2 | Visitor can open and close the menu with a real `<button>`; `aria-expanded` / `aria-controls` match the open state; the control label is EN or ZH to match the page | PRESENT_BEHAVIOR_UNVERIFIED | `NavMenu.astro` button `type=button` `id=navToggle` `aria-expanded=false` `aria-controls=navMenu`; `open()`/`close()` set `aria-expanded` true/false and swap labels. State match untested. EN baked via `BaseLayout` `<Header />` default locale. |
| 3 | Visitor can close the open menu with Escape and focus returns to the hamburger button | PRESENT_BEHAVIOR_UNVERIFIED | `keydown` ignores non-Escape and closed menu; `close(); toggle.focus()`. No keyboard test. |
| 4 | When the menu is collapsed, hidden nav links are not keyboard-focusable | PRESENT_BEHAVIOR_UNVERIFIED | `setInertForViewport()` sets `inert` on `#navMenu` when `mq.matches && !isOpen()`; CSS `visibility: hidden` at 640px. Focus skip untested. |
| 5 | Control names come from `ui.ts` nested `nav.menu` / `nav.close` on both en and zh; script swaps `aria-label` from `data-label-menu` / `data-label-close` and does not hardcode English | VERIFIED | `en.nav.menu/close` = Open menu / Close menu; `zh` = 打开菜单 / 关闭菜单. Button uses `copy.nav.*`. IIFE uses `getAttribute`/`setAttribute` only. No `Open menu` string in the script. |
| 6 | ThemeToggle stays a sibling outside `#navMenu` and remains visible at every width | VERIFIED | `Header.astro` DOM: logo, `NavMenu`, `#navMenu` three links, then `<ThemeToggle />`. `#themeToggle` is not inside `#navMenu`. `#themeToggle { display: inline-flex }` is not gated by 640px. |
| 7 | Open menu is an overlay under `header.site` (`position: absolute`) and does not push page content | VERIFIED | At 640px `.nav-links` is `position: absolute; top: 100%; left: 0; right: 0`; `header.site` is `position: relative; z-index: 20`. Absolute overlay is out of flow. Visual covering still in human checks. |
| 8 | Pointer-down outside `header.site` closes an open menu; clicks inside the header including ThemeToggle do not | PRESENT_BEHAVIOR_UNVERIFIED | `pointerdown` on `document`: if open and `!header.contains(e.target)` then `close()`. No focus move on that path. Untested. |
| 9 | Widening past 640px force-closes: removes `is-open`, sets `aria-expanded` false, restores `nav.menu` label, and removes inert so desktop links stay operable | PRESENT_BEHAVIOR_UNVERIFIED | `mq.addEventListener('change')` calls `close()` when `!mq.matches`; `close()` → `setInertForViewport()` removes inert when the query does not match. No `resize` listener. Untested. |
| 10 | No body scroll lock and no focus trap; tab may leave the open overlay into main | PRESENT_BEHAVIOR_UNVERIFIED | NavMenu has no `overflow` lock, no trap, no `role=alert`. Tab-out of the open overlay is untested. |
| 11 | Menu open state is DOM-only; a new page load is always collapsed; NavMenu does not write web storage | VERIFIED | No `setItem`, `localStorage`, `document.cookie` in `NavMenu.astro`. Markup starts `aria-expanded=false` with no `is-open`. Dist HTML matches. |
| 12 | First paint is the closed header; NavMenu is static Astro with `is:inline`; no skeleton, spinner, or hydration wait | VERIFIED | Static Astro button + `<script is:inline>` IIFE; no `client:load`, no Preact, no skeleton/spinner. Dist inlines the IIFE next to `#navToggle`. FOUC-equivalent paint still harvested for human check. |
| 13 | Open/close is DOM class plus ARIA only; script failure has no `role=alert` and no error copy | VERIFIED | Null-check `toggle`/`menu`/`nav`/`header` then `return`. No alert chrome, no error string. |
| 14 | Nav is a fixed three-link set; never render empty-nav chrome, a placeholder icon, or No pages copy | VERIFIED | Header always emits Tools/Blog/About. No empty-state copy or placeholder icon in NavMenu/Header. |
| 15 | Overlay is `flex-direction: column`; three links wrap with `overflow-wrap: anywhere` and no inner scroll; header row does not wrap | VERIFIED | 640px `.nav-links { flex-direction: column; gap: 16px }` and `.nav-links a { overflow-wrap: anywhere }`. No overlay `overflow-y`. `.nav` has no `flex-wrap` (default nowrap). One-row paint is the backstop (#17). |
| 16 | Happy path is the existing SSG Tools/Blog/About hrefs and labels; count is fixed at three; no collection empty/partial/populated chrome | VERIFIED | `href="/tools/"`, `"/blog/"`, `"/about/"` with Tools/Blog/About labels verbatim. |
| 17 | At max-width 640px the header stays one row (logo, 44×44 hamburger, 44×44 theme toggle) and the three nav links overlay under the header instead of wrapping the bar | insufficient_spec | UI-SPEC / PLAN `verification: backstop`. 44px box and overlay CSS exist; first-paint one-row layout is not evidenced by a held-out test or observed viewport. |
| 18 | Files are authored from HEAD chrome; do not apply stash entries; do not commit `src/pages/zh` or LangSwitch | VERIFIED | Phase commits `0d12a31` and `4d42f52` touch only NavMenu, Header, `global.css`, `ui.ts`. `LangSwitch.astro` and `src/pages/zh/` are untracked. Header has no LangSwitch. |
| 19 | Zero new npm packages; no Playwright; no `src/lib`; no Preact island | VERIFIED | `git diff HEAD -- package.json package-lock.json` empty. No `src/lib/nav.ts`. NavMenu has no `from 'preact'` and no `client:load`. No Playwright added as a project dependency. |

**Score:** 11/19 truths verified (7 present, behavior-unverified; 1 backstop abstain)

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/components/NavMenu.astro` | Static `#navToggle` button, 3-line SVG, `is:inline` IIFE for click/Escape/pointerdown/matchMedia/inert | VERIFIED | 72 lines. Exists, substantive, imported by Header, inlined in `dist/*.html`. |
| `src/components/Header.astro` | Optional locale default en; DOM order logo, NavMenu, `#navMenu` three links, ThemeToggle sibling | VERIFIED | `locale ?? 'en'`. Wired into `BaseLayout.astro` as `<Header />`. |
| `src/styles/global.css` | `#navToggle` 44px box default `display: none`; max-width 640px overlay and `inline-flex` hamburger | VERIFIED | 284 lines. 44px box, `z-index: 20`, column overlay, `--panel` / `--border`. |
| `src/i18n/ui.ts` | Nested `en.nav` and `zh.nav` menu/close as sibling of `tools` | VERIFIED | Nested objects, not dotted keys. Consumed by NavMenu via `t(locale)`. |

`gsd_run query verify.artifacts`: 4/4 passed.

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `src/components/Header.astro` | `src/components/NavMenu.astro` | NavMenu rendered after logo with `locale={locale}` | WIRED | `import NavMenu` and `<NavMenu locale={locale} />` after logo |
| `src/components/Header.astro` | `src/components/ThemeToggle.astro` | ThemeToggle sibling after `#navMenu`, not inside `.nav-links` | WIRED | `<ThemeToggle />` after the `#navMenu` div |
| `src/components/NavMenu.astro` | `#navMenu` | `aria-controls=navMenu`; boot on DOMContentLoaded because `#navMenu` is a later sibling | WIRED | `aria-controls="navMenu"`; `getElementById('navMenu')` inside `boot()` after `DOMContentLoaded` when `readyState === 'loading'` |
| `src/components/NavMenu.astro` | `src/i18n/ui.ts` | `t(locale).nav.menu` / `nav.close` baked into `aria-label` and `data-label-*` | WIRED | `copy.nav.menu` / `copy.nav.close` on the button |
| `src/styles/global.css` | `nav.nav.is-open` | `@media (max-width: 640px) .nav.is-open .nav-links visibility visible` | WIRED | Rule present at line 116 |

`gsd_run query verify.key-links`: 5/5 verified.

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `NavMenu.astro` | `copy.nav.menu` / `copy.nav.close` | `t(Astro.props.locale)` → `src/i18n/ui.ts` | Yes — SSG attribute bake | FLOWING |
| `Header.astro` | `locale` | `Astro.props.locale ?? 'en'` | Yes — default en on every HEAD page via BaseLayout | FLOWING |
| `Header.astro` | logo text | `SITE_NAME` from `src/data/site.ts` | Yes | FLOWING |
| `Header.astro` | Tools/Blog/About hrefs | SSG literals `/tools/`, `/blog/`, `/about/` | Yes — fixed chrome, not a stub list | FLOWING |
| Dist HTML | `aria-label` / `data-label-*` | Built attributes `Open menu` / `Close menu` | Yes — `dist/index.html` contains raw `id="navToggle"` plus inline IIFE | FLOWING |

No fetch/API. Overlay copy is not a collection. Hollow-prop not applicable.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| NavMenu exists with IIFE contract | file + pattern checks (`is:inline`, `navToggle`, `inert`, `Escape`, `pointerdown`, `matchMedia`, `DOMContentLoaded`) | All present | PASS |
| Dist HTML inlines `navToggle` | `rg -l navToggle dist --glob '*.html'` | 25 HTML files | PASS |
| No storage / Preact / innerHTML in NavMenu | negative rg | no matches | PASS |
| `package.json` unchanged | `git diff HEAD -- package.json package-lock.json` | empty | PASS |
| No `src/lib/nav.ts` | `test ! -f src/lib/nav.ts` | absent | PASS |
| No hamburger Vitest | `npx vitest list` filtered for nav/hamburger/header | no nav tests (jwt `decodeJwt` is unrelated) | SKIP |
| Viewport / keyboard / FOUC | none — no Playwright; do not invent `src/lib` tests | cannot run | SKIP |

Did not run the full Vitest suite. SUMMARY's "155 tests" do not exercise hamburger behavior.

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No `scripts/*/tests/probe-*.sh`; PLAN/SUMMARY do not declare probes | N/A |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| NAV-01 | 08-01-PLAN.md | Hamburger visible at ≤640px, collapses nav links | NEEDS HUMAN | CSS + markup wired; viewport paint unproven |
| NAV-02 | 08-01-PLAN.md | Real `<button>` with `aria-expanded` and `aria-controls` | SATISFIED | Button attributes in NavMenu and dist HTML; open-state match still in human checks |
| NAV-03 | 08-01-PLAN.md | Escape closes and returns focus to the button | NEEDS HUMAN | IIFE present; focus return untested |
| NAV-04 | 08-01-PLAN.md | Hidden links not focusable (`inert` or `visibility: hidden`) | NEEDS HUMAN | Both mechanisms wired; tab order untested |
| NAV-05 | 08-01-PLAN.md | Menu toggle label localized EN and ZH (`ui.ts` keys) | SATISFIED | Nested `nav.menu` / `nav.close` on en and zh; baked into `data-label-*` |

Orphaned requirements mapped to Phase 8 but missing from PLAN: none. LAY-* and CHR-* belong to later phases.

### Decision Coverage

No trackable decisions in CONTEXT.md.

CONTEXT D-01 through D-04 are still visible in the shipped artifacts (static Astro + overlay, inert/Escape/outside pointer, ui.ts + 640px + force-close, HEAD-only files). Gate is non-blocking.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| none | NAV-01..05 | 0 | 0 | no | — | No requirement-linked tests (phase forbids Playwright and `src/lib` tests) |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** SUMMARY D1 cites `npm test (155 tests)` for NAV-01 — those tests do not cover hamburger behavior. Warning only; not a blocker.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | No TBD/FIXME/XXX in phase files | — | — |

Phase commits do not touch `ThemeToggle.astro`, `ThemeInit.astro`, `BaseLayout.astro`, `src/lib`, or `astro.config.mjs`. Dirty `Footer.astro` / `LangSwitch` / `src/pages/zh` overlay is out of scope.

### Human Verification Required

Harvested from PLAN task 3 `<human-check>` and from behavior-unverified / backstop truths. No Playwright.

### 1. 640px vs 641px chrome

**Test:** DevTools width 640px: one header row (logo, 44px hamburger, 44px theme toggle); links collapsed. Width 641px: no hamburger; Tools/Blog/About in one row.
**Expected:** Hamburger and collapse only at max-width 640px; desktop full nav; `#navToggle` not in tab order when `display: none`.
**Why human:** Viewport paint and tab order.

### 2. Backstop — header stays one row

**Test:** At max-width 640px confirm the header stays one row (logo, 44×44 hamburger, 44×44 theme toggle) and the three nav links overlay under the header instead of wrapping the bar.
**Expected:** No wrapping header; overlay under `header.site`.
**Why human:** `verification: backstop`. Presence checks cannot see first-paint layout.

### 3. Open overlay

**Test:** Click hamburger.
**Expected:** Overlay under header, `aria-expanded=true`, label Close menu; ThemeToggle still in the header row; page content covered not pushed.
**Why human:** Open transition and covering vs pushing are visual/runtime.

### 4. Navigate from overlay

**Test:** Click a nav link.
**Expected:** New page loads collapsed.
**Why human:** Needs a real navigation.

### 5. ThemeToggle while open

**Test:** Click ThemeToggle while open.
**Expected:** Theme flips; menu stays open.
**Why human:** Inside-header pointer guard.

### 6. Outside pointer close

**Test:** Pointer-down on main.
**Expected:** Menu closes without moving focus.
**Why human:** Pointer close invariant.

### 7. Escape close

**Test:** Escape while open.
**Expected:** Menu closes; focus on `#navToggle`.
**Why human:** Keyboard focus return.

### 8. Tab order closed and open

**Test:** Closed mobile tab order, then open mobile tab order.
**Expected:** Closed: logo, hamburger, ThemeToggle, main (no Tools/Blog/About). Open: hamburger, Tools, Blog, About, ThemeToggle, main (no trap).
**Why human:** Focusability and trap absence at runtime.

### 9. Widen force-close

**Test:** Open at 640 then drag to 900.
**Expected:** Overlay clears and desktop links work (inert gone).
**Why human:** matchMedia leftover-inert path.

### 10. FOUC-equivalent first paint

**Test:** Load a page at desktop width and at 640px; watch first paint before interacting.
**Expected:** Closed header; no skeleton/spinner; no wrapping-header flash; desktop does not flash a hamburger.
**Why human:** FOUC-equivalent paint.

### Gaps Summary

No implementation gaps. Artifacts exist, are substantive, and are wired. HEAD chrome only; overlay ZH pages and LangSwitch were not committed. Goal-level open/close/keyboard/viewport behavior is present in code but not exercised by a test, and the one-row header claim is a backstop. Status is `human_needed`, not `gaps_found`.

---

_Verified: 2026-09-16T08:01:21Z_
_Verifier: Claude (gsd-verifier)_
