# Phase 2: Light text and generate tools - Pattern Map

**Mapped:** 2026-09-11
**Files analyzed:** 22
**Analogs found:** 21 / 22

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/counter.ts` | utility | transform | `src/lib/json.ts` | role-match |
| `src/lib/counter.test.ts` | test | transform | `src/lib/json.test.ts` | exact |
| `src/lib/cases.ts` | utility | transform | `src/lib/json.ts` / `src/lib/color.ts` | role-match |
| `src/lib/cases.test.ts` | test | transform | `src/lib/json.test.ts` | exact |
| `src/lib/lorem.ts` | utility | transform | `src/lib/json.ts` | role-match |
| `src/lib/lorem.test.ts` | test | transform | `src/lib/json.test.ts` | exact |
| `src/lib/password.ts` | utility | transform | `src/lib/json.ts` | role-match |
| `src/lib/password.test.ts` | test | transform | `src/lib/json.test.ts` + `ToolIsland.test.ts` source-read | role-match |
| `src/components/tools/WordCounter.tsx` | component | request-response | `src/components/tools/JsonFormatter.tsx` | exact |
| `src/components/tools/CaseConverter.tsx` | component | request-response | `src/components/tools/ColorConverter.tsx` | role-match |
| `src/components/tools/LoremIpsum.tsx` | component | request-response | `src/components/tools/JsonFormatter.tsx` | exact |
| `src/components/tools/PasswordGenerator.tsx` | component | request-response | `src/components/tools/JsonFormatter.tsx` (lib) + `UuidGenerator.tsx` (button placement only) | role-match |
| `src/components/tools/ToolIsland.astro` | component | request-response | self | exact |
| `src/data/tools.ts` | config | CRUD | self | exact |
| `src/data/tools.test.ts` | test | CRUD | self | exact |
| `src/i18n/ui.ts` | config | transform | self (`tools['json-formatter']`) | exact |
| `src/i18n/errors.ts` | utility | transform | self (`ZH_ERRORS`) | exact |
| `src/content/tools/word-counter.md` (and 3 other EN) | config | file-I/O | `src/content/tools/json-formatter.md` | exact |
| `src/content/tools/zh/word-counter.md` (and 3 other ZH) | config | file-I/O | `src/content/tools/json-formatter.md` | exact |
| `src/lib/index.ts` | — | — | **DO NOT CREATE** | n/a |

## Pattern Assignments

### `src/lib/counter.ts` / `cases.ts` / `lorem.ts` / `password.ts` (utility, transform)

**Analog:** `src/lib/json.ts` (empty-input / result union). Multi-value fan-out analog: `src/lib/color.ts` lines 4–9.

**Result union** (`src/lib/json.ts` lines 1–13):
```typescript
export type JsonResult =
  | { ok: true; formatted: string }
  | { ok: false; error: string };

export function formatJson(input: string): JsonResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: '' };
  try {
    const value = JSON.parse(trimmed);
    return { ok: true, formatted: JSON.stringify(value, null, 2) };
  } catch {
    return { ok: false, error: 'Invalid JSON' };
  }
}
```

**Idle vs invalid** (`src/lib/color.ts` lines 4–9):
```typescript
export type ColorResult =
  | { ok: true; value: ColorValue }
  | { ok: false; error: string };

