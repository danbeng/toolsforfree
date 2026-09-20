# Phase 11: i18n Kernel - Research

**Researched:** 2026-09-20
**Domain:** Astro SSG bilingual i18n kernel (locales, path helpers, chrome copy, useToolUi)
**Confidence:** HIGH (in-repo contracts); MEDIUM (Astro docs via installed `.d.ts`, not live docs.astro.build)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- `Locale` is `export type Locale = (typeof LOCALES)[number]` in `src/i18n/locales.ts`; `ui.ts` re-exports it so existing `from '../../i18n/ui'` imports keep compiling
- `LOCALE_META`: `en` → hreflang `en`, htmlLang `en`, nativeLabel `English`; `zh` → hreflang `zh-Hans`, htmlLang `zh-Hans`, nativeLabel `中文`
- `LOCALES` order is `['en', 'zh']`
- Colocated Vitest: `locales.test.ts` and `path.test.ts` (same pattern as `errors.test.ts`)
- `localizedPath(locale, path)`: EN unprefixed + trailing slash (`/tools/`); ZH `/zh/tools/`
- `switchLocalePath(pathname, target)`: strip existing `/zh` prefix then apply target locale (`/zh/tools/json-formatter/` → EN `/tools/json-formatter/`)
- `localeFromPathname`: starts with `/zh/` or is exactly `/zh` → `'zh'`, else `'en'`
- Normalize unknown/malformed paths: ensure leading `/` and trailing slash; illegal locale treated as `'en'` (do not throw)
- Hook returns `{ copy, tooLarge, err }` matching dirty JsonFormatter
- `copy = t(locale)`; `tooLarge` from `copy.tooLarge` (EN string matches existing `'Input too large to process in the browser.'` already in `ZH_ERRORS`)
- `err('')` / `err(null)` → `null` (ToolShell treats empty error as no message); `err` wraps `localizeError`
- This phase adds the module + tests only; island wiring is Phase 13
- Top-level keys on `ui.en` / `ui.zh` (`homeLede`, `langSwitch`, `navPrivacy`, …); keep nested `nav.menu` / `nav.close`
- Fill `tools[slug]` EN+ZH labels for the original ten this phase (islands still Phase 13)
- Add `categories` EN+ZH matching catalog category names (ZH home already reads `copy.categories[g.category]`)
- `ui.ts` imports `Locale` from `./locales` and re-exports it

### Claude's Discretion
- Exact English/Chinese chrome strings beyond the locked keys, as long as they match what dirty pages already read (`homeKicker`, `homeFeatured`, `homeViewAll`, `notFoundTitle`, `related`, `howTo`, `faq`, `localNote`, `copy`/`copied`, footer, nav Tools/Blog/About)
- Whether `path.ts` helpers are pure string ops only (they should be — no `window`)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope. LangSwitch mount, ZH tree, BaseLayout locale, ToolIsland locale pass, and CI are Phases 12–14.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| KERN-01 | `src/i18n/locales.ts` exports `LOCALES`, `Locale`, and `LOCALE_META` (hreflang / htmlLang / nativeLabel) | Create `locales.ts` + `locales.test.ts`. `Locale` derived from `LOCALES`. Re-export from `ui.ts` so Header / NavMenu / WordCounter keep compiling. |
| KERN-02 | `src/i18n/path.ts` provides `localizedPath`, `switchLocalePath`, and `localeFromPathname` (EN unprefixed, ZH `/zh/`, trailing slash) | Create `path.ts` + `path.test.ts`. Pure string ops. Normalize; never throw. Collapse `//` so switcher cannot emit protocol-relative URLs. |
| KERN-03 | `src/i18n/useToolUi.ts` provides `copy` / `tooLarge` / `err()` for tool islands | Create `useToolUi.ts` + `useToolUi.test.ts`. Pure function (no `useState`). `err` wraps `localizeError` and maps `''`/`null` → `null`. Do not wire islands. |
| KERN-04 | `ui.ts` has EN+ZH chrome keys (home, nav Tools/Blog/About, footer, 404, langSwitch, howTo, faq, localNote, copy/copied); `Locale` is sourced from `locales.ts` | Expand `ui.ts`: re-export `Locale`; add locked chrome keys + dirty-consumer keys; fill original-ten `tools[slug]`; add `categories` keyed by `ToolCategory`. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Privacy / architecture: all tool computation in the browser (`src/lib`); no new API routes for tool logic
- Parity: new work must match existing tool quality (UI chrome, copy-to-clipboard, errors, EN+ZH, FAQ)
- Stack: stay on Astro + Preact + current catalog/content-collection pattern — do not introduce a new app framework
- Do not rewrite the existing ten tools in this kernel phase (island wiring is Phase 13)
- Named i18n files: `src/i18n/locales.ts`, `path.ts`, `ui.ts`, `errors.ts` — no `index.ts` barrels
- `export type Locale = (typeof LOCALES)[number]` in `locales.ts`
- English error strings in libs; ZH map in `errors.ts`; islands localize via `useToolUi` → `err()`
- Trailing slashes required; English unprefixed
- GSD: path-limited git add; do not commit LED ToolShell or `src/lib/crontab.ts`; do not pop `stash@{0}` / `stash@{1}`
- No Tailwind; no new npm packages this milestone

## Summary

