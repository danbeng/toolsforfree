---
phase: 05-markdown-preview
plan: 01
subsystem: tools
tags: [markdown-preview, marked, dompurify, preact, astro, vitest]

requires:
  - phase: 04-text-diff
    provides: 8-file catalog slice, CAT-04 isolation pattern, TOOLS length 16
provides:
  - "renderMarkdown wrapping named marked.parse then DOMPurify.sanitize"
  - "MarkdownPreview split-pane island with sanitized HTML copy payload"
  - "Catalog slug markdown-preview, Format, featured false; TOOLS length 17"
  - "EN+ZH markdown, ui.ts chrome, ZH_ERRORS too-large map, additive .md-preview CSS"
  - "CAT-04: only src/lib/markdown.ts imports marked and dompurify"
affects: [06-qr-code, catalog completeness]

actuals:
  tokens: 10968
  tasks: 3
  commits: 3

plan_head_before: bb85cc8b66ae4e8c7b7afd7c1b9bb53b54a3da23

tech-stack:
  added: [marked@18.0.13, dompurify@3.4.15, jsdom@30.0.1]
  patterns:
    - "Thin src/lib wrap of marked.parse then DOMPurify.sanitize with locked CFG"
    - "Idle empty-string-before-parse; normalize leftover empty p to empty html"
    - "CAT-04 greps minify-surviving identifiers, not marked.parse/sanitize/gfm"

key-files:
  created:
    - src/lib/markdown.ts
    - src/lib/markdown.test.ts
    - src/components/tools/MarkdownPreview.tsx
    - src/content/tools/markdown-preview.md
    - src/content/tools/zh/markdown-preview.md
  modified:
    - package.json
    - package-lock.json
    - src/components/tools/ToolIsland.astro
    - src/data/tools.ts
    - src/data/tools.test.ts
    - src/i18n/ui.ts
    - src/i18n/errors.ts
    - src/i18n/errors.test.ts
    - src/styles/global.css

key-decisions:
  - "Official marked@18.0.13 and dompurify@3.4.15; jsdom@30.0.1 is a devDependency only"
  - "Locked CFG FORBID_TAGS includes img and media/form tags; never FORBID input; never ALLOWED_URI_REGEXP"
  - "Copy payload is sanitized HTML; visual surface is children .md-preview"
  - "This phase maps INPUT_TOO_LARGE_MSG in ZH_ERRORS"

patterns-established:
  - "Idle empty string returns ok false empty error before parse; do not trim"
  - "dangerouslySetInnerHTML only of already-sanitized html when non-empty"
  - "jsdom environment tests that source-read files use pathToFileURL(process.cwd()) because jsdom rewrites import.meta.url"

requirements-completed: [MD-01, MD-02, MD-03, MD-04, MD-05]

coverage:
  - id: D1
    description: "Visitor pastes Markdown and sees a live GFM preview of headings, lists, links, fences, tables, strikethrough, and task lists"
    requirement: MD-01
    verification:
      - kind: unit
        ref: src/lib/markdown.test.ts#keeps GFM heading list link fence table strike and task checkbox
        status: pass
    human_judgment: true
    rationale: "Split layout at 720px and live typing in .md-preview are visual"
  - id: D2
    description: "Preview HTML is sanitized after parse; script payloads do not survive; Marked sanitize option is never used"
    requirement: MD-02
    verification:
      - kind: unit
        ref: src/lib/markdown.test.ts#strips script tags from xss payloads
        status: pass
    human_judgment: false
  - id: D3
    description: "Remote images and data URIs are stripped so the preview does not fetch the network"
    requirement: MD-03
    verification:
      - kind: unit
        ref: src/lib/markdown.test.ts#strips remote and data-uri images
        status: pass
      - kind: unit
        ref: src/lib/markdown.test.ts#normalizes image-only source to empty html
        status: pass
    human_judgment: false
  - id: D4
    description: "ToolShell Copy writes the sanitized HTML string, not source Markdown"
    requirement: MD-04
    verification:
      - kind: unit
        ref: src/lib/markdown.test.ts#source-reads too-large guard and FAQ local-only wording
        status: pass
    human_judgment: true
    rationale: "Clipboard write is browser-only"
  - id: D5
    description: "Empty source shows a blank .md-preview with Copy disabled, not placeholder copy"
    requirement: MD-05
    verification:
      - kind: unit
        ref: src/lib/markdown.test.ts#returns empty error for empty string before parse
        status: pass
    human_judgment: true
    rationale: "Blank preview pane with no Start typing copy is visual"
  - id: D6
    description: "Catalog slug markdown-preview, Format, featured false; TOOLS length 17; featured stays 6"
    verification:
      - kind: unit
        ref: src/data/tools.test.ts#has exactly 17 tools
        status: pass
      - kind: unit
        ref: src/data/tools.test.ts#features exactly six tools including json-formatter and jwt-decoder
        status: pass
    human_judgment: false
  - id: D7
    description: "Only src/lib/markdown.ts imports marked and dompurify; JsonFormatter chunk has none of the seven minify-surviving identifiers"
    verification:
      - kind: unit
        ref: src/lib/markdown.test.ts#imports marked and dompurify only from markdown.ts
        status: pass
      - kind: other
        ref: npm run build && node CAT-04 JsonFormatter identifier grep
        status: pass
    human_judgment: false

