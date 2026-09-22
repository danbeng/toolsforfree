# Architecture Research

**Domain:** Publishing an already-built Astro 7 static bilingual catalog (no app redesign)
**Researched:** 2026-09-23
**Confidence:** HIGH

This milestone integrates publish/ship into the existing SSG site. It does not add a server, an API, SSR, or a new framework. The site stays `output: 'static'` (Astro default; `astro.config.mjs` does not set `output`).

## Standard Architecture

### System Overview

```text
┌──────────────────────────────────────────────────────────────────┐
│  User-supplied (never invented in code or docs)                 │
│  GitHub owner/repo · apex domain · DNS login · host account     │
├──────────────────────────────────────────────────────────────────┤
│  Repo (modified files only)                                     │
│  site.ts origin ──► BaseLayout canonical + hreflang             │
│  astro.config site ─► sitemap-*.xml + robots.txt.ts             │
│  404.astro path ──► LangSwitch href + hreflang (baked in HTML)  │
│  ToolCard / RelatedTools ──► ui.tools[slug] (throws if missing) │
│  .github/workflows/ci.yml  (already: test + build, no deploy)   │
├──────────────────────────────────────────────────────────────────┤
│  Build artifact: dist/  (trailingSlash always → page/index.html)│
│  dist/404.html already exists (confirmed in this repo)          │
├──────────────────────────────────────────────────────────────────┤
│  Outside the app                                                │
│  git remote + push main + tag v1.2  →  GitHub Actions CI        │
│  static host reads dist/  →  *.pages.dev / *.netlify.app first  │
│  DNS CNAME / nameservers  →  custom domain + TLS                │
└──────────────────────────────────────────────────────────────────┘
```

Nothing in this diagram is a new runtime component inside `src/`. Host, DNS, and GitHub are accounts and config. The only code changes are two small guards plus a paired origin string once the user names a domain.

### Component Responsibilities

| Component | Responsibility | Typical implementation in this repo |
|-----------|----------------|-------------------------------------|
| `src/data/site.ts` `SITE_ORIGIN` | Absolute origin for layout canonical and hreflang | String constant. Today `https://example.com`. Consumed only by `BaseLayout.astro`. |
| `astro.config.mjs` `site` | Absolute origin for sitemap and `Astro.site` | Same placeholder. `@astrojs/sitemap` and `src/pages/robots.txt.ts` read this, not `SITE_ORIGIN`. |
| `BaseLayout.astro` | Bakes canonical + en / zh-Hans / x-default from `path` + `SITE_ORIGIN` | `new URL(switchLocalePath(path, locale), SITE_ORIGIN)`. Does not read `Astro.site`. |
| `LangSwitch.astro` | Bakes locale `href` from the **request pathname at build**, not from the `path` prop | `switchLocalePath(Astro.url.pathname, loc)`. Header mounts it on every page, including 404. |
| `src/pages/404.astro` | Only 404 route. Passes `path="/404/"` and `localeFromPathname` | No `src/pages/zh/404.astro`. Built file is `dist/404.html`. |
| `ToolCard.astro` / `RelatedTools.astro` | Catalog labels from `t(locale).tools[slug]` | Cast hides a missing key; `.name` throws. Registry `tool.name` is no longer used for display. |
| `.github/workflows/ci.yml` | Prove `npm ci`, `npm test`, `npm run build` on push/PR to `main` | Already written. Does not deploy. Does not run until a remote exists and `main` is pushed. |
| Static host | Serve `dist/` as files. Map unknown paths to `404.html`. Attach the custom domain. | Not in the repo. No adapter. |
| DNS | Point the user-owned name at that host | Not in the repo. Apex vs `www` is a DNS-provider constraint, not an Astro one. |

## Recommended Project Structure

Do not add folders for this milestone. Keep the existing tree.

