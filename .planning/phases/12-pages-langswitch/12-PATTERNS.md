# Phase 12: Pages + LangSwitch - Pattern Map

**Mapped:** 2026-09-20
**Files analyzed:** 22 (chrome + EN/ZH pages + content + config + optional test)
**Analogs found:** 21 / 22

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/Header.astro` | component | request-response | `src/components/Footer.astro` (locale + `localizedPath` + `t`) | role-match |
| `src/layouts/BaseLayout.astro` | component | request-response | HEAD `src/layouts/BaseLayout.astro` + RESEARCH Pattern 1 | exact (extend) |
| `src/components/LangSwitch.astro` | component | request-response | uncommitted `src/components/LangSwitch.astro` (commit as written) | exact |
| `src/components/ToolCard.astro` | component | request-response | `src/components/RelatedTools.astro` | role-match |
| `src/components/Footer.astro` | component | request-response | dirty `src/components/Footer.astro` | exact |
| `src/components/RelatedTools.astro` | component | request-response | dirty `src/components/RelatedTools.astro` | exact |
| `src/styles/global.css` | config | transform | UI-SPEC token block + existing `#themeToggle` media query | exact |
| `src/pages/index.astro` | route | request-response | `src/pages/zh/index.astro` (locale pass only on EN) | role-match |
| `src/pages/tools/index.astro` | route | request-response | `src/pages/zh/index.astro` / EN about locale pass | role-match |
| `src/pages/tools/[slug].astro` | route | request-response | dirty file; analog structure `src/pages/zh/tools/[slug].astro` | exact |
| `src/pages/zh/index.astro` | route | request-response | untracked file (commit) | exact |
| `src/pages/zh/tools/index.astro` | route | request-response | `src/pages/zh/index.astro` | role-match |
| `src/pages/zh/tools/[slug].astro` | route | request-response | EN dirty `[slug].astro` minus `heading=` | exact |
| `src/pages/zh/about.astro` | route | request-response | `src/pages/about.astro` | exact |
| `src/pages/zh/blog/index.astro` | route | request-response | `src/pages/about.astro` locale + `t()` | role-match |
| `src/pages/zh/privacy.astro` | route | request-response | `src/pages/about.astro` | role-match |
| `src/pages/zh/terms.astro` | route | request-response | `src/pages/about.astro` | role-match |
| `src/pages/about.astro` / `blog/index.astro` / `privacy.astro` / `terms.astro` | route | request-response | dirty `src/pages/about.astro` | exact |
| `src/pages/404.astro` | route | request-response | dirty `src/pages/404.astro` | exact |
| `src/content.config.ts` | config | transform | dirty schema `locale: z.enum(['en', 'zh'])` | exact |
| `src/content/tools/*.md` (original ten) | config | file-I/O | `src/content/tools/json-formatter.md` (`locale: en`) | exact |
| `astro.config.mjs` | config | transform | dirty sitemap `i18n` block | exact |
| `src/i18n/pages-land.test.ts` (optional) | test | file-I/O | `src/components/tools/ToolIsland.test.ts` | exact |

Do **not** classify / analog: `ToolShell.tsx`, `src/lib/crontab.ts`, `src/components/tools/**` islands, `FaqList.astro` (items-only, no edit).

## Pattern Assignments

### `src/components/Header.astro` (component, request-response)

**Analog (locale wiring):** `src/components/Footer.astro` lines 1–19
**Analog (mount order / required locale):** `12-UI-SPEC.md` Header markup (do not pop `stash@{0}`)

**Imports + required locale** (copy Footer’s i18n imports; Locale from `locales.ts` not `ui.ts`):

```astro
import { SITE_NAME } from '../data/site';
import ThemeToggle from './ThemeToggle.astro';
import NavMenu from './NavMenu.astro';
import LangSwitch from './LangSwitch.astro';
import type { Locale } from '../i18n/locales';
import { localizedPath } from '../i18n/path';
import { t } from '../i18n/ui';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const copy = t(locale);
```

**Core chrome** — drop `locale?:` and `?? 'en'`; logo/nav via `localizedPath`; LangSwitch **before** ThemeToggle, **outside** `#navMenu`:

```astro
<a class="logo" href={localizedPath(locale, '/')}>{SITE_NAME}</a>
<NavMenu locale={locale} />
<div class="nav-links" id="navMenu">
  <a href={localizedPath(locale, '/tools/')}>{copy.navTools}</a>
  <a href={localizedPath(locale, '/blog/')}>{copy.navBlog}</a>
  <a href={localizedPath(locale, '/about/')}>{copy.navAbout}</a>
</div>
<LangSwitch locale={locale} />
<ThemeToggle />
```

HEAD Header still hardcodes `/tools/` labels (`src/components/Header.astro` lines 15–22) — replace that block, keep `<NavMenu locale={locale} />`.

---

### `src/layouts/BaseLayout.astro` (component, request-response)

**Analog:** HEAD `src/layouts/BaseLayout.astro` lines 1–35 plus RESEARCH Pattern 1 (canonical via `switchLocalePath`)