Phase 11 lands the missing i18n kernel modules that dirty (uncommitted) pages and original-ten islands already import. HEAD only has `src/i18n/ui.ts` (later-eight `tools[slug]` + nested `nav.menu`/`nav.close`) and `src/i18n/errors.ts`. `locales.ts`, `path.ts`, and `useToolUi.ts` do not exist. Creating them unblocks Phase 12 (LangSwitch / ZH tree) and Phase 13 (island locale) without mounting those consumers now.

The kernel is four files of new code plus one expansion of `ui.ts`. Path helpers must emit trailing slashes to match `astro.config.mjs` `trailingSlash: 'always'`. `useToolUi` must be a pure function so Vitest Node tests can call it. `err('')` cannot be a raw pass-through of `localizeError`, because `localizeError` returns `''` for empty string.

**Primary recommendation:** Tracer = `locales.ts` + `path.ts` + tests; expansion = `ui.ts` chrome + original-ten labels + `categories` + `useToolUi.ts` + tests. Do not touch islands, ToolShell, Header, LangSwitch, ZH pages, catalog, or `crontab.ts`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Locale registry (`LOCALES`, `Locale`, `LOCALE_META`) | Frontend Server (SSG modules) | Browser / Client (islands import the type) | Static constants; no runtime locale detection |
| Path helpers (`localizedPath`, `switchLocalePath`, `localeFromPathname`) | Frontend Server (Astro pages) | — | Called at build / request from `.astro`; must stay `window`-free |
| Chrome copy (`ui.ts` / `t()`) | Frontend Server | Browser / Client | SSG pages and islands both call `t(locale)` |
| `useToolUi` (`copy` / `tooLarge` / `err`) | Browser / Client | — | Island-only helper; Phase 13 wires it |
| Error map (`ZH_ERRORS` / `localizeError`) | Browser / Client | — | Already exists; `err()` wraps it |
| Catalog categories (`copy.categories[ToolCategory]`) | Frontend Server | — | ZH home / tools index already index by `g.category` |
| LangSwitch mount / ZH tree / ToolIsland locale | — | — | Out of scope (Phases 12–13) |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | `^7.0.2` (`package.json`) | `src/i18n/*.ts` | Already the language of i18n modules |
| Vitest | `5.0.0` installed (`npm ls vitest`) | Colocated unit tests | `npm test` → `vitest run`; `include: ['src/**/*.test.ts']` |
| Preact | `^10.29.8` | Islands later consume `useToolUi` | Do not add hooks inside `useToolUi` this phase |
| Astro | `^7.3.2` | SSG pages will import path helpers in Phase 12 | `trailingSlash: 'always'` already set |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@astrojs/sitemap` | `^3.7.4` | `i18n.locales.zh = 'zh-Hans'` | Do not change this phase; `LOCALE_META.zh.hreflang` must stay `zh-Hans` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled `path.ts` | Astro `i18n.routing` | Locked out. Project uses duplicated `src/pages/zh/` trees, not `i18n.routing`. Enabling it would prefix/redirect routes this milestone must not rewrite. |
| Hand-rolled `ui.ts` | `i18next` / `astro-i18next` | New package forbidden. Existing `t(locale)` dictionary is the contract. |
| `useToolUi` as a real Preact hook | `preact/hooks` `useMemo` | Would require jsdom / `.test.tsx`. Locked tests run in Node. Keep it a pure function named `useToolUi`. |

**Installation:** none — no new packages.

**Version verification:** `vitest@5.0.0` (`npm ls vitest`, 2026-09-20). No registry installs this phase.

## Package Legitimacy Audit

> No external packages are installed in this phase.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| — | — | — | — | — | — | N/A |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```text
                    Astro.url.pathname (404 only this phase)
                                |
                                v
                     localeFromPathname()
                                |
                                v
                         Locale 'en' | 'zh'
                                |
          +---------------------+---------------------+
          |                     |                     |
          v                     v                     v
   localizedPath()      switchLocalePath()           t(locale)
   EN: /tools/          strip /zh then prefix     ui.en / ui.zh
   ZH: /zh/tools/       target locale              |
          |                     |                     |
          |                     |         +-----------+-----------+
          |                     |         |                       |
          v                     v         v                       v
   (Phase 12 pages)     (Phase 12 LangSwitch)   copy.tooLarge    tools[slug]
                                                     |
                                                     v
                                              useToolUi(locale)
                                              { copy, tooLarge, err }
                                                     |
                                                     v
                                              err() -> localizeError
                                              '' / null -> null
                                              zh -> ZH_ERRORS[msg] ?? msg
                                                     |
                                                     v
                                              (Phase 13 islands)
```

File mapping is in Component Responsibilities below, not in this diagram.

### Recommended Project Structure

```
src/i18n/
├── locales.ts          # NEW — LOCALES, Locale, LOCALE_META
├── locales.test.ts     # NEW
├── path.ts             # NEW — localizedPath, switchLocalePath, localeFromPathname
├── path.test.ts        # NEW
├── useToolUi.ts        # NEW — { copy, tooLarge, err }
├── useToolUi.test.ts   # NEW
├── ui.ts               # EDIT — import+re-export Locale; chrome keys; original-ten tools; categories
├── errors.ts           # KEEP — localizeError / ZH_ERRORS (optional: Locale import from ./locales)
└── errors.test.ts      # KEEP — must stay green
```

Do not add `src/i18n/index.ts`.

### Pattern 1: Locale sourced from LOCALES, re-exported by ui.ts

**What:** Single source of `Locale` in `locales.ts`; `ui.ts` re-exports the type so committed `Header.astro` / `NavMenu.astro` / later-eight islands keep compiling.
**When to use:** Always — locked.

```ts
// src/i18n/locales.ts
// Source: locked 11-CONTEXT.md; pattern from CONVENTIONS.md
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

