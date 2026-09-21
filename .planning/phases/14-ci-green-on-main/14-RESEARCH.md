# Phase 14: CI Green on Main - Research

**Researched:** 2026-09-22
**Domain:** GitHub Actions workflow file plus overlay-free `npm test` / `astro build` proof
**Confidence:** HIGH

## Summary

Phase 14 adds one file, `.github/workflows/ci.yml`, and proves `npm test` then `npm run build` on the current tree. No packages are installed. No remote is created. Dirty `src/lib/crontab.ts` stays unstaged. `stash@{0}` and `stash@{1}` stay unpopped. LED `ToolShell` and `SITE_ORIGIN` stay untouched.

The island already calls `explainCron` with one argument. Committed `crontab.ts` is already one-arg. A detached worktree at HEAD (committed crontab only, no stash pop) passed both commands. The dirty working tree also passed both commands, and `src/lib/crontab.ts` was still unstaged afterward. Do not "fix" the island and do not commit crontab.

One conflict the planner must not silently rewrite: locked D-Triggers pins Node 20, but installed Astro 7.3.2 refuses any Node below 22.12.0 before the build starts. Keep `node-version: 20` in the workflow (locked). Local proof uses the machine's Node (this session: v22.22.2). Do not bump the workflow to 22 to make a future remote runner match Astro.

**Primary recommendation:** Write the minimal workflow below, path-limited `git add` that file only, and treat the already-green local `npm test` / `npm run build` as the CI-02 proof. Do not stage `src/lib/crontab.ts`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-Triggers:** `on: [push, pull_request]` to `main` plus `workflow_dispatch`. No remote, no `gh repo create`, no secrets, no deploy job. Node 20 (`actions/setup-node@v4` with `node-version: 20` and `cache: npm`).
- **D-Steps:** Exactly `npm ci`, `npm test`, `npm run build` (`astro build`). Do not add lint, `astro check`, or extra jobs. Use `npm ci` (lockfile present), not `npm install`.
- **D-Proof:** Prove CI-02 on the current tree without overlay isolation and without popping stashes. Working tree may still have dirty `src/lib/crontab.ts` — do not stage it. `astro build` must succeed while that file stays unstaged. Do not commit LED `ToolShell` / `tool-panel__chrome`. Do not change `SITE_ORIGIN`. Do not add catalog tools.

### Claude's Discretion
- Exact `actions/checkout` / `setup-node` minor versions, as long as Node is 20 and steps match D-Steps
- Whether the workflow name is `CI` or `ci`
- `permissions: contents: read` is fine if added

### Deferred Ideas (OUT OF SCOPE)
- GitHub remote / `gh repo create` — out of scope
- Real `SITE_ORIGIN` — future
- LED ToolShell / committing `crontab.ts` — not this milestone
- lint / `astro check` / deploy — not CI-01
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CI-01 | `.github/workflows/ci.yml` runs Node 20, `npm ci`, `npm test`, `astro build` (file only; no remote) | Workflow skeleton in Code Examples. Pins `actions/checkout@v4` and `actions/setup-node@v4` with `node-version: 20` and `cache: npm`. Steps are exactly `npm ci`, `npm test`, `npm run build`. No `gh repo create`. |
| CI-02 | On `main` without overlay isolation, `npm test` and `astro build` pass | Proven this session on the dirty tree and on a detached HEAD worktree that used committed one-arg `explainCron`. Island call is already one-arg. Do not stage crontab. Do not pop stashes. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Treat these as locked. Do not plan around them.