```text
astro.config.mjs                 # MODIFY site when user names the domain
src/data/site.ts                 # MODIFY SITE_ORIGIN to the same absolute origin
src/layouts/BaseLayout.astro     # MODIFY only if 404 must suppress hreflang
src/pages/404.astro              # MODIFY path passed into BaseLayout (preferred)
src/components/ToolCard.astro    # MODIFY missing-copy guard
src/components/RelatedTools.astro# MODIFY same guard (WR-01 names both)
src/i18n/path.ts                 # unchanged; do not special-case 404 here
src/components/LangSwitch.astro  # unchanged if 404 stops being a localizable path
.github/workflows/ci.yml         # unchanged; optional later deploy job is a NEW file or NEW job
public/                          # do not add a second 404.html; src/pages/404.astro already emits dist/404.html
```

### New vs modified

| Kind | Path | Why |
|------|------|-----|
| Modified | `src/data/site.ts` | Real `SITE_ORIGIN`. Layout ignores `astro.config` `site`. |
| Modified | `astro.config.mjs` | Real `site`. Sitemap and `robots.txt.ts` ignore `SITE_ORIGIN`. |
| Modified | `src/pages/404.astro` | Stop passing `path="/404/"`, which is what advertises `/zh/404/`. |
| Modified | `src/components/ToolCard.astro` | Do not throw when `copy.tools[slug]` is missing. |
| Modified | `src/components/RelatedTools.astro` | Same throw on `.name`. Milestone text names ToolCard; the review names both. Fix both or the related-tools list still crashes. |
| Unchanged | `.github/workflows/ci.yml` | Already the CI contract. A remote makes it run. Do not fold deploy into this job. |
| Unchanged | `src/components/LangSwitch.astro`, `src/i18n/path.ts`, `src/pages/robots.txt.ts` | They are correct if callers stop feeding a phantom path and both origins match. |
| New, outside the app | Git remote, host project, DNS records | User accounts. Not source files. |
| Optional new, only if CI must also publish | A deploy workflow or `wrangler.jsonc` | Not required to meet "push to main runs tests and the build." Prefer the host's Git connection so CI stays a gate, not a publisher. |
| Do not add | `@astrojs/cloudflare`, `@astrojs/netlify`, `@astrojs/vercel`, SSR `output`, API routes | Static file hosting only. Adapters are for on-demand rendering. |

### Structure rationale

- **Two origin constants stay two files.** Collapsing them into an import from `site.ts` inside `astro.config.mjs` is possible but not required, and Astro config currently imports no app module. The ship requirement is that the two strings agree, not that a new shared module exists.
- **404 stays one page.** Do not add `src/pages/zh/404.astro`. Phase 12 locked that absence. The bug is the advertised alternate, not the missing file.
- **Host config stays out of `src/`.** DNS and the host dashboard are the integration. A `wrangler.jsonc` or `netlify.toml` is optional documentation of build settings, not application architecture.

## Architectural Patterns

### Pattern 1: Paired origins, not one runtime source

**What:** Canonical and hreflang use `SITE_ORIGIN`. Sitemap and robots use Astro `site`. They are independent strings today, both `https://example.com`.

**When to use:** Whenever the public origin changes. Change both in the same commit, after the user names the domain, before or in the same release as the host cutover. Never change only one.

**Trade-offs:** Two assignments can drift. A shared import would remove drift but couples `astro.config.mjs` to `src/data/site.ts` and still would not update DNS. For this milestone, a same-commit pair is the smaller change. Do not invent a build-time env var; this repo has no `.env` and tool logic must not grow a server config surface.

**Evidence in this repo:**

```typescript
// src/data/site.ts — layout only
export const SITE_ORIGIN = 'https://example.com';
```

```javascript
// astro.config.mjs — sitemap + Astro.site only
site: 'https://example.com',
trailingSlash: 'always',
```

```astro
---
// src/layouts/BaseLayout.astro — does not read Astro.site
const canonical = new URL(switchLocalePath(path, locale), SITE_ORIGIN).href;
---
<link rel="canonical" href={canonical} />
<link rel="alternate" hreflang={LOCALE_META.zh.hreflang} href={new URL(switchLocalePath(path, 'zh'), SITE_ORIGIN).href} />
```

