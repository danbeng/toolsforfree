---
phase: 10-interactive-chrome
verified: 2026-09-18T04:16:00Z
status: human_needed
score: 12/13 must-haves verified
covered_files:
  - .planning/REQUIREMENTS.md
  - .planning/phases/10-interactive-chrome/10-01-PLAN.md
  - .planning/phases/10-interactive-chrome/10-01-SUMMARY.md
  - src/components/FaqList.astro
  - src/styles/global.css
covered_digest: "v1:sha256:aced620259109517dc8b64635304ba834c9dbbe89383f46ef9350d68d8220e3c"
behavior_unverified: 0
overrides_applied: 0
decision_coverage:
  honored: 0
  total: 0
  not_honored: []
human_verification:
  - test: "On /tools/json-formatter/ (or /tools/uuid-generator/) in dark then light: idle Copy, hover enabled Copy, press, empty-output disabled Copy; hover hamburger (≤640px) and theme toggle"
    expected: "Idle Copy is transparent with accent border and text; hover fills --accent with --bg text, about 120ms, no scale; press is darker than hover, no scale; empty Copy is opacity 0.45 and does not invert; hamburger and theme toggle stay 44px icon chrome and do not fill accent"
    why_human: "Hover, active, disabled invert, and 120ms timing are paint. Playwright and CSS unit tests were prohibited; do not invent viewport results."
  - test: "Tab to Copy; Tab to an FAQ summary (Safari may skip Tab); Enter/Space on a summary"
    expected: "Copy keeps one 2px --accent outline (2px offset); FAQ summary has the same ring; Enter/Space toggles that row only"
    why_human: "Focus rings and native disclosure keyboard behavior are visual / UA."
  - test: "FAQ first paint on a tool page; open one row; leave others; look for the UA triangle"
    expected: "English h2 FAQ; every details closed on first paint; UA disclosure triangle visible; opening one row leaves others as they were; FAQ text is --text, not muted"
    why_human: "Triangle visibility, independent collapse, and first-paint closed state are viewport. Do not invent FAQ results."
  - test: "Both themes: idle Copy accent-on-panel, hover --bg-on-accent, active darkened-accent with --bg text, FAQ summary/answer --text on canvas; panel 1px --border plus small --border shadow; DevTools prefers-reduced-motion: reduce"
    expected: "Those pairs eyeball at WCAG AA 4.5:1; disabled Copy stays 0.45 (exemption); light-theme hovered Copy stays readable (tightest pair); reduced-motion turns the button color transition off. If color-mix is unsupported, active may match hover — still an invert."
    why_human: "verification: backstop — luminance math and CSS presence are not a substitute for human UAT (CHR-07, RESEARCH A3)."
---

# Phase 10: Interactive Chrome Verification Report

**Phase Goal:** Buttons, tool panels, and FAQs feel polished and readable in both themes
**Verified:** 2026-09-18T04:16:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

Worked from committed HEAD chrome (`src/styles/global.css`, `src/components/FaqList.astro`). `git diff HEAD --` on those two paths is empty. Phase commits `1894858` and `d6059ca` touch only those files. Dirty overlay (`LangSwitch.astro`, `src/pages/zh/`, dirty `src/components/ToolShell.tsx`) is not the implementation. `git show HEAD:src/components/ToolShell.tsx` is the Copy/shell contract this phase CSS targets.

Do not treat SUMMARY.md as evidence. Hover, active, FAQ triangle, and 4.5:1 contrast were not observed this pass.

## Goal Achievement

### Observable Truths

