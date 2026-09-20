# Phase 12: Pages + LangSwitch - Research

**Researched:** 2026-09-20
**Domain:** Astro SSG bilingual pages, header LangSwitch, layout locale / hreflang / sitemap i18n
**Confidence:** HIGH (in-repo contracts, UI-SPEC, HEAD vs dirty tree); MEDIUM (sitemap i18n behavior from installed `@astrojs/sitemap@3.7.4` source)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Mount `LangSwitch.astro` immediately before `ThemeToggle` (logo → hamburger → Tools/Blog/About → LangSwitch → ThemeToggle)
- Do not pop `stash@{0}`; edit HEAD `Header.astro` only
- Logo `href` is `localizedPath(locale, '/')` so ZH stays on `/zh/`
- Tools/Blog/About use `copy.navTools` / `navBlog` / `navAbout` plus `localizedPath`
- Header `locale` is required (`locale: Locale`); BaseLayout always passes it (drop `?` and `?? 'en'`)
- Required `locale: Locale`; pass to Header and Footer
- `<html lang>` is `LOCALE_META[locale].htmlLang` (`en` / `zh-Hans`)
- Canonical stays `path` + `SITE_ORIGIN`; add EN/ZH `hreflang` alternates via `localizedPath` / `switchLocalePath`
- HEAD `FaqList` stays items-only with English `h2` FAQ (v1.1 lock). Strip `heading={copy.faq}` from ZH `[slug].astro` on land so the build does not fail
- Commit all seven ZH pages: home, tools, `[slug]`, about, blog, privacy, terms
- Strip `heading` from ZH tool pages when landing
- Every EN page (home, tools, `[slug]`, about, blog, privacy, terms, 404) passes `locale` to BaseLayout
- Add `locale: en` frontmatter to existing EN `src/content/tools/*.md` (schema already requires the field); ZH files already live under `zh/`
- Commit the existing dirty `astro.config.mjs` sitemap i18n block (`defaultLocale: en`, `zh: zh-Hans`)
- 404 keeps `localeFromPathname(Astro.url.pathname)` plus localized copy
- Add minimal `.lang-switch` rules in `global.css` (flex, gap `var(--sp-2)`, `aria-current` weight); do not pop overlay CSS from `stash@{0}`
- Do not commit LED ToolShell, `crontab.ts`, or original-ten island locale wiring; do not pop stashes

### Claude's Discretion
- Exact hreflang `<link rel="alternate">` markup as long as EN and ZH equivalents exist
- Exact `.lang-switch` spacing/typography beyond flex + `--sp-2` + current-page weight
- Whether logo on EN stays `/` (same as `localizedPath('en', '/')`)

### Deferred Ideas (OUT OF SCOPE)
- FaqList localized heading — v1.1 locked English `h2` FAQ; not this phase
- Original-ten island locale + no-LED ToolShell — Phase 13
- CI workflow + green build without isolation — Phase 14
- Three-state theme, theme animation, 4-col grid — v2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAGE-01 | Header mounts `LangSwitch.astro` (do not pop `stash@{0}` Header) | Edit HEAD `Header.astro` only. Import and place `<LangSwitch locale={locale} />` immediately before `<ThemeToggle />`, **outside** `#navMenu`. Commit existing `src/components/LangSwitch.astro` as written. |
| PAGE-02 | Header Tools/Blog/About links use `localizedPath` matching the page locale | Required `locale: Locale`. Logo `localizedPath(locale, '/')`. Nav labels `copy.navTools` / `navBlog` / `navAbout`. Keep `<NavMenu locale={locale} />`. |
| PAGE-03 | Commit `src/pages/zh/` (home, tools, `[slug]`, about, blog, privacy, terms) | Seven untracked routes already exist. Strip `heading={copy.faq}` on ZH (and EN) `[slug].astro`. Wire `ToolCard` to accept `locale` or ZH catalog cards stay on EN hrefs. |
| PAGE-04 | EN pages pass `locale` to `BaseLayout`; Footer / RelatedTools / 404 / content `locale` frontmatter / sitemap i18n align with locale | EN home + tools index still omit `locale` — add it. Commit dirty Footer, RelatedTools, 404, about/blog/privacy/terms/slug, `content.config.ts`, original-ten `locale: en` frontmatter, `astro.config.mjs` sitemap i18n. |
| PAGE-05 | `BaseLayout` sets `<html lang>` from locale and passes locale to Header / Footer | Required `locale: Locale`. `lang={LOCALE_META[locale].htmlLang}`. Hreflang trio in `<head>`. Canonical must be locale-unique (see Pitfall 1). |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Privacy / architecture: all tool computation in the browser (`src/lib`); no new API routes for tool logic
- Parity: new work must match existing tool quality (UI chrome, copy, EN+ZH, FAQ)
- Stack: stay on Astro + Preact + current catalog/content-collection pattern — no new app framework, no Tailwind, no new npm packages
- Do not rewrite the existing ten tools this phase (island locale is Phase 13)
- Trailing slashes required; English unprefixed; ZH under `/zh/`
- Named i18n files; no `src/i18n/index.ts` barrels
- GSD: path-limited git add; never `git add -A`
- Hard fences: do not commit LED `ToolShell` / `tool-panel__chrome`; do not commit `src/lib/crontab.ts`; do not pop `stash@{0}` or `stash@{1}`; no `SITE_ORIGIN` change; no new catalog tools
- UI-SPEC: copy `.lang-switch` CSS **verbatim**; strip FaqList `heading` on ZH slug pages; LangSwitch is text links only (no globe, flags, icons)

