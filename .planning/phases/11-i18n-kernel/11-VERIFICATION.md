---
phase: 11-i18n-kernel
verified: 2026-09-20T04:32:25Z
status: passed
score: 9/9 must-haves verified
covered_files:
  - .planning/REQUIREMENTS.md
  - .planning/phases/11-i18n-kernel/11-01-PLAN.md
  - .planning/phases/11-i18n-kernel/11-01-SUMMARY.md
  - src/i18n/locales.test.ts
  - src/i18n/locales.ts
  - src/i18n/path.test.ts
  - src/i18n/path.ts
  - src/i18n/ui.ts
  - src/i18n/useToolUi.test.ts
  - src/i18n/useToolUi.ts
covered_digest: "v1:sha256:e06f0bdd6baa7db511a8760517ea5b6cb7e0398350e080518dfac9699d56bb0d"
behavior_unverified: 0
overrides_applied: 0
---

# Phase 11: i18n Kernel Verification Report

**Phase Goal:** Pages and tool islands can resolve locale, localized paths, and chrome copy from one i18n kernel
**Verified:** 2026-09-20T04:32:25Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth   | Status     | Evidence       |
| --- | ------- | ---------- | -------------- |
| 1   | `locales.ts` exports `LOCALES`, `Locale`, and `LOCALE_META` with hreflang, htmlLang, and nativeLabel for EN and ZH | ✓ VERIFIED | `src/i18n/locales.ts` exports `LOCALES = ['en', 'zh']`, `type Locale = (typeof LOCALES)[number]`, and `LOCALE_META` (`en` / `zh-Hans` / `中文`). `npx vitest run src/i18n` — `LOCALES` / meta tests pass. |
| 2   | `localizedPath`, `switchLocalePath`, and `localeFromPathname` produce EN unprefixed URLs, ZH `/zh/` URLs, and trailing slashes; they never throw; illegal locale is treated as en | ✓ VERIFIED | `src/i18n/path.ts` + `path.test.ts` table: `/tools/` vs `/zh/tools/`, `/` vs `/zh/`, illegal `'fr'` → `/tools/`. 32 i18n tests passed. |
| 3   | Path helpers never emit a string that starts with two slashes | ✓ VERIFIED | `switchLocalePath('//evil.com', 'en')` asserts `startsWith('//') === false`. `normalizePath` collapses leading slashes. |
| 4   | `localeFromPathname` treats `/zh` and `/zh/...` as zh and treats `/zhfoo/` plus empty input as en | ✓ VERIFIED | `path.test.ts`: `/zh/`, `/zh`, `/zh/tools/` → `zh`; `/tools/`, `/zhfoo/`, `''` → `en`; `/ZH/` is case-sensitive en. |
| 5   | `useToolUi(locale)` returns `copy`, `tooLarge`, and `err`; empty/null `err` is null; `err` wraps `localizeError` | ✓ VERIFIED | `src/i18n/useToolUi.ts` is a named pure function. `useToolUi.test.ts`: EN `err('')`/`err(null)` → `null`; `err('Invalid JSON')` → `'Invalid JSON'`; ZH `err(INPUT_TOO_LARGE_MSG)` → `'输入过长，无法在浏览器中处理。'`. |
| 6   | EN and ZH chrome keys exist for home, nav Tools/Blog/About, footer, 404, langSwitch, howTo, faq, localNote, copy/copied; original-ten `tools[slug]`; `Locale` is sourced from `locales.ts` | ✓ VERIFIED | Direct read of `src/i18n/ui.ts`: both `ui.en` and `ui.zh` have `homeLede`/`homeKicker`/`homeFeatured`/`homeViewAll`, `navTools`/`navBlog`/`navAbout`, `footerRuns`, `notFoundTitle`/`Description`/`Body`/`Cta`, `langSwitch`, `howTo`, `faq`, `localNote`, `copy`/`copied`, plus original-ten tool objects. `import type { Locale } from './locales'; export type { Locale };`. |
| 7   | `ui.en.tooLarge` byte-matches `INPUT_TOO_LARGE_MSG` including the period | ✓ VERIFIED | `locales.test.ts` `byte-matches INPUT_TOO_LARGE_MSG on en.tooLarge`; constant in `src/lib/limits.ts` is `'Input too large to process in the browser.'`. |
| 8   | `copy.categories` is keyed by catalog ToolCategory PascalCase names Format Auth Encode Generate Text Time Color | ✓ VERIFIED | `ui.en.categories` / `ui.zh.categories` use those seven keys; `src/data/tools.ts` `ToolCategory` is the same union. |
| 9   | Header can still import type `Locale` from `i18n/ui` because `ui.ts` re-exports it | ✓ VERIFIED | `src/components/Header.astro` line 5: `import type { Locale } from '../i18n/ui'`. `locales.test.ts` binds `type Locale as UiLocale` from `./ui`. |

