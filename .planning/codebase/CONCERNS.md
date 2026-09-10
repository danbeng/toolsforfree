# Codebase Concerns

**Analysis Date:** 2026-09-10

## Tech Debt

**Placeholder production origin:**
- Issue: Canonical URLs, sitemap, and robots all resolve against `https://example.com` (`SITE_ORIGIN` and Astro `site`).
- Files: `src/data/site.ts`, `astro.config.mjs`, `src/layouts/BaseLayout.astro`, `src/pages/robots.txt.ts`
- Impact: Search engines index the wrong host; hreflang/canonical are useless until replaced.
- Fix approach: Set `SITE_ORIGIN` and `astro.config.mjs` `site` to the real domain in one place (prefer deriving layout canonicals from `Astro.site`).

**Placeholder contact identity:**
- Issue: `CONTACT_EMAIL` is `hello@example.com`.
- Files: `src/data/site.ts`, `src/i18n/ui.ts` (`aboutBody`)
- Impact: About/privacy copy points users at a non-inbox.
- Fix approach: Replace with a real mailbox before launch.

**Duplicated locale page trees:**
- Issue: English and Chinese routes are near-copies (`index.astro`, `tools/[slug].astro`, legal pages) that only differ by `locale = 'en' | 'zh'`.
- Files: `src/pages/index.astro`, `src/pages/zh/index.astro`, `src/pages/tools/[slug].astro`, `src/pages/zh/tools/[slug].astro`, `src/pages/about.astro`, `src/pages/zh/about.astro`, and sibling legal/blog pages
- Impact: Feature or layout changes must be applied twice; drift is likely (slug pages already duplicate ~40 lines).
- Fix approach: One parameterized layout or shared Astro fragment taking `locale`.

**Copy split across `ui.ts` and content collections:**
- Issue: Tool names/short descriptions live in `src/i18n/ui.ts`; titles, intros, how-tos, FAQs live in `src/content/tools/*.md`.
- Files: `src/i18n/ui.ts`, `src/content.config.ts`, `src/content/tools/`
- Impact: Renames and SEO copy get out of sync between cards and tool pages.
- Fix approach: Drive cards from content collection frontmatter, or generate one from the other.

**Ads scaffolding always in the DOM:**
- Issue: `ADS_ENABLED` is `false`, but `AdSlot` still renders dashed placeholders labeled “Ad” on every tool page.
- Files: `src/data/ads.ts`, `src/components/AdSlot.astro`, `src/pages/tools/[slug].astro`, `src/pages/zh/tools/[slug].astro`
- Impact: Looks unfinished; privacy copy says v1 loads no ads (`src/i18n/ui.ts`) while the UI still shows ad chrome.
- Fix approach: Do not render `AdSlot` when disabled, or hide the placeholder entirely.

**Blog collection empty:**
- Issue: `src/content/blog/` only has `.gitkeep`; index pages hard-code “Coming soon.”
- Files: `src/content/blog/.gitkeep`, `src/pages/blog/index.astro`, `src/pages/zh/blog/index.astro`
- Impact: Nav promises a blog with no posts; thin for SEO.
- Fix approach: Ship at least one post or drop the nav item until content exists.

**No lint/format/CI:**
- Issue: `package.json` has only `dev`, `build`, `preview`, `test`. No ESLint/Prettier/Biome, no `.github/` workflows, repo is not git-initialized at this root.
- Files: `package.json`
- Impact: Style and type regressions only show up locally if someone runs Vitest/Astro build.
- Fix approach: Add a formatter, `astro check`/`tsc`, and a CI job on test+build.

## Known Bugs

**Regex ReDoS / catastrophic backtracking:**
- Symptoms: Browser tab freeze on crafted patterns plus large test strings (up to 100k chars).
- Files: `src/lib/regex.ts`, `src/components/tools/RegexTester.tsx`
- Trigger: User-controlled `new RegExp(pattern, flags)` then `matchAll`/`exec` with no timeout or match cap.
- Workaround: Size cap in `src/lib/limits.ts` only limits string length, not regex cost.

**JWT decode treats binary JSON as UTF-8 via `atob`:**
- Symptoms: Some valid JWTs with non-ASCII claims decode as `Not a JWT` or garbled strings.
- Files: `src/lib/jwt.ts`
- Trigger: Payload bytes that are not Latin-1/`atob` round-trippable UTF-8.
- Workaround: None in UI; decode is advertised as not verification (`src/i18n/ui.ts`).

