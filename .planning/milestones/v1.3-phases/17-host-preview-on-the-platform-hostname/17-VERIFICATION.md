---
phase: 17-host-preview-on-the-platform-hostname
verified: 2026-09-23T14:10:00Z
status: passed
score: 3/3
---

# Phase 17 Verification

**Status:** passed

| Requirement | Evidence |
|-------------|----------|
| HOST-01 | `.github/workflows/deploy.yml` publishes `dist/` after CI. `ci.yml` last commit is still `aa8ab15`. Deploy run 35875760159 succeeded. |
| HOST-02 | `https://danbeng.github.io/toolsforfree/`, `/zh/`, and `/tools/json-formatter/` returned 200. Each unslashed URL was one 301 to the slashed form, then 200. |
| HOST-03 | `https://danbeng.github.io/toolsforfree/this-path-is-not-a-tool/` returned 404 with the site "Page not found" heading and no `/zh/404/` link. |

`SITE_ORIGIN` is still `https://example.com`. `base` is `/toolsforfree` until Phase 19. `src/lib/crontab.ts` stayed unstaged.
