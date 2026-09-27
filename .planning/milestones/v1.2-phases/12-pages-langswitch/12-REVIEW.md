---
phase: 12-pages-langswitch
reviewed: 2026-09-20T12:30:00Z
depth: standard
files_reviewed: 25
files_reviewed_list:
  - src/components/LangSwitch.astro
  - src/i18n/pages-land.test.ts
  - src/pages/zh/index.astro
  - src/pages/zh/tools/index.astro
  - src/pages/zh/tools/[slug].astro
  - src/pages/zh/about.astro
  - src/pages/zh/blog/index.astro
  - src/pages/zh/privacy.astro
  - src/pages/zh/terms.astro
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
findings:
  critical: 0
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 12: Code Review Report

**Reviewed:** 2026-09-20T12:30:00Z
**Depth:** standard
**Files Reviewed:** 25
**Status:** issues_found

## Summary

Phase 12 chrome and routes were reviewed for correctness, i18n wiring, and the T-12-01 / T-12-02 threat mitigations. LangSwitch hrefs are pathname + `LOCALES` only (no query-string passthrough) and go through `switchLocalePath`, which collapses leading slashes so results never start with `//`. Canonical and hreflang are `new URL(switchLocalePath(path, …), SITE_ORIGIN)`, so ZH pages that pass unprefixed logical `path` do not collide with EN. FaqList is items-only on both slug pages. ToolCard accepts `locale` (default `'en'`) and ZH catalog cards pass it. `.lang-switch` CSS matches the UI-SPEC token block, including mobile `#themeToggle { margin-left: 0 }` plus `.lang-switch { margin-left: auto }`.

No critical security or data-loss issues. Two warnings: catalog label lookups can throw if `TOOLS` and `ui.tools` drift, and the 404 document advertises a `/zh/404/` equivalent that is not a route.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Unchecked `copy.tools[slug]` lookup can throw at render

**File:** `src/components/ToolCard.astro:14-18`
**Also:** `src/components/RelatedTools.astro:21`
**Issue:** ToolCard no longer uses `tool.name` / `tool.shortDescription` from the registry. It indexes `t(locale).tools` with `tool.slug as keyof typeof copy.tools` and immediately reads `.name` / `.shortDescription`. RelatedTools does the same for link text. The `as` cast hides a missing key. Today all 18 catalog slugs exist in `ui.ts`, but a new `TOOLS` entry without a matching `ui.tools` key will throw `Cannot read properties of undefined` while rendering the catalog or related list — a crash path the old registry fields could not hit.
**Fix:** Fail at the boundary instead of assuming the index exists:

```astro
const labels = copy.tools[tool.slug as keyof typeof copy.tools];
if (!labels) {
  throw new Error(`Missing ui.tools[${tool.slug}] for locale ${locale}`);
}
```

Prefer typing `Tool.slug` as `keyof UiDict['tools']` so the mismatch is a compile error. Apply the same guard in `RelatedTools.astro` before `.name`.

### WR-02: 404 hreflang / LangSwitch target `/zh/404/` is not a route

**File:** `src/pages/404.astro:6-13`
**Also:** `src/layouts/BaseLayout.astro:31-33`, `src/components/LangSwitch.astro:11-17`
**Issue:** The 404 page always passes `path="/404/"` into BaseLayout. At SSG, `Astro.url.pathname` is `/404/`, so LangSwitch bakes `href="/zh/404/"` for 中文 and BaseLayout emits `hreflang="zh-Hans"` → `https://example.com/zh/404/`. There is no `src/pages/zh/404.astro` (locked). Clicking 中文 on the 404 page navigates to another miss and the static `404.html` again. The hreflang trio on this document points at a URL that does not exist. Static-host EN-only 404 copy (Pitfall 6) is accepted; advertising and linking a phantom ZH 404 is still incorrect wiring on a page in this phase.
**Fix:** Do not treat `/404/` as a localizable logical path. Either omit the hreflang trio on 404 (canonical + `noindex` only) or point LangSwitch at the locale homes:

```astro
const locale = localeFromPathname(Astro.url.pathname);
const copy = t(locale);
const switchPath = '/'; // not '/404/'
---
<BaseLayout
  title={copy.notFoundTitle}
  description={copy.notFoundDescription}
  path={switchPath}
  locale={locale}
>
```

If 404 must keep `path="/404/"`, skip alternate links in BaseLayout when `path` is the 404 route.

## Info

### IN-01: ZH home markup diverges from EN and uses unstyled classes

**File:** `src/pages/zh/index.astro:15-32`
**Issue:** UI-SPEC required the same layout chrome as EN and forbade a ZH-only visual template. ZH home commits overlay structure (`section.hero`, `.kicker`, `.lede`, `ul.cats`, `.section-head`) that EN home does not use. None of those class names exist in `src/styles/global.css` (overlay CSS was fenced). Behavior is fine; the ZH homepage is a different, unstyled template.
**Fix:** Mirror EN home structure and only swap `t('zh')` copy / `localizedPath`, or add the matching CSS in a later visual pass. Do not pop `stash@{0}`.

### IN-02: Blog populated branch links to routes that do not exist

**File:** `src/pages/blog/index.astro:24-29`
**Also:** `src/pages/zh/blog/index.astro:24-29`
**Issue:** With zero markdown posts the empty state (`copy.blogEmpty`) is correct. The `posts.length > 0` branch links to `/blog/${post.id}/` and `/zh/blog/${post.id}/`, but there is no `src/pages/blog/[...].astro` (or ZH equivalent). Adding a post would list dead links. ZH also hardcodes `/zh/blog/` instead of `localizedPath(locale, \`/blog/${post.id}/\`)`.
**Fix:** When blog posts ship, add matching EN/ZH post routes and build hrefs with `localizedPath`. Until then the empty branch is the only live path.

### IN-03: ToolCard `locale` is optional while Footer/RelatedTools require it

**File:** `src/components/ToolCard.astro:8-12`
**Issue:** Plan allowed `locale?: Locale` default `'en'` so EN catalog cards keep working without a prop. Footer and RelatedTools require `locale`. A future ZH surface that forgets `locale={locale}` silently emits English labels and `/tools/…` hrefs — the exact Pitfall 3 this phase fixed on the seven ZH routes.
**Fix:** Make `locale` required on ToolCard (same as Footer) and pass `locale={locale}` from EN home and EN tools index.

---

_Reviewed: 2026-09-20T12:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
