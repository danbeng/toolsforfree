# Phase 9: Grid & Spacing - Research

**Researched:** 2026-09-16
**Domain:** Astro 7 SSG + native CSS Grid catalog layout + `:root` spacing tokens (visual only)
**Confidence:** HIGH (HEAD markup, UI-SPEC contract, no new packages); MEDIUM (`:has()` fallback if a visitor browser lacks it)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Catalog grid markup
- Wrap home featured tools and `/tools/` per-category lists in `.card-grid` (LAY-01 home/catalog)
- Breakpoints: 1 column default; `min-width: 720px` → 2 columns (same as existing `.tool-grid.split`); `min-width: 1080px` → 3 columns
- CSS `display: grid` + tokenized `gap`; cards `min-width: 0` so long titles wrap instead of overflowing
- Add wrappers on HEAD `src/pages/index.astro` and `src/pages/tools/index.astro` only — do not import overlay hero/kicker markup

#### Spacing scale tokens
- Define `--sp-1`…`--sp-12` as 4/8/12/16/24/32/48/64/80/96/120/144px on `:root` (LAY-02)
- Migrate touched layout selectors only: `.card-grid` gap, `.tool-card` padding, `.wrap` horizontal padding, `.nav` gap (LAY-03)
- Do **not** retokenize `.tool-panel`, `.diff-lines`, `.md-preview` (Phase 10)
- Convert existing `1rem` / `1.25rem` in touched selectors to nearest `--sp-*` (16px / 24px)

#### Card chrome (layout-only)
- Minimal `.tool-card`: `display: block`, padding `--sp-4`, `border: 1px solid var(--border)`, background `var(--panel)`; hover may use existing `--accent` text color — no new button `:active` / focus ring (Phase 10)
- Keep HEAD `ToolCard.astro` content (`<strong>` + shortDescription); do not add overlay eyebrow/locale
- Each `/tools/` category `<section>` gets its own `.card-grid`; space `h2` from the grid with `--sp-4` / `--sp-6`
- Keep `.tool-grid` for in-tool split panes; catalog uses `.card-grid` only

#### HEAD vs overlay & out of scope
- Edit HEAD English pages only; **do not** commit dirty `src/pages/zh/`
- Use `@media (min-width: 1080px)` to match the existing 720px convention
- No 4-col at 1440px, no spacing animation, no `src/lib` / `TOOLS` data changes, no stash pop, no FAQ/button chrome
- Keep HEAD `--content` max-width; 3 columns fit inside the current canvas

### Claude's Discretion
- Exact `.tool-card` hover (color only vs border-color) within `--accent` / `--border`
- Whether `.card-grid` gap is `--sp-4` (16px) or `--sp-5` (24px) — pick one and use it on both home and catalog
- Whether nav `gap: 1.25rem` becomes `--sp-5` (24px) or `--sp-4` (16px)

**UI-SPEC already resolved discretion (do not re-decide):** `.card-grid` gap `--sp-4` (16px) on home and catalog; `.nav` gap `1.25rem` → `--sp-5` (24px); `.tool-card:hover` text `color: var(--accent)` only (no border-color / fill). [VERIFIED: .planning/phases/09-grid-spacing/09-UI-SPEC.md:17]

### Deferred Ideas (OUT OF SCOPE)
- Card grid 4-col at 1440px — v2
- Committing dirty `src/pages/zh/` catalog pages — later i18n merge
- Tool-panel / FAQ / button chrome spacing — Phase 10
- Overlay hero / kicker / eyebrow ToolCard — out of this milestone unless a later visual pass owns it
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LAY-01 | Card grid 3-column layout at ≥1080px breakpoint (existing 720px 2-col unchanged) | New `.card-grid` with `minmax(0, 1fr)` default 1-col, `@media (min-width: 720px)` 2-col, `@media (min-width: 1080px)` 3-col. Do **not** add 1080px to `.tool-grid`. Wrappers only on HEAD home featured map and each `/tools/` category list. Pattern 1. |
| LAY-02 | CSS spacing scale variables defined (`--sp-1` through `--sp-12`: 4/8/12/16/24/32/48/64/80/96/120/144px) | Twelve custom properties on `:root` next to color tokens; **not** duplicated under `:root[data-theme="light"]`. Pattern 2. |
| LAY-03 | Existing hardcoded spacing values in touched selectors migrated to spacing scale tokens | Replace `.wrap` `padding: 0 1rem` → `padding: 0 var(--sp-4)`; `.nav` `gap: 1.25rem` → `gap: var(--sp-5)`. New `.card-grid` gap and `.tool-card` padding use `--sp-4`. Do not retokenize `.tool-panel`, `.diff-lines`, `.md-preview`, hamburger overlay literals, 44px hit targets, `.tool-grid` `gap: 1rem`, footer rem values. Pattern 2–3. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Actionable directives the planner must not contradict:

