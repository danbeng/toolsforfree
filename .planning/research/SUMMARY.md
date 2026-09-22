# Project Research Summary

**Project:** Devtoolbox — v1.3 Ship
**Domain:** First public publish of an already-built Astro 7 static bilingual catalog (GitHub remote, real origin, static host, two known correctness fixes)
**Researched:** 2026-09-23
**Confidence:** MEDIUM

## Executive Summary

Devtoolbox is already a static bilingual (EN unprefixed + `/zh/`) catalog of 18 browser-local tools. v1.3 does not add tools, a theme, a locale, or a server. Experts publish this kind of site by building `dist/` with the existing `npm run build` and serving those files on a static host. The recommended host is **GitHub Pages with Actions as the source**, zero new npm packages, no adapter, and no `base`. Keep `.github/workflows/ci.yml` as a read-only test/build gate (Node 22). Publish, if Pages is the host, from a **new** `deploy.yml` that never replaces `ci.yml`.

Do the work in this order: path-limited code fixes, then an empty user-named remote, then a host preview on the platform hostname, then a paired origin swap, then DNS. GitHub owner, repo name, domain, and contact mailbox are user-supplied. Do not invent them. `SITE_ORIGIN` (`src/data/site.ts`) and `astro.config.mjs` `site` must change together, after the user names the domain, and that rebuilt artifact must be what the host serves **before** public DNS cutover. Leave `trailingSlash: 'always'` and directory format alone. Do not flip them to match a host that strips slashes; switch host instead.

The failures that rewrite history or poison the first crawl are concrete. Never `git add -A`. Do not commit `src/lib/crontab.ts` or LED `ToolShell`. Do not pop `stash@{0}` or `stash@{1}`. Push the existing annotated tag `v1.2`; do not retag or force-push. A `path="/404/"` edit is not enough: `LangSwitch` reads `Astro.url.pathname`, and there is no `src/pages/zh/404.astro`. `ToolCard` and `RelatedTools` both throw on a missing `copy.tools[slug]`; fall back, do not throw. A green Actions check is not a published site.

## Key Findings

### Recommended Stack

Stay on the locked stack. Publish the existing static `dist/` with **zero new npm packages**. GitHub Pages (Actions source) is the host because it serves directory `index.html` at trailing-slash URLs, issues HTTPS on a custom domain, and needs no adapter. Cloudflare Workers is the fallback only if the repo must stay private on a Free plan or the user already insists on Workers — and that path wants `wrangler`, which this milestone rejects. Netlify is a second vendor, not a default.

**Core technologies:**

- GitHub CLI `gh` v2.101.0: create the remote the user owns and push `main` plus tag `v1.2` — a local CLI, not an npm dependency. Do not invent owner or repo name.
- GitHub Pages (Actions source): serve `dist/` on the user-named domain — static files, no adapter, matches `trailingSlash: 'always'`.
- Existing `.github/workflows/ci.yml`: keep `actions/checkout@v4`, `actions/setup-node@v4`, Node 22, `contents: read` — already the merge gate. Do not retarget it. Do not paste a Pages deploy sample over it.
- Paired origin constants: `astro.config.mjs` `site` and `src/data/site.ts` `SITE_ORIGIN` — both `https://example.com` today. Replace both with the same `https://` origin, no path, no trailing slash on the origin. No `.env`.
- Optional new `deploy.yml` only: `actions/upload-pages-artifact@v5` after a Node 22 `npm run build`, then `actions/deploy-pages@v5`. Prefer that over `withastro/action@v6` (default Node 24). Write scopes (`pages: write`, `id-token: write`) live on the deploy workflow only.

Critical version constraint: Astro `^7.3.2` requires Node `^20.19.0 || >=22.12.0`. CI already pins 22. The deploy build and the host build must also use Node 22, not 20 and not the Astro action default of 24.

### Expected Features

This milestone is a launch set, not a product drop. All five targets are table stakes. None are nice to have.

**Must have (table stakes):**

