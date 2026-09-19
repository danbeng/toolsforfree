# Phase 8: Mobile Hamburger Menu - Pattern Map

**Mapped:** 2026-09-16
**Files analyzed:** 5
**Analogs found:** 5 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/NavMenu.astro` | component | event-driven | `src/components/ThemeToggle.astro` | exact |
| `src/components/Header.astro` | component | request-response | `src/components/Header.astro` (self) | exact |
| `src/styles/global.css` | config | transform | `src/styles/global.css` (`#themeToggle` + `.nav`) | exact |
| `src/i18n/ui.ts` | config | transform | `src/i18n/ui.ts` (`t` / nested `tools`) | exact |
| `src/layouts/BaseLayout.astro` | layout | request-response | `src/layouts/BaseLayout.astro` | exact (do not change this phase) |

Optional test (planner choice, not required): Node Vitest key-parity on `ui.en.nav` / `ui.zh.nav` — analog `src/i18n/errors.test.ts` “shares … chrome keys on en and zh”. Do **not** add Playwright, `theme.test.ts`, or jsdom.

## Pattern Assignments

### `src/components/NavMenu.astro` (component, event-driven)

**Analog:** `src/components/ThemeToggle.astro`

**Imports / frontmatter** (ThemeToggle lines 1–2 — empty frontmatter; NavMenu adds locale + `t`):

```astro
---
---
```

NavMenu should use `t` from `src/i18n/ui.ts` (lines 182–187):

```typescript
export type Locale = 'en' | 'zh';
export type UiDict = (typeof ui)['en'];

export function t(locale: Locale): UiDict {
  return ui[locale];
}
```

Copy: `import { t, type Locale } from '../i18n/ui';` then `interface Props { locale: Locale }` and `const copy = t(Astro.props.locale);`. Do **not** import from `../i18n/locales` (file does not exist on HEAD).

**Auth pattern:** none (public chrome).

**Core pattern** — button + inline SVG + `is:inline` (ThemeToggle lines 3–19):

```astro
<button type="button" id="themeToggle" aria-label="Toggle color theme">
  <svg class="theme-sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
    ...
  </svg>
</button>
<script is:inline>
  document.getElementById('themeToggle')?.addEventListener('click', function () {
    ...
  });
</script>
```

Clone for `#navToggle`: `type="button"`, 24×24 viewBox SVG, `aria-hidden="true"` `focusable="false"`, `stroke="currentColor"`, `is:inline` classic script (not `type="module"`, not Preact). Differences vs ThemeToggle (locked by 08-UI-SPEC):

- `aria-expanded="false"` `aria-controls="navMenu"`
- `aria-label={copy.nav.menu}` plus `data-label-menu` / `data-label-close`
- One 3-line path `d="M5 7h14M5 12h14M5 17h14"` — do not morph to X; do not use two SVGs like sun/moon
- **No** `localStorage` (ThemeToggle lines 16–17 persist theme; menu is DOM-only)

**Parse-order vs ThemeToggle:** ThemeToggle only binds its own button (exists above the script). `#navMenu` is a **later sibling** in Header. Do not `getElementById('navMenu')` synchronously. Wrap boot in `DOMContentLoaded` when `document.readyState === 'loading'` (RESEARCH Pattern 3). Keep `is:inline`.

**IIFE wrapping analog:** `src/components/ThemeInit.astro` lines 3–14:

```javascript
(function () {
  var t = null;
  try { t = localStorage.getItem('theme'); } catch (e) {}
  ...
  document.documentElement.setAttribute('data-theme', t);
})();
```

Copy the IIFE + `var` style. **Do not** copy ThemeInit’s `localStorage` / `try/catch` / `prefers-color-scheme`. Menu script: no storage, no error chrome.

**Error handling:** ThemeToggle uses `try { localStorage } catch (e) {}`. NavMenu: null-check `#navToggle` / `#navMenu` / `nav.nav` / `header.site` and return; no `role="alert"`. Labels via `getAttribute` / `setAttribute` only — no `innerHTML`.

---

### `src/components/Header.astro` (component, request-response)

**Analog:** itself (HEAD, 16 lines). Placement target is 08-UI-SPEC / RESEARCH Pattern 1.

**Imports pattern** (lines 1–4):

```astro
---
import { SITE_NAME } from '../data/site';
import ThemeToggle from './ThemeToggle.astro';
---
```

Add: `import NavMenu from './NavMenu.astro';` and `import type { Locale } from '../i18n/ui';`

**Core markup** (lines 5–15 today — ThemeToggle **inside** `.nav-links`; Phase 8 must move it out):

```astro
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

Target DOM order (locked): logo → `<NavMenu locale={locale} />` → `<div class="nav-links" id="navMenu">` (three links only) → `<ThemeToggle />`. Keep hrefs/labels verbatim. Optional `locale` prop default `'en'`:

```astro
interface Props {
  locale?: Locale;
}
const locale = Astro.props.locale ?? 'en';
```

Do not localize Tools/Blog/About. Do not put ThemeToggle inside `#navMenu`.

---

### `src/styles/global.css` (config, transform)

**Analog:** `#themeToggle` box model (lines 66–85) and `.nav` / `.nav-links` (lines 61–65). Duplicate 44×44 — **do not** share a class with `#themeToggle`.

**Core `#themeToggle` pattern** (lines 66–85):

```css
#themeToggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  margin: 0;
  border: 0;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}
#themeToggle svg {
  width: 20px;
  height: 20px;
  display: block;
}
```

`#navToggle` copies that box but default `display: none` (desktop not in tab order). `inline-flex` only inside `@media (max-width: 640px)`.

