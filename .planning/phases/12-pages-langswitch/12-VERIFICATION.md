---
phase: 12-pages-langswitch
verified: 2026-09-20T12:42:31Z
status: human_needed
score: 11/12 must-haves verified
covered_files:
  - .planning/REQUIREMENTS.md
  - .planning/phases/12-pages-langswitch/12-01-PLAN.md
  - .planning/phases/12-pages-langswitch/12-01-SUMMARY.md
  - astro.config.mjs
  - src/components/Footer.astro
  - src/components/Header.astro
  - src/components/LangSwitch.astro
  - src/components/RelatedTools.astro
  - src/components/ToolCard.astro
  - src/content.config.ts
  - src/content/tools/base64.md
  - src/content/tools/color-converter.md
  - src/content/tools/crontab-explainer.md
  - src/content/tools/hash-generator.md
  - src/content/tools/json-formatter.md
  - src/content/tools/jwt-decoder.md
  - src/content/tools/regex-tester.md
  - src/content/tools/unix-timestamp.md
  - src/content/tools/url-encode.md
  - src/content/tools/uuid-generator.md
  - src/i18n/pages-land.test.ts
  - src/layouts/BaseLayout.astro
  - src/pages/404.astro
  - src/pages/about.astro
  - src/pages/blog/index.astro
  - src/pages/index.astro
  - src/pages/privacy.astro
  - src/pages/terms.astro
  - src/pages/tools/[slug].astro
  - src/pages/tools/index.astro
  - src/pages/zh/about.astro
  - src/pages/zh/blog/index.astro
  - src/pages/zh/index.astro
  - src/pages/zh/privacy.astro
  - src/pages/zh/terms.astro
  - src/pages/zh/tools/[slug].astro
  - src/pages/zh/tools/index.astro
  - src/styles/global.css
covered_digest: "v1:sha256:f805302a4720ffe4f0b334c8892ead9ae5445dda3b2a571ba857c8da4c84a5e7"
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "On home in both themes, idle and aria-current LangSwitch --text on --bg and hover --accent on --bg eyeball at 4.5:1; current locale is weight 600 not an accent fill"
    expected: "Idle and current links read as --text on --bg at >=4.5:1 in light and dark; hover is --accent on --bg at >=4.5:1; current locale is weight 600 with no accent fill, underline, or pill"
    why_human: "UI-SPEC contrast is verification: backstop. Presence of CSS tokens cannot prove rendered contrast ratios."
  - test: "Desktop header order and 640px cluster: logo, Tools/Blog/About, English/中文, ThemeToggle; at 640px LangSwitch plus ThemeToggle cluster on the right with hamburger closed"
    expected: "Desktop order is logo, Tools/Blog/About, English/中文, ThemeToggle. At 640px LangSwitch + ThemeToggle sit on the right and LangSwitch stays visible with the hamburger closed."
    why_human: "CSS rules exist; actual clustering and visibility at 640px need an eyeball."
---

# Phase 12: Pages + LangSwitch Verification Report

**Phase Goal:** Visitors can browse the full ZH tree and switch EN/ZH from the header without leaving the current page equivalent
**Verified:** 2026-09-20T12:42:31Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

Roadmap success criteria (1–5) plus non-duplicate PLAN truths (6–12). PLAN items that restate a roadmap SC keep the roadmap wording. Prohibitions are reported separately and are not in the score.