- GitHub remote plus push of `main` and existing local tag `v1.2` so `ci.yml` actually runs — a workflow file that has never executed is not CI. Tag push does not itself trigger this workflow.
- Real domain replaces `SITE_ORIGIN` and `astro.config.mjs` `site` together — sitemap, canonical, and hreflang otherwise stay on a reserved example host.
- Static host serves `dist/` on that custom domain over HTTPS — directory URLs keep trailing slashes; root `404.html` is the not-found page. No adapter.
- 404 language switch must not advertise missing `/zh/404/` — fix both producers. Do not add `src/pages/zh/404.astro`.
- `ToolCard` and `RelatedTools` must not throw when `copy.tools[slug]` is missing — fallback to registry copy, or skip. Do not throw. Do not restore registry names as a second source of truth for the happy path.

**Should have (competitive, after the five are real):**

- Managed HTTPS — comes with the host once the custom domain is attached. Not a separate product task.
- One-command rebuild from `main` — separate deploy workflow or the host Git integration, only after the custom domain is the canonical origin. Distinct from the test workflow.
- `noindex` on the 404 document — small addition once alternates no longer point at a 404.
- Search Console plus sitemap submit — user action after DNS resolves and `dist/` no longer contains `example.com`.

**Defer (v2+):**

- Preview deploys per pull request — not a publish blocker.
- Localized 404 document — hosts serve one root `404.html`; a second route is not what unknown `/zh/...` paths return.
- Analytics, ads, tag manager — contradicts the privacy tagline. Leave `ADS_ENABLED` false.
- Astro built-in i18n routing migration — the duplicated `src/pages/zh/` tree already ships.
- New tools, third language, three-state theme, theme animation, 4-col at 1440px, LED chrome, Tailwind — fenced.

### Architecture Approach

Nothing new belongs inside `src/` except two small guards and, after the user names a domain, a paired origin string. Host, DNS, and GitHub are accounts and config. The site stays default static output. `BaseLayout` builds canonical and hreflang from `SITE_ORIGIN`. Sitemap and `robots.txt.ts` read Astro `site`. They are independent strings. Changing one splits SEO.

**Major components:**

1. `SITE_ORIGIN` plus `astro.config.mjs` `site` — two write sites, three readers (`BaseLayout`, sitemap, robots). Agreement is a commit invariant, not a shared module and not an env var.
2. `src/pages/404.astro` plus `LangSwitch` — two producers of `/zh/404/`. Layout uses the `path` prop. `LangSwitch` uses `Astro.url.pathname`. Fixing only `path="/404/"` leaves the visible Chinese link. Do not special-case `/404/` inside `switchLocalePath`. Optional override prop, set to `/` from the 404 page. Prefer omit-alternates plus `noindex` if `BaseLayout` can take a flag without changing other pages.
3. `ToolCard.astro` and `RelatedTools.astro` — both index `copy.tools[slug]` and read `.name`. Milestone says do not throw. Fall back to `tool.name` / `tool.shortDescription` so a half-translated slug still links. A compile-time `keyof` dictionary is later tightening, not a ship blocker.
4. `.github/workflows/ci.yml` — unchanged test/build gate. A remote plus a push of `main` is what makes it run. Deploy is a separate workflow or the host Git connection.
5. Static host plus DNS — outside the app. Prove `dist/` on the platform hostname first. Custom domain last, after the origin-swapped artifact is what the host will serve.

### Critical Pitfalls

