---
phase: 09-grid-spacing
reviewed: 2026-09-18T12:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/styles/global.css
  - src/pages/index.astro
  - src/pages/tools/index.astro
findings:
  critical: 1
  warning: 0
  info: 0
  total: 1
status: issues_found
---

# Phase 9: Code Review Report

**Reviewed:** 2026-09-18T12:00:00Z
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Reviewed the three in-scope Phase 9 files (`src/styles/global.css`, `src/pages/index.astro`, `src/pages/tools/index.astro`) against LAY-01–03, 09-UI-SPEC, and HEAD catalog consumers. Home featured and `/tools/` category maps wrap correctly in `.card-grid`; `:root` defines `--sp-1`…`--sp-12` before the light selector; wrap/nav retokenize and layout-only `a.tool-card` chrome match the contract.

The new global `.card-grid` / `.tool-card` rules are unscoped. HEAD `WordCounter.tsx` and `TextDiff.tsx` already use those class names on in-tool metric tiles (`class="tool-grid card-grid"` + `div.tool-card`). At ≥1080px those islands inherit the catalog 3-column track, and the tiles pick up catalog padding, border, panel fill, and accent hover. That violates LAY-01 (in-tool grids must not gain a 1080px track) and restyles two shipped tools this phase was forbidden to touch.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: Unscoped `.card-grid` / `.tool-card` restyle in-tool metric tiles

**File:** `src/styles/global.css:173-217`
**Issue:** New catalog rules target the bare classes `.card-grid` and `.tool-card`. Those class names already exist on HEAD in-tool islands, which this phase must not change:

- `src/components/tools/WordCounter.tsx` — six metric tiles in `<div class="tool-grid card-grid">` with `<div class="tool-card">`
- `src/components/tools/TextDiff.tsx` — added/removed tiles in the same pattern

Before this CSS, `.card-grid` and `.tool-card` had no rules, so those islands were a 1-column `.tool-grid` (`gap: 1rem`, no 1080px track). After this CSS:

1. `.card-grid` at `min-width: 720px` forces 2 columns and at `min-width: 1080px` forces 3 columns on the metric grids. LAY-01 requires in-tool `.tool-grid` to stay 1-col default / 2-col only when `.split` at 720px, and never 3-col.
2. `.tool-card` applies catalog chrome (`padding`, `border`, `background: var(--panel)`, `color: var(--text)`) to non-link `div`s inside `.tool-panel`.
3. `.tool-card:hover { color: var(--accent) }` runs on those static stat tiles, so hovering a word-count or diff number restyles the text.

Home/`/tools/` wrappers themselves match the spec. The defect is the global selectors colliding with existing island markup.

**Fix:** Scope catalog selectors so they cannot match `.tool-grid.card-grid` or `div.tool-card`. Do not edit the tool islands (out of phase scope).

```css
.card-grid:not(.tool-grid) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--sp-4);
}
@media (min-width: 720px) {
  .card-grid:not(.tool-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1080px) {
  .card-grid:not(.tool-grid) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
h2:has(+ .card-grid) {
  margin-bottom: var(--sp-4);
}

a.tool-card {
  display: block;
  min-width: 0;
  padding: var(--sp-4);
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text);
  text-decoration: none;
  overflow-wrap: anywhere;
}
a.tool-card:hover {
  color: var(--accent);
}
a.tool-card strong {
  display: block;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}
a.tool-card p {
  margin: var(--sp-2) 0 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
}
```

---

_Reviewed: 2026-09-18T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