| #   | Truth   | Status     | Evidence       |
| --- | ------- | ---------- | -------------- |
| 1   | Header mounts `LangSwitch.astro` (without popping `stash@{0}` Header); visitor can jump to the EN or ZH equivalent of the current URL | ✓ VERIFIED | `Header.astro` imports `LangSwitch` and mounts `<LangSwitch locale={locale} />` after `#navMenu` and before `<ThemeToggle />`. `LangSwitch.astro` hrefs are `switchLocalePath(Astro.url.pathname, loc)` over `LOCALES`. `git stash list` still shows `stash@{0}` overlay Header and `stash@{1}`. `pages-land.test.ts` mount-order test exists. |
| 2   | Header Tools/Blog/About links use `localizedPath` and stay on the page locale | ✓ VERIFIED | Required `locale: Locale` (no `?`, no `?? 'en'`). Logo `localizedPath(locale, '/')`. Nav: `localizedPath(locale, '/tools/'\|'/blog/'\|'/about/')` with `copy.navTools` / `navBlog` / `navAbout`. |
| 3   | Visitor can open committed ZH routes: home, tools index, each tool `[slug]`, about, blog, privacy, and terms | ✓ VERIFIED | Seven files under `src/pages/zh/`. Each sets `locale = 'zh'` and unprefixed logical `path` on `BaseLayout`. Named test `has the seven ZH routes` passed. |
| 4   | EN pages pass `locale` to `BaseLayout`; Footer, RelatedTools, 404, content `locale` frontmatter, and sitemap i18n align with locale | ✓ VERIFIED | All eight EN page sources include `locale=` on `BaseLayout`. Footer/RelatedTools use required `locale` + `localizedPath`. 404 uses `localeFromPathname`. Original-ten markdown has `locale: en`. `astro.config.mjs` sitemap `defaultLocale: 'en'`, `zh: 'zh-Hans'`, no `i18n.routing`. |
| 5   | `BaseLayout` sets `<html lang>` from locale and passes locale to Header and Footer | ✓ VERIFIED | Required `locale: Locale`. `lang={LOCALE_META[locale].htmlLang}`. `<Header locale={locale} />` / `<Footer locale={locale} />`. Canonical `new URL(switchLocalePath(path, locale), SITE_ORIGIN)`. hreflang trio: `en`, `zh-Hans`, `x-default` → EN. |
| 6   | LangSwitch always paints both English and 中文 from `LOCALES`; current locale is `aria-current="page"` and remains an anchor; no globe, flags, select, or empty switcher | ✓ VERIFIED | `LOCALES.map` of `<a>` with `LOCALE_META[loc].nativeLabel` (`English` / `中文`). `aria-current={loc === locale ? 'page' : undefined}`. No `<select>`, globe, or flags. `LOCALES = ['en', 'zh']`. |
| 7   | FaqList stays items-only with English h2 FAQ; neither tool slug page passes an extra FaqList prop; `FaqList.astro` is not edited | ✓ VERIFIED | Both slug pages: `<FaqList items={page.data.faq} />`, no `heading=`. `FaqList.astro` still `{ items }` only and `<h2>FAQ</h2>`. Last commit on that file is `1894858` (Phase 10); not in phase 12 commits. |
| 8   | ToolCard accepts locale; href uses `localizedPath(locale, /tools/${slug}/)`; labels use `t(locale).tools[slug]` name and shortDescription | ✓ VERIFIED | `ToolCard.astro` optional `locale?: Locale` default `'en'`; `href={localizedPath(locale, \`/tools/${tool.slug}/\`)}`; `labels.name` / `shortDescription`. ZH home and ZH tools index pass `locale={locale}`. |
| 9   | `global.css` contains UI-SPEC `.lang-switch` rules (flex, gap `var(--sp-2)`, 16px/400 idle, 600 current, accent hover text only); at max-width 640px `.lang-switch { margin-left: auto }` and `#themeToggle { margin-left: 0 }` | ✓ VERIFIED | Lines 152–179 of `src/styles/global.css` match the token block. No width/height on links, no border/background/radius/underline. |
| 10  | Blog with zero posts renders `copy.blogEmpty` only; locales are always exactly two links in `LOCALES` order en then zh | ✓ VERIFIED | `src/content/blog/` is empty except `.gitkeep`. EN and ZH blog indexes use `posts.length === 0 ? copy.blogEmpty`. `LOCALES` is `['en', 'zh']`; LangSwitch maps that array. |
| 11  | LangSwitch hrefs are pathname plus `LOCALES` only (no query-string passthrough) and never start with two slashes | ✓ VERIFIED | `href={switchLocalePath(pathname, loc)}` only — no `search` / `URLSearchParams`. `path.test.ts` `never returns a string that starts with two slashes` passed on `switchLocalePath('//evil.com', 'en')`. |
| 12  | In both themes, idle and aria-current LangSwitch `--text` on `--bg` and hover `--accent` on `--bg` eyeball at 4.5:1; current locale is weight 600 not an accent fill | ⚠️ insufficient_spec | `verification: backstop`. CSS sets `--text` / `--accent` / `font-weight: 600`. No held-out contrast measurement. Presence is not evidence. |

**Score:** 11/12 truths verified (0 present, behavior-unverified)

Hard-fence prohibitions (not in score; git-checked):

