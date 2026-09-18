# Phase 10: Interactive Chrome - Research

**Researched:** 2026-09-18
**Domain:** Native CSS button/panel chrome + HTML `<details>`/`<summary>` FAQ (visual only, HEAD baseline)
**Confidence:** HIGH (HEAD markup, locked UI-SPEC CSS, no new packages); MEDIUM (Safari `::marker` coloring; `color-mix()` on pre-Baseline browsers)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Button states
- Apply `:hover` / `:active` only to `.tool-panel button` (Copy + island actions). Hamburger `#navToggle` and `#themeToggle` stay 44px icon chrome (CHR-01, CHR-02)
- Hover inverts: `background: var(--accent); color: var(--bg)` with a short color transition (CHR-01)
- Pressed `:active` darkens the accent fill; no `transform: scale` (CHR-02; matches Phase 9 card “no :active scale”)
- Focus keeps the existing global `a:focus-visible, button:focus-visible` 2px `--accent` outline (CHR-03)
- `:disabled` stays `opacity: 0.45`; no hover/active on disabled Copy

#### Tool-panel chrome
- Keep 1px `border: 1px solid var(--border)`; add a small `box-shadow` using `--border` so both light and dark remain readable (CHR-04)
- Retokenize `.tool-panel` padding `1rem` → `var(--sp-4)` (Phase 9 deferred this selector)
- Keep HEAD `border-radius: 8px`
- Edit HEAD `ToolShell` only if Copy needs a class — prefer CSS. Do not import overlay `__chrome` / `led` / locale prop (HEAD ToolShell has no locale)

#### FAQ collapse
- Rewrite HEAD `FaqList.astro` from `<dl>` / `<dt>` / `<dd>` to native `<details>` / `<summary>` (CHR-05)
- All items closed on first paint; items open independently (not exclusive accordion)
- Open/close indicator is CSS `summary::marker` (disclosure triangle) — no icon pack (CHR-06)
- Keep HEAD English `h2` FAQ and markdown answers; do not commit ZH FaqList or overlay FAQ

#### Contrast, HEAD vs overlay
- Eyeball WCAG AA 4.5:1 in both themes on button / panel / FAQ text; no contrast npm package (CHR-07)
- Files this phase: HEAD `src/components/FaqList.astro` + `src/styles/global.css` (button / panel / FAQ CSS). Touch HEAD `ToolShell.tsx` only if a class is required
- Work from HEAD; do not pop `stash@{0}` or `stash@{1}`; do not commit `LangSwitch.astro` or `src/pages/zh/`
- Zero new npm packages; no Playwright; no Tailwind; no `src/lib` / `TOOLS` edits

### Claude's Discretion
- Exact hover transition duration (keep it short)
- Exact `box-shadow` offset/blur as long as it uses `--border` and stays readable in both themes
- Whether Copy needs an extra class vs styling `.tool-panel button` globally

**UI-SPEC already resolved discretion (do not re-decide):** hover/color transition `120ms ease`; panel `box-shadow: 0 1px 2px var(--border)`; Copy stays unclassed (style `.tool-panel button` globally); `:active` darkens via `color-mix(in srgb, var(--accent) 72%, #000000)` — no new token, no `transform: scale`. [VERIFIED: .planning/phases/10-interactive-chrome/10-UI-SPEC.md:17]

### Deferred Ideas (OUT OF SCOPE)
- Overlay LED indicator / `tool-panel__chrome` bar
- Localizing ToolShell Copy / FAQ heading via `ui.ts`
- Committing `src/pages/zh/` or `LangSwitch.astro`
- Exclusive accordion (only one FAQ open)
- Custom `+`/`−` or chevron SVG instead of `::marker`
- Button `:active` scale (rejected; darken fill only)
- Contrast npm package / automated contrast tests
- Restyling hamburger / ThemeToggle as filled buttons
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHR-01 | Button `:hover` state with visible background/color transition | `.tool-panel button:hover:not(:disabled)` invert `background: var(--accent); color: var(--bg)` plus `transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease`. Selector must **not** be global `button:hover`. Pattern 1. |
| CHR-02 | Button `:active` state with pressed appearance (slight scale or darken) | Locked: **darken only**, no scale. `.tool-panel button:active:not(:disabled)` uses `color-mix(in srgb, var(--accent) 72%, #000000)` on fill and border. Pattern 1. |
| CHR-03 | Button `:focus-visible` ring consistent with site accent color | Keep HEAD `a:focus-visible, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`. Do **not** add a second outline on `.tool-panel button`. FAQ `summary` is **not** a `button` — add `.faq summary:focus-visible` with the same 2px / 2px offset. Pattern 1 + 3. |
| CHR-04 | Tool-panel border/shadow refined for both light and dark themes | Keep `border: 1px solid var(--border)`; add `box-shadow: 0 1px 2px var(--border)`; padding `1rem` → `var(--sp-4)`; keep `border-radius: 8px`. No `--shadow` token. Pattern 2. |
| CHR-05 | FAQ rewritten from `<dl>` to `<details>/<summary>` with native collapse behavior | Restore HEAD `FaqList.astro` then replace `<dl>` with independent `<details>` (no `open`, no `name`). Answers in `<p>`. No JS accordion. Pattern 3. |
| CHR-06 | FAQ `<details>` styled with open/close indicator (CSS `::marker` or custom) | Locked: UA `summary::marker` triangle. Color `var(--text)`. Do **not** set `list-style: none`. Do **not** hide `::-webkit-details-marker`. Pattern 3. |
| CHR-07 | All chrome elements have sufficient contrast in both themes (WCAG AA 4.5:1) | Eyeball UAT both themes. Local relative-luminance math on Phase 7 hexes is above 4.5:1 for idle / hover / active / FAQ (tightest: light hover ~5.05:1). Disabled Copy `opacity: 0.45` is the WCAG inactive-component exemption — do not chase 4.5:1 there. No contrast npm. Pitfall 8 + Validation. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Actionable directives the planner must not contradict:

