# Phase 17: Host preview on the platform hostname - Context

**Gathered:** 2026-09-23
**Status:** Ready for planning
**Mode:** Auto (autonomous discuss; recommended options locked from the user's public-repo choice)

<domain>
## Phase Boundary

Publish `dist/` to GitHub Pages on the platform hostname and prove trailing-slash URLs and the site 404 before any custom domain. Covers HOST-01, HOST-02, HOST-03. Does not change `SITE_ORIGIN`. Does not attach a custom domain. Does not edit `ci.yml`.

</domain>

<decisions>
## Implementation Decisions

### Host
- **D-01:** Host is GitHub Pages, Actions source. Repo is `danbeng/toolsforfree`, now public (user chose option 1 on 2026-09-23 after private Pages returned HTTP 422). Pages site already created with `build_type=workflow`. `html_url` is `https://danbeng.github.io/toolsforfree/`. Do not create a second publisher. Do not switch to Netlify or Workers in this phase.
- **D-02:** This is a project site, not a user site. Smoke tests use the project prefix, not the apex of `danbeng.github.io`. Required URLs: `https://danbeng.github.io/toolsforfree/`, `https://danbeng.github.io/toolsforfree/zh/`, `https://danbeng.github.io/toolsforfree/tools/json-formatter/`, and a missing path under that prefix served by the site 404. Unslashed form redirects at most once to the slashed form. No loop.

### Base path
- **D-03:** Set Astro `base` to `/toolsforfree` (no trailing slash on the base value) so assets and links resolve on the project site. Do not commit `public/CNAME`. Do not flip `trailingSlash`. — **Reversibility:** costly — every preview URL includes `/toolsforfree` until Phase 19 removes `base` for the custom domain. Undo is a config change plus rebuild, not a data migration.
- **D-04:** `SITE_ORIGIN` stays `https://example.com` in this phase. Placeholder canonicals are tolerated only on the platform hostname. Do not bake the github.io URL into `SITE_ORIGIN`.

### Deploy workflow
- **D-05:** New `.github/workflows/deploy.yml` only. `ci.yml` stays `contents: read`, Node 22, `npm ci`, `npm test`, `npm run build`. Do not paste a Pages sample over `ci.yml`. Do not use `withastro/action` (default Node 24).
- **D-06:** Deploy builds with Node 22, uploads `dist/` via `actions/upload-pages-artifact@v5`, deploys with `actions/deploy-pages@v5`. Permissions `pages: write` and `id-token: write` live on `deploy.yml` only. Environment `github-pages`.
- **D-07:** Deploy runs only after CI succeeds for that SHA (`workflow_run` on the CI workflow). A green test run is not itself the visitor URL.
- **D-08:** If slashed directory URLs 404 on the live host, stop. Do not add a slash-forcing redirect. Do not flip `trailingSlash`. Report the failure. Do not switch host inside this phase without asking.

### Claude's Discretion
- Exact `workflow_run` trigger shape, as long as deploy cannot publish a SHA whose CI failed.
- `curl -sI` checks for the four URLs above. Failure is a failed phase, not a silent pass.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — HOST-01, HOST-02, HOST-03. Interpret `/` as the project-site root `https://danbeng.github.io/toolsforfree/`, not `https://danbeng.github.io/`.
- `.planning/ROADMAP.md` — Phase 17 notes. `base` is now required because the live Pages URL is a project site. Still no `public/CNAME`, no slash-forcing redirect, no `ci.yml` replace, Node 22, zero new npm packages.
- `.planning/research/SUMMARY.md` — Phase 3 host preview. The "omit base" note assumed a user site. This repo is a project site; D-03 overrides that note for this phase only.
- `.github/workflows/ci.yml` — do not edit.

### Live host
- Pages API `html_url`: `https://danbeng.github.io/toolsforfree/`
- Repo: `https://github.com/danbeng/toolsforfree` (public)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.github/workflows/ci.yml` — already green on `main`. Deploy must not replace it.
- `astro.config.mjs` — `site` stays `https://example.com`. Add `base: '/toolsforfree'`.
- `trailingSlash: 'always'` — leave it.

### Established Patterns
- Path-limited git add. Do not commit `src/lib/crontab.ts` or LED ToolShell.
- No new npm packages.

### Integration Points
- Phase 18 swaps `SITE_ORIGIN` and `site` together. It must not be done here.
- Phase 19 custom domain must drop `base` (or set it to `/`) so the real domain is not prefixed with `/toolsforfree`. Record that as a Phase 19 dependency, do not do it now.

</code_context>

<specifics>
## Specific Ideas

User chose "1" after private Pages returned: `Your current plan does not support GitHub Pages for this repository.` Repo was then set public and Pages was created with `build_type=workflow`.

</specifics>

<deferred>
## Deferred Ideas

- Custom domain and DNS — Phase 19. Remove `base` then.
- Origin swap off `example.com` — Phase 18.
- Preview deploys per pull request — v2.
- Switching host if slashed URLs 404 — stop and ask. Do not pick a new host in this phase.

</deferred>

---

*Phase: 17-host-preview-on-the-platform-hostname*
*Context gathered: 2026-09-23*
