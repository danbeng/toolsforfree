---
phase: 18-origin-swap
verified: 2026-09-27T08:33:19Z
status: passed
score: 4/4
covered_files:
  - .planning/REQUIREMENTS.md
  - .planning/phases/18-origin-swap/18-01-PLAN.md
  - .planning/phases/18-origin-swap/18-01-SUMMARY.md
  - .planning/phases/18-origin-swap/18-02-PLAN.md
  - .planning/phases/18-origin-swap/18-02-SUMMARY.md
  - astro.config.mjs
  - src/components/Footer.astro
  - src/components/Header.astro
  - src/components/LangSwitch.astro
  - src/components/RelatedTools.astro
  - src/components/ToolCard.astro
  - src/data/site.ts
  - src/i18n/base.test.ts
  - src/i18n/base.ts
  - src/layouts/BaseLayout.astro
  - src/pages/404.astro
  - src/pages/blog/index.astro
  - src/pages/index.astro
  - src/pages/robots.txt.ts
  - src/pages/zh/blog/index.astro
  - src/pages/zh/index.astro
covered_digest: "v1:sha256:e76b24d7fc7541aa2d07de7b310feba4e8588e01c8c2c4655eb0600fd6d8ccea"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: passed
  previous_score: 4/4
  gaps_closed: []
  gaps_remaining: []
  regressions: []
---

# Phase 18 Verification

**Status:** passed
**Re-verification:** Yes. The previous report was stale because both SUMMARYs gained `requirements-completed` frontmatter afterwards (commit `944cc9c`, docs only). This run re-checks against the current code and the live deploy of `71e730c`.

| Requirement | Evidence |
|-------------|----------|
| ORIG-01 | `src/data/site.ts` has `SITE_ORIGIN = 'https://danbeng.github.io'`. `astro.config.mjs` has `site: 'https://danbeng.github.io'`, and keeps `base: '/toolsforfree'` and `trailingSlash: 'always'`. Also asserted by `verify-dist.mjs all`. |
| ORIG-02 | `verify-dist.mjs all` passes on 49 HTML files. Local `dist/sitemap-0.xml` and `dist/robots.txt` have 0 `example.com`, and 0 dist files carry an `example.com` canonical or alternate. Live `sitemap-0.xml` has 0 `example.com`, and every `<loc>` starts with `https://danbeng.github.io/toolsforfree/`. Live robots reads `Sitemap: https://danbeng.github.io/toolsforfree/sitemap-index.xml`. Live canonical and en/zh-Hans/x-default alternates on `/`, `/zh/`, `/tools/json-formatter/` and `/zh/tools/json-formatter/` all equal `https://danbeng.github.io/toolsforfree/<path>`. |
| ORIG-03 | `CONTACT_EMAIL` is still `hello@example.com`. No mailbox was invented. |
| ORIG-04 | `verify-dist.mjs all` link gate passes: every root-relative href starts with `/toolsforfree/` and exists in dist, with no `/zh/toolsforfree`. No root-relative `href="/` without the base remains in `src/**/*.astro`, and there are 34 `withBase`/`stripBase` call sites. `verify-live.mjs 71e730c…` passes (Deploy run 36287923837 succeeded): all 28 extracted internal URLs return 200, or one 301 to the slashed form. The base `/` no-op case is covered by `src/i18n/base.test.ts` (`joinBase('/', p) === p`). `src/i18n/path.ts` and `path.test.ts` are unchanged since before the phase (`d5ca007`). |

Checks run: `npm test` passes all 204 tests in 29 files. `npm run build` builds 49 pages.

Phase 15 behavior is kept on the live `404.html`: it has `noindex`, no canonical, no alternates and no `/zh/404/` link, and its LangSwitch/CTA links go to `/toolsforfree/` and `/toolsforfree/zh/`. The 404 canonical was dropped on purpose under the amended D-09 (see 18-02-SUMMARY.md).

Deployed code: `origin/main` is `71e730c`, the latest successful Deploy. The only newer local commit is `944cc9c`, which touches `.planning/` docs only. Nothing in `src/`, `astro.config.mjs` or `.github/` changed between `d257448` and `71e730c`.

No TBD/FIXME/XXX markers in the phase files checked.

Fences: `src/lib/crontab.ts` is still modified and unstaged, and it is the only dirty product file. Both stashes are untouched. `.github/` (`ci.yml`, `deploy.yml`) is unchanged since `d5ca007`.