Must-haves are the four ROADMAP success criteria plus PLAN frontmatter truths that do not restate those criteria. ROADMAP wording wins where PLAN restates an SC. PLAN truth with `verification: backstop` is folded into SC4.

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | Visitor sees button hover, pressed (`:active`), and keyboard `:focus-visible` states using the site accent | ✓ VERIFIED | `.tool-panel button:hover:not(:disabled)` invert (`background: var(--accent); color: var(--bg)`); `:active:not(:disabled)` `color-mix(in srgb, var(--accent) 72%, #000000)`; 120ms color transition; no `transform:`; no file-start `button:hover`. `#navToggle` / `#themeToggle` stay 44px transparent. Global `a:focus-visible, button:focus-visible` 2px `--accent` unchanged; no `.tool-panel button:focus`. Appearance remains Human Verification. |
| 2 | Visitor sees tool panels with consistent borders and shadows that remain readable in both light and dark themes | ✓ VERIFIED | `.tool-panel` is `border: 1px solid var(--border)`, `box-shadow: 0 1px 2px var(--border)`, `padding: var(--sp-4)`, `border-radius: 8px`. `--border` / `--panel` switch under `:root` vs `:root[data-theme="light"]`. Readability at 4.5:1 is SC4. |
| 3 | Visitor can expand and collapse FAQ items natively, with a visible open/close indicator | ✓ VERIFIED | `FaqList.astro` is items-only Props, English `h2` FAQ, `div.faq`, one `<details>` / `<summary>` / `<p>` per item. No `open`, no `name=`, no `<dl>`. `.faq summary::marker { color: var(--text) }`; no `webkit-details-marker`, no `list-style` on `.faq summary`. Triangle paint is Human Verification. |
| 4 | Chrome text and controls meet WCAG AA contrast (4.5:1) in both themes | ⚠️ insufficient_spec | PLAN `verification: backstop`. No held-out contrast test (prohibited). Presence of `--accent` / `--bg` / `--text` tokens is not explicit evidence. RESEARCH A3: local luminance math is not a substitute. |
| 5 | Empty output: Copy is disabled at opacity 0.45 with not-allowed cursor; hover and press do not invert | ✓ VERIFIED | HEAD `ToolShell` `disabled={!props.output}`. `.tool-panel button:disabled { opacity: 0.45; cursor: not-allowed }`. Hover/active are `:not(:disabled)`. Dist `json-formatter` SSG Copy is `<button type="button" disabled>Copy</button>` inside `.tool-panel`. |
| 6 | FAQ items=[] paints English h2 FAQ plus an empty `.faq` wrapper only; no extra empty copy | ✓ VERIFIED | `FaqList.astro` always emits `<h2>FAQ</h2><div class="faq">` then maps items. No "No questions" string. Live schema `faq.min(3)` so production pages are populated. |
| 7 | No fetch or spinner for Copy or FAQ | ✓ VERIFIED | `FaqList.astro` is static Astro. HEAD `onCopy` is `clipboard.writeText`. No `fetch(` / spinner in those files. |
| 8 | Tool parse errors stay existing `.tool-error` `role=alert`; this phase adds no clipboard-failure UI | ✓ VERIFIED | HEAD `ToolShell` `{props.error ? <p class="tool-error" role="alert">…`. Phase commits do not touch `ToolShell.tsx`. `onCopy` has no failure UI. |
| 9 | One details row per `{ question, answer }`; many stack with `--sp-4` between items | ✓ VERIFIED | `items.map` → one `<details>` each. `.faq details { margin: 0 0 var(--sp-4) }`. Dist `json-formatter` has three independent `<details>` from markdown. |
| 10 | FAQ question and answer wrap with overflow-wrap anywhere; no ellipsis | ✓ VERIFIED | `.faq summary` and `.faq details > p` set `overflow-wrap: anywhere`. No `ellipsis` / `text-overflow` in `global.css`. |
| 11 | `prefers-reduced-motion: reduce` turns the button color transition off | ✓ VERIFIED | `@media (prefers-reduced-motion: reduce) { .tool-panel button { transition: none; } }`. Runtime emulation is Human Verification. |
| 12 | Files are authored from HEAD chrome; do not apply stash entries; do not commit the ZH page tree or the locale switcher; do not edit the Preact tool-panel shell | ✓ VERIFIED | Phase commits only `FaqList.astro` + `global.css`. `git ls-files` has no `src/pages/zh` or `LangSwitch.astro`. Stashes still `gsd-phase7-overlay-chrome-temp` and `pre-02-01-merge unrelated i18n`. `git log 1894858^..HEAD -- src/components/ToolShell.tsx` empty. |
| 13 | Zero new npm packages; no Playwright; no jsdom switch; no CSS unit tests; no src/lib edits; no Tailwind | ✓ VERIFIED | `git diff HEAD -- package.json package-lock.json src/data/tools.ts` empty. `vitest.config.ts` `environment: 'node'`. No Playwright in `package.json`. `jsdom` already on HEAD. No `src/lib/chrome.ts`. Phase diff `1894858^..d6059ca` does not touch `src/lib`. |

