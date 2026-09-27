---
phase: 12-pages-langswitch
plan: 01
subsystem: ui
tags: [astro, i18n, langswitch, hreflang, sitemap, bilingual]

requires:
  - phase: 11-i18n-kernel
    provides: Locale, LOCALES, LOCALE_META, localizedPath, switchLocalePath, localeFromPathname, t(locale)
provides:
  - Header LangSwitch before ThemeToggle outside #navMenu
  - BaseLayout required locale, htmlLang, switchLocalePath canonical, hreflang trio
  - Seven ZH routes plus EN locale pass
  - ToolCard/Footer/RelatedTools localized hrefs
  - original-ten locale en frontmatter and sitemap i18n
affects: [13-islands-toolshell, 14-ci]

actuals:
  tokens: 8965
  tasks: 3
  commits: 3

plan_head_before: 0ed4df5e0db82c88275d00de2c9a8b3edf724051

tech-stack:
  added: []
  patterns:
    - Required locale on BaseLayout/Header/Footer
    - Canonical and hreflang via switchLocalePath
    - ZH pages pass unprefixed logical path
    - FaqList items-only (English h2 FAQ)

key-files:
  created:
    - src/components/LangSwitch.astro
    - src/i18n/pages-land.test.ts
    - src/pages/zh/index.astro
    - src/pages/zh/tools/index.astro
    - src/pages/zh/tools/[slug].astro
    - src/pages/zh/about.astro
    - src/pages/zh/blog/index.astro
    - src/pages/zh/privacy.astro
    - src/pages/zh/terms.astro
  modified:
    - src/components/Header.astro
    - src/layouts/BaseLayout.astro
    - src/styles/global.css
    - src/components/ToolCard.astro
    - src/components/Footer.astro
    - src/components/RelatedTools.astro
    - src/pages/index.astro
    - src/pages/tools/index.astro
    - src/pages/tools/[slug].astro
    - src/pages/about.astro
    - src/pages/blog/index.astro
    - src/pages/privacy.astro
    - src/pages/terms.astro
    - src/pages/404.astro
    - src/content.config.ts
    - astro.config.mjs

key-decisions:
  - "Canonical uses switchLocalePath(path, locale) so ZH unprefixed path does not collide with EN"
  - "FaqList heading stripped on both EN and ZH slug pages; FaqList.astro untouched"
  - "ToolCard locale is optional default en so EN catalog cards keep working"
  - "hreflang trio is en, zh-Hans, x-default pointing at EN"

patterns-established:
  - "Page locale constant (en|zh as const) passed into BaseLayout"
  - "LangSwitch text links from LOCALES; current is aria-current page + weight 600"
  - "Path-limited git add; LED ToolShell and crontab.ts stay uncommitted"

requirements-completed: [PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05]

coverage:
  - id: D1
    description: Header mounts LangSwitch before ThemeToggle outside #navMenu with required locale and localizedPath nav/logo
    requirement: PAGE-01
    verification:
      - kind: unit
        ref: src/i18n/pages-land.test.ts#mounts LangSwitch after #navMenu and before ThemeToggle
        status: pass
      - kind: unit
        ref: src/i18n/pages-land.test.ts#requires locale Locale with no optional marker or en fallback
        status: pass
    human_judgment: false
  - id: D2
    description: BaseLayout required locale, htmlLang from LOCALE_META, canonical and hreflang via switchLocalePath
    requirement: PAGE-05
    verification:
      - kind: unit
        ref: src/i18n/pages-land.test.ts#sets htmlLang, switchLocalePath canonical, Header/Footer locale, and x-default
        status: pass
    human_judgment: false
  - id: D3
    description: Seven ZH routes committed; ToolCard localized hrefs; FaqList items-only on both slug pages
    requirement: PAGE-03
    verification:
      - kind: unit
        ref: src/i18n/pages-land.test.ts#has the seven ZH routes
        status: pass
      - kind: unit
        ref: src/i18n/pages-land.test.ts#EN and ZH slug pages include FaqList without extra props
        status: pass
    human_judgment: false
  - id: D4
    description: EN pages pass locale; Footer, RelatedTools, 404, content locale en, sitemap i18n
    requirement: PAGE-04
    verification:
      - kind: unit
        ref: src/i18n/pages-land.test.ts#every listed EN page source includes locale= on BaseLayout
        status: pass
      - kind: unit
        ref: src/i18n/pages-land.test.ts#astro.config has defaultLocale, zh-Hans, and no i18n.routing
        status: pass
      - kind: unit
        ref: src/i18n/pages-land.test.ts#EN markdown files include locale en
        status: pass
    human_judgment: false
  - id: D5
    description: LangSwitch idle/current contrast and mobile cluster (LangSwitch + ThemeToggle on the right)
    requirement: PAGE-01
    verification: []
    human_judgment: true
    rationale: Visual contrast (4.5:1) and 640px header clustering require a human eyeball; no automated visual test this phase

