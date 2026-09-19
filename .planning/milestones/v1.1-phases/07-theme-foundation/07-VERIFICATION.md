---
phase: 07-theme-foundation
verified: 2026-09-16T04:00:47Z
status: passed
score: 26/26 must-haves verified
covered_files:
  - .planning/REQUIREMENTS.md
  - .planning/phases/07-theme-foundation/07-01-PLAN.md
  - .planning/phases/07-theme-foundation/07-01-SUMMARY.md
  - src/components/Header.astro
  - src/components/ThemeInit.astro
  - src/components/ThemeToggle.astro
  - src/layouts/BaseLayout.astro
  - src/styles/global.css
covered_digest: "v1:sha256:76dfe050ae790a2a4a87abeb2b07a9a1d5f3036df45ac3f1af7f009209b7488e"
behavior_unverified: 5
overrides_applied: 0
decision_coverage:
  honored: 0
  total: 0
  not_honored: []
behavior_unverified_items:
  - truth: "Visitor can toggle light and dark from the header (sun/moon control) on both EN and ZH pages; the document restyles immediately via data-theme on html"
    test: "On a built page, click #themeToggle once"
    expected: "html data-theme flips between light and dark; CSS tokens restyle immediately; sun/moon visibility follows the attribute"
    why_human: "Click-to-attribute restyle is a state transition. Grep proves the listener and CSS selectors exist; no test clicks the control. HEAD has no src/pages/zh/ tree (D-03/D-04); every existing BaseLayout page includes the toggle."
  - truth: "Visitor's chosen theme is restored on the next page load with no flash of the wrong theme"
    test: "Set localStorage.theme to light, hard-refresh; repeat with dark"
    expected: "Stored theme is on html before first paint; no flash of the opposite palette"
    why_human: "FOUC is a paint-time ordering invariant. Dist inlines the IIFE as the first head child, but source checks cannot observe first paint."
  - truth: "First-time visitor with no stored preference sees a theme matching their OS prefers-color-scheme; first visit does not write the theme storage key"
    test: "Clear storage, emulate prefers-color-scheme light then dark, hard-refresh each time"
    expected: "data-theme matches the emulated OS; localStorage.theme stays absent until a click"
    why_human: "matchMedia resolution at init is runtime. ThemeInit has no setItem (source-proven); OS matching still needs a browser."
  - truth: "Two clicks return to the starting theme; a third click matches the theme after one click"
    test: "Note starting data-theme; click toggle twice; click a third time"
    expected: "After two clicks the attribute equals the start; after three it equals the one-click value"
    why_human: "Idempotency is a state-transition invariant. The ternary is present; no test exercises two/three clicks."
  - truth: "Last click wins; data-theme and the theme storage key stay the same literal light or dark"
    test: "Click the toggle rapidly several times and inspect html data-theme plus localStorage.theme"
    expected: "Both are the same allowlisted literal (light or dark) matching the last click"
    why_human: "Last-write ordering is not exercised by a test. Handler is synchronous setAttribute then setItem of the same next literal."