1. **Path-limited add abandoned the moment a remote exists** — never `git add -A`, `git add .`, or `git commit -a`. Do not commit `src/lib/crontab.ts`. Do not commit LED `ToolShell`. Do not pop `stash@{0}` or `stash@{1}`. CI checks out the commit, not the dirty tree. Re-check this fence on every later commit.
2. **Tag `v1.2` recreated or force-pushed** — push the existing annotated tag. Record `git rev-parse v1.2` first. Push `main` first, then `git push origin refs/tags/v1.2`. No `--force`, no `--tags`, no `git tag -f`. Create the remote empty (no README). A tag push does not run `ci.yml`; that is expected, not a failed release.
3. **`https://example.com` ships in canonicals, sitemap, and robots** — change both origin constants in one commit, rebuild, grep `dist/` for `example.com`, and only then cut DNS over. Do not upload a pre-swap `dist/`. Do not invent the domain. `CONTACT_EMAIL` (`hello@example.com`) is a third placeholder: replace it only if the user supplies a mailbox; do not invent one.
4. **404 LangSwitch still links to `/zh/404/`** — `LangSwitch` reads `Astro.url.pathname`, not the layout `path` prop. Changing only `path="/404/"` fixes hreflang/canonical and leaves `href="/zh/404/"`. There is no `src/pages/zh/404.astro`. Do not add one. After the fix, a search of `dist` for `zh/404` must be empty.
5. **ToolCard and RelatedTools throw on missing copy** — a clearer `throw new Error` is still a throw. Fall back, do not throw. Apply the same behavior in both components. A missing `locale` prop on a ZH page silently renders English hrefs; if the guard phase touches `ToolCard`, make `locale` required.
6. **Trailing-slash loop, or every directory URL 404s** — do not add a slash-forcing or slash-stripping redirect rule. Do not set `base`. Do not flip `trailingSlash` to `never`. If GitHub Pages 404s slashed tool URLs, it is the wrong host; switch host. Do not paste the Astro Pages sample over `ci.yml` (it drops `npm test`, bumps checkout, defaults Node 24, and the custom-domain sample sets `base`).
7. **CI token widened, or a green test run treated as a published site** — keep `permissions: contents: read` on `ci.yml`. Write scopes belong only on a separate deploy workflow. Tokens are repository secrets, never YAML. Prove the visitor URL only after the host deploy.

## Implications for Roadmap

Five phases. Code that does not need a domain or a remote comes first, so the first public `404.html` is not the known bug. The remote does not wait on DNS. The origin swap does not ride along in the remote commit. DNS is last.

### Phase 1: 404 wiring and catalog-copy guard

**Rationale:** Both fixes are local, independent of GitHub and DNS, and must be in the tree before the first public artifact. Doing them after the host is live publishes the known Phase 12 warnings. They are small and should not be mixed into the remote-creation commit.
**Delivers:** A 404 document that does not advertise `/zh/404/` from either producer, and catalog cards that survive a missing `ui.tools` key without a white screen.
**Addresses:** Target 4 (404 LangSwitch) and target 5 (ToolCard / RelatedTools) from FEATURES.md. Optional `noindex` on the 404 document belongs here if the layout flag is cheap; otherwise it stays a follow-up, not a blocker.
**Avoids:** Pitfall 9 (prop-only 404 fix; adding `src/pages/zh/404.astro`) and Pitfall 10 (throw-as-fix; silent English ZH cards). Also the path-limit fence: this commit must not include `crontab.ts` or LED `ToolShell`.
**Implements:** Optional `LangSwitch` override (default `Astro.url.pathname`, set to `/` from `404.astro` via `Header`) plus a `path` that exists in both locales, or omit alternates. Fallback in `ToolCard.astro` and `RelatedTools.astro` to `tool.name` / `tool.shortDescription`. Do not special-case `/404/` inside `src/i18n/path.ts`.

### Phase 2: Remote and tag push

**Rationale:** `ci.yml` cannot run until a remote exists and `main` is pushed. This does not require a domain. It must not include the origin swap, a deploy step, or a guessed repo name. The user names the GitHub account, repo, and visibility before any `gh repo create`.
**Delivers:** An empty public remote (private only if the user confirms a plan that can serve private Pages — otherwise do not assume free Pages will publish it). `main` pushed. Existing annotated tag `v1.2` pushed. Actions run of the existing test workflow is green on the branch push.
**Uses:** `gh` (user already authenticated). Existing `ci.yml` unchanged: `contents: read`, checkout v4, Node 22, `npm ci`, `npm test`, `npm run build`.
**Avoids:** Pitfall 1 (path-limited add, stash pop), Pitfall 2 (secrets in YAML, widening `GITHUB_TOKEN`), Pitfall 3 (retag, `--force`, `--tags`, non-empty remote). Do not bump CI to checkout v7 or Node 24. Do not add `.nvmrc` here unless a later host phase requires it.
**Gate:** `git ls-remote origin refs/tags/v1.2` equals the pre-push `git rev-parse v1.2`. A tag-only push does not count as CI. `workflow_dispatch` is missing from the UI until `main` itself is on the default branch.