- Privacy / architecture: all tool computation in the browser (`src/lib`); no new API routes for tool logic
- Stack: stay on Astro + Preact + current catalog/content-collection pattern — do not introduce a new app framework
- Visual milestone: no Tailwind, no CSS-in-JS, no new npm packages, no `src/lib` / `TOOLS` data changes
- Languages: TypeScript in `src/lib`, `src/data`, `src/i18n`; Astro templates; CSS in `src/styles/global.css` plus scoped `<style>`
- Runtime: Node `^20.19.0 || >=22.12.0`; ESM; npm
- Frameworks: Astro `^7.3.2`, Preact `^10.29.8`, Vitest `^5.0.0`
- Conventions: PascalCase `.astro` components; named exports for libs/i18n; default export only for Preact tool islands; relative imports; almost no comments
- Trailing slashes required; English unprefixed
- No backend for tool processing
- GSD: do not make repo edits outside a GSD workflow
- Do **not** recommend Playwright or a jsdom Vitest switch

## Summary

Phase 9 is a **visual-only** catalog layout pass on the **committed HEAD baseline**, not the dirty working tree. Home featured tools and `/tools/` per-category lists get a `.card-grid` (1 column default, 2 at `min-width: 720px`, 3 at `min-width: 1080px`). `:root` gains `--sp-1`…`--sp-12` (4/8/12/16/24/32/48/64/80/96/120/144px). Only touched layout selectors migrate onto that scale: `.card-grid` gap, `.tool-card` padding, `.wrap` horizontal padding, `.nav` gap. Cards get layout-only chrome (panel fill, 1px border, hover text `--accent`). In-tool `.tool-grid` split panes stay 1-col / 2-col at 720px.

**HEAD is not the dirty working tree.** Dirty `src/pages/index.astro` already has `.card-grid` plus overlay `.hero` / `.kicker` / `locale`. Dirty `ToolCard.astro` requires `locale` and renders an `.eyebrow`. Untracked `src/pages/zh/` exists. Those must not be the implementation source. Analog: Phase 7/8 `git checkout HEAD --` on named paths only, then edit, then `git add` only in-scope files. Do not pop `stash@{0}` (`gsd-phase7-overlay-chrome-temp`) or `stash@{1}` (`pre-02-01-merge unrelated i18n`).

**Primary recommendation:** Restore HEAD bytes of `src/pages/index.astro`, `src/pages/tools/index.astro`, and `src/components/ToolCard.astro`; wrap the featured map and each category map in `<div class="card-grid">`; add `--sp-*` plus `.card-grid` / `.tool-card` rules to HEAD `src/styles/global.css` (currently identical to HEAD). Zero new packages. Zero Playwright. Zero `src/lib` / `TOOLS` edits.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Catalog column count (1 / 2 / 3) | Browser / Client (CSS `@media min-width`) | CDN / Static (SSG HTML wrappers) | Viewport decides tracks; SSG only emits `.card-grid` markup |
| Spacing token scale | Browser / Client (`:root` custom properties) | — | Cascade from `global.css`; no server |
| Card chrome + hover text | Browser / Client (CSS) | — | `.tool-card` is an `<a>`; no JS |
| Home / catalog wrappers | Frontend Server (SSG Astro) | — | Static maps over `getFeaturedTools()` / `getToolsByCategory()` |
| In-tool split panes | Browser / Client (existing `.tool-grid`) | — | Out of scope; must not inherit 3-col |
| Tool processors / catalog data | — | — | Locked out (`src/lib`, `TOOLS`) |
| i18n ZH tree | — | — | Do not commit `src/pages/zh/` |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| (none new) | — | Locked: no new npm packages | REQUIREMENTS Out of Scope / UI-SPEC |
| astro | `^7.3.2` [VERIFIED: package.json:14] — quote: `"astro": "^7.3.2"` | SSG pages, content collections | Already installed |
| CSS Grid (`display: grid`) | native | Catalog tracks | UI-SPEC forbids flex-wrap and third-party grids |
| CSS custom properties | native HEAD tokens | `--sp-*` + existing `--panel` / `--border` / `--accent` | Phase 7/8 pattern |
| `@media (min-width: …)` | native | 720px / 1080px | Matches existing `.tool-grid.split` convention |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | `^5.0.0` [VERIFIED: package.json:25] — quote: `"vitest": "^5.0.0"` | Existing `npm test` → `vitest run` | Regression gate only |
| jsdom | `^30.0.1` [VERIFIED: package.json:23] — quote: `"jsdom": "^30.0.1"` | Installed, unused | Do **not** switch Vitest to jsdom |
| preact / `@astrojs/preact` | `^10.29.8` / `^6.0.5` [VERIFIED: package.json:18,12] | Tool islands | Do **not** use for catalog cards |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `.card-grid` + explicit `repeat(2\|3, minmax(0, 1fr))` | Reuse `.tool-grid` for catalog | **Locked out** — adding 1080px to `.tool-grid` would 3-col in-tool split panes |
| Explicit column counts | `auto-fit` / `auto-fill` | **Locked out** — extra columns inside `--content` |
| Native CSS Grid | Flex-wrap | **Locked out** by UI-SPEC |
| Native CSS variables | Tailwind / CSS-in-JS | **Locked out** — no new packages |
| HEAD English pages | Dirty overlay + `src/pages/zh/` | **Locked out** — overlay-commit risk |