## Summary

Phase 12 lands bilingual **chrome and routes**, not islands. HEAD `Header.astro` and `BaseLayout.astro` still have no LangSwitch and no required `locale`. The ZH tree, `LangSwitch.astro`, locale-wired Footer / RelatedTools / 404, sitemap i18n, and original-ten `locale: en` frontmatter already exist as dirty / untracked files. Landing is mostly: edit HEAD Header / BaseLayout / `global.css` / EN home + tools index; strip illegal `FaqList` `heading` props; commit the path-limited dirty set.

The dangerous parts are integration, not new libraries. ZH pages pass `locale` into `ToolCard`, but HEAD `ToolCard` has no `locale` prop and hardcodes `/tools/${tool.slug}/`. Both EN and ZH `[slug].astro` pass `heading={copy.faq}` into items-only `FaqList` — that fails the Astro compile. Dirty ZH pages pass **unprefixed** `path` into BaseLayout; a literal `new URL(path, SITE_ORIGIN)` canonical would collide with EN. Dirty `ToolShell` still has LED chrome (`tool-panel__chrome`, `copy.chromeLocal`) which is **not** in `ui.ts` — do not commit it. Original-ten islands already require `locale` in the dirty tree; `ToolIsland` still does not pass it to those ten — that is Phase 13. Full `astro build` on the overlay may still fail; this phase verifies with file rg + Vitest + an isolated build, not Playwright.

**Primary recommendation:** Tracer = HEAD Header LangSwitch + BaseLayout required locale / `htmlLang` / hreflang + ZH home + EN home `locale` pass. Then expand remaining ZH/EN pages, 404, sitemap, content frontmatter, verbatim `.lang-switch` CSS. Path-limited add only. Strip `heading=` on **both** slug pages. Extend `ToolCard` to take `locale`. Compute canonical with `switchLocalePath(path, locale)` (or `localizedPath` if `path` stays unprefixed) so ZH URLs are unique.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| LangSwitch + localized Header nav | Frontend Server (SSG) | Browser (hamburger script already in NavMenu) | Static `<a href>` generated at build; no client locale swap |
| `<html lang>` + canonical + hreflang | Frontend Server (SSR/SSG layout) | CDN / Static | Document language and SEO alternates belong in the HTML head |
| ZH page tree (`src/pages/zh/`) | Frontend Server (file-based routes) | — | Duplicated tree, not Astro `i18n.routing` |
| EN pages passing `locale` | Frontend Server | — | Locale is a page prop, not middleware |
| Footer / RelatedTools copy + hrefs | Frontend Server | — | Already dirty-wired; commit only |
| Content `locale` frontmatter | Database / Storage (content collections) | Frontend Server | Zod schema in `content.config.ts`; markdown is SEO copy |
| Sitemap i18n xhtml links | CDN / Static (`@astrojs/sitemap`) | — | Built at `astro build`; groups unprefixed EN with `/zh/` |
| 404 locale | Frontend Server | — | `localeFromPathname`; single static `404.html` limitation (Pitfall 6) |
| Tool island Copy/LED | Browser / Client | — | Out of scope (Phase 13). Do not touch `ToolShell` / original ten |
| ToolCard localized href/labels | Frontend Server | — | Required so ZH catalog is not English EN-hrefs |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | `7.3.2` (`npm ls astro`, 2026-09-20) | SSG pages, layouts, content collections | Already the app; `trailingSlash: 'always'` |
| Preact | `^10.29.8` | Tool islands | Do **not** hydrate LangSwitch; it is a static `.astro` nav |
| `@astrojs/sitemap` | `3.7.4` (`npm ls`, 2026-09-20) | XML sitemap + i18n grouping | Dirty `astro.config.mjs` already has the i18n block |
| TypeScript | `^7.0.2` | `src/i18n/*`, `content.config.ts` | Existing |
| Vitest | `5.0.0` (`npm ls vitest`) | Unit tests | `npm test` → `vitest run`; `include: ['src/**/*.test.ts']` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@astrojs/preact` | `^6.0.5` | Island hydration | Unchanged this phase |
| Zod via `astro:content` | bundled with Astro | `locale: z.enum(['en', 'zh'])` | Already in dirty `content.config.ts` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Duplicated `src/pages/zh/` | Astro `i18n.routing` | Locked out. Enabling routing would prefix/redirect and fight unprefixed EN. |
| Text LangSwitch | Globe icon / flags / `<select>` | UI-SPEC forbids icons and dropdowns. |
| Playwright e2e | file rg + Vitest | Locked: do not add Playwright or npm packages. |
| i18next / `astro-i18next` | New package | Forbidden. Use Phase 11 `t(locale)` / `localizedPath` / `switchLocalePath`. |

**Installation:** none — no new packages.

**Version verification:** `astro@7.3.2`, `@astrojs/sitemap@3.7.4`, `vitest@5.0.0` via `npm ls` on 2026-09-20. Node `v22.22.2`.

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
Visitor request (static file)
        |
        v
src/pages/index.astro          src/pages/zh/index.astro
src/pages/tools/[slug].astro   src/pages/zh/tools/[slug].astro
... EN tree ...                ... ZH tree (seven routes) ...
        |                               |
        |  locale = 'en'                |  locale = 'zh'
        +---------------+---------------+
                        |
                        v
                 BaseLayout.astro
          locale: Locale (required)
          path: logical unprefixed route
                        |
          +-------------+-------------+------------------+
          |             |             |                  |
          v             v             v                  v
   html lang =    canonical =    hreflang en /     Header + Footer
   LOCALE_META    switchLocale   zh-Hans /         locale={locale}
   .htmlLang      Path(path,     x-default→EN
                  locale)
                        |
                        v
                   Header.astro
          logo localizedPath(locale, '/')
          nav localizedPath + copy.nav*
          NavMenu (hamburger, unchanged)
          LangSwitch  -->  ThemeToggle
                |
                v
        switchLocalePath(Astro.url.pathname, loc)
        nativeLabel English / 中文
        aria-current="page" on current locale
```