- Privacy / architecture: all tool computation in the browser (`src/lib`); no new API routes for tool logic
- Stack: stay on Astro + Preact + current catalog/content-collection pattern — do not introduce a new app framework
- Visual milestone: no Tailwind, no CSS-in-JS, no new npm packages, no `src/lib` / `TOOLS` data changes
- Languages: TypeScript in `src/lib`, `src/data`, `src/i18n`; Astro templates; CSS in `src/styles/global.css` plus scoped `<style>`
- Runtime: Node `^20.19.0 || >=22.12.0`; ESM; npm
- Frameworks: Astro `^7.3.2`, Preact `^10.29.8`, Vitest `^5.0.0`
- Conventions: PascalCase `.astro` components; named exports for libs/i18n; default export only for Preact tool islands; Preact `class` not `className` on `ToolShell`; relative imports; almost no comments
- Trailing slashes required; English unprefixed
- No backend for tool processing
- GSD: do not make repo edits outside a GSD workflow
- Do **not** recommend Playwright, a jsdom Vitest switch, or new CSS unit-test files
- This phase is **visual only**. Do not rewrite existing tool processors. Do not commit overlay ZH / `LangSwitch`

## Summary

Phase 10 is a **visual-only** chrome pass on the **committed HEAD baseline**, not the dirty working tree. `.tool-panel button` (Copy plus in-panel island actions) gets invert hover, `color-mix` darkened `:active`, and `:hover:not(:disabled)` / `:active:not(:disabled)` so disabled Copy cannot invert. `.tool-panel` keeps a 1px `--border`, adds `box-shadow: 0 1px 2px var(--border)`, and retokenizes padding `1rem` → `var(--sp-4)`. HEAD `FaqList.astro` is rewritten from `<dl>` to native `<details>` / `<summary>` with the UA `::marker` triangle, all closed, independently openable. Focus on buttons stays the existing 2px `--accent` outline; FAQ summaries need their **own** `:focus-visible` rule because they are not `button`.

**HEAD is not the dirty working tree.** Dirty `ToolShell.tsx` has `locale`, `tool-panel__chrome`, and an LED. Dirty `FaqList.astro` has a `heading` prop and `<dl class="faq">`. Dirty `src/pages/tools/[slug].astro` passes `heading={copy.faq}`. Untracked `src/components/LangSwitch.astro` and `src/pages/zh/` exist. `src/styles/global.css` currently matches HEAD (no diff this session). Analog: Phase 9 `git checkout HEAD --` on the file you will edit (`FaqList.astro`), then rewrite, then path-limited `git add`. Do **not** edit or add `ToolShell.tsx`. Do not pop `stash@{0}` (`gsd-phase7-overlay-chrome-temp`) or `stash@{1}` (`pre-02-01-merge unrelated i18n`).

**Primary recommendation:** Restore HEAD `src/components/FaqList.astro`, replace `<dl>` with the UI-SPEC `<details>` / `<summary>` markup (English `h2` FAQ, no `heading`, no `open`, no `name`), and replace the HEAD `.tool-panel` / `.tool-panel button` / `:disabled` block in `src/styles/global.css` with the UI-SPEC CSS plus the new `.faq` rules. Do not touch `ToolShell.tsx`. Zero new packages. Zero Playwright. Nyquist = file `rg` + `npm test` + `npm run build` + human UAT.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Button hover / active / disabled | Browser / Client (CSS on `.tool-panel button`) | — | Pointer states are CSS; Copy markup already exists in HEAD ToolShell |
| Button keyboard focus ring | Browser / Client (existing global `button:focus-visible`) | — | CHR-03 is “keep HEAD”; do not duplicate |
| Tool-panel border / shadow / padding | Browser / Client (`global.css`) | — | Tokens already on `:root`; no JS |
| FAQ open/close | Browser / Client (native `<details>`) | CDN / Static (Astro SSG emits markup) | No accordion JS; SSG only prints questions/answers |
| FAQ marker | Browser / Client (`summary::marker`) | — | UA disclosure triangle; no icon pack |
| FAQ keyboard | Browser / Client (native summary activation) | — | Enter/Space is UA; extra CSS only for `:focus-visible` |
| Contrast AA | Browser / Client (Phase 7 tokens) | Human UAT | Locked: eyeball, no contrast package |
| Copy clipboard | — | — | Existing Preact `onCopy`; **do not edit** ToolShell |
| Hamburger / theme toggle | — | — | Out of scope; must not inherit invert |
| Tool processors / catalog data | — | — | Locked out (`src/lib`, `TOOLS`) |
| i18n ZH tree | — | — | Do not commit `src/pages/zh/` / `LangSwitch` |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| (none new) | — | Locked: no new npm packages | REQUIREMENTS Out of Scope / UI-SPEC |
| astro | `^7.3.2` [VERIFIED: package.json:14] — quote: `"astro": "^7.3.2"` | SSG pages; `FaqList.astro` | Already installed |
| Native CSS | — | Hover/active/focus, `color-mix()`, `::marker`, `prefers-reduced-motion` | UI-SPEC forbids Tailwind / new tokens |
| Native HTML `<details>` / `<summary>` | — | FAQ collapse | Locked: no JS accordion |
| Phase 7 color tokens | HEAD `:root` / `:root[data-theme="light"]` | `--bg` `--panel` `--accent` `--text` `--border` | Inherit; do not add `--led` / `--shadow` |
| Phase 9 spacing | `--sp-2` `8px`, `--sp-4` `16px` [VERIFIED: src/styles/global.css:19-22] — quote: `--sp-2: 8px;` / `--sp-4: 16px;` | FAQ padding/margins; panel padding | Already on `:root`; do not redefine |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | `^5.0.0` [VERIFIED: package.json:25] — quote: `"vitest": "^5.0.0"` | Existing `npm test` → `vitest run` | Regression gate only |
| jsdom | `^30.0.1` [VERIFIED: package.json:23] — quote: `"jsdom": "^30.0.1"` | Installed, unused | Do **not** switch Vitest to jsdom |
| preact / `@astrojs/preact` | `^10.29.8` / `^6.0.5` [VERIFIED: package.json:18,12] | Tool islands | Do **not** edit islands or ToolShell this phase |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `.tool-panel button` invert | Extra class on Copy | **Locked out** — UI-SPEC: Copy stays unclassed; island buttons inherit |
| `color-mix` darken | New `--accent-pressed` token | **Locked out** — no new color tokens |
| `:active` darken | `transform: scale` | **Locked out** — rejected in CONTEXT / Phase 9 |
| Native `<details>` | JS accordion / `<dl>` + click handlers | **Locked out** — CHR-05 |
| `summary::marker` | Custom `+`/`−` SVG / `list-style: none` + `::after` | **Locked out** — CHR-06 |
| Independent details | `name="faq"` exclusive accordion | **Locked out** — deferred |
| Eyeball contrast | contrast npm / Playwright screenshots | **Locked out** — no new packages |
| HEAD FaqList | Dirty overlay `heading` + ZH | **Locked out** — overlay-commit risk |