- All tool computation stays in the browser (`src/lib`). Do not add API routes for tool logic.
- Stay on Astro + Preact. Do not introduce a new app framework. No Tailwind.
- Do not rewrite the existing tools. This phase is a workflow file plus a green-build proof.
- Path-limited `git add` only. Never `git add -A`.
- Do not commit LED `ToolShell` / `tool-panel__chrome`.
- Do not commit `src/lib/crontab.ts`.
- Do not pop `stash@{0}` or `stash@{1}`.
- Do not change `SITE_ORIGIN` (`https://example.com`).
- Do not run `gh repo create` or add a GitHub remote.
- Do not add catalog tools.
- Parsers return `{ ok: true, ... } | { ok: false, error: string }`. Do not throw from tool parsers. Not in scope unless a build failure forces an island-call fix — and that fix is already in place.
- `npm test` is `vitest run`. Do not pass `-x` (Vitest 5 rejects it).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Workflow definition | CDN / Static (repo file only) | — | `.github/workflows/ci.yml` is committed YAML. It does not run in this repo until a remote exists. Creating a remote is forbidden. |
| `npm ci` / `npm test` / `astro build` | API / Backend (CI runner process) | — | Commands run in the runner (or locally for proof). They do not add a server route. |
| Tool computation | Browser / Client | — | Unchanged. Build only SSGs existing islands. Do not move logic to an API route. |
| Catalog / `SITE_ORIGIN` | CDN / Static | — | `astro.config.mjs` `site: 'https://example.com'` stays. Sitemap generation is a build side effect, not a phase change. |
| Dirty `crontab.ts` | — (do not touch) | — | Working-tree overlay. CI checkout will not have it. Proof must pass with it unstaged. |

## Standard Stack

