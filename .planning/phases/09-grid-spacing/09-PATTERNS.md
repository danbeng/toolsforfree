# Phase 9: Grid & Spacing - Pattern Map

**Mapped:** 2026-09-16
**Files analyzed:** 4
**Analogs found:** 4 / 4

Work from **git HEAD**, not the dirty working tree. Dirty overlay (hero/kicker, locale ToolCard, LangSwitch, `src/pages/zh/`) is **not** an analog.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/styles/global.css` | config | transform | HEAD `src/styles/global.css` (`:root` color tokens + `.tool-grid`) | exact (extend HEAD) |
| `src/pages/index.astro` | route | request-response | `git show HEAD:src/pages/index.astro` | exact |
| `src/pages/tools/index.astro` | route | request-response | `git show HEAD:src/pages/tools/index.astro` | exact |
| `src/components/ToolCard.astro` | component | request-response | `git show HEAD:src/components/ToolCard.astro` | exact (restore only; no markup change) |

## Pattern Assignments

### `src/styles/global.css` (config, transform)

**Analog:** HEAD `src/styles/global.css` (git-tracked; currently matches HEAD)

**Imports / token placement** (lines 1–18): add `--sp-1`…`--sp-12` **inside `:root` after color/diff tokens**. Do **not** duplicate under `:root[data-theme="light"]` (lines 20–33).

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
  /* insert --sp-1 … --sp-12 here */
}
```

**Contrast analog — do not copy for catalog** (lines 157–160): `.tool-grid` stays 1-col / 2-col at 720px for **in-tool split panes**. Catalog must use a **new** `.card-grid`. Leave `gap: 1rem` literal.

```css
.tool-grid { display: grid; gap: 1rem; }
@media (min-width: 720px) {
  .tool-grid.split { grid-template-columns: 1fr 1fr; }
}
```

**Touched selector retokenize** (lines 57, 61):

```css
.wrap { max-width: var(--content); margin: 0 auto; padding: 0 var(--sp-4); }
.nav { display: flex; gap: var(--sp-5); align-items: center; min-height: 3.25rem; }
```

Leave `.nav-links { gap: 1rem; }` (line 63). Leave `min-height: 3.25rem`. Leave `--content: 52rem`.

**Media-query convention to copy** (line 158): `@media (min-width: 720px)` — add `@media (min-width: 1080px)` the same way (min-width, not max-width).

**Leave unchanged (not analogs to retokenize):** `#navToggle` / `#themeToggle` 44px (lines 66–74, 117–124); hamburger overlay `gap: 16px` / `padding: 16px` / `padding: 8px 0` (lines 102–110); body grid 47px/48px (lines 45–50); `.tool-panel` `padding: 1rem` (line 145); footer rem values (line 60); `a:focus-visible` (line 56) — cards inherit.

**New rules (no HEAD `.tool-card` today):** copy 09-UI-SPEC catalog + card chrome exactly (`minmax(0, 1fr)`, `repeat(2|3, minmax(0, 1fr))`, idle `color: var(--text)` so global `a { color: var(--accent); }` line 55 does not paint idle cards accent).

---

### `src/pages/index.astro` (route, request-response)

**Analog:** `git show HEAD:src/pages/index.astro` — featured `ToolCard`s as **siblings with no wrapper**. Wrap that map only.

**Imports pattern:**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ToolCard from '../components/ToolCard.astro';
import { SITE_NAME, SITE_TAGLINE } from '../data/site';
import { getFeaturedTools, getToolsByCategory } from '../data/tools';

const featured = getFeaturedTools();
const groups = getToolsByCategory();
---
```

**Core markup analog — wrap the map:**

```astro
<h2>Featured tools</h2>
<div class="card-grid">
  {featured.map((tool) => <ToolCard tool={tool} />)}
</div>
<p><a href="/tools/">View all tools</a></p>
```

Keep HEAD siblings: `h1` `{SITE_NAME}`, `p` `{SITE_TAGLINE}`, category `<a>`s. Do **not** copy dirty overlay `.hero` / `.kicker` / `locale` / `t()`.

---

### `src/pages/tools/index.astro` (route, request-response)

**Analog:** `git show HEAD:src/pages/tools/index.astro` — per-category `<section>` with sibling `ToolCard`s, no grid.

**Imports pattern:**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ToolCard from '../../components/ToolCard.astro';
import { getToolsByCategory } from '../../data/tools';

const groups = getToolsByCategory();
const idFor = (category: string) =>
  `category-${category.toLowerCase()}`;
---
```

**Core pattern — one `.card-grid` per section:**

```astro
<section id={idFor(g.category)}>
  <h2>{g.category}</h2>
  <div class="card-grid">
    {g.tools.map((tool) => <ToolCard tool={tool} />)}
  </div>
</section>
```

Do not add `.page-intro` / `.category-block` / locale copy.

---

### `src/components/ToolCard.astro` (component, request-response)

**Analog:** `git show HEAD:src/components/ToolCard.astro` — **no locale**. Restore if working tree requires `locale`.

```astro
---
import type { Tool } from '../data/tools';

interface Props {
  tool: Tool;
}

const { tool } = Astro.props;
---
<a class="tool-card" href={`/tools/${tool.slug}/`}>
  <strong>{tool.name}</strong>
  <p>{tool.shortDescription}</p>
</a>
```

No eyebrow. No overlay copy. Chrome lives in `global.css`.

---

## Shared Patterns

### HEAD restore then wrap (Phase 7/8 analog)

**Source:** `.planning/phases/07-theme-foundation/07-01-PLAN.md` / `08-01-PLAN.md` — `git checkout HEAD --` on named paths only; do not pop stash.

**Apply to:** `index.astro`, `tools/index.astro`, `ToolCard.astro` before wrapping.

```bash
git checkout HEAD -- src/pages/index.astro src/pages/tools/index.astro src/components/ToolCard.astro
```

Path-limited add only. Never `git add -A`. Do not pop `stash@{0}` or `stash@{1}`.

### CSS custom properties on `:root`

**Source:** HEAD `src/styles/global.css` lines 1–18 (color tokens).

**Apply to:** `--sp-*` placement (theme-independent; not in light block).

### Catalog vs island grids

**Source:** HEAD `.tool-grid` lines 157–160.

**Apply to:** New `.card-grid` for catalog only. Never add 1080px to `.tool-grid`.

### Idle vs accent links

**Source:** HEAD `a { color: var(--accent); }` line 55 + `.nav-links a:hover { color: var(--accent); }` line 65.

**Apply to:** `.tool-card` idle `color: var(--text)`; hover text `color: var(--accent)` only. Focus inherits line 56.

### Validation

**Source:** Phase 7/8 — file `rg` + `npm test` + `npm run build` + human viewport UAT. No Playwright, no jsdom, no new `*.test.ts`.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | `.card-grid` / `.tool-card` CSS rules are new; copy 09-UI-SPEC. Markup analogs are HEAD pages/ToolCard. |

## Metadata

**Analog search scope:** `git show HEAD:` for `src/pages/index.astro`, `src/pages/tools/index.astro`, `src/components/ToolCard.astro`, `src/styles/global.css`; `git ls-files` confirmed tracked.
**Files scanned:** 5 tracked sources (plus CONTEXT / RESEARCH / UI-SPEC)
**Pattern extraction date:** 2026-09-16
**Dirty overlay excluded:** working-tree `index.astro` / `ToolCard.astro` / `src/pages/zh/`
