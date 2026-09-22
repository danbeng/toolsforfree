# Stack Research

**Domain:** Publish an already-built Astro 7 static bilingual catalog — GitHub remote, custom domain, static hosting. No backend.
**Researched:** 2026-09-23
**Confidence:** MEDIUM

## Recommended Stack

Publish with **zero new npm packages**. The site already emits a static `dist/`. Host that folder on **GitHub Pages** (Actions source). Create the remote with the **GitHub CLI**. Point canonicals at the domain the user names later by editing the two existing origin constants. Do not add an adapter, a host CLI, or a second build tool.

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| GitHub remote + `gh` | CLI **v2.101.0** (2026-09-15) | Create the remote the user owns, push `main` and annotated tag `v1.2` | `.github/workflows/ci.yml` cannot run until a remote exists. `gh` is a local CLI, not an npm dependency. Do not invent the owner or repo name. |
| GitHub Pages (Actions source) | Platform (DNS records verified 2026-09-23) | Serve `dist/` on a custom domain with free HTTPS | Static-only. No adapter. Serves Astro's default directory `index.html` at trailing-slash URLs, which matches `trailingSlash: 'always'`. Custom domain is a repo setting plus DNS, not a package. |
| Existing CI workflow | `actions/checkout@v4`, `actions/setup-node@v4`, Node **22** | Keep test + build as the merge gate | Already written and never run. Do not retarget it. A push of `main` is what makes it run. |
| Origin constants | unchanged mechanism | Canonical, hreflang, sitemap, `robots.txt` | `astro.config.mjs` `site` and `src/data/site.ts` `SITE_ORIGIN` are both `https://example.com`. Replace both with the same `https://` origin the user names. No env file. |

### Supporting Libraries

None. Do not install a host adapter "just in case."

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `withastro/action` | **@v6** (latest patch **v6.1.3**, 2026-09-14) | Optional deploy-workflow step: install, build, upload Pages artifact | Only inside `.github/workflows/deploy.yml`. It is an Action, not an npm dependency. Default Node is **24** — pass `node-version: 22` so deploy matches CI. |
| `actions/deploy-pages` | **@v5** (latest **v5.0.1**, 2026-09-01) | Publish the Pages artifact | Deploy job only, after CI is green. |
| `actions/upload-pages-artifact` | **@v5** (latest **v5.0.0**, 2026-04-10) | Upload `dist/` if you do not use `withastro/action` | Use this plus the existing `npm ci` / `npm test` / `npm run build` steps if you want the deploy job to reuse CI's Node 22 install exactly. Prefer this over `withastro/action` so Node stays 22 without a second installer. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `gh` v2.101.0 | `gh repo create` under the account the user authenticates, then `git push -u origin main` and `git push origin v1.2` | User must `gh auth login` first. Do not hard-code an owner. Repo should be public if the free Pages custom-domain path is required. |
| Repo Pages setting | Build source = **GitHub Actions** | Set after the first deploy workflow lands. Add the custom domain here **before** changing DNS. |
| DNS at the registrar the user already uses | Apex + `www` | Apex: A `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and AAAA `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`. Or one ALIAS/ANAME to `<user>.github.io`. `www`: CNAME to `<user>.github.io` (not `pages.github.io`). Enforce HTTPS after the certificate is ready (can take up to a day). |

## Installation

```bash
# No npm packages. Do not run npm install for this milestone.

# Remote (owner and repo name are user decisions — do not invent them)
gh auth login
gh repo create <owner>/<repo> --public --source=. --remote=origin
git push -u origin main
git push origin v1.2

