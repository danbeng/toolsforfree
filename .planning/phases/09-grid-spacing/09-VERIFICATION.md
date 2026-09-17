---
phase: 09-grid-spacing
verified: 2026-09-17T19:43:01Z
status: human_needed
score: 18/20 must-haves verified
covered_files:
  - .planning/REQUIREMENTS.md
  - .planning/phases/09-grid-spacing/09-01-PLAN.md
  - .planning/phases/09-grid-spacing/09-01-SUMMARY.md
  - src/components/ToolCard.astro
  - src/pages/index.astro
  - src/pages/tools/index.astro
  - src/styles/global.css
covered_digest: "v1:sha256:61da956931560278c0e06aa3046afdcc1cbe26b487aef424cb146212a311cb7c"
behavior_unverified: 0
overrides_applied: 0
decision_coverage:
  honored: 0
  total: 0
  not_honored: []
human_verification:
  - test: "DevTools width 719px on / and /tools/"
    expected: "Home featured and each /tools/ category .card-grid are one column"
    why_human: "Column count is paint at a real viewport. Playwright and layout.test.ts were prohibited; CSS presence is not observed layout."
  - test: "DevTools width 720px and 1079px on / and /tools/; open /tools/markdown-preview/ (or text-diff)"
    expected: "Catalog .card-grid is two columns; .tool-grid.split stays two columns, not three"
    why_human: "Mid-width catalog vs in-tool split is a viewport check. Do not invent 720/1079 results."
  - test: "DevTools width 1080px on / and /tools/"
    expected: "Catalog .card-grid is three columns inside --content 52rem; no card overlap; no horizontal page scroll from the grid"
    why_human: "verification: backstop — 3-col fit, overlap, and sideways scroll cannot be inferred from media-query text."
  - test: "Open /tools/#category-auth at 1080px"
    expected: "The single Auth card occupies the first track only and does not stretch to full wrap width"
    why_human: "One-item track occupancy is paint; grep cannot see stretch vs first-cell."
  - test: "Hover a catalog card in light and dark themes"
    expected: "Title and description turn --accent; border and fill stay idle"
    why_human: "Hover appearance is visual."
  - test: "Tab onto a catalog card"
    expected: "Existing 2px accent outline (a:focus-visible)"
    why_human: "Focus ring is visual / keyboard."
  - test: "Toggle theme on the catalog"
    expected: "Cards use that theme's --panel / --border / --text"
    why_human: "Theme restyle of card chrome is visual."
---

# Phase 9: Grid & Spacing Verification Report

**Phase Goal:** Catalog cards use a three-column layout on wide screens and spacing follows one token scale
**Verified:** 2026-09-17T19:43:01Z
**Status:** human_needed
**Re-verification:** No — initial verification

Worked from committed HEAD chrome (`src/pages/index.astro`, `src/pages/tools/index.astro`, `src/components/ToolCard.astro`, `src/styles/global.css`). `git diff HEAD --` on those four paths is empty. Dirty overlay (`LangSwitch.astro`, `src/pages/zh/`) is untracked and is not the implementation. Post-review CR-01 (`ecac093`) scopes catalog rules to `.card-grid:not(.tool-grid)` and `a.tool-card`.

Do not treat SUMMARY.md, `dist/` CSS, or untracked ZH pages as evidence. Viewport widths 719 / 720 / 1079 / 1080 were not observed this pass.

## Goal Achievement

### Observable Truths

