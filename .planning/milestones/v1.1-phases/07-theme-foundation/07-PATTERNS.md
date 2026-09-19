# Phase 7: Theme Foundation - Pattern Map

**Mapped:** 2026-09-16
**Files analyzed:** 5
**Analogs found:** 3 / 5
**HEAD baseline:** Analogs from `git show HEAD:<path>` only. Do not copy dirty overlay (IBM Plex, LangSwitch, zh tree, 662-line CSS).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/ThemeInit.astro` | component | event-driven | none in HEAD (new blocking head script) | none |
| `src/components/ThemeToggle.astro` | component | event-driven | `src/components/Header.astro` (static chrome) | partial |
| `src/styles/global.css` | config | transform | `src/styles/global.css` (HEAD ~169 lines) | exact |
| `src/layouts/BaseLayout.astro` | component | request-response | `src/layouts/BaseLayout.astro` (HEAD) | exact |
| `src/components/Header.astro` | component | request-response | `src/components/Header.astro` (HEAD) | exact |

## Pattern Assignments

### `src/components/ThemeInit.astro` (component, event-driven)

**Analog:** none in HEAD. Copy the IIFE from RESEARCH / UI-SPEC, not from a repo file.

**Imports pattern:** empty frontmatter (no imports). Do not add `src/lib/theme.ts`.

**Core pattern** (from `07-UI-SPEC.md` / `07-RESEARCH.md`):

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

**Auth/guard:** none.

**Error handling:** empty `catch` around `getItem`. Always `setAttribute` with `'light'` or `'dark'` only. Do not `setItem`. Do not `matchMedia('change')`.

**Integration analog — first child of `<head>`:** `src/layouts/BaseLayout.astro` HEAD lines 17–27:

```astro
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
```

Insert `<ThemeInit />` **before** `<meta charset>`. Import in BaseLayout: `import ThemeInit from '../components/ThemeInit.astro';`

---

### `src/components/ThemeToggle.astro` (component, event-driven)

**Analog:** `src/components/Header.astro` (HEAD) — static Astro chrome, no Preact, no props, relative import of data only.

**Imports pattern** (Header HEAD lines 1–3) — ThemeToggle should have **empty** frontmatter (no SITE_NAME):

```astro
---
import { SITE_NAME } from '../data/site';
---
```

Header insertion (copy Header markup, add import + component after About):

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

Keep the three `href`s and labels verbatim (HEAD Header lines 7–9).

**Core pattern** (UI-SPEC, not in repo):

```astro
---
---
<button type="button" id="themeToggle" aria-label="Toggle color theme">
  <svg class="theme-sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
    <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
  <svg class="theme-moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
    <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/>
  </svg>
