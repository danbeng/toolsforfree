# Phase 10: Interactive Chrome - Context

**Gathered:** 2026-09-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Buttons, tool panels, and FAQs feel polished and readable in both themes. This phase delivers `:hover` / `:active` / `:focus-visible` on `.tool-panel button`, a refined `.tool-panel` border plus small `--border` shadow with padding on `--sp-4`, and HEAD `FaqList.astro` rewritten from `<dl>` to native `<details>` / `<summary>` with a `::marker` open/close indicator. Visual only — no `src/lib`, catalog data, hamburger rewrite, theme tokens, or overlay ZH / LED chrome.

</domain>

<decisions>
## Implementation Decisions

### Button states
- Apply `:hover` / `:active` only to `.tool-panel button` (Copy + island actions). Hamburger `#navToggle` and `#themeToggle` stay 44px icon chrome (CHR-01, CHR-02)
- Hover inverts: `background: var(--accent); color: var(--bg)` with a short color transition (CHR-01)
- Pressed `:active` darkens the accent fill; no `transform: scale` (CHR-02; matches Phase 9 card “no :active scale”)
- Focus keeps the existing global `a:focus-visible, button:focus-visible` 2px `--accent` outline (CHR-03)
- `:disabled` stays `opacity: 0.45`; no hover/active on disabled Copy

### Tool-panel chrome
- Keep 1px `border: 1px solid var(--border)`; add a small `box-shadow` using `--border` so both light and dark remain readable (CHR-04)
- Retokenize `.tool-panel` padding `1rem` → `var(--sp-4)` (Phase 9 deferred this selector)
- Keep HEAD `border-radius: 8px`
- Edit HEAD `ToolShell` only if Copy needs a class — prefer CSS. Do not import overlay `__chrome` / `led` / locale prop (HEAD ToolShell has no locale)

### FAQ collapse
- Rewrite HEAD `FaqList.astro` from `<dl>` / `<dt>` / `<dd>` to native `<details>` / `<summary>` (CHR-05)
- All items closed on first paint; items open independently (not exclusive accordion)
- Open/close indicator is CSS `summary::marker` (disclosure triangle) — no icon pack (CHR-06)
- Keep HEAD English `h2` FAQ and markdown answers; do not commit ZH FaqList or overlay FAQ

### Contrast, HEAD vs overlay
- Eyeball WCAG AA 4.5:1 in both themes on button / panel / FAQ text; no contrast npm package (CHR-07)
- Files this phase: HEAD `src/components/FaqList.astro` + `src/styles/global.css` (button / panel / FAQ CSS). Touch HEAD `ToolShell.tsx` only if a class is required
- Work from HEAD; do not pop `stash@{0}` or `stash@{1}`; do not commit `LangSwitch.astro` or `src/pages/zh/`
- Zero new npm packages; no Playwright; no Tailwind; no `src/lib` / `TOOLS` edits

### Claude's Discretion
- Exact hover transition duration (keep it short)
- Exact `box-shadow` offset/blur as long as it uses `--border` and stays readable in both themes
- Whether Copy needs an extra class vs styling `.tool-panel button` globally

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- HEAD `src/components/ToolShell.tsx` — `<div class="tool-panel">`, children, error `role="alert"`, `<pre class="tool-output">`, Copy `<button>` (“Copy” / “Copied”); **no** `locale` prop, **no** LED chrome
- HEAD `src/components/FaqList.astro` — `h2` FAQ, `<dl>` of `dt`/`dd` from `{ question, answer }[]`; no `heading` prop
- `src/styles/global.css` — `.tool-panel` `padding: 1rem; border-radius: 8px; border: 1px solid var(--border)`; `.tool-panel button` transparent + accent border; `button:focus-visible` already 2px `--accent`; no `:hover` / `:active` on those buttons; no `details` rules
- Phase 7 tokens: `--bg` / `--panel` / `--border` / `--accent` / `--text` / `--muted` on `:root` and light block
- Phase 9 `--sp-1`…`--sp-12` on `:root`; `.tool-panel` was explicitly not retokenized then

### Established Patterns
- CSS custom properties on `:root`; components consume `var(--*)`
- Chrome is static Astro + Preact islands; no Tailwind; no new npm packages
- Work from HEAD, not dirty overlay (`LangSwitch`, `src/pages/zh/`, locale-aware ToolShell with LED)
- Path-limited `git add`; never `git add -A`
- Do not retokenize hamburger 44px, overlay 16/8px, `.diff-lines`, `.md-preview`, `.tool-grid` `gap: 1rem`, footer rem, `--content: 52rem`

### Integration Points
- `FaqList.astro` is included from tool pages (`src/pages/tools/[slug].astro`) with FAQ items from content collections
- `ToolShell` wraps every Preact tool island; Copy is the primary `.tool-panel button`
- Island tools may render additional `<button>`s inside `.tool-panel` — they inherit the same hover/active

</code_context>

<specifics>
## Specific Ideas

- Hover invert (`accent` fill / `bg` text) is the recommended CHR-01 treatment
- FAQ uses native disclosure, not a JS accordion
- Overlay LED `tool-panel__chrome` is out of scope

</specifics>

<deferred>
## Deferred Ideas

- Overlay LED indicator / `tool-panel__chrome` bar
- Localizing ToolShell Copy / FAQ heading via `ui.ts`
- Committing `src/pages/zh/` or `LangSwitch.astro`
- Exclusive accordion (only one FAQ open)
- Custom `+`/`−` or chevron SVG instead of `::marker`
- Button `:active` scale (rejected; darken fill only)
- Contrast npm package / automated contrast tests
- Restyling hamburger / ThemeToggle as filled buttons

</deferred>
