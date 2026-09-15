# Architecture Research: Visual Polish Milestone

**Domain:** Static Astro 7 + Preact site, CSS variable theming, responsive layout, interactive chrome
**Researched:** 2026-09-15
**Confidence:** HIGH

## System Overview: Visual Polish Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                        <head> (blocking inline script)           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ThemeInit.astro  ── reads localStorage / matchMedia ──>  │  │
│  │  sets document.documentElement.dataset.theme BEFORE paint  │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                        global.css (CSS custom properties)        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ :root (shared)  │  │ :root[data-    │  │ :root[data-    │    │
│  │ fonts, radius,  │  │ theme="dark"]  │  │ theme="light"] │    │
│  │ spacing scale   │  │ dark palette   │  │ light palette  │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                        Astro Components (static)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Header.astro  │  │ Footer.astro │  │ FaqList.astro│          │
│  │ + ThemeToggle │  │ (unchanged)  │  │ → <details>  │          │
│  │ + MobileMenu  │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                        Preact Islands (client:load)              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ToolShell.tsx  ── inherits CSS vars, no theme logic ──>  │   │
│  │  All 18 tool .tsx components ── CSS-only polish ──>       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Integration Points

### Where Visual Features Touch Existing Components

| Feature | New Files | Modified Files | Integration Mechanism |
|---------|-----------|----------------|----------------------|
| Light/dark theme | `ThemeInit.astro`, `ThemeToggle.astro` | `global.css`, `BaseLayout.astro`, `Header.astro` | CSS custom properties + `data-theme` attribute + blocking `<script>` |
| Mobile hamburger | `MobileMenu.astro` (or inline in Header) | `Header.astro`, `global.css` | CSS `:checked` pseudo-class, no JS framework |
| 3-col card grid | none | `global.css` | Single `@media` breakpoint addition |
| Spacing scale | none | `global.css` | CSS custom properties in `:root` |
| Button/panel polish | none | `global.css` | Existing selectors, enhanced states |
| FAQ collapsible | none | `FaqList.astro`, `global.css` | `<details>/<summary>` semantic HTML |

## New vs Modified: Explicit List

### NEW Files (2-3 total)

| File | Type | Purpose | Why New |
|------|------|---------|---------|
| `src/components/ThemeInit.astro` | Astro (inline script) | Blocking `<script is:inline>` in `<head>` that reads `localStorage.theme` and `matchMedia('(prefers-color-scheme: dark)')`, sets `document.documentElement.dataset.theme` before first paint | Must execute synchronously in `<head>` to prevent FOUC; cannot be a Preact island (too late in lifecycle) |
| `src/components/ThemeToggle.astro` | Astro (static) | Button with sun/moon SVG icons, inline click handler that toggles `data-theme` + writes `localStorage` | Static Astro component, not Preact island; the button is stateless (CSS handles icon visibility via `data-theme` selector) |

### MODIFIED Files (4-6 total)

| File | Changes | Scope of Change |
|------|---------|-----------------|
| `src/styles/global.css` | Split `:root` tokens into light/dark via `data-theme` selectors; add spacing scale vars; add 3-col grid breakpoint; enhance button/panel/FAQ styles | Largest change; affects every visual element |
| `src/layouts/BaseLayout.astro` | Import + render `ThemeInit` in `<head>` (before `<meta charset>` for earliest execution) | 2-line addition |
| `src/components/Header.astro` | Import `ThemeToggle.astro`; add hamburger menu markup; restructure `.nav-links` for collapse | Moderate restructure of nav section |
| `src/components/FaqList.astro` | Change `<dl>/<dt>/<dd>` to `<details>/<summary>/<p>` | Template rewrite, no logic change |
| `src/i18n/ui.ts` | Add `themeLight`, `themeDark`, `menuToggle` string keys to both `en` and `zh` dictionaries | Small addition, i18n parity |
| `src/data/site.ts` | No change needed | -- |

### UNTOUCHED Files

| Category | Files | Why |
|----------|-------|-----|
| Tool logic | `src/lib/*.ts` | Constraint: visual-only milestone |
| Tool islands | `src/components/tools/*.tsx` | Tool UIs inherit CSS vars automatically; no component-level changes needed |
| ToolShell | `src/components/ToolShell.tsx` | Already uses CSS classes; will inherit polish from `global.css` |
| Tool catalog | `src/data/tools.ts` | No routing changes |
| Content | `src/content/tools/*.md` | SEO copy unchanged |
| Pages | `src/pages/**/*.astro` | Pages compose from modified components; no page-level changes |
| Config | `astro.config.mjs` | No integration changes |

