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

- [ ] **REM-01**: An empty GitHub repo exists under the account the user names. No guessed owner, name, or visibility.
- [ ] **REM-02**: `main` is pushed, and the existing `.github/workflows/ci.yml` run on that push is green.
- [ ] **REM-03**: The existing annotated tag `v1.2` is pushed unchanged. No retag, no `--force`, no `--tags`.

### Host preview

- [ ] **HOST-01**: A separate deploy workflow publishes `dist/` to GitHub Pages. `ci.yml` stays a read-only Node 22 test/build gate.
- [ ] **HOST-02**: On the platform hostname, `/`, `/zh/`, and a tool URL with a trailing slash return 200. The unslashed form redirects at most once to the slashed form. No redirect loop.
- [ ] **HOST-03**: A missing path on the platform hostname is served by the site `404.html`, and that body contains no `/zh/404/` link.

### Origin

- [ ] **ORIG-01**: After the user names the domain, `SITE_ORIGIN` and `astro.config.mjs` `site` are the same `https://` origin, with no path and no trailing slash on the origin.
- [ ] **ORIG-02**: A rebuilt `dist/` contains no `example.com` in sitemap, robots, or a page canonical.
- [ ] **ORIG-03**: `CONTACT_EMAIL` changes only if the user supplies a mailbox. It is not invented.

### Cutover

- [ ] **CUT-01**: The user-named domain serves the origin-swapped site over HTTPS.
- [ ] **CUT-02**: One hostname is canonical. The other, if attached, redirects once and keeps the path and trailing slash.
- [ ] **CUT-03**: `https://<canonical>/sitemap-index.xml` returns 200 and does not contain `example.com`.

## v2 Requirements

Deferred. Not in this roadmap.

### Visual polish

- **VIS-01**: Three-state theme toggle
- **VIS-02**: Theme transition animation
- **VIS-03**: Catalog grid 4-col at 1440px

### Later publish

- **PUB-01**: Preview deploy per pull request
- **PUB-02**: Search Console submission after the live sitemap is clean

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
| REM-01 | Phase 16 | Pending |
| REM-02 | Phase 16 | Pending |
| REM-03 | Phase 16 | Pending |
| HOST-01 | Phase 17 | Pending |
| HOST-02 | Phase 17 | Pending |
| HOST-03 | Phase 17 | Pending |
| ORIG-01 | Phase 18 | Pending |
| ORIG-02 | Phase 18 | Pending |
| ORIG-03 | Phase 18 | Pending |
| CUT-01 | Phase 19 | Pending |
| CUT-02 | Phase 19 | Pending |
| CUT-03 | Phase 19 | Pending |

**Coverage:**

- v1.3 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0

---

*Requirements defined: 2026-09-23*
*Last updated: 2026-09-23 after v1.3 roadmap mapping*
