---
phase: 15-404-wiring-and-catalog-copy-guard
verified: 2026-09-27T08:33:34Z
status: passed
score: 5/5 must-haves verified
covered_files:
  - .planning/REQUIREMENTS.md
  - .planning/ROADMAP.md
  - .planning/phases/15-404-wiring-and-catalog-copy-guard/15-01-PLAN.md
  - .planning/phases/15-404-wiring-and-catalog-copy-guard/15-01-SUMMARY.md
  - .planning/phases/15-404-wiring-and-catalog-copy-guard/15-CONTEXT.md
  - .planning/phases/18-origin-swap/18-CONTEXT.md
  - src/components/Header.astro
  - src/components/LangSwitch.astro
  - src/components/RelatedTools.astro
  - src/components/ToolCard.astro
  - src/i18n/base.ts
  - src/i18n/catalog-copy.test.ts
  - src/i18n/catalog-copy.ts
  - src/i18n/path.ts
  - src/layouts/BaseLayout.astro
  - src/pages/404.astro
covered_digest: "v1:sha256:f76ca79f736e415cdd3d8ed39b077a0ba84d564abd9c94bfd6c653a0d30d87d1"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: passed
  previous_score: 5/5
  reason: "Stale fingerprint. Phase 18 changed LangSwitch, Header, ToolCard, RelatedTools, BaseLayout, and 404 (base-aware hrefs) and amended D-09 (noindex pages emit no canonical)."
  gaps_closed: []
  gaps_remaining: []
  regressions: []
decision_coverage:
  honored: 7
  total: 7
  not_honored: []
  superseded:
    - "Phase 15 UI-SPEC discretion that kept the 404 canonical at /404/. Superseded by Phase 18 D-09 (amended 2026-09-24): noindex pages emit no canonical and no alternates."
---

# Phase 15: 404 wiring and catalog-copy guard Verification Report

**Phase Goal:** A visitor on the 404 page is not sent to a missing Chinese 404, and a catalog card still renders when a tool's UI copy key is absent
**Verified:** 2026-09-27T08:33:34Z
**Status:** passed
**Re-verification:** Yes. The previous report went stale after Phase 18 changes. This run checks the current code and a fresh `dist/`.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | A visitor on the 404 page sees no LangSwitch link to `/zh/404/` | ✓ VERIFIED | `src/pages/404.astro` still sets `langSwitchPath="/"`. Header passes it only when set. LangSwitch uses `path ?? stripBase(Astro.url.pathname)`, then `withBase(switchLocalePath(...))`. The `dist/404.html` LangSwitch hrefs are only `/toolsforfree/` and `/toolsforfree/zh/`. |
| 2 | The 404 document does not advertise `/zh/404/` in canonical or hreflang, and the document is `noindex` | ✓ VERIFIED | Phase 18 D-09 is amended. In `BaseLayout.astro`, the `noindex` branch emits only `<meta name="robots" content="noindex" />`. The else branch holds the canonical and all three alternates. `dist/404.html` has the robots meta and no `rel="canonical"` or `rel="alternate"`. GUARD-02 now holds because the 404 has no canonical and no alternates. |
| 3 | A catalog card and a related-tools card still render when `copy.tools[slug]` is missing, using the catalog name and short description, and neither component throws | ✓ VERIFIED | `toolLabels` is unchanged. It returns the UI-copy entry when present, otherwise `{ tool.name, tool.shortDescription }`, and never throws. ToolCard renders both fields and RelatedTools renders `name` only. Phase 18 only wrapped their hrefs in `withBase`. `npx vitest run src/i18n/catalog-copy.test.ts` passes 3/3. |
| 4 | A search of the built site for `zh/404` is empty | ✓ VERIFIED | Fresh `npm run build` built 49 pages and exited 0. Grep of `dist` for `zh/404` in `*.html`, `*.xml`, `*.txt`, and `*.json` found nothing. `src/pages/zh/404.astro` does not exist. |
| 5 | Pages without the LangSwitch override still switch the current path, and `path.ts` has no `/404/` special case | ✓ VERIFIED | Header renders `<LangSwitch locale={locale} />` when `langSwitchPath` is omitted. `src/i18n/path.ts` has no `404` match. `noindex` and `langSwitchPath=` are set only in `src/pages/404.astro`. 48 of 49 built HTML files have both `rel="alternate"` and `rel="canonical"`, and only `dist/404.html` has a robots meta. |

