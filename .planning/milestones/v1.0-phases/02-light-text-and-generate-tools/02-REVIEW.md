---
phase: 02-light-text-and-generate-tools
reviewed: 2026-09-12T08:00:00Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - src/lib/counter.ts
  - src/lib/cases.ts
  - src/lib/lorem.ts
  - src/lib/password.ts
  - src/components/tools/WordCounter.tsx
  - src/components/tools/CaseConverter.tsx
  - src/components/tools/LoremIpsum.tsx
  - src/components/tools/PasswordGenerator.tsx
  - src/components/tools/ToolIsland.astro
  - src/data/tools.ts
  - src/i18n/ui.ts
  - src/i18n/errors.ts
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues
---

# Phase 02: Code Review Report

**Reviewed:** 2026-09-12T08:00:00Z
**Depth:** standard
**Files Reviewed:** 12
**Status:** issues

## Summary

审查了 Phase 02 四个轻量工具（word-counter / case-converter / lorem-ipsum / password-generator）的 lib、Preact island、ToolIsland 接线、目录和 i18n。CSPRNG 使用 `crypto.getRandomValues` + rejection sampling，源码无 `Math.random`；无 `innerHTML` / `fetch`；四个新工具 `featured: false`，`getFeaturedTools()` 仍为 6；ToolIsland 新分支使用 `locale={locale}` 而非 `locale="en"`；现有十个工具的 `relatedSlugs` 未改。主要问题是 Lorem 把 `isTooLarge` 用在数字字符串长度上、生成数量无上限，以及密码长度未校验整数，小数/NaN 会生成错误长度或空成功。

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Lorem 数量无上限，`isTooLarge` 用错对象

**File:** `src/components/tools/LoremIpsum.tsx:23-29`
**Also:** `src/lib/lorem.ts:129-131`
**Issue:** Island 在生成前调用 `isTooLarge(count)`，但 `count` 是数量输入字符串（如 `"3"` 或 `"1000000"`）。`isTooLarge` 比较的是 `string.length > 100_000`，即位数而不是数值，也不是生成文本大小。`generateLorem` 只拒绝 `count < 1` 或非整数，没有上限。用户把 count 设成 `1000000`（words 或 paragraphs）会在浏览器里分配巨量字符串并卡住标签页。`INPUT_MAX_CHARS` 防护在这里等于没接上。
**Fix:** 给 count 加明确上限（例如 words ≤ 10_000、paragraphs ≤ 200），并在生成后用 `isTooLarge` 检查输出：

```ts
const MAX_WORDS = 10_000;
const MAX_PARAGRAPHS = 200;

export function generateLorem(opts: {
  mode: 'words' | 'paragraphs';
  count: number;
  classic: boolean;
}): LoremResult {
  const { mode, count, classic } = opts;
  if (!Number.isInteger(count) || count < 1) {
    return { ok: false, error: COUNT_ERROR };
  }
  const max = mode === 'words' ? MAX_WORDS : MAX_PARAGRAPHS;
  if (count > max) {
    return { ok: false, error: COUNT_ERROR };
  }
  // ...
}
```

Island 侧删掉对 `count` 字符串的 `isTooLarge`，改为：

```ts
const n = Number(count);
const r = generateLorem({ mode, count: n, classic });
if (!r.ok) {
  setError(err(r.error || null));
  setOutput('');
  return;
}
if (isTooLarge(r.text)) {
  setError(INPUT_TOO_LARGE_MSG);
  setOutput('');
  return;
}
```

数量输入加上 `max`，并给新错误字符串补 `ZH_ERRORS`。

### WR-02: 密码长度未校验整数，小数/NaN 会当成功

**File:** `src/lib/password.ts:33-49`
**Also:** `src/components/tools/PasswordGenerator.tsx:56-57`
**Issue:** `generatePassword` 只检查 `length < 8 || length > 128`，没有 `Number.isInteger`。`NaN < 8` 与 `NaN > 128` 都是 false，随后 `for (let i = 0; i < NaN; i++)` 不进入循环，返回 `{ ok: true, password: '' }`——空密码被当成成功。小数同样可过：`16.5` 在范围内，循环 `i < 16.5` 会写出 17 个字符，和输入框显示的长度不一致。Island 用 `setLength(Number(...))`，`type="number"` 未设 `step={1}`，浏览器允许输入小数。
**Fix:**

```ts
if (!Number.isInteger(opts.length) || opts.length < 8 || opts.length > 128) {
  return { ok: false, error: 'Length must be between 8 and 128' };
}
```

Island 同步约束：

```tsx
<input
  type="number"
  min={8}
  max={128}
  step={1}
  value={length}
  onInput={(e) => {
    const n = Number((e.target as HTMLInputElement).value);
    if (Number.isInteger(n)) setLength(n);
  }}
/>
```

## Info

### IN-01: `countWordsFallback` 两个分支做同一件事

**File:** `src/lib/counter.ts:17-20`
**Issue:** Han 与非 Han 分支都是 `n += 1`。按字符切分后“每个片段算 1 词”的语义是对的，但条件是死代码，读起来像少写了非 Han 的分词。
**Fix:** 改成无条件累加，或给非 Han 片段真正做空白/`\w` 切分：

```ts
for (const p of parts) n += 1;
```

### IN-02: Case converter 行内 Copy/Copied 写死英文

**File:** `src/components/tools/CaseConverter.tsx:62-64`
**Issue:** 九行标签走 `labels[key]`（EN/ZH 都有），但每行按钮文案是字面量 `'Copied'` / `'Copy'`。中文页会出现中文标签 + 英文按钮。
**Fix:** 在 `ui.en` / `ui.zh` 的 `tools['case-converter']` 增加 `copy` / `copied`，按钮改用 `labels.copy` / `labels.copied`。

---

_Reviewed: 2026-09-12T08:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