### Recommended Project Structure

```
src/
├── layouts/BaseLayout.astro          # EDIT HEAD — required locale, htmlLang, hreflang, pass to Header/Footer
├── components/
│   ├── Header.astro                  # EDIT HEAD — LangSwitch before ThemeToggle; required locale
│   ├── LangSwitch.astro              # COMMIT as written
│   ├── Footer.astro                  # COMMIT dirty locale wiring
│   ├── RelatedTools.astro            # COMMIT dirty locale wiring
│   ├── ToolCard.astro                # EDIT HEAD — accept locale; localized href + labels
│   ├── FaqList.astro                 # DO NOT EDIT (items-only, English h2 FAQ)
│   ├── NavMenu.astro                 # DO NOT EDIT
│   └── ThemeToggle.astro             # DO NOT EDIT
├── pages/
│   ├── index.astro                   # EDIT — pass locale="en"
│   ├── tools/index.astro             # EDIT — pass locale="en"
│   ├── tools/[slug].astro            # COMMIT dirty; STRIP heading=
│   ├── about.astro / blog / privacy / terms / 404.astro  # COMMIT dirty locale pass
│   └── zh/                           # COMMIT seven routes; STRIP heading= on tools/[slug]
├── content/tools/*.md                # COMMIT locale: en on original ten EN files
├── content.config.ts                 # COMMIT locale enum on toolPages schema
├── styles/global.css                 # EDIT — append UI-SPEC .lang-switch verbatim; mobile ThemeToggle margin
└── astro.config.mjs                  # COMMIT sitemap i18n block
```

Do **not** add `src/i18n/index.ts`. Do **not** add `src/pages/zh/404.astro` unless planner explicitly wants `dist/zh/404.html` as a host hint (not required by PAGE-*).

### Pattern 1: Required locale through layout

**What:** Every page passes `locale` into `BaseLayout`; layout passes it to Header and Footer. No `?? 'en'` on Header.
**When to use:** All eight EN routes + seven ZH routes + 404.

```astro
---
// Source: 12-UI-SPEC.md Markup / BaseLayout; Locale from src/i18n/locales.ts:1-10
import type { Locale } from '../i18n/locales';
import { LOCALE_META } from '../i18n/locales';
import { switchLocalePath } from '../i18n/path';
import { SITE_NAME, SITE_ORIGIN } from '../data/site';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description: string;
  path: string;
  locale: Locale;
}

const { title, description, path, locale } = Astro.props;
const canonical = new URL(switchLocalePath(path, locale), SITE_ORIGIN).href;
const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
---
<html lang={LOCALE_META[locale].htmlLang}>
  <head>
    <link rel="canonical" href={canonical} />
    <link rel="alternate" hreflang={LOCALE_META.en.hreflang} href={new URL(switchLocalePath(path, 'en'), SITE_ORIGIN).href} />
    <link rel="alternate" hreflang={LOCALE_META.zh.hreflang} href={new URL(switchLocalePath(path, 'zh'), SITE_ORIGIN).href} />
    <link rel="alternate" hreflang="x-default" href={new URL(switchLocalePath(path, 'en'), SITE_ORIGIN).href} />
  </head>
  <body>
    <Header locale={locale} />
    <main class="wrap"><slot /></main>
    <Footer locale={locale} />
  </body>
</html>
```

`path` on dirty ZH pages is the **unprefixed logical route** (`"/"`, `"/tools/"`, `"/about/"`). `switchLocalePath` accepts that. `localizedPath(locale, path)` also works **only while `path` stays unprefixed** — it does not strip `/zh/`. Do not pass already-prefixed paths into `localizedPath` or you get `/zh/zh/`.

### Pattern 2: HEAD Header + LangSwitch (do not pop stash)

**What:** Edit HEAD `Header.astro`. Mount order is locked.
**When to use:** Once.

Copy the UI-SPEC Header skeleton. Keep `<NavMenu locale={locale} />`. Import `Locale` from `../i18n/locales` (UI-SPEC) — `ui.ts` still re-exports it, but follow the spec.

LangSwitch is already the contract (`src/components/LangSwitch.astro:1-26`):

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

Do not restyle via inline styles. Do not put it inside `#navMenu`.

### Pattern 3: FaqList heading strip

**What:** HEAD `FaqList` accepts only `items`. English `<h2>FAQ</h2>` is inside the component.
**When to use:** Land of EN + ZH tool slug pages.

[VERIFIED: src/components/FaqList.astro:2-8]

```
interface Props {
  items: { question: string; answer: string }[];
}

const { items } = Astro.props;
---
<h2>FAQ</h2>
```

[VERIFIED: src/pages/zh/tools/[slug].astro:39]

```
<FaqList items={page.data.faq} heading={copy.faq} />
```

