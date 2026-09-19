# Phase 8: Mobile Hamburger Menu - Research

**Researched:** 2026-09-16
**Domain:** Astro 7 static chrome — accessible ≤640px disclosure nav (`<button>` + `is:inline`, not Preact)
**Confidence:** HIGH (architecture vs HEAD + approved 08-UI-SPEC); MEDIUM (script parse-order mitigation)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Markup & placement
- Place the hamburger after the logo and before `.nav-links`; ThemeToggle stays a sibling **outside** the collapsible group
- ThemeToggle remains always visible on narrow screens — do not put it inside the drawer (Phase 7 control stays independent)
- Open menu is an overlay panel under the header (`position: absolute`); do not push page content or use a fullscreen drawer
- Implement as static Astro + `is:inline` click/Escape script — not a Preact island, not `<details>`/`<summary>`

#### Interaction & a11y
- Collapsed nav uses `inert` **and** `visibility: hidden` so hidden links are not keyboard-focusable (NAV-04)
- Escape closes an open menu and returns focus to the hamburger button (NAV-03)
- Pointer-down outside the header closes the open menu (common hamburger; not in ROADMAP but in scope)
- Do **not** lock body scroll and do **not** add a focus trap — ROADMAP does not require them

#### Labels, i18n & breakpoint
- Add `ui.ts` keys `nav.menu` / `nav.close` (NAV-05); Header reads them from a locale prop
- Header gets an optional `locale` prop defaulting to `'en'` (HEAD Header has no locale today; match tool-island pattern)
- Show the hamburger and collapse links at `@media (max-width: 640px)` (NAV-01); wider widths keep the full nav
- Leaving ≤640px force-closes the menu and clears `aria-expanded` so a leftover overlay cannot persist on desktop

#### Chrome, HEAD/ZH & out of scope
- Inline 3-line SVG icon (same chrome family as ThemeToggle sun/moon) — no `☰` glyph, no icon pack
- Hit target 44×44, matching `#themeToggle`
- Ship `ui.ts` + Header `locale` prop this phase; **do not** commit the dirty `src/pages/zh/` overlay. EN pages use default `'en'`; future ZH pages pass `'zh'`
- Do not change ThemeToggle, `src/lib`, or the catalog. No focus trap, scroll lock, animation library, or stash pop (`stash@{0}` overlay chrome, `stash@{1}` i18n)

#### Specific Ideas
- Real `<button>` with `aria-expanded` and `aria-controls` (NAV-02) — not a checkbox hack (PROJECT.md Key Decisions updated after Phase 7)
- Two-state open/closed only; no animation library
- Do not pop `stash@{0}` (`gsd-phase7-overlay-chrome-temp`) or `stash@{1}` (`pre-02-01-merge unrelated i18n`)
- Privacy unchanged: no cookies, no server; menu state is DOM-only (not localStorage)

### Claude's Discretion
- Exact overlay panel tokens (background, border, z-index) within existing `--panel` / `--border`
- Exact 3-line SVG path geometry
- Whether `matchMedia('(max-width: 640px)')` listener or `resize` closes on widen — both must force-close
- Whether hamburger lives as `NavMenu.astro` or inline in `Header.astro` (prefer a small dedicated component if Header would exceed current size)

### Deferred Ideas (OUT OF SCOPE)
- Focus trap and body scroll lock — not in ROADMAP; revisit if UAT shows overlay issues
- Committing dirty `src/pages/zh/` / `LangSwitch` — later i18n milestone or overlay merge, not this phase
- ThemeToggle ZH `aria-label` via `ui.ts` — Phase 7 deferred until ZH chrome exists; still out of Phase 8 unless Header locale wiring makes it free (do not expand ThemeToggle unless planner proves zero extra risk)
- Spacing scale (Phase 9), button/FAQ chrome (Phase 10)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | Hamburger menu button visible at ≤640px, collapses nav links | `@media (max-width: 640px)` in `global.css`; `#navToggle { display: none }` default, `inline-flex` inside the query; overlay `position: absolute` under `header.site` — Pattern 1, 08-UI-SPEC Overlay + breakpoint |
| NAV-02 | Hamburger uses `<button>` with `aria-expanded` and `aria-controls` attributes | Real `<button type="button" id="navToggle" aria-controls="navMenu">`; script keeps `aria-expanded` in sync with `.nav.is-open` — Pattern 2, APG disclosure |
| NAV-03 | Escape key closes hamburger menu and returns focus to button | Document `keydown` on `Escape` only when open; `navToggle.focus()` after close — Pattern 3, APG disclosure-navigation Escape |
| NAV-04 | Hidden nav links are not focusable when menu is collapsed (via `inert` or `visibility: hidden`) | **Both:** CSS `visibility: hidden` on collapsed `.nav-links` at ≤640px **and** `inert` on `#navMenu` when the 640px query matches and the menu is closed — Pattern 4 |
| NAV-05 | Menu toggle label localized in EN and ZH (`ui.ts` keys) | Nested `ui.en.nav` / `ui.zh.nav` (`menu` / `close`); `t(locale)` in `NavMenu.astro`; `data-label-menu` / `data-label-close`; script swaps `aria-label` from those attributes — Pattern 5 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Actionable directives the planner must not contradict:

