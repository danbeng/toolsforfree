# Project Research Summary

**Project:** Devtoolbox — More Tools Milestone
**Domain:** Browser-local bilingual (EN+ZH) developer utility catalog (additive 8-tool expansion on Astro 7 + Preact)
**Researched:** 2026-09-11
**Confidence:** MEDIUM

## Executive Summary

Devtoolbox is a static, privacy-first catalog of in-browser developer tools. Experts in this niche (it-tools-class catalogs, not TinyWow kitchen sinks) ship one-job pages: SSG chrome + a small client island + a pure local processor. This milestone is brownfield and additive: keep Astro 7, Preact, `TOOLS` catalog, duplicated EN/`/zh/` trees, ToolShell, and content-collection SEO. Do not add APIs, accounts, camera QR, or a second UI runtime.

Recommended approach: eight vertical slices at existing-tool parity. Install only five packages (`marked@^18.0.12`, `dompurify@^3.4.15`, `sql-formatter@^15.8.2`, `diff@^9.0.0`, `qr@^0.7.0`). Implement case/slug, password, word count, and lorem in `src/lib` with no extra deps. Wire each tool as catalog row + island + EN/ZH `ui.ts` + errors + both markdown files. Categories stay Format / Text / Generate — no Image category.

Key risks: Markdown XSS and remote-image privacy leaks; `ToolIsland.astro` static imports pulling SQL/Markdown/QR onto every tool page; `Math.random` or biased modulo in the password generator; CJK-empty slugs and whitespace word-count on `/zh/`; QR camera/WASM/upload paths. Mitigate with DOMPurify + forbid remote images by default, per-tool chunks / no lib barrels, Web Crypto + rejection sampling, Unicode-preserving slug + `Intl.Segmenter`, file-only QR with a byte cap, and QR last after a decode spike.

## Key Findings

### Recommended Stack

Do not replace the app stack. New packages only when the algorithm is too large or unsafe to maintain locally. Heavy libs must be imported only from that tool's `src/lib` or island. After SQL/Markdown/QR land, inspect `dist/_astro/` so json-formatter does not grow those chunks.

**Core technologies:**
- Astro `^7.3.2` + Preact `^10.29.8` — existing SSG/islands; do not add React
- TypeScript `^7` + Vitest `^5` (Node) — colocated `src/lib/*.test.ts`
- `marked` + `dompurify` — GFM preview; Marked does not sanitize
- `sql-formatter` via `formatDialect` + named dialects — never `format()` + string `language`
- `diff@9` — line diff; no Monaco
- `qr@0.7` (paulmillr) — generate + file decode; no camera, no ZXing/WASM
- Custom `case.ts`, `password.ts`, `count.ts`/`word-count.ts`, `lorem.ts` — zero extra packages

See [STACK.md](./STACK.md).

### Expected Features

v1 is **all eight tools at catalog parity**, with ruthless cuts *inside* each tool. Shared table stakes: live local compute, copy, size guard, EN+ZH UI/FAQ, catalog + related slugs, no Submit button.

**Must have (table stakes):**
- Markdown: GFM live preview, DOMPurify, copy HTML
- Diff: two panes, line highlight, ignore whitespace, add/remove stats, "No differences"
- SQL: pretty-print, short dialect list, upper keywords, 2-space, copy, honest "not autodetection / not an executor" FAQ
- Case/Slug: fan-out UPPER/lower/Title/camel/Pascal/snake/kebab/CONSTANT + URL slug
- Password: length 8–128 (default 16), charset toggles, exclude similar, CSPRNG, copy, regenerate
- Counter: words, chars ± spaces, lines, sentences/paragraphs, Han/CJK-aware counts
- Lorem: local corpus, paragraphs or words, classic-start, copy (Latin dummy, ZH UI around it)
- QR: text→preview, PNG download, ECC L/M/Q/H (default M), file decode, copy payload, byte cap

**Should have (competitive) — P2, same island if cheap:**
- Privacy FAQ naming library boundary (especially password, markdown XSS, QR file-local)
- Diff word-level + unified patch copy; SQL keyword-case/indent toggles; QR SVG download
- Password entropy bits hint; counter reading time + UTF-8 bytes; lorem `<p>` wrap

**Defer (v2+):**
- Mermaid/KaTeX/PDF, merge/syntax-highlight diffs, SQL execute, pinyin slugs, passphrases/zxcvbn, grammar density, novelty ipsum, camera/logo/WiFi QR, image toolbox, extra locales

**Opinionated lock vs FEATURES.md slug note:** keep CJK letters in slugs (STACK + PITFALLS). FEATURES.md's "Han becomes `-`" rule would ship a dead ZH slug tool. FAQ the rule; no pinyin this milestone.

See [FEATURES.md](./FEATURES.md).

### Architecture Approach

