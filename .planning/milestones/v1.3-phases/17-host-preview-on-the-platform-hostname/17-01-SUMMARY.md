---
phase: 17-host-preview-on-the-platform-hostname
plan: 01
subsystem: infra
tags: [github-pages, astro, workflow_run, trailing-slash]

requires:
  - phase: 14-ci-green-on-main
    provides: read-only Node 22 CI workflow named CI
  - phase: 16-remote-and-tag
    provides: public repo danbeng/toolsforfree with Pages build_type workflow
provides:
  - Project-site Astro base /toolsforfree
  - CI-gated Pages publisher that uploads dist after CI succeeds for the same SHA
  - Live proof that slashed project-site URLs are 200 and a missing path is the site 404
affects: [18-origin-swap, 19-custom-domain]

actuals:
  tokens: 354
  tasks: 3
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Deploy is a separate workflow_run publisher; ci.yml stays contents: read"
    - "Project-site base /toolsforfree until Phase 19 removes it"

key-files:
  created:
    - .github/workflows/deploy.yml
  modified:
    - astro.config.mjs

key-decisions:
  - "Astro base is /toolsforfree because the live Pages URL is a project site, not a user site"
  - "Deploy checks out github.event.workflow_run.head_sha and runs only when CI succeeded on main"
  - "SITE_ORIGIN and site stay https://example.com; public/CNAME was not added"

patterns-established:
  - "Pages publish is gated on the CI workflow named CI, conclusion success, head_branch main"
  - "Smoke tests use the /toolsforfree prefix, not the apex of danbeng.github.io"

requirements-completed: [HOST-01, HOST-02, HOST-03]

coverage:
  - id: D1
    description: "dist/ is published to GitHub Pages by deploy.yml after CI succeeds for the same SHA, and ci.yml was not edited"
    requirement: HOST-01
    verification:
      - kind: other
        ref: "gh run view 35875695232 (CI success) and 35875760159 (Deploy success) for 529aab41916c03bca42788c9b550005e83086bdf"
        status: pass
    human_judgment: false
  - id: D2
    description: "Slashed home, zh, and json-formatter URLs return 200; each unslashed form redirects once to the slashed form"
    requirement: HOST-02
    verification:
      - kind: e2e
        ref: "curl -sI --max-redirs 0 https://danbeng.github.io/toolsforfree/ and /zh/ and /tools/json-formatter/ plus unslashed forms"
        status: pass
    human_judgment: false
  - id: D3
    description: "A missing path under the project prefix is the site 404 and its body has no /zh/404/ link"
    requirement: HOST-03
    verification:
      - kind: e2e
        ref: "curl https://danbeng.github.io/toolsforfree/this-path-is-not-a-tool/"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-09-23
status: complete
plan_head_before: dcd274b07dda287fa73f984ccf7b0256d63c6622
commits: 2
---

# Phase 17 Plan 01: Host preview on the platform hostname Summary

**GitHub Pages now serves the catalog at https://danbeng.github.io/toolsforfree/ after CI succeeds, with trailing-slash URLs and the site 404 intact.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-09-23T14:36:19Z
- **Completed:** 2026-09-23T14:42:00Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Set Astro `base` to `/toolsforfree` so assets and links resolve on the project site. `site` stays `https://example.com`. `trailingSlash` stays `always`.
- Added `.github/workflows/deploy.yml`. It publishes `dist/` only after the workflow named CI succeeds on `main` for that SHA. Node 22, `upload-pages-artifact@v5`, `deploy-pages@v5`. Permissions are `pages: write` and `id-token: write` only.
- Proved the live host. Slashed home, `/zh/`, and `/tools/json-formatter/` are 200. Each unslashed form is one 301 to the slashed form. A missing path is the site 404 (`Page not found`) with no `/zh/404/` link.

## Task Commits

Each task was committed atomically:

1. **Task 1: Project-site base and a CI-gated Pages workflow** - `529aab4` (feat)
2. **Task 2: Commit only the two host files and confirm CI is green for that SHA** - `529aab4` (same commit; push and CI wait produced no extra files)
3. **Task 3: Prove slashed URLs and the site 404 on the project hostname** - no commit (curl proof only)

