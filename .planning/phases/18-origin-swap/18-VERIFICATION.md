---
phase: 18-origin-swap
verified: 2026-09-24T12:00:00Z
status: passed
score: 4/4
---

# Phase 18 Verification

**Status:** passed

| Requirement | Evidence |
|-------------|----------|
| ORIG-01 | `src/data/site.ts` `SITE_ORIGIN = 'https://danbeng.github.io'`; `astro.config.mjs` `site: 'https://danbeng.github.io'`; `base: '/toolsforfree'` and `trailingSlash: 'always'` kept. Asserted by `verify-dist.mjs origin`. |
| ORIG-02 | `verify-dist.mjs all` PASS. Live `sitemap-0.xml` has 0 `example.com`, `<loc>` under `https://danbeng.github.io/toolsforfree/`. Live robots `Sitemap: https://danbeng.github.io/toolsforfree/sitemap-index.xml`. Live canonicals on `/`, `/zh/`, `/tools/json-formatter/` include `/toolsforfree`. |
| ORIG-03 | `CONTACT_EMAIL` still `hello@example.com`. No mailbox invented. |
| ORIG-04 | `verify-dist.mjs links` PASS across 49 HTML files (every root-relative href starts with `/toolsforfree/` and exists; no `/zh/toolsforfree`). `verify-live.mjs d257448…` PASS: 28 internal URLs 200 or one 301 to slashed form; LangSwitch pairs correct on tool page and 404. `src/i18n/path.test.ts` unchanged; 204 tests pass. |

Phase 15 behavior kept: live 404 is `noindex`, has no alternates, no `/zh/404/` link, LangSwitch to the two home pages. The 404 canonical was removed (D-09 amended); see 18-02-SUMMARY.md.

Fences: `src/lib/crontab.ts` unstaged; stashes untouched; `ci.yml`/`deploy.yml` unchanged.