[VERIFIED: src/pages/tools/[slug].astro:39]

```
<FaqList items={page.data.faq} heading={copy.faq} />
```

Strip `heading={copy.faq}` (any `heading=` pass) on **both** files. Do not add a `heading` prop to `FaqList.astro`. ZH visitors keep seeing English `FAQ` this phase.

### Pattern 4: Commit sitemap i18n, do not enable `i18n.routing`

[VERIFIED: astro.config.mjs:8-16]

```
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

Installed `@astrojs/sitemap@3.7.4` `parseI18nUrl`: first path segment is a locale **only if** it is a key in `locales`; otherwise the URL is `defaultLocale` with the full path. So `https://example.com/tools/` → `en` + `/tools/`; `https://example.com/zh/tools/` → `zh` + `/tools/`. `generateSitemap` groups matching paths and emits xhtml alternate links with `lang: locales[parsed.locale]` (`en` / `zh-Hans`). Status pages `404` / `500` (and `zh/404`) are skipped. Requires `site` (already `https://example.com`).

Do not set Astro `i18n.routing`. The page tree is the router.

### Anti-Patterns to Avoid

- **Popping `stash@{0}` Header/CSS:** overlay chrome / IBM Plex / LED. Edit HEAD files only.
- **`git add -A`:** would stage LED `ToolShell.tsx` and `src/lib/crontab.ts`.
- **Putting LangSwitch inside `#navMenu`:** hidden when hamburger is closed.
- **Both `.lang-switch` and `#themeToggle` with `margin-left: auto` at ≤640px:** flex splits them apart. UI-SPEC: LangSwitch `auto`, ThemeToggle `0`.
- **Styling `nav a` globally:** recolors the logo. Prefix `.lang-switch` only.
- **Astro `i18n.routing`:** fights unprefixed EN.
- **Passing prefixed `/zh/...` into `localizedPath`:** double prefix.
- **Adding `heading` to FaqList:** deferred; v1.1 lock.
- **Committing LED ToolShell** to make `astro build` green: Phase 13 / 14.
- **Playwright / new npm packages / Tailwind / icon pack.**

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale switcher URLs | Manual string concat `/zh` + pathname | `switchLocalePath` (`src/i18n/path.ts`) | Already collapses `//`, strips `/zh`, trailing slash; open-redirect tests exist |
| Localized nav hrefs | Hardcoded `/tools/` vs `/zh/tools/` | `localizedPath(locale, '/tools/')` | Phase 11 kernel; EN unprefixed |
| html lang / hreflang codes | Ad-hoc `zh-CN` / `zh` | `LOCALE_META` (`en` / `zh-Hans`) | Locked; sitemap locales map uses `zh-Hans` |
| Chrome copy | New strings in `.astro` files | `t(locale)` keys already in `ui.ts` | PAGE-02 / 404 / footer |
| Sitemap alternates | Hand-written `sitemap.xml` | `@astrojs/sitemap` `i18n` option | Already dirty-configured |
| Language dropdown JS | Client island | Static `<a>` in `LangSwitch.astro` | SSG; no flash; no hydration |
| FaqList i18n heading | `heading` prop | English `h2` FAQ inside component | v1.1 lock; deferred |
| Overlay visual system | stash@{0} CSS / IBM Plex / Syne | HEAD `global.css` + verbatim `.lang-switch` | Hard fence |

**Key insight:** The dirty working tree is the consumer contract. This phase commits chrome + pages and refuses overlay islands. Verification that needs a full `astro build` without LED ToolShell belongs to Phase 14 after Phase 13.

## Common Pitfalls

### Pitfall 1: Canonical collision on ZH pages

**What goes wrong:** Dirty ZH pages pass unprefixed `path` (`"/"` on ZH home). Literal UI-SPEC `new URL(path, SITE_ORIGIN)` makes ZH canonical `https://example.com/`, same as EN.
**Why it happens:** `path` is a logical route key, not `Astro.url.pathname`.
**How to avoid:** Keep dirty unprefixed `path`. Set `canonical = new URL(switchLocalePath(path, locale), SITE_ORIGIN).href`. Hreflang trio can copy UI-SPEC using `switchLocalePath(path, 'en' | 'zh')` — that works on unprefixed paths. Do **not** `localizedPath('zh', '/zh/')`.
**Warning signs:** Two pages with identical `<link rel="canonical">`; ZH home canonical missing `/zh/`.

[VERIFIED: src/pages/zh/index.astro:14]

```
<BaseLayout title={SITE_NAME} description={copy.homeLede} path="/" locale={locale}>
```

### Pitfall 2: FaqList `heading` on EN **and** ZH slug pages

**What goes wrong:** Astro compile error — `heading` is not a FaqList prop.
**Why it happens:** Overlay pages assumed a heading prop; HEAD FaqList never grew one. CONTEXT only names the ZH file; EN dirty file has the same prop.
**How to avoid:** Strip `heading=` from both `src/pages/tools/[slug].astro` and `src/pages/zh/tools/[slug].astro`. Do not edit `FaqList.astro`.
**Warning signs:** `Type '{ items: ...; heading: string; }' is not assignable` or Astro unknown prop diagnostic.

### Pitfall 3: ToolCard ignores `locale` (ZH catalog stays English)