**Installation:** none.

```bash
# Do not run npm install this phase.
```

**Version verification:** versions above from `package.json` Read this session. No registry install. Do not run package-legitimacy against astro/vitest to re-add them.

## Package Legitimacy Audit

> No external packages are installed this phase. Package Legitimacy Gate not run (nothing to check).

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| — | — | — | — | — | — | None to install |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none for this phase (do not add astro/vitest/preact/playwright/contrast tools)

*Packages discovered via WebSearch or training data that have not been verified against an authoritative source are tagged `[ASSUMED]` and the planner must gate each install behind a `checkpoint:human-verify` task.* — N/A; zero installs.

## Architecture Patterns

### System Architecture Diagram

```text
Visitor GET /tools/{slug}/     (static HTML)
        |
        v
  BaseLayout + tool island
        |
        +-- .tool-panel  (HEAD ToolShell, Preact island, client:load)
        |        |
        |        +-- children: island <button>s (Generate, Download PNG, …)
        |        +-- .tool-error[role=alert]   (unchanged)
        |        +-- pre.tool-output           (unchanged)
        |        +-- button Copy[disabled=!output]
        |                 |
        |                 +-- CSS only:
        |                       idle: transparent + accent stroke/text
        |                       :hover:not(:disabled) -> accent fill, --bg text
        |                       :active:not(:disabled) -> color-mix darken
        |                       :disabled -> opacity 0.45, no invert
        |                       :focus-visible -> existing global 2px accent
        |
        +-- <h2>How to use</h2>   (unchanged; do not restyle)
        |
        +-- FaqList (Astro SSG)
                 |
                 +-- <h2>FAQ</h2>          (English, inherit heading type)
                 +-- div.faq
                       +-- details (no open, no name)  -- closed first paint
                             +-- summary  -- UA ::marker triangle; Enter/Space
                             +-- p        -- answer text (escaped)
                       +-- (siblings independent; opening one does not close others)

Theme: :root vs :root[data-theme="light"] tokens already cascade.
#navToggle / #themeToggle sit outside .tool-panel -- must not invert.
```

### Recommended Project Structure

Do **not** add files. Touch only:

```
src/styles/global.css              # replace .tool-panel block; append .faq rules
src/components/FaqList.astro       # restore HEAD, then details/summary
```

Do **not** add: `src/lib/chrome.ts`, `*.test.ts` for CSS, Playwright specs, `ToolShell` classes, overlay `__chrome`.

### Pattern 1: Scoped button states (no global `button:hover`)

**What:** Invert and darken only `.tool-panel button`. Combine `:hover` / `:active` with `:not(:disabled)` because CSS `:hover` has **no** built-in exception for disabled controls.

**When to use:** CHR-01, CHR-02, disabled Copy.

**HEAD idle block to replace** [VERIFIED: src/styles/global.css:157-166]:

```
.tool-panel { background: var(--panel); border: 1px solid var(--border); padding: 1rem; border-radius: 8px; }
.tool-panel button {
  background: transparent; color: var(--accent); border: 1px solid var(--accent);
  padding: 0.4rem 0.8rem; cursor: pointer;
}
.tool-panel button:disabled { opacity: 0.45; cursor: not-allowed; }
```

**Replacement (executor source of truth)** [VERIFIED: .planning/phases/10-interactive-chrome/10-UI-SPEC.md:196-234]:

```css
.tool-panel {
  background: var(--panel);
  border: 1px solid var(--border);
  box-shadow: 0 1px 2px var(--border);
  padding: var(--sp-4);
  border-radius: 8px;
}
.tool-panel textarea, .tool-panel input, .tool-panel select {
  width: 100%; background: var(--bg); color: var(--text); border: 1px solid var(--border);
  font-family: var(--mono); padding: 0.6rem; margin-bottom: 0.75rem;
}
.tool-panel button {
  background: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease;
}
.tool-panel button:hover:not(:disabled) {
  background: var(--accent);
  color: var(--bg);
}
.tool-panel button:active:not(:disabled) {
  background: color-mix(in srgb, var(--accent) 72%, #000000);
  border-color: color-mix(in srgb, var(--accent) 72%, #000000);
  color: var(--bg);
}
.tool-panel button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
@media (prefers-reduced-motion: reduce) {
  .tool-panel button {
    transition: none;
  }
}
```

Keep HEAD focus [VERIFIED: src/styles/global.css:68] — quote: `a:focus-visible, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`

Keep hamburger / theme 44px boxes [VERIFIED: src/styles/global.css:78-92 and 129-142] — quote: `width: 44px;` / `height: 44px;` / `background: transparent;`

**Why `:not(:disabled)`:** HTML `disabled` on `<button>` prevents clicks and focus [CITED: Context7 /mdn/content HTML disabled attribute]. CSS `:hover` still matches a disabled control the pointer is over [ASSUMED: no MDN sentence that `:hover` excludes `:disabled`; UI-SPEC already requires `:hover:not(:disabled)`]. Without `:not(:disabled)`, invert fill would paint through `opacity: 0.45` and look like an enabled hover.

**`color-mix` fallback:** `color-mix(in srgb, …)` is a CSS Color 5 function. MDN documents the `in srgb` rectangular-space form [CITED: Context7 /mdn/content color-mix]. If a visitor browser rejects the function, the `:active` declarations are invalid and the button stays on the `:hover` invert (accent fill / `--bg` text). That is the fallback — **do not** add `@supports` or a second hex token unless UI-SPEC is reopened. Exact engine versions are [ASSUMED] (MDN BCD page could not be fetched this session).