**Installation:** none.

```bash
# Do not run npm install this phase.
```

**Version verification:** versions above from `package.json` Read this session. No registry install. Do not run package-legitimacy against astro/vitest to re-add them.

## Package Legitimacy Audit

> No external packages are installed this phase.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| — | — | — | — | — | — | None to install |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none for this phase (do not add astro/vitest/preact again)

## Architecture Patterns

### System Architecture Diagram

```text
Visitor GET / or /tools/  (static HTML)
        |
        v
  BaseLayout <main class="wrap">     [VERIFIED: src/layouts/BaseLayout.astro:30-32]
        |
        +-- home: h1, tagline, category <a>s, h2 "Featured tools"
        |         |
        |         v
        |      .card-grid  --CSS-->  1 col default
        |         |                   2 col @ min-width 720px
        |         |                   3 col @ min-width 1080px
        |         +-- 6x ToolCard <a.tool-card> (featured)
        |
        +-- /tools/: h1 "All tools"
                  |
                  v
               each <section id="category-{name}">
                  h2 + .card-grid of that category's ToolCards
                  Auth has 1 card -> first track only

In-tool pages (unchanged):
  .tool-grid.split  --CSS-->  1 col default / 2 col @ 720px
                              NEVER 3-col
```

### Recommended Project Structure

No new directories. Touch only:

```
src/styles/global.css          # --sp-* on :root; .card-grid; .tool-card; retokenize .wrap / .nav
src/pages/index.astro          # restore HEAD, wrap featured map
src/pages/tools/index.astro    # restore HEAD, wrap each category map
src/components/ToolCard.astro  # restore HEAD markup; no locale / eyebrow
```

Leave: `src/lib/**`, `src/data/tools.ts`, `src/components/tools/**`, `Header.astro`, `NavMenu.astro`, `ThemeToggle.astro`, `LangSwitch.astro`, `src/pages/zh/**`, `src/i18n/**`.

### Pattern 1: `.card-grid` vs `.tool-grid` (LAY-01)

**What:** Catalog cards use a **new** class. In-tool split panes keep `.tool-grid`.

**When to use:** Home featured list and each `/tools/` category list only.

HEAD `.tool-grid` (do not change) [VERIFIED: src/styles/global.css:157-160]:

```css
.tool-grid { display: grid; gap: 1rem; }
@media (min-width: 720px) {
  .tool-grid.split { grid-template-columns: 1fr 1fr; }
}
```

Used today by in-tool islands (`class="tool-grid split"` in MarkdownPreview / TextDiff / WordCounter / QrCode). `gap: 1rem` stays a **literal**.

New catalog rules (copy UI-SPEC exactly):

```css
.card-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--sp-4);
}
@media (min-width: 720px) {
  .card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1080px) {
  .card-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
h2:has(+ .card-grid) {
  margin-bottom: var(--sp-4);
}
main section {
  margin-top: var(--sp-6);
}
main section > h2 {
  margin-top: 0;
}
```

`minmax()` defines a size range ≥ min and ≤ max for CSS grids [CITED: developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/minmax]. `grid-template-columns` defines column track sizing [CITED: developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-columns]. Explicit `repeat(2|3, …)` creates exactly two or three columns; do not use `auto-fit` / `auto-fill`.

`:has()` represents an element if a relative selector matches when anchored against it, including a previous sibling [CITED: developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has]. `h2:has(+ .card-grid)` is that pattern. If `:has()` is unsupported, **that whole rule is dropped**; the grid still works.

`main section` on HEAD only matches `/tools/` category `<section>`s. HEAD home has **no** `<section>`. If the executor skips restore and keeps overlay `<section class="hero">`, this rule would also space the hero — another restore reason.

### Pattern 2: Spacing tokens on `:root` only (LAY-02, LAY-03)

**What:** Define all twelve `--sp-*` next to existing **color** tokens on `:root`. Do not duplicate under `:root[data-theme="light"]`.

HEAD `:root` currently starts [VERIFIED: src/styles/global.css:1-18]:

