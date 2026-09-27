---
phase: 11-i18n-kernel
reviewed: 2026-09-20T05:18:07Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/i18n/locales.ts
  - src/i18n/locales.test.ts
  - src/i18n/path.ts
  - src/i18n/path.test.ts
  - src/i18n/useToolUi.ts
  - src/i18n/useToolUi.test.ts
  - src/i18n/ui.ts
findings:
  critical: 0
  warning: 0
  info: 1
  total: 1
status: issues_found
---

# Phase 11: Code Review Report

**Reviewed:** 2026-09-20T05:18:07Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Re-review after WR-01 fix (`796a8c8`, `fix(11): type UiDict from both locales`). Scope is the i18n kernel (`locales.ts`, `path.ts`, `ui.ts`, `useToolUi.ts` and colocated tests) against KERN-01–04 and T-11-01–04.

**WR-01 is fixed.** `export type UiDict = (typeof ui)[Locale]` is in place. `t()` returns `ui[locale]` with no `as UiDict` cast. `npx tsc --noEmit` reports no errors under `src/i18n/`. Leaf strings are the EN|ZH union, not English-only literals.

Path helpers still collapse leading slashes and strip schemes, so results never start with `//`. `useToolUi.err('')` / `err(null)` return `null` before `localizeError`. `Locale` is sourced from `locales.ts` and re-exported from `ui.ts` with no `locales ↔ ui` cycle. `fill()` only reads `{token}` slots from a string record. Required chrome keys, PascalCase `categories`, and original-ten `tools[slug]` entries are present on both locales.

No new critical or warning defects. The previous info finding (IN-01) is unchanged.

## Info

### IN-01: Two-slash security test does not pin the collapsed path

**File:** `src/i18n/path.test.ts:49-52`
**Issue:** The T-11-01 case only asserts `!result.startsWith('//')`. A regression that returned `''`, `'/'`, or `'evil.com/'` (no leading slash) would still pass. Implementation currently yields `/evil.com/`.
**Fix:** Assert the exact collapsed value:

```ts
expect(switchLocalePath('//evil.com', 'en')).toBe('/evil.com/');
```

---

_Reviewed: 2026-09-20T05:18:07Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