**Keep:** `ThemeInit`, `fullTitle`, `SITE_ORIGIN` unchanged, `<main class="wrap"><slot /></main>`.

**Add required locale + unique canonical** (`path` is unprefixed logical route on ZH pages — Pitfall 1):

```astro
import type { Locale } from '../i18n/locales';
import { LOCALE_META } from '../i18n/locales';
import { switchLocalePath } from '../i18n/path';

interface Props {
  title: string;
  description: string;
  path: string;
  locale: Locale;
}

const { title, description, path, locale } = Astro.props;
const canonical = new URL(switchLocalePath(path, locale), SITE_ORIGIN).href;
```

**html lang + hreflang trio** (UI-SPEC; `x-default` → EN):

```astro
<html lang={LOCALE_META[locale].htmlLang}>
  <head>
    ...
    <link rel="canonical" href={canonical} />
    <link rel="alternate" hreflang={LOCALE_META.en.hreflang} href={new URL(switchLocalePath(path, 'en'), SITE_ORIGIN).href} />
    <link rel="alternate" hreflang={LOCALE_META.zh.hreflang} href={new URL(switchLocalePath(path, 'zh'), SITE_ORIGIN).href} />
    <link rel="alternate" hreflang="x-default" href={new URL(switchLocalePath(path, 'en'), SITE_ORIGIN).href} />
  </head>
  <body>
    <Header locale={locale} />
    ...
    <Footer locale={locale} />
```

Do **not** use `new URL(path, SITE_ORIGIN)` on ZH — unprefixed `path="/"` would collide with EN canonical.

---

### `src/components/LangSwitch.astro` (component, request-response)

**Analog:** existing uncommitted file lines 1–26 — commit as written. Do not restyle inline.

```astro
<nav class="lang-switch" aria-label={copy.langSwitch}>
  {LOCALES.map((loc) => (
    <a
      href={switchLocalePath(pathname, loc)}
      hreflang={LOCALE_META[loc].hreflang}
      lang={LOCALE_META[loc].htmlLang}
      aria-current={loc === locale ? 'page' : undefined}
    >
      {LOCALE_META[loc].nativeLabel}
    </a>
  ))}
</nav>
```

`pathname = Astro.url.pathname`. Required `locale: Locale`.

---

### `src/components/ToolCard.astro` (component, request-response)

**Analog:** `src/components/RelatedTools.astro` lines 1–22 (`locale` + `localizedPath` + `copy.tools[slug].name`)

HEAD ToolCard hardcodes `/tools/${tool.slug}/` and English `tool.name` (lines 4–13). ZH home already passes `locale={locale}` (`src/pages/zh/index.astro` line 34).

```astro
import type { Tool } from '../data/tools';
import type { Locale } from '../i18n/locales';
import { localizedPath } from '../i18n/path';
import { t } from '../i18n/ui';

interface Props {
  tool: Tool;
  locale?: Locale;
}

const { tool, locale = 'en' } = Astro.props;
const copy = t(locale);
const labels = copy.tools[tool.slug as keyof typeof copy.tools];
---
<a class="tool-card" href={localizedPath(locale, `/tools/${tool.slug}/`)}>
  <strong>{labels.name}</strong>
  <p>{labels.shortDescription}</p>
</a>
```

Default `'en'` keeps EN home/tools index working before they pass locale.

---

### `src/components/Footer.astro` / `RelatedTools.astro`

**Analog:** themselves (dirty, already locale-wired). Commit; do not rewrite.

Footer: required `locale`, `localizedPath` for privacy/terms/about, `copy.nav*` / `copy.footerRuns` (lines 7–22).

RelatedTools: `slug` + `locale`, `copy.related`, href `localizedPath(locale, `/tools/${tool.slug}/`)` (lines 7–22).

---

### `src/pages/zh/index.astro` and remaining `src/pages/zh/**`

**Analog:** untracked ZH home (`src/pages/zh/index.astro` lines 1–36)

Pattern: `const locale = 'zh' as const`; `copy = t(locale)`; `path` **unprefixed** (`path="/"` not `path="/zh/"`); `locale={locale}` on BaseLayout; `localizedPath` for in-page links; `ToolCard` gets `locale`.

ZH `[slug].astro` mirrors EN dirty slug (getStaticPaths from `TOOLS`, `getCollection` filter `p.data.locale === locale`, throw `Unknown tool` / `Missing zh content`). **Strip** `heading={copy.faq}` on FaqList (both EN and ZH slug pages). Do not edit `FaqList.astro`.

**FaqList analog (do not change):** `src/components/FaqList.astro` lines 2–8 — `items` only, English `<h2>FAQ</h2>`.

---

### EN pages locale pass

**Analog for chrome copy + locale:** `src/pages/about.astro` lines 6–13

```astro
const locale = 'en' as const;
...
<BaseLayout ... path="/about/" locale={locale}>
```

**EN home / tools index (HEAD, missing locale):** add `const locale = 'en' as const` and `locale={locale}` on BaseLayout. PAGE-04 does **not** require rewriting EN home body to `copy.homeLede` this phase.

