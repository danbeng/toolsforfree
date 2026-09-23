# Roadmap: Devtoolbox

## Overview

v1.0 shipped 18 browser-local tools. v1.1 shipped visual polish. v1.2 shipped the ZH tree, LangSwitch, locale tool chrome, and a GitHub Actions workflow file that has never run against a remote. v1.3 publishes that site: fix the known 404 and catalog-copy bugs first, push `main` and the existing `v1.2` tag to a user-named empty GitHub repo, prove `dist/` on the platform hostname, swap the placeholder origin only after the user names a domain, then cut DNS over to that origin. No new catalog tools. No new npm packages. No adapter.

## Milestones

- ✅ **v1.0 More Tools** — Phases 1-6 (shipped 2026-09-14)
- ✅ **v1.1 Frontend Polish** — Phases 7-10 (shipped 2026-09-19)
- ✅ **v1.2 Bilingual Land** — Phases 11-14 (shipped 2026-09-22)
- 🚧 **v1.3 Ship** — Phases 15-19 (in progress)

## Constraints (hard fences)

These apply to every v1.3 phase. Do not plan or execute around them.

- Path-limited `git add` only — never `git add -A`, `git add .`, or `git commit -a`
- Do not commit `src/lib/crontab.ts`
- Do not pop `stash@{0}` or `stash@{1}`
- Do not commit LED `ToolShell` / `tool-panel__chrome`
- Do not invent the domain, GitHub owner, repo name, visibility, or mailbox — the user supplies them at execution
- Do not retag `v1.2`. No `git tag -f`, no `--force`, no `--tags`. Push the existing annotated tag as `refs/tags/v1.2`
- Do not paste a Pages sample over `.github/workflows/ci.yml`. CI stays a read-only Node 22 test/build gate (`contents: read`). Deploy, if any, is a separate workflow
- Node 22 for CI and for any deploy build. Not Node 20. Not the Astro action default of 24
- Zero new npm packages. No adapter. No `base`. Do not flip `trailingSlash`
- Do not add `src/pages/zh/404.astro`. Do not special-case `/404/` inside `switchLocalePath`

## Phases

<details>
<summary>✅ v1.0 More Tools (Phases 1-6) — SHIPPED 2026-09-14</summary>

- [x] Phase 1: Additive tool contract (1/1 plans) — completed 2026-09-11
- [x] Phase 2: Light text and generate tools (4/4 plans) — completed 2026-09-12
- [x] Phase 3: SQL formatter (1/1 plans) — completed 2026-09-13
- [x] Phase 4: Text Diff (1/1 plans) — completed 2026-09-13
- [x] Phase 5: Markdown preview (1/1 plans) — completed 2026-09-14
- [x] Phase 6: QR generate and decode (1/1 plans) — completed 2026-09-14

</details>

Archive: `.planning/milestones/v1.0-ROADMAP.md`

<details>
<summary>✅ v1.1 Frontend Polish (Phases 7-10) — SHIPPED 2026-09-19</summary>

- [x] Phase 7: Theme Foundation (1/1 plans) — completed 2026-09-16
- [x] Phase 8: Mobile Hamburger Menu (1/1 plans) — completed 2026-09-16
- [x] Phase 9: Grid & Spacing (1/1 plans) — completed 2026-09-18
- [x] Phase 10: Interactive Chrome (1/1 plans) — completed 2026-09-18

</details>

Archive: `.planning/milestones/v1.1-ROADMAP.md`

<details>
<summary>✅ v1.2 Bilingual Land (Phases 11-14) — SHIPPED 2026-09-22</summary>

- [x] Phase 11: i18n Kernel (1/1 plans) — completed 2026-09-20
- [x] Phase 12: Pages + LangSwitch (1/1 plans) — completed 2026-09-20
- [x] Phase 13: Islands without LED (1/1 plans) — completed 2026-09-22
- [x] Phase 14: CI Green on Main (1/1 plans) — completed 2026-09-22

</details>

Archive: `.planning/milestones/v1.2-ROADMAP.md`

### v1.3 Ship (In Progress)

**Milestone Goal:** A visitor opens a real domain, EN/ZH switch links are real, and a push to main actually runs tests and the build.

