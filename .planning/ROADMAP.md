# Roadmap: Devtoolbox — More Tools Milestone

## Overview

This milestone adds eight browser-local tools to the existing Devtoolbox catalog at the same EN/ZH, SEO, and island standard as the ten already shipped. Phase 1 locks the additive contract (completeness tests, island-split, no rewrite of the ten). Phase 2 proves that contract on four zero-dep text/generate tools. Phases 3–6 then ship SQL, Diff, Markdown, and QR one vertical slice at a time so bundle, XSS, and file-decode risk stay isolated. When the last phase completes, a visitor can open any of the eight new tools, run it entirely in the browser, and get a correct result without sending data anywhere.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Additive tool contract** - Completeness harness, island-split rule, and no-rewrite of the existing ten (completed 2026-09-11)
- [x] **Phase 2: Light text and generate tools** - Word counter, case/slug, lorem, and password generator at catalog parity (completed 2026-09-12)
- [x] **Phase 3: SQL formatter** - In-browser pretty-print with named dialects (completed 2026-09-13)
- [ ] **Phase 4: Text Diff** - Two-pane line-level diff with stats and whitespace ignore
- [ ] **Phase 5: Markdown preview** - Sanitized GFM preview with no remote-image fetch
- [ ] **Phase 6: QR generate and decode** - PNG QR from text plus in-browser file decode, no camera

## Phase Details

### Phase 1: Additive tool contract

**Goal**: New tools can be added without rewriting the existing ten, and catalog completeness rules fail the build/tests instead of shipping a blank island or extra featured card
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04, CAT-05, CAT-06
**Success Criteria** (what must be TRUE):

  1. Visitor can still use all ten existing tools on EN and `/zh/` with unchanged behavior
  2. Homepage still shows exactly six featured tools; catalog slugs are unique and new tools are not featured
  3. Completeness tests pass for the current ten tools (unique slugs, EN+ZH markdown present, ToolIsland branch per catalog slug)
  4. A catalog slug with no ToolIsland branch fails tests rather than rendering a blank panel
  5. Existing tool pages such as json-formatter do not load SQL, Markdown, QR, or Diff chunks; the 8-file additive checklist and island-split rule are documented for later slices

**Plans:** 1/1 plans complete

Plans:

- [x] 01-01-PLAN.md — Completeness harness, catalog invariants, 8-file + island-split conventions

### Phase 2: Light text and generate tools

**Goal**: Visitors can count text, convert case/slugs, generate lorem, and generate passwords entirely in the browser at existing-tool parity
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: COUNT-01, COUNT-02, COUNT-03, COUNT-04, CASE-01, CASE-02, CASE-03, CASE-04, LORM-01, LORM-02, LORM-03, LORM-04, LORM-05, PASS-01, PASS-02, PASS-03, PASS-04, PASS-05, PASS-06
**Success Criteria** (what must be TRUE):

  1. User can paste text on `word-counter` (EN and `/zh/`) and see live word, character (± spaces), line, sentence, and paragraph counts, with CJK counted via Unicode segmentation
  2. User can paste text on `case-converter` and copy UPPER, lower, Title, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, plus a URL slug that keeps CJK letters
  3. User can generate dummy text on `lorem-ipsum` from a local corpus (paragraphs or words, optional classic opening), copy the Latin body, and see EN+ZH chrome
  4. User can generate a password on `password-generator` (length 8–128, default 16; charset toggles; exclude similar; `crypto.getRandomValues` with rejection sampling), copy and regenerate, and see an error if the charset is empty
  5. All four tools are in the catalog with locked slugs, `relatedSlugs`, `featured: false`, EN+ZH markdown/FAQ, live compute, copy, size guard, and matching `ZH_ERRORS`; completeness tests from Phase 1 stay green