```css
:root {
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --sans: "Segoe UI", system-ui, sans-serif;
  --content: 52rem;

  color-scheme: dark;
  --bg: #121417;
  --panel: #1a1d21;
  --text: #e8eaed;
  --muted: #9aa0a6;
  --border: #2a2f36;
  --accent: #2dd4bf;
  --danger: #f87171;
  --grid-line: rgba(42, 47, 54, 0.45);
  --diff-add-fg: #3dd68c;
  --diff-add-bg: #13291f;
  --diff-del-fg: #f07178;
}
```

Insert after the color / diff tokens (still inside `:root`):

```css
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 24px;
  --sp-6: 32px;
  --sp-7: 48px;
  --sp-8: 64px;
  --sp-9: 80px;
  --sp-10: 96px;
  --sp-11: 120px;
  --sp-12: 144px;
```

Replace only these existing declarations [VERIFIED: src/styles/global.css:57,61]:

```css
.wrap { max-width: var(--content); margin: 0 auto; padding: 0 1rem; }
.nav { display: flex; gap: 1.25rem; align-items: center; min-height: 3.25rem; }
```

becomes:

```css
.wrap { max-width: var(--content); margin: 0 auto; padding: 0 var(--sp-4); }
.nav { display: flex; gap: var(--sp-5); align-items: center; min-height: 3.25rem; }
```

Leave `.nav-links { gap: 1rem; }` [VERIFIED: src/styles/global.css:63]. Leave `.nav` `min-height: 3.25rem`. Leave `--content: 52rem`.

**Do not retokenize** (UI-SPEC exceptions):

| Selector / value | HEAD | Action |
|------------------|------|--------|
| `#navToggle` / `#themeToggle` 44×44 | [VERIFIED: src/styles/global.css:71-74, 121-124] | leave; WCAG 2.2 target-size floor |
| hamburger `.nav-links` `gap: 16px` / `padding: 16px` / `padding: 8px 0` | [VERIFIED: src/styles/global.css:102-110] | leave |
| body grid `47px` / `48px` | [VERIFIED: src/styles/global.css:47-50] | leave; not `--sp-7` |
| `.tool-panel` `padding: 1rem` | [VERIFIED: src/styles/global.css:145] | Phase 10 |
| `.tool-grid` `gap: 1rem` | [VERIFIED: src/styles/global.css:157] | leave |
| footer `margin-top: 3rem; padding: 1.5rem 0 2.5rem` | [VERIFIED: src/styles/global.css:60] | leave |
| `.md-preview` / `.diff-lines` literals | Phase 10 | leave |

### Pattern 3: HEAD wrappers only (not overlay loops)

**What:** Restore HEAD pages, then wrap the existing maps. Do not keep overlay chrome.

HEAD home (`git show HEAD:src/pages/index.astro`) — wrap **only** the featured map:

```astro
<h2>Featured tools</h2>
<div class="card-grid">
  {featured.map((tool) => <ToolCard tool={tool} />)}
</div>
<p><a href="/tools/">View all tools</a></p>
```

Keep sibling HEAD chrome verbatim: `h1` `{SITE_NAME}`, `p` `{SITE_TAGLINE}`, category `<a>`s, `View all tools`. Do not add `.hero`, `.kicker`, `.cats`, `.section-head`, `locale`, or `t()`.

HEAD tools index (`git show HEAD:src/pages/tools/index.astro`) — each category `<section>` gets its own grid:

```astro
<section id={idFor(g.category)}>
  <h2>{g.category}</h2>
  <div class="card-grid">
    {g.tools.map((tool) => <ToolCard tool={tool} />)}
  </div>
</section>
```

Do not add `.page-intro`, `.category-block`, or `copy.categories`.

HEAD `ToolCard.astro` (`git show HEAD:src/components/ToolCard.astro`):

```astro
<a class="tool-card" href={`/tools/${tool.slug}/`}>
  <strong>{tool.name}</strong>
  <p>{tool.shortDescription}</p>
</a>
```

No `locale` prop. No eyebrow. Dirty working-tree ToolCard **requires** `locale` [VERIFIED: src/components/ToolCard.astro:7-10] — quote: `locale: Locale`. Restoring pages to HEAD without restoring ToolCard **breaks the build**.

Catalog data (do not edit) [VERIFIED: src/data/tools.ts:180-188]:

```typescript
export function getFeaturedTools(): Tool[] {
  return TOOLS.filter((t) => t.featured);
}

export function getToolsByCategory(): { category: ToolCategory; tools: Tool[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    tools: TOOLS.filter((t) => t.category === category),
  })).filter((g) => g.tools.length > 0);
}
```

Featured count is six (`src/data/tools.test.ts`). Auth is one tool (`jwt-decoder`) — first track only, empty tracks stay empty. Categories [VERIFIED: src/data/tools.ts:1-8]: `'Format' | 'Auth' | 'Encode' | 'Generate' | 'Text' | 'Time' | 'Color'`.