**404 analog:** dirty `src/pages/404.astro` lines 3–19 — `localeFromPathname(Astro.url.pathname)`, `copy.notFound*`, CTA `localizedPath(locale, '/tools/')`. Commit as written. Single static `404.html` (Pitfall 6).

---

### `src/styles/global.css` (config, transform)

**Analog:** existing `#themeToggle` block lines 152–156; **copy UI-SPEC CSS verbatim**.

Replace mobile ThemeToggle `margin-left: auto` with `0`. Append `.lang-switch` flex / gap `var(--sp-2)` / idle 16px 400 / current 600 / hover `--accent` / mobile `.lang-switch { margin-left: auto }`. Selector prefix `.lang-switch` only. No 44px targets, no stash overlay CSS.

---

### `astro.config.mjs`

**Analog:** dirty file lines 8–18 — commit sitemap i18n; do **not** enable Astro `i18n.routing`.

```javascript
sitemap({
  i18n: {
    defaultLocale: 'en',
    locales: {
      en: 'en',
      zh: 'zh-Hans',
    },
  },
}),
```

---

### `src/content.config.ts` + original-ten markdown

**Analog:** dirty `content.config.ts` lines 13–16 (`locale: z.enum(['en', 'zh'])`); frontmatter analog `src/content/tools/json-formatter.md` lines 1–3 (`locale: en`). ZH files under `zh/` already have `locale: zh`. Commit original-ten EN `.md` together with schema.

---

### Optional `src/i18n/pages-land.test.ts` (test, file-I/O)

**Analog:** `src/components/tools/ToolIsland.test.ts` lines 1–17

```typescript
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const header = readFileSync(new URL('../components/Header.astro', import.meta.url), 'utf8');
// expect(header.includes('LangSwitch')).toBe(true);
// slug pages must not include 'heading='
```

Keep `ToolIsland.test.ts` green; do not change island mapping this phase.

## Shared Patterns

### Locale type and meta
**Source:** `src/i18n/locales.ts` lines 1–10
**Apply to:** Header, BaseLayout, LangSwitch, ToolCard, Footer, RelatedTools, all pages
Import `Locale` / `LOCALE_META` / `LOCALES` from `../i18n/locales` (not `ui.ts`). `htmlLang` / `hreflang`: `en` and `zh-Hans`. Native labels: `English` / `中文`.

### Path helpers (do not rewrite)
**Source:** `src/i18n/path.ts` lines 20–44
**Apply to:** Header nav, ToolCard hrefs, Footer, RelatedTools, LangSwitch, BaseLayout canonical/hreflang
- `localizedPath(locale, unprefixedPath)` — EN unprefixed, ZH `/zh/` + trailing slash
- `switchLocalePath(pathname, target)` — LangSwitch hrefs and canonical uniqueness
- Never pass already-prefixed `/zh/...` into `localizedPath` (double prefix)
- Never throw; illegal locale → en; collapse `//`

### Chrome copy
**Source:** `src/i18n/ui.ts` via `t(locale)`
**Apply to:** Header nav, Footer, 404, ZH pages, RelatedTools
Do not invent strings. FaqList heading stays English `FAQ`.

### Page locale constant
**Source:** `src/pages/about.astro` lines 6–13; ZH `src/pages/zh/index.astro` lines 9–14
**Apply to:** Every EN/ZH page
`const locale = 'en' as const` or `'zh' as const`; pass into BaseLayout. 404 uses `localeFromPathname` instead.

### Content collection lookup
**Source:** dirty `src/pages/tools/[slug].astro` lines 17–25
**Apply to:** EN + ZH slug pages
`getCollection('toolPages')` then `p.data.locale === locale && (p.id === slug || p.id.endsWith(`/${slug}`))`. Throw at build if missing.

### Error handling
**Source:** slug pages (`throw new Error(\`Unknown tool ${slug}\`)`); parsers stay Phase 13
**Apply to:** tool slug routes only. Layout/chrome do not throw on locale. Path helpers never throw.

### Validation / security
**Source:** `src/i18n/path.ts` `stripScheme` / `normalizePath`; LangSwitch uses pathname + `LOCALES` only
**Apply to:** LangSwitch hrefs. No query-string passthrough.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | LangSwitch CSS is specified verbatim in UI-SPEC (not an existing class). Treat UI-SPEC as the analog, not a missing file. |

Optional Wave 0 test file does not exist yet; analog is `ToolIsland.test.ts`.

## Metadata

**Analog search scope:** `src/components/`, `src/layouts/`, `src/pages/`, `src/pages/zh/`, `src/i18n/`, `src/content/`, `src/styles/global.css`, `astro.config.mjs`
**Files scanned:** ~20 tracked + dirty ZH/LangSwitch
**Pattern extraction date:** 2026-09-20
**Tracked-source gate:** analogs named above are git-tracked except untracked `LangSwitch.astro` / `src/pages/zh/**` which this phase commits (they are origin files, not `.gsd` mirrors).