**Plans:** 4/4 plans complete

Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Word counter 8-file slice (COUNT-01..04)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — Case/slug converter 8-file slice (CASE-01..04)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-03-PLAN.md — Lorem ipsum 8-file slice (LORM-01..05)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 02-04-PLAN.md — Password generator 8-file slice (PASS-01..06)

### Phase 3: SQL formatter

**Goal**: Visitors can pretty-print SQL in the browser with an explicit dialect, without executing it
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: SQL-01, SQL-02, SQL-03, SQL-04, SQL-05, SQL-06
**Success Criteria** (what must be TRUE):

  1. User can paste SQL on `sql-formatter` and see pretty-printed output as they type, with keywords UPPERCASE and 2-space indent by default
  2. User can choose dialect from Standard, PostgreSQL, MySQL, SQLite, T-SQL, and BigQuery (named `formatDialect` imports, not autodetection)
  3. User can copy formatted SQL; invalid SQL shows an error instead of silently mangling the input
  4. FAQ states the tool is not an executor and dialect is not autodetection; EN+ZH catalog pages exist; json-formatter does not inherit the SQL chunk

**Plans:** 1/1 plans complete

Plans:

- [x] 03-01-PLAN.md — SQL formatter 8-file slice plus CAT-04 bundle isolation

### Phase 4: Text Diff

**Goal**: Visitors can compare two texts and see a readable line-level diff in the browser
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: DIFF-01, DIFF-02, DIFF-03, DIFF-04, DIFF-05, DIFF-06
**Success Criteria** (what must be TRUE):

  1. User can paste original and changed text in two panes, each size-capped
  2. User sees line-level add/delete highlighting (not only a unified dump in a single `<pre>`) plus lines-added and lines-removed stats
  3. User can ignore leading/trailing whitespace
  4. Identical texts show a clear "No differences" state
  5. EN+ZH pages, catalog entry, related tools, and copy chrome exist for `text-diff`

**Plans**: TBD
**UI hint**: yes

### Phase 5: Markdown preview

**Goal**: Visitors can preview GitHub-flavored Markdown as sanitized HTML without the page fetching the network
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: MD-01, MD-02, MD-03, MD-04, MD-05
**Success Criteria** (what must be TRUE):

  1. User can paste Markdown on `markdown-preview` and see a live GFM preview (headings, lists, links, code fences, tables, strikethrough, task lists)
  2. Preview HTML is sanitized with DOMPurify before render (Marked `sanitize` is never used); XSS payloads do not execute
  3. Remote images are forbidden by default so the preview does not fetch the network
  4. User can copy the sanitized HTML; empty input shows an empty preview, not placeholder copy
  5. EN+ZH pages and catalog wiring exist; `marked` and DOMPurify load only on this tool's page

**Plans**: TBD
**UI hint**: yes

### Phase 6: QR generate and decode

**Goal**: Visitors can generate a downloadable QR from text or a URL and decode a selected image file entirely in the browser, without camera access
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: QR-01, QR-02, QR-03, QR-04, QR-05, QR-06, QR-07
**Success Criteria** (what must be TRUE):

  1. User can enter text or a URL on `qr-code`, see a QR preview, choose error correction L / M / Q / H (default M), and download the QR as PNG
  2. User can select an image file and decode the payload entirely in the browser, then copy the decoded text
  3. Oversize image files are rejected with a byte-cap error; the tool never requests camera / `getUserMedia`
  4. EN+ZH pages and catalog wiring exist; QR library chunks do not land on json-formatter; Phase 1 completeness tests stay green for all 18 tools

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Additive tool contract | 1/1 | Complete    | 2026-09-11 |
| 2. Light text and generate tools | 4/4 | Complete    | 2026-09-12 |
| 3. SQL formatter | 1/1 | Complete    | 2026-09-13 |
| 4. Text Diff | 0/TBD | Not started | - |
| 5. Markdown preview | 0/TBD | Not started | - |
| 6. QR generate and decode | 0/TBD | Not started | - |