const INVALID: ColorResult = { ok: false, error: 'Invalid color' };
const IDLE: ColorResult = { ok: false, error: '' };
```

**Apply:**
- Counter: empty text → `{ ok: true, ...zeros }` (tiles), not idle error.
- Case: empty → `{ ok: false, error: '' }` (parser contract).
- Lorem/password: generators; invalid count/length/empty charset → English `error` strings.
- Named exports only. No `src/lib/index.ts`.
- Password: `crypto.getRandomValues` + rejection sampling from RESEARCH; never `Math.random`.
- Do not throw to the UI (`try/catch` empty like json, or return `{ ok: false }`).

---

### `src/lib/*.test.ts` (test, transform)

**Analog:** `src/lib/json.test.ts` lines 1–21.

```typescript
import { describe, expect, it } from 'vitest';
import { formatJson } from './json';

describe('formatJson', () => {
  it('returns empty error for empty input', () => {
    expect(formatJson('')).toEqual({ ok: false, error: '' });
    expect(formatJson('   ')).toEqual({ ok: false, error: '' });
  });
});
```

**Source-read analog** for PASS-04 / LORM no-fetch (`src/components/tools/ToolIsland.test.ts` lines 1–16):
```typescript
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('./ToolIsland.astro', import.meta.url), 'utf8');
expect(source.includes(`slug === '${slug}'`)).toBe(true);
```

**Apply:** colocated `src/lib/password.test.ts` read `./password.ts` and assert `getRandomValues` present, `Math.random` absent. Same for lorem vs `fetch`.

---

### `src/components/tools/WordCounter.tsx` / `LoremIpsum.tsx` (component, request-response)

**Analog:** `src/components/tools/JsonFormatter.tsx` lines 1–33 (clone this, not UuidGenerator).

```tsx
import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { formatJson } from '../../lib/json';
import { isTooLarge } from '../../lib/limits';
import type { Locale } from '../../i18n/locales';
import { useToolUi } from '../../i18n/useToolUi';

export default function JsonFormatter({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const { copy, tooLarge, err } = useToolUi(locale);
  const labels = copy.tools['json-formatter'];
  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: tooLarge, output: '' };
    }
    const r = formatJson(input);
    return { error: r.ok ? null : err(r.error || null), output: r.ok ? r.formatted : '' };
  }, [input, tooLarge, err]);

  return (
    <ToolShell error={result.error} output={result.output} locale={locale}>
      <label>
        {labels.json}
        <textarea
          rows={12}
          value={input}
          onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
        />
      </label>
    </ToolShell>
  );
}
```

**Word-counter extra:** metric tiles in children (`.card-grid` / `.tool-grid` / `.tool-card`); still pass a copyable summary string as `output` (do not put metrics only in `<pre>`).

**Size guard analog:** `src/lib/limits.ts` lines 1–7 — do not change; call `isTooLarge` in the island.

---

### `src/components/tools/CaseConverter.tsx` (component, request-response)

**Analog:** `src/components/tools/ColorConverter.tsx` lines 8–11 and 74–85 (fan-out + joined dump).

```typescript
function formatColor(r: Extract<ColorResult, { ok: true }>): string {
  const { hex, rgb, hsl } = r.value;
  return `${hex}\nrgb(${rgb.r}, ${rgb.g}, ${rgb.b})\nhsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}
```

**Copy-all analog:** `src/components/ToolShell.tsx` lines 15–17:
```typescript
await navigator.clipboard.writeText(props.output);
```

**Apply:** nine labeled rows in children; per-row `navigator.clipboard.writeText`; newline-joined dump to `ToolShell` `output`. Do not edit `ToolShell.tsx`. Keep JsonFormatter `isTooLarge` + `useToolUi` + default export.

---

### `src/components/tools/PasswordGenerator.tsx` (component, request-response)

**Lib/island analog:** JsonFormatter (above). **Button placement only:** `src/components/tools/UuidGenerator.tsx` lines 10–18 — do not copy in-island `crypto.randomUUID()`.

```tsx
useEffect(() => {
  setOutput(crypto.randomUUID());
}, []);
return (
  <ToolShell error={null} output={output} locale={locale}>
    <button type="button" onClick={() => setOutput(crypto.randomUUID())}>
      {labels.generate}
    </button>
  </ToolShell>
);
```

**Apply:** `useEffect` + click call `generatePassword` from `../../lib/password`. Generate button above toggles. Defaults in island: length 16, all four sets true, excludeSimilar false. Toggles do not auto-regen.

---

### `src/components/tools/ToolIsland.astro` (component, request-response)

**Analog:** self, lines 1–26.

```astro
import JsonFormatter from './JsonFormatter';
import ColorConverter from './ColorConverter';
{slug === 'json-formatter' && <JsonFormatter client:load locale={locale} />}
{slug === 'color-converter' && <ColorConverter client:load locale={locale} />}
```

**Apply:** four static imports + `slug === 'word-counter'` (etc.) branches. No dynamic tags (`client:*` forbidden on dynamic components).

---

### `src/data/tools.ts` (config, CRUD)

**Analog:** self, lines 1–27 and 116–132.

```typescript
export interface Tool {
  slug: string;
  name: string;
  category: ToolCategory;
  shortDescription: string;
  relatedSlugs: string[];
  featured: boolean;
}

{
  slug: 'json-formatter',
  name: 'JSON Formatter / Validator',
  category: 'Format',
  shortDescription: 'Format and validate JSON in your browser.',
  relatedSlugs: ['base64', 'jwt-decoder', 'regex-tester'],
  featured: true,
}

export function getRelatedTools(slug: string): Tool[] {
  const tool = getTool(slug);
  if (!tool) return [];
  return tool.relatedSlugs
    .map((s) => getTool(s))
    .filter((t): t is Tool => Boolean(t) && t.slug !== slug);
}
```

**Apply:** append four rows, `featured: false`, categories Text/Text/Generate/Generate. Forward `relatedSlugs` to not-yet-shipped Phase 2 slugs is OK (`getRelatedTools` filters missing). Do not edit existing ten objects' `relatedSlugs`.

---

### `src/data/tools.test.ts` (test, CRUD)

**Analog:** self, lines 11–23 and 46–52.

```typescript
it('has exactly 10 tools', () => {
  expect(TOOLS).toHaveLength(10);
});
it('features exactly six tools including json-formatter and jwt-decoder', () => {
  expect(getFeaturedTools()).toHaveLength(6);
});
it('has EN and ZH markdown for every catalog slug', () => {
  for (const { slug } of TOOLS) {
    expect(existsSync(en), `missing EN markdown for ${slug}`).toBe(true);
    expect(existsSync(zh), `missing ZH markdown for ${slug}`).toBe(true);
  }
});
```

**Apply:** bump `toHaveLength` +1 per slice (11 → 14). Do not change featured length 6.

---

### `src/i18n/ui.ts` / `src/i18n/errors.ts`

**Analog:** `src/i18n/ui.ts` lines 64–69; `src/i18n/errors.ts` lines 4–20; `src/i18n/useToolUi.ts` lines 5–11.

```typescript
'json-formatter': {
  name: 'JSON Formatter / Validator',
  shortDescription: 'Format and validate JSON in your browser.',
  json: 'JSON',
},
```

```typescript
const ZH_ERRORS: Record<string, string> = {
  'Invalid JSON': '无效的 JSON',
  'Invalid color': '无效的颜色',
};
export function localizeError(locale: Locale, error: string | null): string | null {
  if (!error) return error;
  if (locale === 'zh') return ZH_ERRORS[error] ?? error;
  return error;
}
```

**Same-slice English keys:** `Select at least one character set`, `Length must be between 8 and 128`, `Enter a count of at least 1`.

---

### EN/ZH markdown (config, file-I/O)

**Analog:** `src/content/tools/json-formatter.md` lines 1–17 + schema `src/content.config.ts` lines 15–29.

```yaml
---
locale: en
title: JSON Formatter / Validator
description: Format and validate JSON in your browser. Nothing is uploaded.
intro: Paste JSON to format and validate it locally.
howTo:
  - Paste or type JSON into the input.
  - Read the formatted output or the validation error.
  - Copy the result with the Copy button.
faq:
  - question: Does this JSON formatter upload my data?
    answer: No. Formatting runs in your browser. Nothing is uploaded.
---
```

`howTo` is a tuple of **exactly 3**; `faq` **3–5**. ZH files: `locale: zh` under `src/content/tools/zh/{slug}.md`.

## Shared Patterns

### Discriminated result union (no throw)
**Source:** `src/lib/json.ts` lines 1–13
**Apply to:** all four `src/lib/*.ts`

### Island: useMemo + isTooLarge + useToolUi + ToolShell
**Source:** `src/components/tools/JsonFormatter.tsx` lines 1–33
**Apply to:** all four islands

### Clipboard
**Source:** `src/components/ToolShell.tsx` lines 15–17
**Apply to:** copy-all (all tools) and per-row copy (case-converter)

### Completeness harness
**Source:** `src/data/tools.test.ts`, `src/components/tools/ToolIsland.test.ts`
**Apply to:** each slice (length bump, markdown existsSync, `slug ===` string)

### Size cap
**Source:** `src/lib/limits.ts` — `INPUT_MAX_CHARS = 100_000`; island-side only

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| Metric-tile markup | component | request-response | No existing tool uses count tiles; reuse global `.card-grid` / `.tool-card` (discretion). Planner should follow RESEARCH, not invent a CSS module. |

Password CSPRNG algorithm has no in-repo analog (hash uses `crypto.subtle`; uuid uses `randomUUID`). Copy RESEARCH rejection-sampling block into `src/lib/password.ts`.

## Metadata

**Analog search scope:** `src/lib`, `src/components/tools`, `src/data`, `src/i18n`, `src/content/tools`, `src/content.config.ts`
**Files scanned:** 16 tracked analogs (i18n is working-tree source, not a capability mirror)
**Pattern extraction date:** 2026-09-11
