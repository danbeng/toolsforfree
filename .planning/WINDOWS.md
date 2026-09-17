---
schema_version: 1
open_count: 0
waived_count: 0
fixed_count: 1
total_count: 1
last_updated: 2026-09-17T18:58:38.914Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 09 | deviation | src/pages/404.astro |  | Overlay i18n import blocked astro build; isolated overlay to git-dir backup for T-09-01, then restored. No overlay committed. | fixed |  | 2026-09-17T18:55:51.469Z | 2026-09-17T18:58:38.914Z |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "09",
    "file": "src/pages/404.astro",
    "line": null,
    "description": "Overlay i18n import blocked astro build; isolated overlay to git-dir backup for T-09-01, then restored. No overlay committed.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-09-17T18:55:51.469Z",
    "resolved_at": "2026-09-17T18:58:38.914Z"
  }
]
````
