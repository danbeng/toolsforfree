---
phase: 05-markdown-preview
verified: 2026-09-14T05:27:14Z
status: human_needed
score: 7/7 must-haves verified
covered_files:
  - .planning/REQUIREMENTS.md
  - .planning/phases/05-markdown-preview/05-01-PLAN.md
  - .planning/phases/05-markdown-preview/05-01-SUMMARY.md
  - package-lock.json
  - package.json
  - src/components/tools/MarkdownPreview.tsx
  - src/components/tools/ToolIsland.astro
  - src/content/tools/markdown-preview.md
  - src/content/tools/zh/markdown-preview.md
  - src/data/tools.test.ts
  - src/data/tools.ts
  - src/i18n/errors.test.ts
  - src/i18n/errors.ts
  - src/i18n/ui.ts
  - src/lib/markdown.test.ts
  - src/lib/markdown.ts
  - src/styles/global.css
covered_digest: "v1:sha256:a4e3b267d433f5c47e6a7929f94591938556c8abb29cd8ce5c8dee3316bf41a8"
behavior_unverified: 0
overrides_applied: 0
decision_coverage:
  honored: 0
  total: 0
  not_honored: []
  reason: no trackable decisions
human_verification:
  - test: "Open /tools/markdown-preview/ (and /zh/tools/markdown-preview/ if that tree is being served): Markdown source left/top and Preview right/bottom; paste headings/lists/tables/tasks/fences and see live HTML in .md-preview without a Generate button; empty source leaves the preview blank with no Start typing copy; paste a script tag and a remote image — no alert, no network image request, no broken-image icon; Copy writes sanitized HTML not source Markdown; oversize source shows 输入过长，无法在浏览器中处理。 on ZH or the English too-large string on EN; homepage featured count still six."
    expected: "Split layout (side-by-side at 720px, stacked below, source first); live GFM in .md-preview; blank idle pane with Copy disabled; XSS/img stripped with no network fetch; Copy payload is sanitized HTML; too-large uses INPUT_TOO_LARGE_MSG / ZH map and skips parse; featured stays six."
    why_human: "PLAN deferred this to end-of-phase human-check. No jsdom/tsx island tests. Grep cannot see clipboard contents, 720px split, live typing, network panel, or ZH chrome in a real browser."
---

# Phase 5: Markdown preview Verification Report

**Phase Goal:** Visitors can preview GitHub-flavored Markdown as sanitized HTML without the page fetching the network
**Verified:** 2026-09-14T05:27:14Z
**Status:** human_needed
**Re-verification:** No — initial verification

**MVP note:** ROADMAP.md `mode: mvp`, but the ROADMAP phase goal is not a standard User Story (`user-story.validate` → false). Verification was not aborted: User Flow uses the PLAN goal (`valid: true`, role=visitor using Devtoolbox). Same handling as Phase 3/4.

## User Flow Coverage

User story: As a visitor using Devtoolbox, I want to paste Markdown and see a live sanitized GFM preview in the browser, so that I can preview formatting without uploading anything or fetching remote images.

| Step | Expected | Evidence | Status |
|------|----------|----------|--------|
| Open EN/ZH page | `/tools/markdown-preview/` and `/zh/tools/markdown-preview/` SSG from `TOOLS`; island gets `locale={locale}` | `src/pages/tools/[slug].astro` / `src/pages/zh/tools/[slug].astro` `getStaticPaths` from `TOOLS`; `ToolIsland.astro` `slug === 'markdown-preview'` + `client:load locale={locale}` | ✓ |
| Paste Markdown | Source textarea; live GFM in `.md-preview` (headings, lists, links, fences, tables, strike, tasks) | `MarkdownPreview.tsx` one `textarea` in `div.tool-grid.split`; `onInput` → `useMemo` → `renderMarkdown`; visual `div.md-preview` | ✓ |
| Sanitized preview | XSS payloads do not survive; Marked `sanitize` never used | `marked.parse` then `DOMPurify.sanitize` with locked CFG in `src/lib/markdown.ts`; named XSS test strips `<script`; no `sanitize:` option in lib | ✓ |
| No network fetch | Remote images and data URIs stripped; no broken-image icon | `FORBID_TAGS` includes `img` plus media/form tags; named img-strip and image-only `html === ''` tests; no `fetch` in lib or island | ✓ |
| Copy / idle / size | Copy writes sanitized HTML; empty source is blank; oversize shows too-large | ToolShell `output` is `html`; idle `input === ''` skips lib; `isTooLarge(input)` before parse; `ZH_ERRORS` maps `INPUT_TOO_LARGE_MSG` | ✓ |
| Outcome | Preview formatting without uploading or fetching remote images | Browser-local parse+sanitize; EN+ZH FAQ lock; catalog `markdown-preview` | ✓ |