**What goes wrong:** ZH home and ZH tools index pass `locale={locale}` into HEAD `ToolCard`, which only accepts `tool` and links to `/tools/${tool.slug}/` with English `tool.name`.
**Why it happens:** UI-SPEC files-in-scope omitted ToolCard; dirty ZH pages already pass the prop.
**How to avoid:** This phase, add optional-or-required `locale: Locale` (default `'en'`). `href={localizedPath(locale, `/tools/${tool.slug}/`)}`. Labels from `t(locale).tools[tool.slug].name` / `shortDescription`. EN home/tools index keep working if default `'en'`.
**Warning signs:** `/zh/` featured cards point at `/tools/json-formatter/` not `/zh/tools/json-formatter/`.

[VERIFIED: src/components/ToolCard.astro:4-10]

```
interface Props {
  tool: Tool;
}

const { tool } = Astro.props;
---
<a class="tool-card" href={`/tools/${tool.slug}/`}>
```

### Pitfall 4: Path-limited add vs LED ToolShell / crontab.ts

**What goes wrong:** `git add -A` or `git add src/` commits LED chrome and dirty `crontab.ts`.
**Why it happens:** Both are modified in the working tree.
**How to avoid:** Explicit file list. Never add `src/components/ToolShell.tsx` or `src/lib/crontab.ts`. Do not add original-ten `src/components/tools/*.tsx` (Phase 13).
**Warning signs:** diff contains `tool-panel__chrome`, `class="led"`, `copy.chromeLocal`.

[VERIFIED: src/components/ToolShell.tsx:22-26]

```
    <div class="tool-panel">
      <div class="tool-panel__chrome">
        <span class="led" aria-hidden="true"></span>
        {copy.chromeLocal}
```

`chromeLocal` is **not** a key on `ui.ts` — another reason this file cannot land this phase.

### Pitfall 5: Overlay `astro build` still red

**What goes wrong:** Dirty original-ten islands require `{ locale }: { locale: Locale }` but `ToolIsland` still renders `<JsonFormatter client:load />` without `locale`. LED ToolShell reads missing `copy.chromeLocal`.
**Why it happens:** Phase 13 owns island wiring / no-LED shell. Phase 12 still hydrates tools on `[slug]` pages.
**How to avoid:** Do not "fix" ToolIsland or ToolShell this phase. Verify chrome with file rg + Vitest. If `astro build` is attempted, isolate by restoring HEAD `ToolShell.tsx` + HEAD original-ten islands **in a throwaway copy**, or treat build failure as expected overlay. Phase 14 is the green-build gate.
**Warning signs:** `locale` undefined in `useToolUi`; `copy.chromeLocal` undefined.

[VERIFIED: src/components/tools/ToolIsland.astro:21-24]

```
interface Props { slug: string; locale?: 'en' | 'zh' }
const { slug, locale = 'en' } = Astro.props;
---
{slug === 'json-formatter' && <JsonFormatter client:load />}
```

### Pitfall 6: Static 404 is one file

**What goes wrong:** `localeFromPathname(Astro.url.pathname)` at SSG time is `/404/` → `'en'`. Hosts serve `dist/404.html` for every miss, including `/zh/not-a-page/`.
**Why it happens:** Static output, single `src/pages/404.astro`, no `src/pages/zh/404.astro`.
**How to avoid:** Still implement the locked `localeFromPathname` wiring (preview / future adapter). Do not add client JS to sniff locale. Do not promise ZH 404 HTML on GitHub Pages / generic static hosts this phase.
**Warning signs:** Assuming `dist/zh/404.html` exists after build.

### Pitfall 7: Mobile ThemeToggle margin

**What goes wrong:** Leaving `#themeToggle { margin-left: auto }` after adding `.lang-switch { margin-left: auto }` splits LangSwitch and theme to opposite ends of the leftover flex space.
**Why it happens:** Both auto-margins compete.
**How to avoid:** Copy UI-SPEC: replace the existing 640px ThemeToggle rule with `margin-left: 0`; add `.lang-switch { margin-left: auto }` only inside that breakpoint.
**Warning signs:** Mobile bar `[logo] [English 中文] …… [theme]` or `[logo] …… [English 中文]` with theme wrapping.

[VERIFIED: src/styles/global.css:152-156]

```
@media (max-width: 640px) {
  #themeToggle {
    margin-left: auto;
  }
}
```

### Pitfall 8: EN home / tools index never grew `locale`

**What goes wrong:** After Header/BaseLayout require `locale`, EN home and tools index fail the build (`locale` missing).
**Why it happens:** They are still HEAD templates; not in the dirty git list.
**How to avoid:** `const locale = 'en' as const` and `locale={locale}` on `<BaseLayout>`. PAGE-04 does **not** require rewriting EN home body to `copy.homeLede` this phase — passing `locale` is the requirement. Optional copy parity is out of scope unless the planner wants it as a tiny extra.
**Warning signs:** `src/pages/index.astro` and `src/pages/tools/index.astro` still `<BaseLayout ... path="/">` with no locale.

[VERIFIED: src/pages/index.astro:10]

```
<BaseLayout title={SITE_NAME} description={SITE_TAGLINE} path="/">
```

[VERIFIED: src/pages/tools/index.astro:10-14]

```
<BaseLayout
  title="All tools"
  description="Browser-based developer tools. Nothing is uploaded."
  path="/tools/"
>
```

### Pitfall 9: content schema vs original-ten frontmatter

