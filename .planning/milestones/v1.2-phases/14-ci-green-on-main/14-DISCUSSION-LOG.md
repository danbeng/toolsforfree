# Phase 14: CI Green on Main - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-22
**Phase:** 14-CI Green on Main
**Areas discussed:** Workflow triggers, Overlay-free build proof, CI step scope

---

## Workflow triggers

| Option | Description | Selected |
|--------|-------------|----------|
| push + pull_request on main + workflow_dispatch | File only; no remote | ✓ |
| workflow_dispatch only | Manual only | |

**User's choice:** 你判断就好
**Notes:** D-Triggers — push and pull_request to main, plus workflow_dispatch. No gh repo create.

---

## Overlay-free build proof

| Option | Description | Selected |
|--------|-------------|----------|
| Build on current tree; leave crontab.ts unstaged | No stash pop | ✓ |
| Stash crontab.ts then build | Would hide the dirty file | |

**User's choice:** 你判断就好
**Notes:** D-Proof — astro build must pass while crontab.ts stays unstaged.

---

## CI step scope

| Option | Description | Selected |
|--------|-------------|----------|
| npm ci, npm test, npm run build only | Matches CI-01 | ✓ |
| Also lint / astro check | Extra scope | |

**User's choice:** 你判断就好

---

## Claude's Discretion

All three gray areas — user said decide.

## Deferred Ideas

- Remote / gh repo create
- SITE_ORIGIN
- LED ToolShell and crontab.ts commit
- lint / astro check / deploy