Do not redesign. Each tool is one more vertical slice through existing seams: `TOOLS` row, `ToolIsland` if-chain + `client:load`, `src/lib` result union, Preact island, EN/ZH markdown, `ui.ts` / `errors.ts`. No new `.astro` tool pages. No new `ToolCategory`. Featured stays six. Clone JsonFormatter / Base64 / HashGenerator — not UuidGenerator's missing-lib shortcut. Markdown HTML and QR image live in ToolShell **children**; do not add a generic HTML prop to ToolShell.

**Locked slugs:** `markdown-preview`, `text-diff`, `sql-formatter`, `case-converter`, `password-generator`, `word-counter`, `lorem-ipsum`, `qr-code`.

**Major components:**
1. `src/data/tools.ts` — routing source of truth, related graph, categories
2. `ToolIsland.astro` — explicit slug → island (Astro forbids `client:*` on dynamic tags)
3. `src/lib/{tool}.ts` + tests — pure transforms; English errors
4. Preact `*.tsx` + `ToolShell` — input, caps, copy chrome
5. Content collections + `ui.ts` — SEO/how-to/FAQ vs island labels (never mix)

See [ARCHITECTURE.md](./ARCHITECTURE.md).

### Critical Pitfalls

1. **Markdown XSS** — Always `DOMPurify.sanitize` after marked; never `{ sanitize: true }`; XSS fixtures in DoD.
2. **Remote Markdown images leak privacy** — Forbid `img`/remote `src` by default; optional toggle off; FAQ it.
3. **ToolIsland static import graph** — Heavy deps must not land on json-formatter; no `src/lib/index.ts`; verify `astro build` chunks.
4. **Password `Math.random` / biased `%`** — `getRandomValues` + rejection sampling; empty charset error.
5. **CJK slug empty / word count = 1** — Unicode-preserving slug; `Intl.Segmenter`; ZH fixtures in the same PR.
6. **QR camera / WASM / upload** — File input only; `qr/decode.js`; byte + dimension cap; no getUserMedia.
7. **Catalog/i18n drift** — Missing island branch builds a blank panel; `TOOLS.length === 10` fails CI; every English error needs `ZH_ERRORS` in the same slice.

See [PITFALLS.md](./PITFALLS.md).

## Implications for Roadmap

Suggested **six phases**. Do not batch eight catalog rows first (`astro build` throws on missing markdown; missing island branch is silent-blank).

### Phase 1: Additive tool contract
**Rationale:** Shared wiring must exist before any heavy lib, or the first tool teaches the wrong import pattern and CI stays pinned at 10 tools.
**Delivers:** Completeness tests (unique slugs, en+zh content, island branch coverage); grow `TOOLS.length` with the catalog; keep featured === 6; optional `INPUT_MAX_BYTES` helper stub; document island-split rule (dynamic import of fat libs inside the island at minimum).
**Addresses:** Parity wrapper contract; not a user-facing tool yet.
**Avoids:** Pitfall 6 (shared graph), Pitfall 9 (checklist drift), accidental rewrite of the existing ten.

### Phase 2: Light text/generate (zero/low deps)
**Rationale:** Prove the 8-file checklist on tools that fit ToolShell without HTML/file chrome.
**Delivers:** `word-counter`, `case-converter`, `lorem-ipsum`, `password-generator` — lib+tests, islands, catalog, EN+ZH, relatedSlugs.
**Addresses:** Counter (incl. Han count), case/slug fan-out, lorem local corpus, password CSPRNG.
**Avoids:** Pitfall 3 (password), Pitfall 7 (CJK), Pitfall 10 (generator maxes, no `fetch` lorem).
**Uses:** Custom libs only; Web Crypto.

### Phase 3: SQL formatter
**Rationale:** First fat npm lib, still text-shaped ToolShell; spike tree-shaking before Markdown XSS work.
**Delivers:** `sql-formatter` with `formatDialect`, dialects: Standard, PostgreSQL, MySQL, SQLite, T-SQL, BigQuery (STACK; FEATURES v1 listed five — include BigQuery, keep the dropdown short).
**Addresses:** SQL pretty-print P1.
**Avoids:** Pitfall 4 (`format()` bundle bomb, fake autodetection).
**Implements:** Format category + related to json-formatter.

### Phase 4: Text Diff
**Rationale:** Needs two-pane chrome exception and timeout policy; still no HTML injection.
**Delivers:** `text-diff` — `diffLines`, ignore whitespace, stats, dedicated island; copy-patch optional P2.
**Addresses:** Diff table stakes.
**Avoids:** Pitfall 8 (ToolShell-only patch dump, unbounded Myers).
**Note:** UI-SPEC recommended (ToolShell does not suffice).