**What goes wrong:** Committing dirty `content.config.ts` (`locale: z.enum(['en', 'zh'])`) without `locale: en` on original-ten EN markdown fails content collection.
**Why it happens:** HEAD original-ten markdown has no `locale` key; later-eight already have `locale: en` on HEAD.
**How to avoid:** Commit original-ten EN `.md` frontmatter `locale: en` together with `content.config.ts`. ZH files under `src/content/tools/zh/` already have `locale: zh`. Completeness test `src/data/tools.test.ts` only checks files exist — it does not parse frontmatter.
**Warning signs:** `Invalid content entry` / missing required `locale` at build.

[VERIFIED: src/content.config.ts:13-16]

```
const toolPages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: z.object({
    locale: z.enum(['en', 'zh']),
```

HEAD schema (git) has **no** `locale` field — the working copy is the land target.

### Pitfall 10: Header still imports `Locale` from `ui.ts` with optional prop

**What goes wrong:** Leaving `locale?: Locale` and `?? 'en'` violates PAGE-02/05 once BaseLayout always passes locale — and Logo/nav stay hardcoded English `/tools/`.
**Why it happens:** HEAD Header is the pre-i18n chrome.
**How to avoid:** Replace with UI-SPEC Header. Do not pop stash Header.

[VERIFIED: src/components/Header.astro:5-22]

```
import type { Locale } from '../i18n/ui';

interface Props {
  locale?: Locale;
}

const locale = Astro.props.locale ?? 'en';
---
<header class="site">
  <nav class="wrap nav">
    <a class="logo" href="/">{SITE_NAME}</a>
    <NavMenu locale={locale} />
    <div class="nav-links" id="navMenu">
      <a href="/tools/">Tools</a>
      <a href="/blog/">Blog</a>
      <a href="/about/">About</a>
    </div>
    <ThemeToggle />
```

## Code Examples

### LangSwitch CSS (copy verbatim)

Source: `12-UI-SPEC.md` Token implementation. Append after existing `#themeToggle` rules. Then **replace** the mobile ThemeToggle margin.

```css
@media (max-width: 640px) {
  #themeToggle {
    margin-left: 0;
  }
}

.lang-switch {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}
.lang-switch a {
  color: var(--text);
  text-decoration: none;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
}
.lang-switch a:hover {
  color: var(--accent);
}
.lang-switch a[aria-current="page"] {
  font-weight: 600;
}
@media (max-width: 640px) {
  .lang-switch {
    margin-left: auto;
  }
}
```

Do not set width/height on `.lang-switch a`. Do not add border, background, radius, underline, or a second focus ring. Idle and current stay `--text`; current is weight 600; hover is `--accent` text only.

`--sp-2` is already `8px` on `:root` [VERIFIED: src/styles/global.css:19] `--sp-2: 8px;`

### Header mount order

Source: `12-UI-SPEC.md` Markup. Logo always `localizedPath(locale, '/')` (EN → `/`, ZH → `/zh/`). Discretion resolved: do not special-case EN `'/'`.

### 404 copy keys (already in `ui.ts`)

[VERIFIED: src/i18n/ui.ts:27-30] EN:

```
    notFoundTitle: 'Page not found',
    notFoundDescription: 'That page does not exist.',
    notFoundBody: 'That URL is not a tool or a page on this site.',
    notFoundCta: 'Browse all tools',
```

[VERIFIED: src/i18n/ui.ts:251-254] ZH:

```
    notFoundTitle: '页面未找到',
    notFoundDescription: '该页面不存在。',
    notFoundBody: '这个地址不是本站的工具或页面。',
    notFoundCta: '浏览全部工具',
```

Dirty `src/pages/404.astro` already uses these plus `localeFromPathname` and `localizedPath(locale, '/tools/')`. Commit it. CTA href is `/tools/` or `/zh/tools/`.

### LOCALE_META (do not restyle)

[VERIFIED: src/i18n/locales.ts:1-10]

```
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

### Path helpers (do not rewrite)

[VERIFIED: src/i18n/path.ts:20-44] `localeFromPathname` / `localizedPath` / `switchLocalePath` — EN unprefixed, ZH `/zh/`, trailing slash, illegal locale → en, never throw, never emit `//`. Tests in `src/i18n/path.test.ts` must stay green.

### File-read completeness test analog

Source: `src/components/tools/ToolIsland.test.ts` (readFileSync + string includes). Optional Wave 0 test can assert Header contains `LangSwitch`, FaqList source has no `heading`, `global.css` contains `.lang-switch`, and both slug pages do not contain `heading=`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HEAD English-only chrome, no `locale` on layout | Required `locale` + LangSwitch + duplicated `src/pages/zh/` | this phase | Visitors switch EN/ZH without leaving the equivalent URL |
| `@astrojs/sitemap()` with no i18n | `i18n.defaultLocale: 'en'`, `zh: 'zh-Hans'` | dirty config, commit now | xhtml alternates in sitemap |
| Optional Header `locale ?? 'en'` | Required `locale` from BaseLayout | this phase | ZH logo/nav cannot silently fall back to EN |
| FaqList heading experiments in overlay | Items-only English `FAQ` | v1.1 lock | Strip overlay `heading=` |

**Deprecated/outdated:**