Must-haves are the three ROADMAP success criteria plus PLAN frontmatter truths that do not restate those criteria. ROADMAP wording wins where PLAN restates an SC. PLAN truth with `verification: backstop` is folded into SC1.

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | Visitor viewing home/catalog at ≥1080px sees a 3-column card grid; the existing 2-column layout at ≥720px and <1080px is unchanged | insufficient_spec | Source: `.card-grid:not(.tool-grid)` is 1-col `minmax(0, 1fr)`, 2-col at `min-width: 720px`, 3-col at `min-width: 1080px`. No `auto-fit` / `auto-fill` / flex-wrap. Tagged `verification: backstop`. Presence of media queries is not a held-out test or observed paint. |
| 2 | Visitor sees consistent gaps, padding, and margins on touched layout (the 4/8/12/16/24/32/48px rhythm) instead of one-off pixel values | ✓ VERIFIED | `:root` `--sp-1`…`--sp-12` = 4/8/12/16/24/32/48/64/80/96/120/144px before `:root[data-theme="light"]` (no `--sp-*` under light). Touched selectors consume tokens: `.card-grid` gap `--sp-4`, `a.tool-card` padding `--sp-4`, `.wrap` `padding: 0 var(--sp-4)`, `.nav` `gap: var(--sp-5)`. Untouched literals remain (`#navToggle`/`#themeToggle` 44px, overlay 16px/8px, `.tool-grid` `gap: 1rem`, footer rem, `--content: 52rem`). |
| 3 | Cards and sections do not overlap or collapse after spacing tokens replace hardcoded values in those selectors | ? UNCERTAIN | Mitigations present (`minmax(0, 1fr)`, item `min-width: 0`, `overflow-wrap: anywhere`, `h2:has(+ .card-grid)` / `main section` spacing). Overlap/collapse is paint. Harvested into Human Verification; no viewport observed. |
| 4 | Existing in-tool `.tool-grid` stays 1-col default / 2-col at min-width 720px and does not gain a 1080px track | ✓ VERIFIED | `.tool-grid { gap: 1rem }` and `@media (min-width: 720px) { .tool-grid.split { grid-template-columns: 1fr 1fr } }` only. The 1080px rule is `.card-grid:not(.tool-grid)`. WordCounter/TextDiff metric tiles use `class="tool-grid card-grid"` + `div.tool-card` and therefore miss both catalog rules (CR-01). MarkdownPreview/QrCode use `tool-grid split` only. |
| 5 | `:root` defines `--sp-1` through `--sp-12` as 4/8/12/16/24/32/48/64/80/96/120/144px next to color tokens and not under the light theme selector | ✓ VERIFIED | `src/styles/global.css` lines 18–29 inside `:root`; light block lines 32–45 overrides colors only. |
| 6 | `.card-grid` gap is `var(--sp-4)`; `.tool-card` padding is `var(--sp-4)`; `.wrap` horizontal padding is `var(--sp-4)`; `.nav` gap is `var(--sp-5)` | ✓ VERIFIED | Matching declarations in `global.css` (catalog grid scoped as `.card-grid:not(.tool-grid)`; padding on `a.tool-card`). |
| 7 | SSG catalog is never empty; `getToolsByCategory` already drops zero-tool groups; do not render empty-grid chrome, No tools copy, a placeholder card, or a tooltip | ✓ VERIFIED | `getToolsByCategory` filters `g.tools.length > 0`. Catalog pages have no "No tools" / placeholder / tooltip. Dist `index.html`: 6 `tool-card`. Dist `tools/index.html`: 7 category sections, 18 `tool-card`. |
| 8 | First paint is the populated grid; no fetch, skeleton, or spinner | ✓ VERIFIED | `index.astro` / `tools/index.astro` map SSG arrays. No `fetch`, skeleton, or spinner on those pages. |
| 9 | Layout is CSS plus markup only; no `role=alert` and no error copy for grid | ✓ VERIFIED | Catalog pages are static Astro. No `role="alert"` on home or tools index. |
| 10 | Home featured is six ToolCards in one `.card-grid`; each `/tools/` category section has its own `.card-grid` of that category's tools | ✓ VERIFIED | Home: `h2` Featured tools then `div.card-grid` around `featured.map`. Tools index: each `section` wraps `g.tools.map` in `div.card-grid`. Named test `features exactly six tools including json-formatter and jwt-decoder` passed. Dist HTML: 1 featured grid / 7 category grids. |
| 11 | Every HEAD card has name plus shortDescription; no optional card fields this phase | ✓ VERIFIED | `ToolCard.astro`: `<a class="tool-card">` + `tool.name` + `tool.shortDescription`. No `locale` prop, no eyebrow. |
| 12 | Cards use `min-width: 0` and `overflow-wrap: anywhere` so titles and descriptions wrap; the grid does not scroll the page sideways | ✓ VERIFIED | `a.tool-card` has `min-width: 0` and `overflow-wrap: anywhere`; tracks are `minmax(0, 1fr)`. Sideways scroll at 1080px remains in Human Verification (backstop); mechanism is in source. |
| 13 | Zero never paints; one card occupies the first track only and does not stretch to full wrap width; many fill 1 / 2 / 3 columns per breakpoint | ✓ VERIFIED | Empty groups dropped. Auth is one tool (`jwt-decoder`) in its own `.card-grid`; no `grid-column` span / `justify-items` override. Column counts at breakpoints are the SC1 backstop (Human Verification). |
| 14 | Card title and description wrap inside the track with no ellipsis; nav gap token swap adds no text; `.nav a.logo` `font-weight: 650` is unchanged | ✓ VERIFIED | No `text-overflow` / `ellipsis` on catalog rules. `.nav` gap retokenized with no extra copy. `font-weight: 650` still on `.nav a.logo`. |
| 15 | Idle `.tool-card` color is `var(--text)`; hover text is `var(--accent)` only; no hover fill, no hover border-color, no `:active` scale | ✓ VERIFIED | `a.tool-card { color: var(--text) }`; `a.tool-card:hover { color: var(--accent) }` only. No hover `background` / `border-color`, no `:active`. Focus inherits `a:focus-visible` 2px accent. |
| 16 | `h2:has(+ .card-grid)` margin-bottom is `var(--sp-4)` as progressive enhancement with no polyfill; grid columns still work if `:has()` is absent | ✓ VERIFIED | Rule present. No `:has` polyfill script. Column rules are on `.card-grid:not(.tool-grid)`, independent of `:has()`. |
| 17 | HEAD featured and category map order is unchanged; this phase does not edit or reorder TOOLS | ✓ VERIFIED | Phase commits `abe7151`, `7332634`, `ecac093` do not touch `src/data/tools.ts` or `src/data/tools.test.ts`. Dist featured order matches `TOOLS.filter(featured)`. |
| 18 | Flagged assumption (LAY-01): column counts are CSS Grid on `.card-grid` at 1 / 2 / 3 tracks, not a SPEC.md shape table | ✓ VERIFIED | Explicit `display: grid` + `repeat(2\|3, minmax(0, 1fr))`. No shape table, no JS column counter. |
| 19 | Files are authored from HEAD chrome; do not apply stash entries; do not commit the ZH page tree or the locale switcher | ✓ VERIFIED | In-scope paths match HEAD (empty diff). `git ls-files` has no `src/pages/zh` or `LangSwitch.astro`. Stashes still `gsd-phase7-overlay-chrome-temp` and `pre-02-01-merge unrelated i18n`. Home copy is Featured tools / View all tools, not overlay hero/kicker. |
| 20 | Zero new npm packages; no Playwright; no jsdom switch; no `layout.test.ts`; no `src/lib/layout.ts`; no Tailwind | ✓ VERIFIED | `git diff HEAD -- package.json package-lock.json` empty. No Playwright dep. `vitest.config.ts` `environment: 'node'`. `src/lib/layout.ts` and `src/layout.test.ts` absent. |

