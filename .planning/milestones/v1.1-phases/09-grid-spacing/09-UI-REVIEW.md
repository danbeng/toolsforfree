# Phase 9 — UI Review

**Audited:** 2026-09-18
**Baseline:** 09-UI-SPEC.md (approved)
**Screenshots:** not captured (Playwright prohibited this audit; code-only). A probe of localhost:3000 returned HTTP 200 but was not used as visual evidence.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | HEAD English catalog strings match the contract (`Featured tools`, `View all tools`, `All tools`, whole-card link). |
| 2. Visuals | 2/4 | Grid wrappers exist, but 1/2/3-col backstop is unverified visually; selectors were narrowed vs the written CSS contract. |
| 3. Color | 4/4 | Idle cards use `--text` / `--panel` / `--border`; hover is `color: var(--accent)` only. |
| 4. Typography | 3/4 | Card title 16px/600/1.2 and body 16px/400/1.5 match; logo 650 left as required; page h1/h2 still unscoped (inherit, not restyled). |
| 5. Spacing | 3/4 | `--sp-1`…`--sp-12` on `:root` only; touched wrap/nav/card/grid tokens match; CR-01 selector extra; `main section` is global. |
| 6. Experience Design | 2/4 | SSG empty/loading/error correctly omitted; interaction contract (columns, Auth one-track, hover/focus/theme) has no viewport proof (D4). |

**Overall: 18/24**

---

## Top 3 Priority Fixes

1. **Column backstop unverified** — Visitors may still see 1-col or overlapping cards at 720/1080 if CSS Grid + `--content: 52rem` misbehaves. — Human DevTools check at 719 / 720 / 1079 / 1080 on `/` and `/tools/` (coverage D4); do not ship the layout claim until that pass is recorded.
2. **Catalog CSS uses CR-01-narrowed selectors** — `WordCounter`/`TextDiff` class reuse is mitigated, but the contract CSS was `.card-grid` and `.tool-card`. — Keep `:not(.tool-grid)` and `a.tool-card` if that is the production rule; update 09-UI-SPEC token block so later phases do not revert to the naive selectors.
3. **`main section { margin-top: var(--sp-6); }` is document-global** — Any future `<section>` in `main` (not only tools-index categories) inherits 32px top margin. — Scope to `main > section` or a tools-index class if Phase 10 adds other sections.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

Contract strings present in implemented HEAD pages:

- Home h1 `{SITE_NAME}`, lede `{SITE_TAGLINE}`, h2 `Featured tools`, CTA `View all tools` (`src/pages/index.astro` lines 11–22).
- Tools index h1 `All tools`; category h2 `{g.category}` (`src/pages/tools/index.astro` lines 15–18).
- Card is the link: `tool.name` in `<strong>`, `tool.shortDescription` in `<p>`; no `Open` / `Try` / extra button (`src/components/ToolCard.astro` lines 10–13).
- No empty-state or error chrome for the catalog (correct per contract).

WARNING: Dirty overlay `src/pages/zh/` still exists in the working tree. Phase 9 commits were supposed to leave HEAD English catalog only; do not treat ZH overlay copy as this phase’s shipped UI.

### Pillar 2: Visuals (2/4)

BLOCKER for the phase claim (not a broken link): UI-SPEC backstop requires 1-col default, 2-col ≥720px, 3-col ≥1080px inside `--content: 52rem` with no overlap. CSS exists (`src/styles/global.css` 173–183) but this audit has **no screenshots** and must not invent viewport results. SUMMARY coverage D4 remains human-only.

WARNING: Implemented selectors diverge from the UI-SPEC code block:

- `.card-grid:not(.tool-grid)` instead of `.card-grid`
- `a.tool-card` instead of `.tool-card`

That is the stated CR-01 fix for WordCounter/TextDiff class reuse. Functionally safer; visually the catalog still depends on `class="card-grid"` **without** `tool-grid` on the same node (`index.astro` 19, `tools/index.astro` 19).

Home focal point is still the featured grid after `Featured tools` (no overlay hero/kicker on HEAD pages). Cards inherit `a:focus-visible` 2px accent outline (`global.css` 68). No icon-only catalog controls.

### Pillar 3: Color (4/4)

- Dark/light tokens unchanged; `--sp-*` not duplicated under `:root[data-theme="light"]` (`global.css` 1–45).
- `a.tool-card` idle: `background: var(--panel); color: var(--text); border: 1px solid var(--border)` (193–201).
- Hover: `a.tool-card:hover { color: var(--accent); }` only (203–205) — no fill, no `border-color`, no `:active` scale.
- Accent still on in-page `a`, nav hover, focus-visible, tool-panel buttons — reserved list.
- Descriptions are not `--muted` (contract: footer only).

No finding that idle cards use accent fill/border.

### Pillar 4: Typography (3/4)

New card rules:

- `a.tool-card strong`: 16px / 600 / 1.2 (206–210)
- `a.tool-card p`: 16px / 400 / 1.5 (211–217)

`.nav a.logo { font-weight: 650; }` left (74). Home/tools h1/h2 font-size not restyled this phase.

WARNING: Footer still `font-size: 0.9rem` (72) — out of the four-size table but explicitly not a touched selector. Card phase weights 400 and 600 only in **new** rules; 650 remains on logo as required.

### Pillar 5: Spacing (3/4)

`:root` `--sp-1`…`--sp-12` = 4/8/12/16/24/32/48/64/80/96/120/144px (18–29).

Touched as specified:

- `.wrap` `padding: 0 var(--sp-4)` (69)
- `.nav` `gap: var(--sp-5)`; `min-height: 3.25rem` (73)
- `.card-grid` gap `var(--sp-4)` (176)
- `a.tool-card` padding `var(--sp-4)` (196)
- `h2:has(+ .card-grid)` `margin-bottom: var(--sp-4)` (184–186)
- `main section` `margin-top: var(--sp-6)` (187–189)

Intentionally **not** retokenized (matches “do not retokenize” list): hamburger 44px, overlay 16/8, `.tool-panel`, `.tool-grid gap: 1rem` (169), footer rem, `--content: 52rem` (4).

WARNING: `main section` is not scoped to the tools index; it applies site-wide.

### Pillar 6: Experience Design (2/4)

Covered by contract / code:

- Empty: SSG `TOOLS`; no “No tools” chrome.
- Loading: no fetch/skeleton.
- Error: no `role="alert"` on catalog pages.
- Populated: featured map in one `.card-grid`; per-category grids on `/tools/`.
- Overflow CSS: `min-width: 0`, `overflow-wrap: anywhere` on `a.tool-card`.
- One-item track: `minmax(0, 1fr)` / `repeat(n, minmax(0, 1fr))` does not stretch a single item across all columns **if** `grid-template-columns` is n tracks (Auth one-card occupies first track only — CSS-correct, viewport-unverified).

WARNING: Interaction contract (hover both themes, focus outline, 3-col no scroll) is unproven without screenshots. Human D4 in 09-01-SUMMARY is still open.

Registry audit: skipped (`components.json` absent; UI-SPEC registries none).

---

## Files Audited

- `.planning/phases/09-grid-spacing/09-UI-SPEC.md`
- `.planning/phases/09-grid-spacing/09-01-PLAN.md`
- `.planning/phases/09-grid-spacing/09-01-SUMMARY.md`
- `src/styles/global.css`
- `src/pages/index.astro`
- `src/pages/tools/index.astro`
- `src/components/ToolCard.astro`