Outcome clause is observably true in the codebase. Browser walkthrough still needs a human (see Human Verification).

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | Visitor can open `/tools/markdown-preview/` (and `/zh/tools/markdown-preview/` when that tree exists), paste Markdown, and see a live GFM preview of headings, lists, links, code fences, tables, strikethrough, and task lists (MD-01 / ROADMAP SC1) | ✓ VERIFIED | Island: default export, `locale`/`t()`, live `useMemo` (no Generate), `onInput` casts `HTMLTextAreaElement`, `spellcheck={false}`, `div.tool-grid.split` source first, visual `div.md-preview`. Lib: `renderMarkdown` wraps named `marked.parse`. Named test `keeps GFM heading list link fence table strike and task checkbox` passed. Live jsdom call: h1/ul/a/pre/table/del/checkbox all present. Pages SSG all `TOOLS` slugs; ToolIsland branch `slug === 'markdown-preview'` + `locale={locale}`. |
| 2 | Preview HTML is sanitized after parse; XSS payloads do not execute; Marked's removed sanitizer option is never used (MD-02 / ROADMAP SC2) | ✓ VERIFIED | `src/lib/markdown.ts`: `marked.parse` then `DOMPurify.sanitize` with locked CFG. No `sanitize:` / `sanitizer` / `ALLOWED_URI_REGEXP` / `addHook`. Island binds `dangerouslySetInnerHTML` only of already-sanitized `result.html` when non-empty. Named test `strips script tags from xss payloads` passed. Live: `<script>alert(1)</script>` → no `<script` in html. |
| 3 | Remote images and data URIs are stripped so the preview does not fetch the network; no broken-image icon (MD-03 / ROADMAP SC3) | ✓ VERIFIED | Locked CFG: `USE_PROFILES: { html: true }`; `FORBID_TAGS` img, picture, source, video, audio, track, iframe, object, embed, form; `FORBID_ATTR` style, srcset, poster; `KEEP_CONTENT: false`. Never forbids `input`. Named tests `strips remote and data-uri images` and `normalizes image-only source to empty html` passed. Live: `![x](https://evil.example/x.png)` → `{ ok: true, html: '' }`. No `fetch` in lib or island. CSS has no img rules (tags stripped). |
| 4 | ToolShell Copy writes the sanitized HTML string, not source Markdown (MD-04 / ROADMAP SC4 copy) | ✓ VERIFIED | Island `output: html` after `renderMarkdown` (`r.ok ? r.html : ''`). HEAD ToolShell `navigator.clipboard.writeText(props.output)` when output non-empty; Copy disabled when empty. Visual surface is children `.md-preview`, not ToolShell `<pre>`. Island does not pass `locale` into ToolShell (HEAD contract). Dirty worktree ToolShell requiring `locale` is unrelated uncommitted dirt — not a phase fail. |
| 5 | Empty source shows a blank `.md-preview` with Copy disabled, not placeholder copy (MD-05 / ROADMAP SC4 empty) | ✓ VERIFIED | Lib idle: `if (!input) return { ok: false, error: '' }` before parse; no trim. Island: `input === ''` skips lib, `html: ''`, `output: ''`. `dangerouslySetInnerHTML` only when `result.html` is truthy; empty `.md-preview` has no children. No `emptyHeading`/`emptyBody`/`Start typing` on markdown-preview chrome. `normalizeEmpty` leftover empty `p` → `''` so image-only Copy stays disabled. Named idle + normalizeEmpty tests passed. Live idle: `{ ok: false, error: '' }`. |
| 6 | Catalog slug markdown-preview, category Format, featured false; TOOLS toHaveLength 17; getFeaturedTools stays 6; relatedSlugs json-formatter, text-diff, word-counter; existing ten relatedSlugs unchanged (CAT-01, CAT-05 / ROADMAP SC5 catalog) | ✓ VERIFIED | Append-only 17th row. Named tests `has exactly 17 tools` and `features exactly six tools including json-formatter and jwt-decoder` passed. Featured slugs unchanged (json-formatter, jwt-decoder, hash-generator, regex-tester, unix-timestamp, crontab-explainer). First ten `relatedSlugs` match `ea11dbc` (Phase 3). Completeness `existsSync(URL)` (not `.pathname`) covers EN+ZH. No `src/lib/index.ts` barrel. ui.ts keys match UI-SPEC verbatim (name, shortDescription, markdown, preview). `ZH_ERRORS[INPUT_TOO_LARGE_MSG]` = `输入过长，无法在浏览器中处理。`. |
| 7 | After astro build, dist/_astro/JsonFormatter*.js does not contain the seven minify-surviving marked/DOMPurify identifiers; only src/lib/markdown.ts imports marked and dompurify (CAT-04 / ROADMAP SC5 isolation) | ✓ VERIFIED | Isolation test `imports marked and dompurify only from markdown.ts` passed: only `src/lib/markdown.ts` has `from 'marked'` and `from 'dompurify'`; MarkdownPreview / ToolIsland / json.ts / JsonFormatter do not; markdown.ts does not import jsdom. Dirty-main `npm run build` is the Phase 3/4 dirty-tree pattern (`src/pages/404.astro` missing `../i18n/path`) — not a markdown-preview product fail. CAT-04 taken from executor worktree dist: `G:/海外练手项目/.claude/worktrees/agent-ad66a85d0b7bb3210/dist/_astro/JsonFormatter.DGQoUZOb.js` (649 bytes) CLEAN for `DOMPurify`, `FORBID_TAGS`, `ALLOWED_URI_REGEXP`, `uponSanitizeElement`, `listIsTask`, `listReplaceTask`, `github.com/markedjs/marked`. `MarkdownPreview.DHzBE6LR.js` exists (72391 bytes) and contains those identifiers (expected — separate chunk). `marked@18.0.13` and `dompurify@3.4.15` direct deps; `jsdom@30.0.1` dev only. No `@types/dompurify`, `@types/marked`, `isomorphic-dompurify`, `marked-gfm-heading-id`, highlight.js, Prism. |

