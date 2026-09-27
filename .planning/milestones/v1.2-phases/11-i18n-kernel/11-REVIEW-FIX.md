---
phase: 11
fixed_at: 2026-09-20T05:09:00Z
review_path: .planning/phases/11-i18n-kernel/11-REVIEW.md
iteration: 1
findings_in_scope: 1
fixed: 1
skipped: 0
status: all_fixed
---

# Phase 11: Code Review Fix Report

**Fixed at:** 2026-09-20T05:09:00Z
**Source review:** `.planning/phases/11-i18n-kernel/11-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 1 (WR-01 only; IN-01 out of `critical_warning` scope)
- Fixed: 1
- Skipped: 0

## Verification

Gates ran in the isolated review-fix worktree (`G:/海外练手项目/.claude/worktrees/rf-11-19123-1789880882`), using the main checkout's `node_modules` binaries. Numbers are from that worktree, not a post-teardown main-checkout re-run.

- Tier 1: re-read `src/i18n/ui.ts` — `export type UiDict = (typeof ui)[Locale];` is present; `t()` is unchanged and has no `as UiDict` cast.
- Tier 2: `tsc --noEmit` reports no errors in `src/i18n/ui.ts` or `src/i18n/`. Remaining `tsc` errors (`astro:content`, `src/data/tools.ts`, `src/lib/crontab.ts`) are pre-existing and outside this finding.
- `npx vitest run src/i18n`: 4 files, 32 tests passed.

## Fixed Issues

### WR-01: `t()` return type is EN-only literals; `tsc` fails under `as const`

**Files modified:** `src/i18n/ui.ts`
**Commit:** `796a8c8`
**Applied fix:** Changed `export type UiDict = (typeof ui)['en']` to `export type UiDict = (typeof ui)[Locale]` so `return ui[locale]` typechecks without a silencing `as UiDict` cast. Leaf strings are the EN|ZH union, not English-only literals.

---

_Fixed: 2026-09-20T05:09:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