```typescript
// src/pages/robots.txt.ts — Astro.site, which comes from astro.config site
export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
```

`CONTACT_EMAIL` (`hello@example.com`) is a third placeholder, rendered on about/privacy via `fill()`. It is not part of the origin agreement. Do not silently rewrite it unless the user supplies an address. Leaving `hello@example.com` on a live domain is a content bug, not a canonical bug.

### Pattern 2: 404 is not a localizable path

**What:** `LangSwitch` does not receive the layout `path` prop. It calls `switchLocalePath(Astro.url.pathname, loc)`. At SSG, `src/pages/404.astro` is built with pathname `/404/`, so the Chinese link is `/zh/404/` even though locale detection on that pathname returns `en`.

**Confirmed in `dist/404.html`:**

- `rel="canonical"` → `https://example.com/404/`
- `hreflang="zh-Hans"` → `https://example.com/zh/404/`
- LangSwitch → `<a href="/zh/404/" hreflang="zh-Hans">`

There is no `src/pages/zh/404.astro`. Astro emits one `404.html` for the site, not a localized pair. [Astro pages](https://docs.astro.build/en/basics/astro-pages/) say a `src/pages/404.astro` builds to `404.html` and most deploy services use it. This repo's `dist/404.html` matches that. `trailingSlash: 'always'` did not turn it into `404/index.html`.

**When to use:** On this 404 page only. Real routes (`/tools/json-formatter/`, `/zh/tools/json-formatter/`) must keep reciprocal `switchLocalePath` links.

**Preferred fix:** Pass a path that exists in both locales into `BaseLayout`, and do not let the 404 document be the switch target. The Phase 12 review's `path="/"` does that: LangSwitch still reads `Astro.url.pathname` (`/404/`), so changing only the `path` prop fixes hreflang/canonical and leaves the visible 中文 link on `/zh/404/`.

That means a complete fix touches both producers:

1. `src/pages/404.astro` — stop passing `path="/404/"`. Pass `/` so canonical and hreflang point at `/` and `/zh/`, which exist (`src/pages/index.astro`, `src/pages/zh/index.astro`). Add `noindex` if the layout grows an optional prop; do not add it by inventing a second layout.
2. `LangSwitch` on this page only — it must not use `Astro.url.pathname` when that pathname is the 404 document. Smallest hook: an optional prop defaulting to `Astro.url.pathname`, set to `/` from `404.astro` via `Header`. Do not special-case `/404/` inside `switchLocalePath`; that function is the locale kernel for every real route.

Do not "fix" this by adding `src/pages/zh/404.astro`. A static host serves one `404.html` for unknown URLs, including unknown `/zh/...` URLs. A second file would not be selected by the host, and the milestone forbids advertising a route that does not exist.

**Trade-off of pointing 404 alternates at home:** The 404 document's canonical becomes the homepage. That is acceptable if the response is `noindex`. It is better than a canonical of `/404/` plus an alternate that 404s again. Omitting the hreflang trio on 404 (review's other option) is also correct and avoids declaring the homepage as the canonical of an error page. Prefer omit-alternates-plus-noindex if `BaseLayout` can take a flag without changing other pages. Prefer `path="/"` only together with a LangSwitch override and `noindex`.

### Pattern 3: Missing catalog copy fails closed without a white screen

**What:** `ToolCard.astro` line 14 indexes `copy.tools[slug]` and immediately reads `.name` and `.shortDescription`. `RelatedTools.astro` line 21 does the same for `.name`. The `as keyof typeof copy.tools` cast hides a missing key. Today all 18 slugs exist in `src/i18n/ui.ts`; the crash appears when `TOOLS` gains a slug the dictionary does not have.

**When to use:** At the render boundary, not by going back to `tool.name` (English-only, which would break the ZH catalog).

