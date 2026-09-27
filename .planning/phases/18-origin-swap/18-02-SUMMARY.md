---
phase: 18-origin-swap
plan: 02
subsystem: seo-origin
tags: [site-origin, canonical, sitemap, robots, github-pages]
requirements-completed: [ORIG-01, ORIG-02, ORIG-03, ORIG-04]
---

# Phase 18 Plan 02: Origin swap and live verify Summary

**Commits:**
- `3981018` feat(18-02): github.io origin and base-aware canonical, hreflang, robots — `src/data/site.ts`, `astro.config.mjs` (`site` only), `src/layouts/BaseLayout.astro`, `src/pages/robots.txt.ts`
- `16d3474` docs(18): noindex 404 carries no canonical; tighten dist gate (orchestrator)
- `d257448` fix(18-02): noindex 404 emits no canonical — `src/layouts/BaseLayout.astro` only

**Result:** `SITE_ORIGIN` and `site` are `https://danbeng.github.io`. `base` stays `/toolsforfree`, `trailingSlash` stays `always`. `CONTACT_EMAIL` unchanged (`hello@example.com`, no mailbox supplied).

**CI / Deploy:**
- `3981018`: CI 36286591154 success, Deploy 36286615080 success
- `d257448`: CI 36286977004 success, Deploy https://github.com/danbeng/toolsforfree/actions/runs/36286997144 success

**Verify:**
- `npm test`: 29 files, 204 tests pass. `npm run build`: 49 pages.
- `verify-dist.mjs all`: PASS, 49 HTML files.
- `verify-live.mjs d257448…`: PASS, 28 internal URLs returned 200 (or one 301 to slashed form then 200). Live canonicals on `/`, `/zh/`, `/tools/json-formatter/` equal `https://danbeng.github.io/toolsforfree/<path>`. Live 404 has `noindex`, no canonical, no alternates, LangSwitch to `/toolsforfree/` and `/toolsforfree/zh/`.
- Live `sitemap-0.xml`: 0 occurrences of `example.com`; `<loc>` starts with `https://danbeng.github.io/toolsforfree/`.

## Deviations

1. **404 canonical removed (D-09 amended).** The first live run failed on exactly one URL: the 404 page's canonical `https://danbeng.github.io/toolsforfree/404/` returned 404, because Astro builds `dist/404.html`, not `404/index.html`. A canonical pointing at a 404 URL also contradicts `noindex`. Noindex pages now emit no canonical and no alternates. `verify-dist.mjs` was tightened to require zero canonicals on 404.
2. **verify-live freshness check fixed.** It detected a fresh build by the absolute `https://danbeng.github.io/toolsforfree/` string, which on the 404 page only existed in the canonical. After deviation 1 it could never pass. Freshness is now `href="/toolsforfree/"` present, no `https://example.com/`, and for the 404 seed no canonical (so a stale 404 still fails). Added explicit live assertions: 404 has no canonical/alternates; seed canonicals equal the expected URL.

## Notes

- `robots.txt` at `/toolsforfree/robots.txt` is informational only. Crawlers read robots at the host root, which a project site cannot publish.
- When a custom domain arrives (next milestone), remove `base` and swap both origin constants in one commit. `withBase`/`stripBase` then become no-ops.

**Fences held:** path-limited adds; `src/lib/crontab.ts` still dirty and unstaged; stashes untouched; `ci.yml` and `deploy.yml` unchanged; no new packages; plain pushes only.