# After the user names the domain, edit both constants to the same origin.
# astro.config.mjs:  site: 'https://<domain-the-user-names>'
# src/data/site.ts:  SITE_ORIGIN = 'https://<domain-the-user-names>'
# Do not set `base`. Do not add public/CNAME (Actions publishing ignores it).
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| GitHub Pages | Cloudflare Workers static assets | Only if the user already has a Cloudflare account and wants `html_handling: "force-trailing-slash"`. Current Astro docs recommend Workers over Pages, but that path wants `wrangler` as a devDependency and an API token. This milestone prefers zero new packages and no new vendor account. |
| GitHub Pages | Cloudflare Pages | Do not use for a new project. Astro's current Cloudflare guide says Cloudflare recommends Workers for new projects. Pages also redirects `/about/index.html` to `/about/` but does not document slashless `/about` the way Workers' `force-trailing-slash` does. |
| GitHub Pages | Netlify | Fine static host (`publish = "dist"`, no adapter), but it adds a second vendor and a `netlify.toml` the repo does not have. Use it only if the user already pays for Netlify or needs split testing / forms. |
| Separate `deploy.yml` | Fold deploy into `ci.yml` | Folding is smaller, but it widens `contents: read` to `pages: write` + `id-token: write` on every PR, and it deploys from pull requests unless you add more conditionals. Keep CI as the gate. |
| `actions/upload-pages-artifact@v5` after `npm run build` | `withastro/action@v6` | Use the Astro action only if you want one step to install+build+upload and you explicitly pass `node-version: 22`. Its default Node is 24, which this repo does not claim. |
| Leave `actions/checkout@v4` in CI | Bump CI to `@v7` | Do not bump CI in this milestone. v4.4.0 (2026-07-20) is still published. v7 is current for **new** workflows only. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@astrojs/cloudflare`, `@astrojs/netlify`, `@astrojs/vercel`, `@astrojs/node` | Adapters turn a static site into on-demand rendering. This site has no server. | No adapter. `output` stays the default static `dist/`. |
| `wrangler` (any version) | DevDependency plus `CLOUDFLARE_API_TOKEN` / account id. Violates "zero new packages" and adds a backend-shaped CLI for a static folder. | GitHub Pages Actions deploy. |
| `peaceiris/actions-gh-pages` **v4.1.0** | Pushes a `gh-pages` branch. That is the old Pages source. It fights an Actions-source site and needs a write token on contents. | `actions/deploy-pages@v5`. |
| `public/CNAME` | Official Pages docs: Actions publishing ignores any CNAME file. Astro's guide still shows the file; that instruction is for branch publishing. | Domain hostname in the repo Pages settings. |
| `base: '/<repo>'` | Required only for project Pages at `https://<user>.github.io/<repo>/`. A custom domain at the site root must not set `base`. A base would prefix every EN/ZH URL and break LangSwitch. | Omit `base`. Set `site` to the custom origin. |
| New npm packages, Tailwind, a new framework, an SSR adapter | Locked stack. Privacy model is browser-local; hosting is files only. | Existing Astro 7.3.2 + Preact build. |
| A backend, API route, or Pages Function | Tool computation stays in `src/lib`. `robots.txt.ts` is already a static `APIRoute` baked at build time. | Serve `dist/` as files. |
| Invented domain or GitHub owner | Both are user decisions at execution time. `example.com` must stay until the user names the real origin. | Placeholder until then. `CONTACT_EMAIL` is a separate constant — do not silently rewrite it as part of the origin swap unless the user names that mailbox too. |
| Retargeting `ci.yml` to Node 24 or `actions/setup-node@v7` | CI is already the contract (Node 22, `npm ci`, `npm test`, `npm run build`). Changing it is not required to publish. | Leave `ci.yml` alone. Pin the **new** deploy workflow independently. |

## Stack Patterns by Variant

**If the GitHub account is free and the repo is public:**

- Use GitHub Pages with a custom domain.
- Because that is the zero-package path that still serves directory indexes at trailing-slash URLs and issues HTTPS.

**If the repo must stay private:**

- Do not assume free Pages will serve it. GitHub Pages on a private repo needs a plan that allows private Pages.
- Because a private repo on a Free personal account can stop publishing. Confirm the plan before choosing Pages, or use Cloudflare Workers static assets and accept the `wrangler` devDependency.

**If the user names only an apex domain (no `www`):**

- Still add the four A records and four AAAA records, then enforce HTTPS.
- Because GitHub documents `www` as the stable name (apex IPs can change) and will redirect between apex and `www` only when both exist. Prefer asking for both names. Do not invent either name.

**If the user already has the DNS zone on Cloudflare:**

- Keep **GitHub Pages as the host**. Set the four A/AAAA records (or a CNAME for `www`) to GitHub. Leave Cloudflare proxy **DNS-only** (grey cloud) until GitHub's certificate is issued.
- Because orange-cloud proxying in front of Pages fights GitHub's HTTPS enforcement. Do not switch the origin to Workers just because the DNS zone is on Cloudflare.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Astro `^7.3.2` (installed 7.3.2) | Node `^20.19.0 \|\| >=22.12.0` | `engines` in the lockfile. CI already pins Node 22. Deploy must also use Node 22, not the Astro action's default 24. |
| `trailingSlash: 'always'` | Default `build.format: 'directory'` | Emits `about/index.html`. GitHub Pages serves that file at `/about/` and redirects `/about` to `/about/`. Do not set `build.format: 'file'`. |
| `@astrojs/sitemap` `^3.7.4` | `site` must be the real origin | Sitemap URLs and `robots.txt` `Sitemap:` line are built from `site`. Placeholder `https://example.com` will ship in the sitemap until both constants change. i18n locales stay `en` / `zh` → `zh-Hans`. |
| `actions/checkout@v4` in CI | GitHub-hosted `ubuntu-latest` | Leave it. New deploy workflow may use `actions/checkout@v7` (v7.0.1, 2026-07-20) because that file is new. Do not mix a Node 24 action runtime requirement into the existing CI file. |
| `actions/deploy-pages@v5` | `actions/upload-pages-artifact@v5` or `withastro/action@v6` | Artifact name and path must be the Pages artifact. Publish directory is `dist`, not `dist/client`. |
| `SITE_ORIGIN` and `astro.config.mjs` `site` | Each other | `BaseLayout.astro` builds canonical and hreflang from `SITE_ORIGIN`, not from `Astro.site`. Sitemap and `robots.txt.ts` use `site`. They must be the same string or SEO splits. |