| Prohibition | Status | Evidence |
| ----------- | ------ | -------- |
| Do not commit LED ToolShell / `tool-panel__chrome` | held | `git show HEAD:src/components/ToolShell.tsx` has no `tool-panel__chrome`. Working tree is dirty with LED chrome — uncommitted, as required. Phase commits `e78f040` / `959c3d2` / `4145f62` do not list `ToolShell.tsx`. |
| Do not commit `src/lib/crontab.ts` | held | File is tracked but phase commits do not touch it. Working tree `M src/lib/crontab.ts` remains uncommitted. |
| Do not pop `stash@{0}` or `stash@{1}` | held | `git stash list`: `stash@{0}` overlay chrome, `stash@{1}` unrelated i18n. |
| Path-limited git add only — never `git add -A` | held | Union of phase commit paths is the PLAN allowlist. No `src/components/tools/`, no `FaqList.astro`, no `ToolShell.tsx`, no `crontab.ts`. |
| No `SITE_ORIGIN` change, no `gh repo create`, no new catalog tools, no Tailwind, no new npm packages | held | `SITE_ORIGIN` still `https://example.com`. `package.json` last dep change is v1.0. No playwright/tailwind. |
| Do not rewire ToolIsland / original-ten islands this phase | held | `git log e78f040^..4145f62 -- src/components/tools/` empty. `ToolIsland.astro` still passes `locale` only to the later eight islands. Slug pages passing `locale={locale}` into ToolIsland does not rewrite the island file. |
| Do not edit `FaqList.astro` (items-only) | held | Unchanged since Phase 10. |
| Isolation none; sequential on dirty main | held | Work landed on `main` with overlay files still dirty. |
| Full overlay-free `astro build` is Phase 14 | held | Not treated as a Phase 12 gate. |
| Do not enable Astro `i18n.routing` | held | `astro.config.mjs` has sitemap `i18n` only. |
| Do not create `src/i18n/index.ts` | held | File absent. |
| Do not add Playwright | held | Not in `package.json`. |

### Required Artifacts

| Artifact | Expected    | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/components/LangSwitch.astro` | LOCALES map, switchLocalePath hrefs, nativeLabel, aria-current | ✓ VERIFIED | 25 lines. Wired from Header. |
| `src/components/Header.astro` | Required locale, localizedPath logo/nav, LangSwitch before ThemeToggle outside `#navMenu` | ✓ VERIFIED | 29 lines. Mount order: logo, NavMenu, `#navMenu`, LangSwitch, ThemeToggle. |
| `src/layouts/BaseLayout.astro` | Required locale, htmlLang, switchLocalePath canonical, hreflang trio, Header/Footer locale | ✓ VERIFIED | 42 lines. |
| `src/styles/global.css` | Verbatim `.lang-switch` plus mobile ThemeToggle `margin-left: 0` | ✓ VERIFIED | 420 lines; token block at 152–179. |
| `src/pages/zh/index.astro` | ZH home locale zh, unprefixed path, ToolCard locale | ✓ VERIFIED | `path="/"` `locale={locale}` `ToolCard locale={locale}`. |
| `src/pages/zh/tools/index.astro` | ZH tools index | ✓ VERIFIED | `path="/tools/"` + ToolCard locale. |
| `src/pages/zh/tools/[slug].astro` | ZH tool slug, FaqList items-only | ✓ VERIFIED | Unprefixed `/tools/${slug}/`; FaqList items only; RelatedTools locale. |
| `src/pages/zh/about.astro` | ZH about | ✓ VERIFIED | `path="/about/"`. |
| `src/pages/zh/blog/index.astro` | ZH blog plus `copy.blogEmpty` when no posts | ✓ VERIFIED | Empty-state branch live (zero posts). |
| `src/pages/zh/privacy.astro` | ZH privacy | ✓ VERIFIED | `path="/privacy/"`. |
| `src/pages/zh/terms.astro` | ZH terms | ✓ VERIFIED | `path="/terms/"`. |
| `src/pages/index.astro` | EN home locale pass | ✓ VERIFIED | `const locale = 'en' as const`; `locale={locale}`. |
| `src/pages/tools/index.astro` | EN tools index locale pass | ✓ VERIFIED | Same. |
| `src/pages/tools/[slug].astro` | EN slug locale plus FaqList items-only | ✓ VERIFIED | `locale={locale}`; FaqList items only. |
| `src/pages/404.astro` | localeFromPathname plus localized 404 copy | ✓ VERIFIED | `localeFromPathname(Astro.url.pathname)`; notFound copy; CTA `localizedPath(locale, '/tools/')`. |
| `src/components/Footer.astro` | Required locale plus localizedPath footer links | ✓ VERIFIED | privacy/terms/about via `localizedPath`. |
| `src/components/RelatedTools.astro` | locale plus localizedPath related hrefs | ✓ VERIFIED | `copy.related` + localized tool hrefs. |
| `src/components/ToolCard.astro` | locale plus localizedPath catalog hrefs | ✓ VERIFIED | Default `'en'`; ZH callers pass locale. |
| `src/content.config.ts` | toolPages locale enum en\|zh | ✓ VERIFIED | `locale: z.enum(['en', 'zh'])`. |
| `astro.config.mjs` | sitemap i18n defaultLocale en, zh zh-Hans; no i18n.routing | ✓ VERIFIED | 20 lines. |
| `src/i18n/pages-land.test.ts` | File-read land asserts | ✓ VERIFIED | 159 lines; 12 collected tests. |

