# Feature Research

**Domain:** First public deploy of an already-built Astro 7 static bilingual (EN + `/zh/`) catalog. Not a tool catalog. Not a visual redesign.
**Researched:** 2026-09-23
**Confidence:** MEDIUM

## Feature Landscape

A first public deploy of a static bilingual site is not a product feature drop. Visitors already have 18 browser-local tools, EN unprefixed URLs, a `/zh/` tree, LangSwitch, and a sitemap i18n config. What they do not have is a public URL that is not a documentation placeholder, a host that serves `dist/`, or a CI run. Until those exist, canonicals, hreflang, and the sitemap all point at `https://example.com`, which IANA keeps for examples and does not design for production applications.

This milestone's five targets are the launch set. Four are table stakes. The fifth (defensive catalog copy) is a ship-blocking correctness fix, not a visitor-facing differentiator. Do not reopen tool features, theme, or a third locale.

### Table Stakes (Users Expect These)

Features a first public visitor assumes already exist. Missing these means the site is not actually published, or the bilingual graph is lying.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| GitHub remote + push `main` and local tag `v1.2` so CI runs | A workflow file that has never executed is not CI. GitHub Actions only runs after a remote exists and the triggering ref is pushed. The existing `.github/workflows/ci.yml` already triggers on `push` to `main` (and PRs / `workflow_dispatch`) and runs Node 22, `npm ci`, `npm test`, `npm run build`. | LOW | **Target 1. Table stakes.** User supplies the GitHub account and repo name. Do not invent them. Push `main` first so the workflow runs; push the existing local tag `v1.2` so the bilingual milestone is an immutable remote ref. Tag push does not itself run this workflow (it is not tag-triggered). Do not rewrite the workflow into a deploy pipeline. |
| Real domain replaces `SITE_ORIGIN` and `astro.config.mjs` `site` | Astro uses `site` to generate the sitemap and canonical URLs. `@astrojs/sitemap` refuses to emit absolute URLs without an `http://` or `https://` origin. `BaseLayout` builds canonical and hreflang with `new URL(..., SITE_ORIGIN)`. Today both are `https://example.com`. A public site whose canonicals point at a reserved example domain is not published. | LOW | **Target 2. Table stakes.** User names the domain later. Do not invent one. Change `src/data/site.ts` `SITE_ORIGIN` and `astro.config.mjs` `site` together, or sitemap and HTML disagree. `CONTACT_EMAIL` is still `hello@example.com`; update only if the user supplies a real mailbox — do not invent one. Do not change `trailingSlash: 'always'` in this milestone. |
| Static hosting that serves `dist/` on that custom domain | Astro's deploy guide treats a Git host plus a static host as the normal path: build with `astro build` / `npm run build`, publish `dist/`. Most hosts find root `404.html`. A `*.pages.dev` / `*.github.io` URL with no custom domain is a preview, not the canonical site this milestone defines. | MEDIUM | **Target 3. Table stakes.** Depends on target 2 (the hostname) and on the user owning DNS for that name. Host choice is an implementation decision, not a feature: prefer one static host that already serves directory `index.html` with trailing slashes and root `404.html` (Cloudflare Pages or GitHub Pages both do). Keep output static. No adapter. |
| 404 language switch must not link to a missing `/zh/404/` | Google ignores hreflang when the two pages do not point at each other, and alternate URLs are meant to be real localized versions. `src/pages/404.astro` passes `path="/404/"` into `BaseLayout`, so the built `404.html` advertises `hreflang="zh-Hans"` → `{origin}/zh/404/` and LangSwitch bakes `href="/zh/404/"`. There is no `src/pages/zh/404.astro`. Clicking 中文 is another miss. Hosts serve one root `404.html` for unknown paths, including unknown `/zh/…` paths. | LOW | **Target 4. Table stakes for a bilingual launch.** Fix the lie, do not add a second 404 product. Point LangSwitch / alternates at locale homes (`/`) or omit alternates on this document. Do not add `src/pages/zh/404.astro` unless a later milestone explicitly wants a localized 404 document. |
| Tool card must not throw when a catalog slug has no UI copy | A published catalog that white-screens because `TOOLS` and `ui.tools` drifted is a broken directory, not a missing nicety. `ToolCard.astro` indexes `copy.tools[slug]` and reads `.name` immediately. `RelatedTools.astro` does the same. The cast hides a missing key. Today all 18 slugs exist; the crash is latent. | LOW | **Target 5. Table stakes as a ship gate, not a visitor feature.** Fail closed: throw a build-time error naming the slug and locale, or type `Tool.slug` as a key of the UI dictionary. Same guard in `RelatedTools`. Do not restore registry `name` fields as a second copy source. |