```ts
// src/i18n/ui.ts — replace the inline union
// [VERIFIED: src/i18n/ui.ts:190] currently: export type Locale = 'en' | 'zh';
import type { Locale } from './locales';
export type { Locale };
```

`locales.ts` must not import `ui.ts`. `ui.ts` may import the type only.

### Pattern 2: Pure path helpers (no `window`)

**What:** String in, string out. Discretion locked-in: no `window`, no `Astro`.
**When to use:** Every helper in `path.ts`.

```ts
// src/i18n/path.ts
// Source: locked 11-CONTEXT.md
import type { Locale } from './locales';

export function localizedPath(locale: Locale, path: string): string { /* ... */ }
export function switchLocalePath(pathname: string, target: Locale): string { /* ... */ }
export function localeFromPathname(pathname: string): Locale { /* ... */ }
```

Import `Locale` from `./locales`, never from `./ui`.

### Pattern 3: useToolUi is a named helper, not a Preact hook

**What:** Returns `{ copy, tooLarge, err }` for dirty JsonFormatter. No `useState` / `useMemo`.
**When to use:** Module + tests this phase only.

```ts
// src/i18n/useToolUi.ts
// Source: dirty src/components/tools/JsonFormatter.tsx:10
// [VERIFIED: src/components/tools/JsonFormatter.tsx:10]
// const { copy, tooLarge, err } = useToolUi(locale);
import { t, type Locale } from './ui';
import { localizeError } from './errors';

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

`err` must coerce `''` to `null` **before** `localizeError`. See Pitfall 2.

### Anti-Patterns to Avoid

- **Barrel `src/i18n/index.ts`:** CONVENTIONS forbid barrels. Dirty files import concrete paths.
- **`locales.ts` importing `ui.ts`:** circular import; Header would break.
- **`useToolUi` calling `useState`:** Node Vitest cannot render Preact; `include` is `*.test.ts` only.
- **Throwing on bad paths / illegal locale:** locked — treat as `'en'`, normalize slashes.
- **Committing LED `ToolShell` or adding `chromeLocal` / `tool-panel__chrome`:** hard fence.
- **Popping `stash@{0}` / `stash@{1}`:** hard fence. Stash@{1} is unrelated i18n; stash@{0} is overlay Header.
- **Enabling Astro `i18n.routing`:** would fight the duplicated `src/pages/zh/` tree.
- **Changing `SITE_ORIGIN` or catalog slugs:** completeness tests (`tools.test.ts`, `ToolIsland.test.ts`) must stay green.

## Component Responsibilities (kernel only)

| Component | File | This phase |
|-----------|------|------------|
| Locale registry | `src/i18n/locales.ts` | CREATE |
| Path helpers | `src/i18n/path.ts` | CREATE |
| Island UI helper | `src/i18n/useToolUi.ts` | CREATE |
| Chrome + tool labels | `src/i18n/ui.ts` | EDIT |
| Error map | `src/i18n/errors.ts` | KEEP (optional `Locale` import from `./locales` only) |
| Dirty consumers | LangSwitch, Footer, zh pages, original-ten islands | DO NOT WIRE / DO NOT COMMIT extras |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale union | `export type Locale = 'en' \| 'zh'` in `ui.ts` | `typeof LOCALES[number]` in `locales.ts` | Locked; Header still imports from `ui` via re-export |
| i18n router | Astro `i18n.routing` / middleware | Duplicated `src/pages/zh/` + `path.ts` | Already the architecture; Phase 12 commits the tree |
| Translation framework | i18next, fluent | `ui` const + `t(locale)` | No new packages; dirty pages already call `t` |
| Error i18n | Per-island ZH strings | `localizeError` + `ZH_ERRORS` | Already shipped; `err()` wraps it |
| Path joining | `new URL()` with `window.location` | Pure string normalize | Tests run in Node; no `window` |

**Key insight:** The dirty working tree is the contract. New modules must satisfy existing import specifiers, then stop. Wiring is later phases.

## Common Pitfalls

### Pitfall 1: Circular imports (locales ↔ ui)

**What goes wrong:** `locales.ts` imports `ui.ts` (or `useToolUi` / `path` import `ui` which imports `path`). Bundler/TS cycle; `Locale` becomes `any` or Header fails.
**Why it happens:** Temptation to put `t()` next to `LOCALES`.
**How to avoid:** One-way graph:

```
locales.ts  (leaf)
    ^
    | type only
path.ts     errors.ts (optional Locale from locales)
    ^           ^
    |           |
  ui.ts ------> (re-exports Locale; does not import path/errors/useToolUi)
    ^
    |
