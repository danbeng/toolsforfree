# Requirements: Devtoolbox

**Defined:** 2026-09-23
**Core Value:** A visitor opens a real domain, EN/ZH switch links are real, and a push to main actually runs tests and the build.

## v1.3 Requirements

Requirements for milestone v1.3 Ship. Each maps to roadmap phases.

### Publish guards

- [x] **GUARD-01**: A visitor on the 404 page does not get a LangSwitch link to `/zh/404/`.
- [x] **GUARD-02**: The 404 document does not advertise `/zh/404/` in canonical or hreflang.
- [x] **GUARD-03**: The 404 document is `noindex`.
- [x] **GUARD-04**: ToolCard still renders when `copy.tools[slug]` is missing, using the catalog name and short description.
- [x] **GUARD-05**: RelatedTools still renders when `copy.tools[slug]` is missing, using the same fallback. Neither component throws.

### Remote

- [x] **REM-01**: An empty GitHub repo exists under the account the user names. No guessed owner, name, or visibility.
- [x] **REM-02**: `main` is pushed, and the existing `.github/workflows/ci.yml` run on that push is green.
- [x] **REM-03**: The existing annotated tag `v1.2` is pushed unchanged. No retag, no `--force`, no `--tags`.

### Host preview

- [x] **HOST-01**: A separate deploy workflow publishes `dist/` to GitHub Pages. `ci.yml` stays a read-only Node 22 test/build gate.
- [x] **HOST-02**: On the platform hostname, `/`, `/zh/`, and a tool URL with a trailing slash return 200. The unslashed form redirects at most once to the slashed form. No redirect loop.
- [x] **HOST-03**: A missing path on the platform hostname is served by the site `404.html`, and that body contains no `/zh/404/` link.

### Origin

- [ ] **ORIG-01**: `SITE_ORIGIN` and `astro.config.mjs` `site` are both `https://danbeng.github.io` (user chose the GitHub Pages hostname on 2026-09-24; no custom domain yet), with no path and no trailing slash on the origin.
- [ ] **ORIG-02**: A rebuilt `dist/` contains no `example.com` in sitemap, robots, or a page canonical. Canonical, hreflang, and the robots sitemap line include the `/toolsforfree` base.
- [ ] **ORIG-03**: `CONTACT_EMAIL` changes only if the user supplies a mailbox. It is not invented.
- [x] **ORIG-04**: A visitor clicking a header, footer, catalog card, related tool, home, blog index, 404 CTA, or LangSwitch link on `https://danbeng.github.io/toolsforfree/` lands on a page that exists. Links carry the `/toolsforfree` base, and LangSwitch puts `/zh/` after the base, not before it. With no base set, links are unchanged.

## v2 Requirements

Deferred. Not in this roadmap.

### Visual polish

- **VIS-01**: Three-state theme toggle
- **VIS-02**: Theme transition animation
- **VIS-03**: Catalog grid 4-col at 1440px

### Later publish

- **PUB-01**: Preview deploy per pull request
- **PUB-02**: Search Console submission after the live sitemap is clean

### Custom domain (deferred from v1.3 on 2026-09-24 — domain not registered)

- **CUT-01**: The user-named domain serves the origin-swapped site over HTTPS.
- **CUT-02**: One hostname is canonical. The other, if attached, redirects once and keeps the path and trailing slash.
- **CUT-03**: `https://<canonical>/sitemap-index.xml` returns 200 and does not contain `example.com`.
- Cutover must also remove `base: '/toolsforfree'` and swap `SITE_ORIGIN` / `site` to the new domain in one commit.

## Out of Scope

| Feature | Reason |
|---------|--------|
| New catalog tools | v1.3 is publish, not More Tools |
| Third language | EN + ZH already shipped |
| Tailwind or a new framework | Stack stays Astro + Preact + custom CSS |
| New npm packages | Pages serves existing `dist/` with zero additions |
| SSR or an Astro adapter | Site is static. A host that needs an adapter is the wrong host |
| `src/pages/zh/404.astro` | Unknown `/zh/...` paths are served by root `404.html`, not a second route |
| Committing `src/lib/crontab.ts` | Unrelated dirty file. Stays unstaged |
| Popping `stash@{0}` or `stash@{1}` | Unrelated. Do not pop |
| LED ToolShell / `tool-panel__chrome` | Leave dirty. Never commit this chrome |
| Inventing the domain, GitHub owner, or mailbox | User supplies these at execution. Do not guess |
| `git add -A` | Path-limited adds only, on every commit |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GUARD-01 | Phase 15 | Complete |
| GUARD-02 | Phase 15 | Complete |
| GUARD-03 | Phase 15 | Complete |
| GUARD-04 | Phase 15 | Complete |
| GUARD-05 | Phase 15 | Complete |
| REM-01 | Phase 16 | Complete |
| REM-02 | Phase 16 | Complete |
| REM-03 | Phase 16 | Complete |
| HOST-01 | Phase 17 | Complete |
| HOST-02 | Phase 17 | Complete |
| HOST-03 | Phase 17 | Complete |
| ORIG-01 | Phase 18 | Pending |
| ORIG-02 | Phase 18 | Pending |
| ORIG-03 | Phase 18 | Pending |
| ORIG-04 | Phase 18 | Complete |

**Coverage:**

- v1.3 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0
- Deferred to next milestone: CUT-01, CUT-02, CUT-03 (domain not registered)

---

*Requirements defined: 2026-09-23*
*Last updated: 2026-09-24 after user skipped the custom domain and chose github.io as origin*
