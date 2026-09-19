# Phase 7: Theme Foundation - Research

**Researched:** 2026-09-16
**Domain:** Astro 7 SSG + CSS custom properties light/dark theming (FOUC-safe)
**Confidence:** HIGH (architecture/stack vs HEAD); MEDIUM (exact light-palette hex — no CONTEXT.md)

<user_constraints>
## User Constraints (from phase brief / REQUIREMENTS.md)

CONTEXT.md does not exist for this phase (Continue without context). Constraints below are locked by the plan-phase brief, REQUIREMENTS.md, ROADMAP.md, and PROJECT.md.

### Locked Decisions
- Visual only: no `src/lib/*` tool logic changes; no `src/data/tools.ts` catalog changes
- Stay on Astro + Preact + custom CSS variables — no Tailwind, no CSS-in-JS, no new npm packages
- Work from HEAD, not the dirty CSS overlay on main. Do not commit unrelated dirty i18n/pages/visual CSS refactor. Do not pop stash@{0}
- Do not rewrite existing ten tools. Do not treat dirty ToolShell (has locale prop) as HEAD — HEAD ToolShell has NO locale prop. Do not clone dirty JsonFormatter that imports missing `useToolUi`
- ThemeToggle is a static Astro component, not a Preact island (zero FOUC / no hydration)
- ThemeInit is blocking `<script is:inline>` in `<head>`
- `data-theme` on `<html>`, not class toggling
- Two-state toggle only (light/dark). Three-state auto/light/dark is out of scope
- Smooth theme transition animation is out of scope
- Bilingual: EN unprefixed + `/zh/` tree; localStorage is origin-scoped so EN/ZH share preference
- Privacy: localStorage-only, no server state
- Header.astro is shared by EN and ZH pages via BaseLayout — one toggle covers both trees
- Existing global.css is dark-only (`color-scheme: dark` hardcoded in `:root`)
- Body has a distinctive grid-line pattern (`rgba(36, 48, 64, 0.35)` on dark canvas) that MUST become a CSS variable — **see HEAD vs overlay note in Summary; implement `--grid-line` on HEAD, do not import the dirty 662-line overlay**
- Audit hardcoded colors in `.diff-line`, `.md-preview`, `.qr-preview`, tool-panel before splitting tokens
- Do not touch hamburger (Phase 8), 3-col grid/spacing (Phase 9), button/FAQ chrome (Phase 10) except as needed for theme tokens

### Claude's Discretion
No CONTEXT.md discretion section. Research recommendations below are planner defaults unless the user overrides:
- Exact light-theme hex values
- Whether ThemeInit always writes `data-theme="light"|"dark"` (recommended: yes)
- Whether first visit writes localStorage (recommended: no — write only on toggle)
- `--grid-line` rgba values for HEAD (HEAD has no grid today)
- Whether to add `--diff-add-*` / `--diff-del-*` tokens (recommended: yes)
- Theme toggle `aria-label` copy (HEAD chrome is English-only)

### Deferred Ideas (OUT OF SCOPE)
From REQUIREMENTS.md Out of Scope / ROADMAP deferred:
- Three-state toggle (auto/light/dark) — v2
- Smooth theme transition animation — v2
- Card grid 4-col at 1440px — v2
- Full WCAG audit — Phase 10 owns CHR-07; Phase 7 only needs readable tokens
- Tailwind / CSS-in-JS / animation libs / new npm packages
- Tool logic changes (`src/lib/*`) / new tools
- Hamburger, spacing scale, button/FAQ rewrite
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| THM-01 | CSS custom properties split into shared + dark (`:root`) + light (`:root[data-theme="light"]`) tokens | Pattern 1; HEAD token inventory; keep HEAD dark values as `:root` default |
| THM-02 | Theme toggle button in header with sun/moon icon, toggles `data-theme` on `<html>` | Pattern 3; ThemeToggle.astro in Header; CSS-driven icons |
| THM-03 | Theme preference persisted to `localStorage` and restored on page load | ThemeInit + toggle `setItem`; origin-scoped storage |
| THM-04 | Blocking `<script is:inline>` in `<head>` reads `localStorage` before first paint (no FOUC) | Pattern 2; Astro `is:inline` unprocessed scripts |
| THM-05 | System preference detection via `prefers-color-scheme` when no `localStorage` entry exists | `matchMedia('(prefers-color-scheme: dark)')` only when storage missing/invalid |
| THM-06 | Body grid-line background adapted for light mode via CSS variable (`--grid-line`) | Introduce `--grid-line` on HEAD (no grid exists at HEAD); use it in `body` background-image |
| THM-07 | `color-scheme` property set per theme for native widget theming (scrollbar, inputs) | `color-scheme: dark` on `:root`; `color-scheme: light` on `:root[data-theme="light"]` |
</phase_requirements>