### Phase 3: Host preview on the platform hostname

**Rationale:** Prove `dist/` is served with trailing slashes and the site `404.html` before anyone names a domain or touches DNS. Canonicals may still say `example.com` on this throwaway hostname. That is acceptable only there. Do not attach the custom domain in this phase.
**Delivers:** One static host project. Build `npm run build`, publish `dist`, Node 22. Smoke-test `/`, `/zh/`, `/tools/json-formatter/`, `/zh/tools/json-formatter/`, and a missing path. Unslashed form redirects at most once to the slashed form. No redirect loop.
**Uses:** GitHub Pages Actions source if that is the host. New `deploy.yml` only — gated on CI success for that SHA (`workflow_run` after CI has run once, or an equivalent gate). `actions/upload-pages-artifact@v5` after a Node 22 build, then `actions/deploy-pages@v5`. Environment `github-pages`. Permissions `contents: read`, `pages: write`, `id-token: write` on that file only. Omit `base`. Do not commit `public/CNAME`.
**Avoids:** Pitfall 5 (slash rules, project-site `base`), Pitfall 8 (host Node 20, action default Node 24), Pitfall 11 (pasting the Astro sample over `ci.yml`; two publishers). If Pages 404s slashed directory URLs, switch host. Do not flip `trailingSlash`.
**Note:** First publish order is fixed: remote exists, `main` is green, then add `deploy.yml`, then push again. `workflow_run` does not exist until CI has run at least once.

### Phase 4: Origin swap

**Rationale:** Canonicals, hreflang, sitemap, and robots are baked at build time. This commit waits until the user names the domain. It must land and rebuild before DNS cutover. Do not fold it into Phase 2. An empty remote that still contains `example.com` in source is acceptable. A public custom domain that canonicalizes to `example.com` is not.
**Delivers:** `SITE_ORIGIN` and `astro.config.mjs` `site` set to the same absolute `https://` origin (scheme, no path, no trailing slash on the origin). Hostname matches the one the host will treat as primary (apex vs `www` decided here, before the string is baked). Rebuild. CI green on that push. A search for `example.com` is clean in source and in `dist/` (`sitemap-index.xml`, `sitemap-0.xml`, `robots.txt`, a ZH page canonical).
**Addresses:** Target 2. `CONTACT_EMAIL` only if the user supplies a mailbox in the same commit; otherwise leave it and record the deferral. Do not invent an address.
**Avoids:** Pitfall 4 (one constant changed, pre-swap `dist/` uploaded, guessed domain) and the cutover-before-origin anti-pattern. Do not add a slash redirect in this commit to prepare the host.

### Phase 5: Custom domain and DNS cutover

