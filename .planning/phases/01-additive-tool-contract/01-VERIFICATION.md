---
phase: 01-additive-tool-contract
verified: 2026-09-11T06:40:00Z
status: passed
score: 8/8 must-haves verified
covered_files:
  - .planning/REQUIREMENTS.md
  - .planning/codebase/CONVENTIONS.md
  - .planning/phases/01-additive-tool-contract/01-01-PLAN.md
  - .planning/phases/01-additive-tool-contract/01-01-SUMMARY.md
  - src/components/tools/ToolIsland.test.ts
  - src/data/tools.test.ts
covered_digest: "v1:sha256:ea3fb8b967a63fd8d7bfa55376306c38aeecefbe67c697a031f83dd5119a8d89"
behavior_unverified: 0
overrides_applied: 0
coincidental_reliance_items:
  - truth: "Completeness tests pass for the current ten tools (EN+ZH markdown present)"
    reason: undeclared-precondition
    harden: "Commit src/content/tools/zh/{slug}.md for the existing ten tools, or declare ZH content as a documented checkout/CI precondition. existsSync currently passes because untracked ZH files are on disk; git ls-files src/content/tools/zh is empty."
---

# Phase 1: Additive tool contract Verification Report

**Phase Goal:** New tools can be added without rewriting the existing ten, and catalog completeness rules fail the build/tests instead of shipping a blank island or extra featured card
**Verified:** 2026-09-11T06:40:00Z
**Status:** passed
**Re-verification:** No — initial verification

**MVP note:** ROADMAP.md `mode: mvp` but the ROADMAP goal is not a User Story (`user-story.validate` = false). PLAN.md goal is a valid User Story and is used for User Flow Coverage. This phase is a CI/docs contract (no visitor-facing product change).

## User Flow Coverage

User story: As a catalog maintainer, I want to have CI fail when a catalog slug lacks a ToolIsland branch or EN/ZH markdown, so that a missing island cannot ship as a blank panel, featured cards stay at six, and the existing ten tools keep working unchanged.

| Step | Expected | Evidence | Status |
|------|----------|----------|--------|
| Lock island coverage | Every `TOOLS` slug has a `slug === '…'` branch in `ToolIsland.astro` or the test fails | `src/components/tools/ToolIsland.test.ts` loops `TOOLS`, `readFileSync(new URL('./ToolIsland.astro', import.meta.url))`, `source.includes(\`slug === '${slug}'\`)`. Named test passed. Fake slug `markdown-preview` is not in source. | ✓ |
| Lock EN+ZH markdown | Missing `src/content/tools/{slug}.md` or `src/content/tools/zh/{slug}.md` fails `npm test` | `src/data/tools.test.ts` `existsSync(URL)` loop over `TOOLS`. Named test passed on this worktree. | ✓ |
| Keep featured at six | Homepage featured set stays length 6; no extra featured card | `getFeaturedTools()` used by `src/pages/index.astro` and `src/pages/zh/index.astro`. `expect(featured).toHaveLength(6)` passed. Catalog still 10 rows, none of the locked-eight slugs present. | ✓ |
| Do not rewrite the ten | Existing islands/libs/pages unchanged by this phase | Plan commits `94fb784`, `b37cf68`, `3e8482b` touch only the three allowlisted paths. `tools.ts` / `ToolIsland.astro` last product commits predate the phase. | ✓ |

