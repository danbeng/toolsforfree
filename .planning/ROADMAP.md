# Roadmap: Devtoolbox

## Overview

v1.0 shipped 18 browser-local tools. v1.1 shipped visual polish on HEAD chrome. v1.2 lands the uncommitted ZH tree, LangSwitch, and i18n wiring so a visitor (and CI) can run `npm test` and `astro build` on `main` without overlay isolation — plus a GitHub Actions workflow file for those same two commands. LED ToolShell and dirty `crontab.ts` stay out of git.

## Milestones

- ✅ **v1.0 More Tools** — Phases 1-6 (shipped 2026-09-14)
- ✅ **v1.1 Frontend Polish** — Phases 7-10 (shipped 2026-09-19)
- 🚧 **v1.2 Bilingual Land** — Phases 11-14 (in progress)

## Constraints (hard fences)

These apply to every v1.2 phase. Do not plan or execute around them.

- Do not commit LED `ToolShell` / `tool-panel__chrome`
- Do not commit `src/lib/crontab.ts`
- Do not pop `stash@{0}` or `stash@{1}`
- Path-limited `git add` only — never `git add -A`
- No `SITE_ORIGIN` change, no `gh repo create`, no new catalog tools
- Stay Astro + Preact; no Tailwind

## Phases

<details>
<summary>✅ v1.0 More Tools (Phases 1-6) — SHIPPED 2026-09-14</summary>

- [x] Phase 1: Additive tool contract (1/1 plans) — completed 2026-09-11
- [x] Phase 2: Light text and generate tools (4/4 plans) — completed 2026-09-12
- [x] Phase 3: SQL formatter (1/1 plans) — completed 2026-09-13
- [x] Phase 4: Text Diff (1/1 plans) — completed 2026-09-13
- [x] Phase 5: Markdown preview (1/1 plans) — completed 2026-09-14
- [x] Phase 6: QR generate and decode (1/1 plans) — completed 2026-09-14

</details>

Archive: `.planning/milestones/v1.0-ROADMAP.md`

<details>
<summary>✅ v1.1 Frontend Polish (Phases 7-10) — SHIPPED 2026-09-19</summary>

- [x] Phase 7: Theme Foundation (1/1 plans) — completed 2026-09-16
- [x] Phase 8: Mobile Hamburger Menu (1/1 plans) — completed 2026-09-16
- [x] Phase 9: Grid & Spacing (1/1 plans) — completed 2026-09-18
- [x] Phase 10: Interactive Chrome (1/1 plans) — completed 2026-09-18

</details>

Archive: `.planning/milestones/v1.1-ROADMAP.md`

- [x] **Phase 11: i18n Kernel** - Locales, path helpers, useToolUi, and EN+ZH chrome keys (completed 2026-09-20)
- [x] **Phase 12: Pages + LangSwitch** - ZH tree, header switcher, localized nav, layout locale, sitemap i18n (completed 2026-09-20)
- [x] **Phase 13: Islands without LED** - Locale Copy/Copied on all 18 tools; no LED chrome (completed 2026-09-22)
- [ ] **Phase 14: CI Green on Main** - ci.yml plus npm test and astro build without overlay isolation

## Phase Details

### Phase 11: i18n Kernel

**Goal**: Pages and tool islands can resolve locale, localized paths, and chrome copy from one i18n kernel
**Depends on**: Phase 10 (v1.1 complete)
**Requirements**: KERN-01, KERN-02, KERN-03, KERN-04
**Success Criteria** (what must be TRUE):

  1. `locales.ts` exports `LOCALES`, `Locale`, and `LOCALE_META` with hreflang, htmlLang, and nativeLabel for EN and ZH
  2. `localizedPath`, `switchLocalePath`, and `localeFromPathname` produce EN unprefixed URLs, ZH `/zh/` URLs, and trailing slashes
  3. Tool islands can obtain `copy` / `tooLarge` / `err()` from `useToolUi` for a given locale
  4. EN and ZH chrome keys exist for home, nav Tools/Blog/About, footer, 404, langSwitch, howTo, faq, localNote, and copy/copied; `Locale` is sourced from `locales.ts`