**Milestone requirement vs review wording:** PROJECT.md says ToolCard must not throw. The Phase 12 review's sample `throw new Error(...)` still throws, only with a clearer message. Follow the milestone: do not throw. Skip the card, or render `tool.name` / `tool.shortDescription` from `src/data/tools.ts` as a fallback. Apply the same behavior in `RelatedTools.astro`. A compile-time `Tool['slug']` tied to the dictionary is a later tightening, not a ship blocker, and it fights the current `slug: string` registry.

**Trade-off:** A silent skip hides a content miss. A fallback to registry English is visible and cannot crash the catalog grid. Prefer fallback over skip so a half-translated tool still links. Do not add a network lookup.

### Pattern 4: CI gate, then host publish, then DNS cutover

**What:** `.github/workflows/ci.yml` triggers on `push` to `main`, `pull_request` to `main`, and `workflow_dispatch`. Permissions are `contents: read`. Steps are checkout, Node 22, `npm ci`, `npm test`, `npm run build`. No deploy step. `git remote` is absent, so this file has never run on GitHub.

**When to use:** Push `main` and the existing local tag `v1.2` first. CI going green does not require a domain, DNS, or a host. Origin replacement does not require CI to be green, but it should land in a commit CI can build before that commit is what the host serves.

**Trade-off of adding deploy to `ci.yml`:** One workflow feels simpler and couples a red test run to "no publish," which is good. It also requires host tokens in GitHub secrets and a second build if the host also builds from Git. Prefer:

- Keep `ci.yml` as the test/build gate.
- Let the static host build from the same repo (`npm run build`, publish `dist`) on `main` only, or deploy `dist` with Wrangler from a separate workflow that `needs` the CI job.

Do not make CI the only publisher unless the user already has the host token. The milestone's CI bullet is "the workflow actually runs," not "Actions uploads the site."

### Pattern 5: Static host, custom domain last