**Cron weekday 0 and 7 both allowed without Sunday alias docs:**
- Symptoms: `0` and `7` both pass range checks; names (`MON`) and six/seven-field cron fail with a generic message.
- Files: `src/lib/crontab.ts`
- Trigger: Quartz/systemd `@daily` or `0 0 * * * *`.
- Workaround: UI copy should stay “five-field only”; consider mapping names.

**Missing localized 404:**
- Symptoms: `/zh/...` unknown URLs use English `src/pages/404.astro` only.
- Files: `src/pages/404.astro` (no `src/pages/zh/404.astro`)
- Trigger: Broken Chinese deep links.
- Workaround: None.

## Security Considerations

**User-controlled regular expressions:**
- Risk: Client-side ReDoS can hang the origin tab (availability, not RCE).
- Files: `src/lib/regex.ts`, `src/components/tools/RegexTester.tsx`
- Current mitigation: `INPUT_MAX_CHARS` (100_000) in `src/lib/limits.ts`; no `eval`/`innerHTML` in `src/`.
- Recommendations: Cap match count, reject nested quantifiers, run matching with a time budget, disable `g`+huge haystack combinations.

**JWT “decoder” vs verification:**
- Risk: Users may treat decoded payload as authenticated identity.
- Files: `src/lib/jwt.ts`, `src/components/tools/JwtDecoder.tsx`, `src/i18n/ui.ts`
- Current mitigation: Copy states decoding is not verification; signature is ignored.
- Recommendations: Keep the warning adjacent to output; never add “verify” without a key UI.

**Third-party Google Fonts:**
- Risk: Privacy copy claims no analytics/uploads, but every page `preconnect`s and loads CSS from `fonts.googleapis.com` / `fonts.gstatic.com`.
- Files: `src/layouts/BaseLayout.astro`, `src/i18n/ui.ts` (privacy bullets)
- Current mitigation: No first-party analytics.
- Recommendations: Self-host IBM Plex / Syne or disclose the font CDN in privacy.

**Ad network future:**
- Risk: Flipping `ADS_ENABLED` without CSP/privacy updates loads third parties into tool pages that handle secrets (JWT, Base64).
- Files: `src/data/ads.ts`, `src/components/AdSlot.astro`
- Current mitigation: Flag is false; no network script.
- Recommendations: Keep ads off tool islands; update privacy before any network.

## Performance Bottlenecks

**Synchronous JSON parse/stringify on 100k input:**
- Problem: Main-thread freeze on large JSON.
- Files: `src/lib/json.ts`, `src/lib/limits.ts`
- Cause: `JSON.parse` + pretty `stringify` in `useMemo` with no worker.
- Improvement path: Web Worker or lower cap for format tools.

**Hash hex encoding:**
- Problem: `Array.from` + per-byte `toString(16)` on large SHA inputs.
- Files: `src/lib/hash.ts`
- Cause: Allocates a 32/20-element mapped array per hash; worse if input approaches 100k.
- Improvement path: Use a small lookup table or `Uint8Array` loop.

**Regex `matchAll` unbounded results:**
- Problem: Millions of matches can blow memory/DOM string in `RegexTester`.
- Files: `src/lib/regex.ts`, `src/components/tools/RegexTester.tsx`
- Cause: `[...text.matchAll(re)]` then join all matches into one output string.
- Improvement path: Cap displayed matches (e.g. 500) and report total.

**Render-blocking webfonts:**
- Problem: Extra RTT before first paint.
- Files: `src/layouts/BaseLayout.astro`
- Cause: Google Fonts stylesheet in `<head>` with no `font-display` control in-repo.
- Improvement path: Self-host with `font-display: swap`.

## Fragile Areas

**Tool slug + content + island must stay aligned:**
- Files: `src/data/tools.ts`, `src/content/tools/*.md`, `src/content/tools/zh/*.md`, `src/components/tools/ToolIsland.astro`, `src/pages/tools/[slug].astro`
- Why fragile: `getStaticPaths` from `TOOLS`; page throws if markdown missing; island switch must include every slug.
- Safe modification: Add slug to `TOOLS`, both locale markdown files (schema: 3 howTo steps, 3–5 FAQ), island component, and `ui.ts` tool copy in one PR.
- Test coverage: `src/data/tools.test.ts` covers catalog; no test that every slug has en+zh content and an island.