## Recommended Architecture

### Pattern 1: `data-theme` Attribute Theming (Not Class-Based)

**What:** Instead of toggling a `.dark` class on `<html>`, set `document.documentElement.dataset.theme = 'light' | 'dark'`. CSS targets via `:root[data-theme="dark"]` and `:root[data-theme="light"]`.

**When to use:** Always for this project.

**Trade-offs:**
- Pro: More semantic than a class; avoids specificity fights with utility classes
- Pro: `dataset.theme` is a clean JS API (`element.dataset.theme = 'light'`)
- Pro: CSS selectors are equally specific to class-based approach
- Con: Slightly longer CSS selectors than `.dark` (negligible)

**Why not class-based:** The Astro docs use `.dark` on `<html>`, but this project has no utility CSS framework. The `data-theme` attribute is self-documenting and cannot conflict with any class name.

**CSS structure in global.css:**

```css
/* ── Shared tokens (theme-independent) ── */
:root {
  --mono: "IBM Plex Mono", ...;
  --sans: "IBM Plex Sans", ...;
  --display: Syne, ...;
  --content: 64rem;
  --measure: 42rem;
  --radius: 10px;
  --ease: 180ms ease;

  /* ── Spacing scale (new) ── */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-6: 24px;
  --sp-8: 32px;
  --sp-12: 48px;
}

/* ── Dark theme (default + explicit) ── */
:root,
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0c1014;
  --bg-elev: #12181f;
  --panel: #151c24;
  --text: #e7edf3;
  --muted: #8b9aab;
  --border: #243040;
  --accent: #3ecfbf;
  --accent-dim: #1a3d3a;
  --danger: #f07178;
  --led: #3ecfbf;
}

/* ── Light theme ── */
:root[data-theme="light"] {
  color-scheme: light;
  --bg: #f8f9fb;
  --bg-elev: #ffffff;
  --panel: #ffffff;
  --text: #1a1f26;
  --muted: #5a6876;
  --border: #d8dee6;
  --accent: #0d9488;
  --accent-dim: #ccfbf1;
  --danger: #dc2626;
  --led: #0d9488;
}
```

**Body background grid adaptation for light mode:**

```css
body {
  background-image:
    linear-gradient(180deg, rgba(62, 207, 191, 0.04), transparent 28rem),
    repeating-linear-gradient(
      90deg, transparent, transparent 47px,
      rgba(36, 48, 64, 0.35) 47px, rgba(36, 48, 64, 0.35) 48px
    );
}

:root[data-theme="light"] body {
  background-image:
    linear-gradient(180deg, rgba(13, 148, 136, 0.06), transparent 28rem),
    repeating-linear-gradient(
      90deg, transparent, transparent 47px,
      rgba(216, 222, 230, 0.5) 47px, rgba(216, 222, 230, 0.5) 48px
    );
}
```

### Pattern 2: Blocking Head Script for Theme Init (FOUC Prevention)

**What:** An Astro component with `<script is:inline>` that runs synchronously in `<head>` before the browser paints. Reads `localStorage.theme`; falls back to `matchMedia('(prefers-color-scheme: dark)')`; sets `document.documentElement.dataset.theme`.

**When to use:** Every page load. Must be in `<head>`, before any CSS-triggering elements.

**Why `is:inline`:** Astro's bundled `<script>` tags are deferred by default and execute after DOM parse. Only `is:inline` scripts run synchronously, which is required for FOUC prevention.

**Trade-offs:**
- Pro: Zero FOUC -- theme is set before first paint
- Pro: No Preact hydration needed (pure DOM API)
- Con: Inline script is duplicated on every page (tiny ~200 bytes, acceptable)

**ThemeInit.astro:**

```astro
---
// No frontmatter needed — pure inline script
---
<script is:inline>
  (function () {
    var t = localStorage.getItem('theme');
    if (t !== 'light' && t !== 'dark') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = t;
  })();
</script>
```

**Integration in BaseLayout.astro:**

```astro
---
import ThemeInit from '../components/ThemeInit.astro';
---
<!doctype html>
<html lang={LOCALE_META[locale].htmlLang}>
  <head>
    <ThemeInit />
    <meta charset="utf-8" />
    <!-- rest of head -->
  </head>
```

### Pattern 3: Static Theme Toggle (No Preact Island)

**What:** An Astro component rendering a `<button>` with sun/moon SVG. An inline `<script>` attaches a click handler that toggles `document.documentElement.dataset.theme` and writes to `localStorage`. Icon visibility is CSS-driven via `data-theme` selectors.