- Privacy / architecture: all tool computation in the browser (`src/lib`); no new API routes for tool logic
- Stack: Astro + Preact + current catalog/content-collection pattern — do not introduce a new app framework
- Do not rewrite existing tools; this milestone is visual / additive chrome
- Languages: TypeScript in `src/lib`, `src/data`, `src/i18n`; Astro templates; CSS in `src/styles/global.css` plus scoped `<style>`
- Chrome interactive controls this phase: static Astro + `is:inline` (same family as ThemeToggle) — not Preact `client:load`
- Runtime: Node `^20.19.0 || >=22.12.0`; ESM; npm
- Frameworks: Astro `^7.3.2`, Preact `^10.29.8`, Vitest `^5.0.0`
- Conventions: PascalCase `.astro` components; named exports for libs/i18n; default export only for Preact tool islands; relative imports; almost no comments
- Trailing slashes required; English unprefixed
- No backend for tool processing; menu state is DOM-only
- GSD: do not make repo edits outside a GSD workflow
- Do **not** recommend Playwright or `theme.test.ts`

## Summary

Phase 8 adds a ≤640px accessible hamburger on the **committed HEAD chrome** (Phase 7 `ThemeInit` / `ThemeToggle`, ~180-line `global.css` with `--panel` / `--border` / `#themeToggle`). Visitors get a real `<button id="navToggle">` that collapses Tools / Blog / About into an overlay under `header.site`, with `aria-expanded` / `aria-controls`, EN/ZH labels from `ui.ts`, Escape-to-close with focus return, pointer-down outside the header to close, and collapsed links that are not keyboard-focusable via **both** `inert` and `visibility: hidden`. ThemeToggle stays a sibling **outside** `#navMenu` and remains visible at every width.

Approved `08-UI-SPEC.md` already resolved CONTEXT discretion: overlay fill `var(--panel)`, bottom hairline `1px solid var(--border)`, `z-index: 20` on `header.site` at ≤640px, SVG path `M5 7h14M5 12h14M5 17h14`, `matchMedia('(max-width: 640px)')` `change` (not `resize`), dedicated `src/components/NavMenu.astro`. Do not reopen those.