Outcome (`so that` clause): missing island cannot ship as a blank panel (CI source-read), featured stays six, existing ten untouched. Observably true in this checkout.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | Visitor can still use all ten existing tools on EN and `/zh/` with unchanged behavior | ✓ VERIFIED | Phase commits did not touch product files. `ToolIsland.astro` still maps all 10 slugs with `client:load`. EN `src/pages/tools/[slug].astro` and ZH `src/pages/zh/tools/[slug].astro` still `getStaticPaths` from `TOOLS` and render `ToolIsland`. Existing `src/lib/*.test.ts` cases remain listed (json, jwt, base64, url, hash, regex, timestamp, crontab, color, limits). CONTEXT/PLAN prove this via Vitest, not Playwright. |
| 2 | Homepage still shows exactly six featured tools; catalog slugs are unique and new tools are not featured; catalog snapshot stays at 10 | ✓ VERIFIED | Named tests passed: `has exactly 10 tools`, `features exactly six tools including json-formatter and jwt-decoder`. `TOOLS` has 10 rows; 6 `featured: true`. No locked-eight slugs in `src/`. Homepages render `getFeaturedTools()`. Unique-slugs test still present. |
| 3 | Completeness tests pass for the current ten tools (unique slugs, EN+ZH markdown present, ToolIsland branch per catalog slug) | ✓ VERIFIED (coincidental-reliance) | Named markdown + island tests passed. All 10 EN files tracked; all 10 ZH files exist on disk. Unique slugs test present. ZH markdown is untracked (`git ls-files src/content/tools/zh` empty) — see coincidental_reliance_items. |
| 4 | A catalog slug with no ToolIsland branch fails tests rather than rendering a blank panel | ✓ VERIFIED | `ToolIsland.test.ts` asserts `source.includes(\`slug === '${slug}'\`)` per `TOOLS` slug with message `missing ToolIsland branch for ${slug}`. Named test passed. Independent check: `slug === 'markdown-preview'` is absent from `ToolIsland.astro`. |
| 5 | npm test fails when EN or ZH markdown is missing for any catalog slug | ✓ VERIFIED | `existsSync(en)` / `existsSync(zh)` with messages `missing EN markdown for ${slug}` / `missing ZH markdown for ${slug}`. Independent check: `src/content/tools/zh/markdown-preview.md` does not exist. Loop is over `TOOLS`, not a copied slug array. |
| 6 | Category grouping counts TOOLS.length so later slices update one snapshot only | ✓ VERIFIED | `expect(count).toBe(TOOLS.length)` in `groups by category without dropping tools`. Named test passed. Snapshot remains `toHaveLength(10)` (not a second hardcoded grouping 10). |
| 7 | Existing ten tools are untouched; this plan only changes tests plus CONVENTIONS.md | ✓ VERIFIED | `git show --stat` on `94fb784` (tests), `b37cf68` (tools.test.ts grouping), `3e8482b` (CONVENTIONS.md). No `tools.ts`, `ToolIsland.astro`, islands, pages, limits, i18n, or content markdown in those commits. Harvested PLAN human-check verified programmatically. |
| 8 | Existing tool pages such as json-formatter do not load SQL, Markdown, QR, or Diff chunks; the 8-file additive checklist and island-split rule are documented for later slices | ✓ VERIFIED | `package.json` has no SQL/Markdown/QR/Diff deps. No `src/lib/index.ts`. CONVENTIONS.md sections `Adding a tool (8-file checklist)` and `Island split (heavy libraries)` sit before the Convention analysis footer; forbid barrel; keep static ToolIsland imports; defer `dist/_astro/` inspection to Phase 3. |

**Score:** 8/8 truths verified (0 present, behavior-unverified)

## Human Verification