**Score:** 9/9 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected    | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/i18n/locales.ts` | LOCALES, Locale, LOCALE_META | ✓ VERIFIED | 11 lines, complete leaf module. `verify.artifacts` flagged `Only 11 lines, need 12` — mechanical min_lines, not a stub. Exports and tests prove the contract. |
| `src/i18n/locales.test.ts` | LOCALES order, meta, chrome/fill | ✓ VERIFIED | 55 lines; order, zh-Hans meta, fill, tooLarge, chrome keys. |
| `src/i18n/path.ts` | localizedPath, switchLocalePath, localeFromPathname | ✓ VERIFIED | 45 lines; imports Locale from `./locales` only; slash collapse + scheme strip. |
| `src/i18n/path.test.ts` | Path table including /zhfoo, empty, illegal locale, two-slash | ✓ VERIFIED | 71 lines; all tracer cases present. |
| `src/i18n/ui.ts` | Locale re-export, fill, chrome, categories, original-ten | ✓ VERIFIED | 463 lines; `fill()` `{token}` replace; no import of path/errors/useToolUi. |
| `src/i18n/useToolUi.ts` | copy / tooLarge / err; empty → null | ✓ VERIFIED | 12 lines; wraps `t` + `localizeError`; not a Preact hook. |
| `src/i18n/useToolUi.test.ts` | copy/tooLarge/err contract | ✓ VERIFIED | 20 lines; empty-to-null and ZH tooLarge via ZH_ERRORS. |

**Artifacts:** 7/7 verified (1 mechanical min_lines false-stub ignored)

### Key Link Verification

| From | To  | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `src/i18n/ui.ts` | `src/i18n/locales.ts` | `import type { Locale } from './locales'` + `export type { Locale }` | ✓ WIRED | Lines 1–3 of `ui.ts`. `verify.key-links` 5/5. |
| `src/i18n/path.ts` | `src/i18n/locales.ts` | `import type { Locale } from './locales'` only | ✓ WIRED | Line 1; no `./ui` import. |
| `src/i18n/useToolUi.ts` | `src/i18n/ui.ts` | `t(locale)` for copy; `tooLarge` from `copy.tooLarge` | ✓ WIRED | Lines 1, 5–6. |
| `src/i18n/useToolUi.ts` | `src/i18n/errors.ts` | `err` wraps `localizeError` after empty-to-null | ✓ WIRED | Lines 2, 7–9. |
| `src/i18n/ui.ts` | `src/lib/limits.ts` | `ui.en.tooLarge` equals `INPUT_TOO_LARGE_MSG` | ✓ WIRED | Value equality proven by `locales.test.ts` (ui.ts does not import limits; contract is byte-match, not an import). |

**Wiring:** 5/5 connections verified

### Data-Flow Trace (Level 4)

Kernel is compile-time dictionaries and pure string helpers — no fetch/DB. Traced anyway so later phases can mount against real keys.

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `locales.ts` | `LOCALES` / `LOCALE_META` | module constants | yes — `['en','zh']` and zh-Hans meta | ✓ FLOWING |
| `path.ts` | returned pathname | `normalizePath` + locale prefix | yes — computed from input, not a static stub | ✓ FLOWING |
| `ui.ts` | `t(locale)` dict | `ui.en` / `ui.zh` | yes — full chrome + 18 tool blocks | ✓ FLOWING |
| `useToolUi.ts` | `copy` / `tooLarge` / `err()` | `t(locale)` + `localizeError` | yes — ZH_ERRORS lookup for known English errors | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| i18n kernel unit tests | `npx vitest run src/i18n` | 4 files, 32 tests passed | ✓ PASS |
| catalog + ToolIsland completeness (must stay green) | `npx vitest run src/data/tools.test.ts src/components/tools/ToolIsland.test.ts` | 2 files, 8 tests passed | ✓ PASS |
| Phase commits exist | `gsd_run query verify.commits 52780b0 e91081e 1f01c0a` | `all_valid: true` | ✓ PASS |

### Probe Execution

No phase-declared or conventional `scripts/*/tests/probe-*.sh`. SKIPPED.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| KERN-01 | 11-01-PLAN.md | `locales.ts` exports LOCALES, Locale, LOCALE_META | ✓ SATISFIED | `src/i18n/locales.ts` + `locales.test.ts` |
| KERN-02 | 11-01-PLAN.md | path helpers EN unprefixed, ZH `/zh/`, trailing slash | ✓ SATISFIED | `src/i18n/path.ts` + `path.test.ts` |
| KERN-03 | 11-01-PLAN.md | `useToolUi` provides copy / tooLarge / err() | ✓ SATISFIED | `src/i18n/useToolUi.ts` + `useToolUi.test.ts` |
| KERN-04 | 11-01-PLAN.md | ui.ts chrome keys; Locale from locales.ts | ✓ SATISFIED | `src/i18n/ui.ts` re-export + chrome on both locales |

Orphaned requirements mapped to Phase 11: none. PAGE-*/ISLE-*/CI-* belong to Phases 12–14.

