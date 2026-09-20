# Phase 12: Pages + LangSwitch - Context

**Gathered:** 2026-09-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Visitors can browse the full ZH tree and switch EN/ZH from the header without leaving the current page equivalent. This phase mounts `LangSwitch.astro` on HEAD `Header.astro`, localizes nav/logo, passes `locale` through `BaseLayout` to Header/Footer, commits `src/pages/zh/` (seven routes), wires EN pages + content `locale` frontmatter + sitemap i18n, and localizes 404 via `localeFromPathname`. It does not rewire ToolIsland / original-ten islands / LED ToolShell (Phase 13) and does not add CI (Phase 14).

</domain>

<decisions>
## Implementation Decisions

### Header 挂载
- Mount `LangSwitch.astro` immediately before `ThemeToggle` (logo → hamburger → Tools/Blog/About → LangSwitch → ThemeToggle)
- Do not pop `stash@{0}`; edit HEAD `Header.astro` only
- Logo `href` is `localizedPath(locale, '/')` so ZH stays on `/zh/`
- Tools/Blog/About use `copy.navTools` / `navBlog` / `navAbout` plus `localizedPath`
- Header `locale` is required (`locale: Locale`); BaseLayout always passes it (drop `?` and `?? 'en'`)

### BaseLayout
- Required `locale: Locale`; pass to Header and Footer
- `<html lang>` is `LOCALE_META[locale].htmlLang` (`en` / `zh-Hans`)
- Canonical stays `path` + `SITE_ORIGIN`; add EN/ZH `hreflang` alternates via `localizedPath` / `switchLocalePath`
- HEAD `FaqList` stays items-only with English `h2` FAQ (v1.1 lock). Strip `heading={copy.faq}` from ZH `[slug].astro` on land so the build does not fail

### ZH 树 / EN 接线
- Commit all seven ZH pages: home, tools, `[slug]`, about, blog, privacy, terms
- Strip `heading` from ZH tool pages when landing
- Every EN page (home, tools, `[slug]`, about, blog, privacy, terms, 404) passes `locale` to BaseLayout
- Add `locale: en` frontmatter to existing EN `src/content/tools/*.md` (schema already requires the field); ZH files already live under `zh/`

### Sitemap / 404 / CSS
- Commit the existing dirty `astro.config.mjs` sitemap i18n block (`defaultLocale: en`, `zh: zh-Hans`)
- 404 keeps `localeFromPathname(Astro.url.pathname)` plus localized copy
- Add minimal `.lang-switch` rules in `global.css` (flex, gap `var(--sp-2)`, `aria-current` weight); do not pop overlay CSS from `stash@{0}`
- Do not commit LED ToolShell, `crontab.ts`, or original-ten island locale wiring; do not pop stashes

### Claude's Discretion
- Exact hreflang `<link rel="alternate">` markup as long as EN and ZH equivalents exist
- Exact `.lang-switch` spacing/typography beyond flex + `--sp-2` + current-page weight
- Whether logo on EN stays `/` (same as `localizedPath('en', '/')`)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/i18n/locales.ts`, `path.ts`, `ui.ts` chrome keys, `useToolUi.ts` — Phase 11 kernel (KERN-01–04)
- Uncommitted `src/components/LangSwitch.astro` — already imports LOCALES / LOCALE_META / switchLocalePath / `copy.langSwitch`
- Uncommitted `src/pages/zh/` (seven routes) and dirty Footer / RelatedTools / 404 / EN pages / content frontmatter / astro.config sitemap i18n
- HEAD `Header.astro`: optional locale, hardcoded `/tools/` `/blog/` `/about/` English labels, no LangSwitch
- HEAD `BaseLayout.astro`: no locale prop, `<html lang="en">`, Header/Footer with no locale
- HEAD `FaqList.astro`: `{ items }` only, English `h2` FAQ

### Established Patterns
- EN unprefixed + trailing slash; ZH `/zh/` (Phase 11 path helpers)
- Static Astro chrome, not Preact islands
- Path-limited git add; never `git add -A`
- Do not pop `stash@{0}` (overlay Header/CSS) or `stash@{1}`

### Integration Points
- Phase 13 will pass `locale` into ToolIsland / all 18 islands / no-LED ToolShell
- Phase 14 will add ci.yml and require green `astro build` without overlay isolation
- Completeness tests (`tools.test.ts` EN+ZH markdown, `ToolIsland.test.ts` slug branches) must stay green

</code_context>

<specifics>
## Specific Ideas

Match dirty-file import contracts so landing is mostly commit + Header/BaseLayout/FaqList heading strip:
- LangSwitch before ThemeToggle
- `localizedPath` for logo and nav
- BaseLayout required locale + htmlLang from LOCALE_META + hreflang alternates
- FaqList: strip `heading` on ZH tool pages; do not add heading prop
- Sitemap i18n already in dirty `astro.config.mjs`

Hard fences: LED ToolShell, `crontab.ts`, no stash pop, path-limited add, no new tools, no SITE_ORIGIN change.

</specifics>

<deferred>
## Deferred Ideas

- FaqList localized heading — v1.1 locked English `h2` FAQ; not this phase
- Original-ten island locale + no-LED ToolShell — Phase 13
- CI workflow + green build without isolation — Phase 14
- Three-state theme, theme animation, 4-col grid — v2

</deferred>
