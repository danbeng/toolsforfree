# Phase 10: Interactive Chrome - Pattern Map

**Mapped:** 2026-09-18
**Files analyzed:** 2 (in-scope create/modify; ToolShell explicitly out of edit)
**Analogs found:** 2 / 2

Work from **git-tracked HEAD** sources (`git show HEAD:…`). Do **not** copy dirty working-tree `FaqList.astro` (`heading` prop) or `ToolShell.tsx` (LED / locale).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/styles/global.css` | config | transform | HEAD `src/styles/global.css` `.tool-panel` block + `:root` tokens + `a:focus-visible, button:focus-visible` | exact (same file, replace block) |
| `src/components/FaqList.astro` | component | request-response (SSG) | HEAD `src/components/FaqList.astro` (restore then rewrite markup) | exact (same file, HEAD baseline) |

**Do not modify:** `src/components/ToolShell.tsx` (CSS covers Copy). **Do not analogize:** dirty overlay ToolShell / FaqList.

## Pattern Assignments

### `src/styles/global.css` (config, transform)

**Analog:** HEAD `src/styles/global.css` (git-tracked). Replace the `.tool-panel` / form-control / button / `:disabled` block (HEAD lines 157–166). Keep tokens, focus, hamburger, theme toggle, catalog cards.

**Token pattern** (HEAD lines 1–29, 32–45): consume existing `--bg` `--panel` `--text` `--border` `--accent` `--sp-2` `--sp-4`. Do not add `--shadow` `--led` `--radius`. Do not redefine `--sp-*`.

**Focus pattern — keep verbatim** (HEAD line 68):
```css
a:focus-visible, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```
Do **not** add `.tool-panel button:focus-visible`. FAQ summaries are not `button`; add `.faq summary:focus-visible` with the same 2px / 2px offset.

**Hamburger / theme — must not inherit invert** (HEAD lines 78–89, 140–142):
```css
#navToggle {
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  color: var(--text);
}
#themeToggle {
  background: transparent;
  color: var(--text);
  cursor: pointer;
}
```
Selector for hover/active is **only** `.tool-panel button`. Never global `button:hover`.

**HEAD block to replace** (lines 157–166):
```css
.tool-panel { background: var(--panel); border: 1px solid var(--border); padding: 1rem; border-radius: 8px; }
.tool-panel textarea, .tool-panel input, .tool-panel select {
  width: 100%; background: var(--bg); color: var(--text); border: 1px solid var(--border);
  font-family: var(--mono); padding: 0.6rem; margin-bottom: 0.75rem;
}
.tool-panel button {
  background: transparent; color: var(--accent); border: 1px solid var(--accent);
  padding: 0.4rem 0.8rem; cursor: pointer;
}
.tool-panel button:disabled { opacity: 0.45; cursor: not-allowed; }
```

**Replacement (copy from 10-UI-SPEC.md lines 196–234):** keep form-control padding `0.6rem` / `0.75rem` and button padding `0.4rem 0.8rem`; add `box-shadow: 0 1px 2px var(--border)`; `padding: var(--sp-4)`; hover invert; `color-mix` active; `:not(:disabled)`; `prefers-reduced-motion: reduce { transition: none }`. No `transform`.

**FAQ CSS analog:** none in HEAD (`details` unused). Copy 10-UI-SPEC.md lines 252–280. Do **not** set `list-style: none`, `display: block`/`flex` on `summary`, or `::-webkit-details-marker { display: none }`.

**Phase 9 catalog hover analog (scope, not copy onto buttons):** `a.tool-card` hover is catalog-only; this phase does not restyle cards. Match Phase 9 “no `:active` scale” on buttons via darken only.

---

### `src/components/FaqList.astro` (component, request-response / SSG)

**Analog:** `git show HEAD:src/components/FaqList.astro` (tracked). Restore this file first (`git checkout HEAD -- src/components/FaqList.astro`), then replace `<dl>` only.

**HEAD imports / props** (restore):
```astro
---
interface Props {
  items: { question: string; answer: string }[];
}

const { items } = Astro.props;
---
<h2>FAQ</h2>
```
No `heading` prop. No locale. No `ui.ts`.

**HEAD list pattern to replace:**
```astro
<dl>
  {items.map((item) => (
    <>
      <dt>{item.question}</dt>
      <dd>{item.answer}</dd>
    </>
  ))}
</dl>
```

**Replacement markup** (10-UI-SPEC.md 295–312): `div.faq` + independent `<details>` / `<summary>` / `<p>`. Text interpolation `{item.question}` / `{item.answer}` — **never** `set:html`. Omit `open` and `name`.

**Caller analog (do not edit):** HEAD `src/pages/tools/[slug].astro`:
```astro
<FaqList items={page.data.faq} />
```
Dirty WT may pass `heading={copy.faq}` — leave `[slug].astro` unstaged.

**Astro component analog (props + English chrome):** HEAD `src/components/Header.astro` — frontmatter `interface Props`, default English, no overlay i18n for this phase.

---

## Shared Patterns

### CSS custom properties (no new tokens)
**Source:** HEAD `src/styles/global.css` lines 1–45
**Apply to:** `.tool-panel`, `.faq`
Use `var(--panel)`, `var(--border)`, `var(--accent)`, `var(--bg)`, `var(--text)`, `var(--sp-2)`, `var(--sp-4)`.

### Focus ring
**Source:** HEAD `src/styles/global.css` line 68
**Apply to:** buttons (existing); FAQ `summary` (new matching rule only)

### Disabled Copy
**Source:** HEAD `.tool-panel button:disabled { opacity: 0.45; cursor: not-allowed; }` (line 166)
**Apply to:** keep opacity; pair hover/active with `:not(:disabled)`

### HEAD ToolShell (read-only analog — do not edit)
**Source:** `git show HEAD:src/components/ToolShell.tsx`
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
Copy stays unclassed. No `locale`, no `tool-panel__chrome`.

### Git / overlay discipline
**Source:** 10-RESEARCH.md Wave 0
```bash
git checkout HEAD -- src/components/FaqList.astro
# Do NOT: git checkout HEAD -- src/components/ToolShell.tsx
# Path-limited add only: src/styles/global.css src/components/FaqList.astro
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `.faq` / `summary::marker` CSS | config | transform | HEAD has no `details` rules — use 10-UI-SPEC.md 252–280 |

## Metadata

**Analog search scope:** git-tracked HEAD `src/styles/global.css`, `src/components/FaqList.astro`, `src/pages/tools/[slug].astro`, `src/components/Header.astro`; `git ls-files` confirmed tracked. Explicitly excluded dirty WT ToolShell/FaqList.
**Files scanned:** 4 HEAD sources + UI-SPEC/CONTEXT/RESEARCH
**Pattern extraction date:** 2026-09-18