## Summary

Phase 7 is a **visual-only** addition on the **committed HEAD baseline** (`2488383`): dark-only CSS tokens, a shared `BaseLayout`/`Header`, and no theme script. Visitors get a two-state light/dark toggle in the header, `data-theme` on `<html>`, localStorage persistence, OS `prefers-color-scheme` as the first-visit default, a `--grid-line` body pattern, and per-theme `color-scheme` for native widgets — with a blocking `<script is:inline>` in `<head>` so the wrong theme never paints.

**HEAD is not the dirty working tree.** Milestone research (`.planning/research/*.md`) and CLAUDE.md describe a 662-line overlay (IBM fonts, sticky header, `--bg-elev` / `--led`, body grid `rgba(36, 48, 64, 0.35)`, `src/pages/zh/`, `LangSwitch`, locale props). Those files are **uncommitted**. The executor must edit HEAD contents of `global.css`, `BaseLayout.astro`, and `Header.astro`, not the overlay. THM-06 still applies: HEAD `body` has **no** grid, so the phase **adds** `--grid-line` and a `repeating-linear-gradient` that uses it — it does not migrate overlay CSS.

**Primary recommendation:** Keep HEAD dark tokens on `:root` (default = current site if the script fails). Override only color tokens under `:root[data-theme="light"]`. Add `ThemeInit.astro` as the first `<head>` child and `ThemeToggle.astro` inside `Header` `.nav-links`. Zero new packages. Zero Preact islands. Zero `src/lib` / catalog / page-tree edits.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Color tokens + `color-scheme` | Browser / Client (document CSS) | — | `:root` custom properties cascade to every page; no server |
| FOUC-safe theme init | Browser / Client (`<head>` blocking script) | — | Must run before first paint; SSG cannot know visitor preference |
| Theme toggle UI | Browser / Client (static Astro in Header) | — | One shared Header; CSS shows sun/moon; click writes DOM + storage |
| Preference persistence | Browser / Client (`localStorage`) | — | Privacy: no cookie, no API, origin-scoped across `/` and future `/zh/` |
| Body grid-line | Browser / Client (CSS) | — | `--grid-line` token + `body` background-image |
| Native widgets (scrollbar, inputs) | Browser / Client (`color-scheme`) | — | UA chrome follows CSS `color-scheme`; not authored scrollbar CSS |
| Tool islands / processors | — | — | Out of scope; they inherit CSS variables only |

## Project Constraints (from CLAUDE.md)

Actionable directives the planner must not contradict:

- Privacy / architecture: all tool computation in the browser (`src/lib`); no new API routes for tool logic
- Stack: Astro + Preact + current catalog/content-collection pattern — do not introduce a new app framework
- Do not rewrite existing tools
- Languages: TypeScript in `src/lib`, `src/data`, `src/i18n`; Astro templates; CSS in `src/styles/global.css` plus scoped `<style>`
- Runtime: Node `^20.19.0 \|\| >=22.12.0`; ESM; npm
- Frameworks: Astro `^7.3.2`, Preact `^10.29.8`, Vitest `^5.0.0`
- Conventions: PascalCase `.astro` components; named exports for libs/i18n; default export only for Preact tool islands; `SCREAMING_SNAKE` module constants; relative imports; almost no comments
- GSD: do not make repo edits outside a GSD workflow
- Trailing slashes required; English unprefixed (when i18n exists)
- No backend for tool processing

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| (none new) | — | Theme is CSS + two inline scripts | Locked: no new npm packages |
| astro | `^7.3.2` [VERIFIED: HEAD package.json:14] | SSG, `is:inline` scripts, layouts | Already installed |
| preact / `@astrojs/preact` | `^10.29.8` / `^6.0.5` [VERIFIED: HEAD package.json:12,18] | Existing tool islands | Do **not** use for ThemeToggle |
| CSS custom properties | native | Token split | Already in `:root` |
| `color-scheme` | native CSS | UA scrollbars/inputs | THM-07 |
| `Window.matchMedia` | native | OS preference | THM-05 |
| `localStorage` | native | Persistence | THM-03 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | `^5.0.0` [VERIFIED: HEAD package.json:25] | Unit tests | Existing `npm test` → `vitest run` |
| jsdom | `^30.0.1` [VERIFIED: HEAD package.json:23] | Installed but unused | Do **not** switch vitest to jsdom for this phase |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `data-theme` on `<html>` | `.dark` class (Astro tutorial) | Tutorial uses class; **locked out** — use `dataset.theme` |
| `<script is:inline>` in `<head>` | Bundled `<script>` or Preact `client:load` | Bundled scripts are processed/deferred — FOUC |
| Two-state + OS default | Three-state auto/light/dark | Deferred to v2 |
| Single `global.css` | `light.css` + `dark.css` | Duplicate non-color CSS; no runtime conditional import |