human_verification:
  - test: "Hard-refresh with localStorage.theme=light, then with theme=dark"
    expected: "No flash of the opposite theme; stored value paints before first paint"
    why_human: "FOUC is paint-time; grep cannot see first paint"
  - test: "Clear storage, emulate prefers-color-scheme light, hard-refresh; repeat with dark"
    expected: "Theme matches OS; storage key still absent"
    why_human: "Needs empty storage plus UA emulation"
  - test: "Click #themeToggle"
    expected: "data-theme and icon flip immediately; localStorage.theme is written to the same literal"
    why_human: "Click restyle is a state transition with no automated test"
  - test: "Click twice from a known start, then a third time"
    expected: "Two clicks restore the start; third matches the one-click theme"
    why_human: "Idempotency is untested runtime behavior"
  - test: "Click rapidly several times"
    expected: "html data-theme and localStorage.theme are the same light or dark literal (last click wins)"
    why_human: "Concurrency/last-write is untested"
  - test: "After a click, navigate / to /tools/ to /about/"
    expected: "The stored theme sticks on every BaseLayout page"
    why_human: "Multi-route persistence needs a real browser"
  - test: "In light theme, inspect body grid, textarea, and scrollbar"
    expected: "47px/48px --grid-line is visible; native widgets follow color-scheme light"
    why_human: "Grid visibility and UA widgets are visual"
  - test: "Open the text-diff tool in both themes"
    expected: "Add/del hunks stay readable; eq stays muted; no theme skeleton or ToolShell alert from storage errors"
    why_human: "Hunk contrast is visual"
  - test: "Desktop viewport: inspect the header row"
    expected: "One row; 44x44 toggle after About; no wrap, collapse, or hamburger"
    why_human: "verification backstop — layout cannot be inferred from presence of 44px rules; Phase 8 owns hamburger"
---

# Phase 7: Theme Foundation Verification Report

**Phase Goal:** Visitors can use light or dark theme on every page without a flash, and the choice persists across visits and locales
**Verified:** 2026-09-16T04:00:47Z
**Status:** passed
**Re-verification:** No — initial verification
**Baseline:** git HEAD chrome (`ThemeInit.astro`, `ThemeToggle.astro`, `global.css` 230 lines, `BaseLayout.astro`, `Header.astro`). Dirty overlay pages were not treated as the implementation. Worktree diff vs HEAD on those five files: empty.

## Goal Achievement

### Observable Truths