**Artifacts:** 21/21 verified

### Key Link Verification

| From | To  | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `src/components/Header.astro` | `src/components/LangSwitch.astro` | `LangSwitch locale={locale}` immediately before ThemeToggle, outside `#navMenu` | ✓ WIRED | Import line 5; mount line 26 after `#navMenu` (21–25), before ThemeToggle (27). |
| `src/layouts/BaseLayout.astro` | `src/i18n/path.ts` | canonical and hreflang via `switchLocalePath(path, locale\|en\|zh)`, never raw path | ✓ WIRED | Import line 8; canonical line 19; three alternates lines 31–33. |
| `src/layouts/BaseLayout.astro` | `src/i18n/locales.ts` | `html lang={LOCALE_META[locale].htmlLang}` | ✓ WIRED | Lines 7, 23, 31–32. |
| `src/components/LangSwitch.astro` | `src/i18n/path.ts` | `href={switchLocalePath(Astro.url.pathname, loc)}` | ✓ WIRED | Lines 3, 11, 17. |
| `src/components/ToolCard.astro` | `src/i18n/path.ts` | `href={localizedPath(locale, `/tools/${tool.slug}/`)}` | ✓ WIRED | Lines 4, 16. |
| `src/pages/zh/index.astro` | `src/layouts/BaseLayout.astro` | `locale={locale}` with unprefixed `path="/"` | ✓ WIRED | Line 14. |
| `astro.config.mjs` | `@astrojs/sitemap` | `i18n.defaultLocale` en and `locales.zh` zh-Hans | ✓ WIRED | Lines 10–17. |

**Wiring:** 7/7 connections verified

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| LangSwitch | link text / href | `LOCALES` + `LOCALE_META.nativeLabel` + `switchLocalePath(pathname, loc)` | Yes — kernel constants, not mocks | ✓ FLOWING |
| Header nav | labels / hrefs | `t(locale)` + `localizedPath` | Yes — `src/i18n/ui.ts` | ✓ FLOWING |
| ToolCard | name, shortDescription, href | `t(locale).tools[slug]` + `localizedPath` | Yes — ui dict; catalog cards on ZH home/index pass locale | ✓ FLOWING |
| BaseLayout | canonical, hreflang, html lang | `switchLocalePath` + `SITE_ORIGIN` + `LOCALE_META` | Yes — `https://example.com` origin | ✓ FLOWING |
| 404 | locale, copy, CTA | `localeFromPathname(Astro.url.pathname)` + `t(locale)` | Yes — pathname-derived | ✓ FLOWING |
| Blog indexes | empty state | `getCollection('blog')` (zero posts) → `copy.blogEmpty` | Yes — empty collection is the live path | ✓ FLOWING |

No hollow props on the seven ZH routes. EN home/tools index omit ToolCard `locale` and rely on the documented `'en'` default (PLAN allowed).

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| LangSwitch hrefs never start with `//` | `npx vitest run src/i18n/path.test.ts -t "never returns a string that starts with two slashes"` | 1 passed / 12 skipped | ✓ PASS |
| Seven ZH routes exist | `npx vitest run src/i18n/pages-land.test.ts -t "has the seven ZH routes"` | 1 passed / 11 skipped | ✓ PASS |
| pages-land tests exist | `npx vitest list src/i18n/pages-land.test.ts` | 12 tests collected | ✓ PASS |
| Full workspace suite | (this wave, orchestrator) `npm test` | 27 files / 188 tests passed — not re-run here | ✓ PASS (prior wave) |
| Overlay-free `astro build` | skipped | Phase 14 gate; dirty-main LED ToolShell isolation | ? SKIP |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No `scripts/**/tests/probe-*.sh`; PLAN/SUMMARY do not declare probes | SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| PAGE-01 | 12-01-PLAN.md | Header mounts `LangSwitch.astro` (do not pop `stash@{0}` Header) | ✓ SATISFIED | Header mount + stash still listed. Visual contrast is UAT, not this ID. |
| PAGE-02 | 12-01-PLAN.md | Header Tools/Blog/About links use `localizedPath` matching the page locale | ✓ SATISFIED | Header.astro lines 19–24. |
| PAGE-03 | 12-01-PLAN.md | Commit `src/pages/zh/` (home, tools, `[slug]`, about, blog, privacy, terms) | ✓ SATISFIED | Seven files committed in `e78f040` / `959c3d2`. |
| PAGE-04 | 12-01-PLAN.md | EN pages pass `locale` to `BaseLayout`; Footer / RelatedTools / 404 / content `locale` frontmatter / sitemap i18n align | ✓ SATISFIED | EN pages + Footer + RelatedTools + 404 + original-ten `locale: en` + sitemap i18n. |
| PAGE-05 | 12-01-PLAN.md | `BaseLayout` sets `<html lang>` from locale and passes locale to Header / Footer | ✓ SATISFIED | BaseLayout.astro lines 15, 23, 36, 40. |