N/A — Infrastructure/foundation phase with no user-facing elements.
All acceptance criteria are verifiable programmatically.
Harvested PLAN `<human-check>` (allowlist diff) was confirmed via `git show --stat` on the three plan commits; not routed to UAT.

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/data/tools.test.ts` | Catalog snapshot, unique slugs, featured === 6, grouping via TOOLS.length, EN+ZH markdown existsSync loop | ✓ VERIFIED | Exists, substantive (55 lines), imported by Vitest `src/**/*.test.ts`. Named tests passed. `gsd_run query verify.artifacts` passed. |
| `src/components/tools/ToolIsland.test.ts` | Source-read coverage: every TOOLS slug has a slug-equals branch | ✓ VERIFIED | Exists (18 lines), sibling of `ToolIsland.astro`, `.test.ts` not tsx. Loops `TOOLS`, `readFileSync(URL)`, `includes` only. Named test passed. |
| `.planning/codebase/CONVENTIONS.md` | 8-file checklist (CAT-06) and island-split rule (CAT-04) | ✓ VERIFIED | Appended after Module Design / Barrel Files, before footer. Eight items including `featured: false`, ZH_ERRORS, EN md, ZH md. Clone target JsonFormatter + `src/lib/json.ts`. No barrel. |

**Artifacts:** 3/3 verified (`verify.artifacts` all_passed=true)

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `src/data/tools.test.ts` | `src/content/tools/{slug}.md` and `src/content/tools/zh/{slug}.md` | `existsSync(new URL(..., import.meta.url))` looped over TOOLS | ✓ WIRED | Pattern `existsSync(` present. URLs built from `import.meta.url`; objects passed to `existsSync`, not `.pathname`. |
| `src/components/tools/ToolIsland.test.ts` | `src/components/tools/ToolIsland.astro` | `readFileSync` URL + includes slug-equals substring per TOOLS slug | ✓ WIRED | `readFileSync(new URL('./ToolIsland.astro', import.meta.url), 'utf8')` then `source.includes(\`slug === '${slug}'\`)`. |
| `src/data/tools.test.ts` | `src/data/tools.ts` TOOLS | grouping reduce count equals TOOLS.length; snapshot toHaveLength(10) | ✓ WIRED | `expect(count).toBe(TOOLS.length)` and `expect(TOOLS).toHaveLength(10)` both present. |

**Wiring:** 3/3 connections verified (`verify.key-links` all_verified=true)

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `tools.test.ts` | `TOOLS` / `getFeaturedTools()` / `getToolsByCategory()` | `src/data/tools.ts` live registry | Yes — 10 real catalog rows, 6 featured | ✓ FLOWING |
| `tools.test.ts` markdown loop | `existsSync(en/zh)` | filesystem next to `import.meta.url` | Yes — 10 EN tracked + 10 ZH on disk | ✓ FLOWING |
| `ToolIsland.test.ts` | `source` | `ToolIsland.astro` via `readFileSync` | Yes — production if-chain text | ✓ FLOWING |
| Homepages | `featured` | `getFeaturedTools()` | Yes — filter of `TOOLS` | ✓ FLOWING |

No hollow props. Completeness tests do not mock `node:fs`.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Catalog length 10 | `npx vitest run src/data/tools.test.ts -t "has exactly 10 tools"` | 1 passed | ✓ PASS |
| Featured length 6 | `npx vitest run src/data/tools.test.ts -t "features exactly six"` | 1 passed | ✓ PASS |
| Grouping uses TOOLS.length | `npx vitest run src/data/tools.test.ts -t "groups by category"` | 1 passed | ✓ PASS |
| EN+ZH markdown loop | `npx vitest run src/data/tools.test.ts -t "has EN and ZH markdown for every catalog slug"` | 1 passed | ✓ PASS |
| ToolIsland slug-equals coverage | `npx vitest run src/components/tools/ToolIsland.test.ts -t "maps every catalog slug to a slug === branch"` | 1 passed | ✓ PASS |
| Missing island substring | node check `source.includes("slug === 'markdown-preview'")` | `false` | ✓ PASS |
| Test enumeration | `npx vitest list` | includes ToolIsland coverage + EN/ZH markdown + snapshot/featured/grouping | ✓ PASS |

Full suite was not re-run here (orchestrator: npm test already 13 files / 51 tests). Named tests only.

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No PLAN/SUMMARY probes; no `scripts/*/tests/probe-*.sh` | SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| CAT-01 | 01-01-PLAN.md | Each new tool registered in TOOLS with unique slug, category, relatedSlugs, featured false | ✓ SATISFIED | Phase-1 meaning (CONTEXT): harness + rules, not the eight tools. Snapshot 10, unique slugs, featured 6, grouping `TOOLS.length`, CONVENTIONS requires `featured: false` for later slices. No new catalog rows (intentional). |
| CAT-02 | 01-01-PLAN.md | EN and ZH content-collection markdown so astro build succeeds | ✓ SATISFIED | Fail-closed `existsSync` loop. astro build not required this phase. ZH files present on disk but untracked — harness is real; git cleanliness is coincidental-reliance, not a missing test. |
| CAT-03 | 01-01-PLAN.md | ToolIsland maps each slug; missing branch fails tests rather than blank panel | ✓ SATISFIED | `ToolIsland.test.ts` source-read includes check; named test passed. |
| CAT-04 | 01-01-PLAN.md | Heavy libraries load only on that tool's page | ✓ SATISFIED | Documented island-split / no `src/lib` barrel. No heavy libs installed. Chunk regression deferred to Phase 3 (ROADMAP SC + CONTEXT). |
| CAT-05 | 01-01-PLAN.md | Existing ten tools keep current behavior except catalog/relatedSlugs wiring | ✓ SATISFIED | Plan commits allowlisted; `relatedSlugs` in `tools.ts` unchanged this phase; existing lib tests still enumerated. |
| CAT-06 | 01-01-PLAN.md | Live compute, copy, size guard, EN+ZH island copy, ZH_ERRORS in the same slice | ✓ SATISFIED | 8-file checklist in CONVENTIONS.md items 1–8 (lib+test, island, ToolIsland branch, ui.ts, ZH_ERRORS, EN md, ZH md, featured false). |

**Coverage:** 6/6 phase-mapped IDs accounted for. No orphaned Phase 1 IDs. Tool-feature IDs (COUNT-*, CASE-*, LORM-*, PASS-*, SQL-*, DIFF-*, MD-*, QR-*) belong to Phases 2–6.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `src/data/tools.test.ts` | CAT-01, CAT-02 | 7 | 0 | no | Value (`toHaveLength`, `toBe(TOOLS.length)`, `existsSync` → `toBe(true)`) | OK |
| `src/components/tools/ToolIsland.test.ts` | CAT-03 | 1 | 0 | no | Value (`includes` → `toBe(true)` with per-slug message) | OK |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0 (real `node:fs`, no memfs / no `vi.mock`)
**Insufficient assertions:** 0 for this phase's contract. Island check is substring `includes` (plan-mandated; can match a comment). Markdown test proves files exist, not `astro build` (explicitly out of scope).

### Decision Coverage

No trackable decisions in CONTEXT.md. (`check.decision-coverage-verify` skipped=true, blocking=false, total=0)

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | None in allowlisted files (`TBD`/`FIXME`/`XXX`/`TODO`/stubs) | — | — |

Untracked `src/content/tools/zh/*.md` is outside the allowlist (copied so the harness could go green). Not a debt marker in phase-modified files.

### Human Verification Required

None. Infrastructure/foundation phase. PLAN harvested allowlist check verified via git.

### Gaps Summary

None blocking. Later-phase work (eight tools, `dist/_astro/` chunk regression, `INPUT_MAX_BYTES`) is scheduled in Phases 2–6 and is not a Phase 1 gap.

Advisory (does not affect status): ZH markdown for the existing ten tools is on disk but not in git. A clean clone will fail CAT-02 until those files are committed by bilingual/content work. That is the harness working as designed, plus an undeclared checkout precondition.

---

_Verified: 2026-09-11T06:40:00Z_
_Verifier: Claude (gsd-verifier)_
