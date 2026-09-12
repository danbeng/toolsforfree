# Requirements: Devtoolbox — More Tools Milestone

**Defined:** 2026-09-11
**Core Value:** A visitor can open any of the eight new tools, run it entirely in the browser, and get a correct result without sending data anywhere — with the same EN/ZH, SEO, and catalog treatment as the tools already shipped.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Catalog parity

- [x] **CAT-01**: Each new tool is registered in `TOOLS` with a unique locked slug, category, `relatedSlugs`, and `featured: false`
- [x] **CAT-02**: Each new tool has EN and ZH content-collection markdown (SEO, how-to, FAQ) so `astro build` succeeds
- [x] **CAT-03**: `ToolIsland` maps each new slug to its Preact island; a missing branch fails tests rather than rendering a blank panel
- [x] **CAT-04**: Heavy libraries (SQL, Markdown, QR, Diff) load only on that tool's page — existing tools such as json-formatter do not inherit those chunks
- [x] **CAT-05**: Existing ten tools keep current behavior except catalog/`relatedSlugs` wiring
- [x] **CAT-06**: Every new tool uses live in-browser compute, copy, input size guard, EN+ZH island copy, and English lib errors with matching `ZH_ERRORS` in the same slice

Locked slugs: `markdown-preview`, `text-diff`, `sql-formatter`, `case-converter`, `password-generator`, `word-counter`, `lorem-ipsum`, `qr-code`.

Categories: Markdown + SQL → Format; Diff + Case + Word → Text; Password + Lorem + QR → Generate. No new Image category. Featured set stays six.

### Markdown preview (`markdown-preview`)