### Decision Coverage

No trackable decisions in CONTEXT.md (`check.decision-coverage-verify` returned `skipped: true`, `total: 0`). CONTEXT `<decisions>` exist as narrative (Locale re-export, path normalize, useToolUi shape, chrome keys) and are honored in the shipped i18n files; the query did not treat them as structured trackable entries. Non-blocking.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `src/i18n/locales.test.ts` | KERN-01, KERN-04 | 5 | 0 | no | Value (`toEqual` / `toBe`) | OK |
| `src/i18n/path.test.ts` | KERN-02 | 13 | 0 | no | Value (exact path strings) | OK |
| `src/i18n/useToolUi.test.ts` | KERN-03 | 2 | 0 | no | Value (null / ZH string / INPUT_TOO_LARGE_MSG) | OK |
| `src/i18n/errors.test.ts` | KERN-04 later-eight chrome | 16 (file) | 0 | no | Value | OK (pre-existing, still green) |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** 0 — chrome-key test uses `toBeTruthy()` for a subset of keys; remaining KERN-04 keys were confirmed by reading `ui.ts` (dictionary presence, not a runtime invariant).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | No TBD/FIXME/XXX/TODO in `src/i18n/*` | — | — |

Working-tree `src/components/ToolShell.tsx` still contains LED `tool-panel__chrome` (dirty, unstaged). That is the milestone fence, not a phase-11 commit. HEAD `ToolShell` has no LED chrome.

### Hard fences (PLAN prohibitions)

Judgment-tier prohibitions with git enforcement evidence — not flagged unverified.

| Prohibition | Status | Evidence |
| ----------- | ------ | -------- |
| Do not commit LED ToolShell / `tool-panel__chrome` | held | `git show HEAD:src/components/ToolShell.tsx` has no `tool-panel__chrome` / `led`. Phase diff `71fd48b..1f01c0a` is seven i18n files only. |
| Do not commit `src/lib/crontab.ts` | held | crontab.ts not in `52780b0` / `e91081e` / `1f01c0a`. |
| Do not pop `stash@{0}` or `stash@{1}` | held | `git stash list` still shows both stashes. |
| Path-limited git add only | held | Three feat commits touch only the i18n allowlist. `package.json` / `site.ts` / Header / Footer / RelatedTools / ToolIsland unchanged in `71fd48b..HEAD`. |
| Do not mount LangSwitch, ZH tree, ToolIsland, or ToolShell this phase | held | `git ls-files src/components/LangSwitch.astro src/pages/zh/**` empty. Phase commits do not edit ToolIsland/ToolShell. |
| No new npm packages, no Tailwind, no SITE_ORIGIN change | held | `git diff 71fd48b HEAD -- package.json` empty. `SITE_ORIGIN` remains `https://example.com`. No `src/i18n/index.ts`. Astro config has sitemap i18n locales only — no `i18n.routing`. |
| Do not expand ZH_ERRORS | held | `errors.ts` unchanged in phase commits. |
| Do not edit Header/Footer/RelatedTools/ToolIsland/original-ten/catalog/site | held | those paths absent from `71fd48b..1f01c0a`. |

### Human Verification Required

N/A — Infrastructure/foundation (i18n kernel) phase with no user-facing elements.
All acceptance criteria are verifiable programmatically (files + Vitest). LangSwitch / ZH pages / island Copy-Copied are Phases 12–13.

### Gaps Summary

None. Phase goal achieved: pages and tool islands can resolve locale, localized paths, and chrome copy from `locales.ts`, `path.ts`, `ui.ts`, and `useToolUi.ts`. Consumers are intentionally unwired until Phases 12–13.

---

_Verified: 2026-09-20T04:32:25Z_
_Verifier: Claude (gsd-verifier)_
