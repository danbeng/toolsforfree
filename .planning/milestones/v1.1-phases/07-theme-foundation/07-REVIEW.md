---
phase: 07-theme-foundation
reviewed: 2026-09-16T03:50:23Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/components/ThemeInit.astro
  - src/components/ThemeToggle.astro
  - src/styles/global.css
  - src/layouts/BaseLayout.astro
  - src/components/Header.astro
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
status: clean
---

# Phase 7: Code Review Report

**Reviewed:** 2026-09-16T03:50:23Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** clean

## Summary

Adversarial standard-depth review of the committed Phase 7 theme-foundation sources (`git show HEAD:<path>`), scoped to the five files in `07-01-SUMMARY.md`. Dirty overlay paths (ToolShell, JsonFormatter, pages, i18n, working-tree `global.css`) were not reviewed.

Checklist against 07-UI-SPEC / 07-CONTEXT / threat model T-07-01–03:

- **FOUC:** `ThemeInit.astro` is `<script is:inline>` and is the first `<head>` child in `BaseLayout.astro` (before charset). Production `dist/index.html` inlines the raw `localStorage.getItem('theme')` IIFE before the stylesheet — not a hashed module.
- **Allowlist:** stored values reach `setAttribute('data-theme', …)` only when exactly `'light'` or `'dark'`; otherwise `matchMedia('(prefers-color-scheme: dark)')` supplies one of those two literals.
- **No `innerHTML` from storage:** neither theme script reads storage into markup; attribute writes are literals only.
- **First-visit `setItem`:** `ThemeInit.astro` has no `setItem`. Persistence is only in the toggle click handler.
- **Not a Preact island:** `ThemeToggle.astro` is static Astro + `is:inline`; no `client:load`, no `preact` import. Dist places the click script immediately after `#themeToggle`.
- **No overlay CSS mix-in:** committed `global.css` extends HEAD (~169-line dark chrome) with the UI-SPEC token tables, 47px/48px `--grid-line` body grid, per-theme `color-scheme`, `#themeToggle` 44px rules, and tokenized diff hunks. No IBM Plex/Syne, `--led`, sticky header, or LangSwitch.
- **try/catch:** `getItem` and `setItem` are wrapped; click still `setAttribute`s when storage throws. Empty `catch` is required by D-02 / UI-SPEC (silent storage errors, no `role="alert"`).

Toggle logic is a two-state flip (`light` → `dark` else `light`), so two clicks restore the start theme and a missing `data-theme` (init blocked) still presents `:root` dark + sun icon. Header keeps HEAD Tools/Blog/About hrefs with the control after About. Props on `BaseLayout` are unchanged; no locale, no static `color-scheme` meta, no `data-theme` on the SSG `<html>` tag.

All reviewed files meet quality standards. No issues found.

---

_Reviewed: 2026-09-16T03:50:23Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