- [ ] **MD-01**: User can paste Markdown and see a live GFM preview (headings, lists, links, code fences, tables, strikethrough, task lists)
- [ ] **MD-02**: Preview HTML is sanitized with DOMPurify before render (Marked's removed `sanitize` option is never used)
- [ ] **MD-03**: Remote images are forbidden by default so the preview does not fetch the network
- [ ] **MD-04**: User can copy the sanitized HTML
- [ ] **MD-05**: Empty input shows an empty preview, not placeholder copy

### Text Diff (`text-diff`)

- [ ] **DIFF-01**: User can paste original and changed text in two panes
- [ ] **DIFF-02**: User sees line-level add/delete highlighting (not only a unified dump in `<pre>`)
- [ ] **DIFF-03**: User can ignore leading/trailing whitespace
- [ ] **DIFF-04**: User sees lines-added and lines-removed stats
- [ ] **DIFF-05**: Identical texts show a clear "No differences" state
- [ ] **DIFF-06**: Each pane is size-capped (existing char limit applied per side)

### SQL formatter (`sql-formatter`)

- [ ] **SQL-01**: User can paste SQL and see pretty-printed output as they type
- [ ] **SQL-02**: User can choose dialect from a short list: Standard, PostgreSQL, MySQL, SQLite, T-SQL, BigQuery (named `formatDialect` imports; not `format()` + string language)
- [ ] **SQL-03**: Keywords are UPPERCASE and indent is 2 spaces by default
- [ ] **SQL-04**: User can copy formatted SQL
- [ ] **SQL-05**: Invalid SQL shows an error instead of silently mangling the input
- [ ] **SQL-06**: FAQ states the tool is not an executor and dialect is not autodetection

### Case / Slug converter (`case-converter`)

- [x] **CASE-01**: One paste fans out to UPPER, lower, Title, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE
- [x] **CASE-02**: User also gets a URL slug (lowercase kebab, strip punctuation/marks, collapse repeat hyphens)
- [x] **CASE-03**: CJK letters are preserved in the slug (Han must not collapse to empty)
- [x] **CASE-04**: User can copy each output row

### Password generator (`password-generator`)

- [x] **PASS-01**: User can set length 8–128 (default 16) and generate a password
- [x] **PASS-02**: User can toggle lowercase, uppercase, digits, and symbols
- [x] **PASS-03**: User can exclude similar characters (i/l/1/O/0)
- [x] **PASS-04**: Generation uses `crypto.getRandomValues` with rejection sampling (not `Math.random`, not biased modulo)
- [x] **PASS-05**: User can copy the result and regenerate
- [x] **PASS-06**: Empty charset shows an error instead of generating

### Word / character counter (`word-counter`)

- [x] **COUNT-01**: User sees word count, character count with spaces, character count without spaces, and line count
- [x] **COUNT-02**: User sees sentence and paragraph counts
- [x] **COUNT-03**: CJK text is counted with Unicode segmentation (`Intl.Segmenter` or equivalent) so a Chinese paragraph is not "1 word"
- [x] **COUNT-04**: Counts update live as the user types

### Lorem ipsum (`lorem-ipsum`)

- [x] **LORM-01**: User can generate dummy text from a local corpus (no network fetch)
- [x] **LORM-02**: User can generate by paragraphs or by words
- [x] **LORM-03**: User can toggle the classic "Lorem ipsum dolor sit amet" opening
- [x] **LORM-04**: User can copy the result
- [x] **LORM-05**: Generated body is Latin dummy text; chrome/labels are EN+ZH

### QR code (`qr-code`)

- [ ] **QR-01**: User can enter text or a URL and see a QR preview
- [ ] **QR-02**: User can download the QR as PNG
- [ ] **QR-03**: User can choose error correction L / M / Q / H (default M)
- [ ] **QR-04**: User can select an image file and decode the payload entirely in the browser
- [ ] **QR-05**: User can copy the decoded payload
- [ ] **QR-06**: Oversize image files are rejected with a byte-cap error (not only the text char cap)
- [ ] **QR-07**: The tool never requests camera / `getUserMedia`

## v2 Requirements

Deferred. Tracked but not in the current roadmap.

### Markdown

- **MD-07**: User can toggle GFM newline-as-break (`breaks`)
- **MD-08**: User can copy source Markdown as well as HTML

### Diff

- **DIFF-07**: Word-level highlight inside changed lines
- **DIFF-08**: User can copy a unified patch

### SQL

- **SQL-07**: User can toggle keyword case (upper / lower / preserve)
- **SQL-08**: User can choose indent 2 or 4 spaces

### Case / Slug

- **CASE-05**: Sentence case output
- **CASE-06**: Line-by-line conversion

### Password

- **PASS-07**: Entropy-bits hint

### Counter

- **COUNT-05**: Estimated reading time
- **COUNT-06**: UTF-8 byte count

### Lorem

- **LORM-06**: Optional `<p>` wrapping of paragraphs

### QR

- **QR-08**: SVG download

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Camera QR / live scan | User locked file-decode only; permissions + video loop |
| General image processing (compress, crop, convert, OCR) | QR decode is the only image-in exception |
| Accounts, saved history, cloud APIs, server upload | Site stays static / browser-local |
| Rewriting the existing ten tools | Additive milestone; related links only |
| Extra languages or a new domain | Stay EN + ZH |
| JWT verify, HMAC, YAML↔JSON, HTML encode, number-base, CSS/JS minify | Not in the locked eight |
| Mermaid, KaTeX, Markdown PDF/PNG, WYSIWYG editor | Bundle and product-scope |
| File/folder/PDF/Excel diff, three-way merge, syntax-highlighted diff | Plain text only |
| Execute SQL / in-browser SQLite | Formatter, not a database |
| Joke cases, Morse, pinyin slugs, novelty ipsum | Wrong audience / extra deps |
| Passphrases, zxcvbn, password history | CSPRNG generator is enough |
| Grammar / keyword density | Writer-suite, not this catalog |
| WiFi/logo QR builders, ZXing/WASM decode by default | Keep `qr` file-decode narrow |
| Persist drafts in localStorage | Privacy surprise; existing tools are session-only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAT-01 | Phase 1 | Complete |
| CAT-02 | Phase 1 | Complete |
| CAT-03 | Phase 1 | Complete |
| CAT-04 | Phase 1 | Complete |
| CAT-05 | Phase 1 | Complete |
| CAT-06 | Phase 1 | Complete |
| COUNT-01 | Phase 2 | Complete |
| COUNT-02 | Phase 2 | Complete |
| COUNT-03 | Phase 2 | Complete |
| COUNT-04 | Phase 2 | Complete |
| CASE-01 | Phase 2 | Complete |
| CASE-02 | Phase 2 | Complete |
| CASE-03 | Phase 2 | Complete |
| CASE-04 | Phase 2 | Complete |
| LORM-01 | Phase 2 | Complete |
| LORM-02 | Phase 2 | Complete |
| LORM-03 | Phase 2 | Complete |
| LORM-04 | Phase 2 | Complete |
| LORM-05 | Phase 2 | Complete |
| PASS-01 | Phase 2 | Complete |
| PASS-02 | Phase 2 | Complete |
| PASS-03 | Phase 2 | Complete |
| PASS-04 | Phase 2 | Complete |
| PASS-05 | Phase 2 | Complete |
| PASS-06 | Phase 2 | Complete |
| SQL-01 | Phase 3 | Pending |
| SQL-02 | Phase 3 | Pending |
| SQL-03 | Phase 3 | Pending |
| SQL-04 | Phase 3 | Pending |
| SQL-05 | Phase 3 | Pending |
| SQL-06 | Phase 3 | Pending |
| DIFF-01 | Phase 4 | Pending |
| DIFF-02 | Phase 4 | Pending |
| DIFF-03 | Phase 4 | Pending |
| DIFF-04 | Phase 4 | Pending |
| DIFF-05 | Phase 4 | Pending |
| DIFF-06 | Phase 4 | Pending |
| MD-01 | Phase 5 | Pending |
| MD-02 | Phase 5 | Pending |
| MD-03 | Phase 5 | Pending |
| MD-04 | Phase 5 | Pending |
| MD-05 | Phase 5 | Pending |
| QR-01 | Phase 6 | Pending |
| QR-02 | Phase 6 | Pending |
| QR-03 | Phase 6 | Pending |
| QR-04 | Phase 6 | Pending |
| QR-05 | Phase 6 | Pending |
| QR-06 | Phase 6 | Pending |
| QR-07 | Phase 6 | Pending |

**Coverage:**

- v1 requirements: 49 total
- Mapped to phases: 49
- Unmapped: 0

---
*Requirements defined: 2026-09-11*
*Last updated: 2026-09-11 after roadmap creation*
