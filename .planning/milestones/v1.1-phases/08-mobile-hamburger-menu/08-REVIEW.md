---
phase: 08-mobile-hamburger-menu
reviewed: 2026-09-16T12:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/components/NavMenu.astro
  - src/components/Header.astro
  - src/styles/global.css
  - src/i18n/ui.ts
findings:
  critical: 1
  warning: 0
  info: 0
  total: 1
status: issues_found
---

# Phase 8: Code Review Report

**Reviewed:** 2026-09-16T12:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Adversarial standard-depth review of committed HEAD chrome for Phase 8 (`git show HEAD:<path>`), scoped to the four plan files. Dirty overlay paths (`LangSwitch.astro`, `src/pages/zh/`, uncommitted tool islands) were not reviewed.

Checklist against 08-UI-SPEC / 08-CONTEXT / threat model T-08-01–04:

- **Parse-order vs `#navMenu`:** classic `is:inline` IIFE queries `#navToggle` immediately (previous sibling) and defers `#navMenu` / `nav.nav` / `header.site` until `DOMContentLoaded` when `readyState === 'loading'`. Production `dist/index.html` keeps the script between `#navToggle` and `#navMenu`. Null-check returns with no `role="alert"`.
- **Leftover `inert` on widen:** `close()` always calls `setInertForViewport()`; that helper sets `inert` only when `mq.matches && !isOpen()`, otherwise `removeAttribute('inert')`. `matchMedia('(max-width: 640px)')` `change` force-closes when `matches` becomes false. First boot applies the same rule.
- **No `innerHTML` / storage / Preact:** NavMenu copies labels with `getAttribute` / `setAttribute` only. No `setItem`, `localStorage`, `document.cookie`, `preact`, or `client:load`.
- **`aria-expanded`:** SSG `false`; `open()` / `close()` write the literals `'true'` / `'false'`. `aria-controls="navMenu"` matches Header `id="navMenu"`.
- **ThemeToggle outside drawer:** Header DOM order is logo → NavMenu → `#navMenu` → ThemeToggle sibling. Labels are SSG `ui.ts` strings; Astro attribute interpolation plus `setAttribute` is not markup injection (T-08-01).
- **Mobile header alignment:** `#themeToggle { margin-left: auto }` inside `@media (max-width: 640px)` is **dead**. The later `#themeToggle { margin: 0 }` shorthand wins the cascade, so the toggle stays packed after the hamburger instead of `[Logo] [Hamburger] …… [ThemeToggle]`.

## Narrative Findings (AI reviewer)

### Critical Issues

### CR-01: Mobile `#themeToggle { margin-left: auto }` is overridden by later `margin: 0`

**File:** `src/styles/global.css:94-96` (killed by `src/styles/global.css:126`)
**Issue:** Locked mobile chrome is `[Logo] [Hamburger] …… [ThemeToggle]`, implemented as `#themeToggle { margin-left: auto }` inside `@media (max-width: 640px)`. That rule sits **above** the Phase 7 `#themeToggle` box:

```css
@media (max-width: 640px) {
  #themeToggle {
    margin-left: auto; /* lines 94-96 */
  }
}
#themeToggle {
  /* ... */
  margin: 0; /* line 126 — same specificity, later source order */
}
```

`margin: 0` is a shorthand that sets `margin-left`. Same origin, same importance, same `#themeToggle` specificity; source order wins. At `max-width: 640px`, `.nav-links` is `position: absolute` (out of flex flow) and the in-flow items are logo, hamburger, and ThemeToggle with **no** auto margin — they pack to the start. The hamburger still toggles; the header row is not the contracted layout.

**Fix:** Keep the 640px query, but declare `margin-left: auto` **after** the `#themeToggle` box so it wins:

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
@media (max-width: 640px) {
  #themeToggle {
    margin-left: auto;
  }
}
```

Remove the dead `#themeToggle { margin-left: auto }` from the earlier overlay media block (keep the rest of that block). Do not edit `ThemeToggle.astro`.

---

_Reviewed: 2026-09-16T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