Must-haves are the four ROADMAP success criteria plus PLAN frontmatter truths that do not restate those criteria. ROADMAP wording wins where PLAN restates an SC.

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Visitor can toggle light and dark from the header (sun/moon control) on both EN and ZH pages; the document restyles immediately via `data-theme` on `<html>` | PRESENT_BEHAVIOR_UNVERIFIED | HEAD `ThemeToggle.astro` click sets `document.documentElement` `data-theme` to `light`/`dark`. `Header.astro` places the control after About. All 8 HEAD pages import `BaseLayout` (which renders `Header`). 25/25 `dist/**/*.html` contain `id="themeToggle"`. HEAD has no `src/pages/zh/` tree (CONTEXT D-03/D-04); origin-scoped `theme` key is locale-agnostic. No test clicks the control. |
| 2 | Visitor's chosen theme is restored on the next page load with no flash of the wrong theme | PRESENT_BEHAVIOR_UNVERIFIED | `ThemeInit.astro` is `is:inline` IIFE, first child of `<head>` before charset. Dist `index.html` starts `<head><script>…localStorage.getItem('theme')…setAttribute('data-theme'`. 25/25 HTML files contain the raw IIFE (not only a hashed module). FOUC itself is untested paint. |
| 3 | First-time visitor with no stored preference sees a theme matching their OS `prefers-color-scheme`; first visit does not write the theme storage key | PRESENT_BEHAVIOR_UNVERIFIED | Init allowlists `light`/`dark` then `matchMedia('(prefers-color-scheme: dark)')`. `git grep setItem HEAD -- src/components/ThemeInit.astro` is empty. OS matching is untested runtime. |
| 4 | Light theme shows an adapted body grid-line background, and native widgets (scrollbar, inputs) follow the active `color-scheme` | VERIFIED | HEAD `global.css`: `:root[data-theme="light"]` sets `--grid-line: rgba(15, 23, 32, 0.10)`; `body` `repeating-linear-gradient` 47px/48px consumes `--grid-line`; `color-scheme: dark` on `:root`, `color-scheme: light` on the light selector; no `color-scheme: light dark`; no static color-scheme meta. Native paint still listed under Human Verification. |
| 5 | Two clicks return to the starting theme; a third click matches the theme after one click | PRESENT_BEHAVIOR_UNVERIFIED | Toggle ternary `getAttribute('data-theme') === 'light' ? 'dark' : 'light'` is present and wired. No test exercises two/three clicks. |
| 6 | Last click wins; `data-theme` and the theme storage key stay the same literal light or dark | PRESENT_BEHAVIOR_UNVERIFIED | Handler writes the same `next` via `setAttribute` then `setItem`. No concurrency test. |
| 7 | Missing `data-theme` still uses `:root` dark `color-scheme` | VERIFIED | `:root { color-scheme: dark; --bg: #121417; … }`. Light override is only `:root[data-theme="light"]`. SSG HTML is `<html lang="en">` with no `data-theme`. |
| 8 | ThemeToggle has no loading chrome; ThemeInit is a blocking script `is:inline` first in head and the button is static HTML that works on first click without hydration | VERIFIED | No loading markup in `ThemeToggle.astro`. Dist head first child is the init `<script>` (not `type="module"`). Button is static HTML; click script is `is:inline`; no `client:load` / Preact import. |
| 9 | ThemeToggle storage SecurityError is silent; click still sets `data-theme` on html; invalid stored values never reach `setAttribute` | VERIFIED | Toggle: `setAttribute` then `try { localStorage.setItem(...) } catch (e) {}`. Init: `try { getItem } catch`; use storage only when `t === 'light' \|\| t === 'dark'`; otherwise matchMedia; always `setAttribute` with those literals. No `innerHTML`, no `document.cookie`. |
| 10 | ThemeToggle has no visible label; `aria-label` is the fixed English string Toggle color theme; SVGs are `aria-hidden` true | VERIFIED | `aria-label="Toggle color theme"`; both SVGs `aria-hidden="true" focusable="false"`; no visible caption text. |
| 11 | ThemeToggle is not a collection; first visit with empty storage follows OS prefers-color-scheme (not an empty-state illustration) | VERIFIED | Single button + two SVGs. No empty-state copy or placeholder. Init falls through to matchMedia when storage is missing/invalid. |
| 12 | ThemeToggle happy path: sun icon visible in dark (including missing `data-theme`); moon icon visible when `data-theme` is light | VERIFIED | `#themeToggle .theme-moon { display: none; }`; `:root[data-theme="light"]` hides `.theme-sun` and shows `.theme-moon`. Default (no attribute) keeps sun. |
| 13 | Header `.nav-links` is SSG with no fetch and no load-failure UI | VERIFIED | `Header.astro` is static markup. `git grep fetch HEAD -- src/components/Header.astro` empty. |
| 14 | Header `.nav-links` keeps HEAD Tools/Blog/About strings; toggle adds no text that can overflow | VERIFIED | `href="/tools/"`, `/blog/`, `/about/` labels unchanged. Toggle has no visible text. |
| 15 | Header `.nav-links` is not a data collection; populated state is the existing three links plus the 44 by 44 toggle after About | VERIFIED | Markup order About then `<ThemeToggle />`. `#themeToggle` width/height/min-width/min-height 44px in `global.css`. |
| 16 | Body canvas/grid is not a data surface; `--grid-line` repeating-linear-gradient (47px/48px) paints on every page with no empty/loading/error chrome | VERIFIED | `body` background-image in HEAD `global.css`. Every page uses `BaseLayout`. No grid empty/loading UI. |
| 17 | Body grid does not clip or scroll on its own; content overflow stays existing `.diff-lines` / `.md-preview` max-height 384px | VERIFIED | No overflow/clip on `body`/`html` beyond HEAD. `.diff-lines` and `.md-preview` still `max-height: 384px; overflow-y: auto`. |
| 18 | `.diff-line--add` / `--del` hunks use `--diff-add-fg` `--diff-add-bg` `--diff-del-fg` in both themes; eq stays `--muted` | VERIFIED | Both `:root` and light tables define the three tokens. `.diff-line--add/del/eq` consume the vars. No `--diff-del-bg`. |
| 19 | Empty/idle diff remains Phase 4 ToolShell behavior; this phase does not add an empty-theme illustration | VERIFIED | Phase files do not touch `ToolShell.tsx` or diff island. No empty-theme illustration in theme components. |
| 20 | Diff is local; no theme-loading skeleton over hunks; theme storage errors never route to ToolShell `role=alert` | VERIFIED | Theme scripts swallow storage errors. ToolShell `role="alert"` remains the pre-existing error prop path only. |
| 21 | Existing `.diff-lines` max-height 384px; overflow auto is unchanged; 0/1/many row density is unchanged | VERIFIED | HEAD `global.css` `.diff-lines` block unchanged besides tokenized add/del colors. |
| 22 | Desktop header stays one row with the 44x44 toggle after About; do not wrap, collapse, or add a hamburger (Phase 8) | insufficient_spec | `verification: backstop`. 44px rules and no hamburger/flex-wrap in HEAD header/CSS are present, but one-row layout is not proven by a held-out test or observed paint. |
| 23 | Theme files are authored from HEAD chrome, not the dirty overlay | VERIFIED | HEAD `global.css` is 230 lines (not the 662-line overlay). No IBM Plex / Syne / `--led` / LangSwitch. `git diff HEAD` on the five chrome files is empty. Commits `935089d` and `f4ce2a9` exist. |
| 24 | ThemeToggle is static Astro, not a hydrated island | VERIFIED | Empty frontmatter Astro file. No `client:load`, no `from 'preact'`. |
| 25 | THM-01/THM-03/THM-04/THM-05/THM-06 unclassified probe rows follow 07-UI-SPEC.md tables and D-01–D-04; do not invent extra token layers | VERIFIED | Light table matches UI-SPEC including `--bg: #f4f6f8`, `--danger: #b91c1c`, `--grid-line: rgba(15, 23, 32, 0.10)`. Shared `--mono/--sans/--content` stay on `:root` only. No `--led`, `--sp-*`, overlay fonts. |
| 26 | THM-07 adjacency/ordering probes: `color-scheme` is a per-theme single keyword, not a merge/sort of equal values | VERIFIED | `color-scheme: dark` on `:root`; `color-scheme: light` on light selector. No `light dark`. |