**Score:** 18/20 truths verified (0 present, behavior-unverified; 1 backstop abstention; 1 visual uncertain)

### Required Artifacts

`gsd_run query verify.artifacts` — 4/4 passed.

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/styles/global.css` | `--sp-1`…`--sp-12` on `:root`; `.card-grid` 1/2/3-col; layout-only card chrome; retokenized wrap/nav | ✓ VERIFIED | Exists, substantive (344 lines). CR-01 selectors `.card-grid:not(.tool-grid)` and `a.tool-card`. Wired via BaseLayout CSS. |
| `src/pages/index.astro` | HEAD home chrome; featured map wrapped in `.card-grid` | ✓ VERIFIED | `h1` SITE_NAME, tagline, category anchors, Featured tools, `div.card-grid`, View all tools. |
| `src/pages/tools/index.astro` | HEAD tools index; one `.card-grid` per category section | ✓ VERIFIED | `h1` All tools; `section id={idFor}` + `h2` + `div.card-grid`. |
| `src/components/ToolCard.astro` | HEAD `<a class="tool-card">` with name + shortDescription; no locale | ✓ VERIFIED | Unchanged vs HEAD (not in phase diffs). Consumed by both catalog pages. |

### Key Link Verification

`gsd_run query verify.key-links` — 5/5 verified.

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `src/pages/index.astro` | `src/components/ToolCard.astro` | featured.map ToolCard inside `div.card-grid` after h2 Featured tools | ✓ WIRED | Import + map inside `.card-grid` |
| `src/pages/tools/index.astro` | `src/components/ToolCard.astro` | each category section wraps `g.tools.map` in `div.card-grid` | ✓ WIRED | Pattern `card-grid` in each section |
| `src/styles/global.css` | `.card-grid` | `@media (min-width: 1080px) repeat(3, minmax(0, 1fr))` | ✓ WIRED | Scoped as `.card-grid:not(.tool-grid)` after CR-01 |
| `src/styles/global.css` | `:root` | `--sp-1` through `--sp-12` after color/diff tokens | ✓ WIRED | `--sp-1:` present on `:root` |
| `src/components/ToolCard.astro` | `src/styles/global.css` | `a.tool-card` consumes layout-only chrome | ✓ WIRED | Markup `class="tool-card"` on `<a>`; CSS `a.tool-card` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `index.astro` | `featured` | `getFeaturedTools()` → `TOOLS.filter(featured)` | Yes — 6 registry tools | ✓ FLOWING |
| `index.astro` / `tools/index.astro` | `groups` | `getToolsByCategory()` drops empty categories | Yes — 7 non-empty groups, 18 tools | ✓ FLOWING |
| `ToolCard.astro` | `tool.name` / `tool.shortDescription` / `tool.slug` | `Astro.props.tool` from those maps | Yes — dist HTML shows real names and `/tools/{slug}/` hrefs | ✓ FLOWING |
| Catalog CSS | column count | `@media min-width` 720 / 1080 | Viewport CSS, not a mock | ✓ FLOWING (paint unobserved) |

No fetch/API. No HOLLOW_PROP. Untracked `src/pages/zh/` overlay is not the data path.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------- |
| Featured count is six | `npx vitest run src/data/tools.test.ts -t "features exactly six tools"` | 1 passed, 6 skipped | ✓ PASS |
| Catalog wrappers in production HTML | `rg card-grid/tool-card dist/index.html dist/tools/index.html` | index: 1 grid / 6 cards; tools: 7 grids / 18 cards | ✓ PASS |
| CR-01 source selectors | `rg card-grid:not / a.tool-card src/styles/global.css` | present at lines 173–217 | ✓ PASS |
| `.tool-grid` has no 1080px track | `rg min-width: 1080px` vs `.tool-grid` | 1080px only on `.card-grid:not(.tool-grid)` | ✓ PASS |
| `--sp-1`…`--sp-12` before light selector | line order in `global.css` | `--sp-12` at 29; light selector at 32 | ✓ PASS |
| No `src/lib/layout.ts` / Playwright / TOOLS edit | file + `git diff HEAD -- package.json src/data/tools.ts` | absent / empty | ✓ PASS |
| Overlay not committed | `git ls-files src/pages/zh LangSwitch.astro`; `git stash list` | untracked; both named stashes remain | ✓ PASS |
| Dist CSS equals CR-01 source | `rg card-grid:not dist/**/*.css` | gitignored `dist` CSS still has unscoped `.card-grid` / `.tool-card` from an older build | ℹ️ INFO — not a source gap |
| Viewport 719 / 720 / 1079 / 1080 | (needs browser; Playwright prohibited) | not run | ? SKIP — Human Verification |

Did not re-run the full Vitest suite. Did not run `npm run build`. SUMMARY's "155 tests" do not exercise column counts.

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No `scripts/*/tests/probe-*.sh`; PLAN/SUMMARY do not declare probes | N/A |

### Requirements Coverage

PLAN `requirements:` LAY-01, LAY-02, LAY-03. REQUIREMENTS.md maps the same three IDs to Phase 9. No orphaned Phase 9 IDs. THM-* / NAV-* belong to earlier phases; CHR-* belongs to Phase 10.

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| LAY-01 | 09-01-PLAN.md | Card grid 3-column at ≥1080px; existing 720px 2-col unchanged | ? NEEDS HUMAN | CSS Grid 1/2/3 on `.card-grid:not(.tool-grid)`; `.tool-grid` stays 720-only. Column paint is the backstop UAT. |
| LAY-02 | 09-01-PLAN.md | `--sp-1` through `--sp-12` 4/8/12/16/24/32/48/64/80/96/120/144px | ✓ SATISFIED | Twelve properties on `:root` only |
| LAY-03 | 09-01-PLAN.md | Hardcoded spacing on touched selectors migrated to tokens | ✓ SATISFIED (tokens) / ? NEEDS HUMAN (no overlap) | wrap/nav/grid/card consume `--sp-*`. Overlap after swap is visual. |

### Decision Coverage

No trackable decisions in CONTEXT.md.

`gsd_run query check.decision-coverage-verify` returned `skipped: true`, `total: 0`, `blocking: false`. CONTEXT groups (Catalog grid markup, Spacing scale tokens, Card chrome, HEAD vs overlay) are still visible in the shipped four files. Gate is non-blocking.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `src/data/tools.test.ts` | LAY-01 populated (six featured) | 1 named | 6 in that file | no | Value (length 6) | Registry only — does not prove 3-col CSS |
| none | LAY-01 columns / LAY-03 overlap | 0 | 0 | no | — | Phase forbids Playwright and `layout.test.ts` |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** SUMMARY D1/D2 cite `npm test (155 tests)` for LAY-01/LAY-03. Those tests do not cover grid columns or overlap. Warning only; not a blocker. Human UAT is the column evidence.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | No TBD/FIXME/XXX in phase files | — | — |
| `dist/_astro/BaseLayout.*.css` | — | Unscoped `.card-grid` / `.tool-card` | ℹ️ Info | Gitignored stale build; source `ecac093` is scoped. Rebuild before visual UAT so islands are not restyled. |
| `src/pages/zh/**`, `LangSwitch.astro` | — | Dirty overlay | ℹ️ Info | Untracked; not in phase commits |

CR-01 (09-REVIEW.md): unscoped catalog rules would 3-col WordCounter/TextDiff metric tiles. HEAD source now uses `.card-grid:not(.tool-grid)` and `a.tool-card`. In-tool islands were not edited.

### Prohibitions

| Statement | Status | Evidence |
| --------- | ------ | -------- |
| Do not commit overlay ZH catalog pages or the locale switcher | held | `git ls-files` empty for `src/pages/zh` and `LangSwitch.astro`; phase commits are the four in-scope paths only |
| Do not add a network endpoint or upload path for catalog cards | held | Catalog is SSG `<a href="/tools/{slug}/">`; no new API route |
| Do not persist grid or spacing state in web storage | held | No `localStorage` / `sessionStorage` on catalog pages or `global.css` |

### Human Verification Required

Harvested from PLAN task 3 `<human-check>` and from SC1 backstop / SC3 overlap. Do not invent viewport results.

### 1. One column below 720px

**Test:** DevTools width 719px on `/` and `/tools/`.
**Expected:** Home featured and each `/tools/` category `.card-grid` are one column.
**Why human:** Column count is paint; Playwright prohibited.

### 2. Two columns at 720px and 1079px; in-tool split stays two

**Test:** Width 720px and 1079px; open `/tools/markdown-preview/` (or text-diff).
**Expected:** Catalog grids two columns; `.tool-grid.split` still two, not three.
**Why human:** Needs real viewport.

### 3. Three columns at 1080px; no overlap; no sideways scroll (backstop)

**Test:** Width 1080px on `/` and `/tools/`.
**Expected:** Three columns inside `--content` 52rem; no card overlap; no horizontal page scroll from the grid.
**Why human:** `verification: backstop` — presence of `repeat(3, minmax(0, 1fr))` is not observed layout.

### 4. Auth one-track

**Test:** `/tools/#category-auth` at 1080px.
**Expected:** One card in the first track only; does not stretch to full wrap width.
**Why human:** One-item grid occupancy is paint.

### 5. Hover in both themes

**Test:** Hover a catalog card in light and dark.
**Expected:** Title and description turn `--accent`; border and fill stay idle.
**Why human:** Hover appearance is visual.

### 6. Keyboard focus

**Test:** Tab onto a catalog card.
**Expected:** Existing 2px accent outline.
**Why human:** Focus ring is visual.

### 7. Theme tokens on cards

**Test:** Toggle theme on the catalog.
**Expected:** Cards use that theme's `--panel` / `--border` / `--text`.
**Why human:** Theme restyle is visual.

Rebuild (`npm run build`) before UAT if checking in-tool pages, so dist CSS picks up CR-01 scoping.

### Gaps Summary

No implementation gaps against HEAD chrome. Catalog wrappers, spacing scale, tokenized wrap/nav, layout-only `a.tool-card` chrome, and CR-01 selector scoping are in source and wired. Overlay ZH / LangSwitch were not committed. TOOLS and package.json were not edited.

Two must-haves are not presence-verifiable: the 1/2/3 column backstop (SC1) and overlap/collapse after the token swap (SC3). Status is `human_needed`, not `passed`.

---

_Verified: 2026-09-17T19:43:01Z_
_Verifier: Claude (gsd-verifier)_