**Score:** 12/13 truths verified (0 present, behavior-unverified; 1 backstop abstained)

### Required Artifacts

`gsd_run query verify.artifacts` returned `valid`. Manual three-level check:

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/styles/global.css` | `.tool-panel` shadow and `--sp-4` padding; `.tool-panel button` hover/active/disabled; `.faq` details/summary/marker/focus | ✓ VERIFIED | Exists, 398 lines (>250). Token block and FAQ chrome match 10-UI-SPEC. Wired via `BaseLayout` stylesheet. Dist `_astro/BaseLayout.DA7NxT92.css` contains `color-mix`, `summary::marker`, `:hover:not(:disabled)`. |
| `src/components/FaqList.astro` | HEAD items-only Props; English h2 FAQ; native details/summary/p in `div.faq` | ✓ VERIFIED | 16 lines, not a stub. Matches UI-SPEC Markup. Consumed by HEAD `src/pages/tools/[slug].astro`. |

### Key Link Verification

`gsd_run query verify.key-links` returned `invalid` (schema/CLI). Manual:

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `src/components/FaqList.astro` | `src/pages/tools/[slug].astro` | HEAD caller already passes `items={page.data.faq}`; this phase does not edit the page | ✓ WIRED | HEAD page: `import FaqList` + `<FaqList items={page.data.faq} />`. Dirty worktree extra `heading={copy.faq}` is unused (items-only Props) and uncommitted. |
| `src/styles/global.css` | `.tool-panel button` | `:hover:not(:disabled)` invert and `:active:not(:disabled)` color-mix; Copy stays unclassed in HEAD ToolShell | ✓ WIRED | Selectors present. HEAD Copy is unclassed `<button>` inside `div.tool-panel`. Island buttons (e.g. UuidGenerator Generate) are also `.tool-panel button`. |
| `src/styles/global.css` | `.tool-panel` | `box-shadow: 0 1px 2px var(--border)`; `padding: var(--sp-4)` | ✓ WIRED | Both declarations on `.tool-panel`. |
| `src/styles/global.css` | `.faq summary::marker` | UA triangle colored with `--text`; summary focus-visible 2px accent | ✓ WIRED | `summary::marker` and `.faq summary:focus-visible` present. Markup uses `<summary>`. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `FaqList.astro` | `items` | `page.data.faq` from `getCollection('toolPages')` | Yes — markdown `faq` arrays (schema min 3 / max 5). Dist `json-formatter` shows three real Q&As | ✓ FLOWING |
| `FaqList.astro` | `item.question` / `item.answer` | Astro text interpolation `{item.question}` / `{item.answer}` (not `set:html`) | Yes — escaped text nodes | ✓ FLOWING |
| HEAD `ToolShell` Copy | `props.output` | island lib result | Yes — disabled when empty; not a static mock | ✓ FLOWING |
| Panel / button / FAQ chrome | CSS variables | `:root` / `[data-theme="light"]` | Theme tokens, not a mock | ✓ FLOWING (paint unobserved) |

No fetch/API for FAQ or Copy. No HOLLOW_PROP. Untracked ZH tree is not the data path.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------- |
| Existing Vitest suite | `npm test` | 23 files, 155 tests passed | ✓ PASS |
| Hover/active selectors | source `global.css` | `button:hover:not(:disabled)`, `button:active:not(:disabled)`, `color-mix(in srgb, var(--accent) 72%, #000000)` | ✓ PASS |
| Panel chrome | source `global.css` | `box-shadow: 0 1px 2px var(--border)`, `padding: var(--sp-4)`, `border-radius: 8px` | ✓ PASS |
| FAQ markup | `FaqList.astro` | `details` / `summary` / `class="faq"` / `FAQ`; no `dt>` / `open` / `name=` | ✓ PASS |
| FAQ CSS | source `global.css` | `summary::marker`, `.faq summary:focus-visible`, `.faq details` margin `--sp-4` | ✓ PASS |
| Dist HTML survived SSG | `rg -l details\|tool-panel dist --glob *.html` | 18 HTML files each | ✓ PASS |
| Dist FAQ + Copy shape | `dist/tools/json-formatter/index.html` | `<h2>FAQ</h2><div class="faq"><details>…`; Copy `disabled` inside `.tool-panel`; no LED | ✓ PASS |
| No `src/lib/chrome.ts` | `test ! -f` | absent | ✓ PASS |
| Packages / TOOLS unchanged | `git diff HEAD -- package.json package-lock.json src/data/tools.ts` | empty | ✓ PASS |
| Overlay stashes remain | `git stash list` | both named entries | ✓ PASS |
| Vitest still node | `vitest.config.ts` | `environment: 'node'` | ✓ PASS |
| Hover / FAQ / contrast viewport | (Playwright prohibited) | not run | ? SKIP — Human Verification |

Did not run `npm run build` this pass (SUMMARY isolated overlay for SSG; restored dirty tree is known to fail). Existing `dist/` HTML matches HEAD chrome (details + unclassed Copy). SUMMARY's "155 tests" do not exercise hover or contrast.

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No `scripts/*/tests/probe-*.sh`; PLAN/SUMMARY do not declare probes | N/A |

### Requirements Coverage

PLAN `requirements:` CHR-01 … CHR-07. REQUIREMENTS.md maps the same seven IDs to Phase 10. No orphaned Phase 10 IDs. THM-* / NAV-* / LAY-* belong to earlier phases.

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| CHR-01 | 10-01-PLAN.md | Button `:hover` with visible background/color transition | ✓ SATISFIED (code) | `.tool-panel button:hover:not(:disabled)` invert + 120ms; no global `button:hover`. Paint is Human Verification. |
| CHR-02 | 10-01-PLAN.md | Button `:active` pressed appearance (darken, no scale) | ✓ SATISFIED (code) | `:active:not(:disabled)` color-mix; no `transform:`. Paint is Human Verification. |
| CHR-03 | 10-01-PLAN.md | `:focus-visible` ring consistent with site accent | ✓ SATISFIED (code) | Existing `a:focus-visible, button:focus-visible`; `.faq summary:focus-visible` matches; no extra outline on `.tool-panel button`. |
| CHR-04 | 10-01-PLAN.md | Tool-panel border/shadow refined for both themes | ✓ SATISFIED | 1px `--border` + `0 1px 2px var(--border)` + `--sp-4` padding + 8px radius. |
| CHR-05 | 10-01-PLAN.md | FAQ rewritten from `<dl>` to `<details>/<summary>` | ✓ SATISFIED | `FaqList.astro` native disclosures; dist HTML has `<details>`. |
| CHR-06 | 10-01-PLAN.md | FAQ `<details>` styled with open/close indicator | ✓ SATISFIED (code) | `summary::marker`; triangle not removed. Visibility is Human Verification. |
| CHR-07 | 10-01-PLAN.md | All chrome elements sufficient contrast in both themes (WCAG AA 4.5:1) | ? NEEDS HUMAN | Backstop. No automated contrast proof. |

### Decision Coverage

No trackable decisions in CONTEXT.md.

CONTEXT.md has a markdown `<decisions>` section, but `check.decision-coverage-verify` returned `{ skipped: true, reason: "no trackable decisions", total: 0 }`. Non-blocking. D-01…D-04 intent is visible in the shipped CSS/markup (scoped `.tool-panel button`, `--border` shadow, native FAQ, HEAD-only commits).

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| — | CHR-01…CHR-07 | n/a | n/a | n/a | n/a | Plan prohibited Playwright, jsdom switch, and CSS unit tests. `npm test` is pre-existing lib/island coverage (155 pass) and does not prove chrome. |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** chrome has no dedicated tests by plan — ℹ️ Info, not a blocker

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `src/styles/global.css` | — | No TBD / FIXME / XXX / TODO | — | Clean |
| `src/components/FaqList.astro` | — | No stubs; text interpolation only | — | Clean |
| `src/components/ToolShell.tsx` (worktree) | — | Dirty overlay LED / locale (uncommitted) | ℹ️ Info | Not in phase commits. HEAD shell is the contract. |

**Anti-patterns:** 0 blockers, 0 warnings

### Prohibitions

| Statement | Status | Evidence |
| --------- | ------ | -------- |
| Do not commit overlay ZH pages or the locale switcher (D-04) | held | `git ls-files` empty for `src/pages/zh` and `LangSwitch.astro`; phase commits do not list them |
| Do not edit or stage the Preact tool-panel shell (D-02, D-04) | held | Phase commits omit `ToolShell.tsx`; index empty; worktree dirty overlay is unstaged |
| Do not add a network endpoint for FAQ or Copy (privacy) | held | No `src/pages/api`; Copy/FAQ have no `fetch` |
| Do not pop stash@{0} or stash@{1} (D-04) | held | Both named stashes still listed |

### Human Verification Required

Harvested from PLAN task 3 `<human-check>` (`workflow.human_verify_mode = end-of-phase`) plus the CHR-07 backstop. Do not invent viewport results.

### 1. Copy hover / active / disabled and header icon chrome

**Test:** On `/tools/json-formatter/` (or `/tools/uuid-generator/`) in dark then light: idle Copy, hover enabled Copy, press, empty-output disabled Copy; hover hamburger (≤640px) and theme toggle
**Expected:** Idle Copy is transparent with accent border and text; hover fills `--accent` with `--bg` text, about 120ms, no scale; press is darker than hover, no scale; empty Copy is opacity 0.45 and does not invert; hamburger and theme toggle stay 44px icon chrome and do not fill accent
**Why human:** Hover, active, disabled invert, and 120ms timing are paint. Playwright and CSS unit tests were prohibited.

### 2. Keyboard focus on Copy and FAQ summary

**Test:** Tab to Copy; Tab to an FAQ summary (Safari may skip Tab); Enter/Space on a summary
**Expected:** Copy keeps one 2px `--accent` outline (2px offset); FAQ summary has the same ring; Enter/Space toggles that row only
**Why human:** Focus rings and native disclosure keyboard behavior are visual / UA (RESEARCH A4).

### 3. FAQ first paint, triangle, independent rows

**Test:** FAQ first paint on a tool page; open one row; leave others; look for the UA triangle
**Expected:** English h2 FAQ; every details closed on first paint; UA disclosure triangle visible; opening one row leaves others as they were; FAQ text is `--text`, not muted
**Why human:** Triangle visibility and independent collapse are viewport. Do not invent FAQ results.

### 4. Contrast 4.5:1 both themes and reduced-motion

**Test:** Both themes: idle Copy accent-on-panel, hover `--bg`-on-accent, active darkened-accent with `--bg` text, FAQ summary/answer `--text` on canvas; panel 1px `--border` plus small `--border` shadow; DevTools `prefers-reduced-motion: reduce`
**Expected:** Those pairs eyeball at WCAG AA 4.5:1; disabled Copy stays 0.45 (exemption); light-theme hovered Copy stays readable (tightest pair); reduced-motion turns the button color transition off. If color-mix is unsupported, active may match hover — still an invert
**Why human:** `verification: backstop` — presence checks cannot prove 4.5:1 (CHR-07, RESEARCH A3).

### Gaps Summary

**No implementation gaps found.** Native FAQ markup, `.tool-panel` `--border` shadow / `--sp-4` padding, and scoped invert hover / color-mix active are in HEAD `FaqList.astro` and `global.css`. Overlay ZH / LangSwitch / dirty ToolShell were not committed.

Phase goal is not fully certified until a human confirms hover/active/FAQ/contrast. Status is `human_needed` (1 backstop abstention + harvested visual checks). Automated score 12/13.

---

_Verified: 2026-09-18T04:16:00Z_
_Verifier: Claude (gsd-verifier)_