**Installation:** none.

**Version verification:** `astro` `^7.3.2`, `preact` `^10.29.8`, `vitest` `^5.0.0` from HEAD `package.json`. No registry install this phase. Package-legitimacy on already-installed `astro`/`vitest` returned `SUS`/`too-new` (recent publish dates) — ignore; **do not install anything**.

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
Visitor request (static HTML)
        |
        v
  <html>  (no data-theme in SSG output)
        |
        v
  <head>
     ThemeInit <script is:inline>     <-- blocking, first child
        |  1. try localStorage.getItem('theme')
        |  2. if not 'light'|'dark' -> matchMedia('(prefers-color-scheme: dark)')
        |  3. document.documentElement.setAttribute('data-theme', t)
        v
     CSS (imported global.css)
        |  :root                  -> dark tokens + color-scheme: dark
        |  :root[data-theme="light"] -> light tokens + color-scheme: light
        v
  first paint (correct theme, no FOUC)
        |
        v
  Header > ThemeToggle button
        |  click -> toggle data-theme -> localStorage.setItem('theme', next)
        v
  CSS variables cascade; islands unchanged
```

### Recommended Project Structure

```
src/
├── components/
│   ├── ThemeInit.astro      # NEW — head blocking script only
│   ├── ThemeToggle.astro    # NEW — button + click script; not an island
│   └── Header.astro         # MODIFY — import ThemeToggle inside .nav-links
├── layouts/
│   └── BaseLayout.astro     # MODIFY — <ThemeInit /> first in <head>
├── styles/
│   └── global.css           # MODIFY — token split, --grid-line, color-scheme
└── i18n/
    └── ui.ts                # OPTIONAL — only if adding themeToggle strings; HEAD Header has no locale
```

**Do not add:** `src/lib/theme.ts` (visual-only; keep script tiny and inline). **Do not add:** `src/pages/zh/`, `LangSwitch.astro`, locale props on BaseLayout/Header (dirty overlay).

### HEAD baseline the executor must treat as source of truth

Working tree is dirty. Quote HEAD, not the overlay.

`:root` tokens [VERIFIED: git show HEAD:src/styles/global.css:1-12]:

```
:root {
  color-scheme: dark;
  --bg: #121417;
  --panel: #1a1d21;
  --text: #e8eaed;
  --muted: #9aa0a6;
  --border: #2a2f36;
  --accent: #2dd4bf;
  --danger: #f87171;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --sans: "Segoe UI", system-ui, sans-serif;
  --content: 52rem;
}
```

Body has **no** grid [VERIFIED: git show HEAD:src/styles/global.css:16]:

```
html, body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--sans); }
```

Layout head [VERIFIED: git show HEAD:src/layouts/BaseLayout.astro:17-27]:

```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
  </head>
  <body>
    <Header />
```

Header [VERIFIED: git show HEAD:src/components/Header.astro:4-11]:

```
<header class="site">
  <nav class="wrap nav">
    <a class="logo" href="/">{SITE_NAME}</a>
    <div class="nav-links">
      <a href="/tools/">Tools</a>
      <a href="/blog/">Blog</a>
      <a href="/about/">About</a>
    </div>
  </nav>
</header>
```

HEAD has **no** `src/pages/zh/`, **no** `src/i18n/locales.ts`, **no** `src/i18n/path.ts`, **no** `LangSwitch.astro`. `BaseLayout` Props are `title`, `description`, `path` only. `Header` takes no props. Every page under `src/pages/` uses this layout, so one ThemeInit + one Header toggle covers the whole committed tree.

ToolShell at HEAD has **no** `locale` [VERIFIED: git show HEAD:src/components/ToolShell.tsx:4-8]:

```
export function ToolShell(props: {
  error: string | null;
  output: string;
  children: ComponentChildren;
}) {
```

### Pattern 1: Token split (`data-theme`, not class)

**What:** Shared non-color tokens stay on `:root`. Dark color tokens stay on `:root` (and may be repeated on `:root[data-theme="dark"]` for explicitness). Light color tokens live only on `:root[data-theme="light"]`.

**When to use:** Always for this phase.

**Default-dark is load-bearing:** SSG HTML has no `data-theme`. If ThemeInit is blocked or throws, the site must still look like HEAD (dark). Do **not** move dark colors exclusively under `[data-theme="dark"]` without a `:root` fallback.

```css
/* Source: HEAD tokens + THM-01/06/07. Light hex [ASSUMED] — confirm in UI-SPEC if generated. */
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

:root[data-theme="light"] {
  color-scheme: light;
  --bg: #f4f6f8;
  --panel: #ffffff;
  --text: #1a1d21;
  --muted: #5c6570;
  --border: #d5dbe3;
  --accent: #0f766e;
  --danger: #dc2626;
  --grid-line: rgba(15, 23, 32, 0.08);
  --diff-add-fg: #0f7a45;
  --diff-add-bg: #e7f7ee;
  --diff-del-fg: #b42318;
}

html, body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
}

