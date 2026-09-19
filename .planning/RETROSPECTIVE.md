# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.1 — Frontend Polish

**Shipped:** 2026-09-19
**Phases:** 4 | **Plans:** 4 | **Sessions:** multi-session autonomous (discuss → plan → execute → UAT)

### What Was Built

- FOUC-safe two-state light/dark theming (`ThemeInit` + `ThemeToggle` + `:root` / `:root[data-theme="light"]`)
- Accessible ≤640px hamburger (`NavMenu.astro`, inert, Escape, EN/ZH labels)
- Catalog `.card-grid` 1/2/3 columns and `:root` `--sp-1`…`--sp-12`
- Native FAQ `details`/`summary` plus `.tool-panel` shadow and invert / color-mix button chrome

### What Worked

- Visual-only fence (no `src/lib`, no Tailwind, no new packages) kept scope honest
- Working from HEAD chrome, not the dirty overlay, avoided committing LED ToolShell / LangSwitch / `src/pages/zh/`
- UI-SPEC gate caught `--sp-3` 12px before execute (Phase 10)
- CR-01 scoped `.card-grid:not(.tool-grid)` and `a.tool-card` so in-tool WordCounter/TextDiff tiles stayed 1-col

### What Was Inefficient

- Dirty overlay broke `astro build` (`UNRESOLVED_IMPORT`); each execute needed git-dir isolation then restore
- Phases 7/8/9 verification digest went stale after later `global.css` edits — closeout required override
- Autonomous paused often for grey areas and human UAT (correct, but slow)
- Executor ConnectionRefused once mid Phase 9; resume had to avoid re-checking out wrappers

### Patterns Established

- Chrome disclosure is static Astro + `is:inline` IIFE, not a Preact island
- Spacing tokens live on `:root` only; light selector does not duplicate `--sp-*`
- Catalog lists wrap maps in `.card-grid`; tool islands keep `.tool-grid`
- Overlay isolation for SSG proof: backup dirty files, build HEAD+plan, restore — do not require green build after restore

### Key Lessons

1. Shared class names (`.card-grid`, `.tool-card`) on in-tool islands need scoped selectors before catalog CSS ships
2. UI-SPEC token sets must match the locked scale; a 12px `--sp-3` is a BLOCK even if it looks fine
3. Later CSS phases will stale earlier verification; record human UAT as the ship signal, not digest freshness
4. Never pop overlay/i18n stashes onto a visual milestone commit

### Cost Observations

- Model mix: mixed (planner/checker/executor plus orchestrator)
- Sessions: continued across compact; Phase 7–10 product work ~3 days (2026-09-16 → 2026-09-18)
- Notable: isolation `none` on dirty `main`; path-limited `git add` only

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | multi | 6 | Additive 8-file island slices; completeness harness |
| v1.1 | multi | 4 | Visual-only; UI-SPEC + overlay isolation; override_closeout on stale digest |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 155 tests / 23 files (carried) | catalog 18 | 4 text/generate tools before SQL/Diff/MD/QR |
| v1.1 | 155 tests / 23 files (unchanged) | file `rg` + Vitest + human UAT | none (CSS + tiny inline scripts) |

### Top Lessons (Verified Across Milestones)

1. Work from HEAD, never the dirty overlay — mixing i18n/LED chrome into a scoped milestone burns isolation budget
2. Catalog/completeness contracts from v1.0 still gate visual work: do not touch `TOOLS` or `src/lib`
3. Human UAT is the ship signal for CSS phases; Nyquist VALIDATION draft is optional, not a blocker