**Primary recommendation:** Implement exactly the 08-UI-SPEC placement + script contract on HEAD `Header.astro` / `global.css` / `ui.ts`. Zero new packages. Zero Preact. Zero `src/lib`. Do not commit `src/pages/zh/` or pop stashes. Put the `is:inline` IIFE in `NavMenu.astro` but **boot `#navMenu` work on `DOMContentLoaded`** because that node is a later sibling in `Header.astro` and a classic inline script runs before it exists.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Hamburger visibility + overlay layout | Browser / Client (CSS `@media`) | — | NAV-01 is a viewport rule; SSG cannot know device width |
| Open/closed state, ARIA, Escape, outside pointer, widen | Browser / Client (`is:inline` script) | — | APG disclosure needs JS; no server |
| Localized control names | Frontend Server (SSG `t(locale)`) | Browser (attribute swap) | Strings baked at build; script only copies `data-label-*` |
| ThemeToggle independence | Browser / Client (existing island-free Astro) | — | Sibling outside `#navMenu`; Phase 7 control unchanged |
| Tool processors / catalog | — | — | Out of scope |
| Persistence | — | — | Menu is DOM-only; not `localStorage` |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| (none new) | — | Locked: no new npm packages | CONTEXT / REQUIREMENTS Out of Scope |
| astro | `^7.3.2` [VERIFIED: package.json:14] — quote: `"astro": "^7.3.2"` | SSG, `is:inline` scripts, `.astro` components | Already installed; clone ThemeToggle |
| CSS custom properties | native HEAD tokens | Overlay fill/border | `--panel` / `--border` already on `:root` |
| `HTMLElement.inert` | native HTML | NAV-04 focus + a11y tree | [CITED: developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert] |
| `visibility: hidden` | native CSS | NAV-04 + visual hide | [CITED: developer.mozilla.org/en-US/docs/Web/CSS/visibility] |
| `window.matchMedia` | native | Widen force-close | [CITED: developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | `^5.0.0` [VERIFIED: package.json:25] — quote: `"vitest": "^5.0.0"` | Existing `npm test` → `vitest run` | Regression gate only |
| jsdom | `^30.0.1` [VERIFIED: package.json:23] — quote: `"jsdom": "^30.0.1"` | Installed, unused | Do **not** switch Vitest to jsdom |
| preact / `@astrojs/preact` | `^10.29.8` / `^6.0.5` [VERIFIED: package.json:12,18] | Tool islands | Do **not** use for the hamburger |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `<button>` + ARIA + `is:inline` | CSS checkbox hack | **Locked out** — fails name/role/value and Escape |
| `<button>` + ARIA | `<details>`/`<summary>` | **Locked out** by CONTEXT |
| Static Astro | Preact `client:load` island | Hydration cost; chrome is not a tool island |
| `is:inline` classic script | Processed `<script>` (`type="module"`, deferred) | Module scripts see full DOM (easier `#navMenu`) but **locked** to `is:inline`; mitigate with `DOMContentLoaded` |
| `matchMedia` `change` | `window.resize` | UI-SPEC forbids `resize`; `matchMedia` matches the CSS query |
| `inert` + `visibility: hidden` | `display: none` only | `display: none` also unfocuses, but UI-SPEC locks both inert and visibility |

**Installation:** none.

```bash
# Do not run npm install this phase.
```

**Version verification:** versions above from HEAD/`package.json` Read this session. No registry install. Do not run package-legitimacy against astro/vitest to re-add them.

## Package Legitimacy Audit

> No external packages are installed this phase.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| — | — | — | — | — | — | None to install |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```text
Visitor (viewport width)
        |
        v
  CSS @media (max-width: 640px)
        |
        +-- false (>=641px) --> full .nav-links row; #navToggle display:none
        |                       script: remove inert; force-close leftover .is-open
        |
        +-- true (<=640px) --> #navToggle visible; .nav-links overlay (visibility:hidden)
                                script first-run: inert on #navMenu
        |
        v
  Click #navToggle
        |
        +-- closed --> add .nav.is-open; aria-expanded=true; aria-label=data-label-close; remove inert
        +-- open   --> close()
        |
  Other close paths (only if open)
        |
        +-- keydown Escape --> close(); #navToggle.focus()
        +-- pointerdown outside header.site --> close() (no focus move)
        +-- matchMedia change matches=false --> close() (desktop operable)
        |
  close() always:
        remove .is-open; aria-expanded=false; aria-label=data-label-menu;
        inert = (640px query currently matches)
        |
  Navigation click (Tools/Blog/About)
        --> full page load; new document always collapsed (no persistence)
```

### Recommended Project Structure

```
src/
├── components/
│   ├── Header.astro      # locale prop; logo → NavMenu → #navMenu → ThemeToggle
│   ├── NavMenu.astro     # NEW: #navToggle + is:inline IIFE only
│   └── ThemeToggle.astro # DO NOT TOUCH
├── i18n/
│   └── ui.ts             # add nested nav.menu / nav.close on en and zh
├── layouts/
│   └── BaseLayout.astro  # keep <Header /> (default en) — DO NOT TOUCH
└── styles/
    └── global.css        # #navToggle box + @media (max-width: 640px) overlay
```

Do **not** add `src/lib/nav.ts`, `src/i18n/locales.ts`, or page-tree files.

### Pattern 1: HEAD header restructure (NAV-01 placement)

**What:** Move ThemeToggle out of `.nav-links`. Insert `NavMenu` after the logo. Give `#navMenu` the collapsible group.

**When to use:** This phase only. DOM order is locked.

HEAD Header today [VERIFIED: src/components/Header.astro:1-15]:

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

Target (08-UI-SPEC Placement). Locale type already lives in `ui.ts` [VERIFIED: src/i18n/ui.ts:182-187]:

```
export type Locale = 'en' | 'zh';
export type UiDict = (typeof ui)['en'];

export function t(locale: Locale): UiDict {
  return ui[locale];
}
```

```astro
---
import { SITE_NAME } from '../data/site';
import ThemeToggle from './ThemeToggle.astro';
import NavMenu from './NavMenu.astro';
import type { Locale } from '../i18n/ui';

interface Props {
  locale?: Locale;
}

const locale = Astro.props.locale ?? 'en';
---
<header class="site">
  <nav class="wrap nav">
    <a class="logo" href="/">{SITE_NAME}</a>
    <NavMenu locale={locale} />
    <div class="nav-links" id="navMenu">
      <a href="/tools/">Tools</a>
      <a href="/blog/">Blog</a>
      <a href="/about/">About</a>
    </div>
    <ThemeToggle />
  </nav>
</header>
```

Keep those three `href`s and labels verbatim. `BaseLayout.astro` stays `<Header />` [VERIFIED: src/layouts/BaseLayout.astro:28-29]:

```
    <Header />
    <main class="wrap">
```

Do **not** import `Locale` from `../i18n/locales` — that file does not exist on HEAD (`git ls-tree` this session: `src/i18n/errors.test.ts`, `src/i18n/errors.ts`, `src/i18n/ui.ts` only). Dirty `Footer.astro` on disk uses overlay i18n — ignore it.

HEAD nav CSS [VERIFIED: src/styles/global.css:61-65]:

```
.nav { display: flex; gap: 1.25rem; align-items: center; min-height: 3.25rem; }
.nav a.logo { color: var(--text); text-decoration: none; font-weight: 650; }
.nav-links { display: flex; gap: 1rem; margin-left: auto; }
.nav-links a { color: var(--text); text-decoration: none; }
.nav-links a:hover { color: var(--accent); }
```

Leave `.nav` `min-height: 3.25rem` and `gap: 1.25rem`. Do not retokenize. Desktop keeps `.nav-links { margin-left: auto }`. Mobile only: `#themeToggle { margin-left: auto }` so the row is `[Logo] [Hamburger] …… [ThemeToggle]` after `.nav-links` is taken out of flow.

### Pattern 2: NavMenu button + `is:inline` (NAV-02)

**What:** Static Astro button, 44×44, one 3-line SVG, no visible caption.

**When to use:** Always this phase. Clone ThemeToggle box model; do not share a CSS class with `#themeToggle`.

ThemeToggle pattern to clone [VERIFIED: src/components/ThemeToggle.astro:3-12]:

```
<button type="button" id="themeToggle" aria-label="Toggle color theme">
  <svg class="theme-sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
```

`#themeToggle` box [VERIFIED: src/styles/global.css:66-79]:

```
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
```

Button markup (08-UI-SPEC NavMenu button). Copy keys from Copywriting Contract [VERIFIED: 08-UI-SPEC.md:127-140]:

```
| Primary CTA | `Open menu` — `aria-label` on `#navToggle` when collapsed (`aria-expanded="false"`). Verb + noun. Key `nav.menu`. |
| Close label | `Close menu` — `aria-label` on `#navToggle` when open (`aria-expanded="true"`). Verb + noun. Key `nav.close`. |
```

```
| `nav.menu` | Open menu | 打开菜单 |
| `nav.close` | Close menu | 关闭菜单 |
```

SVG path [VERIFIED: 08-UI-SPEC.md:239-240]:

```
  <svg class="nav-toggle-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
    <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M5 7h14M5 12h14M5 17h14"/>
```

Do **not** morph to an X. Do **not** use `☰`.

Default `#navToggle { display: none; … duplicate 44×44 box … }` in `global.css` (not a scoped `<style>`). Inside `@media (max-width: 640px)` set `display: inline-flex` so the control is not in desktop tab order.

APG disclosure [CITED: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/]: the show/hide control has `role button`; `aria-expanded` is `true` when content is visible and `false` when hidden; `aria-controls` is optional and refers to the shown/hidden element. NAV-02 requires `aria-controls` anyway. A native `<button>` supplies the role. Enter/Space come for free from the button.

### Pattern 3: Script contract (NAV-03, outside pointer, widen)

**What:** One `<script is:inline>` IIFE in `NavMenu.astro`. No imports, no `src/lib`, no `localStorage`.

**IDs / class** [VERIFIED: 08-UI-SPEC.md:336-337]:

```
IDs: `#navToggle`, `#navMenu`. Open class: `.nav.is-open` on the `<nav class="nav">` ancestor.
```

Events [VERIFIED: 08-UI-SPEC.md:338-344]:

```
| Click `#navToggle` | Toggle open/closed. |
| `keydown` Escape | If open: close and `navToggle.focus()`. Ignore Escape when closed. |
| `pointerdown` on `document` | If open and the event target is outside `header.site`: close. Do not close when the target is inside the header (logo, hamburger, overlay links, ThemeToggle). |
| `matchMedia('(max-width: 640px)')` `change` | When `matches` becomes false (widen): force-close. Prefer `addEventListener('change', …)` on the MediaQueryList. Do not use a window `resize` listener. |
```

Astro `is:inline` [CITED: https://docs.astro.build/en/guides/client-side-scripts/]: Astro does not process a `<script>` with `is:inline`; it is rendered exactly as written; no TypeScript; no import resolution; **duplicated per instance**. Processed scripts become `type="module"` (deferred). Classic inline scripts run as the parser hits them.

**Parse-order rule (planner must encode this):** `NavMenu.astro` emits `#navToggle` + the script **before** Header’s `#navMenu` sibling. A synchronous IIFE that calls `document.getElementById('navMenu')` on first run gets `null`. ThemeToggle does not have this problem because it only binds its own button [VERIFIED: src/components/ThemeToggle.astro:12-18]:

```
<script is:inline>
  document.getElementById('themeToggle')?.addEventListener('click', function () {
```

**Use:** wrap boot that needs `#navMenu` / `nav.nav` in `DOMContentLoaded` when `document.readyState === 'loading'`; otherwise run immediately. Click/Escape/pointer/mql handlers then see the full header. Do not switch to a processed module script.

Escape + focus return matches APG disclosure-navigation [CITED: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/]: “Escape — If a dropdown is open, closes it and sets focus on the button that controls that dropdown.” ROADMAP NAV-03 is the same. Do **not** implement the APG optional arrow/Home/End keys. Do **not** add a focus trap (CONTEXT deferred). Tab may leave the open overlay into `main`.

`matchMedia` `change` [CITED: https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event]: `addEventListener("change", …)`; handler receives `MediaQueryListEvent` with `matches`. When `matches` is false, viewport is wider than 640px — force-close.

Close / open / inert rules [VERIFIED: 08-UI-SPEC.md:345-359] — implement verbatim:

```
Close must always:

1. Remove `.is-open` from `nav.nav`
2. Set `aria-expanded="false"`
3. Set `aria-label` to `data-label-menu`
4. Set `inert` on `#navMenu` only when the 640px media query currently matches; **remove** `inert` when wider so desktop links stay operable

Open must always:

1. Add `.is-open`
2. Set `aria-expanded="true"`
3. Set `aria-label` to `data-label-close`
4. Remove `inert`

On first script run: if the 640px query matches and the menu is closed, set `inert` on `#navMenu`. If the query does not match, do not leave `inert` on.
```

Use `element.inert = true/false` or `setAttribute('inert', '')` / `removeAttribute('inert')`. Swap labels with `getAttribute('data-label-menu')` / `data-label-close` — never hardcode `Open menu` in JS.

Pointer-down: `header.site.contains(event.target)` — ThemeToggle is inside `header.site`, so theme clicks do not close. Hamburger is inside, so the same event does not open-then-close.

### Pattern 4: Overlay CSS + inert/visibility (NAV-01, NAV-04)

**What:** At ≤640px, `.nav-links` becomes an absolute panel under the header. Collapsed = `visibility: hidden` + `inert`. Open = `.nav.is-open` + `visibility: visible` + inert removed.

Containing block is `header.site` (`position: relative` at ≤640px only). Panel is full header width (`left: 0; right: 0`), not the `.wrap` column. `z-index: 20` on `header.site` so the overlay paints above `main`. Do **not** make the header sticky (dirty overlay had blur/sticky).

Fill `var(--panel)`, bottom hairline `1px solid var(--border)`. No top border (header `border-bottom` is the separator). No box-shadow (Phase 10). No `--sp-*` tokens (Phase 9). Overlay padding `16px`, column `gap: 16px`, link padding `8px 0`, `overflow-wrap: anywhere`.

`visibility: hidden` [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/visibility]: the box is invisible but still affects layout; **the element cannot receive focus** (tab indexes); **`hidden` removes it from the accessibility tree**. Combined with `position: absolute`, the collapsed panel does not push page content.

`inert` [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert]: the element and flat-tree descendants cannot receive focus or be clicked; they are removed from the tab order and accessibility tree. MDN: widely available since April 2023. NAV-04 is satisfied by either; this phase uses **both**.

Breakpoint [VERIFIED: 08-UI-SPEC.md:324-325]:

```
- Do not introduce a second breakpoint. `640px` is `max-width` (NAV-01).
```

At `min-width: 641px` the hamburger stays `display: none` (not in tab order) and `.nav-links` stays the HEAD flex row.

### Pattern 5: `ui.ts` nested `nav` (NAV-05)

**What:** Add a sibling of `tools`, not dotted string keys. `t(locale).nav.menu` requires a nested object so `UiDict` stays `(typeof ui)['en']`.

Add on **both** `en` and `zh`:

```ts
nav: {
  menu: 'Open menu', // zh: '打开菜单'
  close: 'Close menu', // zh: '关闭菜单'
},
```

`NavMenu.astro` frontmatter: `const copy = t(locale);` then `aria-label={copy.nav.menu}` plus `data-label-menu={copy.nav.menu}` and `data-label-close={copy.nav.close}`.

Do not localize ThemeToggle. Do not change Tools / Blog / About visible labels. Do not commit `src/pages/zh/`. Future ZH pages pass `locale="zh"`.

### Anti-Patterns to Avoid

- **Checkbox hack / `<details>`:** locked out; no `aria-expanded`, no Escape.
- **Preact island / `client:load`:** chrome is static Astro.
- **Synchronous `getElementById('navMenu')` in NavMenu’s inline script:** node does not exist yet.
- **Leaving `inert` on after widen:** desktop Tools/Blog/About become unfocusable.
- **Keeping ThemeToggle inside `.nav-links`:** it would hide with the overlay and violate “always visible”.
- **`window.resize`:** UI-SPEC forbids it; use `matchMedia` `change`.
- **Hardcoded English in the IIFE:** use `data-label-*`.
- **Scoped component `<style>` for box/overlay:** put rules in `global.css` (same as `#themeToggle`).
- **Sharing a class with `#themeToggle`:** would rewrite ThemeToggle (forbidden).
- **Sticky / blur header from dirty overlay.**
- **Body scroll lock / focus trap.**
- **`--sp-*` spacing tokens** (Phase 9) **or** button hover fill beyond existing accent-on-hover (Phase 10).
- **Importing `Locale` from `i18n/locales` or cloning dirty Footer.**
- **Popping `stash@{0}` / `stash@{1}`.**
- **Playwright, `theme.test.ts`, or switching Vitest to jsdom.**
- **`src/lib` / catalog / tool islands / `astro.config.mjs` / `src/pages/**`.**

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Show/hide a11y state | Checkbox CSS hack | `<button>` + `aria-expanded` / `aria-controls` | APG disclosure; NAV-02 |
| Unfocusable collapsed links | Custom tabindex walker | `inert` + `visibility: hidden` | Both are native; NAV-04 |
| Breakpoint sync with CSS | `window.innerWidth` / `resize` | `matchMedia('(max-width: 640px)')` `change` | Same px as CSS; no scrollbar mismatch |
| Icon | `astro-icon` / emoji `☰` | Inline SVG path from UI-SPEC | No new packages |
| Focus trap / scroll lock | `focus-trap` npm | Nothing — deferred | ROADMAP does not require them |
| Menu persistence | `localStorage` | DOM-only; new page is collapsed | Privacy; CONTEXT |

**Key insight:** The hard parts are **DOM order vs classic `is:inline`**, **`inert` on the wrong viewport**, and **ThemeToggle leaving `.nav-links`**. A 40-line IIFE plus CSS beats any menu library on this SSG.

## Common Pitfalls

### Pitfall 1: Executing against the dirty overlay
**What goes wrong:** Executor copies `LangSwitch`, IBM Plex/Syne, sticky header, or `src/pages/zh/` and ships overlay + hamburger mixed.
**Why it happens:** Working tree has uncommitted i18n/pages; dirty `Footer.astro` already has a locale prop.
**How to avoid:** Baseline is `git show HEAD:src/components/Header.astro`, `git show HEAD:src/styles/global.css`, `git show HEAD:src/i18n/ui.ts`. Do not pop `stash@{0}` or `stash@{1}`. Do not commit `src/pages/zh/`.
**Warning signs:** `LangSwitch`, `navPrivacy`, Google Fonts, `position: sticky` on `header.site` in the Phase 8 diff.

### Pitfall 2: `#navMenu` is null when the inline script runs
**What goes wrong:** First-run `inert` never applies; listeners never attach; NAV-04 fails until a refresh race “works” in dev.
**Why it happens:** `NavMenu.astro` is emitted before `#navMenu`. Classic `is:inline` runs immediately.
**How to avoid:** `DOMContentLoaded` (or `readyState !== 'loading'`) before querying `#navMenu` / `nav.nav`. Bindings that only need `#navToggle` may run immediately.
**Warning signs:** Console `Cannot set properties of null`; mobile tab still hits Tools while closed.

### Pitfall 3: `inert` leftover on desktop
**What goes wrong:** After widening past 640px, Tools/Blog/About cannot be clicked or tabbed.
**Why it happens:** Close path always sets `inert` without checking the media query.
**How to avoid:** `inert` only when the 640px query **currently matches** and the menu is closed. Widen `change` with `matches === false` force-closes **and removes** `inert`.
**Warning signs:** Desktop nav looks visible but is dead to pointer/keyboard.

### Pitfall 4: ThemeToggle stays inside `.nav-links`
**What goes wrong:** The theme control hides with the overlay or sits in the drawer.
**Why it happens:** Phase 7 placed it after About inside `.nav-links` [VERIFIED: src/components/Header.astro:8-13].
**How to avoid:** Move it to a sibling after `#navMenu`. Mobile `#themeToggle { margin-left: auto }`.
**Warning signs:** Closed mobile header has no sun/moon; open drawer contains the toggle.

### Pitfall 5: Desktop hamburger still in tab order
**What goes wrong:** Keyboard users on wide screens tab onto an invisible control.
**Why it happens:** `#navToggle` is `visibility: hidden` or off-screen instead of `display: none`.
**How to avoid:** Default `display: none`; `inline-flex` only inside `@media (max-width: 640px)`.
**Warning signs:** Tab order logo → mystery button → Tools on desktop.

### Pitfall 6: Outside-close uses the wrong root
**What goes wrong:** Clicking ThemeToggle or overlay links closes the menu; or clicking the hamburger opens then immediately closes.
**Why it happens:** `contains()` checked on `.nav-links` or `document.body`, or a `click` listener races the toggle.
**How to avoid:** `pointerdown` on `document`; close only if open **and** `!header.site.contains(target)`.
**Warning signs:** Theme flip closes the menu; cannot select a link.

### Pitfall 7: Hardcoded labels / missing zh keys
**What goes wrong:** NAV-05 fails; `UiDict` mismatch; script announces English on a future `locale="zh"` page.
**Why it happens:** Adding only `en.nav` or using `'nav.menu'` as a flat key so `copy.nav.menu` is undefined.
**How to avoid:** Nested `nav: { menu, close }` on **both** `en` and `zh`. Script reads `data-label-*`.
**Warning signs:** `aria-label="undefined"`; TypeScript error on `copy.nav`.

### Pitfall 8: Overlay `position: absolute` without a relative header
**What goes wrong:** Panel positions against a distant ancestor; covers the wrong box or pushes layout.
**Why it happens:** `header.site { position: relative }` omitted or applied at all widths incorrectly.
**How to avoid:** `position: relative; z-index: 20` on `header.site` **inside** the 640px query only.
**Warning signs:** Overlay not full-bleed under the header; content jumps.

### Pitfall 9: Playwright / jsdom / `theme.test.ts`
**What goes wrong:** New packages or a Vitest environment change; contradicts the user gate and Phase 7 validation.
**Why it happens:** Nyquist pressure to “unit test the menu”.
**How to avoid:** File `rg` + `npm test` (existing `src/lib` suite) + `npm run build` + **manual** keyboard/viewport. Optional: one Vitest `ui.ts` key-parity `it` in existing Node environment (like `src/i18n/errors.test.ts`). Do **not** add Playwright. Do **not** add `theme.test.ts`. Do **not** set `environment: 'jsdom'`.
**Warning signs:** `package.json` gains `@playwright/test`; `vitest.config.ts` `environment: 'jsdom'`.

### Pitfall 10: Scoped CSS hides the overlay
**What goes wrong:** `#navToggle` / `.nav.is-open` rules never match because Astro scopes them.
**Why it happens:** Component `<style>` without `:global`.
**How to avoid:** All hamburger box-model and overlay rules in `src/styles/global.css`.
**Warning signs:** Button invisible at 640px; open class has no visual effect.

## Code Examples

### `ui.ts` nav keys (NAV-05)

```ts
// Source: 08-UI-SPEC.md Copywriting Contract + existing t() in src/i18n/ui.ts:185-187
// Add as a sibling of `tools` on both ui.en and ui.zh:
nav: {
  menu: 'Open menu',
  close: 'Close menu',
},
// zh:
nav: {
  menu: '打开菜单',
  close: '关闭菜单',
},
```

### Overlay + hamburger CSS (NAV-01 / NAV-04)

```css
/* Source: 08-UI-SPEC.md Overlay + breakpoint; tokens from HEAD :root */
#navToggle {
  display: none;
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
#navToggle svg {
  width: 20px;
  height: 20px;
  display: block;
}

@media (max-width: 640px) {
  header.site {
    position: relative;
    z-index: 20;
  }
  #navToggle {
    display: inline-flex;
  }
  #themeToggle {
    margin-left: auto;
  }
  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-left: 0;
    padding: 16px;
    background: var(--panel);
    border-bottom: 1px solid var(--border);
    visibility: hidden;
  }
  .nav-links a {
    padding: 8px 0;
    overflow-wrap: anywhere;
  }
  .nav.is-open .nav-links {
    visibility: visible;
  }
}
```

### Script boot (NAV-02, NAV-03, NAV-04) — illustrative skeleton

```html
<script is:inline>
  (function () {
    var toggle = document.getElementById('navToggle');
    var mq = window.matchMedia('(max-width: 640px)');
    function boot() {
      var menu = document.getElementById('navMenu');
      var nav = menu && menu.closest('nav.nav');
      var header = menu && menu.closest('header.site');
      if (!toggle || !menu || !nav || !header) return;
      function isOpen() { return nav.classList.contains('is-open'); }
      function setInertForViewport() {
        if (mq.matches && !isOpen()) menu.setAttribute('inert', '');
        else menu.removeAttribute('inert');
      }
      function close() {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', toggle.getAttribute('data-label-menu') || '');
        setInertForViewport();
      }
      function open() {
        nav.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', toggle.getAttribute('data-label-close') || '');
        menu.removeAttribute('inert');
      }
      toggle.addEventListener('click', function () { isOpen() ? close() : open(); });
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || !isOpen()) return;
        close();
        toggle.focus();
      });
      document.addEventListener('pointerdown', function (e) {
        if (!isOpen()) return;
        if (header.contains(e.target)) return;
        close();
      });
      mq.addEventListener('change', function () {
        if (!mq.matches) close();
        else setInertForViewport();
      });
      setInertForViewport();
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  })();
</script>
```

Source of IDs/events: 08-UI-SPEC.md Script contract. `DOMContentLoaded` is the parse-order mitigation (Pattern 3). `e.key !== 'Escape'` uses the standard `KeyboardEvent.key` value `Escape` [ASSUMED: UI-SPEC says “keydown Escape”; it does not quote the `key` string — planner should keep `Escape`].

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS checkbox hamburger | `<button>` + ARIA disclosure | WCAG 2.1 name/role/value | Escape, expanded state, no hidden focus |
| `display: none` only | `inert` + `visibility: hidden` | `inert` widely available since 2023 [CITED: MDN inert] | Focus + a11y tree without collapsing a different layout mode |
| `addListener` on MediaQueryList | `addEventListener('change')` | MDN current | Matches UI-SPEC; no deprecated API |
| Icon pack / `☰` | Inline SVG `currentColor` | This repo Phase 7 ThemeToggle | No packages; follows `--text` |

**Deprecated/outdated:**
- Checkbox hack for site nav: not accessible; PROJECT.md already chose `<button>` + ARIA
- `MediaQueryList.addListener()`: compatibility only; do not use
- Focus-trap npm for three header links: ROADMAP does not require it

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `KeyboardEvent.key` for Escape is the string `Escape` | Code Examples | If an executor uses `keyCode === 27` it still works; if they check `Esc` the handler never fires — keep `Escape` |
| A2 | `inert` is available in the browsers this static site cares about (MDN: widely available since April 2023) | Pattern 4 | Very old browsers would rely on `visibility: hidden` alone — still NAV-04 |
| A3 | Optional Vitest key-parity `it` on `ui.en.nav` / `ui.zh.nav` is allowed (not `theme.test.ts`, not Playwright) | Validation | If planner omits it, Nyquist still holds via `rg` + manual |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions

None blocking. UI-SPEC already locked overlay tokens, SVG path, `matchMedia` `change`, and `NavMenu.astro`.

1. **Inline script vs `#navMenu` sibling order**
   - What we know: UI-SPEC puts the script in `NavMenu.astro` before `#navMenu`.
   - What's unclear: nothing — classic `is:inline` will not see `#navMenu` yet.
   - Recommendation: keep the script in `NavMenu.astro`; boot with `DOMContentLoaded` as in Code Examples. Do not move the script into Header (would fight UI-SPEC) and do not drop `is:inline`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `astro build`, `vitest` | ✓ | v22.22.2 | — |
| npm | scripts | ✓ | 11.9.0 | — |
| git | HEAD baseline | ✓ | 2.52.0.windows.1 | — |
| Knowledge graph | Cross-doc query | ✗ | — | Skip; no `.planning/graphs/graph.json` |
| ctx7 CLI | Docs lookup | ✗ | — | curl of official docs (used) |
| Playwright | — | n/a | — | **Do not install** |

**Missing dependencies with no fallback:** none for implementation.

**Missing dependencies with fallback:** graphify, ctx7 — unused at execute time.

**Step 2.6:** No DB, Redis, Docker. Visitor-side `matchMedia` / DOM only. No new runtime services.

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` [VERIFIED: .planning/config.json:24] — quote: `"nyquist_validation": true`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^5.0.0` [VERIFIED: package.json:25] |
| Config file | `vitest.config.ts` — `include: ['src/**/*.test.ts']`, `environment: 'node'`, `passWithNoTests: true` [VERIFIED: vitest.config.ts:3-8] |
| Quick run command | `npm test` |
| Full suite command | `npm test` (`vitest run` [VERIFIED: package.json:9] — quote: `"test": "vitest run"`) |

Do **not** add Playwright. Do **not** add `theme.test.ts`. Do **not** add `*.test.tsx` or switch Vitest to jsdom. Hamburger behavior is document CSS + inline script; Nyquist coverage is **file assertions + build + manual keyboard/viewport**, matching Phase 7.

Optional (not required): one Node-environment `it` asserting `ui.en.nav.menu === 'Open menu'`, `ui.en.nav.close === 'Close menu'`, and the ZH pair — same style as `src/i18n/errors.test.ts` chrome-key sharing. That is **not** a DOM test.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | `#navToggle` `display: none` by default; `inline-flex` and overlay rules inside `@media (max-width: 640px)` | smoke (file) | `rg -n "max-width: 640px" src/styles/global.css` and `rg -n "navToggle" src/styles/global.css` | ❌ Wave 0 (assertion in plan, not a test file) |
| NAV-02 | `<button id="navToggle">` with `aria-expanded` and `aria-controls="navMenu"` | smoke (file) | `rg -n "aria-controls" src/components/NavMenu.astro` | ❌ Wave 0 |
| NAV-03 | Escape closes and `navToggle.focus()` | manual | DevTools device 640px; open menu; press Escape; focus on hamburger | ❌ Wave 0 |
| NAV-04 | Collapsed links not focusable (`inert` + `visibility: hidden`) | smoke (file) + manual | `rg -n "visibility: hidden" src/styles/global.css`; `rg -n "inert" src/components/NavMenu.astro`; tab through closed mobile header | ❌ Wave 0 |
| NAV-05 | `nav.menu` / `nav.close` on en and zh | smoke (file) + optional unit | `rg -n "nav:" src/i18n/ui.ts`; optional `it` in Node Vitest | ❌ Wave 0 |
| regression | Existing `src/lib/*.test.ts` stay green | unit | `npm test` | ✅ |
| build | `is:inline` IIFE present in `dist` HTML | smoke | `npm run build` then `rg "navToggle" dist` (not only a hashed `.js` module) | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test` && `npm run build`
- **Phase gate:** Full suite green + file assertions + manual 640px checklist before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] Plan tasks must include `rg` / `git show HEAD` / `npm run build` verification (these **are** the automated commands)
- [ ] Manual-only NAV-03 / NAV-04 / widen / outside-pointer — justified (needs real viewport + focus). Do **not** add Playwright
- [ ] Do **not** create `src/lib/nav.ts` or `theme.test.ts`
- Framework install: none — Vitest already present

*(No missing test-framework files. Optional ui key `it` is a planner choice, not a blocker.)*

### Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hamburger visible, links collapsed at 640px; full nav at 641px | NAV-01 | Needs viewport | DevTools width 640 vs 641 |
| `aria-expanded` flips; label Open menu / Close menu | NAV-02, NAV-05 | Needs click + a11y tree | Inspect `#navToggle` after open/close |
| Escape closes and focus returns | NAV-03 | Needs real focus | Open, press Escape |
| Closed mobile: tab logo → hamburger → ThemeToggle → main (no Tools/Blog/About) | NAV-04 | Needs real tab order | Keyboard only, menu closed |
| Open mobile: tab hamburger → Tools → Blog → About → ThemeToggle → main (no trap) | NAV-03 deferred trap | Needs real tab order | Keyboard, menu open |
| Pointer-down on `main` closes; ThemeToggle click does not | CONTEXT outside pointer | Needs pointer | Open, click main vs sun/moon |
| Widen past 640px while open clears overlay and desktop links work | NAV-01 leftover | Needs resize across breakpoint | Open at 640, drag to 900 |

## Security Domain

> `workflow.security_enforcement` is enabled [VERIFIED: .planning/config.json:47] — quote: `"security_enforcement": true`. ASVS level 1 [VERIFIED: .planning/config.json:48] — quote: `"security_asvs_level": 1`.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No accounts |
| V3 Session Management | no | Menu is not a session; not `localStorage` |
| V4 Access Control | no | Public static pages |
| V5 Input Validation | yes (minimal) | No visitor text input. Labels are SSG strings from `ui.ts`. Script copies `data-label-*` via `getAttribute` / `setAttribute` — **no `innerHTML`** |
| V6 Cryptography | no | No secrets, no tokens |

### Known Threat Patterns for Astro static chrome + inline script

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| DOM XSS via menu labels | Tampering | Bake strings at SSG; `setAttribute('aria-label', getAttribute('data-label-*'))`; never concatenate into HTML |
| Stored XSS via menu state | Tampering | Do not persist open state; no `localStorage` for nav |
| Clickjacking of nav | Information disclosure | Out of scope for this phase (site-wide headers); no new framing control |
| Script error DoS | Denial of service | Null-check `#navToggle` / `#navMenu`; no `role="alert"` on failure (UI-SPEC: no error chrome) |
| Untrusted `aria-expanded` | Tampering | Script writes only `'true'` / `'false'` literals |

## Sources

### Primary (HIGH confidence — in-repo Read this session)
- `src/components/Header.astro` (HEAD, 16 lines) — ThemeToggle inside `.nav-links`
- `src/components/ThemeToggle.astro` — `is:inline` click, 44×44, SVG `aria-hidden`
- `src/styles/global.css` — `.nav`, `.nav-links`, `#themeToggle`, tokens
- `src/i18n/ui.ts:182-187` — `Locale`, `UiDict`, `t()`
- `src/layouts/BaseLayout.astro:28-29` — `<Header />` no locale
- `package.json`, `vitest.config.ts`, `.planning/config.json`
- `.planning/phases/08-mobile-hamburger-menu/08-CONTEXT.md`
- `.planning/phases/08-mobile-hamburger-menu/08-UI-SPEC.md`
- `.planning/REQUIREMENTS.md` NAV-01–05
- `git ls-tree HEAD -- src/i18n/` — no `locales.ts` on HEAD

### Secondary (official docs extracted via curl this session)
- https://docs.astro.build/en/guides/client-side-scripts/ — `is:inline` unprocessed, processed scripts `type="module"`
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert
- https://developer.mozilla.org/en-US/docs/Web/CSS/visibility
- https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event
- https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/

### Tertiary
- classify-confidence seam returned LOW for `webfetch` / `websearch` even with `--verified`; official HTML was still pulled from those URLs and quoted. In-repo discrete values use `[VERIFIED: path:lines]` from Read, not the seam.
- research-plan seam returned stale QR-code cache items — ignored; not stored.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; versions from `package.json` Read this session
- Architecture: HIGH — 08-UI-SPEC + HEAD Header/CSS; MEDIUM only on `DOMContentLoaded` boot (required by parse order, not named in UI-SPEC)
- Pitfalls: HIGH — overlay/stash/inert leftover/ThemeToggle placement are the rewrite-class failures

**Research date:** 2026-09-16
**Valid until:** 30 days (stable HTML/CSS/ARIA; Astro `is:inline` contract is stable)