**Error string as i18n key:**
- Files: `src/i18n/errors.ts`, lib `error: string` returns
- Why fragile: Chinese mapping is exact English phrase match; a wording change in `src/lib/*.ts` silently shows English on zh.
- Safe modification: Use error codes (`INVALID_JSON`) not display strings.
- Test coverage: Lib tests assert English strings; no zh mapping tests.

**Astro content id matching:**
- Files: `src/pages/tools/[slug].astro` (`p.id === slug || p.id.endsWith(\`/${slug}\`)`)
- Why fragile: Relies on loader id shape for `zh/` nested files.
- Safe modification: Put `slug` in frontmatter and query that.
- Test coverage: None at page level.

## Scaling Limits

**Static page fan-out:**
- Current capacity: 10 tools × 2 locales plus a handful of marketing pages.
- Limit: Duplicated `src/pages` trees and per-tool markdown; adding locales multiplies files linearly.
- Scaling path: `[locale]/tools/[slug]` dynamic static paths from one file.

**Client-side processing:**
- Current capacity: 100_000 characters (`INPUT_MAX_CHARS`).
- Limit: Regex/JSON on low-end devices; no worker.
- Scaling path: Workers + stricter per-tool caps.

**No backend:**
- Current capacity: Pure SSG + islands.
- Limit: Cannot add accounts, saved snippets, or server-side ads consent without a new stack.
- Scaling path: Keep tools client-only; isolate any future API.

## Dependencies at Risk

**TypeScript ^7.0.2:**
- Risk: TS 7 is new relative to typical Astro/Preact typings; possible checker mismatch.
- Impact: `astro check` / editor diagnostics may lag.
- Migration plan: Pin a known-good 5.x if CI fails; otherwise lock exact version.

**Astro ^7.3.2 + Preact ^10:**
- Risk: Major Astro line; content loaders API (`astro/loaders` in `src/content.config.ts`) is the integration surface.
- Impact: Content collections break first on upgrades.
- Migration plan: Upgrade with `npx @astrojs/upgrade` and re-run Vitest + build.

**No lockfile mentioned in scripts:**
- Risk: `package.json` ranges (`^`) without CI freeze can drift installs.
- Impact: Non-reproducible builds.
- Migration plan: Commit `package-lock.json` or `pnpm-lock.yaml` and install frozen in CI.

## Missing Critical Features

**Production site identity:**
- Problem: Domain, email, and sitemap host are examples.
- Blocks: Real launch, Search Console, legal contact.

**CSP / security headers:**
- Problem: No `public/_headers`, `vercel.json`, or middleware setting CSP.
- Blocks: Hardening when fonts or ads are added.

**Localized 404 and blog content:**
- Problem: zh 404 and empty blog.
- Blocks: Polished i18n and content SEO.

**Regex safety:**
- Problem: Unbounded user RegExp.
- Blocks: Trusting the regex tool on untrusted pasted patterns.

## Test Coverage Gaps

**No component or page tests:**
- What's not tested: Preact islands (`src/components/tools/*.tsx`), Astro pages, ads flag, layout canonicals.
- Files: only `src/lib/*.test.ts`, `src/data/tools.test.ts`, `src/i18n/path.test.ts`
- Risk: UI regressions (copy, island routing) ship unnoticed.
- Priority: Medium

**Regex / JWT edge cases:**
- What's not tested: ReDoS timeouts, invalid flags, JWT with 2 or 4 segments vs 3, binary payloads.
- Files: `src/lib/regex.test.ts`, `src/lib/jwt.test.ts`
- Risk: Hang or silent decode failures.
- Priority: High (regex), Medium (JWT)

**Content completeness:**
- What's not tested: Every `TOOLS` slug has en+zh markdown matching `content.config.ts` schema.
- Files: `src/content/tools/`, `src/pages/tools/[slug].astro`
- Risk: Build throws `Missing content for {slug}` only at `astro build`.
- Priority: High

**i18n error map:**
- What's not tested: `ZH_ERRORS` coverage vs all lib error strings.
- Files: `src/i18n/errors.ts`
- Risk: Mixed-language errors on zh UI.
- Priority: Low

---

*Concerns analysis: 2026-09-10*