body {
  background-image:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 47px,
      var(--grid-line) 47px,
      var(--grid-line) 48px
    );
}
```

`--grid-line` dark/light rgba values are [ASSUMED] (HEAD has no grid; overlay’s `rgba(36, 48, 64, 0.35)` must **not** be copied as a hardcoded body rule).

Replace hardcoded diff colors [VERIFIED: git show HEAD:src/styles/global.css:58-65]:

```
.diff-line--add {
  color: #3dd68c;
  background: #13291f;
  border-left-color: #3dd68c;
}
.diff-line--del {
  color: #f07178;
  border-left-color: #f07178;
}
```

with `var(--diff-add-fg)` / `var(--diff-add-bg)` / `var(--diff-del-fg)`.

`.md-preview code` / `pre` already use `var(--bg-elev, var(--panel))` [VERIFIED: git show HEAD:src/styles/global.css:121]. HEAD never defines `--bg-elev`. Leave the fallback; do **not** add overlay-only tokens (`--led`, `--accent-dim`, `--radius`, `--display`) unless a HEAD selector already needs them.

`.qr-preview` uses `var(--bg)` / `var(--border)` — token split is enough. Do **not** change QrCode canvas paints `#ffffff` / `#000000` [VERIFIED: git show HEAD:src/components/tools/QrCode.tsx:23-29] — those are QR quiet-zone/module colors, not chrome.

`.tool-panel` already uses `var(--panel)` / `var(--border)` / `var(--bg)` / `var(--accent)` — inherits the split. No button-state rewrite (Phase 10).

### Pattern 2: ThemeInit blocking head script (THM-03, THM-04, THM-05)

**What:** Tiny IIFE, `is:inline`, first child of `<head>`. Allowlist `'light'|'dark'`. Fall back to `matchMedia`. Always set `data-theme`. Do **not** `setItem` on first visit (so OS changes still apply until the user toggles — THM-05). Wrap storage in `try/catch` (`SecurityError` when cookies/storage blocked) [CITED: developer.mozilla.org/en-US/docs/Web/API/Window/localStorage].

**Why `is:inline`:** Astro processed `<script>` tags are bundled (TypeScript, imports). Unprocessed: “Astro will not process a `<script>` tag if it has any attribute other than `src`.” `is:inline` “intentionally opt out of processing”; “rendered into the HTML exactly as written”; “If used inside a component, this code is duplicated for each instance.” [CITED: docs.astro.build/en/guides/client-side-scripts/]

```astro
---
---
<script is:inline>
  (function () {
    var t = null;
    try { t = localStorage.getItem('theme'); } catch (e) {}
    if (t !== 'light' && t !== 'dark') {
      t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark'
        : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

`prefers-color-scheme` values: `dark` = user prefers a dark theme; `light` = prefers light **or has not expressed an active preference** [CITED: developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme]. First-time visitors on a light OS therefore get light; unknown/no-preference also gets light. That matches THM-05. Dark remains the **CSS** default when the attribute is missing.

**BaseLayout integration:** import ThemeInit; render it **before** `<meta charset>` so it runs as early as the parser allows:

```astro
<html lang="en">
  <head>
    <ThemeInit />
    <meta charset="utf-8" />