useToolUi.ts  (imports ui + errors)
```

**Warning signs:** `ui.ts` importing `./path` or `./useToolUi`; `locales.ts` importing anything in `src/i18n/`.

Committed Header still does:

```
import type { Locale } from '../i18n/ui';
```

[VERIFIED: src/components/Header.astro:5]

WordCounter still does:

```
import { t, type Locale } from '../../i18n/ui';
```

[VERIFIED: src/components/tools/WordCounter.tsx:5]

Keep `export type { Locale }` on `ui.ts`. Do not move Header/WordCounter this phase.

Dirty original-ten islands already import `from '../../i18n/locales'` — creating `locales.ts` satisfies them without editing islands.

### Pitfall 2: `err('')` vs `localizeError`

**What goes wrong:** `err('')` returns `''` instead of `null`; ToolShell renders an empty `role="alert"`.
**Why it happens:** [VERIFIED: src/i18n/errors.ts:14-17]

```
export function localizeError(locale: 'en' | 'zh', error: string | null): string | null {
  if (!error) return error;
  if (locale !== 'zh') return error;
  return ZH_ERRORS[error] ?? error;
}
```

`!''` is true, so `localizeError(locale, '')` returns `''` (the same empty string), not `null`.
Locked: `err('')` / `err(null)` → `null`.
**How to avoid:** In `useToolUi`, `if (!error) return null;` then `return localizeError(locale, error)`.
Dirty JsonFormatter already does `err(r.error || null)` ([VERIFIED: src/components/tools/JsonFormatter.tsx:17]), which also maps `''` → `null` at the call site. The helper must still honor the locked contract.

**Warning signs:** `err` implemented as `(e) => localizeError(locale, e)` with no empty check.

### Pitfall 3: `tooLarge` string must byte-match `ZH_ERRORS` / `INPUT_TOO_LARGE_MSG`

**What goes wrong:** ZH size errors stay English because the map key misses a period or wording.
**Why it happens:** Lookup is exact `Record` key.
[VERIFIED: src/lib/limits.ts:2-3]

```
export const INPUT_TOO_LARGE_MSG =
  'Input too large to process in the browser.';
```

[VERIFIED: src/i18n/errors.ts:7]

```
  'Input too large to process in the browser.': '输入过长，无法在浏览器中处理。',
```

**How to avoid:** `ui.en.tooLarge` **is** `'Input too large to process in the browser.'` (same characters, including the period). `ui.zh.tooLarge` can be the Chinese sentence; `tooLarge` from `useToolUi` is `copy.tooLarge`, so ZH islands get Chinese without going through `ZH_ERRORS`. Tests: `ui.en.tooLarge === INPUT_TOO_LARGE_MSG`.

### Pitfall 4: Protocol-relative open redirect in `switchLocalePath`

**What goes wrong:** `pathname` like `//evil.example` or `https://evil.example/x` becomes `href="//evil.example/"` on LangSwitch (Phase 12).
**Why it happens:** Naive "ensure leading `/`" turns `//evil` into `//evil/` or `///evil/`, which browsers treat as scheme-relative.
**How to avoid:** After taking the path, strip any `scheme:`, collapse leading slashes to exactly one `/`, force trailing `/`, never return a string that starts with `//`. Illegal locale → `'en'`. Do not throw.
**Warning signs:** Test `switchLocalePath('//evil.com', 'en')` returning anything starting with `//`.

### Pitfall 5: `/zh` prefix false positives

**What goes wrong:** `/zhfoo/` classified as `zh`.
**Why it happens:** `startsWith('/zh')` without the trailing `/` or exact-match rule.
**How to avoid:** Locked rule only: starts with `/zh/` **or** is exactly `/zh`. `/zhfoo/` → `'en'`. Case-sensitive (`/ZH/` → `'en'`).

### Pitfall 6: Staging LED ToolShell / crontab while typechecking dirty tree

**What goes wrong:** Executor runs `git add -A` because dirty islands import `locales` and dirty ToolShell imports `copy.chromeLocal`.
**How to avoid:** Path-limited add of the seven i18n files only. Do **not** add `chromeLocal` / `output` keys (LED-only). Do **not** commit `src/lib/crontab.ts` even though it already `import type { Locale } from '../i18n/locales'`. Creating `locales.ts` makes that dirty file typecheck; still leave it unstaged.

### Pitfall 7: Original-ten `tools[slug]` missing `name` breaks RelatedTools

**What goes wrong:** Phase 12 RelatedTools does `copy.tools[tool.slug].name`. Missing slug → TS / runtime throw.
**How to avoid:** Fill all ten slugs with at least `name` (and island label keys listed below) on both `en` and `zh`.

## Exact files to create / edit

| Path | Action | Requirement |
|------|--------|-------------|
| `src/i18n/locales.ts` | CREATE | KERN-01 |
| `src/i18n/locales.test.ts` | CREATE | KERN-01 |
| `src/i18n/path.ts` | CREATE | KERN-02 |
| `src/i18n/path.test.ts` | CREATE | KERN-02 |
| `src/i18n/useToolUi.ts` | CREATE | KERN-03 |
| `src/i18n/useToolUi.test.ts` | CREATE | KERN-03 |
| `src/i18n/ui.ts` | EDIT | KERN-04 |
| `src/i18n/errors.ts` | OPTIONAL small type import | not required if `localizeError` stays `'en' \| 'zh'` |

**Do not create:** `src/i18n/index.ts`.
**Do not edit this phase:** `Header.astro`, `LangSwitch.astro`, `Footer.astro`, `ToolShell.tsx`, `ToolIsland.astro`, `src/pages/zh/**`, original-ten `.tsx`, `src/data/tools.ts`, `src/lib/crontab.ts`.

**Git add allowlist:** the CREATE/EDIT rows above only.

## Exact `ui.ts` keys dirty consumers already read

Planner must add every key below on **both** `ui.en` and `ui.zh` (except nested `nav.*` which already exist). Values are discretion except `tooLarge` EN (locked byte-match) and `categories` keys (must be catalog `ToolCategory` strings).

### Top-level chrome (locked + dirty pages)