### Pattern 4: HEAD-only file discipline (Phase 7/8 analog)

Phase 7 plan: `git checkout HEAD --` on `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/Header.astro` only; do not pop stash [VERIFIED: .planning/phases/07-theme-foundation/07-01-PLAN.md:144].

Phase 8 plan: `git checkout HEAD --` on `Header.astro` and `global.css` only [VERIFIED: .planning/phases/08-mobile-hamburger-menu/08-01-PLAN.md:129].

**This phase — restore then wrap (prescriptive):**

```bash
git checkout HEAD -- src/pages/index.astro src/pages/tools/index.astro src/components/ToolCard.astro
# global.css currently matches HEAD (git diff empty this session); still treat HEAD as baseline.
# Do not: git stash pop, git checkout of src/pages/zh, Header, BaseLayout, i18n.
```

Then add the two wrappers and CSS. Do **not** “edit only the overlay map loops”: dirty home already has `.card-grid` **and** hero/kicker/locale; wrapping there would commit overlay.

**Commit path-limited:**

```bash
git add src/styles/global.css src/pages/index.astro src/pages/tools/index.astro src/components/ToolCard.astro
```

Never `git add -A` / `git add src/pages`. Untracked `src/pages/zh/` and dirty `LangSwitch.astro` must stay unstaged.

Stashes this session: `stash@{0}: gsd-phase7-overlay-chrome-temp`; `stash@{1}: pre-02-01-merge unrelated i18n`. Do not pop.

### Pattern 5: Card chrome (layout-only)

```css
.tool-card {
  display: block;
  min-width: 0;
  padding: var(--sp-4);
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text);
  text-decoration: none;
  overflow-wrap: anywhere;
}
.tool-card:hover {
  color: var(--accent);
}
.tool-card strong {
  display: block;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}
.tool-card p {
  margin: var(--sp-2) 0 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
}
```

HEAD has **no** `.tool-card` rule today; global `a { color: var(--accent); }` [VERIFIED: src/styles/global.css:55] would otherwise paint idle cards accent. Idle `color: var(--text)` is required.

`overflow-wrap` inserts line breaks in otherwise unbreakable strings so text does not overflow its line box; `anywhere` is a valid keyword [CITED: developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-wrap]. Combined with `min-width: 0` on the item and `minmax(0, 1fr)` tracks.

No `border-radius`, box-shadow, hover fill, hover `border-color`, or `:active` scale (Phase 10). `:focus-visible` inherits existing `a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` [VERIFIED: src/styles/global.css:56]. New CSS weights this phase: **400 and 600 only**. Leave `.nav a.logo` `font-weight: 650` [VERIFIED: src/styles/global.css:62].

### Anti-Patterns to Avoid

- **Editing dirty overlay pages / ToolCard as if they were HEAD.** Hero, kicker, `locale`, eyebrow, IBM Plex/Syne, `LangSwitch`, `src/pages/zh/` are out of scope.
- **Putting catalog cards in `.tool-grid`.** Would skip 3-col or, worse, 3-col the tool islands if 1080px is added there.
- **`auto-fit` / `auto-fill` / flex-wrap.** Extra columns or uneven tracks inside `--content`.
- **`--sp-*` inside `:root[data-theme="light"]`.** Spacing is theme-independent.
- **Retokenizing hamburger 44px or overlay `16px` / `8px`.** WCAG target size; Phase 8 literals.
- **Popping stash@{0} or stash@{1}.** Mixes overlay chrome / unrelated i18n.
- **`git add -A`.** Stages untracked ZH tree.
- **Playwright / jsdom / `theme.test.ts` analog.** Same as Phase 7/8: file assertions + build + human UAT.
- **Restyling home/tools `h1`/`h2` font-size.** Inherit only.
- **Widening `--content` to “make 3-col fit”.** UI-SPEC: 3 columns fit in 52rem.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive card columns | JS column counter / masonry | CSS Grid + two `min-width` queries | Viewport is CSS; no hydration |
| Spacing consistency | Per-selector magic pixels | `--sp-1`…`--sp-12` on `:root` | One scale; LAY-02 |
| Equal-height cards | Equalizer JS | Default `align-items: stretch` | Grid already stretches |
| Long-title overflow | Truncate + tooltip | `min-width: 0` + `overflow-wrap: anywhere` | UI-SPEC: wrap, no ellipsis |
| 3-col catalog | Reuse `.tool-grid` | New `.card-grid` | Protects in-tool 2-col split |
| Visual tests | Playwright | File `rg` + `npm run build` + human UAT | Locked: no new packages |

**Key insight:** The rewrite-class failure is **scope**, not Grid API. Mixing overlay pages or `.tool-grid` is how Phase 9 ships the wrong product.

## Common Pitfalls