**Score:** 5/5 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/i18n/catalog-copy.ts` | Missing UI-copy fallback to `tool.name` and `tool.shortDescription` | ✓ VERIFIED | `toolLabels`. Present entry is returned as-is, a missing key returns catalog fields, and it never throws. |
| `src/i18n/catalog-copy.test.ts` | Proof that a missing `copy.tools` key does not throw | ✓ VERIFIED | 3 value-level tests, 3/3 pass. |
| `src/pages/404.astro` | Home override and noindex on the root 404 | ✓ VERIFIED | `path="/404/"`, `noindex`, `langSwitchPath="/"`. Locale comes from `stripBase(Astro.url.pathname)`. CTA is `withBase(localizedPath(locale, '/tools/'))`. |
| `src/components/LangSwitch.astro` | Optional path override, defaulting to the current path | ✓ VERIFIED | Defaults to `stripBase(Astro.url.pathname)` and wraps the output in `withBase`. |
| `src/layouts/BaseLayout.astro` | Optional noindex that omits hreflang alternates | ✓ VERIFIED | Default `noindex = false`. The true branch emits only the robots meta, with no canonical and no alternates (D-09 amended). |
| `src/components/ToolCard.astro` | Catalog fallback without replacing a present UI-copy entry | ✓ VERIFIED | `toolLabels(copy.tools, tool)`. `locale` is still optional, default `en`. |
| `src/components/RelatedTools.astro` | Name-only catalog fallback | ✓ VERIFIED | `toolLabels(copy.tools, tool).name`. `locale` is still required. |
| `src/components/Header.astro` | Passes the override through only when set | ✓ VERIFIED | Uses a conditional `path={langSwitchPath}` and renders one switch. |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `src/pages/404.astro` | `src/components/Header.astro` | `langSwitchPath="/"` through BaseLayout | ✓ WIRED | BaseLayout passes `langSwitchPath` to Header. Only the 404 sets it. |
| `src/components/Header.astro` | `src/components/LangSwitch.astro` | optional `path` prop | ✓ WIRED | Conditional `path={langSwitchPath}`. |
| `src/components/ToolCard.astro` | `src/i18n/catalog-copy.ts` | `toolLabels(copy.tools, tool)` | ✓ WIRED | Imported and called. `labels.name` and `labels.shortDescription` are rendered. |
| `src/components/RelatedTools.astro` | `src/i18n/catalog-copy.ts` | same helper, name only | ✓ WIRED | Imported and called inside the related map. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `dist/404.html` LangSwitch | `href` | `withBase(switchLocalePath("/", loc))` | `/toolsforfree/`, `/toolsforfree/zh/` | ✓ FLOWING |
| `dist/404.html` head | robots meta | `noindex` branch | `<meta name="robots" content="noindex">`, no canonical, no alternates | ✓ FLOWING |
| ToolCard | `labels` | `toolLabels` | UI copy or catalog `Tool` fields | ✓ FLOWING |
| RelatedTools | link text | `toolLabels(...).name` | e.g. `Base64 Encode / Decode`, `JWT Decoder` in `dist/tools/json-formatter/index.html` | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Full unit suite | `npm test` | 29 files, 204 tests passed | ✓ PASS |
| Missing copy key returns catalog fields and does not throw | `npx vitest run src/i18n/catalog-copy.test.ts` | 1 file, 3 tests passed | ✓ PASS |
| Build | `npm run build` | 49 pages, exit 0 (blog-collection-empty WARN only) | ✓ PASS |
| Built site has no `zh/404` | grep `dist` for `zh/404` | no matches | ✓ PASS |
| 404 is noindex with no canonical and no alternates | grep `dist/404.html` | robots `noindex` only; LangSwitch `/toolsforfree/`, `/toolsforfree/zh/` | ✓ PASS |
| Other pages keep canonical and hreflang | grep `dist` | 48/49 HTML with `rel="alternate"` and `rel="canonical"`; robots meta only in `dist/404.html` | ✓ PASS |

The first `npm run build` in this session printed an Astro prerender stack trace. The next two runs exited 0 with the full output: 49 pages, sitemap written, `Complete!`. All `dist` checks above ran on the clean build. The first failure looks transient, most likely a Windows `dist/` file lock, but I did not confirm the cause.

### Probe Execution

No phase probe scripts. The unit test and built `dist` checks above cover the success criteria.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| GUARD-01 | 15-01 | 404 LangSwitch does not link to `/zh/404/` | ✓ SATISFIED | `dist/404.html` LangSwitch hrefs are `/toolsforfree/` and `/toolsforfree/zh/` |
| GUARD-02 | 15-01 | 404 canonical and hreflang do not advertise `/zh/404/` | ✓ SATISFIED | Holds via no canonical and no alternates (D-09 amended in Phase 18). The earlier `/404/` canonical is gone by design. |
| GUARD-03 | 15-01 | 404 document is noindex | ✓ SATISFIED | `<meta name="robots" content="noindex">` only in `dist/404.html` |
| GUARD-04 | 15-01 | ToolCard falls back to catalog name and short description | ✓ SATISFIED | `toolLabels` plus ToolCard render; test passes |
| GUARD-05 | 15-01 | RelatedTools uses the same fallback, and neither component throws | ✓ SATISFIED | `toolLabels(...).name`; no throw path in the helper |

No orphaned Phase 15 requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | None in phase files | — | No TBD/FIXME/XXX in the 8 phase files |

`src/lib/crontab.ts` is still modified and unstaged. It is the locked fence and not part of this phase.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `src/i18n/catalog-copy.test.ts` | GUARD-04, GUARD-05 | 3 | 0 | No | Value (`toEqual`) | PASS |

GUARD-01..03 are proven by the freshly built `dist/404.html`, read during this verification.

### Decision Coverage

7/7 Phase 15 decisions are honored on current code.

- D-01: no `src/pages/zh/404.astro`
- D-02: `src/i18n/path.ts` has no `/404/` branch
- D-03: LangSwitch has an optional `path`, the 404 sets `/`, and Header passes `langSwitchPath` through (now base-stripped and base-wrapped per Phase 18 D-07)
- D-04: 404 alternates are omitted. The 404 canonical is also omitted now, per Phase 18 D-09 amended. This supersedes the Phase 15 UI-SPEC discretion that kept a `/404/` canonical.
- D-05: `noindex` defaults to off and is set only in `404.astro`
- D-06: a present UI copy entry is kept, a missing key returns catalog fields, and nothing throws
- D-07: ToolCard `locale` is still optional, default `en`

### Human Verification Required

None.

### Gaps Summary

No gaps. The Phase 15 goal still holds on current code after the Phase 18 base-aware href changes. GUARD-02 now holds because the 404 has no canonical and no alternates (D-09 amended in Phase 18).

---

_Verified: 2026-09-27T08:33:34Z_
_Verifier: Claude (gsd-verifier)_