**Score:** 7/7 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/lib/markdown.ts` | `renderMarkdown` + `MarkdownResult`; thin wrap of `marked.parse` then `DOMPurify.sanitize`; idle empty string before parse; normalizeEmpty leftover empty p | ✓ VERIFIED | Exists, substantive, imported by island. Idle `if (!input)` before parse. Locked CFG. Catch → `{ ok: false, error: '' }`. Never throws. |
| `src/lib/markdown.test.ts` | jsdom env pragma; idle, GFM, XSS, img strip, normalizeEmpty, isolation, FAQ lock | ✓ VERIFIED | First line `// @vitest-environment jsdom`. 9 `it`s, no skip. Source-read uses `pathToFileURL(process.cwd())` then `new URL` (never `.pathname`). |
| `src/components/tools/MarkdownPreview.tsx` | Default-export island; split panes; `.md-preview`; `isTooLarge` on source; live `useMemo`; ToolShell copy payload is sanitized HTML | ✓ VERIFIED | Imports `renderMarkdown` from `../../lib/markdown`, not the npm packages. `class` not `className`. Clones HEAD WordCounter locale/`t()`, HEAD SqlFormatter live `useMemo`, HEAD ToolShell (no locale prop). Does not import `useToolUi`. |
| `src/components/tools/ToolIsland.astro` | static MarkdownPreview import and `slug === 'markdown-preview'` `client:load locale={locale}` | ✓ VERIFIED | Import line 18; branch line 39. Existing branches kept. Completeness loop covers all 17 slugs. |
| `src/data/tools.ts` | markdown-preview row featured false category Format | ✓ VERIFIED | Append-only 17th object. relatedSlugs order matches PLAN. |
| `src/data/tools.test.ts` | `toHaveLength(17)`; featured still 6 | ✓ VERIFIED | Snapshot bumped; featured assertion unchanged. Named catalog tests passed. |
| `src/i18n/ui.ts` | en and zh `tools['markdown-preview']` UI-SPEC chrome keys | ✓ VERIFIED | Keys name, shortDescription, markdown, preview; EN/ZH strings match UI-SPEC table. Phase 2/3/4 keys retained. No emptyHeading/emptyBody on this slug. |
| `src/i18n/errors.ts` | ZH_ERRORS map for INPUT_TOO_LARGE_MSG | ✓ VERIFIED | `'Input too large to process in the browser.'` → `输入过长，无法在浏览器中处理。`. Existing keys retained. |
| `src/i18n/errors.test.ts` | markdown-preview chrome-key describe plus too-large ZH map | ✓ VERIFIED | Named chrome-key and too-large tests passed. Phase 2/3/4 describes kept. |
| `src/content/tools/markdown-preview.md` | locale en SEO howTo 3 faq 3–5 including local / nothing uploaded / not WYSIWYG / remote images blocked | ✓ VERIFIED | howTo 3; faq 3; browser / nothing uploaded / not WYSIWYG / remote images / data URIs stripped. |
| `src/content/tools/zh/markdown-preview.md` | locale zh; local / 不会上传 / remote images blocked | ✓ VERIFIED | howTo 3; faq 3; 不会上传; 远程图片. |
| `src/styles/global.css` | additive `.md-preview` pane chrome and GFM child rules only | ✓ VERIFIED | HEAD (8c5d8ba) already contains `.md-preview`. Working copy still has the block (pane chrome 160/384, overflow, tokens; GFM child rules; no Phase 4 `#3dd68c`/`#13291f` inside `.md-preview`). Dirty visual overlay on main is unrelated. |
| `package.json` | direct deps marked 18.0.13 and dompurify 3.4.15; jsdom 30.0.1 as a devDependency | ✓ VERIFIED | `"marked": "^18.0.13"`, `"dompurify": "^3.4.15"` in dependencies; `"jsdom": "^30.0.1"` in devDependencies. Lock `node_modules/*` versions 18.0.13 / 3.4.15 / 30.0.1. |

