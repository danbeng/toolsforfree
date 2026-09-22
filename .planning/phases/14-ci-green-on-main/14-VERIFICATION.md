---
phase: 14-ci-green-on-main
verified: 2026-09-22T01:21:45Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
behavior_unverified: 0
decision_coverage:
  honored: 3
  total: 3
  not_honored: []
covered_files:
  - .github/workflows/ci.yml
  - .planning/REQUIREMENTS.md
  - .planning/phases/14-ci-green-on-main/14-01-PLAN.md
  - .planning/phases/14-ci-green-on-main/14-01-SUMMARY.md
  - package-lock.json
  - package.json
  - src/components/ToolShell.tsx
  - src/data/site.ts
  - src/lib/crontab.ts
covered_digest: "v1:sha256:4fbc962aff15a8586d223fc6dc5c8d083bb3efff1ba2bb7a4078830026677471"
---

# Phase 14: CI Green on Main Verification Report

**Phase Goal:** A clean `main` checkout (and a workflow file) can run `npm test` then `astro build` with no overlay isolation
**Verified:** 2026-09-22T01:21:45Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `.github/workflows/ci.yml` exists, is named CI, and triggers on push and pull_request to main plus workflow_dispatch (CI-01, D-Triggers) | ✓ VERIFIED | File is 24 lines. Parsed YAML: `name: CI`; `on` keys are `push`, `pull_request`, `workflow_dispatch`; both branch filters are `[main]`; `workflow_dispatch` has no inputs. |
| 2 | The workflow pins `actions/setup-node@v4` to `node-version: 22` with `cache: npm`, then runs exactly `npm ci`, `npm test`, and `npm run build` (CI-01, D-Steps, D-Triggers) | ✓ VERIFIED | Job `ci` on `ubuntu-latest`. Steps in order: `actions/checkout@v4`, `actions/setup-node@v4` with `node-version: 22` and `cache: npm`, then the three `run` steps. No `node-version: 20`. |
| 3 | `permissions` are `contents: read`; the file has no secrets, no deploy job, no lint, no `astro check`, and no `gh` invocation (CI-01, D-Triggers) | ✓ VERIFIED | Parsed `permissions: { contents: read }`. Scan for `node-version: 20`, `astro check`, `secrets:`, `contents: write`, `npm install`, `deploy`, and `gh` found no hits. |
| 4 | `npm test` then `npm run build` exit 0 on the current working tree with no overlay isolation and no stash pop (CI-02, D-Proof) | ✓ VERIFIED | Re-run this pass: `npm test` → 27 files / 188 tests passed (3.59s). `npm run build` → exit 0, 49 pages, `dist/` static output. `find dist -name '*.html'` = 49. Blog glob warnings printed; process still exited 0. No worktree and no stash pop used. |
| 5 | `src/lib/crontab.ts` stays unstaged after the proof; LED ToolShell and `SITE_ORIGIN` are untouched (D-Proof) | ✓ VERIFIED | After both commands: `git status --short -- src/lib/crontab.ts` is ` M src/lib/crontab.ts`. `git diff --cached --name-only` is empty. `stash@{0}` and `stash@{1}` still listed. `SITE_ORIGIN` is `https://example.com`. No `tool-panel__chrome` in `src/`. Product commit `aa8ab15` touches only `.github/workflows/ci.yml`. No git remote. |

**Score:** 5/5 truths verified (0 present, behavior-unverified)

Roadmap success criteria (same contract, not extra truths):

1. Workflow file runs Node 22, `npm ci`, `npm test`, then `astro build` — covered by truths 1–3. Remote absence is in-scope: `git remote` is empty; CI-01 is the file only.
2. On `main` without overlay isolation, `npm test` and `astro build` pass — covered by truth 4 (commands re-run by the verifier, not taken from SUMMARY.md).
3. LED ToolShell, `tool-panel__chrome`, and `src/lib/crontab.ts` remain uncommitted; `SITE_ORIGIN` unchanged; no new tools — covered by truth 5. `package.json` was not edited (`test` is `vitest run`, `build` is `astro build`).

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `.github/workflows/ci.yml` | Node 22 CI file with `npm ci`, `npm test`, `npm run build` | ✓ VERIFIED | Exists, 24 lines, substantive YAML, committed in `aa8ab15` (1 file, +24). Worktree matches HEAD (`git diff HEAD` empty). Contains `node-version: 22`. |

**Artifacts:** 1/1 verified

Level 4 data-flow: not applicable. The artifact is a workflow declaration, not a rendered value backed by a query.

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `.github/workflows/ci.yml` | `package.json` | `npm test` is `vitest run`; `npm run build` is `astro build` | ✓ WIRED | Workflow `run: npm test` and `run: npm run build`. `package.json` scripts: `"test": "vitest run"`, `"build": "astro build"`. Both commands exit 0 when invoked. |
| `.github/workflows/ci.yml` | `package-lock.json` | `npm ci` plus `setup-node` `cache: npm` hashes the lockfile | ✓ WIRED | `package-lock.json` present. Workflow step is `npm ci`, not `npm install`. Lockfile was not edited by the product commit. |