### Pitfall 1: Executing against the dirty overlay
**What goes wrong:** Commit includes `.hero` / `.kicker` / locale ToolCard / `src/pages/zh/`.
**Why it happens:** Dirty `index.astro` already has `.card-grid`; Read without `git show HEAD` looks done.
**How to avoid:** `git checkout HEAD -- src/pages/index.astro src/pages/tools/index.astro src/components/ToolCard.astro` before wrapping. Path-limited `git add`.
**Warning signs:** `homeKicker`, `locale={locale}`, `class="eyebrow"`, `LangSwitch`, IBM Plex / Syne in the phase diff.

### Pitfall 2: Restore pages but not ToolCard
**What goes wrong:** `ToolCard tool={tool}` without `locale` fails because dirty Props require `locale: Locale`.
**How to avoid:** Restore all three files together.

### Pitfall 3: 3-col on `.tool-grid`
**What goes wrong:** Markdown / diff / QR split panes become three columns at 1080px.
**How to avoid:** New class only. Verify `.tool-grid.split` still two columns at ≥720px.

### Pitfall 4: Tokenizing untouched selectors
**What goes wrong:** Hamburger 44px shrinks toward `--sp-6` (32px) or `--sp-7` (48px); tool-panel/FAQ stolen from Phase 10.
**How to avoid:** Touched list is exhaustive: `.card-grid` gap, `.tool-card` padding, `.wrap` horizontal padding, `.nav` gap. `.tool-card p` margin `--sp-2` is the UI-SPEC companion, not a new touched layout selector beyond that list.

### Pitfall 5: `git add -A` / stash pop
**What goes wrong:** ZH tree and overlay chrome land on main.
**How to avoid:** Explicit `git add` paths. Do not `git stash pop`.

### Pitfall 6: Horizontal overflow at 3-col
**What goes wrong:** Long titles inflate `min-content`; cards overlap or the page scrolls sideways.
**How to avoid:** `minmax(0, 1fr)` + item `min-width: 0` + `overflow-wrap: anywhere`. Human UAT at 1080px.

### Pitfall 7: Hover restyles border/fill
**What goes wrong:** Phase 10 button chrome leaks in.
**How to avoid:** `.tool-card:hover { color: var(--accent); }` only.

### Pitfall 8: `:has()` unsupported
**What goes wrong:** `h2` sits flush on the grid (default margins only).
**How to avoid:** Accept as progressive enhancement; do not polyfill. Grid columns still work.

## Code Examples

Verified patterns from HEAD + locked UI-SPEC:

### Restore command (Wave 0 / first task)

```bash
git checkout HEAD -- src/pages/index.astro src/pages/tools/index.astro src/components/ToolCard.astro
git stash list   # must still show stash@{0} and stash@{1}; do not pop
```

### HEAD home after wrap

Keep the HEAD frontmatter (`SITE_NAME`, `SITE_TAGLINE`, `getFeaturedTools`, `getToolsByCategory`). Do not import `t` / `localizedPath`.

```astro
<BaseLayout title={SITE_NAME} description={SITE_TAGLINE} path="/">
  <h1>{SITE_NAME}</h1>
  <p>{SITE_TAGLINE}</p>
  <p>
    {groups.map((g) => (
      <a href={`/tools/#category-${g.category.toLowerCase()}`}>{g.category}</a>
    ))}
  </p>
  <h2>Featured tools</h2>
  <div class="card-grid">
    {featured.map((tool) => <ToolCard tool={tool} />)}
  </div>
  <p><a href="/tools/">View all tools</a></p>