### Differentiators (Competitive Advantage)

Not required to call the site published. Valuable only after the five launch items are real. Do not pull these into v1.3.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| HTTPS on the custom domain with a managed certificate | Visitors and Google expect TLS. Every serious static host issues this when the custom domain is attached. | LOW | Comes with target 3 on Cloudflare Pages, GitHub Pages, and Netlify. Not a separate product task unless the chosen host makes the user upload a certificate. |
| One-command rebuild from `main` | After the first deploy, a push should republish without a manual upload. Astro's deploy guide describes watching the default branch. | LOW | Enhances targets 1 and 3. Distinct from the existing test workflow. Add a deploy workflow or connect the host's Git integration only after the custom domain is the canonical origin. |
| `noindex` on the 404 document | Stops a soft-404 from being treated as a localized page. Pairs with not advertising `/zh/404/`. | LOW | Small addition to the 404 fix. Do not expand into a robots/SEO program. |
| Search Console + sitemap submit on the real origin | Confirms Google fetched the bilingual sitemap after `site` is real. | LOW | User action in Google's UI. Depends on target 2. Not a code feature. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that look like "shipping" and would expand this milestone into a rewrite or a second product.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| SSR / on-demand rendering / an Astro host adapter | "Production sites use an adapter" | This catalog is static SSG. Tool logic stays in the browser. An adapter adds a server runtime the privacy model forbids and the milestone does not need. Cloudflare's current Astro deploy page recommends Workers and an adapter only when rendering on demand. | Stay `output` static (the Astro default). Publish `dist/`. No `@astrojs/cloudflare`, Netlify, or Vercel adapter. |
| Preview deploys as a launch requirement | "Every PR should have a URL" | Preview URLs are a host extra. They do not replace a custom domain, and they do not make `example.com` canonicals correct. Requiring them blocks launch on a second product (PR apps, tokens, branch protection). | Production custom domain plus the existing CI file on `main`. Add previews later if a second contributor appears. |
| Analytics, ads, or a tag manager | "We should know if anyone visits" | Ads are already gated off (`ADS_ENABLED = false`). A tracker contradicts the "nothing is uploaded" tagline and is not a publish blocker. | Ship without analytics. Leave the ads flag false. |
| A custom 404 product beyond the LangSwitch bug | "Chinese visitors deserve a designed `/zh/404/`" | Hosts serve one root `404.html` for every unknown path. A second route does not change what GitHub Pages or Cloudflare Pages show for `/zh/missing/`. Building locale-aware 404 copy, illustrations, or search is a new page, not the WR-02 fix. | Stop linking and hreflang-ing a URL that does not exist. Keep the existing EN 404 document. |
| New catalog tools, a third language, theme animation, 4-col at 1440px, LED chrome, Tailwind | Left over from earlier milestones | Explicitly out of scope. LED `ToolShell` and dirty `src/lib/crontab.ts` stay uncommitted. | Do not stage them. Do not pop stashes. |
| Inventing the domain, GitHub repo, or contact mailbox in research or code | Unblocks the diff without waiting | `example.com` is reserved. A guessed domain becomes the canonical and sitemap origin. A guessed repo cannot receive the push. | Block those steps on user-supplied values. Research does not name them. |
| Rewriting `trailingSlash` or `build.format` to chase a host | "Cloudflare ignores trailing slashes" | `trailingSlash` does not control prerendered production URLs; the host does. This site is built `always` + directory format. Flipping to `never` + `file` rewrites every URL, sitemap entry, and LangSwitch href. | Keep `trailingSlash: 'always'`. Pick a host that redirects `…/index.html` to `…/`. Verify one EN and one `/zh/` URL after DNS, do not re-platform. |
| Making CI also deploy, or replacing CI with the host's build | "One workflow should do everything" | The existing workflow is the test gate (`npm test` + `astro build`) with `contents: read`. Folding deploy into it couples a green test run to production credentials and hides a failed publish behind a failed test. | Keep `.github/workflows/ci.yml` as the test gate. Hosting is a separate connect-or-deploy step after the origin is real. |
| Migrating to Astro's built-in `i18n` routing to "fix" 404 | Official i18n would generate locale routes | The site already uses a duplicated `src/pages/zh/` tree and `switchLocalePath`. Turning on `i18n.routing` mid-launch can 404 the unprefixed default locale or prefix URLs the sitemap already emits. | Patch the 404 `path` (or skip alternates). Do not re-platform i18n in a ship milestone. |