**Plans:** 1/1 plans complete

Plans:

- [x] 11-01-PLAN.md — Locales, path helpers, ui.ts chrome, and useToolUi kernel

### Phase 12: Pages + LangSwitch

**Goal**: Visitors can browse the full ZH tree and switch EN/ZH from the header without leaving the current page equivalent
**Depends on**: Phase 11
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05
**Success Criteria** (what must be TRUE):

  1. Header mounts `LangSwitch.astro` (without popping `stash@{0}` Header); visitor can jump to the EN or ZH equivalent of the current URL
  2. Header Tools/Blog/About links use `localizedPath` and stay on the page locale
  3. Visitor can open committed ZH routes: home, tools index, each tool `[slug]`, about, blog, privacy, and terms
  4. EN pages pass `locale` to `BaseLayout`; Footer, RelatedTools, 404, content `locale` frontmatter, and sitemap i18n align with locale
  5. `BaseLayout` sets `<html lang>` from locale and passes locale to Header and Footer

**Plans:** 1/1 plans complete

Plans:

- [x] 12-01-PLAN.md — Header LangSwitch, BaseLayout locale, ZH tree, EN locale pass, sitemap i18n

**UI hint**: yes

### Phase 13: Islands without LED

**Goal**: All 18 tools show locale-correct Copy/Copied and island copy, wrapping the no-LED ToolShell
**Depends on**: Phase 11
**Requirements**: ISLE-01, ISLE-02, ISLE-03, ISLE-04
**Success Criteria** (what must be TRUE):

  1. `ToolShell` accepts `locale` and localizes Copy/Copied via `ui.ts`; committed chrome has no LED / `tool-panel__chrome`
  2. `ToolIsland` passes `locale` to all 18 islands (not only the later eight)
  3. The original ten islands use locale copy + `useToolUi` (or equivalent) and still wrap the no-LED `ToolShell`
  4. Completeness tests stay green: every catalog slug has EN+ZH markdown and a `ToolIsland` `slug ===` branch

**Plans:** 1/1 plans complete
**UI hint**: yes

Plans:

- [x] 13-01-PLAN.md — No-LED ToolShell locale Copy/Copied, ToolIsland required locale, original-ten land, later-eight ToolShell locale

### Phase 14: CI Green on Main

**Goal**: A clean `main` checkout (and a workflow file) can run `npm test` then `astro build` with no overlay isolation
**Depends on**: Phase 12, Phase 13
**Requirements**: CI-01, CI-02
**Success Criteria** (what must be TRUE):

  1. `.github/workflows/ci.yml` exists and runs Node 22, `npm ci`, `npm test`, then `astro build` (workflow file only; no remote, no `gh repo create`)
  2. On `main` without overlay isolation, `npm test` and `astro build` pass
  3. LED `ToolShell`, `tool-panel__chrome`, and `src/lib/crontab.ts` remain uncommitted; `SITE_ORIGIN` is unchanged; no new tools

**Plans:** 1/1 plans executed

Plans:

- [x] 14-01-PLAN.md — Node 22 ci.yml plus overlay-free npm test and astro build proof

## Progress

**Execution Order:**
Phases execute in numeric order: 11 → 12 → 13 → 14

Phase 12 and Phase 13 both depend on Phase 11 and can be planned in either order after 11; Phase 14 needs both.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 11. i18n Kernel | 1/1 | Complete    | 2026-09-20 |
| 12. Pages + LangSwitch | 1/1 | Complete    | 2026-09-20 |
| 13. Islands without LED | 1/1 | Complete    | 2026-09-22 |
| 14. CI Green on Main | 1/1 | In Progress|  |