</button>
<script is:inline>
  document.getElementById('themeToggle')?.addEventListener('click', function () {
    var el = document.documentElement;
    var next = el.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    el.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
</script>
```

**Do not** use a scoped `<style>` for `[data-theme]` visibility (Astro scoping). Put `#themeToggle` rules in `global.css`.

**Error handling:** `try/catch` around `setItem` only. Click still sets `data-theme`. No toast / `role="alert"`.

**Sister analog:** `src/components/Footer.astro` HEAD — same static pattern (frontmatter import + markup, no scripts). ThemeToggle is the first chrome component that adds `is:inline`.

---

### `src/styles/global.css` (config, transform)

**Analog:** `src/styles/global.css` at HEAD (169 lines). Restore HEAD then extend — do not start from the dirty overlay.

**`:root` tokens** (HEAD lines 1–12) — keep dark hex; add `--grid-line` and `--diff-*`; keep `color-scheme: dark`:

```css
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

UI-SPEC light override (not in HEAD):

```css
:root[data-theme="light"] {
  color-scheme: light;
  --bg: #f4f6f8;
  --panel: #ffffff;
  --text: #1a1d21;
  --muted: #5c6570;
  --border: #d5dbe3;
  --accent: #0f766e;
  --danger: #b91c1c;
  --grid-line: rgba(15, 23, 32, 0.10);
  --diff-add-fg: #0f7a45;
  --diff-add-bg: #e7f7ee;
  --diff-del-fg: #b42318;
}
```

Use UI-SPEC `--danger: #b91c1c` (not RESEARCH `#dc2626`). Dark `--grid-line: rgba(42, 47, 54, 0.45)`; `--diff-add-fg: #3dd68c`; `--diff-add-bg: #13291f`; `--diff-del-fg: #f07178`. Do not duplicate `--mono` / `--sans` / `--content` under light.

**html/body** (HEAD line 16) currently:

```css
html, body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--sans); }
```

Split so `background-image` is not wiped (UI-SPEC):

```css
html {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
}
body {
  margin: 0;
  background-color: var(--bg);
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 47px,
    var(--grid-line) 47px,
    var(--grid-line) 48px
  );
  color: var(--text);
  font-family: var(--sans);
}
```

**Diff tokenize** (HEAD lines 58–65):

```css
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

Replace with `var(--diff-add-fg)`, `var(--diff-add-bg)`, `var(--diff-del-fg)`. Do not add `--diff-del-bg`.

**Keep unchanged from HEAD:** `.nav` `min-height: 3.25rem`, `.nav a.logo` `font-weight: 650`, `.nav-links` `gap: 1rem`, `.tool-panel` radius 8px, `.md-preview` / `.qr-preview` radius 6px, `var(--bg-elev, var(--panel))` on code/pre, `a:focus-visible, button:focus-visible` (toggle inherits).

**New `#themeToggle` rules** live here (UI-SPEC), not in the component.

Do **not** add overlay tokens (`--led`, `--accent-dim`, `--radius`, `--display`). Do not change QR canvas paints (do not open `QrCode.tsx`).

---

### `src/layouts/BaseLayout.astro` (component, request-response)

**Analog:** itself at HEAD.

**Imports** (HEAD lines 1–5):

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { SITE_NAME, SITE_ORIGIN } from '../data/site';
import '../styles/global.css';
```

Add: `import ThemeInit from '../components/ThemeInit.astro';`

**Props** (HEAD lines 7–14) — do not add `locale`:

```astro
interface Props {
  title: string;
  description: string;
  path: string;
}
```

**Head** (HEAD lines 17–27): keep `lang="en"`, no `data-theme` in SSG HTML, no `<meta name="color-scheme">`. First child of `<head>` is `<ThemeInit />`.

**Body:** keep `<Header />` with no props (HEAD line 29).

---

### `src/components/Header.astro` (component, request-response)

**Analog:** itself at HEAD (lines 1–13). Footer HEAD is the same chrome style if extra import examples are needed.

Do not add locale, LangSwitch, or ZH hrefs. Do not wrap or hamburger (Phase 8).

## Shared Patterns

### Static Astro chrome (not Preact)

**Source:** `src/components/Header.astro`, `src/components/Footer.astro` (HEAD)
**Apply to:** ThemeInit, ThemeToggle

- PascalCase `.astro`
- Relative imports
- No `client:load`
- Almost no comments

### CSS tokens on `:root`

**Source:** `src/styles/global.css` HEAD lines 1–16, 20–27
**Apply to:** token split + toggle + grid

Components already consume `var(--bg)`, `var(--text)`, `var(--accent)`, `var(--border)`. Light theme is variable override only.

### Focus ring

**Source:** `src/styles/global.css` HEAD line 18

```css
a:focus-visible, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

Toggle inherits. Do not restyle `.tool-panel button` this phase.

### Error handling (storage)

**Source:** none in HEAD. RESEARCH/UI-SPEC: empty `catch`; allowlist `'light'|'dark'`; never `innerHTML` from storage.

### Testing

**Source:** HEAD `vitest.config.ts` — `src/**/*.test.ts`, Node. Do **not** add jsdom theme tests or `src/lib/theme.test.ts`. Gate: `npm test` (existing lib) + `npm run build` + grep inline IIFE in `dist`.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/ThemeInit.astro` | component | event-driven | HEAD has no `<script is:inline>` in `<head>` |
| `src/components/ThemeToggle.astro` | component | event-driven | HEAD has no theme control; Header is markup-only |

Planner should use `07-RESEARCH.md` Pattern 2/3 and `07-UI-SPEC.md` ThemeInit / ThemeToggle sections for those two files.

## Metadata

**Analog search scope:** `git show HEAD:` `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/styles/global.css`; `git ls-files` confirmed tracked.
**Files scanned:** 4 HEAD sources
**Pattern extraction date:** 2026-09-16
**Do not analogize:** dirty `LangSwitch.astro`, `src/pages/zh/`, overlay `global.css`