| Key | Read by (dirty unless noted) |
|-----|------------------------------|
| `langSwitch` | `LangSwitch.astro` (`aria-label={copy.langSwitch}`) |
| `navPrivacy` | `Footer.astro` |
| `navTerms` | `Footer.astro` |
| `navAbout` | `Footer.astro` |
| `footerRuns` | `Footer.astro` |
| `homeLede` | `src/pages/zh/index.astro` |
| `homeKicker` | `src/pages/zh/index.astro` |
| `homeFeatured` | `src/pages/zh/index.astro` |
| `homeViewAll` | `src/pages/zh/index.astro` |
| `categories` | `zh/index.astro`, `zh/tools/index.astro` — `copy.categories[g.category]` |
| `notFoundTitle` | `src/pages/404.astro` |
| `notFoundDescription` | `404.astro` |
| `notFoundBody` | `404.astro` |
| `notFoundCta` | `404.astro` |
| `localNote` | `src/pages/tools/[slug].astro`, `src/pages/zh/tools/[slug].astro` |
| `howTo` | same `[slug].astro` pair |
| `faq` | same `[slug].astro` pair |
| `related` | `RelatedTools.astro` |
| `copy` | dirty `ToolShell` (Phase 13 will use on HEAD ToolShell) |
| `copied` | dirty `ToolShell` |
| `tooLarge` | `useToolUi` → islands |

### Nested (already present — keep)

[VERIFIED: src/i18n/ui.ts:90-93 and 182-185]

```
    nav: {
      menu: 'Open menu',
      close: 'Close menu',
    },
```

ZH: `menu: '打开菜单'`, `close: '关闭菜单'`.
Committed `NavMenu.astro` reads `copy.nav.menu` / `copy.nav.close` ([VERIFIED: src/components/NavMenu.astro:15-17]).

### KERN-04 nav Tools / Blog / About (Header still hardcoded; add keys now)

| Key | Notes |
|-----|-------|
| `navTools` | Phase 12 Header will replace literal `Tools` |
| `navBlog` | Phase 12 Header will replace literal `Blog` |
| `navAbout` | Already required by Footer; reuse for Header |

### Dirty pages also import these — add this phase so Phase 12 can land without rewriting callers

| Key | Read by |
|-----|---------|
| `toolsIndexTitle` | `src/pages/zh/tools/index.astro` |
| `toolsIndexDescription` | same |
| `toolsIndexIntro` | same |
| `aboutTitle` | `about.astro`, `zh/about.astro` |
| `aboutDescription` | same (via `fill`) |
| `aboutBody` | same (via `fill`) |
| `privacyTitle` | `privacy.astro`, `zh/privacy.astro` |
| `privacyDescription` | same (via `fill`) |
| `privacy` | `string[]` mapped to `<p>` |
| `termsTitle` | `terms.astro`, `zh/terms.astro` |
| `termsDescription` | same (via `fill`) |
| `termsBody` | same (via `fill`) |
| `blogTitle` | `blog/index.astro`, `zh/blog/index.astro` |
| `blogDescription` | same |
| `blogEmpty` | same |

`fill` is imported from `../i18n/ui` in dirty about/privacy/terms. Add:

```ts
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '');
}
```

Placeholder syntax `{name}` / `{email}` is [ASSUMED] — match whatever strings you put in `aboutBody` / `privacyDescription` / `termsBody`. Tests: `fill('Hi {name}', { name: 'Devtoolbox' }) === 'Hi Devtoolbox'`.

### Do NOT add (LED-only dirty ToolShell)

`chromeLocal`, `output`, `tool-panel__chrome`. Hard fence.

## Original ten tool slugs that need `tools[slug]` labels

Catalog slugs 1–10 in `TOOLS` ([VERIFIED: src/data/tools.ts:21-98] — quote slugs verbatim):

| slug | EN `name` (from catalog `name`) | Island label keys already read by dirty `.tsx` |
|------|----------------------------------|-----------------------------------------------|
| `json-formatter` | JSON Formatter / Validator | `json` |
| `jwt-decoder` | JWT Decoder | `jwt`, `header`, `payload`, `note` |
| `base64` | Base64 Encode / Decode | `mode`, `encode`, `decode`, `text`, `base64` |
| `url-encode` | URL Encode / Decode | `mode`, `encode`, `decode`, `text`, `encoded` |
| `hash-generator` | Hash Generator | `algorithm`, `text` |
| `uuid-generator` | UUID Generator | `generate` |
| `regex-tester` | Regex Tester | `pattern`, `flags`, `testString`, `groups` |
| `unix-timestamp` | Unix Timestamp Converter | `mode`, `unixToIso`, `isoToUnix`, `unit`, `seconds`, `milliseconds`, `unixLabel`, `isoLabel`, `iso`, `secondsOut`, `millisecondsOut` |
| `crontab-explainer` | Crontab Explainer | `fieldLabel` |
| `color-converter` | Hex / RGB / HSL Converter | `hex`, `rgb`, `hsl` |

Every slug also needs `name` (RelatedTools) and `shortDescription` (parity with later eight). Keep later-eight blocks already in `ui.ts` (`word-counter` … `qr-code`) unchanged.

ZH `name` sources (content titles, for copy discretion):

| slug | ZH title from `src/content/tools/zh/{slug}.md` |
|------|-----------------------------------------------|
| `json-formatter` | JSON 格式化 / 校验 |
| `jwt-decoder` | JWT 解码 |
| `base64` | Base64 编码 / 解码 |
| `url-encode` | URL 编码 / 解码 |
| `hash-generator` | 哈希生成 |
| `uuid-generator` | UUID 生成 |
| `regex-tester` | 正则测试 |
| `unix-timestamp` | Unix 时间戳转换 |
| `crontab-explainer` | Crontab 说明 |
| `color-converter` | Hex / RGB / HSL 转换 |