**When to use:** In `Header.astro`, alongside nav links.

**Why static (not Preact):** The toggle has no reactive state. The button is always visible; only the icon changes, which CSS handles. A Preact island would add ~3KB of hydration JS for zero benefit.

**ThemeToggle.astro:**

```astro
---
import type { Locale } from '../i18n/locales';
import { t } from '../i18n/ui';

interface Props { locale: Locale }
const { locale } = Astro.props;
const copy = t(locale);
---

<button id="themeToggle" type="button" aria-label={copy.themeToggle}>
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
    <path class="theme-sun" fill="currentColor" d="M12 17.5a5.5 5.5 0 1 0 0-11 ..."/>
    <path class="theme-moon" fill="currentColor" d="M16.5 6A10.5 10.5 0 0 1 ..."/>
  </svg>
</button>

<style>
  #themeToggle {
    background: none;
    border: 0;
    cursor: pointer;
    padding: 0.4rem;
    min-height: 44px;
    min-width: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
  }
  #themeToggle:hover { color: var(--text); }
  .theme-sun { display: block; }
  .theme-moon { display: none; }
  :root[data-theme="dark"] .theme-sun { display: none; }
  :root[data-theme="dark"] .theme-moon { display: block; }
</style>

<script is:inline>
  document.getElementById('themeToggle')?.addEventListener('click', function () {
    var el = document.documentElement;
    var next = el.dataset.theme === 'dark' ? 'light' : 'dark';
    el.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
</script>
```

### Pattern 4: CSS-Only Mobile Hamburger (Checkbox Trick)

**What:** A hidden checkbox + label styled as a hamburger icon. When `:checked`, sibling `.nav-links` gets `display: flex; flex-direction: column`. Pure CSS, no JS framework.

**When to use:** At `max-width: 640px` breakpoint.

**Why CSS-only over Preact island:**
- Pro: Zero JS payload; works without hydration
- Pro: `<input type="checkbox">` is natively keyboard-accessible (Space/Enter to toggle)
- Pro: Astro SSG outputs static HTML; CSS trick works perfectly
- Con: Cannot trap focus (acceptable for a simple nav overlay)
- Con: State is not programmatically accessible (not needed here)

**Markup in Header.astro:**

```astro
<header class="site">
  <nav class="wrap nav">
    <a class="logo" href={localizedPath(locale, '/')}>
      <span class="logo-mark" aria-hidden="true"></span>
      {SITE_NAME}
    </a>
    <input
      type="checkbox"
      id="navToggle"
      class="nav-toggle"
      aria-label={copy.menuToggle}
    />
    <label for="navToggle" class="nav-hamburger" aria-hidden="true">
      <span></span><span></span><span></span>
    </label>
    <div class="nav-links">
      <!-- existing nav links + ThemeToggle + LangSwitch -->
      <a href={...}>{copy.navTools}</a>
      <a href={...}>{copy.navBlog}</a>
      <a href={...}>{copy.navAbout}</a>
      <ThemeToggle locale={locale} />
      <LangSwitch locale={locale} />
    </div>
  </nav>
</header>
```

**CSS for hamburger:**

```css
.nav-toggle { display: none; }

.nav-hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  padding: 0.5rem;
  min-height: 44px;
  min-width: 44px;
  justify-content: center;
  margin-left: auto;
}

.nav-hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--text);
  transition: transform var(--ease), opacity var(--ease);
}

@media (max-width: 640px) {
  .nav-hamburger { display: flex; }

  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-elev);
    border-bottom: 1px solid var(--border);
    flex-direction: column;
    padding: 0.75rem 1.25rem;
    gap: 0.25rem;
  }

  .nav-toggle:checked ~ .nav-links { display: flex; }

  /* Hamburger → X animation */
  .nav-toggle:checked ~ .nav-hamburger span:nth-child(1) {
    transform: translateY(6px) rotate(45deg);
  }
  .nav-toggle:checked ~ .nav-hamburger span:nth-child(2) {
    opacity: 0;
  }
  .nav-toggle:checked ~ .nav-hamburger span:nth-child(3) {
    transform: translateY(-6px) rotate(-45deg);
  }
}
```

**Key constraint:** The checkbox `<input>` must be a sibling of `.nav-links` (not a child) for the CSS `~` combinator to work. This means it sits inside `<nav>` but outside `<div class="nav-links">`.

### Pattern 5: CSS Spacing Scale via Custom Properties