duration: 22min
completed: 2026-09-14
status: complete
---

# Phase 5 Plan 01: Markdown Preview Summary

**In-browser GFM markdown-preview via marked@18.0.13 + DOMPurify@3.4.15, sanitized HTML copy payload, catalog 17**

## Performance

- **Duration:** 22 min
- **Started:** 2026-09-14T04:37:28Z
- **Completed:** 2026-09-14T04:59:34Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments

- Thin `src/lib/markdown.ts` wraps named `marked.parse` then `DOMPurify.sanitize` with locked CFG; idle empty string before parse; leftover empty `p` normalized to `''`
- `MarkdownPreview` island: split panes, live `useMemo`, `.md-preview` visual surface, ToolShell copy payload is sanitized HTML; `isTooLarge` on source
- Catalog slug `markdown-preview` / Format / `featured: false`; TOOLS 16 → 17; featured stays 6; EN+ZH markdown FAQ states local / nothing uploaded / not WYSIWYG / remote images blocked
- CAT-04 green after fresh `astro build`: JsonFormatter chunk `JsonFormatter.DGQoUZOb.js` has none of `DOMPurify`, `FORBID_TAGS`, `ALLOWED_URI_REGEXP`, `uponSanitizeElement`, `listIsTask`, `listReplaceTask`, `github.com/markedjs/marked`

## Task Commits

Each task was committed atomically:

1. **Task 1:** `0bb21aa` (feat) ship markdown-preview island wrapping marked and DOMPurify
2. **Task 2:** `d7567a2` (test) lock GFM fixtures XSS img strip chrome keys and FAQ
3. **Task 3:** `d1d59dd` (test) prove marked and DOMPurify import only from markdown.ts

**Plan metadata:** pending docs(05-01) SUMMARY commit

## Files Created/Modified

- `src/lib/markdown.ts` - `renderMarkdown` + `MarkdownResult`; idle before parse; locked CFG
- `src/lib/markdown.test.ts` - idle, GFM, XSS, img strip, normalizeEmpty, isolation, FAQ lock
- `src/components/tools/MarkdownPreview.tsx` - default-export island; live `useMemo`; `.md-preview`
- `src/components/tools/ToolIsland.astro` - static MarkdownPreview import and `slug === 'markdown-preview'`
- `src/data/tools.ts` - append-only `markdown-preview` row
- `src/data/tools.test.ts` - `toHaveLength(17)`
- `src/i18n/ui.ts` - EN/ZH `tools['markdown-preview']` UI-SPEC keys
- `src/i18n/errors.ts` - ZH_ERRORS map for `INPUT_TOO_LARGE_MSG`
- `src/i18n/errors.test.ts` - markdown-preview chrome-key describe plus too-large ZH map
- `src/content/tools/markdown-preview.md` - EN SEO/how-to/FAQ
- `src/content/tools/zh/markdown-preview.md` - ZH SEO/how-to/FAQ
- `src/styles/global.css` - additive `.md-preview` pane chrome and GFM child rules
- `package.json` / `package-lock.json` - `marked@18.0.13`, `dompurify@3.4.15`, `jsdom@30.0.1` (dev)

## Decisions Made

- Official `marked@18.0.13` and `dompurify@3.4.15`; named `parse` then default `sanitize` only in `src/lib/markdown.ts`
- Strip all `img` (http/https/data) plus picture/source/video/audio/track/iframe/object/embed/form; never forbid `input`
- Copy payload is sanitized HTML; visual surface is children `.md-preview`; empty source is blank not placeholder
- Clone HEAD WordCounter locale/`t()`, HEAD SqlFormatter live `useMemo`, HEAD ToolShell with no locale prop
- Map `INPUT_TOO_LARGE_MSG` in `ZH_ERRORS` this slice

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] jsdom rewrites import.meta.url for source-read tests**
- **Found during:** Task 2 (FAQ / island source-read)
- **Issue:** `// @vitest-environment jsdom` makes `new URL(..., import.meta.url)` an `http:` URL, so `readFileSync` throws `The URL must be of scheme file`
- **Fix:** Resolve source files from `pathToFileURL(\`${process.cwd()}/src/lib/\`)` then `new URL(..., here)` — never `.pathname`. Isolation tests in Task 3 reuse the same helper.
- **Files modified:** `src/lib/markdown.test.ts`
- **Verification:** `npm test` 22 files / 141 tests pass
- **Committed in:** `d7567a2` (Task 2) and `d1d59dd` (Task 3)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required so jsdom GFM/XSS tests can also source-read files. No architecture change.

## Issues Encountered

None. Fresh `npm run build` succeeded on the clean worktree without dirty-page isolation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 5 plan 01 complete; catalog completeness is 17 / featured 6
- Ready for phase verify-work (human visual of split layout, blank empty preview, XSS/img, Copy clipboard, ZH chrome)
- Do not rewrite existing ten tools; next heavy-library slice should keep CAT-04 isolation
- Do not phase.complete from this executor (`--no-transition`)

---
*Phase: 05-markdown-preview*
*Completed: 2026-09-14*

## Self-Check: PASSED
