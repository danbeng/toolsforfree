---
phase: 18-origin-swap
plan: 01
subsystem: i18n-routing
tags: [base-path, github-pages, hrefs, langswitch]
status: complete
requires: []
provides:
  - "src/i18n/base.ts: joinBase, removeBase, withBase, stripBase"
  - "Every internal href in dist carries /toolsforfree"
affects: [18-02]
tech-stack:
  added: []
  patterns:
    - "withBase(localizedPath(...)) at the href layer; path.ts stays logical"
    - "stripBase(Astro.url.pathname) before locale detection / switching"
key-files:
  created:
    - src/i18n/base.ts
    - src/i18n/base.test.ts
  modified:
    - src/components/Header.astro
    - src/components/LangSwitch.astro
    - src/components/Footer.astro
    - src/components/ToolCard.astro
    - src/components/RelatedTools.astro
    - src/pages/404.astro
    - src/pages/index.astro
    - src/pages/zh/index.astro
    - src/pages/blog/index.astro
    - src/pages/zh/blog/index.astro
decisions:
  - "Base helper lives in src/i18n/base.ts beside path.ts; pure joinBase/removeBase take base explicitly, withBase/stripBase read import.meta.env.BASE_URL"
  - "ZH home category anchors wrap withBase after the hash is appended"
metrics:
  duration: "13 min"
  completed: 2026-09-27
  tasks: 3
  files: 12
actuals:
  tokens: 3600
  tasks: 3
  commits: 3
plan_head_before: d5ca0075f3acebd7d1612a71ad7f1e6600d62f38
requirements: [ORIG-04]
---

# Phase 18 Plan 01: Base-aware internal links Summary

Every internal href now goes through a single `withBase` helper over `import.meta.env.BASE_URL`, and LangSwitch and 404 strip the base before locale logic. Built `dist/` links all resolve under `/toolsforfree/`, and `/zh/` now comes after the base.

## Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 (tracer) | Base helper through Header and LangSwitch | a6e82ec | base.ts, base.test.ts, Header.astro, LangSwitch.astro |
| 2 | Footer, ToolCard, RelatedTools, 404 CTA | d2931c1 | Footer.astro, ToolCard.astro, RelatedTools.astro, 404.astro |
| 3 | EN/ZH home and blog index links | 0189b99 | index.astro, zh/index.astro, blog/index.astro, zh/blog/index.astro |

## Verification

- `npm test`: 29 files, 204 tests pass (base.test.ts adds 13; RED confirmed before implementation, since the module was missing)
- `npm run build`: 49 pages
- `verify-dist.mjs tracer`: PASS (after each task)
- `verify-dist.mjs links`: PASS (source scan clean; every root-relative href/src in 49 HTML files starts with /toolsforfree/ and exists in dist; no /zh/toolsforfree; no doubled base)
- Task 2 targeted check: privacy, related tool, and 404 CTA links carry the base; 404 keeps noindex and has no /zh/404/ link
- Task 3 check: ZH home anchors are `/toolsforfree/zh/tools/#category-...`
- `src/i18n/path.ts`, `path.test.ts`, `.github/` unchanged vs HEAD~3
- `verify-dist.mjs origin`: FAIL (393), as expected; that gate belongs to 18-02 (example.com is still the origin)
- `src/lib/crontab.ts` still modified and unstaged; stashes untouched

## Deviations from Plan

None. The plan executed as written.

## Notes for 18-02

- BaseLayout canonical/alternates still use logical paths plus `SITE_ORIGIN` without the base. 18-02 should wrap them with `withBase` (D-09).
- Blog collection is empty, so blog post hrefs only get checked by the source scan.

## Self-Check: PASSED

- FOUND: src/i18n/base.ts, src/i18n/base.test.ts
- FOUND commits: a6e82ec, d2931c1, 0189b99