**What:** Define a t-shirt sizing scale as CSS custom properties in `:root`. Replace hardcoded `px`/`rem` values throughout `global.css` with these variables.

**When to use:** All spacing values in the visual layer.

**Scale:** `--sp-1: 4px`, `--sp-2: 8px`, `--sp-3: 12px`, `--sp-4: 16px`, `--sp-6: 24px`, `--sp-8: 32px`, `--sp-12: 48px`. Matches the 4px base grid specified in PROJECT.md.

**Trade-offs:**
- Pro: Consistent spacing across all components
- Pro: Single place to adjust the entire site's rhythm
- Con: Requires a pass over all existing spacing values (one-time cost)

**Migration strategy:** Do not replace every hardcoded value at once. Add the variables first, then migrate selectors that are being touched by the other visual changes (header, card-grid, tool-panel, FAQ). Leave untouched selectors for a follow-up if desired.

### Pattern 6: 3-Column Card Grid Breakpoint

**What:** Add a `@media (min-width: 1080px)` rule to `.card-grid` for 3 columns.

**Current state:** 1-col default, 2-col at 720px.

**Change in global.css:**

```css
.card-grid {
  display: grid;
  gap: var(--sp-2);  /* 8px, migrated from 0.85rem */
  grid-template-columns: 1fr;
}

@media (min-width: 720px) {
  .card-grid { grid-template-columns: 1fr 1fr; }
}

@media (min-width: 1080px) {
  .card-grid { grid-template-columns: 1fr 1fr 1fr; }
}
```

### Pattern 7: FAQ `<details>` Collapsible

**What:** Replace `<dl>/<dt>/<dd>` with `<details>/<summary>` semantic HTML. CSS styles the expand/collapse with a rotated indicator.

**Why `<details>` over Preact toggle:**
- Natively accessible (keyboard, screen reader)
- Zero JS
- Works with SSG output

**FaqList.astro rewrite:**

```astro
<h2>{heading}</h2>
<div class="faq">
  {items.map((item) => (
    <details class="faq-item">
      <summary>{item.question}</summary>
      <p>{item.answer}</p>
    </details>
  ))}
</div>
```

**CSS:**

```css
.faq-item {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--panel);
  margin-bottom: var(--sp-2);
}

.faq-item summary {
  padding: var(--sp-4) var(--sp-4);
  cursor: pointer;
  font-weight: 600;
  color: var(--text);
  list-style: none;
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.faq-item summary::before {
  content: '';
  width: 0;
  height: 0;
  border-left: 5px solid var(--accent);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  transition: transform var(--ease);
  flex-shrink: 0;
}

.faq-item[open] summary::before {
  transform: rotate(90deg);
}

.faq-item > p {
  padding: 0 var(--sp-4) var(--sp-4);
  margin: 0;
  color: var(--muted);
}
```

## Data Flow: Theme Lifecycle

```
Page Load
    │
    ▼
ThemeInit.astro <script is:inline>  (synchronous, before paint)
    │
    ├─ localStorage.getItem('theme') ──> 'light' | 'dark' | null
    │
    ├─ if null: matchMedia('(prefers-color-scheme: dark)').matches
    │
    └─ document.documentElement.dataset.theme = result
    │
    ▼
Browser paints with correct theme (no FOUC)
    │
    ▼
User clicks ThemeToggle button
    │
    ├─ Toggle dataset.theme
    ├─ localStorage.setItem('theme', newValue)
    │
    └─ CSS vars cascade instantly (no re-render needed)
```

## Build Order (Dependency-Aware)

### Phase 1: Theme Foundation (No Visual Breakage)
1. **global.css** -- Split `:root` into shared + dark + light token blocks using `data-theme` selectors. Dark values stay as default (`:root` without attribute), so existing behavior is preserved before ThemeInit runs.
2. **ThemeInit.astro** -- Create the blocking head script.
3. **BaseLayout.astro** -- Import and render ThemeInit in `<head>`.
4. **ThemeToggle.astro** -- Create the toggle button component.
5. **Header.astro** -- Import and place ThemeToggle in nav.
6. **i18n/ui.ts** -- Add `themeToggle`, `themeLight`, `themeDark` keys.

**Verification:** Build, open in browser, verify dark mode unchanged. Manually set `document.documentElement.dataset.theme = 'light'` in DevTools to verify light tokens apply.

### Phase 2: Mobile Hamburger (Independent of Theme)
7. **Header.astro** -- Add checkbox input + hamburger label markup.
8. **global.css** -- Add hamburger CSS, nav collapse at 640px, X animation.
9. **i18n/ui.ts** -- Add `menuToggle` key.