### Pattern 2: Panel shadow uses `--border`, padding uses `--sp-4`

**What:** CHR-04 refinement is a 1px border **plus** a 2px-blur shadow in the same `--border` color, and the one Phase-9-deferred retokenize (`padding: 1rem` → `var(--sp-4)`).

**When to use:** `.tool-panel` only. Do not retokenize `.tool-panel button` padding `0.4rem 0.8rem`, form-control `0.6rem` / `0.75rem`, `.tool-grid` `gap: 1rem`, footer rem, hamburger overlay 16/8px, 44px hit targets, `--content: 52rem`.

**Do not** introduce `--shadow` or `--radius`. Keep `border-radius: 8px`.

### Pattern 3: Native FAQ disclosure (HEAD FaqList only)

**What:** SSG maps `{ question, answer }` to `<details>` / `<summary>` / `<p>`. No `open` (Boolean `open` means visible; omitting it = closed). No `name` (`name` groups exclusive accordion). Marker stays UA triangle.

DATA_k7m2p9qx_START
MDN details `open`: “The details are shown when this attribute exists, or hidden when this attribute is absent. By default this attribute is absent which means the details are not visible. … `open="false"` makes the details visible because this attribute is Boolean.”
DATA_k7m2p9qx_END
[CITED: Context7 /mdn/content files/en-us/web/html/reference/elements/details/index.md]

DATA_n4w8c1vz_START
MDN details `name`: “This attribute enables multiple `<details>` elements to be connected, with only one open at a time.”
DATA_n4w8c1vz_END
[CITED: Context7 /mdn/content details name]

DATA_r3h6t2yb_START
MDN summary default style: “Per the HTML specification, the default style for `<summary>` elements includes `display: list-item`. This makes it possible to change or remove the icon … You can also change the style to `display: block` to remove the disclosure triangle. … For WebKit-based browsers, such as Safari, it is possible to control the icon display through the non-standard CSS pseudo-element `::-webkit-details-marker`. To remove the disclosure triangle, use `summary::-webkit-details-marker { display: none }`.”
DATA_r3h6t2yb_END
[CITED: Context7 /mdn/content files/en-us/web/html/reference/elements/summary/index.md]

**Implication:** `list-style: none`, `display: block` on `summary`, or `::-webkit-details-marker { display: none }` **hides** CHR-06. Do not set any of them. Styling `summary::marker { color: var(--text) }` is allowed. Do not set `display: flex` / `grid` on `summary` (common WebKit marker-break).

**HEAD markup to restore then replace** (git show HEAD this session):

```
---
interface Props {
  items: { question: string; answer: string }[];
}

const { items } = Astro.props;
---
<h2>FAQ</h2>
<dl>
  {items.map((item) => (
    <>
      <dt>{item.question}</dt>
      <dd>{item.answer}</dd>
    </>
  ))}
</dl>
```

**Replacement** [VERIFIED: .planning/phases/10-interactive-chrome/10-UI-SPEC.md:295-312]:

```astro
---
interface Props {
  items: { question: string; answer: string }[];
}

const { items } = Astro.props;
---
<h2>FAQ</h2>
<div class="faq">
  {items.map((item) => (
    <details>
      <summary>{item.question}</summary>
      <p>{item.answer}</p>
    </details>
  ))}
</div>
```

Use Astro text interpolation (`{item.answer}`), **not** `set:html`. Answers are author markdown strings from the content collection; escaping is the XSS control.

HEAD caller already matches [git show HEAD:src/pages/tools/[slug].astro]: `<FaqList items={page.data.faq} />`. Do **not** edit that page. Dirty working-tree slug passes `heading={copy.faq}` — leave it unstaged.

FAQ CSS [VERIFIED: .planning/phases/10-interactive-chrome/10-UI-SPEC.md:252-280]:

```css
.faq details {
  margin: 0 0 var(--sp-4);
}
.faq summary {
  cursor: pointer;
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  padding: var(--sp-2) 0;
  overflow-wrap: anywhere;
}
.faq summary::marker {
  color: var(--text);
}
.faq summary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.faq details > p {
  margin: 0 0 var(--sp-2);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text);
  overflow-wrap: anywhere;
}
```

`summary` is not matched by HEAD `button:focus-visible`. The FAQ rule is required for CHR-03 parity on E4.

HEAD schema: FAQ is `{ question, answer }[]` with `.min(3).max(5)` (git show HEAD:src/content.config.ts). Live tools always have items. Zero-item paint: `h2` FAQ + empty `.faq` — no “No questions” copy.

### Anti-Patterns to Avoid

- **Editing dirty overlay FaqList / ToolShell as if they were HEAD.** `heading` prop, LED `tool-panel__chrome`, `locale`, `copy.faq` / `copy.copied` are out of scope.
- **`git checkout HEAD -- src/components/ToolShell.tsx` as a “cleanup”.** Not an in-scope edit; leave the dirty file in the worktree and **do not** `git add` it.
- **Global `button:hover`.** Would invert `#navToggle` / `#themeToggle`.
- **`transform: scale` on `:active` or `:hover`.**
- **Second outline on `.tool-panel button`.**
- **`list-style: none` / `display: block` / `::-webkit-details-marker { display: none }`.** Hides CHR-06.
- **`name` on `<details>`.** Exclusive accordion (deferred).
- **`open` or `open="false"`.** First paint must be closed; `open="false"` still opens.
- **`git add -A` / stash pop.** Stages ZH tree / overlay chrome.
- **Playwright / jsdom / contrast npm / `chrome.test.ts`.** Nyquist is file `rg` + `npm test` + build + human UAT.
- **Restyling page `h2` or FAQ answers as `--muted`.**
- **Retokenizing button padding `0.4rem 0.8rem` onto `--sp-*`.**

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FAQ collapse | Preact accordion / `useState` + `hidden` | Native `<details>` / `<summary>` | Keyboard, no JS, SSG-friendly |
| Open/close icon | SVG chevron pack | UA `::marker` | CHR-06 lock; no icon library |
| Pressed color token | `--accent-pressed` | `color-mix(in srgb, var(--accent) 72%, #000000)` | UI-SPEC; no new tokens |
| Disabled hover leak | `pointer-events: none` extra class | `:hover:not(:disabled)` | Matches UI-SPEC; still shows 0.45 opacity |
| Focus ring | New `.tool-panel button:focus` | Existing 2px accent + FAQ summary rule | CHR-03 |
| Contrast CI | `axe` / `polished` / Playwright | Eyeball UAT both themes | No new packages |
| Copy class | `class="copy-btn"` | `.tool-panel button` | Island buttons inherit invert |