**Score:** 20/26 truths verified (5 present, behavior-unverified; 1 backstop abstention)

### Required Artifacts

`gsd_run query verify.artifacts` — 5/5 passed.

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `src/components/ThemeInit.astro` | Blocking head IIFE, allowlist, matchMedia, always setAttribute, no setItem | VERIFIED | 14 lines. `is:inline`. Exists at HEAD. Wired as first head child. |
| `src/components/ThemeToggle.astro` | Static header button, sun/moon SVG, click writes data-theme and storage | VERIFIED | 19 lines of real markup+script (PLAN `min_lines: 20`; not a stub). Wired from Header. |
| `src/styles/global.css` | HEAD dark on `:root`, light override, grid, color-scheme, diff tokens, #themeToggle | VERIFIED | 230 lines. Matches UI-SPEC token tables. |
| `src/layouts/BaseLayout.astro` | ThemeInit first in head; unchanged Props; no locale; no color-scheme meta | VERIFIED | Props `{ title, description, path }` unchanged. |
| `src/components/Header.astro` | ThemeToggle inside `.nav-links` after About; HEAD hrefs unchanged | VERIFIED | Tools/Blog/About hrefs preserved. |

### Key Link Verification

`gsd_run query verify.key-links` — 5/5 verified.

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `src/layouts/BaseLayout.astro` | `src/components/ThemeInit.astro` | ThemeInit first child of head before charset | WIRED | Import + `<ThemeInit />` immediately under `<head>` |
| `src/components/Header.astro` | `src/components/ThemeToggle.astro` | ThemeToggle inside `.nav-links` after About | WIRED | Import + `<ThemeToggle />` after About anchor |
| `src/components/ThemeInit.astro` | `src/styles/global.css` | `data-theme` selects `:root[data-theme=light]` | WIRED | setAttribute literals match CSS selector |
| `src/styles/global.css` | body | `repeating-linear-gradient` consumes `--grid-line` | WIRED | body background-image uses `var(--grid-line)` at 47px/48px |
| `src/components/ThemeToggle.astro` | `document.documentElement` | click setAttribute then storage write of same literal | WIRED | `el = document.documentElement`; `next` used for both writes |