**Rationale:** DNS consumes the real origin, the Node 22 pin, and the slashed paths. It does not get to fix those by force-pushing, stripping slashes, or adding a second A record. The host project must already exist and must already be serving the origin-swapped artifact.
**Delivers:** The user-named domain over HTTPS. Exactly one hostname returns 200; the other (if added) redirects once, path and trailing slash preserved. Certificate from the host, not a cert in the repo. Search Console only after `curl -sI https://<canonical>/sitemap-index.xml` returns 200 and the file has no `example.com`.
**Uses:** The record the host dashboard shows, not a blog-post copy. GitHub Pages: add the domain in repo settings **before** changing DNS. Apex: four A records plus four AAAA, or one ALIAS/ANAME to `<user>.github.io`. `www`: CNAME to `<user>.github.io`, not `pages.github.io`, not `<user>.github.io/<repo>`. Enforce HTTPS after the certificate is ready (can take up to a day). If the zone is already on Cloudflare, keep Pages as the host and leave the proxy DNS-only until GitHub's certificate issues.
**Avoids:** Pitfall 6 (apex/`www` split, wrong CNAME, `public/CNAME` plus `base` from the Astro sample), Pitfall 7 (treating propagation as a broken build, force-push to fix DNS, Search Console before HTTPS 200). Do not announce the domain while the certificate is pending.
**Post-cutover check, no new code unless a check fails:** `/`, `/zh/`, `/robots.txt`, `/sitemap-index.xml`, and a nonsense path. 404 body has no `/zh/404/` href or hreflang. No trailing-slash loop. Tool islands still run with no tool API call.

### Phase Ordering Rationale

- Phase 1 does not need a remote or a domain, and the first green `main` should already include it so the host never publishes the known 404 bug. Phase 2 does not depend on Phase 1 for the workflow to run, but do not push the known-bad 404 as the first public artifact if both can land first.
- Phase 2 must not wait on DNS, and must not include the origin swap while pushing. CI going green does not require a domain.
- Phase 3 proves the host on a throwaway hostname. Placeholder canonicals are tolerated only there.
- Phase 4 bakes the user-named origin into HTML and sitemap. DNS before that commit tells Google the live host is a duplicate of `example.com`.
- Phase 5 is last. One publisher only. Test CI does not deploy. A green Actions check is not the visitor URL.

### Research Flags

Phases likely needing deeper research during planning (`/gsd-plan-phase --research-phase`):

- **Phase 3 (Host preview):** Only if the user rejects GitHub Pages or the repo must stay private. Then re-check Workers static assets (`not_found_handling: "404-page"`, `html_handling`) or the plan that allows private Pages. Do not research adapters. If Pages is accepted, skip — the workflow shape is already specified.
- **Phase 5 (DNS):** Only for the host the user actually opened. Apex-on-Cloudflare-zone vs external DNS vs GitHub four A/AAAA records are host-specific. Do not pre-write a CNAME target. Official Pages slash behavior is LOW confidence; the plan must include a `curl -sI` gate, not a doc citation, before DNS.

Phases with standard patterns (skip research-phase):

- **Phase 1:** Both producers and both throw sites are in this repo. The fix is a prop override plus a fallback. Do not re-research i18n, tools, or theme.
- **Phase 2:** `gh` empty-repo create, explicit tag refspec, existing `ci.yml`. Operational checklist, not a design question.
- **Phase 4:** Two string constants, one commit, grep `dist/`. No new mechanism.

Do not re-research tools, i18n routing, or theme in any phase. This is a subsequent milestone. The duplicated `src/pages/zh/` tree stays.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Official Astro and GitHub docs agree on static Pages, no adapter, and the Node 22 pin. CNAME-file guidance conflicts (follow GitHub: Actions publishing ignores `public/CNAME`). Pages trailing-slash behavior is LOW outside this repo directory-format match — verify with `curl`, do not treat a community guide as a spec. |
| Features | MEDIUM | Five targets are user-locked and confirmed in repo files (`ci.yml`, both origins, `404.astro`, `LangSwitch`, `ToolCard`, `RelatedTools`). Official docs back sitemap/`site`, root `404.html`, and reciprocal hreflang. Domain and GitHub account remain unknown by design. |
| Architecture | HIGH | Dual-origin split, both 404 producers, and both throw sites were read in this repo, including `dist/404.html` (canonical `https://example.com/404/`, hreflang zh-Hans `https://example.com/zh/404/`, LangSwitch `href="/zh/404/"`). Host/DNS claims are official docs, with the Pages-vs-Workers product choice left to the user. |
| Pitfalls | MEDIUM | Local fences and the 404/ToolCard bugs are HIGH (files read). Token scope, tag refspec, and do-not-paste-the-sample-over-ci.yml are official-doc MEDIUM. DNS timing and Pages slash quirks need a live check, not another research pass. |