**Plan metadata:** docs commit on main after `529aab4` (docs: complete host preview plan)

## Files Created/Modified

- `.github/workflows/deploy.yml` - Pages publisher gated on a successful CI `workflow_run` for the same SHA
- `astro.config.mjs` - `base: '/toolsforfree'` next to the existing site and trailingSlash

## Decisions Made

- Project-site base is `/toolsforfree` for this phase only. Phase 19 must drop it (or set it to `/`) when the custom domain is attached. Leaving it on a root domain would prefix every EN/ZH URL.
- `SITE_ORIGIN` and `site` stay `https://example.com`. Placeholder canonicals are tolerated only on this hostname. Phase 18 swaps the origin.
- Deploy checks out `github.event.workflow_run.head_sha`, not the branch tip, and the job `if` requires CI conclusion success on `main`.
- `ci.yml` was not edited. `public/CNAME` was not added. `trailingSlash` was not flipped. No slash-forcing redirect was added.

## Deviations from Plan

None - plan executed exactly as written.

The product commit covers Tasks 1 and 2 together. Task 2's action is that commit plus the push and CI wait, so it has no second hash. Task 3 is live verification and did not change files.

## Live proof

SHA: `529aab41916c03bca42788c9b550005e83086bdf`

- CI: success — https://github.com/danbeng/toolsforfree/actions/runs/35875695232
- Deploy: success — https://github.com/danbeng/toolsforfree/actions/runs/35875760159

| URL | Status | Location |
| --- | --- | --- |
| https://danbeng.github.io/toolsforfree/ | 200 | — |
| https://danbeng.github.io/toolsforfree | 301 | https://danbeng.github.io/toolsforfree/ |
| hop of that Location | 200 | — |
| https://danbeng.github.io/toolsforfree/zh/ | 200 | — |
| https://danbeng.github.io/toolsforfree/zh | 301 | https://danbeng.github.io/toolsforfree/zh/ |
| hop of that Location | 200 | — |
| https://danbeng.github.io/toolsforfree/tools/json-formatter/ | 200 | — |
| https://danbeng.github.io/toolsforfree/tools/json-formatter | 301 | https://danbeng.github.io/toolsforfree/tools/json-formatter/ |
| hop of that Location | 200 | — |
| https://danbeng.github.io/toolsforfree/this-path-is-not-a-tool/ | 404 | body contains `<h1>Page not found</h1>`; no `/zh/404/` |

No slashed directory URL returned 404. No second redirect. No loop.

## Issues Encountered

None. `workflow_run` started Deploy on the same push that added the workflow. CI was green first, then Deploy ran for that SHA and succeeded. No `workflow_dispatch` and no empty follow-up push were required.

`src/lib/crontab.ts` was already dirty in the worktree and was left unstaged. It is not in `529aab4`.

## User Setup Required

None - no external service configuration required. Pages was already enabled with `build_type=workflow`. This plan did not create a second site.

## Next Phase Readiness

- Phase 18 can swap `SITE_ORIGIN` and `site` off `https://example.com`. Do not bake `github.io` into `SITE_ORIGIN` before that.
- Phase 19 must remove `base` (or set it to `/`) when the custom domain is attached. This plan left `base: '/toolsforfree'` in place on purpose.

## Known Stubs

None.

## Threat Flags

None. Deploy permissions match the threat register: `pages: write` and `id-token: write` only, no `contents: write`, checkout of the CI-green SHA.

## Self-Check: PASSED

- FOUND: `.github/workflows/deploy.yml`
- FOUND: `astro.config.mjs` contains `base: '/toolsforfree'`
- FOUND: `529aab4`
- FOUND: CI run 35875695232 success
- FOUND: Deploy run 35875760159 success
- `public/CNAME` absent
- `ci.yml` not in the commit

---
*Phase: 17-host-preview-on-the-platform-hostname*
*Completed: 2026-09-23*