`gsd_run query verify.artifacts`: 13/13 passed.

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `MarkdownPreview.tsx` | `src/lib/markdown.ts` | `renderMarkdown` after `isTooLarge` and empty-source skip | ✓ WIRED | Guard then idle skip then `renderMarkdown(input)` |
| `src/lib/markdown.ts` | marked | named parse from package root only in this file | ✓ WIRED | `import { marked } from 'marked'`; `marked.parse(input)` |
| `src/lib/markdown.ts` | dompurify | default sanitize after parse with locked CFG | ✓ WIRED | `import DOMPurify from 'dompurify'`; `DOMPurify.sanitize(dirty, CFG)` |
| `MarkdownPreview.tsx` | `src/lib/limits.ts` | `isTooLarge(input)` on Markdown source before parse | ✓ WIRED | Size path skips lib; maps `INPUT_TOO_LARGE_MSG` via `localizeError` |
| `ToolIsland.astro` | `MarkdownPreview.tsx` | static import + `slug === 'markdown-preview'` `client:load` | ✓ WIRED | Import line 18; branch line 39 |
| `tools.test.ts` | `tools.ts` | `expect(TOOLS).toHaveLength(17)` | ✓ WIRED | Snapshot 17 |
| `MarkdownPreview.tsx` | `ToolShell.tsx` | error plus sanitized HTML copy payload; visual surface is children `.md-preview` | ✓ WIRED | `<ToolShell error={result.error} output={result.output}>` wraps split panes |

`gsd_run query verify.key-links`: 7/7 verified.

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `MarkdownPreview.tsx` | `result.html` / `result.output` | `renderMarkdown` → `marked.parse` → `DOMPurify.sanitize` → `normalizeEmpty` | Yes — live `renderMarkdown('# Hello')` returns h1 HTML, not a static string | ✓ FLOWING |
| `MarkdownPreview.tsx` | `result.error` | `isTooLarge` → `localizeError(locale, INPUT_TOO_LARGE_MSG)` | Yes — size path skips parse; idle error is `null` | ✓ FLOWING |
| `MarkdownPreview.tsx` | `.md-preview` inner HTML | already-sanitized `result.html` via `dangerouslySetInnerHTML` | Yes — only when html non-empty; empty has no children | ✓ FLOWING |
| `MarkdownPreview.tsx` | `input` | textarea `onInput` | User input; no static fallback | ✓ FLOWING |
| `ToolShell` output | `props.output` | island copy payload = sanitized HTML | Copy and `<pre><code>` share the same string | ✓ FLOWING |