**Overall confidence:** MEDIUM

HIGH would overstate host slash behavior and the unpublished domain. The roadmap decisions themselves are firm: zero packages, Pages by default, CI untouched, paired origins before DNS, both 404 producers, fallback not throw, path-limited commits, push `v1.2` as-is.

### Gaps to Address

- **GitHub account, repo name, visibility:** Block Phase 2 until the user writes them down. Do not run `gh repo create` with a guess. If they require a private repo, confirm the plan can serve private Pages before choosing that host; otherwise the zero-package path stops working.
- **Domain name and apex vs `www`:** Block Phase 4 until the user names the canonical hostname. Write that exact origin into both constants. Do not infer it from the repo name.
- **Contact mailbox:** `hello@example.com` is not part of the origin pair. Ask once during Phase 4. If they have no mailbox, defer explicitly. Do not invent one.
- **Host product:** Recommend GitHub Pages. If the user already has Netlify or Workers, do not also add a Pages deploy workflow. Two publishers will fight over the domain. Workers needs `not_found_handling: "404-page"` or `404.html` is unused — host config, not an adapter.
- **Pages trailing slash:** Official docs do not promise `/tools/` serves `tools/index.html`. Phase 3 must `curl -sI` slashed and unslashed URLs on `*.github.io` before Phase 5. Failure means switch host, not flip `trailingSlash`.
- **`CONTACT_EMAIL` and Search Console:** Not launch blockers. Do not let them delay the remote or the 404 fix.

## Sources

### Primary (HIGH confidence)

- This repo: `astro.config.mjs`, `src/data/site.ts`, `src/layouts/BaseLayout.astro`, `src/components/LangSwitch.astro`, `src/components/Header.astro`, `src/pages/404.astro`, `src/components/ToolCard.astro`, `src/components/RelatedTools.astro`, `src/i18n/path.ts`, `src/pages/robots.txt.ts`, `.github/workflows/ci.yml`, `dist/404.html` — dual origin, both 404 producers, both throw sites, CI contract.
- `.planning/milestones/v1.2-phases/12-pages-langswitch/12-REVIEW.md` — WR-01 (ToolCard / RelatedTools), WR-02 (404 `/zh/404/`).
- `.planning/PROJECT.md` — v1.3 targets and fences (no `git add -A`, no `crontab.ts`, no stash pop, no LED ToolShell).

### Secondary (MEDIUM confidence)

- Astro deploy overview, configuration reference (`site`, `trailingSlash`), sitemap guide, pages (`404.html`), GitHub Pages deploy guide, Netlify deploy guide, Cloudflare deploy guide — static `dist/`, no adapter, sitemap requires `http(s)` `site`, prerendered slashes are the host job. Fetched 2026-09-23. The Astro GitHub sample conflicts with GitHub on `public/CNAME` and sets `base` in the custom-domain sample; do not copy it over `ci.yml`.
- GitHub Pages custom-domain docs — add the domain before DNS; apex A/AAAA; `www` CNAME to `<user>.github.io`; Actions ignores `CNAME`; DNS up to 24 hours.
- GitHub Actions permissions and `GITHUB_TOKEN` — `contents: read` is enough for the test job; token pushes do not re-trigger `push` workflows.
- `withastro/action` v6.1.3 (default Node 24), `actions/deploy-pages` v5.0.1, `actions/upload-pages-artifact` v5.0.0, `gh` v2.101.0 — pin the deploy build to Node 22.
- Google localized versions — non-reciprocal hreflang is ignored. IANA example domains — `example.com` is not for production.

### Tertiary (LOW confidence)

- Community trailing-slash notes (Pages serves `folder/index.html` at `/folder/` and redirects `/folder` to `/folder/`). Directionally why Pages fits directory format. Not a spec. Phase 3 `curl -sI` is the verification.

---

*Research completed: 2026-09-23*
*Ready for roadmap: yes*