**Key insight:** The rewrite-class failure is **scope** (overlay LED / ZH / ToolShell), not CSS API. Mixing dirty `FaqList` `heading` or adding `button:hover` globally ships the wrong product.

## Common Pitfalls

### Pitfall 1: Executing against the dirty overlay
**What goes wrong:** Commit includes `heading` prop, LED chrome, `locale` ToolShell, `src/pages/zh/`, `LangSwitch`.
**Why it happens:** Dirty `FaqList.astro` already has `class="faq"`; Read without `git show HEAD` looks half-done. Dirty `ToolShell` already has a button inside extra wrappers.
**How to avoid:** `git checkout HEAD -- src/components/FaqList.astro` before the details rewrite. Do **not** checkout or add `ToolShell.tsx`. Path-limited `git add src/styles/global.css src/components/FaqList.astro`.
**Warning signs:** `heading: string`, `copy.chromeLocal`, `class="led"`, `LangSwitch`, IBM Plex / Syne, `src/pages/zh/` in the phase diff.

### Pitfall 2: `:hover` without `:not(:disabled)`
**What goes wrong:** Empty-output Copy still inverts to accent fill on hover; disabled state is only `opacity: 0.45` on top of invert.
**Why it happens:** `:hover` matches disabled buttons; `:disabled` does not cancel hover.
**How to avoid:** Copy the UI-SPEC selectors verbatim: `:hover:not(:disabled)` and `:active:not(:disabled)`.
**Warning signs:** Hovering a greyed Copy paints a solid teal/green chip.

### Pitfall 3: Hiding the disclosure triangle
**What goes wrong:** CHR-06 fails in Safari or everywhere.
**Why it happens:** `list-style: none`, `display: flex`/`block` on `summary`, or `::-webkit-details-marker { display: none }` (the MDN “how to remove” snippet).
**How to avoid:** Only set `summary::marker { color: var(--text) }`. Do not copy “custom marker” tutorials.
**Warning signs:** Questions look like plain bold text with no triangle.

### Pitfall 4: Exclusive accordion via `name`
**What goes wrong:** Opening one FAQ closes another.
**Why it happens:** MDN documents `name` as the no-JS accordion API.
**How to avoid:** Do not set `name`. Independent `<details>` is the lock.
**Warning signs:** `name="faq"` in FaqList.

### Pitfall 5: `open="false"` or default `open`
**What goes wrong:** All items expanded on first paint.
**Why it happens:** Boolean attribute: presence = open.
**How to avoid:** Omit `open` entirely.
**Warning signs:** `<details open>` in built HTML.

### Pitfall 6: Global button hover / hamburger invert
**What goes wrong:** `#navToggle` / `#themeToggle` fill with accent.
**Why it happens:** `button:hover { background: var(--accent) }` without `.tool-panel`.
**How to avoid:** Selector is `.tool-panel button` only. Verify 44px icon chrome unchanged.
**Warning signs:** Theme toggle becomes a filled chip on hover.

### Pitfall 7: `color-mix` ignored (old engine)
**What goes wrong:** `:active` looks identical to `:hover`.
**Why it happens:** Invalid `color-mix()` drops those declarations; cascade keeps hover fill.
**How to avoid:** Accept as fallback (no `@supports`, no extra token). Human UAT on current Chrome/Edge/Firefox/Safari. Document in UAT: “active is darker than hover; if mix unsupported, active may equal hover.”
**Warning signs:** Pressed Copy matches hover exactly on a very old Safari.

### Pitfall 8: Light-theme invert contrast (tightest pair)
**What goes wrong:** Light hover `--bg` `#f4f6f8` on `--accent` `#0f766e` is the tightest pair (~5.05:1). Active mix is safer (~8:1).
**Why it happens:** Light accent is darker teal; invert puts near-white text on that teal.
**How to avoid:** Do not “fix” by changing tokens (Phase 7 lock). Eyeball Copy hover in **light** theme especially. Do not mute FAQ to `--muted`.
**Warning signs:** Light-theme hovered Copy looks washed; someone “fixes” it by editing `:root[data-theme="light"] --accent`.

### Pitfall 9: `git add -A` / stash pop
**What goes wrong:** ZH tree and overlay chrome land on main.
**How to avoid:** Explicit `git add` paths. Do not `git stash pop`. Confirm `stash@{0}` and `stash@{1}` still listed after the task.
**Warning signs:** `src/pages/zh/` or `LangSwitch.astro` in `git diff --cached --name-only`.

### Pitfall 10: Extra FAQ focus vs missing FAQ focus
**What goes wrong:** Either no keyboard ring on `summary` (global rule is `a, button` only) or a second ring on Copy.
**Why it happens:** Copying `.tool-panel button:focus-visible` or forgetting `.faq summary:focus-visible`.
**How to avoid:** Leave global button rule; add FAQ summary rule only.
**Warning signs:** Tab to FAQ shows no outline; Tab to Copy shows a double ring.

### Pitfall 11: Firefox persisted disabled (low likelihood)
**What goes wrong:** MDN notes Firefox may persist dynamic `disabled` on `<button>` across reloads.
**Why it happens:** UA autocomplete on buttons.
**How to avoid:** Do not edit ToolShell. If UAT sees a stuck disabled Copy after reload with output present, note it — do not add `autocomplete` this phase unless a later fix owns ToolShell.
**Warning signs:** Copy stays disabled after generating output until a full cache-bypass reload.

## Code Examples

Verified patterns from HEAD + locked UI-SPEC:

### Restore command (Wave 0 / first task)

```bash
git checkout HEAD -- src/components/FaqList.astro
git stash list   # must still show stash@{0} and stash@{1}; do not pop
# Do NOT: git checkout HEAD -- src/components/ToolShell.tsx
# Do NOT: git add src/pages/zh src/components/LangSwitch.astro src/components/ToolShell.tsx
```

