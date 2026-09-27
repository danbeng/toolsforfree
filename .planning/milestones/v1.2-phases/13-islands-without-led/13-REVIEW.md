---
phase: 13-islands-without-led
reviewed: 2026-09-21T12:00:00Z
depth: standard
files_reviewed: 20
files_reviewed_list:
  - src/components/ToolShell.tsx
  - src/components/tools/ToolIsland.astro
  - src/components/tools/JsonFormatter.tsx
  - src/components/tools/WordCounter.tsx
  - src/components/tools/JwtDecoder.tsx
  - src/components/tools/Base64Tool.tsx
  - src/components/tools/UrlEncode.tsx
  - src/components/tools/HashGenerator.tsx
  - src/components/tools/UuidGenerator.tsx
  - src/components/tools/RegexTester.tsx
  - src/components/tools/UnixTimestamp.tsx
  - src/components/tools/CrontabExplainer.tsx
  - src/components/tools/ColorConverter.tsx
  - src/components/tools/CaseConverter.tsx
  - src/components/tools/LoremIpsum.tsx
  - src/components/tools/PasswordGenerator.tsx
  - src/components/tools/SqlFormatter.tsx
  - src/components/tools/TextDiff.tsx
  - src/components/tools/MarkdownPreview.tsx
  - src/components/tools/QrCode.tsx
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 13: Code Review Report

**Reviewed:** 2026-09-21T12:00:00Z
**Depth:** standard
**Files Reviewed:** 20
**Status:** issues_found

## Summary

Reviewed the no-LED ToolShell, ToolIsland locale contract, original-ten islands, and later-eight ToolShell call sites. Locale wiring for Copy/Copied on ToolShell is in place: required `locale`, `t(locale)` labels, HEAD DOM order, no LED / `tool-panel__chrome`, and `locale={locale}` on all 18 ToolIsland islands and all 18 ToolShell call sites. Original ten use `useToolUi` except UuidGenerator (`t(locale)`). Later eight keep `t(locale)` / `localizeError`. `crontab.ts` is unstaged as required.

Defects are in ZH error/chrome parity on later-eight islands that pass the English `INPUT_TOO_LARGE_MSG` through, hardcoded English Copy/Copied on CaseConverter row buttons, and CrontabExplainer calling a two-argument `explainCron` that the committed lib does not accept.

## Fixes applied (2026-09-21, `e8a8516`)

- WR-01: WordCounter, CaseConverter, LoremIpsum, SqlFormatter now use `copy.tooLarge`.
- WR-02: CaseConverter row buttons use `copy.copy` / `copy.copied`.
- WR-03: CrontabExplainer calls `explainCron(input)` against the committed one-arg signature. Dirty two-arg `crontab.ts` remains unstaged (fence).
- IN-01 / IN-02 left as info.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Later-eight too-large errors stay English on ZH pages

**File:** `src/components/tools/WordCounter.tsx:12-13`
**Also:** `src/components/tools/CaseConverter.tsx:36-37`, `src/components/tools/LoremIpsum.tsx:31-33`, `src/components/tools/SqlFormatter.tsx:23-24`
**Issue:** These islands pass `INPUT_TOO_LARGE_MSG` (English) as `ToolShell` `error` instead of `copy.tooLarge` / `localizeError`. Original-ten islands already use `useToolUi().tooLarge` (ZH: `输入过长，无法在浏览器中处理。`). MarkdownPreview and QrCode in the same later-eight set already call `localizeError(locale, INPUT_TOO_LARGE_MSG)`. On `/zh/` a 100k+ input shows English. Each file already has `const copy = t(locale)`.
**Fix:** Use the localized too-large string already in `t(locale)`:

```tsx
if (isTooLarge(input)) {
  return { error: copy.tooLarge, output: '' };
}
```

LoremIpsum should use `copy.tooLarge` (or `localizeError(locale, INPUT_TOO_LARGE_MSG)`) in `onGenerate`, matching QrCode/MarkdownPreview.

### WR-02: CaseConverter row Copy/Copied is hardcoded English

**File:** `src/components/tools/CaseConverter.tsx:62-64`
**Issue:** Nine per-row clipboard buttons render `'Copied'` / `'Copy'` instead of `copy.copied` / `copy.copy`. ToolShell Copy on the same panel localizes (EN Copy / ZH 复制). On `/zh/tools/case-converter/` the visitor sees mixed chrome: 复制 on the shell button and Copy on every case row. Phase 13’s Copy/Copied contract lives in `ui.ts`; this island already calls `t(locale)`.
**Fix:**

```tsx
<button type="button" onClick={() => onCopyRow(key, result.value![key])}>
  {copiedKey === key ? copy.copied : copy.copy}
</button>
```

### WR-03: CrontabExplainer calls two-arg `explainCron`; committed lib is one-arg

**File:** `src/components/tools/CrontabExplainer.tsx:17`
**Issue:** The landed island calls `explainCron(input, locale)`. Committed `src/lib/crontab.ts` is `explainCron(input: string)` (locale param exists only in the unstaged dirty file). Extra arguments are a TypeScript `TS2554` error against the committed signature. At runtime JS ignores the extra arg, so ZH crontab field labels stay English (`minute` / `hour` …) even though the island threads `locale`. Overlay-free `astro check` / tsc in Phase 14 will fail unless crontab.ts is committed or this call is reduced to one argument.
**Fix:** Until `crontab.ts` is allowed to land, call the committed signature:

```tsx
const r = explainCron(input);
```

When the locale-aware parser is committed, restore `explainCron(input, locale)` and add the English cron errors to `ZH_ERRORS`.

## Info

### IN-01: SqlFormatter dialect `<option>` list missing `key`

**File:** `src/components/tools/SqlFormatter.tsx:43-45`
**Issue:** `DIALECT_OPTIONS.map` renders `<option>` without `key`. Preact will warn during reconciliation; dialect never reorders so this is not a functional bug.
**Fix:** `<option key={opt.value} value={opt.value}>{opt.label}</option>`

### IN-02: HashGenerator leaves `hashText` rejection unhandled

**File:** `src/components/tools/HashGenerator.tsx:24-26`
**Issue:** `hashText(input, alg).then(...)` has no `.catch()`. If `crypto.subtle.digest` rejects (unsupported algorithm, non-secure context), the promise is an unhandled rejection and the previous hex stays in `output` with `error === null`.
**Fix:**

```tsx
hashText(input, alg).then(
  (hex) => { if (!cancelled) setOutput(hex); },
  () => {
    if (!cancelled) {
      setOutput('');
      setError(err('Hash failed'));
    }
  },
);
```

Only add a ZH_ERRORS key if that English string is shown to users.

---

_Reviewed: 2026-09-21T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