## Feature Dependencies

```text
User-supplied GitHub account + repo name
    └──requires──> GitHub remote + push main + push tag v1.2
                       └──enables──> Existing ci.yml actually runs
                       └──enhances──> Later: host Git integration auto-rebuilds

User-supplied domain name (not invented)
    └──requires──> SITE_ORIGIN + astro.config.mjs site
                       └──requires──> Sitemap, canonical, hreflang use the real origin
                       └──requires──> Static host custom-domain DNS
                                          └──requires──> Visitor opens the real domain over HTTPS

Existing root 404.html (already built)
    └──conflicts──> LangSwitch / hreflang advertising /zh/404/
                       └──fixed by──> Point 404 alternates at real locale homes, or omit them

TOOLS slug
    └──requires──> ui.tools[slug] for that locale
                       └──or──> ToolCard / RelatedTools throw at build instead of at render
```

### Dependency Notes

- **Remote requires a user-supplied GitHub account.** Research cannot create the remote. The workflow file is already on disk; the missing capability is a remote and a push of `main` (and the local `v1.2` tag).
- **Real origin requires a user-supplied domain.** `site` and `SITE_ORIGIN` must change in the same change, after the name exists. Building the sitemap before that bakes `https://example.com` into `sitemap-index.xml`.
- **Custom-domain hosting requires the origin and DNS the user controls.** Apex domains need the zone at the host (Cloudflare) or the host's A/ALIAS records (GitHub Pages). Subdomains are a CNAME. That is user-side setup, not a code feature.
- **CI does not require the domain.** Tests and `astro build` can go green while `site` is still `example.com`. Do not block the first CI run on DNS. Do block the public launch on the origin swap, or Google and browsers will be told the site lives at a reserved example host.
- **Hosting does not require preview deploys.** A production custom domain is the feature. PR preview URLs are optional later.
- **404 LangSwitch fix does not require a ZH 404 route.** Static hosts serve one root `404.html`. Adding `/zh/404/` would not be what a missing `/zh/…` path returns unless the host is specially configured, which this milestone should not do.
- **ToolCard guard does not require new copy.** All 18 slugs already have UI entries. The feature is a boundary check so the next slug cannot crash the catalog.
- **SSR conflicts with the privacy constraint.** Do not combine an adapter phase with this ship milestone.

## MVP Definition

### Launch With (v1.3)

The milestone is done when a visitor can open the user-named domain and a push to `main` has actually run tests and the build. These five are the launch set. All five are in scope. None are "nice to have."

- [ ] GitHub remote exists; `main` and local tag `v1.2` are pushed; `.github/workflows/ci.yml` has a green run — the workflow file is already written; without a remote it has never run
- [ ] `SITE_ORIGIN` and `astro.config.mjs` `site` are the user-named domain, not `https://example.com` — sitemap, canonical, and hreflang all read this value
- [ ] Static host serves `dist/` on that custom domain over HTTPS — directory URLs keep trailing slashes; root `404.html` is the not-found page
- [ ] 404 LangSwitch does not advertise `/zh/404/` — hreflang on that document must not point at a URL that 404s
- [ ] ToolCard (and RelatedTools) do not throw when `copy.tools[slug]` is missing — build fails with a named error, or the type system rejects the drift

### Add After Validation (v1.x)

- [ ] Host auto-rebuild on push to `main` — after the first manual or one-shot deploy proves the custom domain
- [ ] `noindex` on the 404 document — once the alternate-link lie is gone
- [ ] Search Console property on the real origin — user action, after DNS
- [ ] Real contact mailbox replacing `hello@example.com` — only when the user supplies one

### Future Consideration (v2+)

- [ ] Preview deployments per pull request — no second contributor yet; not a publish blocker
- [ ] Localized 404 document — only if a host can select it; otherwise it is unreachable
- [ ] Analytics or ads — conflicts with the privacy tagline; ads flag stays off
- [ ] Astro built-in i18n routing migration — the duplicated page tree already ships
- [ ] Three-state theme, theme animation, 4-col at 1440px, new tools, third language, LED chrome, Tailwind — already fenced

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| GitHub remote + push `main` + tag `v1.2` | HIGH | LOW | P1 |
| Real `site` / `SITE_ORIGIN` (user-named) | HIGH | LOW | P1 |
| Static host + custom domain + HTTPS | HIGH | MEDIUM | P1 |
| 404 LangSwitch does not link to `/zh/404/` | HIGH | LOW | P1 |
| ToolCard / RelatedTools missing-copy guard | MEDIUM | LOW | P1 |
| `noindex` on 404 | LOW | LOW | P2 |
| Auto-rebuild from `main` | MEDIUM | LOW | P2 |
| Search Console submit | MEDIUM | LOW | P2 |
| Preview deploys | LOW | MEDIUM | P3 |
| SSR / adapter | LOW | HIGH | Do not build |
| Analytics | LOW | LOW | Do not build |
| ZH 404 product page | LOW | MEDIUM | Do not build |
| New tools / theme / Tailwind | n/a | n/a | Out of scope |

