# Feature Research

**Domain:** Browser-local developer utility catalog (8 additive tools)
**Researched:** 2026-09-11
**Confidence:** MEDIUM
**Mode:** Subsequent milestone — per-tool landscape, not a greenfield product

Devtoolbox already ships 10 tools with a shared contract: Preact island + `src/lib` processor + `ToolShell` (live compute, copy, local chrome, size cap) + EN/ZH pages + SEO/how-to/FAQ markdown + catalog/related wiring. This file maps **what users expect on each of the eight new tools** versus extras and traps. Closest catalog competitor is [it-tools.tech](https://it-tools.tech) / [CorentinTh/it-tools](https://github.com/CorentinTh/it-tools). Consumer kitchen sinks ([10015.io](https://10015.io/), TinyWow) and conversion suites ([transform.tools](https://transform.tools)) are the wrong depth target.

Shared catalog UX that every tool inherits (already table stakes on the existing ten — do not re-litigate):

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Live in-browser compute | Tagline is "Nothing is uploaded" | LOW | No new API routes |
| Copy result | Existing `ToolShell` copy bar | LOW | Some tools need extra copy targets (HTML, patch, PNG) |
| Input size guard | Existing `isTooLarge` (100k chars) | LOW | QR image files need a **byte** cap, not only char cap |
| EN + ZH UI + FAQ | Existing-tool parity | MEDIUM | FAQ must name privacy, limits, and what the tool does *not* do |
| Catalog + related slugs | Routing source of truth | LOW | Suggested categories below |

Suggested catalog categories (from existing `ToolCategory`): Markdown preview + SQL formatter → **Format**; Text Diff + Case/Slug + Word counter → **Text**; Password + Lorem → **Generate**; QR generate+decode → **Generate** (do not add an Image category this milestone).

---

## Feature Landscape

### Cross-cutting table stakes (all eight)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Paste/type input, instant result | Catalog tools never have a Submit button | LOW | Match JSON Formatter / Hash Generator |
| Explicit local-compute chrome | Users distrust password, JWT-adjacent, and QR tools | LOW | Already in `ToolShell` |
| Honest empty/error states | Existing parsers return `{ ok:false, error:'' }` on empty | LOW | Diff of identical texts should say "No differences", not look broken |
| One job per page | it-tools pattern; 10015 mixes jobs | LOW | Do not combine Markdown+Diff or Case+Lorem |

### Cross-cutting differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Privacy FAQ that names the library boundary | Beats Diffchecker/TinyWow (server/upload) | LOW | Especially password, markdown (XSS), QR decode (file stays local) |
| CJK-aware text stats on the counter | EN+ZH site; English-only counters feel broken on `/zh/` | MEDIUM | Character count is the honest CJK metric; dictionary segmentation is not MVP |
| QR decode from image file (not just generate) | User-locked differentiator vs it-tools (generate + WiFi QR, no decode) | MEDIUM | File picker → canvas `ImageData` → jsQR; no camera |

### Cross-cutting anti-features (site-level)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Accounts, history, cloud save | "I lost my paste" | Violates static/browser-local constraint | Session-only state; refresh clears |
| TinyWow-style image/PDF/OCR suite | SEO volume | Out of scope; QR decode is the only image-in exception | Keep QR decode narrow |
| Extra languages beyond EN+ZH | Catalog growth | Explicitly deferred | EN+ZH parity only |
| Rewriting the existing 10 tools | Shared chrome upgrades | Milestone is additive | New copy targets only if a new tool cannot use `ToolShell` as-is |
| Camera QR scanner | Mobile "scan" expectation | Out of scope; permissions + video loop | Image-file decode |
| Server upload of text/images | "Large file" UX | Breaks tagline | Client FileReader + size error |

---

## 1. Markdown preview

**Competitor pattern:** it-tools "Markdown to HTML"; light sites (mdutil, fwip, postcrest, achromatic) use a live split pane. GFM (tables, strikethrough, task lists, fenced code) is the expected dialect. [Marked](https://github.com/markedjs/marked) does **not** sanitize HTML; official docs require [DOMPurify](https://github.com/cure53/dompurify) (or equivalent) before `innerHTML`.

### Table stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Live preview as you type | Every markdown playground does this | LOW | Split: textarea + preview pane |
| GFM: headings, lists, links, code fences, tables, strikethrough, task lists | GitHub is the mental model | LOW | `marked.parse(..., { gfm: true })` |
| Sanitize before render | Untrusted markdown can XSS the page | MEDIUM | `DOMPurify.sanitize(html)` — **required**, not optional |
| Copy rendered HTML | it-tools is a converter, not just a viewer | LOW | Extra copy target beyond ToolShell text output |
| Empty input → empty preview | Match existing tools | LOW | No placeholder essay |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Copy Markdown + Copy HTML | Fast round-trip | LOW | Two buttons |
| `breaks` option (GFM newlines) | Matches GitHub comments | LOW | Toggle, default off (CommonMark) |
| Raw-HTML-in-markdown warning in FAQ | Honest security | LOW | "Inline HTML is stripped/sanitized" |

### Anti-features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Unsanitized `innerHTML` / marked `sanitize: true` | "It just works" | Marked's old `sanitize` is gone/unsafe; XSS on a static site | DOMPurify always |
| Full WYSIWYG editor | "Like Typora" | New app, not a catalog tool | Preview-only |
| Mermaid, KaTeX, syntax-highlight themes, PDF/PNG export | Feature-site checklists | Bundle size, new deps, not table stakes | Defer |
| Markdown lint / TOC generator / frontmatter editor | transform.tools-style | Wrong product | Preview + HTML copy |
| Persist draft in localStorage | Convenience | Privacy surprise; not on existing tools | Session state only |

**UI note:** Preview is HTML, so this tool **cannot** use `ToolShell`'s `<pre><code>` as the only output. Keep chrome/copy; add a sandboxed preview region. Complexity: MEDIUM (shell exception).

---

## 2. Text Diff

**Competitor pattern:** it-tools "Text diff" (two panes, highlight). Diffchecker is the household name but **server-side**, with paywalled unified view, PDF/Excel/Word, AI summary, merge — the opposite of this catalog. Client-side tools use line diff + red/green + ignore whitespace. [jsdiff](https://github.com/kpdecker/jsdiff) is the standard: `diffLines`, `diffWords`, `diffChars`, `diffTrimmedLines`, `createPatch`.

### Table stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Two textareas (original / changed) | Every online diff | LOW | Labels EN+ZH |
| Live line-level add/delete highlight | Users bounce if they only get a count | MEDIUM | Render `ins`/`del` or equivalent; not a giant unified string in `<pre>` only |
| Ignore leading/trailing whitespace | Format-noise is the #1 false positive | LOW | `diffTrimmedLines` or equivalent |
| Stats: lines added / removed | Confirms the tool "did something" | LOW | Identical → "No differences" |
| Size cap on **each** pane | 2× 100k is still heavy for Myers | LOW | Apply `isTooLarge` per side; consider a combined cap |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Side-by-side view | Expected on Diffchecker-class tools | MEDIUM | Default view |
| Word-level highlight inside changed lines | Prose/docs readability | MEDIUM | `diffWords` on changed line pairs |
| Copy unified patch (`createPatch`) | Developers paste into PRs | LOW | Extra copy target |
| Ignore-case toggle | Light extra, cheap | LOW | Not required for v1 |

### Anti-features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| File/folder/PDF/Excel/image diff | Diffchecker marketing | Server, binary parsers, out of scope | Plain text only |
| Three-way merge / accept hunks | "Poor man's Git" | New product | Highlight + copy patch |
| Syntax highlighting by language | IDE expectation | Parser per language | Monospace, no highlighter |
| Shareable permalink of both texts | Collaboration | Requires storage/backend | Copy patch |
| Character-level as default | Looks "precise" | Unreadable on code | Line default, word optional |

**UI note:** Two inputs + visual diff. `ToolShell` single-output does not fit. Complexity: MEDIUM.

---

## 3. SQL formatter

**Competitor pattern:** it-tools "SQL prettify" (format + copy, limited knobs). Online formatters (Aiven, Encode64, SQL Practice) expose dialect + indent + keyword case. Library of record: [sql-formatter](https://github.com/sql-formatter-org/sql-formatter) — `language`, `tabWidth`, `keywordCase`, `useTabs`, `linesBetweenQueries`. Default `language: 'sql'` is a **common subset, not autodetection**.

### Table stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Pretty-print on paste | Same job as JSON Formatter | LOW | Live |
| Copy formatted SQL | Catalog contract | LOW | ToolShell fits |
| Dialect selector with a short list | Vendor SQL is real | LOW | v1: `sql`, `mysql`, `postgresql`, `sqlite`, `transactsql` |
| Keyword case: UPPER (default) | Industry default for readability | LOW | `keywordCase: 'upper'` |
| 2-space indent | Matches existing JSON pretty-print | LOW | `tabWidth: 2`, `useTabs: false` |
| Parse/format error string | Invalid SQL should not silently mangle | LOW | Result union like `formatJson` |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Keyword case toggle (upper / lower / preserve) | One extra control, high perceived quality | LOW | Default upper |
| Indent 2 / 4 | Cheap | LOW | Default 2 |
| FAQ: "not an executor, dialect is not auto-detected" | Prevents trust bugs | LOW | Copy like JWT "not verification" |

### Anti-features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Execute SQL / in-browser SQLite | "Try the query" | New runtime, not a formatter | Format only |
| 20-dialect dropdown | sql-formatter supports many | UI noise; most users want 4–5 | Short list + Standard SQL |
| Minify SQL | Pair with JSON minify | JSON minify already deferred | Pretty-print only |
| Identifier/function/dataType case knobs | Power-user | Experimental in library; clutter | Keywords only |
| SQL lint, EXPLAIN, dialect translator | Other products | Out of locked eight | Format only |

**UI note:** Fits existing JSON Formatter pattern (textarea + options + ToolShell). Complexity: LOW.

---

## 4. Case / Slug converter

**Competitor pattern:** it-tools splits **Case converter** (many cases at once) and **Slugify string**. Developer converters show camel/Pascal/snake/kebab/CONSTANT plus Title/UPPER/lower in one paste. [convertcase.net](https://convertcase.net/) is a **writer** toy (alternating, Morse, strikethrough) — do not copy it.

### Table stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| One input, many outputs at once | Users compare cases; they will not click 8 modes | LOW | Color Converter already fans out one value to many lines |
| UPPER / lower / Title Case | Universal | LOW | Title = Unicode-aware word starts |
| camelCase / PascalCase | JS/TS daily | LOW | |
| snake_case / CONSTANT_CASE | Python/env vars | LOW | |
| kebab-case | CSS/HTML/URLs | LOW | |
| URL slug | Locked requirement | LOW | lower + kebab + strip punctuation/marks; collapse repeats |
| Copy per output (or copy-all) | ToolShell one-block is awkward for 8 strings | LOW | Prefer per-row copy like a list; or newline-joined ToolShell plus labels |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Slug that strips CJK punctuation and Latin diacritics | `/zh/` users slug titles | MEDIUM | `String#normalize('NFKD')` + mark strip; CJK letters may stay or be omitted — **pick one and FAQ it** |
| Sentence case | Occasional writing | LOW | Optional; not a programming case |
| Line-by-line convert | Lists of identifiers | LOW | Nice; not required if input is one string |

### Anti-features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| aLtErNaTiNg, inverse, Morse, strikethrough, NATO | convertcase.net | Joke features, wrong audience | Programming cases + slug |
| Separate pages per case | SEO farm | Catalog bloat | One tool, many outputs |
| pinyin slug / translation | ZH titles → ASCII slugs | New dependency, not locked | Document that Han stays or is stripped |
| Custom delimiter / acronym exceptions (`URL` stays `URL`) | Power users | Infinite edge cases | Deterministic simple rules + FAQ |

**UI note:** Multi-output. Color Converter is the closest existing pattern. Complexity: LOW–MEDIUM.

**Slug rule to lock in requirements (opinionated):** slug = trim → Unicode NFKD → strip combining marks → lowercase → replace any run of non `[a-z0-9]+` with `-` → trim `-`. Han without Latin transliteration becomes `-` or is dropped; FAQ must say so. Do not add pinyin this milestone.

---

## 5. Password generator

**Competitor pattern:** Bitwarden / 1Password generators and client-side web tools: length, charset toggles, exclude similar (`0O1lI`), CSPRNG, copy. it-tools ships a **Token generator** (charset + length) plus a separate strength analyser — not a password-branded UI. NIST SP 800-63B: **length over composition rules**; verifiers should allow long passwords; do not force mixed classes as a product religion.

### Table stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Length control (slider + number) | First control on every generator | LOW | Range **8–128**, default **16** (or 20) |
| Toggles: lowercase, uppercase, digits, symbols | Bitwarden-class | LOW | At least one charset must remain on |
| Exclude similar characters | Typed passwords | LOW | `0 O o 1 l I \|` |
| Cryptographic randomness | Password-shaped output is sensitive | LOW | `crypto.getRandomValues` + unbiased pick (rejection sampling); **not** `Math.random` |
| Copy | Catalog contract | LOW | ToolShell fits |
| Regenerate button | Match UUID Generator | LOW | New value on click and on option change |
| Privacy FAQ | Users will not paste secrets into uploaders | LOW | "Never leaves the browser; we cannot see it" |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Guarantee ≥1 of each selected class, then shuffle | Avoids all-letter accidents | LOW | Shuffle with CSPRNG |
| Entropy / length hint (bits ≈ `len * log2(charset)`) | Educates without becoming a strength product | LOW | Optional one-liner; do not color-rate "Weak/Strong" as a brand |
| Conservative symbol set | Site compatibility | LOW | Start with `!@#$%^&*` (Bitwarden-like), not all of ASCII |

### Anti-features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Pronounceable / Markov / "human" passwords | Memorability | Weaker, not CSPRNG-shaped | Random only |
| Passphrase (diceware) | NIST-friendly | New wordlist (~10k strings) in the bundle | Defer |
| Save / history / export CSV | Convenience | Secrets in storage; accounts | One-shot generate + copy |
| Password strength analyser as a second product | it-tools has one | Not in locked eight; zxcvbn is heavy | Optional bits hint only |
| Require mixed classes as un-disableable | Old complexity rules | Conflicts with NIST; users need hex-only sometimes | Toggles, with a floor of one class |
| Email the password | Recovery fantasy | Server | Copy only |

**UI note:** Fits UUID/Hash pattern. Complexity: LOW.

---

## 6. Word / character counter

**Competitor pattern:** Live counts of words, characters (with/without spaces), sentences, paragraphs. [wordcounter.net](https://wordcounter.net/) adds keyword density, grammar, goals, reading/speaking/handwriting time — a **writing suite**, not a catalog widget. it-tools "Text statistics" is the right depth. For `/zh/`, space-delimited "words" under-count Chinese; bilingual counters treat **CJK characters** as first-class.

### Table stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Live counts while typing/pasting | Submit-to-count feels broken | LOW | |
| Words (Unicode-aware, whitespace-split for Latin) | English default | LOW | |
| Characters with spaces | Twitter/SMS/meta | LOW | Use JS string length in code points (`[...str].length` or `Array.from`) not UTF-16 `length` |
| Characters without spaces | Common second number | LOW | |
| Lines | Developers paste logs/code | LOW | |
| Sentences / paragraphs | Expected on consumer counters | LOW | Simple `.?!` / blank-line split; FAQ the heuristic |
| CJK character count | EN+ZH parity | LOW | Count `\p{Script=Han}` (and maybe Hiragana/Katakana) separately |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Reading time at a stated WPM (200 or 225) | Cheap, expected | LOW | FAQ the constant; do not pretend precision |
| Bytes (UTF-8) | Developers | LOW | `new TextEncoder().encode(s).length` |
| Mixed-text breakdown: Latin words + Han characters | `/zh/` users | MEDIUM | Display both; do not hide English word count |

### Anti-features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Grammar/spell check | wordcounter.net | Language tool / server / huge dict | Counts only |
| Keyword density, readability (Flesch), goals | SEO writers | Wrong audience | Defer |
| Dictionary-based Chinese word segmentation | "Real" ZH word count | ML/dict dependency, ambiguous | Han **character** count + FAQ |
| Social-network limit meters (X/Instagram/SEO) | Consumer SEO sites | Constant churn, not developer | Raw character counts |
| File drop of `.docx` | Convenience | Parsing binary; out of scope | Paste text |

**UI note:** Stats dashboard, not one `output` string. Can still feed a labeled block into ToolShell (`Words: …\nChars: …`). Complexity: LOW.

---

## 7. Lorem ipsum generator

**Competitor pattern:** [lipsum.com](https://www.lipsum.com/) — paragraphs / words / bytes, optional classic start phrase. it-tools Lorem generator is the catalog version: count + copy. HTML `<p>` wrap and lists appear on consumer generators; they are extras.

### Table stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Generate N paragraphs | Default job | LOW | Default **3**, range 1–50 |
| Generate by word count | lipsum.com parity | LOW | Mode toggle: paragraphs \| words |
| Classic start option ("Lorem ipsum dolor sit amet…") | Tradition | LOW | Default on for first paragraph |
| Copy | Catalog contract | LOW | ToolShell fits |
| Repeatable local corpus | No network | LOW | Finite word list in `src/lib`; do **not** call lipsum.com |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Wrap paragraphs in `<p>` | Front-end mockups | LOW | Toggle, default off (plain text) |
| Start-with-lorem toggle | Designers want it; developers often do not | LOW | |

### Anti-features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Bacon / hipster / cupcake / "corporate" ipsum | Novelty SEO | Tone clash; extra copy to translate EN+ZH | Classic Latin only |
| Mixed layout (headings, lists, code, blockquotes) | "Realistic page" | Becomes a page generator | Paragraphs/words only |
| HTML lists as a second generator | lipsum lists | Extra UI | `<p>` wrap is enough |
| Fetch from lipsum.com API | "Authentic" | Network, not local | Bundled word list |
| ZH lorem / real Chinese filler articles | `/zh/` parity misunderstanding | Copyrighted prose; different product | Keep Latin placeholder; ZH UI around it |

**UI note:** Fits UUID Generator (options + generate + copy). Complexity: LOW.

---

## 8. QR code generate + decode

**Competitor pattern:** it-tools has **QR Code Generator** and **WiFi QR Code Generator** (generate, customize, download) — **not decode**. Consumer QR sites add logos, colors, vCard/WiFi types, PDF. Decode libraries: [jsQR](https://github.com/cozmo/jsqr) reads `ImageData` from a file or canvas; camera is optional and **out of scope**. Generate: error correction **L/M/Q/H** per ISO/IEC 18004 (~7/15/25/30% codeword recovery). PNG via canvas `toDataURL`; SVG via generator `toString({ type: 'svg' })`.

### Table stakes — generate

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Text/URL → on-page QR preview | The job | MEDIUM | Live as the text changes |
| PNG download | Every generator | LOW | `<a download>` from canvas/data URL |
| Error correction L/M/Q/H | Standard; default **M** | LOW | FAQ: H if the print is dirty; L for clean screens |
| Quiet-zone / margin | Unreadable codes without it | LOW | Spec wants 4 modules; do not ship margin 0 as default |
| Empty input → no code / clear preview | Avoid encoding empty string as a QR | LOW | |
| Payload size error | QR capacity is finite | LOW | Show a clear error; do not render a broken code |

### Table stakes — decode

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Image file picker (png/jpg/webp/gif) | Locked requirement | MEDIUM | `FileReader` + `drawImage` + `getImageData` + jsQR |
| Decoded text in copyable output | Catalog contract | LOW | |
| "No QR found" error | Blurry/logo/crop failures are common | LOW | |
| Local-only FAQ | File input looks like upload | LOW | "Decoded in your browser; file is not sent" |
| Image byte-size cap | 20 MB photos will freeze the tab | LOW | Separate from 100k char cap |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| SVG download | Print/scale | LOW | Second download button |
| Generate and decode on **one page**, two sections | Locked as one catalog slug | MEDIUM | Two clear headings; do not hide decode |
| Invert-attempt for light-on-dark codes | jsQR `inversionAttempts` | LOW | Default `attemptBoth` or `dontInvert` — pick one, FAQ failures |

### Anti-features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Live camera / `getUserMedia` | Phone scan | Explicitly out of scope | File decode |
| Logo overlay / branded colors / rounded modules | Marketing QR | Reduces scannability; image-editor scope | Monochrome, no logo |
| WiFi / vCard / geo / event typed builders | it-tools WiFi QR | Extra product surfaces | Free-text payload (user can paste `WIFI:…`) |
| Barcode (1D EAN/Code128) | "QR and barcodes" | Different symbology, different lib | QR only |
| Server OCR / cloud decode | Hard images | Upload; tagline break | jsQR only; accept failure |
| Batch zip of 1000 QRs | Marketing ops | Not a catalog tool | Single payload |

**UI note:** Image preview + file input. `ToolShell` text output still works for decoded text and for "payload" echo; the QR graphic sits above it. Complexity: MEDIUM–HIGH (highest of the eight).

---

## Feature Dependencies

```
Shared catalog chrome (ToolShell / copy / EN+ZH / FAQ / size cap)
    └──requires──> Every new tool page

Markdown preview
    └──requires──> HTML sanitizer (DOMPurify) before preview
    └──requires──> ToolShell exception (HTML pane)
Copy HTML ──enhances──> Markdown preview

Text Diff
    └──requires──> Two-input layout (ToolShell exception)
    └──requires──> Line diff algorithm (jsdiff or equivalent)
Word-level highlight ──enhances──> Line diff
Unified patch copy ──enhances──> Line diff
Ignore-whitespace ──enhances──> Line diff (do not ship without it)

SQL formatter
    └──requires──> Dialect option (even if default `sql`)
Keyword-case toggle ──enhances──> SQL formatter

Case / Slug converter
    └──requires──> Shared case pipeline (split words once, emit many cases)
URL slug ──requires──> kebab + lower + punctuation strip (same pipeline)
CJK/diacritic slug behavior ──enhances──> URL slug (FAQ if stripped)

Password generator
    └──requires──> CSPRNG (`crypto.getRandomValues`)
Charset toggles ──requires──> Non-empty charset guard
Exclude-similar ──enhances──> Charset filter
≥1-per-class + shuffle ──enhances──> Generator (not a substitute for CSPRNG)

Word / character counter
    └──requires──> Code-point character count (not UTF-16 `.length`)
CJK Han count ──enhances──> Counter (strongly recommended for /zh/)
Reading time ──enhances──> Word count (stated WPM)

Lorem ipsum
    └──requires──> Local word list (no network)
HTML <p> wrap ──enhances──> Plain paragraphs

QR generate
    └──requires──> Encoder + on-page preview
PNG download ──requires──> Generate preview
SVG download ──enhances──> Generate
Error-correction level ──enhances──> Generate (default M)

QR decode
    └──requires──> File → canvas ImageData → jsQR
    └──requires──> Image byte cap
    └──conflicts──> Camera stream (out of scope)
QR generate + decode ──conflicts──> General image toolbox (compress/crop/OCR)

Password / Markdown / QR decode
    └──conflicts──> Any server upload or analytics on tool payloads
```

### Dependency Notes

- **Markdown requires sanitizer:** Marked's own docs say output is unsanitized. Shipping preview without DOMPurify is an XSS bug, not a stretch goal.
- **Diff requires a two-pane chrome exception:** Do not force both sides through one ToolShell `<pre>`.
- **Slug requires the case pipeline:** Do not implement slug as a second ad-hoc regex unrelated to kebab-case.
- **Password requires CSPRNG:** `Math.random` is an anti-implementation, not a v1 shortcut.
- **QR decode requires generate on the same slug** (product lock) but **not** camera, logo, or other image tools.
- **CJK count enhances the counter:** Skipping it makes `/zh/` feel like a translated English toy.

---

## MVP Definition

This milestone's "v1" is **eight tools at existing-tool parity**, not a subset of tools. Ruthless cuts apply **inside** each tool.

### Launch with (v1) — all eight tools

- [ ] **Markdown preview** — GFM live preview, DOMPurify, copy HTML
- [ ] **Text Diff** — two panes, line diff, ignore whitespace, add/remove stats
- [ ] **SQL formatter** — pretty-print, 5 dialects, upper keywords, 2-space, copy
- [ ] **Case / Slug converter** — UPPER/lower/Title/camel/Pascal/snake/kebab/CONSTANT + slug, copy
- [ ] **Password generator** — length 8–128, four charsets, exclude similar, CSPRNG, copy
- [ ] **Word / character counter** — words, chars ± spaces, lines, sentences/paragraphs, Han count
- [ ] **Lorem ipsum** — paragraphs or words, classic-start toggle, local corpus, copy
- [ ] **QR generate + decode** — text→QR preview, PNG download, L/M/Q/H, file decode, copy payload
- [ ] **Parity wrapper for each** — `src/lib` + tests, Preact island, EN+ZH UI, SEO/how-to/FAQ, catalog + related slugs

### Add after validation (v1.x)

- [ ] Markdown: copy-markdown button, `breaks` toggle
- [ ] Diff: word-level-in-line, unified patch copy, ignore-case
- [ ] SQL: keyword lower/preserve, indent 2/4
- [ ] Case: sentence case, line-by-line
- [ ] Password: entropy bits hint
- [ ] Counter: reading time, UTF-8 bytes
- [ ] Lorem: `<p>` wrap
- [ ] QR: SVG download

### Future consideration (v2+) — still out of this milestone even later unless PRODUCT.md changes

- [ ] Mermaid/KaTeX/PDF export (markdown)
- [ ] Diff merge, syntax highlight, file types
- [ ] SQL execute / extra dialects
- [ ] Pinyin slugs, joke case modes
- [ ] Passphrases, strength analyser, history
- [ ] Grammar/keyword density
- [ ] Novelty ipsum, ZH filler corpus
- [ ] Camera QR, logo QR, WiFi/vCard builders, 1D barcodes, image toolbox

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Catalog parity (lib, island, EN+ZH, FAQ) × 8 | HIGH | MEDIUM | P1 |
| Markdown GFM preview + sanitize + copy HTML | HIGH | MEDIUM | P1 |
| Diff two-pane line highlight + ignore ws | HIGH | MEDIUM | P1 |
| SQL pretty-print + short dialect list | HIGH | LOW | P1 |
| Case fan-out + URL slug | HIGH | LOW | P1 |
| Password length/charset/CSPRNG/copy | HIGH | LOW | P1 |
| Counter words/chars/lines + Han count | HIGH | LOW | P1 |
| Lorem paragraphs/words + copy | HIGH | LOW | P1 |
| QR generate preview + PNG + EC level | HIGH | MEDIUM | P1 |
| QR decode from image file | HIGH | MEDIUM | P1 |
| Diff word-level + patch copy | MEDIUM | MEDIUM | P2 |
| QR SVG download | MEDIUM | LOW | P2 |
| SQL keyword-case / indent toggles | MEDIUM | LOW | P2 |
| Password entropy hint | MEDIUM | LOW | P2 |
| Counter reading time + UTF-8 bytes | MEDIUM | LOW | P2 |
| Lorem `<p>` wrap | MEDIUM | LOW | P2 |
| Markdown breaks toggle | LOW | LOW | P2 |
| Passphrases / strength product | LOW | HIGH | P3 |
| Camera QR / logo / WiFi builder | LOW | HIGH | P3 |
| Writer-suite counter extras | LOW | HIGH | P3 |
| Joke case / novelty ipsum | LOW | LOW | P3 (do not build) |

**Priority key:**
- P1: Must have for this milestone launch
- P2: Should have if it fits the same island without new product surface
- P3: Nice to have / future — or explicit anti-feature

---

## Competitor Feature Analysis

| Feature | it-tools | Diffchecker / wordcounter.net / lipsum.com / convertcase.net | 10015.io / TinyWow | Our approach |
|---------|----------|---------------------------------------------------------------|--------------------|--------------|
| Privacy model | Client-side catalog | Mixed; Diffchecker is server + paid extras | Ads, uploads, kitchen sink | **Browser-local only** (existing tagline) |
| Markdown | Markdown → HTML | Dedicated preview sites: GFM + copy HTML | Rarely a focus | GFM preview + sanitized HTML copy |
| Text diff | Yes, text | Diffchecker: views, docs, AI, paywalls | Sometimes | Line diff, ignore ws; no files/AI |
| SQL format | SQL prettify | Dialect-heavy formatters | Code formatters, not SQL-first | sql-formatter, 5 dialects, upper keywords |
| Case / slug | Case converter **and** slugify | convertcase.net = writer gimmicks | Case converter | **One** tool: programming cases + slug |
| Password | Token generator + strength | Manager-class generators | Random password + meter | Dedicated generator, CSPRNG, no history |
| Word count | Text statistics | wordcounter.net writing suite | Mixed | Counts + Han; no grammar |
| Lorem | Yes | lipsum.com paragraphs/words/bytes | Yes | Local paragraphs/words; no novelty corpora |
| QR | Generate + WiFi QR | Branding/logo sites | Generate + image tools | **Generate + file decode**; no camera, no logo |
| Catalog depth | 80+ tools | Single-purpose destinations | 50–100 mixed consumer tools | **18 tools** after this milestone; do not chase breadth |

---

## Sources

**Catalog competitors**
- [it-tools.tech](https://it-tools.tech) / [CorentinTh/it-tools](https://github.com/CorentinTh/it-tools) tool index (`Markdown to HTML`, `Text diff`, `SQL prettify`, `Case converter`, `Slugify string`, `Token generator`, `Password strength analyser`, `Lorem ipsum generator`, `Text statistics`, `QR code generator`, `WiFi QR code generator`) — MEDIUM (index via search; live SPA fetch blocked)
- [10015.io](https://10015.io/) mixed toolbox — LOW–MEDIUM (search summaries; fetch blocked)
- [transform.tools](https://transform.tools) conversion suite (Markdown→HTML among codecs) — LOW (search summaries)

**Per-tool destinations**
- [Diffchecker](https://www.diffchecker.com/) — MEDIUM (search; server-side / paid extras)
- [convertcase.net](https://convertcase.net/) — MEDIUM (writer cases; not the programming target)
- [wordcounter.net](https://wordcounter.net/) — MEDIUM (writing-suite extras to **avoid**)
- [lipsum.com](https://www.lipsum.com/) — MEDIUM (paragraphs/words/bytes, classic start)

**Libraries / standards (Context7 + official READMEs) — MEDIUM, cross-checked**
- [marked](https://github.com/markedjs/marked) — GFM; **does not sanitize**; use DOMPurify
- [DOMPurify](https://github.com/cure53/dompurify) — `sanitize(dirty)` before HTML sink
- [sql-formatter](https://github.com/sql-formatter-org/sql-formatter) — dialects, `keywordCase`, `tabWidth`; default `sql` is not autodetection
- [jsdiff](https://github.com/kpdecker/jsdiff) — `diffLines` / `diffWords` / `diffChars` / `diffTrimmedLines` / `createPatch`
- [jsQR](https://github.com/cozmo/jsqr) — `ImageData` decode; camera **not** required
- [qrcode](https://github.com/soldair/node-qrcode) / [qrcode.react](https://github.com/zpao/qrcode.react) — EC L/M/Q/H, PNG/SVG, optional logo (we skip logo)
- ISO/IEC 18004 error-correction levels L/M/Q/H (~7/15/25/30%)
- NIST SP 800-63B — length over composition rules

**Existing product (HIGH — local codebase)**
- `src/components/ToolShell.tsx`, `src/lib/limits.ts` (100k chars), `src/data/tools.ts` categories, `src/content/tools/*.md` FAQ pattern (JSON formatter explicitly defers minify)

**Confidence caveats**
- Direct `WebFetch` of competitor homepages was blocked; catalog membership for it-tools is corroborated by multiple searches against the GitHub `src/tools/index.ts` listing, not a live click-through of each UI.
- Do not treat LOW-confidence 10015/TinyWow page chrome as authoritative; the anti-feature ("don't become them") is a product constraint, not a measured UX study.

---

*Feature research for: Devtoolbox — eight additive browser-local tools*
*Researched: 2026-09-11*