duration: 8min
completed: 2026-09-20
status: complete
---

# Phase 12 Plan 01: Pages + LangSwitch Summary

**Header LangSwitch plus required-locale BaseLayout, seven ZH routes, EN locale pass, and sitemap i18n (en / zh-Hans)**

## Performance

- **Duration:** 8 min
- **Started:** 2026-09-20T11:43:10Z
- **Completed:** 2026-09-20T11:51:42Z
- **Tasks:** 3
- **Files modified:** 35

## Accomplishments

- Header mounts `LangSwitch.astro` immediately before ThemeToggle and outside `#navMenu`; logo and Tools/Blog/About use `localizedPath` plus chrome copy
- BaseLayout requires `locale`, sets `<html lang>` from `LOCALE_META`, unique canonical via `switchLocalePath`, and EN/ZH/x-default hreflang
- Seven ZH routes committed (home, tools index, slug, about, blog, privacy, terms) with unprefixed logical paths
- EN pages, 404 (`localeFromPathname`), Footer, RelatedTools, original-ten `locale: en`, and sitemap i18n aligned
- FaqList stays items-only; extra `heading=` stripped on both slug pages

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end home EN/ZH switch** - `e78f040` (feat)
2. **Task 2: Remaining ZH routes and FaqList heading strip** - `959c3d2` (feat)
3. **Task 3: EN pages, 404, content locale, sitemap i18n** - `4145f62` (feat)

## Files Created/Modified

- `src/components/LangSwitch.astro` - LOCALES map, switchLocalePath hrefs, nativeLabel, aria-current
- `src/components/Header.astro` - required locale, localizedPath logo/nav, LangSwitch before ThemeToggle
- `src/layouts/BaseLayout.astro` - required locale, htmlLang, switchLocalePath canonical, hreflang trio
- `src/styles/global.css` - verbatim `.lang-switch` plus mobile `#themeToggle { margin-left: 0 }`
- `src/components/ToolCard.astro` - locale + localizedPath + t(locale) labels
- `src/components/Footer.astro` / `src/components/RelatedTools.astro` - committed locale wiring
- `src/pages/zh/**` - seven ZH routes
- EN pages + `src/pages/404.astro` - locale passed to BaseLayout
- `src/content.config.ts` + original-ten `locale: en` frontmatter
- `astro.config.mjs` - sitemap i18n (`defaultLocale: 'en'`, `zh: 'zh-Hans'`)
- `src/i18n/pages-land.test.ts` - file-read land asserts

## Decisions Made

- Canonical is `new URL(switchLocalePath(path, locale), SITE_ORIGIN)` so ZH home `path="/"` does not collide with EN
- Strip `heading={copy.faq}` on both EN and ZH slug pages; do not edit `FaqList.astro`
- ToolCard `locale?: Locale` defaults to `'en'`
- hreflang emit order is EN, ZH, x-default (x-default → EN)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] pages-land mount-order matched the LangSwitch import**
- **Found during:** Task 1 (tracer tests)
- **Issue:** `indexOf('LangSwitch')` hit the import before `#navMenu`, so the before-ThemeToggle assert failed
- **Fix:** Assert on `<LangSwitch` and `<ThemeToggle` tags
- **Files modified:** `src/i18n/pages-land.test.ts`
- **Verification:** `npx vitest run src/i18n/pages-land.test.ts` passed
- **Committed in:** `e78f040` (Task 1)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Test selector fix only. No scope creep.

## Issues Encountered

None. Tracer visual human-check (contrast / 640px cluster) is deferred to end-of-phase UAT (`coverage.D5`). Sequential executor completed all three tasks as spawned; automated tracer verify was re-run green before expansion.

## Authentication Gates

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Chrome and routes are on `main`. Phase 13 can pass `locale` into ToolIsland / original-ten islands / no-LED ToolShell.
- LED `ToolShell.tsx` and `src/lib/crontab.ts` remain uncommitted. Overlay-free `astro build` is Phase 14.
- `stash@{0}` and `stash@{1}` still listed; do not pop.

## Self-Check: PASSED

---
*Phase: 12-pages-langswitch*
*Completed: 2026-09-20*
