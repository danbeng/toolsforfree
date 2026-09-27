# Phase 18: Origin swap - Context

**Gathered:** 2026-09-24
**Status:** Ready for planning
**Mode:** Auto (user chose "use github.io as origin" on 2026-09-24; remaining choices are recommended defaults)

<domain>
## Phase Boundary

Make `https://danbeng.github.io/toolsforfree/` a correct, navigable site. Swap the placeholder origin to `https://danbeng.github.io`, and make every internal link carry the `/toolsforfree` base. Covers ORIG-01..04. No custom domain, no DNS, no new pages, no new copy.

</domain>

<decisions>
## Implementation Decisions

### Origin
- **D-01:** `SITE_ORIGIN` in `src/data/site.ts` and `site` in `astro.config.mjs` both become `https://danbeng.github.io` in one commit. No path, no trailing slash. The user chose this because no domain is registered. Do not invent a custom domain.
- **D-02:** `CONTACT_EMAIL` stays `hello@example.com`. The user supplied no mailbox. Its text on pages is not an ORIG-02 failure; ORIG-02 is scoped to sitemap, robots, and canonical/hreflang.
- **D-03:** Keep `base: '/toolsforfree'`. Keep `trailingSlash: 'always'`.

### Base-aware links (new, found 2026-09-24)
- **D-04:** Phase 17 verified direct URLs only. Rebuilt `dist/` shows internal links without the base: header, footer, ToolCard, RelatedTools, home, blog index, and 404 CTA emit `/tools/...`, which 404 on the live project site. LangSwitch emits `/zh/toolsforfree/...` because it runs `switchLocalePath` on `Astro.url.pathname`, which already contains the base.
- **D-05:** Fix at the href layer. Add one base-aware helper (e.g. `withBase(path)`) that prefixes Astro's configured base (`import.meta.env.BASE_URL`), tolerating a base with or without a trailing slash, and never emitting `//`. Keep the pure logic testable by passing the base as a parameter; the component-facing wrapper reads `import.meta.env.BASE_URL`. With base `/`, output equals input. — **Reversibility:** reversible — when the next milestone removes `base`, the helper becomes a no-op; no call site changes.
- **D-06:** `localizedPath` and `switchLocalePath` keep returning logical (base-less) paths. Existing `src/i18n/path.test.ts` must pass unchanged. Do not special-case `/404/`.
- **D-07:** Add a `stripBase(pathname)` counterpart. LangSwitch strips the base from `Astro.url.pathname` before `switchLocalePath`, then applies `withBase`. `404.astro` strips the base before `localeFromPathname`. The Phase 15 LangSwitch `path="/"` override on 404 still works and still yields home links.
- **D-08:** Every internal `href` in `src/` built from a root-relative path goes through `withBase`: Header (logo + nav), Footer, ToolCard, RelatedTools, LangSwitch, `src/pages/index.astro` (category links + "View all tools"), `src/pages/zh/index.astro`, `src/pages/blog/index.astro`, `src/pages/zh/blog/index.astro`, `src/pages/404.astro` CTA. Planner should grep for any other root-relative `href` in `src/` and include it. Asset URLs Astro already prefixes (`/toolsforfree/_astro/...`) are untouched.

### Canonical, hreflang, robots
- **D-09:** BaseLayout canonical and the three alternates become `new URL(withBase(<logical path>), SITE_ORIGIN)`. Result example: `https://danbeng.github.io/toolsforfree/tools/json-formatter/`. The 404 canonical stays the logical `/404/` plus base, with no alternates and `noindex` (Phase 15).
- **D-10:** `robots.txt.ts` emits `Sitemap: https://danbeng.github.io/toolsforfree/sitemap-index.xml` (site plus base). Note in the summary: crawlers only read `robots.txt` at a host root, so on a project site this file is informational. Do not try to publish a root robots.txt.
- **D-11:** Sitemap `<loc>` already includes the base via `@astrojs/sitemap`. After the origin swap it must read `https://danbeng.github.io/toolsforfree/...`.

### Verification
- **D-12:** Local: `npm test` green; `npm run build`; grep `dist` sitemap, robots, and `<link rel="canonical"|"alternate">` for `example.com` (must be empty); grep built HTML for `href="/` that does not start with `/toolsforfree/` (must be empty, excluding `href="/toolsforfree/..."`); grep for `/zh/toolsforfree` (must be empty).
- **D-13:** Live, after deploy: `curl` with status parsing (same standard as Phase 17) for a set of hrefs actually extracted from the live home, `/zh/`, a tool page, and the 404 page. Every extracted internal link returns 200 (or one 301 to the slashed form, then 200). A 404 fails the phase.

### Claude's Discretion
- Helper name and file location (e.g. `src/i18n/path.ts` or a new `src/lib/base.ts` with a colocated test).
- Whether the ZH index's `localizedPath(...)#category-` anchors wrap before or after the hash, as long as the final href is `/toolsforfree/zh/tools/#category-...`.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/REQUIREMENTS.md` — ORIG-01..04. CUT-* are deferred.
- `.planning/ROADMAP.md` — Phase 18 goal, success criteria, notes.
- `.planning/phases/17-host-preview-on-the-platform-hostname/17-CONTEXT.md` — base, deploy, and live prefix.
- `.planning/phases/15-404-wiring-and-catalog-copy-guard/15-CONTEXT.md` — 404 LangSwitch override and noindex must keep working.
- `src/i18n/path.ts`, `src/i18n/path.test.ts` — logical path helpers and their tests.
- `src/components/LangSwitch.astro`, `Header.astro`, `Footer.astro`, `ToolCard.astro`, `RelatedTools.astro`
- `src/layouts/BaseLayout.astro`, `src/pages/robots.txt.ts`, `src/pages/404.astro`
- `src/pages/index.astro`, `src/pages/zh/index.astro`, `src/pages/blog/index.astro`, `src/pages/zh/blog/index.astro`
- `src/data/site.ts`, `astro.config.mjs`
- `.github/workflows/ci.yml` (do not edit), `.github/workflows/deploy.yml` (do not edit)

</canonical_refs>

<code_context>
## Existing Code Insights

- Astro already prefixes built asset URLs with the base. Hand-built hrefs do not.
- `Astro.url.pathname` on a built page includes the base.
- Vitest runs outside Astro; keep base logic in a pure function with an explicit base argument.
- Path-limited add. `src/lib/crontab.ts` stays dirty and unstaged. Do not commit LED ToolShell. Do not pop stashes. No new npm packages.

</code_context>

<specifics>
## Specific Ideas

Evidence from the rebuilt `dist/tools/json-formatter/index.html` on 2026-09-24 with `base: '/toolsforfree'`:
- `href="/tools/"`, `href="/about/"`, `href="/tools/base64/"` (no base)
- `href="/zh/toolsforfree/tools/json-formatter/"` (LangSwitch, base in the wrong place)
- canonical `https://example.com/tools/json-formatter/` (no base, placeholder origin)
- sitemap `<loc>https://example.com/toolsforfree/</loc>` (has base, placeholder origin)
- robots `Sitemap: https://example.com/sitemap-index.xml` (no base, placeholder origin)

</specifics>

<deferred>
## Deferred Ideas

- Custom domain, DNS, HTTPS on that domain, and removing `base` — next milestone (CUT-01..03).
- Root-level `robots.txt` for `danbeng.github.io` — would need a user-site repo; out of scope.
- Search Console — v2 (PUB-02).

</deferred>

---

*Phase: 18-origin-swap*
*Context gathered: 2026-09-24*