Access styles already in dirty islands: `copy.tools['json-formatter']` (bracket) and `copy.tools.base64` (dot). Both work if keys are quoted where they contain `-`.

## Catalog category names for `copy.categories`

[VERIFIED: src/data/tools.ts:1-8]

```
export type ToolCategory =
  | 'Format'
  | 'Auth'
  | 'Encode'
  | 'Generate'
  | 'Text'
  | 'Time'
  | 'Color';
```

`copy.categories` **must** be keyed by these seven strings (PascalCase, English identifiers). ZH home does `copy.categories[g.category]` where `g.category` is `ToolCategory`.

Recommended values (EN identity; ZH discretion):

| Key | EN | ZH (recommend) |
|-----|----|----------------|
| `Format` | Format | 格式 |
| `Auth` | Auth | 鉴权 |
| `Encode` | Encode | 编码 |
| `Generate` | Generate | 生成 |
| `Text` | Text | 文本 |
| `Time` | Time | 时间 |
| `Color` | Color | 颜色 |

Do not lowercase keys (`format` would miss `Format`).

## How `localizeError` + `ZH_ERRORS` interact with `err()`

```
island --(English lib error or '')--> err(error)
                                         |
                         empty or null? --yes--> null  (no ToolShell alert)
                                         |
                                        no
                                         v
                               localizeError(locale, error)
                                         |
                         locale !== 'zh'? --yes--> return English unchanged
                                         |
                                        zh
                                         v
                               ZH_ERRORS[error] ?? error
```

Current `ZH_ERRORS` keys ([VERIFIED: src/i18n/errors.ts:1-12]): lorem/password/sql/qr/size only. Original-ten English errors (`Invalid JSON`, `Not a JWT`, `Invalid Base64`, `Invalid URL encoding`, `Invalid regular expression`, `Invalid timestamp`, `Invalid color`, crontab messages) are **not** in the map. `err('Invalid JSON')` on `zh` therefore returns `'Invalid JSON'` until Phase 13 adds keys. **Do not expand `ZH_ERRORS` this phase** unless a useToolUi test needs it — locked scope is module + tests, not island wiring.

`tooLarge` bypasses `err()`: islands pass `tooLarge` straight to ToolShell when `isTooLarge`. That is why `copy.tooLarge` must already be localized per locale.

## Suggested tracer-first slice vs expansion

**Tracer (plan 01, one wave):**

1. `locales.ts` + `locales.test.ts` — `LOCALES` order, `Locale` assignability, `LOCALE_META` fields.
2. `path.ts` + `path.test.ts` — table of path cases below; no `window`; never throw; no `//` prefix.
3. `ui.ts`: delete inline `Locale`; `import type { Locale } from './locales'; export type { Locale };` — Header/NavMenu/WordCounter still typecheck.

Success: `npx vitest run src/i18n/locales.test.ts src/i18n/path.test.ts src/i18n/errors.test.ts`.

**Expansion (same phase, plan 01 continued or plan 02):**

4. `ui.ts` chrome keys + `categories` + original-ten `tools[slug]` + `fill` + `tooLarge`.
5. `useToolUi.ts` + `useToolUi.test.ts`.
6. Re-run full `npm test` (must keep `src/data/tools.test.ts` and `ToolIsland.test.ts` green).

Do not start Phase 12 files in the tracer.

## Code Examples

### Path helper cases (must appear in `path.test.ts`)

Behaviors locked in CONTEXT.md (not yet in repo files):

| Call | Expected |
|------|----------|
| `localizedPath('en', '/tools/')` | `/tools/` |
| `localizedPath('zh', '/tools/')` | `/zh/tools/` |
| `localizedPath('en', '/')` | `/` |
| `localizedPath('zh', '/')` | `/zh/` |
| `localizedPath('en', 'tools')` | `/tools/` (leading `/` + trailing `/`) |
| `switchLocalePath('/zh/tools/json-formatter/', 'en')` | `/tools/json-formatter/` |
| `switchLocalePath('/tools/json-formatter/', 'zh')` | `/zh/tools/json-formatter/` |
| `switchLocalePath('/zh/tools/json-formatter/', 'zh')` | `/zh/tools/json-formatter/` |
| `localeFromPathname('/zh/')` | `'zh'` |
| `localeFromPathname('/zh')` | `'zh'` |
| `localeFromPathname('/zh/tools/')` | `'zh'` |
| `localeFromPathname('/tools/')` | `'en'` |
| `localeFromPathname('/zhfoo/')` | `'en'` |
| `localeFromPathname('')` | `'en'` (normalize to `/`) |
| `localizedPath('fr' as never, '/tools/')` | `/tools/` (illegal locale → en, no throw) |
| `switchLocalePath('//evil.com', 'en')` | `/evil.com/` or `/` — never starts with `//` |

Home `localizedPath('zh', '/')` must not become `/zh//`.

### locales.test.ts pattern

Match [VERIFIED: src/i18n/errors.test.ts:1-3]:

```
import { describe, expect, it } from 'vitest';
```

```ts
import { LOCALES, LOCALE_META, type Locale } from './locales';

describe('LOCALES', () => {
  it('is en then zh', () => {
    expect(LOCALES).toEqual(['en', 'zh']);
  });
  it('exposes zh-Hans meta', () => {
    expect(LOCALE_META.zh).toEqual({
      hreflang: 'zh-Hans',
      htmlLang: 'zh-Hans',
      nativeLabel: '中文',
    });
  });
});

const _keep: Locale = 'en';
void _keep;
```