### HEAD ToolShell (do not edit)

git show HEAD this session:

```tsx
<div class="tool-panel">
  {props.children}
  {props.error ? <p class="tool-error" role="alert">{props.error}</p> : null}
  <pre class="tool-output"><code>{props.output}</code></pre>
  <button type="button" onClick={onCopy} disabled={!props.output}>
    {copied ? 'Copied' : 'Copy'}
  </button>
</div>
```

Copy strings that must stay verbatim: `Copy` / `Copied`. Timeout 1500ms already in HEAD `onCopy`. No `locale` prop.

Dirty overlay (working tree, **not** the source) adds `locale`, `t()`, `tool-panel__chrome`, `led`, `copy.chromeLocal` — do not import.

### Island buttons that inherit invert (do not edit islands)

HEAD in-panel `<button>`s (git grep HEAD this session): `UuidGenerator` “Generate”; `CaseConverter` per-row copy; `LoremIpsum` / `PasswordGenerator` generate; `QrCode` “Download PNG” `disabled={!generate.matrix}`. They sit inside `.tool-panel` as `children`. Styling `.tool-panel button` is enough.

### Copy strings that must stay verbatim

- FAQ heading: `FAQ` inside `FaqList.astro`
- Copy button: `Copy` / `Copied`
- Do not add overlay `copy.faq` / `copy.copied` / `chromeLocal`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| FAQ `<dl>` / `<dt>` / `<dd>` always open | Native `<details>` closed, independent | this phase | CHR-05 / CHR-06 |
| `.tool-panel button` idle only | Invert hover + `color-mix` active + `:not(:disabled)` | this phase | CHR-01 / CHR-02 |
| Panel: 1px border, `padding: 1rem`, no shadow | Same border + `0 1px 2px var(--border)` + `--sp-4` | this phase | CHR-04 |
| JS accordion / icon pack | UA widget + `::marker` | HTML living standard `name` accordion exists but **must not** be used | Independent FAQs |
| Extra `--accent-pressed` token | `color-mix(in srgb, …)` | CSS Color 5 | No new tokens |

**Deprecated/outdated:**

- Custom JS FAQ widgets for simple Q/A — native disclosure is the lock
- `transform: scale(0.98)` as the only pressed affordance — rejected
- Contrast CI packages this milestone — eyeball UAT

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Visitor browsers parse `color-mix(in srgb, var(--accent) 72%, #000000)` so `:active` is darker than `:hover` | Pattern 1, Pitfall 7 | Active equals hover; still an invert; no `@supports` unless UI-SPEC reopened |
| A2 | Safari/WebKit still shows a UA disclosure triangle when we only set `summary::marker { color: var(--text) }` (no `list-style: none`) | Pattern 3, Pitfall 3 | Marker color may not follow `--text`; triangle may use WebKit default. CHR-06 still holds if a triangle is visible. Do not add `::-webkit-details-marker { display: none }` |
| A3 | Local WCAG relative-luminance ratios for Phase 7 hexes are all ≥ 4.5:1 (tightest light hover ~5.05:1) | CHR-07 | Formula/rounding error. **Human eyeball UAT remains the lock**; do not skip it |
| A4 | macOS Safari without “Full Keyboard Access” may not Tab to `<summary>` | Validation | Keyboard UAT on Safari may miss FAQ focus; still test Chrome/Firefox/Edge Enter/Space |
| A5 | Extra `heading` prop from dirty `[slug].astro` is harmless if FaqList HEAD Props omit it (unused Astro prop) | Pitfall 1 | If Astro starts forwarding unknown props to HTML, ignore by not committing the dirty slug |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

Discretion items from CONTEXT are **not** assumptions: 10-UI-SPEC locked 120ms, `0 1px 2px var(--border)`, unclassed Copy, `color-mix` 72%.

## Open Questions

None blocking. 10-UI-SPEC is approved and resolved CONTEXT discretion.

1. **Safari `::marker` color**
   - What we know: MDN documents WebKit `::-webkit-details-marker`; coloring `::marker` is the lock.
   - What's unclear: whether current Safari paints `::marker { color: var(--text) }`.
   - Recommendation: Human UAT; if triangle is visible, pass CHR-06. Do not hide the WebKit pseudo.

2. **Dirty `[slug].astro` vs HEAD FaqList**
   - What we know: HEAD caller is `<FaqList items={page.data.faq} />`; WT passes `heading`.
   - What's unclear: nothing for the plan — do not edit `[slug].astro`; restore FaqList from HEAD.
   - Recommendation: Path-limited add so dirty slug stays unstaged.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `astro build`, `vitest` | ✓ | v22.22.2 | — |
| npm | scripts | ✓ | 11.9.0 | — |
| git | HEAD baseline / path-limited add | ✓ | 2.52.0.windows.1 | — |
| rg (ripgrep) | Nyquist file assertions | ✓ | 14.1.1 | — |
| Knowledge graph | Cross-doc query | ✗ | — | Skip; no `.planning/graphs/graph.json` |
| Playwright CLI on PATH | — | present at `/f/pyhton3/Scripts/playwright` | — | **FORBIDDEN. Do not invoke. Do not add as a project dep.** |
| Contrast npm | — | n/a | — | **Do not install** |

**Missing dependencies with no fallback:** none for implementation.

**Missing dependencies with fallback:** graphify — unused at execute time.

**Step 2.6:** No DB, Redis, Docker. Visitor-side CSS + native HTML. No new runtime services. `src/styles/global.css` matches HEAD this session (`git diff HEAD -- src/styles/global.css` empty). Dirty: `FaqList.astro`, `ToolShell.tsx`, `src/pages/tools/[slug].astro`. Untracked: `LangSwitch.astro`, `src/pages/zh/`. Stash `{0}` and `{1}` present.

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` [VERIFIED: .planning/config.json:24] — quote: `"nyquist_validation": true`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^5.0.0` [VERIFIED: package.json:25] |
| Config file | `vitest.config.ts` — `include: ['src/**/*.test.ts']`, `environment: 'node'`, `passWithNoTests: true` [VERIFIED: vitest.config.ts:3-8] |
| Quick run command | `npm test` |
| Full suite command | `npm test` (`vitest run` [VERIFIED: package.json:9] — quote: `"test": "vitest run"`) |