No API, no DB, no hollow props. Computation stays in the browser.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------- |
| Named GFM | `npx vitest run src/lib/markdown.test.ts -t "keeps GFM heading list link fence table strike and task checkbox"` | 1 passed / 8 skipped | ✓ PASS |
| Named XSS | `npx vitest run src/lib/markdown.test.ts -t "strips script tags from xss payloads"` | 1 passed / 8 skipped | ✓ PASS |
| Named img strip | `npx vitest run src/lib/markdown.test.ts -t "strips remote and data-uri images"` | 1 passed / 8 skipped | ✓ PASS |
| Named idle | `npx vitest run src/lib/markdown.test.ts -t "returns empty error for empty string before parse"` | 1 passed / 8 skipped | ✓ PASS |
| Named normalizeEmpty | `npx vitest run src/lib/markdown.test.ts -t "normalizes image-only source to empty html"` | 1 passed / 8 skipped | ✓ PASS |
| Named isolation | `npx vitest run src/lib/markdown.test.ts -t "imports marked and dompurify only from markdown.ts"` | 1 passed / 8 skipped | ✓ PASS |
| Named catalog 17 | `npx vitest run src/data/tools.test.ts -t "has exactly 17 tools"` | 1 passed / 6 skipped | ✓ PASS |
| Named featured 6 | `npx vitest run src/data/tools.test.ts -t "features exactly six tools including json-formatter and jwt-decoder"` | 1 passed / 6 skipped | ✓ PASS |
| Named chrome keys | `npx vitest run src/i18n/errors.test.ts -t "shares markdown-preview chrome keys"` | 1 passed / 8 skipped | ✓ PASS |
| Named too-large ZH | `npx vitest run src/i18n/errors.test.ts -t "maps INPUT_TOO_LARGE_MSG in ZH_ERRORS"` | 1 passed / 8 skipped | ✓ PASS |
| Named FAQ source-read | `npx vitest run src/lib/markdown.test.ts -t "source-reads too-large guard and FAQ local-only wording"` | 1 passed / 8 skipped | ✓ PASS |
| Live `renderMarkdown` | `node --input-type=module` + jsdom window, import `./src/lib/markdown.ts` | idle empty error; GFM keeps h1/ul/a/pre/table/del/checkbox; script stripped; image-only `html === ''` | ✓ PASS |
| CAT-04 worktree dist | grep seven identifiers in `JsonFormatter.DGQoUZOb.js` | CLEAN; MarkdownPreview chunk present with those identifiers | ✓ PASS |
| Dirty-main `astro build` | (orchestrator; not re-run) | Fails on dirty `src/pages/404.astro` missing `../i18n/path` — same Phase 3/4 dirty-tree pattern; not a markdown-preview fail | ? SKIP |

Orchestrator already ran `npm test` on main after merge: 22 files / 141 tests passed. This pass did not re-run the full suite.

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No `scripts/*/tests/probe-*.sh`; PLAN does not declare probes | SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| MD-01 | 05-01-PLAN.md | Paste Markdown and see a live GFM preview | ✓ SATISFIED | Live `useMemo` island + named GFM fixture + live parse |
| MD-02 | 05-01-PLAN.md | Sanitize with DOMPurify after parse; never Marked sanitize | ✓ SATISFIED | Locked CFG sanitize after parse; XSS test; no sanitize option |
| MD-03 | 05-01-PLAN.md | Remote images forbidden; preview does not fetch the network | ✓ SATISFIED | Strip-all img + media/form tags; named img tests; no fetch |
| MD-04 | 05-01-PLAN.md | User can copy the sanitized HTML | ✓ SATISFIED | ToolShell `output` is sanitized html; HEAD clipboard writeText |
| MD-05 | 05-01-PLAN.md | Empty input shows an empty preview, not placeholder copy | ✓ SATISFIED | Idle before parse; blank `.md-preview`; no emptyHeading keys |
| CAT-01 | 05-01-PLAN.md (slice) | TOOLS unique slug, category, relatedSlugs, featured false | ✓ SATISFIED | 17th row Format / featured false |
| CAT-02 | 05-01-PLAN.md (slice) | EN+ZH markdown | ✓ SATISFIED | both files; completeness loop |
| CAT-03 | 05-01-PLAN.md (slice) | ToolIsland branch per slug | ✓ SATISFIED | `slug === 'markdown-preview'`; completeness test |
| CAT-04 | 05-01-PLAN.md (slice) | marked/DOMPurify only on this tool page | ✓ SATISFIED | source isolation + worktree JsonFormatter chunk CLEAN |
| CAT-05 | 05-01-PLAN.md (slice) | Existing ten relatedSlugs unchanged | ✓ SATISFIED | match Phase 3 commit `ea11dbc` first ten |
| CAT-06 | 05-01-PLAN.md (slice) | live compute, copy, size guard, EN+ZH chrome, ZH_ERRORS | ✓ SATISFIED | useMemo island + ToolShell + ui.ts + INPUT_TOO_LARGE_MSG map |