- [x] **Phase 15: 404 wiring and catalog-copy guard** - 404 stops advertising `/zh/404/`; catalog cards survive a missing copy key (completed 2026-09-23)
- [x] **Phase 16: Remote and tag push** - Empty user-named GitHub repo; `main` pushed; existing tag `v1.2` pushed unchanged (completed 2026-09-23)
- [x] **Phase 17: Host preview on the platform hostname** - `dist/` served with trailing slashes and the site 404, before any custom domain (completed 2026-09-23)
- [ ] **Phase 18: Origin swap** - Placeholder `example.com` replaced with the user-named origin in both constants, then rebuilt
- [ ] **Phase 19: Custom domain and DNS cutover** - User-named domain serves the origin-swapped site over HTTPS

## Phase Details

### Phase 15: 404 wiring and catalog-copy guard

**Goal**: A visitor on the 404 page is not sent to a missing Chinese 404, and a catalog card still renders when a tool's UI copy key is absent
**Depends on**: Phase 14 (v1.2 complete)
**Requirements**: GUARD-01, GUARD-02, GUARD-03, GUARD-04, GUARD-05
**Success Criteria** (what must be TRUE):

  1. A visitor on the 404 page sees no LangSwitch link to `/zh/404/`
  2. The 404 document's canonical and hreflang do not advertise `/zh/404/`, and the document is `noindex`
  3. A catalog card and a related-tools card still render when `copy.tools[slug]` is missing, using the catalog name and short description, and neither component throws
  4. A search of the built site for `zh/404` is empty

**Plans:** 1/1 plans complete

Plans:

- [x] 15-01-PLAN.md — 404 stops advertising `/zh/404/`; catalog cards fall back when UI copy is missing

**Notes:** Fix both producers. `LangSwitch` reads `Astro.url.pathname`, not the layout `path` prop; changing only `path="/404/"` leaves the visible Chinese link. Do not add `src/pages/zh/404.astro`. Do not special-case `/404/` inside `switchLocalePath`. Fall back in both `ToolCard` and `RelatedTools`; a clearer throw is still a throw. Path-limited add only. Do not commit `src/lib/crontab.ts` or LED `ToolShell`. Do not pop stashes. This commit does not change `SITE_ORIGIN`.

### Phase 16: Remote and tag push

**Goal**: A push to `main` on the user-named GitHub repo actually runs the existing test and build workflow, and the existing `v1.2` tag is on that remote unchanged
**Depends on**: Phase 15
**Requirements**: REM-01, REM-02, REM-03
**Success Criteria** (what must be TRUE):

  1. An empty GitHub repo exists under the account, name, and visibility the user named — nothing guessed, no generated README
  2. After `main` is pushed, the existing `.github/workflows/ci.yml` run on that push is green (Node 22, `npm ci`, `npm test`, `npm run build`)
  3. The remote tag `v1.2` points at the same commit as the local annotated tag that existed before the push. No retag, no `--force`, no `--tags`

**Plans**: TBD

**Notes:** Block until the user names owner, repo, and visibility. Do not invent them. Do not fold the origin swap or a deploy step into this commit. `ci.yml` stays `contents: read`; do not paste a Pages sample over it; do not bump checkout or Node. Push `main` first, then `git push origin refs/tags/v1.2`. A tag-only push does not run `ci.yml`; that is expected. Record `git rev-parse v1.2` before the push and confirm `git ls-remote` matches. Path-limited add only. Do not commit `src/lib/crontab.ts` or LED `ToolShell`. Do not pop stashes.

### Phase 17: Host preview on the platform hostname

**Goal**: The built site is served on the platform hostname with trailing-slash URLs and the site 404, before anyone attaches a custom domain
**Depends on**: Phase 16
**Requirements**: HOST-01, HOST-02, HOST-03
**Success Criteria** (what must be TRUE):

  1. A separate deploy workflow publishes `dist/` to GitHub Pages. `ci.yml` is still a read-only Node 22 test/build gate and was not replaced
  2. On the platform hostname, `/`, `/zh/`, and a tool URL with a trailing slash return 200. The unslashed form redirects at most once to the slashed form. No redirect loop
  3. A missing path on the platform hostname is served by the site `404.html`, and that body contains no `/zh/404/` link