- Hardcoded Header `/tools/` `/blog/` `/about/` English labels: replace this phase
- Literal canonical `new URL(unprefixedPath, origin)` on ZH pages: unique-canonical via `switchLocalePath`
- Astro `i18n.routing` for this repo: do not enable

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Google-style hreflang should be bidirectional, absolute, and include `x-default` → EN | Hreflang | UI-SPEC already locked `x-default` → EN; if a host rejects `zh-Hans`, sitemap/head would need `zh` — low probability, locked to `zh-Hans` anyway |
| A2 | Extra Astro component props (`locale` on ToolCard) are ignored today rather than failing the build | Pitfall 3 | If Astro strict-unknown-props, ZH home already fails until ToolCard is updated — same fix |
| A3 | Isolated `astro build` (HEAD ToolShell + HEAD original-ten) can prove chrome HTML without Phase 13 | Validation | If isolation is too costly, rg + Vitest is the phase gate; Phase 14 owns green overlay-free build |
| A4 | Static hosts will serve EN `404.html` for `/zh/*` misses | Pitfall 6 | Locked 404 implementation still correct for `astro preview` pathname if ever SSR |

## Open Questions

### RESOLVED

None.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Astro / Vitest | ✓ | v22.22.2 | — |
| npm | scripts | ✓ | 11.9.0 | — |
| `astro` CLI | `astro build` (isolated) | ✓ | 7.3.2 | file rg if overlay build blocked |
| Vitest | unit tests | ✓ | 5.0.0 | — |
| Playwright | — | not required | — | Do not add |
| GitHub remote | — | out of scope | — | Phase 14 is workflow file only |

**Missing dependencies with no fallback:** none

**Missing dependencies with fallback:** Playwright deliberately unused.

Step 2.6 tools probed: `node`, `npm`, `npx astro --version`, `npx vitest --version`, `npm ls astro @astrojs/sitemap vitest`.

## Validation Architecture

> `workflow.nyquist_validation` is enabled in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `5.0.0` |
| Config file | `vitest.config.ts` (`include: ['src/**/*.test.ts']`, `environment: 'node'`) |
| Quick run command | `npx vitest run src/i18n src/data/tools.test.ts src/components/tools/ToolIsland.test.ts` |
| Full suite command | `npm test` (`vitest run`) |

Do **not** add Playwright. Do **not** require overlay-free `astro build` as the phase gate.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAGE-01 | Header source mounts `LangSwitch` before `ThemeToggle`, not inside `#navMenu` | unit (file read) | `npx vitest run src/components/Header.test.ts` (Wave 0) or `rg LangSwitch src/components/Header.astro` | ❌ Wave 0 |
| PAGE-02 | Header uses `localizedPath` + `copy.navTools` / `navBlog` / `navAbout`; `locale` required | unit (file read) + existing path tests | `npx vitest run src/i18n/path.test.ts` + rg Header | ❌ Wave 0 for Header; ✅ path tests |
| PAGE-03 | Seven ZH routes exist; ZH slug has no `heading=` | unit (fs exists + rg) | `rg heading= src/pages/zh/tools/[slug].astro` must be empty; files exist under `src/pages/zh/` | ❌ Wave 0 |
| PAGE-04 | EN pages pass `locale=`; original-ten md `locale: en`; sitemap i18n block; completeness EN+ZH markdown | unit | `npx vitest run src/data/tools.test.ts`; rg `locale=` on EN pages; rg `locale: en` on `src/content/tools/*.md` | ✅ tools.test.ts; ❌ page rg tests |
| PAGE-05 | BaseLayout `html lang` from `LOCALE_META`; Header/Footer get `locale` | unit (file read) | rg `LOCALE_META[locale].htmlLang` and `<Header locale={locale}` | ❌ Wave 0 |
| PAGE-01..05 | Completeness: every catalog slug still has ToolIsland `slug ===` branch | unit | `npx vitest run src/components/tools/ToolIsland.test.ts` | ✅ |
| PAGE-04 | Kernel path/locale contracts unchanged | unit | `npx vitest run src/i18n` | ✅ |
| Chrome CSS | `.lang-switch` block + mobile ThemeToggle `margin-left: 0` | file rg | `rg ".lang-switch" src/styles/global.css` | ❌ Wave 0 |
| Isolated build | Optional: `astro build` with HEAD ToolShell + HEAD original-ten if overlay still breaks | smoke | `npx astro build` in isolation; **not** Playwright | ❌ optional |
| Fence | LED ToolShell / crontab.ts unstaged | git | `git diff --cached --name-only` must not list those files | manual in commit task |

### Sampling Rate

- **Per task commit:** `npx vitest run src/i18n src/data/tools.test.ts src/components/tools/ToolIsland.test.ts` plus the file-rg checks for files that task touched
- **Per wave merge:** `npm test`
- **Phase gate:** Full Vitest green. Isolated `astro build` if overlay still breaks (restore HEAD `ToolShell.tsx` + HEAD original-ten islands in a throwaway worktree, or skip with documented overlay errors). Full overlay-free `astro build` is **Phase 14**. No Playwright.

### Wave 0 Gaps

- [ ] Optional `src/components/Header.test.ts` (or `src/i18n/pages-land.test.ts`) — file-read asserts: `LangSwitch` import/mount, `localizedPath`, no `heading=` on either `[slug].astro`, `.lang-switch` in `global.css`, `locale: Locale` required on Header/BaseLayout. Analog: `ToolIsland.test.ts`.
- [ ] Isolated build note in the plan — not a test file
- Framework install: none — Vitest already present

Existing infrastructure covers kernel + catalog completeness. Page-land assertions are rg/Wave 0 unless the planner adds the file-read test.

### Suggested tracer then expansion