REQUIREMENTS.md IDs mapped to Phase 5: MD-01..MD-05. All claimed by PLAN `requirements:`. No orphaned Phase 5 requirements.

v2 MD-07 (breaks toggle) and MD-08 (copy source Markdown) are explicitly deferred; not gaps.

### Decision Coverage

No trackable decisions in CONTEXT.md (`check.decision-coverage-verify`: skipped, `total: 0`). CONTEXT `<decisions>` exist as prose (live GFM, DOMPurify after parse, strip img, copy sanitized HTML, catalog additive, CAT-04) and are honored in the shipped slice; the gate did not parse them as trackable entries. Non-blocking.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `src/lib/markdown.test.ts` | MD-01..05, CAT-04, CAT-06 | 9 | 0 | 0 | Value (GFM tags, html `''`, idle union) + source-read (isolation, FAQ, isTooLarge) | OK |
| `src/data/tools.test.ts` | CAT-01, CAT-02, CAT-05 | 7 | 0 | 0 | Value (`toHaveLength(17)`, featured 6, existsSync(URL)) | OK |
| `src/i18n/errors.test.ts` | CAT-06 chrome keys / too-large ZH | 2 (markdown-preview describe) | 0 | 0 | Property presence + ZH_ERRORS value | OK |
| `src/components/tools/ToolIsland.test.ts` | CAT-03 | 1 | 0 | 0 | Source includes `slug === '${slug}'` | OK |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** 0 blockers. Note (non-blocking): MD-04 clipboard write and MD-06-style 100001-char runtime are source-read / HEAD ToolShell, as the PLAN specified; `isTooLarge` itself is the existing limits helper.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | No TBD/FIXME/XXX in phase files | — | — |
| `src/lib/markdown.ts` | catch | empty catch → `{ ok: false, error: '' }` | Info | Matches project parser contract; never throws to UI |
| Dirty `ToolShell.tsx` / pages | (not this phase) | worktree ToolShell requires `locale`; 404/index import missing `../i18n/path` | Info | Pre-existing dirty tree. Island clones HEAD ToolShell (no locale prop). Do not treat as markdown-preview fail. |
| Dirty `src/styles/global.css` | (not this phase) | uncommitted visual overlay; `.md-preview` still present | Info | HEAD already has `.md-preview`; WC still has the same block. Constraint: do not fail the phase for dirty CSS. |

No unresolved debt markers. No stubs (`return null`, empty handlers, unsanitized innerHTML).

### Human Verification Required

Harvested from PLAN task 3 `<human-check>` (`workflow.human_verify_mode = end-of-phase`).

### 1. Markdown Preview visitor walkthrough

**Test:** Open `/tools/markdown-preview/` (and `/zh/tools/markdown-preview/` if that tree is being served): Markdown source left/top and Preview right/bottom; paste headings/lists/tables/tasks/fences and see live HTML in `.md-preview` without a Generate button; empty source leaves the preview blank with no Start typing copy; paste a script tag and a remote image — no alert, no network image request, no broken-image icon; Copy writes sanitized HTML not source Markdown; oversize source shows `输入过长，无法在浏览器中处理。` on ZH or the English too-large string on EN; homepage featured count still six.
**Expected:** Split layout (side-by-side at 720px, stacked below, source first); live GFM in `.md-preview`; blank idle pane with Copy disabled; XSS/img stripped with no network fetch; Copy payload is sanitized HTML; too-large uses `INPUT_TOO_LARGE_MSG` / ZH map and skips parse; featured stays six.
**Why human:** PLAN deferred this to end-of-phase. No jsdom/tsx island tests. Grep cannot see clipboard contents, 720px split, live typing, network panel, or ZH chrome in a real browser.

### Gaps Summary

None. All seven must-haves are present, wired, and (for lib behavior) exercised by named tests or a live `renderMarkdown` call. CAT-04 is verified from the executor worktree dist, not the dirty-main failed build.

CAT-04 evidence path: `G:/海外练手项目/.claude/worktrees/agent-ad66a85d0b7bb3210/dist/_astro/JsonFormatter.DGQoUZOb.js` (CLEAN).

Remaining work is the harvested visual/clipboard/network UAT.

---

_Verified: 2026-09-14T05:27:14Z_
_Verifier: Claude (gsd-verifier)_