**Coverage:** 5/5 requirements satisfied. No orphaned Phase 12 IDs. ISLE-* and CI-* map to Phases 13–14.

### Decision Coverage

No trackable decisions in CONTEXT.md. (query `check.decision-coverage-verify` returned `skipped: true`, `total: 0`. Non-blocking.)

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `src/i18n/pages-land.test.ts` | PAGE-01..05 | 12 | 0 | no | value (source includes / indexOf / existsSync) | OK for SSG land contract |
| `src/i18n/path.test.ts` | PAGE-01 / T-12-01 | 13 | 0 | no | value (`switchLocalePath('//evil.com')`) | OK |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** file-read tests do not render HTML — acceptable for this phase's D-Discretion land asserts; runtime contrast is the backstop, not a test-quality blocker.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `src/components/ToolCard.astro` | 14–18 | Unchecked `copy.tools[slug]` (WR-01) | ⚠️ Warning | Catalog crash if `TOOLS` and `ui.tools` drift. Does not break PAGE-01..05 today (18 slugs present). |
| `src/components/RelatedTools.astro` | 21 | Same unchecked lookup (WR-01) | ⚠️ Warning | Same. |
| `src/pages/404.astro` | 12 | `path="/404/"` → LangSwitch/hreflang `/zh/404/` with no ZH 404 route (WR-02) | ⚠️ Warning | T-12-04 accepted static-host EN 404. Does not fail PAGE-01..05 for the seven committed routes. |
| `src/pages/zh/index.astro` | 15–32 | ZH home uses overlay classes with no CSS (IN-01) | ℹ️ Info | Route works; visual template diverges from EN. |
| `src/pages/blog/index.astro` / `src/pages/zh/blog/index.astro` | 24–29 | Populated branch links to missing post routes (IN-02) | ℹ️ Info | Zero posts; empty branch is the live path. |
| `src/components/ToolCard.astro` | 8–12 | Optional locale default `'en'` (IN-03) | ℹ️ Info | PLAN allowed this default. |

No `TBD` / `FIXME` / `XXX` in phase-touched source. No stub returns. Working-tree LED `tool-panel__chrome` in dirty `ToolShell.tsx` is fenced uncommitted work, not a Phase 12 stub.

### Human Verification Required

### 1. LangSwitch contrast (UI-SPEC backstop)

**Test:** On home in both themes, idle and aria-current LangSwitch `--text` on `--bg` and hover `--accent` on `--bg` eyeball at 4.5:1; current locale is weight 600 not an accent fill.
**Expected:** Idle and current links read as `--text` on `--bg` at >=4.5:1 in light and dark; hover is `--accent` on `--bg` at >=4.5:1; current locale is weight 600 with no accent fill, underline, or pill.
**Why human:** `verification: backstop`. CSS token presence cannot prove rendered contrast.

### 2. Header order and 640px cluster

**Test:** Desktop header order and 640px cluster: logo, Tools/Blog/About, English/中文, ThemeToggle; at 640px LangSwitch plus ThemeToggle cluster on the right with hamburger closed.
**Expected:** Desktop order is logo, Tools/Blog/About, English/中文, ThemeToggle. At 640px LangSwitch + ThemeToggle sit on the right and LangSwitch stays visible with the hamburger closed.
**Why human:** CSS rules exist; actual clustering and visibility at 640px need an eyeball.

Harvested from PLAN `<human-check>` on the tracer task (coverage D5). Deduped against the backstop truth — contrast is item 1; layout cluster is item 2.

### Gaps Summary

No blocking gaps. Phase goal chrome and ZH tree are present, substantive, and wired. Status is `human_needed` solely for the UI-SPEC contrast backstop and the 640px header-cluster eyeball. Overlay-free `astro build` remains Phase 14. WR-01 / WR-02 are review warnings, not must-have failures.

---

_Verified: 2026-09-20T12:42:31Z_
_Verifier: Claude (gsd-verifier)_
