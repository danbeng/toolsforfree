# Phase 6: QR generate and decode - Context

**Gathered:** 2026-09-14
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase ships the `qr-code` catalog tool at existing-tool parity: visitors enter text or a URL, see a QR preview, choose error correction L / M / Q / H (default M), and download the QR as PNG. They can select an image file and decode the payload entirely in the browser, then copy the decoded text. Oversize image files are rejected with a byte-cap error (not only the text char cap). The tool never requests camera / `getUserMedia`. Computation stays in `src/lib` plus the Preact island; no new API routes. Completeness harness from Phase 1 stays green; catalog snapshot 17 → 18; featured stays 6. json-formatter must not inherit QR library chunks (CAT-04).

</domain>

<decisions>
## Implementation Decisions

### Generate
- Live QR preview as the user types (QR-01); no camera
- Error-correction control: L / M / Q / H, default M (QR-03)
- Download the preview as PNG (QR-02); SVG download is v2 (QR-08)
- Empty text → idle preview (no placeholder QR); Copy of generate output is the PNG download, not a text dump of pixels
- Text input uses existing `isTooLarge` / `INPUT_MAX_CHARS` before encode

### Decode
- File `<input type="file">` only; `accept` image types; never `getUserMedia` / camera / video (QR-04, QR-07)
- Decode runs entirely in the browser on the selected file
- User can copy the decoded payload via ToolShell (QR-05)
- Oversize image files are rejected with a dedicated byte-cap error, not only the text char cap (QR-06)
- Unreadable / no-QR image → English error string, mapped in ZH_ERRORS

### Engine and isolation
- Thin `src/lib/qr.ts` (or equivalent) wraps generate + decode; island does not import the packages
- Only that lib file imports QR packages; json-formatter chunk must not inherit those identifiers (CAT-04)
- Exact generate + decode libraries and versions after research — spike file-decode quality; do not lock `qr@0.7` blindly
- No new API routes; no server OCR

### Catalog and chrome
- Catalog: slug `qr-code`, category Generate, `featured: false`; bump TOOLS length 17 → 18
- relatedSlugs: uuid-generator, password-generator, hash-generator; do not rewrite the existing ten tools' relatedSlugs
- EN+ZH markdown SEO/how-to/FAQ; FAQ states nothing is uploaded, decode is from a selected file, and the tool never uses the camera
- Clone HEAD WordCounter locale/`t()` + HEAD PasswordGenerator checkbox-in-label / native select analog + HEAD ToolShell (no locale prop) — never dirty worktree JsonFormatter that imports missing `useToolUi`

### Claude's Discretion
Exact npm packages and versions after research (generate vs decode may be two packages). PNG pixel size and how download is triggered (`<a download>` vs canvas `toDataURL`). Image byte-cap number. Idle empty-text preview chrome. Whether generate and decode share one page with two sections vs tabs. EN/ZH chrome keys. CAT-04 minify-surviving identifier list.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PasswordGenerator.tsx` generate-button + checkbox-in-label; `SqlFormatter.tsx` native `<select>` analog for ECC
- `WordCounter.tsx` locale/`t()` + `isTooLarge`
- `ToolIsland.astro` — add static import + `slug === 'qr-code'` + `locale={locale}`
- `src/data/tools.ts` / `tools.test.ts` — append-only row; snapshot 17 → 18; featured 6
- `src/i18n/ui.ts` — append `tools['qr-code']`; do not drop Phase 2–5 keys
- Completeness harness: `existsSync(URL)` not `.pathname`; ToolIsland source-read `includes(\`slug === '${slug}'\`)`
- `isTooLarge` / `INPUT_MAX_CHARS` in `src/lib/limits.ts` — apply to QR text; add a separate image byte cap

### Established Patterns
- 8-file additive checklist: lib + test, island, ToolIsland branch, catalog, ui.ts, EN+ZH markdown
- Parsers return discriminated `{ ok: true, ... } | { ok: false, error: string }`; never throw to UI
- English default unprefixed URLs; ZH under `src/pages/zh/`
- No `src/lib/index.ts` barrel
- Do not rewrite the existing ten tools
- Heavy packages imported only from that tool's `src/lib`
- CAT-04 greps minify-surviving identifiers from the JsonFormatter chunk after `astro build` (worktree dist if dirty-main build fails)

### Integration Points
- `src/pages/tools/[slug].astro` and `src/pages/zh/tools/[slug].astro` already pass `<ToolIsland slug={slug} locale={locale} />`
- Catalog `TOOLS` is the source of truth
- Markdown is SEO/how-to/FAQ only (`howTo` 3, `faq` 3–5)
- ROADMAP **UI hint: yes** — generate UI-SPEC before planning
- ToolCategory currently has no Image bucket; QR sits under Generate

</code_context>

<specifics>
## Specific Ideas

- Never request camera / `getUserMedia`
- FAQ: computation is local; nothing uploaded; decode is a selected image file, not a live camera
- Confirm during research/plan that json-formatter page bundle does not contain QR library identifiers
- Spike decode quality on a generated PNG round-trip before locking the decode package

</specifics>

<deferred>
## Deferred Ideas

- SVG download (QR-08)
- Camera / live scan
- Logo / center-image overlay
- Colored modules / custom eye patterns
- Batch decode
- Wi-Fi / vCard structured payloads beyond raw text

</deferred>
