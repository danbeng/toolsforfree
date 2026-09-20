# Phase 11: i18n Kernel - Pattern Map

**Mapped:** 2026-09-20
**Files analyzed:** 7
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/i18n/locales.ts` | utility | transform | `src/data/tools.ts` (`ToolCategory` union + `TOOLS` const) + CONVENTIONS `typeof LOCALES[number]` | role-match |
| `src/i18n/locales.test.ts` | test | request-response | `src/i18n/errors.test.ts` | exact |
| `src/i18n/path.ts` | utility | transform | `src/i18n/errors.ts` (`localizeError` — pure named export, no throw on empty) | role-match |
| `src/i18n/path.test.ts` | test | request-response | `src/i18n/errors.test.ts` | exact |
| `src/i18n/useToolUi.ts` | utility / hook (pure fn) | transform | `src/i18n/errors.ts` (`localizeError`) + `src/i18n/ui.ts` (`t`) | exact (compose) |
| `src/i18n/useToolUi.test.ts` | test | request-response | `src/i18n/errors.test.ts` | exact |
| `src/i18n/ui.ts` | config | transform | itself (`src/i18n/ui.ts`) | exact |

Header still imports Locale from `ui.ts` — analog: `src/components/Header.astro` line 5. Do not change Header this phase.

## Pattern Assignments

### `src/i18n/locales.ts` (utility, transform)

**Analog:** `src/data/tools.ts` (const array / derived type) + CONVENTIONS.md lines 28–30

**Imports pattern:** none (leaf). Must not import `./ui`.

**Core pattern** (CONVENTIONS + RESEARCH):

```typescript
export const LOCALES = ['en', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_META: Record<
  Locale,
  { hreflang: string; htmlLang: string; nativeLabel: string }
> = {
  en: { hreflang: 'en', htmlLang: 'en', nativeLabel: 'English' },
  zh: { hreflang: 'zh-Hans', htmlLang: 'zh-Hans', nativeLabel: '中文' },
};
```

**Const-array analog** (`src/data/tools.ts` lines 1–8):

```typescript
export type ToolCategory =
  | 'Format'
  | 'Auth'
  | 'Encode'
  | 'Generate'
  | 'Text'
  | 'Time'
  | 'Color';
```

Prefer `typeof LOCALES[number]` over repeating a union like current `ui.ts` line 190.

**Error handling:** no throw. Illegal locale is handled in `path.ts`, not here.

---

### `src/i18n/locales.test.ts` (test)

**Analog:** `src/i18n/errors.test.ts` lines 1–3

**Imports pattern:**

```typescript
import { describe, expect, it } from 'vitest';
import { LOCALES, LOCALE_META, type Locale } from './locales';
```

**Core pattern** (same file, describe/it + property asserts):

```typescript
describe('LOCALES', () => {
  it('is en then zh', () => {
    expect(LOCALES).toEqual(['en', 'zh']);
  });
});
```

Vitest Node (`vitest.config.ts`: `include: ['src/**/*.test.ts']`, `environment: 'node'`). No jsdom.

---

### `src/i18n/path.ts` (utility, transform)

**Analog:** `src/i18n/errors.ts` lines 14–18 — pure function, empty/invalid input does not throw.

**Imports pattern:**

```typescript
import type { Locale } from './locales';
```

Never `from './ui'`.

**Core pattern** — named exports matching `errors.ts` style:

```typescript
export function localizeError(locale: 'en' | 'zh', error: string | null): string | null {
  if (!error) return error;
  if (locale !== 'zh') return error;
  return ZH_ERRORS[error] ?? error;
}
```

Apply the same: small named functions, early return, no throw.

**Path contract** (locked CONTEXT, not yet in repo):

- `localizedPath(locale, path)` — EN unprefixed + trailing `/`; ZH `/zh/` prefix
- `switchLocalePath(pathname, target)` — strip `/zh` then apply target
- `localeFromPathname` — `/zh/` or exact `/zh` → `'zh'`, else `'en'`
- Normalize leading `/` + trailing `/`; collapse `//` so result never starts with `//`
- Illegal locale → treat as `'en'`

**Error handling:** never throw (same as `localizeError` unknown-key fallback `?? error`).

---

### `src/i18n/path.test.ts` (test)

**Analog:** `src/i18n/errors.test.ts` (table of expect pairs, lines 8–14)

**Imports:**

```typescript
import { describe, expect, it } from 'vitest';
import { localizedPath, switchLocalePath, localeFromPathname } from './path';
```

Copy the `expect(fn(a)).toBe(b)` style, not a custom harness.

---

### `src/i18n/useToolUi.ts` (utility, transform)

**Analog:** compose `t` from `src/i18n/ui.ts` lines 193–195 and `localizeError` from `src/i18n/errors.ts` lines 14–18.

**Imports pattern:**

```typescript
import { t, type Locale } from './ui';
import { localizeError } from './errors';
```

(`Locale` from `ui` re-export keeps islands that import Locale from ui compiling; RESEARCH also allows `type Locale` from `./locales`.)

**Core pattern** (`ui.ts` `t`):

```typescript
export function t(locale: Locale): UiDict {
  return ui[locale];
}
```

**Error wrapping — do not pass empty string through `localizeError`:**

```typescript
export function useToolUi(locale: Locale) {
  const copy = t(locale);
  const tooLarge = copy.tooLarge;
  function err(error: string | null): string | null {
    if (!error) return null;
    return localizeError(locale, error);
  }
  return { copy, tooLarge, err };
}
```

`localizeError` returns `''` for `''` (`if (!error) return error`). Locked: `err('')` / `err(null)` → `null`.

Pure function — no `preact/hooks`. Named export (CONVENTIONS: named exports for i18n).

---

### `src/i18n/useToolUi.test.ts` (test)

**Analog:** `src/i18n/errors.test.ts` lines 1–6 and 106–112 (`INPUT_TOO_LARGE_MSG` from `../lib/limits`).

**Imports:**

```typescript
import { describe, expect, it } from 'vitest';
import { useToolUi } from './useToolUi';
import { INPUT_TOO_LARGE_MSG } from '../lib/limits';
```

**tooLarge byte-match analog** (`src/lib/limits.ts` lines 2–3, `errors.ts` line 7):

```typescript
export const INPUT_TOO_LARGE_MSG =
  'Input too large to process in the browser.';
```

`ui.en.tooLarge` must equal this string.

---

### `src/i18n/ui.ts` (config, transform) — EDIT

**Analog:** same file. Expand; do not invent a new dictionary shape.

**Current Locale (lines 190–195) — replace union, keep `t`:**

```typescript
export type Locale = 'en' | 'zh';
export type UiDict = (typeof ui)['en'];

export function t(locale: Locale): UiDict {
  return ui[locale];
}
```

**Replace with:**

```typescript
import type { Locale } from './locales';
export type { Locale };
export type UiDict = (typeof ui)['en'];

export function t(locale: Locale): UiDict {
  return ui[locale];
}
```

**Header contract** (`src/components/Header.astro` line 5) — do not edit Header:

```typescript
import type { Locale } from '../i18n/ui';
```

**Existing nested nav (keep)** lines 90–93 / 182–185:

```typescript
    nav: {
      menu: 'Open menu',
      close: 'Close menu',
    },
```

Do not nest `navTools` under `nav`. Top-level keys only (`navTools`, `navBlog`, `navAbout`).

**Existing `tools` blocks (later eight)** — keep `word-counter` … `qr-code` unchanged. Add original ten slugs with `name` + `shortDescription` + island keys (same object style as `'word-counter'` lines 4–14).

**`categories` keys** must match `src/data/tools.ts` `ToolCategory` PascalCase (`Format`, `Auth`, …) not lowercase.

**`fill` helper** (new, no analog in file — copy RESEARCH):

```typescript
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '');
}
```

**Do not add:** `chromeLocal`, `output`, `tool-panel__chrome`.

**Do not import:** `./path`, `./useToolUi`, `./errors` (cycle fence).

## Shared Patterns

### Named i18n modules, no barrel
**Source:** CONVENTIONS.md lines 119–121; `src/i18n/errors.ts`, `src/i18n/ui.ts`
**Apply to:** all new i18n files
Import concrete paths (`./locales`, `./ui`). Do not create `src/i18n/index.ts`.

### Locale re-export for Header
**Source:** `src/components/Header.astro` line 5
**Apply to:** `ui.ts` only
Keep `export type { Locale }` on `ui.ts`. `locales.ts` is the type source.

### Vitest colocated tests
**Source:** `src/i18n/errors.test.ts` lines 1–3
**Apply to:** `locales.test.ts`, `path.test.ts`, `useToolUi.test.ts`

```typescript
import { describe, expect, it } from 'vitest';
```

### English errors / ZH map
**Source:** `src/i18n/errors.ts` lines 1–18
**Apply to:** `useToolUi.err` only
Do not expand `ZH_ERRORS` this phase.

### Import graph (no cycles)

```
locales.ts  (leaf)
    ^
path.ts     errors.ts
    ^
  ui.ts  (re-exports Locale; no path/errors/useToolUi)
    ^
useToolUi.ts  (ui + errors)
```

### Trailing slashes / EN unprefixed
**Source:** CONVENTIONS + `astro.config.mjs` `trailingSlash: 'always'`
**Apply to:** `path.ts`

### Git allowlist
Only the seven i18n CREATE/EDIT files. Do not stage Header, ToolShell, crontab, LangSwitch, ZH pages.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | Path helpers have no existing path module; use `errors.ts` purity + RESEARCH tables |

`fill()` has no in-repo analog; implement as RESEARCH regex replace.

## Metadata

**Analog search scope:** `src/i18n/`, `src/data/tools.ts`, `src/lib/limits.ts`, `src/components/Header.astro`
**Files scanned:** 6 tracked analogs (`git ls-files` non-empty)
**Pattern extraction date:** 2026-09-20