## Deploy workflow shape

Keep **two workflows**. Do not edit the steps inside `ci.yml`.

| Workflow | Trigger | Permissions | Job |
|----------|---------|-------------|-----|
| `.github/workflows/ci.yml` (exists) | `push` and `pull_request` to `main`, plus `workflow_dispatch` | `contents: read` | `npm ci`, `npm test`, `npm run build`. Proves the tree. Does not publish. |
| `.github/workflows/deploy.yml` (new, YAML only) | `workflow_run` on CI completed for `main`, or `push` to `main` with a `needs`-style gate | `contents: read`, `pages: write`, `id-token: write` | Deploy **only if** CI succeeded on that SHA. Build with Node 22, upload `dist/`, `actions/deploy-pages@v5`. Environment name `github-pages`. |

Why separate: CI is already the contract and must stay read-only. Deploy needs `id-token: write` to mint a Pages deployment token. A PR should run tests and must not publish. Gating on CI avoids shipping a red `main` and avoids trusting a second, untested build path.

`workflow_run` only exists after the remote exists and the CI workflow has run at least once. First publish order: create remote, push `main` (CI goes green), add `deploy.yml`, push again.

## Integration with the existing site

| Existing piece | What publish must do |
|----------------|----------------------|
| `astro.config.mjs` `site: 'https://example.com'` | Replace with the user-named origin when they name it. Required for sitemap absolute URLs. |
| `src/data/site.ts` `SITE_ORIGIN` | Same string. `BaseLayout.astro` canonical + `hreflang` (`en`, `zh-Hans`, `x-default`) use this, not `Astro.site`. |
| `trailingSlash: 'always'` | Leave it. Do not add `base`. Do not switch `build.format`. |
| `@astrojs/sitemap` i18n `en` / `zh` → `zh-Hans` | Leave it. Host must serve `/` and `/zh/` as real directories, which Pages does. |
| `src/pages/robots.txt.ts` | No code change. It already emits `Sitemap: ${site}/sitemap-index.xml`. Wrong until `site` is real. |
| `src/pages/404.astro` | Astro emits `404.html`. GitHub Pages uses a root `404.html` as the custom error page and keeps the requested URL. Do not add a `/zh/404/` route. That is the Phase 12 bug, not a host feature. |
| `ci.yml` Node 22 | Deploy build must use Node 22 as well. `withastro/action` defaults to 24 — override it or do not use that action. |
| No `.env` | Do not add one. The origin is a source constant, not a secret. |

## Sources

- https://docs.astro.build/en/guides/deploy/github/ — static GitHub Pages path, no adapter; `actions/checkout@v7`, `withastro/action@v6`, `actions/deploy-pages@v5`; custom domain must not set `base`. Confidence MEDIUM (official docs, fetched 2026-09-23; CNAME-file sentence conflicts with GitHub's Actions-publishing rule — follow GitHub).
- https://docs.astro.build/en/guides/deploy/ — static hosts need no adapter; publish directory `dist`. Confidence MEDIUM.
- https://docs.astro.build/en/reference/configuration-reference/ — `site` drives sitemap and canonicals; `trailingSlash` does not control static hosts; pair `always` with directory format. Confidence MEDIUM.
- https://docs.astro.build/en/guides/deploy/cloudflare/ — Cloudflare recommends Workers for new projects; static Workers path wants `wrangler`. Confidence MEDIUM. Rejected for this milestone.
- https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/ — `force-trailing-slash` (page updated 2026-04-23). Confidence MEDIUM. Relevant only if Workers is chosen later.
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site — apex A/AAAA, `www` CNAME, Actions publishing ignores `CNAME`. Confidence MEDIUM.
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site — root `404.html`. Confidence MEDIUM. URL preservation is community evidence, not this page.
- https://github.com/withastro/action/releases — v6.1.3, 2026-09-14; README default Node 24. Confidence MEDIUM.
- https://github.com/actions/deploy-pages/releases — v5.0.1, 2026-09-01. Confidence MEDIUM.
- https://github.com/actions/upload-pages-artifact/releases — v5.0.0, 2026-04-10. Confidence MEDIUM.
- https://github.com/actions/checkout/releases — v7.0.1, 2026-07-20. CI stays on v4. Confidence MEDIUM.
- https://github.com/cli/cli/releases/latest — gh v2.101.0, 2026-09-15. Confidence MEDIUM.
- https://github.com/slorber/trailing-slash-guide — observed Pages behavior: `/folder` redirects to `/folder/`, `/folder/` serves `index.html`. Confidence LOW (not official). Do not treat as a spec; the directory-index match is still the reason Pages fits.

---
*Stack research for: publishing an existing Astro static bilingual site*
*Researched: 2026-09-23*