Do **not** add Playwright. Do **not** add `chrome.test.ts` / `*.test.tsx` or switch Vitest to jsdom. Button/FAQ behavior is document CSS + native HTML; Nyquist coverage is **file assertions + build + human UAT**, matching Phase 7/8/9.

Do **not** add a unit test that imports `TOOLS` or renders ToolShell.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHR-01 | `.tool-panel button:hover:not(:disabled)` invert + 120ms color transition; no global `button:hover` | smoke (file) | `rg -n "tool-panel button:hover:not\\(:disabled\\)" src/styles/global.css`; `rg -n "transition: background-color 120ms ease" src/styles/global.css`; `rg -n "^button:hover" src/styles/global.css` must be empty | ❌ Wave 0 (assertion in plan, not a test file) |
| CHR-02 | `:active:not(:disabled)` `color-mix` darken; no `transform` | smoke (file) | `rg -n "color-mix\\(in srgb, var\\(--accent\\) 72%, #000000\\)" src/styles/global.css`; `rg -n "transform:" src/styles/global.css` must not appear on `.tool-panel button` | ❌ Wave 0 |
| CHR-03 | Existing 2px accent outline on `a, button`; FAQ summary has the same ring; no extra outline on `.tool-panel button` | smoke (file) | `rg -n "a:focus-visible, button:focus-visible" src/styles/global.css`; `rg -n "faq summary:focus-visible" src/styles/global.css`; `rg -n "tool-panel button:focus" src/styles/global.css` must be empty | ❌ Wave 0 |
| CHR-04 | Panel 1px `--border`, `box-shadow: 0 1px 2px var(--border)`, `padding: var(--sp-4)`, `border-radius: 8px` | smoke (file) | `rg -n "box-shadow: 0 1px 2px var\\(--border\\)" src/styles/global.css`; `rg -n "padding: var\\(--sp-4\\)" src/styles/global.css`; `rg -n "border-radius: 8px" src/styles/global.css`; `rg -n "width: 44px" src/styles/global.css` still 44 | ❌ Wave 0 |
| CHR-05 | FaqList is details/summary; no `open`; no `name`; no `heading` prop; English `h2` FAQ | smoke (file) | `rg -n "<details" src/components/FaqList.astro`; `rg -n "<dl" src/components/FaqList.astro` must be empty; `rg -n "heading" src/components/FaqList.astro` must be empty; `rg -n "<h2>FAQ</h2>" src/components/FaqList.astro`; `rg -n "open" src/components/FaqList.astro` must be empty; `rg -n "name=" src/components/FaqList.astro` must be empty | ❌ Wave 0 |
| CHR-06 | `summary::marker`; no `list-style: none` | smoke (file) | `rg -n "summary::marker" src/styles/global.css`; `rg -n "list-style:\\s*none" src/styles/global.css` must be empty (or not on `.faq summary`); `rg -n "webkit-details-marker" src/styles/global.css` must be empty | ❌ Wave 0 |
| CHR-07 | Contrast eyeball both themes | **manual / backstop** | Human UAT table below | ❌ Wave 0 |
| overlay | Phase diff has no LED / LangSwitch / `src/pages/zh/` / ToolShell | smoke (git) | `git diff --name-only` / `git diff --cached --name-only` must not list `src/pages/zh/`, `LangSwitch.astro`, `src/components/ToolShell.tsx` | ❌ Wave 0 |
| reduced-motion | Button transition none | smoke (file) | `rg -n "prefers-reduced-motion: reduce" src/styles/global.css` | ❌ Wave 0 |
| regression | Existing `src/lib/*.test.ts` stay green | unit | `npm test` | ✅ |
| build | FaqList + CSS compile | smoke | `npm run build` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test` && `npm run build`
- **Phase gate:** Full suite green + file assertions + human chrome/FAQ checklist before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] Plan tasks must include `git checkout HEAD -- src/components/FaqList.astro` **before** the details rewrite
- [ ] Plan tasks must include `rg` / `npm run build` verification (these **are** the automated commands)
- [ ] Manual-only hover/active/FAQ/contrast backstop — justified (needs real pointer, theme, and UA widgets). Do **not** add Playwright
- [ ] Do **not** create `src/lib/chrome.ts` or CSS unit tests
- Framework install: none — Vitest already present

### Manual-Only Verifications (human UAT backstop)

UI-SPEC backstop [VERIFIED: .planning/phases/10-interactive-chrome/10-UI-SPEC.md:174]: “In both themes, idle .tool-panel button accent-on-panel, hover --bg-on-accent, active darkened-accent with --bg text, and FAQ summary/answer --text on the canvas eyeball at 4.5:1; disabled Copy stays opacity 0.45 with no hover invert”

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Idle Copy: transparent fill, accent border + text | CHR-01 | Needs paint | Open `/tools/json-formatter/` (or uuid-generator) in dark, then light |
| Hover enabled Copy: accent fill, `--bg` text, ~120ms, **no scale** | CHR-01 | Needs pointer | Hover Copy; also hover Uuid “Generate” |
| Press Copy: fill darker than hover, **no scale** | CHR-02 | Needs pointer | Mouse-down; compare to hover |
| Empty output: Copy disabled, opacity 0.45, hover does **not** invert | CHR-01/02 | Needs empty state | Json formatter with empty input |
| Keyboard focus Copy: 2px accent outline, 2px offset, not a second ring | CHR-03 | Needs focus | Tab to Copy |
| Hamburger / theme toggle do **not** invert on hover | CHR-01 scope | Needs pointer | ≤640px hamburger; theme button at any width |
| Panel: 1px border + small shadow, readable in both themes | CHR-04 | Needs theme toggle | Toggle theme on a tool page |
| FAQ first paint: `h2` FAQ, every item closed, triangle visible | CHR-05/06 | Needs UA widget | View-source or expand none |
| Open one FAQ; others stay as they were | CHR-05 | Needs click | Open two in sequence |
| Keyboard: Tab to summary, Enter/Space toggles; 2px accent outline | CHR-03/05 | Needs keyboard | Chrome/Firefox/Edge; Safari may skip Tab (A4) |
| FAQ text `--text` on canvas, not muted | CHR-07 | Needs eyeball | Both themes |
| Light hover Copy still readable (~5:1 tightest) | CHR-07 | Needs eyeball | Light theme hover |
| `prefers-reduced-motion: reduce`: no color transition | CHR-01 | Needs emulation | DevTools emulate reduced motion |
| Diff has no overlay LED / zh / LangSwitch / ToolShell | HEAD discipline | Needs git | `git diff --cached --name-only` |

Local contrast math (WCAG relative luminance, computed this session — **not** a substitute for UAT) [ASSUMED A3]:

| Pair | Dark | Light |
|------|------|-------|
| Idle accent on panel | `#2dd4bf` on `#1a1d21` ~9.09:1 | `#0f766e` on `#ffffff` ~5.47:1 |
| Hover `--bg` on accent | `#121417` on `#2dd4bf` ~9.91:1 | `#f4f6f8` on `#0f766e` ~5.05:1 |
| Active `--bg` on mix(accent 72%, black) | `#121417` on `#20998a` ~5.26:1 | `#f4f6f8` on `#0b554f` ~7.99:1 |
| FAQ `--text` on `--bg` | `#e8eaed` on `#121417` ~15.3:1 | `#1a1d21` on `#f4f6f8` ~15.6:1 |
| Panel `--text` on `--panel` | `#e8eaed` on `#1a1d21` ~14.0:1 | `#1a1d21` on `#ffffff` ~16.9:1 |