1. **Tracer:** Header LangSwitch + BaseLayout locale / `htmlLang` / hreflang + ZH `src/pages/zh/index.astro` + EN `src/pages/index.astro` `locale` pass + verbatim `.lang-switch` CSS
2. **Expand:** remaining six ZH routes; remaining EN pages + 404; Footer + RelatedTools + ToolCard; strip both slug `heading=`; `content.config.ts` + original-ten `locale: en`; `astro.config.mjs` sitemap i18n
3. **Commit:** path-limited add of the list in Files to touch; never ToolShell / crontab / islands / stash pop

## Security Domain

> `security_enforcement` enabled; ASVS level 1.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No accounts |
| V3 Session Management | no | No sessions; theme `localStorage` unchanged |
| V4 Access Control | no | Public static site |
| V5 Input Validation | yes | `switchLocalePath` / `normalizePath` collapse `//`, strip schemes, force leading+trailing `/`; LangSwitch hrefs are generated from `Astro.url.pathname` + `LOCALES`, not form input |
| V6 Cryptography | no | No new crypto |

### Known Threat Patterns for Astro SSG i18n chrome

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Protocol-relative / open redirect from language switch (`//evil.com`) | Spoofing / Tampering | Existing `switchLocalePath('//evil.com', 'en')` test asserts result does not start with `//` [VERIFIED: src/i18n/path.test.ts:49-52] |
| `javascript:` or scheme-smuggling in path | Tampering | `stripScheme` in `path.ts` [VERIFIED: src/i18n/path.ts:3-5] |
| XSS via chrome copy | Tampering | Copy is static `ui.ts` strings, not markdown; FAQ answers already flow through existing FaqList (unchanged) |
| `hreflang` / canonical pointing at attacker origin | Information disclosure | Always `new URL(..., SITE_ORIGIN)`; do not change `SITE_ORIGIN` |
| Staging LED ToolShell / crontab via broad git add | Tampering (supply into main) | Path-limited add; fence in commit task |

Do not add a query-string passthrough on LangSwitch (would need extra sanitization). Current component uses pathname only.

## Files to touch (planner checklist)

**Edit HEAD:** `src/components/Header.astro`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`, `src/pages/index.astro`, `src/pages/tools/index.astro`, `src/components/ToolCard.astro`

**Commit dirty / untracked (after heading strip):** `src/components/LangSwitch.astro`, `src/components/Footer.astro`, `src/components/RelatedTools.astro`, `src/pages/zh/**` (seven), `src/pages/404.astro`, `src/pages/about.astro`, `src/pages/blog/index.astro`, `src/pages/privacy.astro`, `src/pages/terms.astro`, `src/pages/tools/[slug].astro`, `src/content.config.ts`, original-ten `src/content/tools/{base64,color-converter,crontab-explainer,hash-generator,json-formatter,jwt-decoder,regex-tester,unix-timestamp,url-encode,uuid-generator}.md`, `astro.config.mjs`

**Do not touch / do not stage:** `src/components/ToolShell.tsx`, `src/lib/crontab.ts`, `src/components/tools/**` (Phase 13), `src/components/FaqList.astro`, `ThemeToggle.astro`, `NavMenu.astro`, `SITE_ORIGIN`, stash@{0}/@{1}

## Sources

### Primary (HIGH confidence)

- In-repo HEAD vs dirty: `Header.astro`, `BaseLayout.astro`, `FaqList.astro`, `LangSwitch.astro`, `Footer.astro`, `RelatedTools.astro`, `ToolCard.astro`, `src/pages/**`, `src/i18n/locales.ts`, `src/i18n/path.ts`, `src/i18n/ui.ts`, `src/content.config.ts`, `astro.config.mjs`, `src/styles/global.css`, `ToolShell.tsx`, `ToolIsland.astro`
- `12-CONTEXT.md`, `12-UI-SPEC.md`, `REQUIREMENTS.md` PAGE-01–05, `ROADMAP.md` Phase 12
- Phase 11 kernel tests: `src/i18n/path.test.ts`, `src/i18n/locales.test.ts`
- Installed `@astrojs/sitemap@3.7.4` `dist/utils/parse-i18n-url.js`, `dist/generate-sitemap.js`, `dist/index.js` (i18n grouping + 404 skip)

### Secondary (MEDIUM confidence)

- `@astrojs/sitemap` i18n option shape from package `README.md` (docs URL `https://docs.astro.build/en/guides/integrations-guide/sitemap/`) and `dist/index.d.ts` `i18n?: { defaultLocale: string; locales: Record<string, string> }`
- classify-confidence `--provider context7 --verified` → MEDIUM (Context7 MCP/CLI unavailable this session; installed `.d.ts` / dist used instead)

### Tertiary (LOW confidence)

- Live `docs.astro.build` / `developers.google.com` WebFetch blocked by network policy this session
- Tavily seam unavailable (`BRAVE_API_KEY not set`)
- WebSearch summary of sitemap i18n unprefixed default locale — used only as corroboration of installed source

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `npm ls` this session; no new packages
- Architecture: HIGH — HEAD vs dirty vs UI-SPEC vs Phase 11 kernel
- Pitfalls: HIGH — compile-breaking `heading=`, ToolCard locale gap, canonical collision, overlay build, git fences all observed in files this session
- External SEO/hreflang nuance: LOW — docs fetch blocked; UI-SPEC already locked `x-default` → EN and `zh-Hans`

**Research date:** 2026-09-20
**Valid until:** 2026-10-20 (stable in-repo contract; 30 days)