</BaseLayout>
```

### Copy strings that must stay verbatim

- Home `h1`: `Devtoolbox` via `SITE_NAME` [VERIFIED: src/data/site.ts:1] — quote: `export const SITE_NAME = 'Devtoolbox';`
- Home lede: `Browser-based developer tools. Nothing is uploaded.` [VERIFIED: src/data/site.ts:4-5]
- Home `h2`: `Featured tools`
- View-all: `View all tools` linking `/tools/`
- Tools index `h1`: `All tools`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Sibling ToolCards, no grid (HEAD) | `.card-grid` 1/2/3-col | this phase | LAY-01 |
| One-off `1rem` / `1.25rem` on wrap/nav | `--sp-4` / `--sp-5` | this phase | LAY-03 |
| Unstyled `.tool-card` (inherits accent link color) | Panel + border + `--text` idle | this phase | readable catalog |
| Tailwind utility spacing | Custom properties on `:root` | project lock | no new packages |

**Deprecated/outdated:**
- Flex-wrap card galleries with `%` widths — Grid `repeat()` is the locked contract
- `auto-fit` “responsive cards” — extra columns inside a fixed `--content` canvas

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Visitor browsers support `:has()` so `h2:has(+ .card-grid)` applies | Pattern 1 | Heading-to-grid gap missing; columns still work. No polyfill. |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

Discretion items from CONTEXT are **not** assumptions: 09-UI-SPEC locked gap `--sp-4`, nav `--sp-5`, hover color-only.

## Open Questions

None blocking. 09-UI-SPEC is approved and resolved CONTEXT discretion.

1. **Dirty ToolCard vs HEAD pages**
   - What we know: both are dirty; Props diverge.
   - What's unclear: nothing — restore all three together.
   - Recommendation: Wave 0 restore task before CSS.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `astro build`, `vitest` | ✓ | v22.22.2 | — |
| npm | scripts | ✓ | 11.9.0 | — |
| git | HEAD baseline / path-limited add | ✓ | 2.52.0.windows.1 | — |
| Knowledge graph | Cross-doc query | ✗ | — | Skip; no `.planning/graphs/graph.json` |
| ctx7 CLI | Docs lookup | ✗ | — | MDN JSON + cited docs |
| Playwright | — | n/a | — | **Do not install** |

**Missing dependencies with no fallback:** none for implementation.

**Missing dependencies with fallback:** graphify, ctx7 — unused at execute time.

**Step 2.6:** No DB, Redis, Docker. Visitor-side CSS Grid / media queries only. No new runtime services. `src/styles/global.css` already matches HEAD (no diff this session).

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` [VERIFIED: .planning/config.json:24] — quote: `"nyquist_validation": true`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^5.0.0` [VERIFIED: package.json:25] |
| Config file | `vitest.config.ts` — `include: ['src/**/*.test.ts']`, `environment: 'node'`, `passWithNoTests: true` [VERIFIED: vitest.config.ts:3-8] |
| Quick run command | `npm test` |
| Full suite command | `npm test` (`vitest run` [VERIFIED: package.json:9] — quote: `"test": "vitest run"`) |

Do **not** add Playwright. Do **not** add `layout.test.ts` / `*.test.tsx` or switch Vitest to jsdom. Grid behavior is document CSS; Nyquist coverage is **file assertions + build + human viewport UAT**, matching Phase 7/8.

Do **not** add a unit test that imports `TOOLS` to “prove” six featured cards — `src/data/tools.test.ts` already asserts featured length 6; this phase must not edit that file.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAY-01 | `.card-grid` 1-col default; 2-col at `min-width: 720px`; 3-col at `min-width: 1080px`; wrappers on home + tools index | smoke (file) | `rg -n "card-grid" src/styles/global.css src/pages/index.astro src/pages/tools/index.astro`; `rg -n "min-width: 1080px" src/styles/global.css`; `rg -n "tool-grid" src/styles/global.css` must still be 720-only | ❌ Wave 0 (assertion in plan, not a test file) |
| LAY-02 | `--sp-1`…`--sp-12` on `:root` with 4/8/12/16/24/32/48/64/80/96/120/144px | smoke (file) | `rg -n "--sp-1:" src/styles/global.css` through `--sp-12`; confirm **not** inside `[data-theme="light"]` | ❌ Wave 0 |
| LAY-03 | `.wrap` padding and `.nav` gap use tokens; hamburger 44px / overlay 16px / `.tool-grid` gap `1rem` unchanged | smoke (file) | `rg -n "padding: 0 var\\(--sp-4\\)" src/styles/global.css`; `rg -n "gap: var\\(--sp-5\\)" src/styles/global.css`; `rg -n "width: 44px" src/styles/global.css`; `rg -n "gap: 1rem" src/styles/global.css` (`.tool-grid` and `.nav-links`) | ❌ Wave 0 |
| overlay | Phase diff has no `hero`/`kicker`/`LangSwitch`/`src/pages/zh/` | smoke (git) | `git diff --name-only` / `git diff --cached --name-only` must not list `src/pages/zh/` or `LangSwitch.astro` | ❌ Wave 0 |
| regression | Existing `src/lib/*.test.ts` stay green | unit | `npm test` | ✅ |
| build | Pages compile after HEAD restore + wrappers | smoke | `npm run build` | ❌ Wave 0 |
| LAY-01 columns | 1 / 2 / 3 columns, no overlap | **manual / backstop** | DevTools widths below | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test` && `npm run build`
- **Phase gate:** Full suite green + file assertions + human 1/2/3-col checklist before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] Plan tasks must include `git checkout HEAD --` on the three overlay files **before** markup edits
- [ ] Plan tasks must include `rg` / `npm run build` verification (these **are** the automated commands)
- [ ] Manual-only column backstop — justified (needs real viewport). Do **not** add Playwright
- [ ] Do **not** create `src/lib/layout.ts` or CSS unit tests
- Framework install: none — Vitest already present

### Manual-Only Verifications (human UAT backstop)

UI-SPEC backstop [VERIFIED: .planning/phases/09-grid-spacing/09-UI-SPEC.md:180]: “At min-width 1080px home featured and each /tools/ category .card-grid are three columns inside --content 52rem with no card overlap; at min-width 720px and below 1080px two columns; below 720px one column”

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Home featured + each `/tools/` category 1 column | LAY-01 | Needs viewport | DevTools width **719px** |
| Same grids 2 columns; `.tool-grid.split` on a tool page still 2 columns | LAY-01 | Needs viewport | Width **720px** and **1079px**; open `/tools/markdown-preview/` (or text-diff) and confirm split is still 2, not 3 |
| Same catalog grids 3 columns inside `--content`; no overlap; no horizontal page scroll from the grid | LAY-01 | Needs viewport | Width **1080px** on `/` and `/tools/` |
| Auth category one card occupies first track only | LAY-01 zero-one-many | Needs viewport | `/tools/#category-auth` at 1080px |
| Hover: title + description turn `--accent`; border and fill stay idle | UI-SPEC | Needs pointer | Hover a card in both themes |
| Keyboard focus: existing 2px accent outline | inherit | Needs focus | Tab onto a card |
| Light theme cards use light `--panel` / `--border` / `--text` | Phase 7 tokens | Needs theme toggle | Toggle theme on catalog |
| After token swap, cards/sections do not overlap or collapse | LAY-03 | Needs eyeball | Home + `/tools/` at 719 / 720 / 1080 |
| Diff does not contain overlay hero/kicker/zh | HEAD discipline | Needs git | Review `git diff --cached --name-only` |

## Security Domain

> `workflow.security_enforcement` is enabled [VERIFIED: .planning/config.json:47] — quote: `"security_enforcement": true`. ASVS level 1 [VERIFIED: .planning/config.json:48] — quote: `"security_asvs_level": 1`.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No accounts |
| V3 Session Management | no | No new storage; theme `localStorage` unchanged |
| V4 Access Control | no | Public static pages |
| V5 Input Validation | no | No new visitor input. Catalog is SSG from `TOOLS`. No `innerHTML`, no scripts this phase |
| V6 Cryptography | no | No secrets |

**Visitor threats for layout CSS: none.** No new script, no new URL handling, no user-controlled CSS. Cards remain ordinary `<a href="/tools/{slug}/">` from the registry.

### Known Threat Patterns for this phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Overlay-commit (shipping dirty `src/pages/zh/`, `LangSwitch`, locale ToolCard) | Tampering (repo integrity, not visitor XSS) | Restore HEAD three files; path-limited `git add`; do not stash pop |
| Accidental 3-col on tool islands | Elevation of privilege analog (scope creep) | Keep `.tool-grid` unchanged |
| `innerHTML` / inline script | Tampering | Do not add scripts this phase |

Clickjacking / framing headers remain site-wide out of scope (same as Phase 8).

## Sources

### Primary (HIGH confidence — in-repo Read / git show this session)
- `git show HEAD:src/pages/index.astro` — featured map, no grid wrapper
- `git show HEAD:src/pages/tools/index.astro` — per-category `<section>`, no grid
- `git show HEAD:src/components/ToolCard.astro` — `<a class="tool-card">` + `<strong>` + `<p>`
- `src/styles/global.css` (matches HEAD, 286 lines) — `.wrap`, `.nav`, `.tool-grid`, no `.card-grid` / `.tool-card`
- `src/layouts/BaseLayout.astro:30-32` — `<main class="wrap">`
- `src/data/tools.ts:1-8, 180-188` — categories, getters
- `src/data/site.ts:1-5` — `SITE_NAME` / `SITE_TAGLINE`
- `package.json`, `vitest.config.ts`, `.planning/config.json`
- `.planning/phases/09-grid-spacing/09-CONTEXT.md`
- `.planning/phases/09-grid-spacing/09-UI-SPEC.md` (approved)
- `.planning/REQUIREMENTS.md` LAY-01–03
- `.planning/phases/07-theme-foundation/07-01-PLAN.md:144` and `08-01-PLAN.md:129` — HEAD checkout analog
- Dirty WT: `src/pages/index.astro`, `src/pages/tools/index.astro`, `src/components/ToolCard.astro` (overlay; do not copy)

### Secondary (MEDIUM confidence — official MDN summaries this session)
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/minmax
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-columns
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-wrap
- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout

### Tertiary
- classify-confidence seam returned LOW for `webfetch` even with `--verified`; MDN JSON titles/summaries still pulled this session. In-repo discrete values use `[VERIFIED: path:lines]` from Read, not the seam.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; versions from `package.json` Read this session
- Architecture: HIGH — 09-UI-SPEC + HEAD `git show` + Phase 7/8 restore analog
- Pitfalls: HIGH — overlay-commit and `.tool-grid` collision are the rewrite-class failures

**Research date:** 2026-09-16
**Valid until:** 30 days (stable CSS Grid / custom properties; no framework churn this phase)