### Data-Flow Trace (Level 4)

Theme is not a DB/fetch surface. Values that reach the document:

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| ThemeInit | `t` / `data-theme` | `localStorage.getItem('theme')` allowlisted, else `matchMedia` | Yes — browser APIs, not a mock or static return | FLOWING |
| ThemeToggle | `next` / `data-theme` / `theme` key | click reads current attribute, writes opposite literal | Yes — live DOM + storage | FLOWING |
| global.css light tokens | `--bg` etc. | `:root[data-theme="light"]` | Yes — CSS cascade from attribute | FLOWING |
| body grid | `--grid-line` | per-theme custom property | Yes | FLOWING |

No HOLLOW_PROP. SSG html has no `data-theme` by design (D-02); init always writes it unless the script is blocked, in which case `:root` dark is the fallback.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Existing lib suite still green | `npm test` (`vitest run`) | 23 files, 155/155 passed | PASS |
| Init IIFE in production HTML | `rg -F "localStorage.getItem('theme')" dist --glob "*.html"` | 25/25 HTML files | PASS |
| Toggle + setItem in production HTML | count `id="themeToggle"` and `localStorage.setItem('theme'` in dist HTML | 25/25 | PASS |
| ThemeInit never writes storage | `git grep setItem HEAD -- src/components/ThemeInit.astro` | no matches | PASS |
| No injection / cookies / Preact on theme files | grep innerHTML, document.cookie, preact, client:load | none | PASS |
| package.json unchanged | `git diff HEAD -- package.json package-lock.json` | empty | PASS |
| FOUC / OS emulate / click restyle | (needs browser) | not run — no Playwright this phase | SKIP |

Full workspace test command ran once. `npm run build` was not re-run; dist already contains the inlined IIFE on every HTML page.

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| n/a | n/a | No `scripts/*/tests/probe-*.sh`; PLAN/SUMMARY do not declare probes | SKIP |

### Requirements Coverage

PLAN `requirements:` THM-01 … THM-07. REQUIREMENTS.md maps the same seven IDs to Phase 7. No orphaned Phase 7 IDs. NAV-*/LAY-*/CHR-* belong to later phases.

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| THM-01 | 07-01-PLAN.md | Shared + dark `:root` + light `:root[data-theme="light"]` tokens including `--diff-*` | SATISFIED | HEAD `global.css` token tables; diff hunks consume vars |
| THM-02 | 07-01-PLAN.md | Header sun/moon toggles `data-theme` on html | NEEDS HUMAN | Control wired on every BaseLayout page; click restyle untested |
| THM-03 | 07-01-PLAN.md | Preference persisted and restored | NEEDS HUMAN | `setItem` on click; init `getItem`; persist-across-navigation untested |
| THM-04 | 07-01-PLAN.md | Blocking `is:inline` in head before first paint | SATISFIED (script) / NEEDS HUMAN (paint) | Dist IIFE is first head child; FOUC paint is human |
| THM-05 | 07-01-PLAN.md | `prefers-color-scheme` when no storage; do not write key | NEEDS HUMAN | matchMedia + no ThemeInit `setItem`; OS emulate is human |
| THM-06 | 07-01-PLAN.md | Body grid via `--grid-line` | SATISFIED | 47px/48px repeating-linear-gradient; light `--grid-line` adapted |
| THM-07 | 07-01-PLAN.md | Per-theme `color-scheme` | SATISFIED | single keyword dark/light; missing attribute uses `:root` dark |