**Plans:** 1 plan

Plans:
- [x] 17-01-PLAN.md — Publish dist/ to the project-site hostname and prove slashed URLs plus the site 404

**Notes:** Prove the host before naming a domain. Placeholder canonicals are tolerated only on this hostname. Do not attach the custom domain. Do not commit `public/CNAME`. The live URL is a project site, so set `base: '/toolsforfree'` (D-03). Phase 19 must drop that base. Do not add a slash-forcing or slash-stripping redirect. Do not flip `trailingSlash`. If Pages 404s slashed directory URLs, switch host — do not change the site to match the host. Deploy build is Node 22, not the Astro action default of 24. Write scopes (`pages: write`, `id-token: write`) live on the deploy workflow only. Zero new npm packages. First order is fixed: remote exists and `main` is green, then add `deploy.yml`, then push again. Gate the live URL with `curl -sI`, not a doc citation. One publisher only.

### Phase 18: Origin swap

**Goal**: Sitemap, robots, and page canonicals use the domain the user named, and a rebuilt `dist/` no longer mentions `example.com`
**Depends on**: Phase 17
**Requirements**: ORIG-01, ORIG-02, ORIG-03
**Success Criteria** (what must be TRUE):

  1. `SITE_ORIGIN` and `astro.config.mjs` `site` are the same `https://` origin the user named, with no path and no trailing slash on the origin
  2. A rebuilt `dist/` contains no `example.com` in the sitemap, robots, or a page canonical
  3. `CONTACT_EMAIL` is unchanged unless the user supplied a mailbox. No address was invented

**Plans**: TBD

**Notes:** Block until the user names the canonical hostname (apex vs `www` decided here, before the string is baked). Change both constants in one commit. Do not invent the domain. Rebuild and grep `dist/` before any DNS change. Do not upload a pre-swap `dist/`. Do not add a slash redirect in this commit. Path-limited add only. Do not commit `src/lib/crontab.ts` or LED `ToolShell`. Do not pop stashes. CI on this push must stay Node 22 and green. `CONTACT_EMAIL` is a third placeholder: ask once; if the user has no mailbox, leave it and record the deferral.

### Phase 19: Custom domain and DNS cutover

**Goal**: A visitor opening the user-named domain gets the origin-swapped site over HTTPS, and the live sitemap does not mention `example.com`
**Depends on**: Phase 18
**Requirements**: CUT-01, CUT-02, CUT-03
**Success Criteria** (what must be TRUE):

  1. The user-named domain serves the origin-swapped site over HTTPS
  2. One hostname is canonical. The other, if attached, redirects once and keeps the path and trailing slash
  3. `https://<canonical>/sitemap-index.xml` returns 200 and does not contain `example.com`

**Plans**: TBD

**Notes:** The host must already be serving the origin-swapped artifact. Add the domain in host settings before changing DNS. Use the record the host dashboard shows, not a blog-post copy. Certificate comes from the host, not a cert in the repo. Do not announce the domain while the certificate is pending. Do not force-push to "fix" DNS. Do not add a second publisher. Do not retag `v1.2`. Search Console only after the live sitemap returns 200 and has no `example.com`. Post-cutover check, no new code unless a check fails: `/`, `/zh/`, `/robots.txt`, `/sitemap-index.xml`, and a nonsense path. 404 body has no `/zh/404/` href. No trailing-slash loop.

## Progress

**Execution Order:**
Phases execute in numeric order: 15 → 16 → 17 → 18 → 19

Phase 15 does not need a remote. Phase 16 does not wait on DNS and must not include the origin swap. Phase 17 proves the host on a throwaway hostname. Phase 18 bakes the user-named origin before any public DNS. Phase 19 is last.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 15. 404 wiring and catalog-copy guard | 1/1 | Complete    | 2026-09-23 |
| 16. Remote and tag push | 1/0 | Complete    | 2026-09-23 |
| 17. Host preview on the platform hostname | 0/TBD | Not started | - |
| 18. Origin swap | 0/TBD | Not started | - |
| 19. Custom domain and DNS cutover | 0/TBD | Not started | - |
