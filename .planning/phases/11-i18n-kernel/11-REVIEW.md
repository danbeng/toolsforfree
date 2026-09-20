---
phase: 11-i18n-kernel
reviewed: 2026-09-20T05:01:21Z
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
  warning: 1
  info: 1
  total: 2
status: issues_found
---

# Phase 11: Code Review Report

**Reviewed:** 2026-09-20T05:01:21Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Reviewed the i18n kernel (`locales.ts`, `path.ts`, `ui.ts`, `useToolUi.ts` and colocated tests) against KERN-01–04 and T-11-01–04.

Path helpers collapse leading slashes and strip schemes, so results never start with `//`. `useToolUi.err('')` / `err(null)` return `null` before `localizeError`. `Locale` is sourced from `locales.ts` and re-exported from `ui.ts` with no `locales ↔ ui` cycle. `fill()` only reads `{token}` slots from a string record. Required chrome keys, PascalCase `categories`, and original-ten `tools[slug]` entries are present on both locales.

One type-contract defect fails `tsc --noEmit` on `ui.ts` itself.

## Warnings

### WR-01: `t()` return type is EN-only literals; `tsc` fails under `as const`

**File:** `src/i18n/ui.ts:454-458`
**Issue:** `export type UiDict = (typeof ui)['en']` captures English string literal types (`langSwitch: 'Language'`, …). `ui` is `as const`, so `ui[locale]` is the EN|ZH union and is not assignable to that EN-only `UiDict`. `npx tsc --noEmit` reports:

```
src/i18n/ui.ts(457,3): error TS2322: Type '{ …en… } | { …zh… }' is not assignable to type UiDict.
  Types of property 'langSwitch' are incompatible.
    Type '"语言"' is not assignable to type '"Language"'.
```

Runtime `t('zh')` is correct, but the public contract lies (callers type `copy.langSwitch` as `'Language'` even for `zh`) and the kernel file does not typecheck. Phase 12/13 consumers inherit a red `tsc` baseline.

**Fix:** Infer `UiDict` from both locales so `return ui[locale]` typechecks and leaf strings are `string` (or the EN|ZH union), not EN literals:

```ts
export type UiDict = (typeof ui)[Locale];

export function t(locale: Locale): UiDict {
  return ui[locale];
}
```

Do not silence this with `as UiDict` — that keeps the type lie.

## Info

### IN-01: Two-slash security test does not pin the collapsed path

**File:** `src/i18n/path.test.ts:49-52`
**Issue:** The T-11-01 case only asserts `!result.startsWith('//')`. A regression that returned `''`, `'/'`, or `'evil.com/'` (no leading slash) would still pass. Implementation currently yields `/evil.com/`.
**Fix:** Assert the exact collapsed value:

```ts
expect(switchLocalePath('//evil.com', 'en')).toBe('/evil.com/');
```

---

_Reviewed: 2026-09-20T05:01:21Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