### useToolUi.test.ts

```ts
import { describe, expect, it } from 'vitest';
import { useToolUi } from './useToolUi';
import { INPUT_TOO_LARGE_MSG } from '../lib/limits';

describe('useToolUi', () => {
  it('returns copy, tooLarge, err', () => {
    const { copy, tooLarge, err } = useToolUi('en');
    expect(tooLarge).toBe(INPUT_TOO_LARGE_MSG);
    expect(copy.tooLarge).toBe(INPUT_TOO_LARGE_MSG);
    expect(err('')).toBeNull();
    expect(err(null)).toBeNull();
    expect(err('Invalid JSON')).toBe('Invalid JSON');
  });
  it('maps tooLarge via ZH_ERRORS when err() is used on zh', () => {
    const { err, tooLarge } = useToolUi('zh');
    expect(err(INPUT_TOO_LARGE_MSG)).toBe('输入过长，无法在浏览器中处理。');
    expect(typeof tooLarge).toBe('string');
  });
});
```

Do not import `preact/hooks`. Do not set `environment: 'jsdom'`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `export type Locale = 'en' \| 'zh'` in `ui.ts` | `typeof LOCALES[number]` in `locales.ts`, re-exported | Phase 11 | Header import path unchanged |
| No path helpers on HEAD | Pure `path.ts` | Phase 11 | Phase 12 can mount LangSwitch |
| Later-eight tools only in `ui.tools` | Original ten labels added | Phase 11 | RelatedTools + Phase 13 islands |
| Inline `localizeError` in some later-eight islands (`LoremIpsum.tsx`) | Shared `useToolUi` (islands still Phase 13) | Phase 11 module only | Original ten already call `useToolUi` in dirty tree |

**Deprecated/outdated:**

- Inline `Locale` union in `ui.ts`: replace, do not leave a second conflicting type.
- Astro built-in i18n routing: do not enable; this repo duplicates `src/pages/zh/`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `fill()` placeholders are `{name}` / `{email}` replaced by regex | Exact ui.ts keys | Dirty about/privacy/terms show literal `{name}` or fill no-ops |
| A2 | ZH category labels (格式/鉴权/…) are acceptable discretion | categories | User may want different ZH nouns; easy copy tweak |
| A3 | `navTools` / `navBlog` key names (Header still hardcoded) | KERN-04 nav | Phase 12 Header might expect `nav.tools` nested; locked said top-level keys |
| A4 | Do not add original-ten keys to `ZH_ERRORS` this phase | err() interaction | ZH original-ten errors stay English until Phase 13 |
| A5 | `localeFromPathname` is case-sensitive (`/ZH/` → en) | Path helpers | Unlikely URLs; document in tests |
| A6 | `useToolUi` must not call Preact hooks | Pattern 3 | If executor adds `useMemo`, Node tests fail |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

A3 is the only key-shape risk. Locked text: "Top-level keys on `ui.en` / `ui.zh` (`homeLede`, `langSwitch`, `navPrivacy`, …)". Use **top-level** `navTools` / `navBlog` / `navAbout`, not `nav.tools`. Nested `nav` stays `{ menu, close }` only.

## Open Questions (RESOLVED)

1. **`fill` helper API**
   - RESOLVED: implement `fill` as `{token}` replacement (`{name}` / `{email}`); write chrome strings that use those tokens; cover with one unit test (in `useToolUi.test.ts` or colocated `ui` assert). Planned in `11-01-PLAN.md` Task 2.

2. **Dirty-tree typecheck vs HEAD typecheck**
   - RESOLVED: kernel files must typecheck in isolation. Do not "fix" dirty ToolShell. Do not run `astro check` on the dirty tree this phase. Full `astro build` without overlay isolation is Phase 14.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vitest / Astro | ✓ | v22.22.2 | — |
| npm | `npm test` | ✓ | 11.9.0 | — |
| Vitest | KERN tests | ✓ | 5.0.0 | — |
| TypeScript | `src/i18n/*.ts` | ✓ | ^7.0.2 | — |
| Playwright | — | present on PATH (`/f/pyhton3/Scripts/playwright`) | — | **Do not use** — Nyquist is file rg + Vitest only |
| ctx7 CLI | Docs lookup | ✗ | — | Installed `astro` / `sitemap` `.d.ts` + in-repo config |

**Missing dependencies with no fallback:** none (kernel is code + Vitest).

**Missing dependencies with fallback:** Context7 MCP / ctx7 — used local `.d.ts` instead.