No new packages. The phase does not install anything.

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| GitHub Actions workflow YAML | syntax current as of docs fetch 2026-09-22 | Declare triggers and the three steps | Official workflow syntax. File lives at `.github/workflows/ci.yml`. [CITED: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions] |
| `actions/checkout` | `@v4` (floating v4 tag is v4.4.0, commit `11d5960`, released 2026-07-20) | Checkout the commit the runner builds | Discretion allows any checkout pin as long as Node stays 20. Use `@v4`, not `@v7`. [CITED: https://github.com/actions/checkout/releases/tag/v4] |
| `actions/setup-node` | `@v4` (floating v4 tag is v4.4.0, commit `49933ea`, tagged 2025-04-02) | Install Node 20 and npm cache | Locked. v4 README still documents `node-version: 20` and `cache: 'npm'`. Current upstream README samples `@v7` — do not follow that. [CITED: https://github.com/actions/setup-node/blob/v4/README.md] |
| Node.js | `20` in the workflow (locked) | Runner runtime | D-Triggers. Local machine this session is `v22.22.2` (`node --version`). Do not change the pin to match the laptop. |
| npm | 11.9.0 locally; `npm ci` in CI | Lockfile install | `package-lock.json` present, `lockfileVersion` 3. [VERIFIED: package-lock.json:1-5] |
| Astro | installed `7.3.2` | `npm run build` → `astro build` | Already in the repo. Do not bump. |
| Vitest | installed `5.0.0` | `npm test` → `vitest run` | Already in the repo. Do not add `-x`. |

### Supporting

None. Do not add lint, `astro check`, coverage upload, or a deploy job.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `actions/setup-node@v4` | `@v7` (current README samples) | Rejected. D-Triggers locks `@v4`. |
| `node-version: 20` | `22` (what Astro 7.3.2 actually accepts) | Rejected for the workflow file. See Open Questions (RESOLVED). Do not silently retarget. |
| `npm test` | `npx vitest run --bail 1` or `-x` | Rejected. D-Steps is exactly `npm test`. `-x` is an unknown option on Vitest 5.0.0. |

**Installation:** none.

**Version verification:** no new packages. Installed versions read from `node_modules/astro/package.json` and `node_modules/vitest/package.json` this session: astro `7.3.2`, vitest `5.0.0`.

## Package Legitimacy Audit

Not applicable. This phase installs no external packages. Do not add a dependency to "fix" CI.

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```text
push/PR to main, or workflow_dispatch
        |
        v
.github/workflows/ci.yml          (committed file; no remote in this phase)
        |
        v
ubuntu-latest job "ci"
        |
        +--> actions/checkout@v4          (clean tree; dirty crontab is NOT in git)
        +--> actions/setup-node@v4        node-version: 20, cache: npm
        +--> npm ci                       (lockfile; not npm install)
        +--> npm test                     (vitest run; no -x)
        +--> npm run build                (astro build)
                |
                v
        exit 0 = CI-01 shape + CI-02 commands

Local proof (this phase, no remote):
  working tree (crontab.ts unstaged) --> npm test --> npm run build --> exit 0
  HEAD worktree (committed crontab)  --> npm test --> npm run build --> exit 0
```

### Recommended Project Structure

```text
.github/
└── workflows/
    └── ci.yml          # only new product artifact
```

Do not add `.github/workflows/` companions (lint, deploy, release).

### Pattern 1: Minimal locked workflow

**What:** One job, three run steps, Node 20, read-only token.
**When to use:** This phase. Do not extend it.
**Example:** see Code Examples. Name the workflow `CI`. Job id `ci`.

### Pattern 2: Path-limited commit

**What:** `git add .github/workflows/ci.yml` only.
**When to use:** The commit that lands CI-01.
**Do not:** `git add -A`, `git add src/lib/crontab.ts`, `git add src/components/ToolShell.tsx`, `git stash pop`.

### Anti-Patterns to Avoid

- **Staging dirty crontab to "make the build match CI":** the build already matches. Staging it violates the fence.
- **Popping `stash@{0}` to recover overlay CSS:** overlay isolation is what this phase must not need. Both stashes stay.
- **Adding `npm run astro check` or a lint step:** out of D-Steps.
- **`node-version: 22` to satisfy Astro engines:** contradicts D-Triggers. Record the conflict; do not retarget.
- **`vitest run -x`:** Vitest 5.0.0 throws `Unknown option '-x'`.
- **`gh repo create` to "see the check turn green":** forbidden. CI-01 is the file. CI-02 is the local command proof.
- **Changing `site:` in `astro.config.mjs`:** `SITE_ORIGIN` fence. Sitemap already emits against `https://example.com`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Checkout + Node install | A custom Node bootstrap script | `actions/checkout@v4` + `actions/setup-node@v4` | Lockfile cache and Node install are the action's job. [CITED: https://github.com/actions/setup-node/blob/v4/README.md] |
| Test runner flags | A wrapper that passes `-x` | `npm test` as defined (`vitest run`) | D-Steps. `-x` is not a Vitest 5 flag. |
| Cron i18n in the lib | Committing the dirty locale-aware `crontab.ts` | Leave the working-tree file unstaged | Fence. Committed one-arg `explainCron` already typechecks the island. |
| Remote + first green check | `gh repo create` | Stop after the file and the local proof | REQUIREMENTS Out of Scope. |

**Key insight:** The phase is a file plus a proof. Every extra job, pin bump, or dirty-file commit is a fence violation, not a completeness improvement.

## Common Pitfalls

### Pitfall 1: Dirty `src/lib/crontab.ts` gets staged

**What goes wrong:** A path-unscoped `git add` commits the locale-aware crontab overlay. That file is explicitly out of this milestone.
**Why it happens:** `git status` shows it modified next to planning files. `git add -A` or `git add src` sweeps it in.
**How to avoid:** `git add .github/workflows/ci.yml` only. After the commit, `git status --short -- src/lib/crontab.ts` must still show `M`.
**Warning signs:** `git diff --cached --name-only` lists `src/lib/crontab.ts`.

Current dirty signature (do not commit) starts with:

```ts
import type { Locale } from '../i18n/locales';
export function explainCron(input: string, locale: Locale = 'en'): CrontabResult {
```

[VERIFIED: src/lib/crontab.ts:1-26] Quote of the working tree (not HEAD):

```
import type { Locale } from '../i18n/locales';
...
export function explainCron(input: string, locale: Locale = 'en'): CrontabResult {
```

HEAD (what CI will checkout) is:

```
export function explainCron(input: string): CrontabResult {
```

[VERIFIED: git show HEAD:src/lib/crontab.ts, line 16]

### Pitfall 2: "Fixing" the island when the build fails

**What goes wrong:** A planner task edits `CrontabExplainer.tsx` or commits crontab because an old note said the island/lib signatures disagree.
**Why it happens:** The dirty file adds a second argument. Someone assumes the island still passes two args, or that HEAD's one-arg export will not typecheck.
**How to avoid:** The island already calls one arg. Both trees built this session. If a future build fails for a signature mismatch, fix the island call to `explainCron(input)` — do not commit `crontab.ts`.
**Warning signs:** A plan task whose files list includes `src/lib/crontab.ts` or `src/components/tools/CrontabExplainer.tsx`.

Island call, committed and working tree identical (`git diff -- src/components/tools/CrontabExplainer.tsx` empty):

```tsx
const r = explainCron(input);
```

[VERIFIED: src/components/tools/CrontabExplainer.tsx:17]

### Pitfall 3: Node 20 workflow vs Astro 7 engines

**What goes wrong:** A future GitHub runner on Node 20 exits before `astro build` with an unsupported-Node error. A well-meaning executor "fixes" it by setting `node-version: 22`, which breaks D-Triggers.
**Why it happens:** Installed Astro hard-exits below 22.12.0. Docs require v22.12.0 or higher. The locked workflow still says 20.
**How to avoid:** Write Node 20 anyway. Local CI-02 proof runs on the machine Node (v22.22.2 here) and is already green. Do not add an install step that upgrades Astro. Do not retarget the workflow unless the user unlocks D-Triggers.
**Warning signs:** A plan that changes `node-version` or adds `engine-strict`.

Hard exit, installed CLI:

```js
const engines = '>=22.12.0';
...
console.error(`\
	Node.js v${process.versions.node} is not supported by Astro!
	Please upgrade Node.js to a supported version: "${engines}"\n`);
...
process.exit(1);
```

[VERIFIED: node_modules/astro/bin/astro.mjs:27-28 and node_modules/astro/bin/astro.mjs:62-89]

Package engines, same install:

```
"engines": {
    "node": ">=22.12.0",
    "npm": ">=9.6.5",
    "pnpm": ">=7.1.0"
  },
```

[VERIFIED: node_modules/astro/package.json engines field, read via node this session]

Docs: "Node.js - v22.12.0 or higher. Odd-numbered versions like v23 are not supported." [CITED: https://docs.astro.build/en/install-and-setup/]

`npm config get engine-strict` is `false` on this machine, so `npm ci` itself will not refuse Node 20. The Astro CLI will. [VERIFIED: npm config get engine-strict]

### Pitfall 4: Vitest `-x`

**What goes wrong:** A verification command copies a Jest/pytest habit (`-x` / fail-fast) onto `vitest run` and the proof goes red for a CLI typo, not a product bug.
**Why it happens:** Vitest 5 documents `--bail <number>`, not `-x`.
**How to avoid:** Proof command is `npm test` (script is `vitest run`). If a plan needs fail-fast, it still must not change the workflow step. Do not put `-x` in any command.
**Warning signs:** `CACError: Unknown option '-x'`.

Probe this session:

```
CACError: Unknown option `-x`
```

[VERIFIED: npx vitest run -x, vitest 5.0.0]

Help line: `--bail <number>` is present. `-x` is not. [VERIFIED: npx vitest run --help]

### Pitfall 5: `workflow_dispatch` only fires from the default branch

**What goes wrong:** Someone expects a manual run from a feature branch copy of the file.
**Why it happens:** Docs: "This trigger only receives events when the workflow file is on the default branch." [CITED: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions]
**How to avoid:** Still include `workflow_dispatch` (locked). Do not add inputs. Do not create a remote to test the button.
**Warning signs:** A plan that adds `workflow_dispatch.inputs` or a second workflow.

### Pitfall 6: Blog content warnings misread as failure

**What goes wrong:** The build log contains `[WARN] [glob-loader] No files found matching "**/[^_]*.md" in directory "src\content\blog"` and `[WARN] [content] The collection "blog" does not exist or is empty.` An executor treats that as a failed build and starts adding blog posts.
**Why it happens:** The warnings print during a successful static generation.
**How to avoid:** Success is exit 0 and `49 page(s) built` / `Complete!`. Do not add blog content. Do not change content config.
**Warning signs:** A task that creates `src/content/blog/*.md` during Phase 14.

### Pitfall 7: Stash pop "to get a clean build"

**What goes wrong:** `stash@{0}` (overlay chrome) or `stash@{1}` (unrelated i18n) lands on the branch.
**Why it happens:** STATE.md still says dirty-main build "may still need overlay isolation." That note is stale. This session's build did not need it.
**How to avoid:** Do not run `git stash pop` or `git stash apply`. Stash list after this research is unchanged.
**Warning signs:** `git stash list` no longer shows both entries, or `ToolShell.tsx` gains `tool-panel__chrome`.

Stash list this session (do not pop):

```
stash@{0}: On main: gsd-phase7-overlay-chrome-temp (do not mix with theme)
stash@{1}: On main: pre-02-01-merge unrelated i18n
```

[VERIFIED: git stash list]

## Code Examples

### Workflow file to write

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
```

Sources for the shape, not a copy of a sample file:

- `on.push` / `on.pull_request` `branches` list; pull_request `branches` filters the base ref. [CITED: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions]
- `permissions: contents: read` sets every unspecified scope to `none`. [CITED: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions]
- setup-node v4 cache sample: `node-version: 20` and `cache: 'npm'`, which hashes `package-lock.json`. [CITED: https://github.com/actions/setup-node/blob/v4/README.md]
- `npm run build` is `astro build`. `npm test` is `vitest run`. [VERIFIED: package.json:5-9]

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "test": "vitest run"
}
```

### Proof commands (no staging, no stash)

```bash
npm test
npm run build
git status --short -- src/lib/crontab.ts
```

Expected: tests `27 passed` / `188 passed`; build exit 0 with `49 page(s) built`; status line still `M src/lib/crontab.ts`.

### Island call that must stay one-arg

```tsx
const r = explainCron(input);
```

[VERIFIED: src/components/tools/CrontabExplainer.tsx:17]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No `.github/` | One `ci.yml` | This phase | File only. No remote run. |
| Overlay isolation for `astro build` | Build on the real tree | Proven 2026-09-22 | Stash pop is unnecessary. |
| `actions/setup-node` README samples `@v7` / Node 24 | Pin `@v4` / Node 20 | Locked 2026-09-22 | Do not follow the current README major. |
| Astro Node `^20.19.0 \|\| >=22.12.0` (older compiler-binding note in CLAUDE.md) | Astro 7.3.2 engines `>=22.12.0` and CLI hard exit | Installed tree | Workflow stays Node 20 anyway. See resolved question 1. |

**Deprecated/outdated:**

- CLAUDE.md line that Node `^20.19.0 || >=22.12.0` is "required by `@astrojs/compiler-binding`" describes that optional package's engines, not Astro's CLI gate. `compiler-binding` still says `"node": "^20.19.0 || >=22.12.0"` [VERIFIED: package-lock.json:85-86]. The CLI gate is stricter. Do not use the compiler-binding range to justify Node 20 as sufficient for `astro build`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `runs-on: ubuntu-latest` is the right runner label. Docs samples use it; this fetch did not define the label. | Architecture Patterns | A renamed label would fail only after a remote exists. No remote this phase. |
| A2 | `actions/checkout@v4` floating tag is v4.4.0 (2026-07-20). Search snippet, not a release-page fetch. | Standard Stack | A moved tag changes the checkout commit, not the step list. Discretion allows any v4 pin. |
| A3 | `workflow_dispatch` with no `inputs` key is valid YAML for that event. Docs say inputs are optional; the fetched page did not show a bare example. | Code Examples | Invalid YAML would fail only on a remote. Local `npm test` / `npm run build` do not parse the workflow. |

## Open Questions (RESOLVED)

1. **Does Node 20 actually run `astro build` for this lockfile?**
   - What we know: D-Triggers locks `node-version: 20`. Installed `astro@7.3.2` engines are `"node": ">=22.12.0"` [VERIFIED: node_modules/astro/package.json]. `node_modules/astro/bin/astro.mjs` sets `const engines = '>=22.12.0'` and `process.exit(1)` when `semver.satisfies` fails [VERIFIED: node_modules/astro/bin/astro.mjs:27-39, 62-89]. Install docs: "Node.js - v22.12.0 or higher." [CITED: https://docs.astro.build/en/install-and-setup/]. `@astrojs/preact@6.0.5` engines are also `>=22.12.0` [VERIFIED: node_modules/@astrojs/preact/package.json]. Local proof used Node `v22.22.2`, not 20. `engine-strict` is false, so `npm ci` would still install on Node 20; the Astro CLI would then exit.
   - What's unclear: Nothing about the installed package. A Node 20 binary was not on PATH (`node --version` is v22.22.2 only), so this session did not paste a Node 20 failure log.
   - Recommendation: Keep `node-version: 20` in `ci.yml`. Do not retarget to 22. Do not upgrade Astro. Do not add `engine-strict`. CI-02 is the local proof on the machine that can run Astro, which already passed. A remote Node 20 failure is a future unlock of D-Triggers, not a Phase 14 code change.

2. **Must the island or `crontab.ts` change for the build to pass?**
   - What we know: Working tree `CrontabExplainer.tsx` line 17 is `const r = explainCron(input);` [VERIFIED: src/components/tools/CrontabExplainer.tsx:17]. `git diff -- src/components/tools/CrontabExplainer.tsx` is empty, so HEAD matches. HEAD `crontab.ts` exports `explainCron(input: string)` [VERIFIED: git show HEAD:src/lib/crontab.ts line 16]. Dirty file adds an optional second arg and must stay unstaged.
   - What's unclear: Nothing. Both trees built.
   - Recommendation: No island edit. No crontab commit. If a later build fails on arity, change the call site to the one-arg form already present. Never stage `src/lib/crontab.ts`.

3. **Does the overlay-free build already pass, or does the plan need a product fix first?**
   - What we know: On 2026-09-22, dirty tree: `npm test` → `Test Files  27 passed (27)` / `Tests  188 passed (188)`; `npm run build` → `49 page(s) built` / `Complete!`. Detached worktree at `1f615d1` (committed crontab, no stash): same 27/188 and `49 page(s) built`. Afterward `git status --short -- src/lib/crontab.ts` was still `M`, and both stashes were still present.
   - What's unclear: Nothing for CI-02's command proof.
   - Recommendation: Plan is write `ci.yml`, path-limited add, re-run the two commands, confirm crontab still unstaged. No product code tasks.

4. **Should verification use `vitest run -x`?**
   - What we know: `npx vitest run -x` on vitest 5.0.0 throws `CACError: Unknown option '-x'`. Documented fail-fast is `--bail <number>` [CITED: https://vitest.dev/guide/cli.html]. D-Steps is `npm test`, whose script is `vitest run` with no flags [VERIFIED: package.json:9].
   - What's unclear: Nothing.
   - Recommendation: Proof and workflow both use `npm test`. Do not add `-x` or `--bail`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Local `npm test` / `astro build` proof | ✓ | v22.22.2 | — (workflow still pins 20; see resolved question 1) |
| npm | `npm ci` / scripts | ✓ | 11.9.0 | — |
| `package-lock.json` | `npm ci` and setup-node npm cache | ✓ | lockfileVersion 3 | — |
| Astro CLI | `npm run build` | ✓ | 7.3.2 | — |
| Vitest | `npm test` | ✓ | 5.0.0 | — |
| `gh` | Not required | ✓ (unused) | 2.93.0 | Do not call it. No `gh repo create`. |
| `.github/workflows/` | CI-01 | ✗ (absent) | — | Create `ci.yml`. This is the phase deliverable, not a blocker. |
| GitHub remote | Running the workflow | ✗ by decision | — | Local command proof. Do not create a remote. |

**Missing dependencies with no fallback:** none for the locked scope.

**Missing dependencies with fallback:**

- GitHub remote: workflow cannot execute on GitHub. Fallback is the local proof already recorded. Do not create the remote.

## Validation Architecture

`workflow.nyquist_validation` is `true` in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 5.0.0 (`vitest` `^5.0.0` in package.json; resolved 5.0.0) |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

`vitest.config.ts` (full file):

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
  },
});
```

[VERIFIED: vitest.config.ts:1-9]

There is no separate quick suite. Do not invent `-x`.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CI-01 | Workflow file contains Node 20, `npm ci`, `npm test`, `npm run build`, triggers on push + pull_request to main and workflow_dispatch, and does not invoke `gh` | smoke (file assertion; no unit test harness for YAML) | `npm test` does not parse YAML. Planner verifies by reading `.github/workflows/ci.yml` after write. Optional: `git diff --cached --name-only` equals `.github/workflows/ci.yml` only. | ❌ Wave 0 — do not add a test file. The artifact is the workflow. |
| CI-02 | `npm test` and `astro build` exit 0 without staging crontab and without stash pop | integration (command proof) | `npm test` then `npm run build` | ✅ commands exist. Proof already green this session. Re-run after the workflow commit. |

CI-01 is not a Vitest behavior. Do not add `src/lib/ci.test.ts` or a YAML schema package.

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test` then `npm run build`
- **Phase gate:** Both commands green, `src/lib/crontab.ts` still unstaged, `git stash list` still shows `stash@{0}` and `stash@{1}`, `SITE_ORIGIN` still `https://example.com`

### Wave 0 Gaps

- None for product tests. Existing `src/**/*.test.ts` (27 files) already covers the build inputs.
- Do not add a workflow unit test.
- Do not install a new test framework.

## Security Domain

`security_enforcement` is `true`. ASVS level in config is 1. This phase adds a CI file, not an auth surface.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No login. Do not add tokens or secrets. |
| V3 Session Management | no | No session. |
| V4 Access Control | yes (token scope only) | `permissions: contents: read` so unspecified `GITHUB_TOKEN` scopes are `none`. [CITED: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions] |
| V5 Input Validation | no | No new parser. Do not edit `crontab.ts`. |
| V6 Cryptography | no | No new crypto. Existing hash tool is untouched. |

### Known Threat Patterns for this workflow

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Over-privileged `GITHUB_TOKEN` | Elevation of Privilege | `permissions: contents: read` at workflow top. No `contents: write`. |
| Secret exfiltration via a new step | Information Disclosure | No secrets. No `curl` to a third party. Steps are `npm ci`, `npm test`, `npm run build` only. |
| Pull-request checkout of untrusted code | Tampering | `pull_request` (not `pull_request_target`). Checkout stays default `@v4`. Do not set `persist-credentials: true` beyond the action default, and do not add a script that pushes. |
| Dependency install from a mutated lockfile | Tampering | `npm ci`, not `npm install`. Do not edit `package-lock.json`. |
| Accidental commit of local overlay | Tampering | Path-limited `git add`. crontab and ToolShell stay out. |

No new threat control library. Do not add CodeQL, Dependabot, or a signing job.

## Sources

### Primary (HIGH confidence)

- Local `npm test` / `npm run build` on the dirty tree, 2026-09-22: 27 files, 188 tests, 49 pages, exit 0.
- Detached worktree at `1f615d1` with committed `explainCron(input: string)`: same results.
- `src/components/tools/CrontabExplainer.tsx:17` — `const r = explainCron(input);`
- `src/lib/crontab.ts:1-26` working tree vs `git show HEAD:src/lib/crontab.ts` line 16.
- `node_modules/astro/bin/astro.mjs:27-28,62-89` and `node_modules/astro/package.json` engines.
- `package.json:5-9`, `astro.config.mjs:6-7`, `src/data/site.ts:1-2`, `vitest.config.ts:1-9`.
- `npx vitest run -x` → `CACError: Unknown option '-x'`.

### Secondary (MEDIUM confidence)

- [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions) — triggers, permissions, workflow_dispatch default-branch limit.
- [actions/setup-node v4 README](https://github.com/actions/setup-node/blob/v4/README.md) — `node-version: 20`, `cache: 'npm'`.
- [Install Astro](https://docs.astro.build/en/install-and-setup/) — Node.js v22.12.0 or higher.
- [Vitest CLI](https://vitest.dev/guide/cli.html) — `--bail <number>`; no `-x`.

### Tertiary (LOW confidence)

- [actions/checkout v4.4.0 release snippet](https://github.com/actions/checkout/releases/tag/v4) — floating `@v4` commit. Not fetched as a page body. Discretion: any checkout v4 pin is acceptable.
- [actions/setup-node v4.4.0 tag snippet](https://github.com/actions/setup-node/releases/tag/v4.4.0) — same. Pin `@v4`, not a guessed patch.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — no new packages; pins are locked or read from the repo.
- Architecture: HIGH — one file, three commands, fences verified against the tree.
- Pitfalls: HIGH — crontab, stash, Node engines, and `-x` were probed this session. Node 20 was not executed (binary absent); the Astro CLI source is the evidence, not a pasted Node 20 log.

**Research date:** 2026-09-22
**Valid until:** 2026-10-22 (stable workflow syntax; re-check if Astro is bumped)