**What:** `astro build` writes `dist/`. [Astro deploy overview](https://docs.astro.build/en/guides/deploy/) lists build command `npm run build` or `astro build` and publish directory `dist` for the common hosts. A static project needs no adapter. [Netlify](https://docs.astro.build/en/guides/deploy/netlify/) says a static Astro site needs no extra configuration. [Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/) now recommends Workers for new projects and says the Cloudflare adapter is only for on-demand rendering. Static assets are `./dist`. A custom 404 on Workers needs `assets.not_found_handling: "404-page"` or the platform will not serve `404.html`.

**When to use:** After `dist/` is proven by `npm run build`. Attach the host's default hostname first (`*.pages.dev`, `*.workers.dev`, or `*.netlify.app`). Change `site` / `SITE_ORIGIN` to the custom domain only when that name is chosen. Point DNS only after the host project exists and has told the user which record to create.

**Apex vs subdomain (user-supplied DNS):** [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) require an apex name to be a Cloudflare zone on the same account (CNAME flattening). A subdomain can be a CNAME to `<project>.pages.dev` at any DNS host, but the hostname must be added in the Pages project first or the CNAME does not resolve. Workers custom domains are a different dashboard path; do not assume the Pages CNAME target if the user creates a Worker. Netlify's Astro guide does not document DNS; the host dashboard will show the record after the site exists. Do not write a fake CNAME target into the repo.

**Trailing slash:** [Astro configuration](https://docs.astro.build/en/reference/configuration-reference/) says `site` is "Your final, deployed URL" and is used for sitemap and canonical URLs. It also says trailing slashes on prerendered pages are handled by the hosting platform and may not respect `trailingSlash`. This site links with trailing slashes (`localizedPath` always adds one). After cutover, confirm the host does not 301-loop `/tools/` ↔ `/tools`. Do not flip `trailingSlash` to `'never'` in this milestone; every internal link and the ZH tree assume `'always'`.

## Data Flow

### Request flow

There is no request handler for tools. A visitor fetches a file the host already has.

```text
git push main
    ↓
GitHub Actions ci.yml: npm ci → npm test → astro build
    ↓
dist/  (index.html, zh/index.html, tools/*/index.html, 404.html, sitemap-*.xml, robots.txt)
    ↓
static host (Git build or upload of dist/)
    ↓
DNS name → host edge → file
    ↓
browser runs Preact islands; src/lib never leaves the client
```

Unknown paths are not routed by Astro in production. The host maps them to `dist/404.html`. That file was rendered as English (`localeFromPathname('/404/')` is `en`). A missing `/zh/some-typo/` still returns that same English `404.html`. That is accepted. Linking to `/zh/404/` is not, because that URL is also a miss and reloads the same file.

### Origin flow (the dual-constant bug)

```text
user-named domain
    ├─ write src/data/site.ts SITE_ORIGIN
    │     └─ BaseLayout canonical, hreflang en, hreflang zh-Hans, x-default
    └─ write astro.config.mjs site
          ├─ @astrojs/sitemap absolute <loc> and xhtml:link
          └─ robots.txt.ts Sitemap: {site}/sitemap-index.xml
```

If only `SITE_ORIGIN` changes, the HTML head is correct and `sitemap-index.xml` still lists `https://example.com/...`. If only `site` changes, crawlers see the new host in the sitemap while every page canonical still points at `example.com`. Both are wrong. Cut over both together, then redeploy `dist/`. DNS pointing at the host before this commit serves a live site whose canonical tells Google the real URL is `example.com`.

`LangSwitch` hrefs are path-only (`/zh/tools/...`). They do not embed `SITE_ORIGIN`. Origin drift does not break the language switcher. It breaks canonical, hreflang, sitemap, and robots.

### 404 link flow

```text
src/pages/404.astro
    path="/404/" ──────────────► BaseLayout
                                    switchLocalePath("/404/", "zh") → "/zh/404/"
                                    prefix SITE_ORIGIN → hreflang zh-Hans
    Astro.url.pathname "/404/" ► Header ► LangSwitch
                                    switchLocalePath("/404/", "zh") → href="/zh/404/"
src/pages/zh/404.astro           does not exist
host 404.html                    one file for every miss
```

### Catalog label flow

```text
TOOLS[].slug
    ├─ getStaticPaths → /tools/[slug]/ and /zh/tools/[slug]/   (page still builds)
    └─ ToolCard / RelatedTools
          t(locale).tools[slug]
              ├─ present → name + shortDescription
              └─ absent  → throw today (must become fallback, not throw)
```

Tool pages do not use `ToolCard` for their own title. A missing dictionary key crashes the home grid and the tools index (both locales import `ToolCard`) and the related-tools list on a tool page. It does not crash `src/lib`.

### State management

No new state. Locale remains a prop. Ads remain the compile-time `ADS_ENABLED` flag. Theme remains `localStorage` on click. Publishing adds no session, cookie, or server store.

### Key data flows

1. **CI:** `main` push is the only event that matters for the milestone. The workflow file is already on `main` locally; it runs only after that commit is on a GitHub remote.
2. **Origin:** two write sites, three readers (`BaseLayout`, sitemap, robots). Agreement is a commit invariant, not a runtime lookup.
3. **404 alternates:** two writers (`path` prop and `Astro.url.pathname`). Fixing one leaves the other advertising `/zh/404/`.
4. **Labels:** `TOOLS` is the route source of truth; `ui.tools` is the display source of truth. They can drift. The UI must tolerate drift.

## Scaling Considerations

This is a static catalog. "Scale" here is deploy safety and crawl consistency, not concurrent users.

| Scale | Architecture adjustments |
|-------|--------------------------|
| First visitor on the default host URL | Serve `dist/` on the host hostname. Origins may still say `example.com` until the domain is known. No app change. |
| Custom domain cutover | One commit updates both origins. Redeploy. Then DNS. Confirm `/`, `/zh/`, `/404/` response, and that a nonsense path returns `404.html` without a link to `/zh/404/`. |
| Repeat deploys | Host builds `main` or a workflow uploads `dist/`. Do not add a server to invalidate cache. HTML is fingerprinted by Astro (`/_astro/*.css`); a new deploy replaces the files. |

### Scaling priorities

1. **First bottleneck:** origin mismatch between HTML and sitemap. Fix by pairing the two constants, not by adding a redirect worker.
2. **Second bottleneck:** host trailing-slash redirects fighting `trailingSlash: 'always'`. Fix in host settings or by verifying slash redirects once. Do not rewrite the locale path helpers.
3. **Not a bottleneck:** tool CPU, database, or SSR cold starts. There is no server.

## Anti-Patterns

### Anti-Pattern 1: Change one origin

**What people do:** Set `astro.config.mjs` `site` to the new domain and leave `SITE_ORIGIN`, or the reverse, because the names look redundant.

**Why it's wrong:** Layout and sitemap do not read the same constant. Verified: `BaseLayout.astro` imports `SITE_ORIGIN`; `robots.txt.ts` uses `site` from the config. Sitemap integration requires `site` ([sitemap guide](https://docs.astro.build/en/guides/integrations-guide/sitemap/)).

**Do this instead:** One commit, both strings, same absolute `https://` origin, no path, no trailing slash on the origin itself. Rebuild and diff `dist/sitemap-index.xml` against a page's canonical host.

### Anti-Pattern 2: Add `src/pages/zh/404.astro` to satisfy the language switch

**What people do:** Give LangSwitch a real target by creating the missing page.

**Why it's wrong:** Static hosts serve a single root `404.html` for unknown URLs. A `zh/404/index.html` is just another file; it is not what the host returns for a missing `/zh/...` URL unless extra rewrite rules are added. The milestone says do not advertise `/zh/404/` if that route does not exist. Adding the route widens scope and still does not localize host-level 404s for arbitrary ZH paths.

**Do this instead:** Keep one `404.html`. Point or omit alternates so the document does not link to `/zh/404/`.

### Anti-Pattern 3: Throw on missing tool copy

**What people do:** Replace the undefined read with `throw new Error('Missing ui.tools...')` as in the Phase 12 review sample.

**Why it's wrong:** The active requirement is "ToolCard does not throw." A build-time throw fails the catalog page for every visitor when one slug drifts. That is a louder crash, not a fix.

**Do this instead:** Fall back to `tool.name` and `tool.shortDescription`, or skip the card. Do the same in `RelatedTools.astro`.

### Anti-Pattern 4: Deploy before CI, or block CI on DNS

**What people do:** Add a deploy step to `ci.yml` before any remote exists, or refuse to push until the domain and DNS are ready.

**Why it's wrong:** CI in this file does not need a domain. DNS cannot be verified until a host project exists. A push of `main` is what makes the existing workflow run. Tag `v1.2` does not trigger `ci.yml` (`on.push.branches: [main]` and `pull_request` only). Pushing the tag is still required by the milestone, but it will not by itself turn the workflow green. A branch push or `workflow_dispatch` will.

**Do this instead:** Remote, push `main`, push tag `v1.2`, confirm the Actions run on the `main` push. Domain and DNS are a later step that does not gate that run.

### Anti-Pattern 5: Install a host adapter or switch to SSR

**What people do:** `npx astro add cloudflare` or set `output: 'server'` so the host "supports Astro."

**Why it's wrong:** Adapters exist for on-demand rendering. This site's privacy model is browser-local computation and no tool API. An adapter adds a Worker entry and a new config surface for zero product gain. Current Astro Cloudflare docs say the adapter is only if the site uses on-demand rendering.

**Do this instead:** Publish `dist/` as static assets. If the host is Cloudflare Workers, add `not_found_handling: "404-page"` so `dist/404.html` is actually used. That setting is host config, not an adapter.

### Anti-Pattern 6: Invent the GitHub owner, repo name, or CNAME target

**What people do:** Write `github.com/<guess>/devtoolbox` or a sample CNAME into README, workflow, or `public/CNAME` before the user creates the accounts.

**Why it's wrong:** The remote is execution-time user input. A wrong `CNAME` file on GitHub Pages publishes the wrong name. A guessed Pages target (`*.pages.dev`) is wrong if the user picks Netlify or Workers.

**Do this instead:** Leave owner, repo, domain, and DNS records as parameters. Document the shape (`https://<domain>` with no path; CNAME as shown by the host after the project exists).

### Anti-Pattern 7: Cut DNS over while canonical still says example.com

**What people do:** Attach the custom domain first because the site "works" on the host URL, and update origins later.

**Why it's wrong:** The first crawl of the real domain sees `rel="canonical"` and sitemap URLs on `https://example.com`, which is IANA-reserved and not this site. Google may treat the live host as a duplicate of a non-site.

**Do this instead:** Preview on the host's default hostname if needed (origins may still be placeholders there). Update both origins, rebuild, deploy that artifact, then switch DNS. Order inside the cutover: origin commit → green build → host serving that artifact → DNS.

## Integration Points

### External services

| Service | Integration pattern | Notes |
|---------|---------------------|-------|
| GitHub | `git remote add origin <user-supplied url>`, push `main` and tag `v1.2` | No remote today. Do not `gh repo create` with an invented name. Workflow already has `contents: read`; that is enough for CI. |
| GitHub Actions | Existing `.github/workflows/ci.yml` | Runs on push/PR to `main`, not on tags. Node 22 matches `package.json` engines (`^20.19.0 \|\| >=22.12.0`). |
| Static host | Git-connected build (`npm run build`, output `dist`) or upload `dist/` | No server process. Netlify: no adapter for static. Cloudflare Workers: `assets.directory: ./dist` plus `not_found_handling: "404-page"`. Cloudflare Pages Git settings from the older Pages guide: framework Astro, build `npm run build`, output `dist`. Confirm which product the user opened; Astro's current Cloudflare page recommends Workers for new projects. |
| DNS | After the host project exists, create the record the dashboard shows | Apex on Cloudflare Pages must be a Cloudflare zone. Subdomain can be an external CNAME to the host target. User supplies registrar login. |
| TLS | Host-issued certificate after the hostname is attached | Do not buy or configure a certificate in the repo. CAA records that block the host CA are a DNS concern, not an app concern. |

### Internal boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `SITE_ORIGIN` ↔ `astro.config` `site` | None today. Humans must keep them equal | Do not assume editing one updates the other. |
| `BaseLayout` `path` ↔ `LangSwitch` | No shared prop. Layout uses `path`. Switch uses `Astro.url.pathname` | 404 must override both, or the Chinese link survives a `path` fix. |
| `TOOLS` ↔ `ui.tools` | Slug string, unchecked cast | ToolCard and RelatedTools. Fallback, do not throw. |
| `ci.yml` ↔ host | None | CI green is independent of DNS. Host should build the same commit CI built. |
| `robots.txt.ts` ↔ sitemap | `new URL('sitemap-index.xml', site)` | Follows `site` only. Trailing slash on `site` is not used; config value has no path. |
| Pages ↔ `src/lib` | Browser only | Ship work must not add a route under `src/pages/api` or a server endpoint for tools. `robots.txt.ts` is the only `APIRoute`, and it stays a static file. |

## Build order

Dependencies, not a phase plan. Later steps can wait on the user; earlier steps must not wait on DNS.

1. **Code fixes that do not need a domain or a remote.** 404 LangSwitch/hreflang (both producers) and ToolCard plus RelatedTools missing-copy fallback. `npm test` and `npm run build` locally. These are independent of CI and DNS. Do them before the first public deploy so the first `404.html` on the host is not the one that links to `/zh/404/`.
2. **Git remote and push.** User supplies owner and repo. Push `main` so `ci.yml` runs. Push tag `v1.2` because the milestone asks for it, knowing the tag push does not match `on.push.branches`. Confirm the Actions run for the branch push is green. This does not require a domain.
3. **Host project on the default hostname.** User supplies the host account. Build command `npm run build`, publish `dist`. No adapter. If Workers, set `not_found_handling` to `404-page`. Smoke-test `/`, `/zh/`, a tool page, and a missing path. Canonical may still say `example.com` on this preview; that is acceptable only on the throwaway hostname.
4. **User names the domain.** Same commit: `SITE_ORIGIN` and `astro.config.mjs` `site`. Do not change `CONTACT_EMAIL` unless the user names that too. Rebuild. CI on that push must pass before cutover. Check one HTML canonical host equals a sitemap `<loc>` host equals the robots `Sitemap:` host.
5. **Custom domain and DNS.** Host project must already exist. User creates the record the host displays. Apex vs `www` is their DNS constraint (Cloudflare Pages apex needs the zone on Cloudflare). Attach TLS through the host. Do this after step 4's artifact is what the host will serve, so the first crawl of the real name does not canonicalize to `example.com`.
6. **Post-cutover check, no new code unless a check fails.** Fetch `/`, `/zh/`, `/robots.txt`, `/sitemap-index.xml`, and a nonsense path. Confirm the 404 body has no `/zh/404/` href or hreflang. Confirm the host does not redirect-loop trailing slashes. Confirm tool islands still run with no network call to an API.

Steps 1 and 2 can proceed in parallel. Step 2 does not depend on step 1 for the workflow to run, but the first green `main` should include step 1 so the host never publishes the known 404 bug. Step 5 depends on steps 3 and 4. Step 4 can be prepared as a one-line pair of edits the moment the user types the domain; it must not be guessed.

### What stays user-supplied

- GitHub owner and repository name (and whether the repo is public).
- The real apex or `www` domain. Code stores `https://` plus that host, no path.
- DNS provider login and the choice of apex vs subdomain. The host, not this repo, dictates the record type and target.
- Host account and product (Workers vs Pages vs Netlify vs other). Do not pick one in code before the user does. Any of them can serve `dist/` if unknown paths return `dist/404.html` and trailing slashes are not rewritten into a loop.
- Optional contact address. `hello@example.com` is a separate placeholder from `SITE_ORIGIN`.

## Sources

- This repo: `astro.config.mjs`, `src/data/site.ts`, `src/layouts/BaseLayout.astro`, `src/components/LangSwitch.astro`, `src/components/Header.astro`, `src/pages/404.astro`, `src/components/ToolCard.astro`, `src/components/RelatedTools.astro`, `src/i18n/path.ts`, `src/pages/robots.txt.ts`, `.github/workflows/ci.yml`, `dist/404.html` (canonical `https://example.com/404/`, hreflang zh-Hans `https://example.com/zh/404/`, LangSwitch `href="/zh/404/"`).
- Phase 12 review WR-01 and WR-02: `.planning/milestones/v1.2-phases/12-pages-langswitch/12-REVIEW.md`.
- [Astro configuration reference — `site` and `trailingSlash`](https://docs.astro.build/en/reference/configuration-reference/) (HIGH). `site` is the final deployed URL used for sitemap and canonicals. Trailing slashes on prerendered pages are handled by the host.
- [Astro pages — custom 404](https://docs.astro.build/en/basics/astro-pages/) (HIGH). `src/pages/404.astro` builds to `404.html`.
- [Astro sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) (HIGH). Requires `site` starting with `http://` or `https://`.
- [Astro deploy overview](https://docs.astro.build/en/guides/deploy/) (HIGH). Static publish directory `dist`; adapters are for on-demand rendering.
- [Deploy to Netlify](https://docs.astro.build/en/guides/deploy/netlify/) (HIGH). Static sites need no adapter; build `npm run build`, publish `dist`.
- [Deploy to Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/) (HIGH). Current guide recommends Workers for new projects; adapter only for on-demand rendering; static dir `./dist`; Workers custom 404 needs `not_found_handling: "404-page"`.
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) (HIGH for Pages DNS only). Apex must be a Cloudflare zone on the same account; subdomain may be an external CNAME added after the Pages hostname is linked. Not a substitute for the Workers custom-domain flow if that is the product the user creates.

---
*Architecture research for: shipping the existing Devtoolbox static site*
*Researched: 2026-09-23*