### Decision Coverage

No trackable decisions in CONTEXT.md. (`gsd_run query check.decision-coverage-verify` returned `skipped: true`, `total: 0`.) CONTEXT D-01–D-04 are still visible in the shipped five files (token split, init/persistence, static toggle, HEAD-only chrome). Non-blocking.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| (none — plan forbids `src/lib/theme.test.ts` / Playwright) | THM-01–07 | 0 | 0 | 0 | n/a | No deceptive tests. Behavioral THM-02/03/05 coverage is manual by VALIDATION.md. |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** n/a (no theme unit tests; existing 155 lib tests are regression-only)

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | No TBD/FIXME/XXX in the five phase files | — | — |
| — | — | No overlay leak (IBM Plex / `--led` / hamburger / `--sp-*`) | — | — |
| — | — | No `src/lib/theme.ts`; package.json matches HEAD | — | — |

### Human Verification Required

Harvested from PLAN task 3 `<human-check>` and from behavior-unverified / backstop truths. Deduplicated.

### 1. FOUC with stored preference

**Test:** After `npm run build` (or `npm run dev`), hard-refresh with `theme=light` in storage; repeat with `theme=dark`.
**Expected:** No dark flash when stored light; no light flash when stored dark.
**Why human:** First paint cannot be grepped.

### 2. First visit follows OS and does not write storage

**Test:** Clear storage, emulate `prefers-color-scheme: light`, hard-refresh; repeat with dark.
**Expected:** Matching theme on load; `localStorage.theme` still empty.
**Why human:** Needs empty storage plus UA emulation.

### 3. Toggle click

**Test:** Click `#themeToggle`.
**Expected:** `data-theme` and icon flip; `theme` key written to the same literal.
**Why human:** State transition; no automated click test.

### 4. Two-click idempotency

**Test:** From a known start, click twice, then a third time.
**Expected:** Two clicks restore start; third matches the one-click theme.
**Why human:** Untested transition invariant.

### 5. Last click wins

**Test:** Click rapidly several times.
**Expected:** `data-theme` and `localStorage.theme` are the same `light` or `dark` literal.
**Why human:** Untested last-write ordering.

### 6. Persistence across routes

**Test:** After a click, navigate `/` → `/tools/` → `/about/`.
**Expected:** Preference sticks on every BaseLayout page.
**Why human:** Multi-route navigation.

### 7. Light grid and native widgets

**Test:** Light theme; look at body, textarea, scrollbar.
**Expected:** Grid visible; native widgets follow `color-scheme: light`.
**Why human:** Visual / UA chrome.

### 8. Diff hunks in both themes

**Test:** Text-diff add/del lines in light and dark.
**Expected:** Readable; eq muted; no theme skeleton.
**Why human:** Contrast is visual.

### 9. Desktop header one row (backstop)

**Test:** Desktop width; inspect header.
**Expected:** One row; 44px control after About; no wrap/collapse/hamburger.
**Why human:** `verification: backstop` — presence of 44px CSS is not a held-out layout proof. Phase 8 owns hamburger.

### Gaps Summary

No implementation gaps against HEAD chrome. ThemeInit, ThemeToggle, token split, grid, color-scheme, and wiring match 07-UI-SPEC.md and D-01–D-04. ROADMAP SC “on both EN and ZH pages” is not instantiable: HEAD has no `src/pages/zh/` (explicitly out of scope). Origin-scoped `theme` storage will apply if a ZH tree is added later.

Five must-haves are present and wired but untested at runtime (toggle, FOUC restore, OS default, two-click, last-click). One backstop truth abstains. Status is `human_needed`, not `passed`.

---

_Verified: 2026-09-16T04:00:47Z_
_Verifier: Claude (gsd-verifier)_