### Phase 5: Markdown preview (security-gated)
**Rationale:** First `innerHTML` in the product. Sanitizer + remote-image policy are DoD, not follow-up.
**Delivers:** `markdown-preview` — marked GFM + DOMPurify, preview child, copy sanitized HTML, default zero network.
**Addresses:** Markdown P1.
**Avoids:** Pitfalls 1–2 (XSS, privacy leak).
**Uses:** `marked` + browser `dompurify` only in this island.

### Phase 6: QR generate + decode (last)
**Rationale:** Heaviest island; only image-in exception; depends on wiring + preview-child pattern from Markdown.
**Delivers:** `qr-code` — encode SVG/PNG, ECC M default, file decode via `qr/decode.js`, byte cap, no camera.
**Addresses:** QR generate+decode P1; SVG download P2 if cheap.
**Avoids:** Pitfall 5 (camera/WASM/upload); re-check json-formatter chunk size.
**Spike first:** decode quality on screenshots; fallback jsQR only if UAT fails.

### Phase Ordering Rationale

- Contract first so CI and island graph do not rot on tool one.
- Zero-dep tools second so parity (i18n/FAQ/catalog) is muscle memory before security/bundle spikes.
- SQL before Markdown so `formatDialect` chunk discipline is proven on a text tool.
- Diff before Markdown so two-pane exception is settled without mixing XSS.
- Markdown before QR so sanitized preview / children pattern exists for image chrome.
- QR last isolates camera/file/UAT risk.

### Research Flags

Phases likely needing deeper research during planning (`/gsd-plan-phase --research-phase`):
- **Phase 1:** Confirm whether per-slug Astro wrappers are required vs dynamic `import()` inside one ToolIsland switch (bundler behavior).
- **Phase 3:** Confirm `formatDialect` tree-shakes in this Astro 7 / Vite build.
- **Phase 5:** DOMPurify config (forbid img vs hook); iframe sandbox vs in-page preview.
- **Phase 6:** `qr@0.7` file-decode quality + gzip; Firefox; reject WASM unless measured.

Phases with standard patterns (skip research-phase):
- **Phase 2:** Lorem word list, password Web Crypto (clone hash/UUID bar), ASCII case modes plus documented Unicode slug — well-specified in STACK/PITFALLS.
- **Phase 4:** jsdiff `diffLines` is standard; spike only if timeout/UX numbers are unset (can live in plan, not a research-phase).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Context7 + same-day `npm view`; gzip sizes not authoritative; `qr` decode API from README not Context7 |
| Features | MEDIUM | Competitor homepages often blocked; it-tools index corroborated via search/GitHub; product constraints HIGH locally |
| Architecture | HIGH | Existing catalog/island/content/i18n path read from this repo; island JS isolation MEDIUM until `astro build` |
| Pitfalls | MEDIUM | Codebase pitfalls HIGH; CSPRNG/CJK/QR library folklore LOW without spikes |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Slug CJK policy conflict** between FEATURES.md (strip Han) and STACK/PITFALLS (keep Han). **Lock: keep CJK** in requirements.
- **SQL dialect list:** FEATURES v1 omitted BigQuery/T-SQL vs STACK's six. **Lock: STACK list** (short, named imports).
- **QR byte/pixel cap numbers** — product choice (PITFALLS suggests 5–8 MB + downscale ~1600px); set in QR phase plan.
- **`Intl.Segmenter` browser targets** — feature-detect + fallback; spike only if support matrix is unclear.
- **ToolIsland split mechanism** — verify with first heavy tool's `astro build`, fail PR if json-formatter JS jumps.
- **Diff UI-SPEC** — plan-phase should include ui_phase for Diff (and Markdown/QR chrome).
- **jsQR vs `qr` decode** — fallback only after UAT failure, not default.

## Sources

### Primary (HIGH confidence)
- Local codebase — `ToolIsland.astro`, `ToolShell.tsx`, `tools.ts`, `[slug].astro`, `limits.ts`, `errors.ts`, `tools.test.ts`, existing ten tools
- `.planning/PROJECT.md` — locked eight, no camera, no backend, no rewrite of the ten

### Secondary (MEDIUM confidence)
- Context7 `/markedjs/marked`, `/cure53/dompurify`, `/sql-formatter-org/sql-formatter`, `/kpdecker/jsdiff`, `/withastro/docs`
- `npm view` 2026-09-11 — marked 18.0.12, dompurify 3.4.15, sql-formatter 15.8.2, diff 9.0.0, qr 0.7.0
- it-tools catalog as competitor depth target (not stack to copy)
- NIST SP 800-63B (length over composition) — password UX, not a library

### Tertiary (LOW confidence)
- QR WASM / BarcodeDetector / jsQR speed writeups (fetches blocked)
- 10015.io / TinyWow page chrome (anti-feature constraint, not measured UX)
- Exact gzip figures for sql-formatter dialects and `qr` README benches

---
*Research completed: 2026-09-11*
*Ready for roadmap: yes*
