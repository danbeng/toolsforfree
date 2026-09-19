---
phase: "9"
slug: "grid-spacing"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-16"
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest `^5.0.0` |
| **Config file** | `vitest.config.ts` (`include: ['src/**/*.test.ts']`, `environment: 'node'`, `passWithNoTests: true`) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` (`vitest run`) |
| **Estimated runtime** | ~5 seconds |

Do **not** add Playwright. Do **not** add `layout.test.ts` / `*.test.tsx` or switch Vitest to jsdom. Grid behavior is document CSS; Nyquist coverage is **file assertions + build + human viewport UAT**, matching Phase 7/8.

Do **not** add a unit test that imports `TOOLS` to “prove” six featured cards — `src/data/tools.test.ts` already asserts featured length 6; this phase must not edit that file.

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test` && `npm run build`
- **Before `/gsd-verify-work`:** Full suite green + file assertions + human 1/2/3-col checklist
- **Max feedback latency:** 30 seconds (`npm test`); build ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | LAY-01 | — | N/A | smoke (file) | `rg -n "card-grid" src/styles/global.css src/pages/index.astro src/pages/tools/index.astro`; `rg -n "min-width: 1080px" src/styles/global.css` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | LAY-02 | — | N/A | smoke (file) | `rg -n "--sp-1:" src/styles/global.css` through `--sp-12`; tokens not inside `[data-theme="light"]` | ❌ W0 | ⬜ pending |
| 09-01-03 | 01 | 1 | LAY-03 | — | N/A | smoke (file) | `rg -n "padding: 0 var(--sp-4)" src/styles/global.css`; `rg -n "gap: var(--sp-5)" src/styles/global.css`; `rg -n "width: 44px" src/styles/global.css`; `.tool-grid` still `gap: 1rem` | ❌ W0 | ⬜ pending |
| 09-01-04 | 01 | 1 | overlay | T-09-01 | Path-limited add; no `src/pages/zh/` / `LangSwitch` | smoke (git) | `git diff --cached --name-only` must not list `src/pages/zh/` or `LangSwitch.astro` | ❌ W0 | ⬜ pending |
| 09-01-05 | 01 | 1 | regression | — | N/A | unit | `npm test` | ✅ | ⬜ pending |
| 09-01-06 | 01 | 1 | build | — | HEAD restore + wrappers compile | smoke | `npm run build` | ❌ W0 | ⬜ pending |
| 09-01-07 | 01 | 1 | LAY-01 | — | N/A | manual / backstop | DevTools 719 / 720–1079 / 1080 | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

Existing `src/lib/*.test.ts` must stay green (`npm test`) as a regression gate — they do not cover LAY-*.

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Gaps are verification steps, not missing test files in `src/`:

- [ ] Plan tasks must include `git checkout HEAD --` on `src/pages/index.astro`, `src/pages/tools/index.astro`, and `src/components/ToolCard.astro` **before** markup edits
- [ ] Plan tasks must include `rg` / `npm run build` verification (these **are** the automated commands)
- [ ] No automated viewport test — **manual-only is justified**. Do not add Playwright this phase (new package forbidden)
- [ ] Do **not** create `src/lib/layout.ts` or CSS unit tests
- Framework install: none — Vitest already present

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Home featured + each `/tools/` category 1 column | LAY-01 | Needs viewport | DevTools width **719px** |
| Same grids 2 columns; `.tool-grid.split` on a tool page still 2 columns | LAY-01 | Needs viewport | Width **720px** and **1079px**; open a split-pane tool and confirm split is still 2, not 3 |
| Same catalog grids 3 columns inside `--content`; no overlap; no horizontal page scroll from the grid | LAY-01 | Needs viewport | Width **1080px** on `/` and `/tools/` |
| Auth category one card occupies first track only | LAY-01 | Needs viewport | `/tools/#category-auth` at 1080px |
| Hover: title + description turn `--accent`; border and fill stay idle | UI-SPEC | Needs pointer | Hover a card in both themes |
| Keyboard focus: existing 2px accent outline | inherit | Needs focus | Tab onto a card |
| Light theme cards use light `--panel` / `--border` / `--text` | Phase 7 tokens | Needs theme toggle | Toggle theme on catalog |
| After token swap, cards/sections do not overlap or collapse | LAY-03 | Needs eyeball | Home + `/tools/` at 719 / 720 / 1080 |
| Diff does not contain overlay hero/kicker/zh | HEAD discipline | Needs git | Review `git diff --cached --name-only` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (`npm test`)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