**Priority key:**

- P1: Must have for this ship milestone
- P2: Should have after the domain answers, not before
- P3: Nice to have, future consideration

**Which of the five targets are table stakes:** all five. Targets 1–4 are what a visitor or search engine penalizes if missing (no CI, fake canonicals, no public URL, a language switch into a 404). Target 5 is table stakes as a publish gate: a catalog crash is a broken site, even though visitors will not notice the guard when copy is complete.

## Competitor Feature Analysis

Compared with how static bilingual catalogs usually first go public — not with tool competitors. The product tools are already shipped.

| Feature | Typical static catalog | Typical bilingual SSG | Our approach |
|---------|------------------------|------------------------|--------------|
| Source + CI | GitHub repo; Actions runs on the default branch | Same; workflow file is useless until the first push | Push `main` and tag `v1.2`. Keep the existing test workflow. Do not invent the repo name. |
| Canonical origin | `site` set to the real hostname before the first public build | Sitemap and hreflang use that same origin | Replace `example.com` only after the user names the domain. Keep `SITE_ORIGIN` and `site` identical. |
| Hosting | Git-connected static host, `dist/`, custom domain, managed TLS | Same; trailing-slash behavior left to the host | One static host. Do not flip `trailingSlash`. Do not add an adapter. |
| Preview URLs | Often on by default at the host | Treated as a developer convenience | Not a launch requirement. |
| 404 | Root `404.html`; hosts do not speak locales | Language switch on 404 either goes home or is omitted | Stop advertising `/zh/404/`. Do not build a second 404. |
| Catalog copy drift | Labels live next to the registry | Split copy throws if unguarded | Guard `ToolCard` and `RelatedTools`. Do not add tools. |
| Analytics | Often added at launch | Often added with the tag manager | Anti-feature here. Privacy tagline already forbids upload. |

## Sources

- Astro deploy overview (Git-connected static publish, `astro build`, `dist/`): https://docs.astro.build/en/guides/deploy/ — confidence MEDIUM (official page fetched 2026-09-23; classifier tier for web providers is MEDIUM when verified)
- Astro configuration reference (`site` generates sitemap and canonical URLs; `trailingSlash` does not control prerendered production URLs): https://docs.astro.build/en/reference/configuration-reference/ — confidence MEDIUM
- Astro sitemap integration (`site` required, must be `http://` or `https://`; i18n locales): https://docs.astro.build/en/guides/integrations-guide/sitemap/ — confidence MEDIUM
- Astro pages ( `src/pages/404.astro` builds to `404.html`; most deploy services use it): https://docs.astro.build/en/basics/astro-pages/ — confidence MEDIUM
- Astro GitHub Pages deploy (custom domain via `CNAME`, `site`, clear `base` when using a custom domain): https://docs.astro.build/en/guides/deploy/github/ — confidence MEDIUM
- GitHub Pages custom 404 (`404.html` at the site root): https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site — confidence MEDIUM
- Cloudflare Pages serving / not-found (`404.html` walk-up; missing root `404.html` is treated as an SPA): https://developers.cloudflare.com/pages/configuration/serving-pages/ — confidence MEDIUM
- Google localized versions (reciprocal hreflang or tags are ignored; alternates must be fully qualified): https://developers.google.com/search/docs/specialty/international/localized-versions — confidence MEDIUM
- IANA example domains (`example.com` is not for production applications): https://www.iana.org/help/example-domains — confidence MEDIUM
- Repo evidence: `src/data/site.ts`, `astro.config.mjs`, `.github/workflows/ci.yml`, `src/pages/404.astro`, `src/components/LangSwitch.astro`, `src/layouts/BaseLayout.astro`, `src/components/ToolCard.astro`, `.planning/milestones/v1.2-phases/12-pages-langswitch/12-REVIEW.md` (WR-01, WR-02) — confidence HIGH (read from this repo)

User-supplied, not researched: GitHub account, repository name, and the production domain. Do not invent them.

---
*Feature research for: first public deploy of an Astro static bilingual catalog*
*Researched: 2026-09-23*