Step 2.6: no new runtime services. Skip Docker/Postgres.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 5.0.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/i18n/locales.test.ts src/i18n/path.test.ts src/i18n/useToolUi.test.ts src/i18n/errors.test.ts` |
| Full suite command | `npm test` (`vitest run`) |

[VERIFIED: vitest.config.ts:4-8]

```
    include: ['src/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
```

[VERIFIED: package.json:9] `"test": "vitest run"`

No Playwright. No `.tsx` tests (`include` is `*.test.ts` only). No new test runner.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| KERN-01 | `LOCALES` is `['en','zh']`; `LOCALE_META.zh.hreflang === 'zh-Hans'` | unit | `npx vitest run src/i18n/locales.test.ts -x` | ❌ Wave 0 |
| KERN-02 | `localizedPath` / `switchLocalePath` / `localeFromPathname` table | unit | `npx vitest run src/i18n/path.test.ts -x` | ❌ Wave 0 |
| KERN-03 | `useToolUi` returns `{copy,tooLarge,err}`; `err('')===null` | unit | `npx vitest run src/i18n/useToolUi.test.ts -x` | ❌ Wave 0 |
| KERN-04 | `ui.en`/`ui.zh` have chrome keys; `Locale` from locales; original-ten `tools[slug]`; `categories.Format` | unit | assert inside `useToolUi.test.ts` or `locales.test.ts` (read `ui`) | ❌ Wave 0 |
| KERN-04 | existing later-eight chrome tests still pass | unit | `npx vitest run src/i18n/errors.test.ts -x` | ✅ |
| ISLE-04 guard | catalog still 18; every slug has EN+ZH md + ToolIsland branch | unit | `npx vitest run src/data/tools.test.ts src/components/tools/ToolIsland.test.ts -x` | ✅ — do not touch those files |

### Sampling Rate

- **Per task commit:** `npx vitest run src/i18n/locales.test.ts src/i18n/path.test.ts src/i18n/useToolUi.test.ts src/i18n/errors.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/i18n/locales.test.ts` — covers KERN-01
- [ ] `src/i18n/path.test.ts` — covers KERN-02
- [ ] `src/i18n/useToolUi.test.ts` — covers KERN-03 and KERN-04 key presence (`tooLarge`, `langSwitch`, `categories`, original-ten `name`)
- [ ] Framework install: none — Vitest already installed

None of these need Playwright or a browser.

### File-rg checks (Nyquist, no Playwright)

Planner should include a verification step that `rg`s:

- `export const LOCALES` in `src/i18n/locales.ts`
- `export function localizedPath` / `switchLocalePath` / `localeFromPathname` in `src/i18n/path.ts`
- `export function useToolUi` in `src/i18n/useToolUi.ts`
- `export type { Locale }` (or equivalent re-export) in `src/i18n/ui.ts`
- `homeLede` / `langSwitch` / `navPrivacy` / `tooLarge` / `'json-formatter'` in `src/i18n/ui.ts`
- Absence of `tool-panel__chrome` and `chromeLocal` in files **staged** this phase
- Staged file list ⊆ allowlist

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes | Normalize `pathname` in `path.ts`; never throw; collapse `//`; relative paths only |
| V6 Cryptography | no | — |

### Known Threat Patterns for this kernel

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Open redirect via LangSwitch `href={switchLocalePath(...)}` | Spoofing / Tampering | Helpers return root-relative paths starting with exactly one `/`; strip schemes; illegal locale → `en` |
| XSS via chrome copy | Tampering | Copy is compile-time string constants in `ui.ts`, not user input. Do not `innerHTML` (islands already avoid it). |
| Prototype pollution in `fill()` | Tampering | Replace only `{\w+}` from a `Record<string,string>`; do not assign onto objects by attacker keys |
| Path confusion `/zhfoo` as Chinese | Tampering | Exact `/zh` or prefix `/zh/` only |

No new endpoints. No secrets. `SITE_ORIGIN` unchanged.

## Sources

### Primary (HIGH confidence)

- `src/i18n/ui.ts`, `errors.ts`, `errors.test.ts` — current HEAD i18n
- Dirty consumers: `LangSwitch.astro`, `Footer.astro`, `RelatedTools.astro`, `src/pages/404.astro`, `src/pages/zh/index.astro`, original-ten islands, `JsonFormatter.tsx`
- `src/data/tools.ts` — `ToolCategory` and original-ten slugs
- `astro.config.mjs` — `trailingSlash: 'always'`; sitemap `zh: 'zh-Hans'`
- `vitest.config.ts`, `package.json` — test runner
- `node_modules/@astrojs/sitemap/dist/index.d.ts` — `i18n?: { defaultLocale; locales: Record<string,string> }`
- `node_modules/astro/dist/types/public/config.d.ts` — `trailingSlash?: 'always' | 'never' | 'ignore'`
- `.planning/phases/11-i18n-kernel/11-CONTEXT.md` — locked decisions
- `.planning/REQUIREMENTS.md` — KERN-01..04

### Secondary (MEDIUM confidence)

- Astro configuration reference (trailingSlash, i18n.routing.prefixDefaultLocale) via search snippets when docs.astro.build fetch was blocked
- Installed Preact `hooks/src/index.js` — hook state is only advanced inside `useState` et al.; a pure `useToolUi` is safe in Node

### Tertiary (LOW confidence)

- W3C / BCP 47 `zh-Hans` for `html lang` / `hreflang` (locked already by CONTEXT; not a decision to reopen)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — no new packages; versions from `package.json` / `npm ls`
- Architecture: HIGH — dirty import graph + locked CONTEXT
- Pitfalls: HIGH — circular imports, `localizeError('')`, `//` redirect, Header `Locale` from `ui.ts` all read from source this session

**Research date:** 2026-09-20
**Valid until:** 2026-10-20 (stable in-repo contract; not a fast-moving ecosystem)

## Hard fences for the planner (copy into PLAN.md)

- Do not commit LED `ToolShell` / `tool-panel__chrome`
- Do not commit `src/lib/crontab.ts`
- Do not pop `stash@{0}` or `stash@{1}`
- Path-limited `git add` only (i18n kernel files)
- No new catalog tools; no `SITE_ORIGIN` change
- Stay Astro + Preact; no Tailwind; no new npm packages
- Do not mount LangSwitch; do not commit ZH page tree; do not rewire ToolIsland (Phases 12–13)
