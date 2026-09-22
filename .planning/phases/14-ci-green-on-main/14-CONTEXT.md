# Phase 14: CI Green on Main - Context

**Gathered:** 2026-09-22
**Status:** Ready for planning

<domain>
## Phase Boundary

A clean `main` checkout, and a workflow file, can run `npm test` then `astro build` with no overlay isolation. This phase adds `.github/workflows/ci.yml` only (Node 20, `npm ci`, `npm test`, `astro build`). It does not create a GitHub remote, does not run `gh repo create`, and does not commit LED ToolShell or `src/lib/crontab.ts`.

</domain>

<decisions>
## Implementation Decisions

### Workflow triggers
- **D-Triggers:** `on: [push, pull_request]` to `main` plus `workflow_dispatch`. No remote, no `gh repo create`, no secrets, no deploy job. Node 22 (`actions/setup-node@v4` with `node-version: 22` and `cache: npm`). User override 2026-09-22: Astro 7.3.2 `engines.node` is `>=22.12.0`, so CI-01's original Node 20 pin would fail `astro build` on a runner.

### CI step scope
- **D-Steps:** Exactly `npm ci`, `npm test`, `npm run build` (`astro build`). Do not add lint, `astro check`, or extra jobs. Use `npm ci` (lockfile present), not `npm install`.

### Overlay-free build proof
- **D-Proof:** Prove CI-02 on the current tree without overlay isolation and without popping stashes. Working tree may still have dirty `src/lib/crontab.ts` — do not stage it. `astro build` must succeed while that file stays unstaged. Do not commit LED `ToolShell` / `tool-panel__chrome`. Do not change `SITE_ORIGIN`. Do not add catalog tools.

### Claude's Discretion
- Exact `actions/checkout` / `setup-node` minor versions, as long as Node is 20 and steps match D-Steps
- Whether the workflow name is `CI` or `ci`
- `permissions: contents: read` is fine if added

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements / roadmap
- `.planning/REQUIREMENTS.md` — CI-01, CI-02
- `.planning/ROADMAP.md` — Phase 14 success criteria and hard fences
- `.planning/phases/13-islands-without-led/13-CONTEXT.md` — ToolShell landed no-LED; crontab.ts stays out

### Build surface
- `package.json` — `test`: `vitest run`; `build`: `astro build`
- `package-lock.json` — required for `npm ci`
- `astro.config.mjs` — site origin unchanged

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `npm test` already green (27 files / 188 tests after Phase 13)
- `astro build` script exists; Phase 14 owns the first overlay-free green build
- No `.github/workflows/` yet

### Established Patterns
- Path-limited `git add`; never `git add -A`
- Dirty `src/lib/crontab.ts` is the only remaining product dirty file and must stay uncommitted
- Stashes `stash@{0}` overlay chrome and `stash@{1}` unrelated i18n must not be popped

### Integration Points
- Workflow file is the only new artifact besides proving the two commands
- Phase 12/13 already landed ZH pages and no-LED ToolShell so SSG should compile without overlay CSS

</code_context>

<specifics>
## Specific Ideas

Minimal GitHub Actions file:

- `runs-on: ubuntu-latest`
- `actions/checkout` then `actions/setup-node` Node 20 + npm cache
- `npm ci` → `npm test` → `npm run build`
- Triggers: push and pull_request on `main`, plus workflow_dispatch
- Local proof: run `npm test` and `npm run build` on the working tree without staging `crontab.ts` and without stash pop

</specifics>

<deferred>
## Deferred Ideas

- GitHub remote / `gh repo create` — out of scope
- Real `SITE_ORIGIN` — future
- LED ToolShell / committing `crontab.ts` — not this milestone
- lint / `astro check` / deploy — not CI-01

</deferred>

---

*Phase: 14-CI Green on Main*
*Context gathered: 2026-09-22*