**Wiring:** 2/2 connections verified

### Data-Flow Trace (Level 4)

Not applicable. No rendered dynamic data. The workflow invokes the existing `package.json` scripts; those scripts were executed and exited 0.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `npm test` exits 0 | `npm test` | 27 files, 188 tests passed, exit 0 | ✓ PASS |
| `npm run build` exits 0 and emits pages | `npm run build` | exit 0, "49 page(s) built"; `find dist -name '*.html'` = 49 | ✓ PASS |
| Workflow YAML shape | Node YAML parse of `.github/workflows/ci.yml` | name CI; on push/pull_request/workflow_dispatch; permissions contents read; 5 steps ending in npm ci / npm test / npm run build; node-version 22 | ✓ PASS |
| crontab stays unstaged; stashes remain | `git status --short`, `git diff --cached`, `git stash list` | ` M src/lib/crontab.ts`; index empty; `stash@{0}` and `stash@{1}` present | ✓ PASS |
| SITE_ORIGIN unchanged; no remote | `rg SITE_ORIGIN src/data/site.ts`; `git remote` | `https://example.com`; no remotes | ✓ PASS |

### Probe Execution

No phase probes declared. Step 7c skipped.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| CI-01 | 14-01-PLAN.md | `.github/workflows/ci.yml` runs Node 22, `npm ci`, `npm test`, `astro build` (file only; no remote). Node 20 overridden 2026-09-22 because Astro 7.3.2 requires `>=22.12.0`. | ✓ SATISFIED | Workflow file matches. `node_modules/astro/package.json` engines.node is `>=22.12.0`. No remote. |
| CI-02 | 14-01-PLAN.md | On `main` without overlay isolation, `npm test` and `astro build` pass | ✓ SATISFIED | Both commands re-run this pass and exited 0. No overlay worktree, no stash pop. |

**Coverage:** 2/2 requirements satisfied

No orphaned requirement IDs. REQUIREMENTS.md maps only CI-01 and CI-02 to this phase, and both are claimed by 14-01-PLAN.md.

### Decision Coverage

All trackable CONTEXT.md decisions are honored by shipped artifacts (3/3). Non-blocking.

| Decision | Honored | Evidence |
|----------|---------|----------|
| D-Triggers | yes | `name: CI`; push and pull_request on `main`; `workflow_dispatch` with no inputs; `permissions: contents: read`; `node-version: 22`; `cache: npm`; no secrets, no deploy, no remote |
| D-Steps | yes | Exactly `npm ci`, `npm test`, `npm run build`. No lint, no `astro check`, no extra jobs |
| D-Proof | yes | Commands run on the current tree. `src/lib/crontab.ts` unstaged. Both stashes present. `SITE_ORIGIN` unchanged. No `tool-panel__chrome` |

CONTEXT.md discretion still says "as long as Node is 20". That sentence is superseded by the D-Triggers user override (2026-09-22) and by CI-01's Node 22 text. The shipped pin is 22, which is the contract.

### Test Quality Audit

CI-01 and CI-02 are not linked to a unit-test file. CI-01 is a workflow file. CI-02 is proved by running `npm test` and `npm run build`, not by a test that asserts those commands.

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|------------|--------|---------|----------|-----------------|---------|
| (none — commands re-run) | CI-02 | n/a | 0 | no | Behavioral (process exit 0 + page count) | OK |
| `.github/workflows/ci.yml` | CI-01 | n/a | 0 | no | Value (parsed YAML fields) | OK |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** 0

No test file was added or modified by this phase. Existing Vitest suite is the subject of CI-02, not a new proof harness.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | None in `.github/workflows/ci.yml`. No TBD/FIXME/XXX. No stub returns. |

Blog glob / empty-collection warnings during `astro build` are not a failure. The process exited 0, which is the plan's fail condition.

### Human Verification Required

N/A — Infrastructure/foundation phase (CI workflow file plus local command proof). No user-facing elements. Contrast/UAT is not in this phase. All acceptance criteria were checked programmatically, including re-running both commands.

### Gaps Summary

No gaps. The phase goal holds in the codebase:

- The workflow file is the CI-01 artifact and matches the locked shape (Node 22, three steps, contents read, no remote required).
- CI-02 was re-proved on this tree: `npm test` and `npm run build` both exited 0 without overlay isolation.
- Hard fences hold: crontab.ts unstaged, both stashes present, SITE_ORIGIN unchanged, no LED chrome, no new remote, product commit scoped to the workflow file.

---

_Verified: 2026-09-22T01:21:45Z_
_Verifier: Claude (gsd-verifier)_