Hex sources [VERIFIED: src/styles/global.css:7-12 and 34-40] — quotes: `--bg: #121417;` `--panel: #1a1d21;` `--text: #e8eaed;` `--accent: #2dd4bf;` `--border: #2a2f36;` light `--bg: #f4f6f8;` `--panel: #ffffff;` `--text: #1a1d21;` `--accent: #0f766e;` `--border: #d5dbe3;`.

Disabled Copy is `opacity: 0.45` [VERIFIED: src/styles/global.css:166] — quote: `.tool-panel button:disabled { opacity: 0.45; cursor: not-allowed; }`. WCAG 2.2 SC 1.4.3 incidental exception includes inactive UI components [CITED: W3C Understanding 1.4.3 via search snippet; treat as [ASSUMED] until eyeball UAT]. Do not raise disabled opacity to chase 4.5:1.

## Security Domain

> `workflow.security_enforcement` is enabled [VERIFIED: .planning/config.json:47] — quote: `"security_enforcement": true`. ASVS level 1 [VERIFIED: .planning/config.json:48] — quote: `"security_asvs_level": 1`.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No accounts |
| V3 Session Management | no | No new storage; theme `localStorage` unchanged |
| V4 Access Control | no | Public static pages |
| V5 Input Validation | yes (FAQ text render) | Astro `{item.question}` / `{item.answer}` text interpolation — **never** `set:html`. Content is author markdown from `src/content/tools`, not visitor input |
| V6 Cryptography | no | No secrets. Clipboard write stays existing ToolShell `navigator.clipboard.writeText` |

**Visitor threats for chrome CSS: none beyond XSS-via-HTML.** No new script, no new URL handling, no user-controlled CSS. Native `<details>` does not execute FAQ strings.

### Known Threat Patterns for this phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Overlay-commit (shipping dirty `src/pages/zh/`, `LangSwitch`, LED ToolShell) | Tampering (repo integrity, not visitor XSS) | Restore HEAD FaqList; path-limited `git add`; do not stash pop; do not add ToolShell |
| `set:html` on FAQ answers | Tampering / XSS | Text interpolation only |
| Accidental global `button:hover` | Elevation analog (scope creep) | `.tool-panel button` only |
| Inline accordion script | Tampering | Native details; no JS this phase |
| Contrast npm / Playwright install | Supply chain | Zero new packages |

## Sources

### Primary (HIGH confidence)

- `git show HEAD:src/components/ToolShell.tsx` — no locale, no LED, Copy/Copied, `class="tool-panel"`
- `git show HEAD:src/components/FaqList.astro` — `items` only, `<h2>FAQ</h2>`, `<dl>`
- `git show HEAD:src/pages/tools/[slug].astro` — `<FaqList items={page.data.faq} />`
- `src/styles/global.css` Read this session (matches HEAD) — panel/button/focus/tokens
- `.planning/phases/10-interactive-chrome/10-CONTEXT.md` — locked decisions
- `.planning/phases/10-interactive-chrome/10-UI-SPEC.md` — executor CSS/markup contract
- `.planning/REQUIREMENTS.md` CHR-01–07
- `.planning/config.json` — `nyquist_validation: true`, `security_enforcement: true`
- `package.json` / `vitest.config.ts`

### Secondary (MEDIUM confidence)

- Context7 `/mdn/content` — details `open` / `name`; summary `::marker` / `::-webkit-details-marker`; `color-mix(in srgb, …)`; `disabled`; `prefers-reduced-motion`
- [MDN `<details>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details)
- [MDN `<summary>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary)
- [MDN `color-mix()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)
- [MDN `:hover`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:hover)
- [MDN `:disabled`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:disabled)
- Phase 9 `09-RESEARCH.md` / `09-VALIDATION.md` — Nyquist = file rg + npm test + build + human UAT

### Tertiary (LOW confidence)

- WebSearch snippets for WCAG 1.4.3 incidental/disabled exemption ([Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)) — W3C fetch blocked this session
- WebSearch snippets for `color-mix` engine versions (Chrome 111 / Firefox 113 / Safari 16.2) — BCD table not fetched
- Local relative-luminance arithmetic for CHR-07 pairs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; HEAD + UI-SPEC CSS is the stack
- Architecture: HIGH — two files, native details, scoped CSS; overlay trap is the real risk
- Pitfalls: HIGH for overlay / `:disabled:hover` / marker-hiding / `name` / `open`; MEDIUM for Safari marker color and `color-mix` fallback

**Research date:** 2026-09-18
**Valid until:** 30 days (HTML/CSS chrome; not a fast-moving package)

**Nyquist reminder for planner:** automated = `rg` file assertions + `npm test` + `npm run build`. Hover, active darken, FAQ triangle, both-theme contrast = **human UAT**. Do not add Playwright.