```

Do not add `<meta name="color-scheme">` with a static `dark` value — it would fight THM-07’s per-theme CSS. MDN’s meta hint is for pages that opt into `light dark` without an attribute toggle [CITED: developer.mozilla.org/en-US/docs/Web/CSS/color-scheme].

### Pattern 3: Static ThemeToggle (THM-02, THM-03)

**What:** Astro `<button type="button">` with sun/moon SVG, `aria-label="Toggle color theme"` (HEAD Header is English). Inline click handler toggles `data-theme` and `localStorage.setItem('theme', next)`.

Official tutorial (“Take your blog from day to night, **no island required**”) uses `ThemeIcon.astro` + `<script is:inline>` + `localStorage` + `matchMedia` + `document.documentElement.classList` `.dark` [CITED: docs.astro.build/en/tutorial/6-islands/2/]. **Diverge:** `data-theme` not class; **do not** put init logic in the toggle (init belongs in `<head>`); **do not** `setItem` during init.

**Scoped CSS pitfall:** Astro `<style>` is scoped. Attribute selectors on `:root` inside the component **will not match** unless wrapped in `:global(...)`. Put sun/moon visibility in `global.css` instead:

```css
#themeToggle .theme-moon { display: none; }
:root[data-theme="light"] #themeToggle .theme-sun { display: none; }
:root[data-theme="light"] #themeToggle .theme-moon { display: block; }
```

Click script (in ThemeToggle.astro):

```html
<script is:inline>
  document.getElementById('themeToggle')?.addEventListener('click', function () {
    var el = document.documentElement;
    var next = el.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    el.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
</script>
```

Header: import ThemeToggle; place **inside** `.nav-links` after About (`.nav-links` already has `margin-left: auto`). One instance per page — `is:inline` duplication is acceptable.

Do **not** use `client:load` / Preact. Do **not** listen to `matchMedia('change')` after a stored choice (would fight the user).

### Pattern 4: `color-scheme` per theme (THM-07)

`color-scheme` is inherited. Values include `light`, `dark`, `light dark`, `only light`. User agents change canvas, **default colors of scrollbars**, **form controls**, and other UA UI. It does **not** restyle authored CSS — tokens still required [CITED: developer.mozilla.org/en-US/docs/Web/CSS/color-scheme].

Set `color-scheme: dark` on `:root` and `color-scheme: light` on `:root[data-theme="light"]` (not `light dark` on `:root`, which would let the UA ignore `data-theme`).

### Anti-Patterns to Avoid

- **ThemeToggle as Preact island:** hydration after paint = FOUC / extra JS. Tutorial explicitly does this with a `<script>` and no island.
- **Init script in the toggle component only:** toggle lives in `<body>`; too late for first paint. Split ThemeInit (head) vs ThemeToggle (header).
- **Class `.dark` / `:root.light`:** locked to `data-theme`.
- **Writing localStorage on first resolve:** Astro tutorial does this; skip it so THM-05 keeps working until the user clicks.
- **`@media (prefers-color-scheme)` as the token switch:** cannot override with an attribute without duplicating every rule. Tokens + attribute only.
- **Editing dirty overlay CSS/i18n:** 662-line `global.css`, locale Header, `src/pages/zh/` are uncommitted. Restoring/mixing them is out of scope.
- **Cloning dirty ToolShell / JsonFormatter / useToolUi.**
- **Hamburger / spacing / FAQ / button polish.**
- **Extracting theme helper into `src/lib`.**
- **QR canvas recolor** to theme tokens (breaks scannable contrast).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme persistence | Cookies / server session | `localStorage` key `theme` | Privacy; origin-scoped; not sent on requests |
| OS preference | User-Agent sniffing | `matchMedia('(prefers-color-scheme: dark)')` | Standard API |
| Native widget theming | Custom scrollbar CSS | `color-scheme` | UA already themes inputs/scrollbars |
| Icon framework | `astro-icon` / SVG sprite package | Inline SVG in ThemeToggle | No new packages |
| FOUC killer integration | `astro-fouc-killer` | 10-line `is:inline` script | No new packages |

**Key insight:** The hard parts are **when the script runs** and **which document the CSS keys off**. A 10-line inline script plus attribute selectors beat any library on this SSG.

## Common Pitfalls

### Pitfall 1: Executing against the dirty overlay
**What goes wrong:** Executor edits working-tree `global.css` (662 lines) / i18n Header and ships overlay + theme mixed.
**Why it happens:** Files are already dirty on disk; Read without `git show HEAD` looks like the “current” design.
**How to avoid:** Before edits, `git show HEAD:src/styles/global.css` (etc.) is the baseline. If the worktree file diverges, restore HEAD content for those three files **without** `git stash pop`. Do not pop `stash@{0}` (ToolIsland only).
**Warning signs:** IBM Plex / Syne, `--led`, sticky header, `LangSwitch` appearing in the Phase 7 diff.

### Pitfall 2: FOUC from bundled scripts
**What goes wrong:** Wrong theme flashes on hard refresh.
**Why it happens:** Default Astro `<script>` is processed/bundled, not synchronous in head.
**How to avoid:** ThemeInit uses `<script is:inline>` as first `<head>` child. Verify production `dist/**/*.html` still contains the raw IIFE, not `type="module"` for this snippet.
**Warning signs:** `theme` string only in a hashed `.js` file.

### Pitfall 3: Dark tokens only under `[data-theme="dark"]`
**What goes wrong:** Flash of unstyled/light page when attribute is late or missing.
**How to avoid:** Keep HEAD dark values on `:root`. Light is the override.

### Pitfall 4: Scoped styles hide the moon/sun
**What goes wrong:** Icon never switches.
**Why it happens:** Component `<style>` cannot see `:root[data-theme]` without `:global`.
**How to avoid:** Icon visibility rules in `global.css`.

### Pitfall 5: Trusting localStorage values
**What goes wrong:** Invalid stored string leaves `data-theme="undefined"` or XSS-like attribute junk.
**How to avoid:** Allowlist `t === 'light' \|\| t === 'dark'` only. `setAttribute` with those two literals.

### Pitfall 6: Storage throws
**What goes wrong:** Init script aborts; no `data-theme`; possible FOUC relative to OS.
**How to avoid:** `try/catch` around getItem/setItem; still set attribute from matchMedia.

### Pitfall 7: Diff / md-preview / QR leftovers
**What goes wrong:** Light theme shows black-green diff hunks (`#13291f`) or invisible delete text.
**How to avoid:** Tokenize `.diff-line--add/del`. Leave QR module colors. md-preview already uses CSS vars.

### Pitfall 8: Tutorial writes storage on init
**What goes wrong:** First visit freezes OS theme forever; THM-05 never re-runs.
**How to avoid:** `setItem` only in the click handler.

### Pitfall 9: `matchMedia` change listener
**What goes wrong:** OS night-shift overrides a manual choice.
**How to avoid:** Read matchMedia only when storage is empty.

### Pitfall 10: Assuming a ZH tree exists at HEAD
**What goes wrong:** Planner tasks edit `src/pages/zh/` or `Header locale={locale}` that do not exist on HEAD.
**How to avoid:** One Header, no locale prop. localStorage will still be origin-scoped when a ZH tree is added later.

## Code Examples

### ThemeInit.astro (head)

```astro
---
---
<script is:inline>
  (function () {
    var t = null;
    try { t = localStorage.getItem('theme'); } catch (e) {}
    if (t !== 'light' && t !== 'dark') {
      t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark'
        : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

### Header insertion

```astro
---
import { SITE_NAME } from '../data/site';
import ThemeToggle from './ThemeToggle.astro';
---
<header class="site">
  <nav class="wrap nav">
    <a class="logo" href="/">{SITE_NAME}</a>
    <div class="nav-links">
      <a href="/tools/">Tools</a>
      <a href="/blog/">Blog</a>
      <a href="/about/">About</a>
      <ThemeToggle />
    </div>
  </nav>
</header>
```

Keep those three `href`s and label strings verbatim from HEAD.

### color-scheme (THM-07)

```css
:root { color-scheme: dark; }
:root[data-theme="light"] { color-scheme: light; }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@media (prefers-color-scheme)` only | Tokens + document attribute + init script | Standard for manual toggle | User can override OS |
| `.dark` class (Astro tutorial) | `data-theme` (this project, locked) | Project decision | Avoids class/utility clashes |
| Theme as framework island | Vanilla `is:inline` | Astro tutorial unit 6-2 | No hydration FOUC |
| Separate light/dark stylesheets | One `global.css` | Ongoing | One cascade |

**Deprecated/outdated:**
- CSS checkbox as the theme control — not accessible; not requested
- `prefers-color-scheme` as the only switch — cannot persist a manual override cleanly

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Light palette hex (`#f4f6f8`, `#0f766e`, etc.) | Pattern 1 | Contrast fail; UI-SPEC / human tweak |
| A2 | `--grid-line` rgba values | THM-06 | Grid too strong/weak; easy CSS tweak |
| A3 | Do not write localStorage until toggle | Pattern 2 | If product wanted “sticky OS snapshot”, first visit would re-follow OS — matches THM-05 as written |
| A4 | English `aria-label="Toggle color theme"` | Pattern 3 | Fine on HEAD EN chrome; revisit when ZH header exists |
| A5 | `--diff-*` token names | Pitfall 7 | Naming only |
| A6 | No `src/lib/theme.ts` | Structure | If planner wants unit tests of resolver, would need a lib file — conflicts with visual-only unless tests stay grep/build |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions (RESOLVED)

1. **Light palette** RESOLVED
   - What we know: HEAD dark tokens are exact. No light tokens exist at HEAD.
   - Locked: D-01 ships the research light-hex table (`#f4f6f8` canvas, teal accent adapted); UI-SPEC may re-tint.
   - Approved 07-UI-SPEC.md Color / Token implementation: light `--bg` `#f4f6f8`, `--panel` `#ffffff`, `--text` `#1a1d21`, `--muted` `#5c6570`, `--border` `#d5dbe3`, `--accent` `#0f766e`, `--danger` `#b91c1c` (research `#dc2626` re-tint for contrast), light `--diff-*` as in that table. Plan 07-01 already cites those values.

2. **Grid on HEAD** RESOLVED
   - What we know: HEAD body is solid `--bg`. Overlay has a grid the brief describes.
   - Locked: D-04 adds `--grid-line` plus 47px/48px repeating-linear-gradient on HEAD; do not copy the dirty overlay.
   - Approved 07-UI-SPEC.md Body grid and Color `--grid-line`: dark `rgba(42, 47, 54, 0.45)`, light `rgba(15, 23, 32, 0.10)` (research `0.08` re-tint). Plan 07-01 already cites that geometry.

3. **ZH chrome** RESOLVED
   - What we know: HEAD is a single EN tree; localStorage will still share later.
   - Locked: D-03 English `aria-label="Toggle color theme"` only — skip `ui.ts` until ZH chrome exists. CONTEXT.md Deferred Ideas: ZH `ui.ts` keys / locale Header when ZH chrome exists.
   - Approved 07-UI-SPEC.md Copywriting Contract: do not add `ui.ts` keys this phase. Plan 07-01 does not touch `src/i18n`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `astro build`, `vitest` | ✓ | v22.22.2 | — |
| npm | scripts | ✓ | 11.9.0 | — |
| git | HEAD baseline | ✓ | 2.52.0.windows.1 | — |
| Knowledge graph | Cross-doc query | ✗ | — | Skip; no `.planning/graphs/graph.json` |
| ctx7 CLI | Docs lookup | ✗ | — | curl of official docs |
| Brave search | research-plan | ✗ | BRAVE_API_KEY unset | curl + cited docs |

**Missing dependencies with no fallback:** none for implementation.

**Missing dependencies with fallback:** graphify, ctx7, Brave — unused at execute time.

**Step 2.6 note:** Phase needs no extra runtime services (no DB, Redis, Docker). Browser `localStorage` / `matchMedia` are visitor-side.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^5.0.0` [VERIFIED: HEAD package.json:25] |
| Config file | `vitest.config.ts` — `include: ['src/**/*.test.ts']`, `environment: 'node'`, `passWithNoTests: true` [VERIFIED: git show HEAD:vitest.config.ts:3-8] |
| Quick run command | `npm test` |
| Full suite command | `npm test` (same: `vitest run` [VERIFIED: HEAD package.json:9]) |

Do **not** add `*.test.tsx` or switch to jsdom. Theme behavior is document CSS + inline scripts; Nyquist coverage is **build + file assertions + manual FOUC**, not DOM unit tests.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| THM-01 | `:root` dark tokens + `:root[data-theme="light"]` block in `global.css` | smoke (file) | `rg -n "data-theme=\"light\"" src/styles/global.css` | ❌ Wave 0 (assertion in plan, not a test file) |
| THM-02 | Header contains ThemeToggle; button toggles attribute | manual + file | `rg ThemeToggle src/components/Header.astro` | ❌ Wave 0 |
| THM-03 | `localStorage` key `theme` written on click, read on init | manual | hard refresh after toggle | ❌ Wave 0 |
| THM-04 | Unbundled IIFE in built HTML `<head>` | smoke | `npm run build` then `rg "localStorage.getItem\\('theme'\\)" dist` | ❌ Wave 0 |
| THM-05 | No storage → follows `prefers-color-scheme` | manual | DevTools Rendering emulate, empty storage, hard refresh | ❌ Wave 0 |
| THM-06 | `--grid-line` used in `body` background-image | smoke (file) | `rg --grid-line src/styles/global.css` | ❌ Wave 0 |
| THM-07 | `color-scheme: light` under light selector; `color-scheme: dark` on `:root` | smoke (file) | `rg "color-scheme" src/styles/global.css` | ❌ Wave 0 |

Existing `src/lib/*.test.ts` must stay green (`npm test`) as a regression gate — they do not cover THM-*.

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test` && `npm run build`
- **Phase gate:** Full suite green + `dist` contains inline theme IIFE + manual FOUC checklist before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] No automated FOUC test — **manual-only is justified** (needs real paint + localStorage). Do not add Playwright this phase (new package forbidden).
- [ ] Plan tasks must include `rg` / `git show HEAD` / `npm run build` verification steps (these are the automated commands above).
- [ ] Do **not** create `src/lib/theme.test.ts`.
- Framework install: none — Vitest already present.

*(Gaps are verification steps, not missing test files in `src/`.)*

### Manual FOUC / UAT checklist (planner → VERIFICATION)
1. Hard refresh with `theme=light` in localStorage — no dark flash
2. Hard refresh with `theme=dark` — no light flash
3. Clear storage, emulate `prefers-color-scheme: light` — light on load
4. Clear storage, emulate dark — dark on load
5. Toggle, then navigate `/` → `/tools/` → `/about/` — preference sticks
6. Light theme: body grid visible; `<textarea>` / scrollbar match light `color-scheme`
7. Diff tool add/del lines readable in both themes
8. Confirm production HTML still inlines the init script

## Security Domain

`security_enforcement` is enabled (`.planning/config.json`).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No accounts |
| V3 Session Management | no | No sessions; theme is not a session |
| V4 Access Control | no | Static site |
| V5 Input Validation | yes | Allowlist `light`\|`dark` before `setAttribute`; never `innerHTML` from storage |
| V6 Cryptography | no | No secrets |

### Known Threat Patterns for Astro SSG + localStorage theme

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Stored theme string as HTML | Tampering / XSS | Allowlist; `setAttribute('data-theme', t)` with literals only |
| Theme cookie sent to origin | Information disclosure | Use localStorage, not cookies [privacy lock] |
| Inline script vs future CSP | Elevation (breakage) | No CSP in repo today; keep script <500 bytes, no eval |
| Private-mode `SecurityError` | Denial of service (broken page) | try/catch; still set attribute from matchMedia |

## Sources

### Primary (HIGH confidence)
- HEAD `src/styles/global.css` (169 lines), `BaseLayout.astro`, `Header.astro`, `ToolShell.tsx`, `package.json`, `vitest.config.ts` via `git show HEAD:...`
- `.planning/REQUIREMENTS.md` THM-01–07
- `.planning/ROADMAP.md` Phase 7
- `.planning/config.json` `workflow.nyquist_validation: true`, `security_enforcement: true`

### Secondary (MEDIUM confidence)
- [docs.astro.build/en/guides/client-side-scripts/](https://docs.astro.build/en/guides/client-side-scripts/) — `is:inline` unprocessed scripts (curl 2026-09-16)
- [docs.astro.build/en/tutorial/6-islands/2/](https://docs.astro.build/en/tutorial/6-islands/2/) — theme toggle, no island, `localStorage` + `matchMedia` (curl 2026-09-16)
- [developer.mozilla.org/en-US/docs/Web/CSS/color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) — UA scrollbars/form controls
- [developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [developer.mozilla.org/en-US/docs/Web/API/Window/localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) — origin-scoped, `SecurityError`
- `.planning/research/{SUMMARY,STACK,FEATURES,ARCHITECTURE,PITFALLS}.md` — **treat as overlay-oriented**; do not copy overlay file lists as HEAD facts

### Tertiary (LOW confidence)
- Light-theme hex values (A1) — not in repo
- Overlay grid color `rgba(36, 48, 64, 0.35)` — working tree / milestone prose, **not HEAD**

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new packages; versions from HEAD `package.json`
- Architecture: HIGH vs HEAD; MEDIUM vs milestone research (research assumed overlay CSS)
- Pitfalls: HIGH — FOUC / overlay mix-up / scoped CSS / storage allowlist

**Research date:** 2026-09-16
**Valid until:** 2026-10-16 (stable CSS/Astro APIs)

## Planner execution notes (non-negotiable)

1. **Restore/edit HEAD** `global.css`, `BaseLayout.astro`, `Header.astro` only. Ignore dirty overlay and `src/pages/zh/`.
2. **New files:** `src/components/ThemeInit.astro`, `src/components/ThemeToggle.astro`.
3. **Touched:** those two + `src/styles/global.css` + `src/layouts/BaseLayout.astro` + `src/components/Header.astro`.
4. **Untouched:** `src/lib/**`, `src/data/tools.ts`, `src/components/tools/**`, `ToolShell.tsx`, `FaqList.astro`, `astro.config.mjs`, pages.
5. **Verify** `npm test` (existing lib tests) and `npm run build` (inline script in `dist`).
6. **UI hint:** yes — expect UI-SPEC; light hex may be adjusted there without changing architecture.