**Verification:** Resize to 320px, verify hamburger appears, nav collapses, toggles open/closed. Tab through to verify keyboard access.

### Phase 3: Grid + Spacing (Pure CSS, No Component Changes)
10. **global.css** -- Add spacing scale variables. Add 1080px breakpoint for 3-col grid. Migrate touched selectors to use spacing vars.

**Verification:** Resize through 720px and 1080px breakpoints; verify card grid columns change.

### Phase 4: Interactive Chrome (Pure CSS + Template)
11. **global.css** -- Button hover/active/focus-visible polish. Tool-panel border/shadow refinement.
12. **FaqList.astro** -- Rewrite to `<details>/<summary>`.
13. **global.css** -- FAQ collapsible styles.

**Verification:** Click FAQ items to expand/collapse. Verify button states on hover/active.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Theme Toggle as Preact Island

**What people do:** Wrap the theme toggle in a Preact component with `useState` and `client:load`.

**Why it's wrong:** The toggle has no reactive state. The icon is CSS-controlled. A Preact island adds ~3KB hydration JS and delays theme application until hydration completes (potential FOUC on slow connections).

**Do this instead:** Use a static Astro component with `<script is:inline>` for the click handler. CSS handles icon visibility via `data-theme` selectors.

### Anti-Pattern 2: `matchMedia` Listener for Theme Changes

**What people do:** Add a `matchMedia('prefers-color-scheme: dark')` change listener that auto-switches theme when the OS preference changes.

**Why it's wrong:** If the user has manually selected a theme via the toggle, an OS preference change would override their choice. This creates a confusing UX where the site "fights" the user.

**Do this instead:** Only read `matchMedia` on initial load (when `localStorage.theme` is null). After the user manually toggles, their choice is persisted and `matchMedia` is ignored.

### Anti-Pattern 3: CSS-Only Theme Without Blocking Script

**What people do:** Use `@media (prefers-color-scheme: dark)` in CSS for the default theme, then toggle a class for manual override.

**Why it's wrong:** There is no way to "override" a `prefers-color-scheme` media query with a class. You would need `!important` or duplicate all CSS rules. This is fragile and unmaintainable.

**Do this instead:** Use CSS custom properties. The blocking script sets the attribute before paint. CSS variables swap values based on the attribute. This is the standard pattern recommended by the Astro docs.

### Anti-Pattern 4: Hamburger via Preact State

**What people do:** Add a `useState(false)` for menu open/close in a Preact island.

**Why it's wrong:** Adds hydration delay; menu flickers if JS loads slowly. The checkbox CSS trick is natively accessible and zero-JS.

**Do this instead:** CSS checkbox trick. `<input type="checkbox">` is keyboard-accessible by default. CSS `:checked ~ .nav-links` handles visibility.

### Anti-Pattern 5: Separate CSS Files Per Theme

**What people do:** Create `light.css` and `dark.css` and conditionally import based on theme.

**Why it's wrong:** Duplicates all non-color styles. Maintenance nightmare. Astro does not support conditional CSS imports at build time based on runtime state.

**Do this instead:** Single `global.css` with `data-theme` selectors for color tokens only. Shared tokens stay in `:root`.

## Scaling Considerations

| Scale | Concern | Approach |
|-------|---------|----------|
| Current (18 tools, static) | Theme flash | Blocking inline script + CSS vars (this architecture) |
| 50+ tools | global.css size | Split into `base.css`, `theme.css`, `components.css`; import all in BaseLayout |
| If SSR added later | Theme persistence | Same pattern works; `data-theme` is client-side only |

## Sources

- Astro official tutorial: Theme toggle with `is:inline` script and `localStorage` -- https://github.com/withastro/docs/blob/main/src/content/docs/en/tutorial/6-islands/2.mdx
- Astro view transitions: `astro:after-swap` event for theme persistence -- https://github.com/withastro/docs/blob/main/src/content/docs/en/guides/view-transitions.mdx
- Existing codebase: `src/styles/global.css` (dark-only `:root`), `src/layouts/BaseLayout.astro` (import chain), `src/components/Header.astro` (nav structure)
- CSS `data-*` attribute selectors: MDN Web Docs
- `<details>/<summary>` accessibility: MDN Web Docs (natively accessible, no ARIA needed)

---
*Architecture research for: Devtoolbox v1.1 Frontend Polish*
*Researched: 2026-09-15*
*Confidence: HIGH -- all patterns verified against Astro 7 official docs and existing codebase*