**Nav layout to keep** (lines 61–65):

```css
.nav { display: flex; gap: 1.25rem; align-items: center; min-height: 3.25rem; }
.nav a.logo { color: var(--text); text-decoration: none; font-weight: 650; }
.nav-links { display: flex; gap: 1rem; margin-left: auto; }
.nav-links a { color: var(--text); text-decoration: none; }
.nav-links a:hover { color: var(--accent); }
```

Leave `.nav` min-height/gap and logo `font-weight: 650`. Desktop keeps `.nav-links { margin-left: auto }`. Mobile only: `#themeToggle { margin-left: auto }` after `.nav-links` is `position: absolute`.

**Tokens to reuse** (`:root` lines 7–11, light 22–26): `--panel`, `--border`, `--text`, `--accent`. Overlay fill `var(--panel)`, hairline `1px solid var(--border)`. Focus already on `button:focus-visible` (line 56) — hamburger inherits.

**Media query analog:** existing `@media (min-width: 720px)` for `.tool-grid` (lines 102–104) is **not** the hamburger breakpoint. New query is **only** `@media (max-width: 640px)`. Do not add `--sp-*`. Put hamburger/overlay rules in this file, not component `<style>`.

**Existing `header.site`** (lines 58–59): `border-bottom: 1px solid var(--border)` — overlay has **no** top border. Do **not** add `position: sticky` (dirty overlay). At ≤640px only: `header.site { position: relative; z-index: 20; }`.

---

### `src/i18n/ui.ts` (config, transform)

**Analog:** same file — nested objects under `en` / `zh`, then `t(locale)`.

**Structure** (lines 1–3, 91, 180–187): `ui.en.tools` / `ui.zh.tools` then:

```typescript
} as const;

export type Locale = 'en' | 'zh';
export type UiDict = (typeof ui)['en'];

export function t(locale: Locale): UiDict {
  return ui[locale];
}
```

Add **nested** `nav: { menu, close }` as a **sibling of `tools`** on **both** locales so `copy.nav.menu` types via `UiDict`. Do not use dotted string keys `'nav.menu'`.

EN: `menu: 'Open menu'`, `close: 'Close menu'`. ZH: `menu: '打开菜单'`, `close: '关闭菜单'`. Do not change `tools` entries.

**Optional test analog:** `src/i18n/errors.test.ts` lines 17–22 (`shares lorem-ipsum chrome keys on en and zh`). If added: assert `ui.en.nav` / `ui.zh.nav` properties in Node Vitest. Do not create `theme.test.ts`.

---

### `src/layouts/BaseLayout.astro` (layout, request-response)

**Analog:** itself. RESEARCH / UI-SPEC: **do not touch** this phase.

**Header usage** (lines 1–4, 28–29):

```astro
import Header from '../components/Header.astro';
...
    <Header />
    <main class="wrap">
```

Keep `<Header />` with no locale (defaults `'en'`). Do not pass locale from dirty `src/pages/zh/`. ThemeInit in `<head>` (line 21) stays independent of NavMenu.

---

## Shared Patterns

### Static chrome + `is:inline` (not Preact)

**Source:** `src/components/ThemeToggle.astro` lines 3–19; `src/components/ThemeInit.astro` lines 3–14
**Apply to:** `NavMenu.astro` only
- Native `<button type="button">`, unique `id`, SVG `aria-hidden`
- Classic `is:inline` IIFE, `var`, `addEventListener`
- No `client:load`, no `src/lib`, no new npm packages

### 44×44 icon button box model

**Source:** `src/styles/global.css` lines 66–85
**Apply to:** `#navToggle` in `global.css` (duplicate, do not share class)

### Locale dictionary + `t()`

**Source:** `src/i18n/ui.ts` lines 182–187
**Apply to:** `NavMenu.astro` frontmatter; Header `locale` prop
- Nested keys on both `en` and `zh`
- Script swaps `aria-label` from `data-label-*`, never hardcodes English

### Header composition

**Source:** `src/components/Header.astro` lines 5–15; `src/layouts/BaseLayout.astro` line 29
**Apply to:** Header restructure only
- `header.site` > `nav.wrap.nav`
- Logo `href="/"` + `SITE_NAME`
- ThemeToggle remains always visible, sibling **outside** collapsible group

### Error / privacy

**Source:** ThemeToggle `try/catch` around storage (do **not** copy storage); UI-SPEC copy contract
**Apply to:** NavMenu script
- Null-check DOM nodes; no toast/`role="alert"`
- No `localStorage` for menu state; no cookies

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | Disclosure open/close (Escape, `inert`, `matchMedia('change')`) has no existing site analog. Copy ThemeToggle **shape**; implement behavior from 08-UI-SPEC Script contract + RESEARCH Code Examples skeleton. |

## Do not copy

- Dirty working tree: `LangSwitch.astro`, `src/pages/zh/`, IBM Plex/Syne, sticky/blur header, stash `stash@{0}` / `stash@{1}`
- `ThemeToggle.astro` / `ThemeInit.astro` source edits
- `src/lib/**`, catalog, tool islands, `astro.config.mjs`, `src/pages/**`
- Checkbox / `<details>` hamburger; Preact island; `window.resize`; scoped component CSS for overlay

## Metadata

**Analog search scope:** `src/components/` (ThemeToggle, ThemeInit, Header), `src/styles/global.css`, `src/i18n/ui.ts`, `src/i18n/errors.test.ts`, `src/layouts/BaseLayout.astro`
**Files scanned:** 7 tracked analogs (git ls-files non-empty)
**Pattern extraction date:** 2026-09-16
