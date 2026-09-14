# Phase 6: QR generate and decode - Research

**Researched:** 2026-09-14
**Domain:** Astro 7 + Preact catalog tool — in-browser QR generate (PNG) + file decode via `qr@0.7.0`
**Confidence:** HIGH (locked CONTEXT + approved UI-SPEC + unpacked `qr@0.7.0` tarball + Node generate/decode round-trip spike + esbuild minify identifiers + HEAD clone targets)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

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

### Deferred Ideas (OUT OF SCOPE)
- SVG download (QR-08)
- Camera / live scan
- Logo / center-image overlay
- Colored modules / custom eye patterns
- Batch decode
- Wi-Fi / vCard structured payloads beyond raw text
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QR-01 | Enter text or a URL and see a QR preview | `encodeQR(text, 'raw', { ecc })` → `boolean[][]`. Island paints black-on-white canvas 256×256. Empty/whitespace `trim() === ''` skips encode (library **would** encode `''` as a v1 QR — island must not call). Live `onInput`, no Generate button. |
| QR-02 | Download the QR as PNG | Island: `canvas.toDataURL('image/png')` + temporary `<a download="qr-code.png">`. Do **not** use `encodeQR(..., 'data-url')` (GIF, not PNG). No SVG (QR-08). |
| QR-03 | ECC L / M / Q / H, default M | UI labels L/M/Q/H. Map to `qr` opts `ecc`: `L→low`, `M→medium`, `Q→quartile`, `H→high`. Passing `'M'` throws `invalid ecc=M`. Default `'medium'`. |
| QR-04 | Select an image file and decode in the browser | Island: `<input type="file">` → `createImageBitmap(file)` → canvas `getImageData` → `decodeQR(imageData, { effort: Infinity, timeLimit: Infinity })`. No `fetch` of the file. |
| QR-05 | Copy the decoded payload | ToolShell `output` = decoded **string**. Copy is HEAD ToolShell. Generate never writes a data-URL into `output`. |
| QR-06 | Oversize image files rejected with a byte-cap error | `IMAGE_MAX_BYTES = 5_242_880` compared to `file.size` **before** FileReader/bitmap. Distinct English string from `INPUT_TOO_LARGE_MSG`. Also reject bitmaps with width or height `> 4096` (`MAX_IMAGE_SIDE`). |
| QR-07 | Never request camera / `getUserMedia` | Do **not** import `'qr/dom.js'`. No `capture` attribute, no `<video>`, no `navigator.mediaDevices`. Source-read tests forbid those strings in `src/lib/qr.ts` and the island. |
| CAT-01 | Unique slug Generate `featured: false` | Append-only `TOOLS` row; snapshot `toHaveLength(17)` → `18`; `getFeaturedTools()` stays 6. |
| CAT-02 | EN+ZH markdown | Completeness `existsSync(URL)` both paths. `howTo` 3, `faq` 3–5. FAQ: local / nothing uploaded / selected image file / never camera. |
| CAT-03 | ToolIsland branch | Static import + `slug === 'qr-code'` + `locale={locale}`. |
| CAT-04 | json-formatter must not inherit QR chunks | Only `src/lib/qr.ts` imports `'qr'` and `'qr/decode.js'`. After `astro build`, grep JsonFormatter chunk for the seven minify-surviving identifiers below. |
| CAT-05 | Do not rewrite existing ten `relatedSlugs` | New row may point at existing slugs; do not edit the first ten rows. |
| CAT-06 | Live compute, copy, size guard, EN+ZH chrome, `ZH_ERRORS` | 8-file checklist. Map text-cap, image-cap, unreadable, not-an-image, encode-fail in `ZH_ERRORS` this slice (UI-SPEC ZH strings). |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Privacy: all tool computation in the browser (`src/lib`); no new API routes for tool logic.
- Parity: new tools must match existing tool quality (chrome, copy, errors, EN+ZH, FAQ).
- Stack: stay on Astro + Preact + current catalog/content-collection pattern; do not introduce a new app framework.
- QR decode: in-browser only (selected image file); no camera / server OCR.
- Do not rewrite the existing ten tools; this milestone is additive.
- Pure logic: `src/lib/<topic>.ts` + colocated `src/lib/<topic>.test.ts`.
- Default-export Preact islands; named-export libs/data/i18n.
- Do not add `index.ts` barrels; import the concrete file.
- Vitest: `src/**/*.test.ts`, Node environment, `npm test` → `vitest run`.
- Discriminated `{ ok: true } | { ok: false, error: string }` for parsers; English lib errors; `ZH_ERRORS` for ZH.
- Size guard for **text** is `isTooLarge` / `INPUT_MAX_CHARS` (`100_000`). Image uses a **separate** byte cap this phase.
- Preact class attributes as `class` (not `className`).
- Clone HEAD WordCounter locale/`t()` + HEAD PasswordGenerator native controls + HEAD SqlFormatter `<select>` + HEAD ToolShell — never dirty worktree JsonFormatter that imports missing `useToolUi`.
- Completeness: `existsSync(URL)` not `.pathname`; ToolIsland source-read `includes(\`slug === '${slug}'\`)`; pass `locale={locale}`.
- GSD: this research file is the GSD research artifact.
- Do not commit unrelated dirty i18n/pages. Do not pop `stash@{0}`.
- CSPRNG is already shipped (password-generator); not this phase.

## Summary

Phase 6 is the last **heavy-library** catalog slice. Ship `qr-code` at 8-file parity: visitors type text/URL, see a live black-on-white QR, pick ECC L/M/Q/H (default M), download PNG; they can also pick a local image file and copy the decoded payload. Computation stays in `src/lib/qr.ts` plus a Preact island. No API route, no worker, no camera, no SVG.

STATE.md asked not to lock `qr@0.7` blindly. Spike this session: **`qr@0.7.0` generate + `qr/decode.js` file-decode round-trips** on the encoder's own raster at ≥2 px/module, including a 256×256 UI-SPEC paint (16 px quiet zone, 7 px modules for a typical URL). `jsQR@1.4.0` also decoded those same rasters, but it is extra surface, last published 2021, and its README is webcam-oriented. Do **not** install `jsqr`, `qrcode`, `qr-scanner`, or `@zxing/*`.

**Primary recommendation:** One 8-file slice. Install only `qr@0.7.0`. Thin `src/lib/qr.ts` wrapping `encodeQR` from `'qr'` and `decodeQR` from `'qr/decode.js'` (never `'qr/dom.js'`). Island clones HEAD WordCounter locale/`t()` + HEAD SqlFormatter native `<select>` + HEAD ToolShell (no locale prop). Catalog `qr-code` / Generate / `featured: false`; TOOLS 17 → 18. After `astro build`, grep the json-formatter island chunk for minify-surviving `encodeQR` / `decodeQR` / `Capacity overflow` / `invalid ecc` / `pointsOnDetect` / `paulmillr` / `data:image/gif`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Catalog row, slug, Generate, `featured: false`, relatedSlugs | API / Backend (static `TOOLS`) | CDN / Static (`getStaticPaths`) | `TOOLS` is routing source of truth. Markdown collection is SEO only. |
| QR encode (`encodeQR` → matrix) | Browser / Client (`src/lib/qr.ts` in island) | API / Backend (Vitest) | Privacy: compute in the visitor browser. Same module runs in tests. |
| Canvas/PNG paint + download | Browser / Client (Preact island) | — | Needs `HTMLCanvasElement`. Lib returns the matrix only. |
| File decode (`decodeQR` on `ImageData`) | Browser / Client (`src/lib/qr.ts`) | API / Backend (Vitest synthetic RGBA) | Local `File` only. Decoder is pure pixels — tests do not need jsdom. |
| Image byte cap + 4096-side cap | Browser / Client (island, before bitmap/decode) | — | Size guard in UI, not the decoder. Distinct from `INPUT_MAX_CHARS`. |
| Text size guard | Browser / Client (`isTooLarge` in island) | — | Do not call `encodeQR` when over cap. |
| Camera forbid | Browser / Client (no `qr/dom.js`, no `getUserMedia`) | — | QR-07. FAQ states it. |
| EN+ZH SEO / how-to / FAQ | CDN / Static (content collections) | — | `howTo` 3, `faq` 3–5; privacy + no-camera copy lives here. |
| Bundle isolation (CAT-04) | CDN / Static (Vite island chunks) | Browser / Client | `'qr'` and `'qr/decode.js'` imported only from `src/lib/qr.ts` used by `QrCode.tsx`. |
| Completeness harness | API / Backend (Vitest source-read / existsSync) | — | Phase 1 tests stay green as catalog grows to 18. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `qr` (paulmillr/qr) | **0.7.0** (`^0.7.0`) | Encode matrix + decode ImageData | Official README `npm install qr`. Zero runtime deps. Dual MIT OR Apache-2.0. ESM `exports["."]`, `./decode.js`, `./dom.js`. `engines.node` `>= 20.19.0`. Generate **and** file-decode in one package so CAT-04 has one graph. Spike: own PNG-like raster round-trips. [CITED: unpacked `qr@0.7.0` `package.json` + `README.md`] |
| Astro | `^7.3.2` | SSG, `getStaticPaths` from `TOOLS` | Already the app. [VERIFIED: package.json:14] quote: `"astro": "^7.3.2"` |
| Preact | `^10.29.8` | Tool islands | [VERIFIED: package.json:15] quote: `"preact": "^10.29.8"` |
| `@astrojs/preact` | `^6.0.5` | `client:load` | [VERIFIED: package.json:12] quote: `"@astrojs/preact": "^6.0.5"` |
| Vitest | `^5.0.0` | Colocated `src/**/*.test.ts` | [VERIFIED: package.json:9,19] quotes: `"test": "vitest run"` / `"vitest": "^5.0.0"` |
| TypeScript | `^7.0.2` | Strict Astro tsconfig | [VERIFIED: package.json:18] quote: `"typescript": "^7.0.2"` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `jsdom` | already `^30.0.1` **devDependency** | Existing Markdown tests | **Do not import from `src/lib/qr.ts`**. QR unit tests run in default Node: pass `{ width, height, data: Uint8ClampedArray }` to `decodeQR`. Do **not** add a second jsdom install. |
| `canvas` (node-canvas) | n/a | Node PNG encode | **Do not install.** Island paints in the browser. Tests assert the matrix + a synthetic RGBA raster, not a PNG file. |
| `jsqr` | **1.4.0** (do not install) | Alternate decoder | Spike succeeded on the same rasters, but extra CAT-04 identifiers, last publish 2021-04-24, README centers on `getUserMedia`. |
| `qrcode` (soldair) | **1.5.4** (do not install) | Alternate encoder | Generate-only. Runtime deps `pngjs` / `yargs` / `dijkstrajs`. No decode. `errorCorrectionLevel: 'M'` would still need a second decode package. |
| `qr-scanner` | **1.4.2** (do not install) | Webcam scanner | README: "Web cam scanning support out of the box". Forbidden by QR-07. |
| `@zxing/library` / `@zxing/browser` | **0.23.0** / **0.2.1** (do not install) | ZXing port | REQUIREMENTS out-of-scope: "ZXing/WASM decode by default". 1.8 MB tarball. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `qr@0.7.0` encode+decode | `qrcode@1.5.4` + `jsqr@1.4.0` | Two packages, pngjs in the graph, jsqr unmaintained since 2021. Spike showed **no quality win** on generated rasters. |
| `qr/decode.js` | `@zxing/library` | Larger bundle; REQUIREMENTS forbids ZXing-by-default. |
| `qr/decode.js` | `qr-scanner` | Camera-first API. QR-07. |
| `encodeQR(..., 'data-url')` for download | canvas PNG | **Rejected.** data-url is `data:image/gif;base64,...` (probe this session). QR-02 is PNG. |
| `encodeQR(..., 'svg')` + `svgToPng` from `qr/dom.js` | canvas from `'raw'` | `qr/dom.js` also ships `rearCamera` / `selfieCamera`. Do not import that entry. SVG download is QR-08. |
| Island imports `qr` | Thin `src/lib/qr.ts` | Locked CAT-04. |
| Tabs for generate/decode | Two stacked sections | UI-SPEC locked stacked sections. |

**Installation:**

```bash
npm install qr@0.7.0
```

Do **not** install `jsqr`, `qrcode`, `qr-scanner`, `@zxing/library`, `@zxing/browser`, `canvas`, or a second `jsdom`.

**Version verification:**

| Package | `npm view` version | `time` of that version | License | Weekly downloads | postinstall |
|---------|--------------------|------------------------|---------|------------------|-------------|
| `qr` | `0.7.0` | `2026-08-31T09:44:41.840Z` | `(MIT OR Apache-2.0)` | 187,268 | none |
| `jsqr` (not installed) | `1.4.0` | legitimacy `publishedAt` `2021-04-24T03:17:20.646Z` | Apache-2.0 | 1,919,144 | none |
| `qrcode` (not installed) | `1.5.4` | `2024-08-05T23:03:59.556Z` | MIT | 19,135,545 | none |

`qr` `engines` quote: `"node": ">= 20.19.0"` [VERIFIED: unpacked `qr@0.7.0` `package.json`]. Present constraint — Node `v22.22.2` satisfies it.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `qr` | npm | first npm time.created `2022-01-27`; `0.7.0` 2026-08-31 | 187,268/wk | github.com/paulmillr/qr | Seam `SUS` (`too-new` on latest publish) | **Approved** — official README `npm install qr`; paulmillr; zero deps; no postinstall. Planner: **no** `checkpoint:human-verify`. |
| `jsqr` | npm | `1.4.0` 2021-04-24 | 1,919,144/wk | github.com/cozmo/jsQR | OK | **REMOVED** from recommendations — extra decode package; README is webcam-oriented |
| `qrcode` | npm | `1.5.4` 2024-08-05 | 19,135,545/wk | github.com/soldair/node-qrcode | OK | **REMOVED** — generate-only; pngjs/yargs runtime deps |
| `qr-scanner` | npm | `1.4.2` 2022-11-23 | 258,188/wk | github.com/nimiq/qr-scanner | OK | **REMOVED** — camera-first (QR-07) |
| `@zxing/library` | npm | `0.23.0` 2026-04-29 | 1,282,519/wk | github.com/zxing-js/library | OK | **REMOVED** — out of scope ZXing-by-default |
| `@zxing/browser` | npm | `0.2.1` 2026-07-06 | 837,695/wk | github.com/zxing-js/browser | OK | **REMOVED** — camera/browser layer |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** seam flagged `qr` because latest publish is recent (`too-new`), not because the package is unknown. Treat as Approved (same class as Phase 5 `marked` / `dompurify`).

The name `qr` comes from the official tarball README **but** `package-legitimacy check` did not return `OK`, so it is **not** tagged `[VERIFIED: npm registry]`. Tag: `[CITED: unpacked qr@0.7.0 README.md]`.

## Architecture Patterns

### System Architecture Diagram

```text
Visitor text/URL (textarea) + ECC <select>
        │
        ▼
QrCode.tsx  (Preact island, client:load, locale prop)
        │  trim(input) === '' ──yes──► idle: blank .qr-preview, Download disabled
        │                             do not call encodeQR (library would still emit a QR)
        │  isTooLarge(input)? ──yes──► ToolShell error = localized INPUT_TOO_LARGE_MSG
        │                             blank preview, Download disabled, do not encode
        │  no
        ▼
src/lib/qr.ts  encodeQr(text, eccUi)
        │  map L/M/Q/H → low/medium/quartile/high
        │  encodeQR(text, 'raw', { ecc })   // NEVER 'data-url' (GIF)
        │  catch Capacity overflow → { ok:false, error: 'Cannot encode this text as a QR code.' }
        ├─ { ok:true, matrix: boolean[][] }
        └─ { ok:false, error }
                │
                ▼
Island paints canvas 256×256 black #000 on white #fff, 16px quiet zone
        │  Download PNG ── canvas.toDataURL('image/png') + <a download="qr-code.png">

Visitor <input type="file" accept="image/png,image/jpeg,image/webp,image/gif">
        │  NEVER capture / getUserMedia / fetch(file)
        │  file.size > 5_242_880 ──yes──► IMAGE_TOO_LARGE_MSG, do not read
        │  createImageBitmap(file) fails ──► 'Could not read this file as an image.'
        │  width|height > 4096 ──► IMAGE_TOO_LARGE_MSG
        ▼
src/lib/qr.ts  decodeQr(imageData)
        │  decodeQR(img, { effort: Infinity, timeLimit: Infinity })
        │  throws (finder/data/…) → { ok:false, error: 'No QR code found in this image.' }
        ├─ { ok:true, payload: string }  → ToolShell output (Copy)
        └─ { ok:false, error }

ToolIsland.astro ── static import QrCode
                 ── {slug === 'qr-code' && <QrCode client:load locale={locale} />}
                 ── json-formatter branch does NOT import qr

astro build ── dist/_astro/QrCode.*.js           MAY contain encodeQR / decodeQR / paulmillr
           ── dist/_astro/JsonFormatter.*.js     MUST NOT contain those identifiers
```

### Recommended Project Structure

```
src/lib/qr.ts                                    # NEW — encodeQr + decodeQr
src/lib/qr.test.ts                               # NEW — idle policy, ECC map, round-trip, isolation
src/lib/limits.ts                                # APPEND IMAGE_MAX_BYTES + IMAGE_TOO_LARGE_MSG
src/components/tools/QrCode.tsx                  # NEW — generate split + decode file + ToolShell
src/components/tools/ToolIsland.astro            # ADD static import + slug === 'qr-code'
src/data/tools.ts                                # APPEND qr-code row; do not edit first ten relatedSlugs
src/data/tools.test.ts                           # toHaveLength(17) → 18
src/i18n/ui.ts                                   # APPEND tools['qr-code'] EN+ZH (UI-SPEC keys only)
src/i18n/errors.ts                               # APPEND ZH_ERRORS for five English strings
src/i18n/errors.test.ts                          # APPEND chrome-key assert + ZH maps
src/content/tools/qr-code.md                     # NEW EN, howTo 3, faq 3–5
src/content/tools/zh/qr-code.md                  # NEW ZH
src/styles/global.css                            # APPEND only .qr-preview rules (do not retokenize :root)
```

Do **not** add `src/lib/index.ts`. Do **not** import `'qr'` / `'qr/decode.js'` / `'qr/dom.js'` from `ToolIsland.astro`, `json.ts`, or `JsonFormatter.tsx`. Do **not** import `'jsdom'` from `src/lib/qr.ts`. Do **not** edit dirty `src/i18n/useToolUi.ts` / dirty `ToolShell.tsx` / dirty `JsonFormatter.tsx`. Do **not** rewrite `ToolShell.tsx`.

Island filename: **`QrCode.tsx`** (PascalCase + domain suffix; slug remains `qr-code`). Default export `function QrCode`.

### Pattern 1: Thin lib wrapping `encodeQR` + `decodeQR`

**What:** `src/lib/qr.ts` mirrors `src/lib/json.ts`: never throw to UI, discriminated union. Island owns size-guards, file I/O, canvas, chrome strings.
**When to use:** Always this phase (locked).
**Example:**

```typescript
// Source: clone src/lib/json.ts:1-13 plus unpacked qr@0.7.0
// json.ts verbatim [VERIFIED: src/lib/json.ts:1-13]:
//   export type JsonResult =
//     | { ok: true; formatted: string }
//     | { ok: false; error: string };
//   export function formatJson(input: string): JsonResult {
//     const trimmed = input.trim();
//     if (!trimmed) return { ok: false, error: '' };
//     try {
//       const value = JSON.parse(trimmed);
//       return { ok: true, formatted: JSON.stringify(value, null, 2) };
//     } catch {
//       return { ok: false, error: 'Invalid JSON' };
//     }
//   }
// encodeQR [VERIFIED: unpacked qr@0.7.0 index.d.ts:18-19,40-41,114-118]:
//   export type ErrorCorrection = 'low' | 'medium' | 'quartile' | 'high';
//   export type QrOpts = {
//     ecc?: ErrorCorrection | undefined;
//   export declare function encodeQR(text: string, output: 'raw', opts?: QrOpts): boolean[][];
//   export default encodeQR;
// encodeQR defaults [VERIFIED: unpacked qr@0.7.0 index.js:41,890-901,951]:
//   const ECC_LEVELS = ['low', 'medium', 'quartile', 'high'];
//   export function encodeQR(text, output = 'raw', opts = {}) {
//     const ecc = opts.ecc !== undefined ? opts.ecc : 'medium';
//     if (!ECC_LEVELS.includes(ecc))
//         err(`invalid ecc=${ecc}`);
//     const border = opts.border === undefined ? 2 : asNum(opts.border, 'opts.border');
// decodeQR [VERIFIED: unpacked qr@0.7.0 decode.d.ts:15-17,48-58,109,185]:
//   export type Image = Size & {
//       data: Uint8Array | Uint8ClampedArray;
//   export type DecodeOpts = {
//       effort?: number;
//       timeLimit?: number;
//   export type DecodeQR = (img: Image, opts?: DecodeOpts) => string;
//   export declare const decodeQR: DecodeQR;
// README file decode [CITED: unpacked qr@0.7.0 README.md]:
//   import decodeQR from 'qr/decode.js';
//   const bitmap = await createImageBitmap(file);
//   return decodeQR(ctx.getImageData(0, 0, bitmap.width, bitmap.height));
//   For photos and file uploads pass `{ effort: Infinity, timeLimit: Infinity }`
// FAIL errors [VERIFIED: unpacked qr@0.7.0 decode.js:42-50]:
//   const FAIL = Object.freeze({
//       data: Object.freeze(new Error('data')),
//       finder: Object.freeze(new Error('finder')),
//   });
// Capacity [VERIFIED: unpacked qr@0.7.0 index.js:941-942]:
//         if (ver > 40)
//             err('Capacity overflow');

import encodeQR from 'qr';
import decodeQR from 'qr/decode.js';

export type QrEcc = 'L' | 'M' | 'Q' | 'H';

const ECC_TO_QR = {
  L: 'low',
  M: 'medium',
  Q: 'quartile',
  H: 'high',
} as const;

export const QR_ENCODE_FAIL_MSG = 'Cannot encode this text as a QR code.';
export const QR_NOT_FOUND_MSG = 'No QR code found in this image.';

export type QrEncodeResult =
  | { ok: true; matrix: boolean[][] }
  | { ok: false; error: string };

export type QrDecodeResult =
  | { ok: true; payload: string }
  | { ok: false; error: string };

export function encodeQr(input: string, ecc: QrEcc = 'M'): QrEncodeResult {
  if (!input.trim()) return { ok: false, error: '' };
  try {
    const matrix = encodeQR(input, 'raw', { ecc: ECC_TO_QR[ecc] });
    return { ok: true, matrix };
  } catch {
    return { ok: false, error: QR_ENCODE_FAIL_MSG };
  }
}

export function decodeQr(img: {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array;
}): QrDecodeResult {
  try {
    const payload = decodeQR(img, { effort: Infinity, timeLimit: Infinity });
    return { ok: true, payload };
  } catch {
    return { ok: false, error: QR_NOT_FOUND_MSG };
  }
}
```

Exact import paths: **`from 'qr'`** and **`from 'qr/decode.js'`**. Never `from 'qr/dom.js'`.

Do **not** pass `ecc: 'M'` / `'L'` / `'Q'` / `'H'` into `encodeQR` (probe: `invalid ecc=M`). Map in the lib.

Idle: **`if (!input.trim()) return { ok: false, error: '' }`**. Probe: `encodeQR('', 'raw')` still returns a 25×25 matrix (v1 QR of empty payload). UI-SPEC / QR-01 forbid a placeholder QR — the **island and lib both skip** empty/whitespace.

Do **not** call `encodeQR(..., 'gif')` or `'data-url'` from production code (GIF). Tests may inspect those only to assert they are unused.

Do **not** set `border: 0` (probe: `RangeError: invalid border=0`). Default border is **2 modules**, already in the `'raw'` matrix. Island 16 px CSS quiet zone is additional paint padding on the 256 canvas — keep default encoder border.

### Pattern 2: Island = generate split + decode file + ToolShell

**What:** `QrCode.tsx` default export `{ locale }: { locale: Locale }`. Visual QR is island children, **not** ToolShell `<pre>`. Decode payload is ToolShell `output`.
**When to use:** This tool. Clone **committed HEAD** `WordCounter.tsx` locale/`t()` + HEAD `SqlFormatter` native `<select>` + HEAD `PasswordGenerator` `<button type="button">`. **Not** dirty `JsonFormatter.tsx`. **Not** dirty `ToolShell.tsx`.
**Example:**

```tsx
// Source: WordCounter locale [VERIFIED: src/components/tools/WordCounter.tsx:1-14]
//   import { t, type Locale } from '../../i18n/ui';
//   export default function WordCounter({ locale }: { locale: Locale }) {
//   const copy = t(locale);
//   const labels = copy.tools['word-counter'];
//   if (isTooLarge(input)) { return { error: INPUT_TOO_LARGE_MSG, output: '', ...
// SqlFormatter select [VERIFIED: src/components/tools/SqlFormatter.tsx:36-46]:
//       <label>
//         {labels.dialect}
//         <select
//           value={dialect}
//           onChange={(e) =>
//             setDialect((e.target as HTMLSelectElement).value as SqlDialect)
//           }
//         >
// HEAD ToolShell [VERIFIED: git show HEAD src/components/ToolShell.tsx]:
//   export function ToolShell(props: { error: string | null; output: string; children: ComponentChildren; })
//   await navigator.clipboard.writeText(props.output);
//   {copied ? 'Copied' : 'Copy'}
// limits [VERIFIED: src/lib/limits.ts:1-7]:
//   export const INPUT_MAX_CHARS = 100_000;
//   export const INPUT_TOO_LARGE_MSG =
//     'Input too large to process in the browser.';
//   export function isTooLarge(input: string): boolean {
//     return input.length > INPUT_MAX_CHARS;
//   }
// UI-SPEC locked keys: name, shortDescription, generateSection, decodeSection,
//   text, ecc, preview, downloadPng, image
// UI-SPEC image cap: 5_242_880 ; filename qr-code.png ; accept list below

import { useMemo, useRef, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { encodeQr, decodeQr, type QrEcc } from '../../lib/qr';
import { INPUT_TOO_LARGE_MSG, IMAGE_TOO_LARGE_MSG, IMAGE_MAX_BYTES, isTooLarge } from '../../lib/limits';
import { t, type Locale } from '../../i18n/ui';
import { localizeError } from '../../i18n/errors';

const ECC_OPTIONS: QrEcc[] = ['L', 'M', 'Q', 'H'];
```

HEAD `ToolShell` has **no** `locale` prop. Do not pass `locale={locale}` into `ToolShell`. Dirty worktree `ToolShell.tsx` does — that is uncommitted dirt.

Island `error` slot: `decodeError ?? generateError` (UI-SPEC). Changing generate text does not clear a successful decode payload.

Download: enabled only when `matrix` is ok. Click:

```ts
const url = canvas.toDataURL('image/png');
const a = document.createElement('a');
a.href = url;
a.download = 'qr-code.png';
a.click();
```

Do **not** `window.open` as the primary path.

Canvas paint (locked numbers from UI-SPEC + spike): CSS **256×256** including **16 px** quiet zone; modules `#000000` on `#ffffff`; `modulePx = Math.floor((256 - 32) / n)` with leftover as extra padding. Spike: URL at ECC M → `n=29`, `modulePx=7`, decoded by both `decodeQR` and `jsQR`.

File input:

```html
<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
```

**Forbidden** attributes/APIs: `capture`, `<video>`, `navigator.mediaDevices`, `getUserMedia`.

Byte cap [UI-SPEC locked]: `file.size > 5_242_880` → `IMAGE_TOO_LARGE_MSG` (`Image is too large to process in the browser.`). Do not read the file.

After `createImageBitmap`, if `width > 4096 || height > 4096` → same `IMAGE_TOO_LARGE_MSG` (decoder `MAX_IMAGE_SIDE = 4096` [VERIFIED: unpacked `qr@0.7.0` decode.js:16]).

`.tool-grid.split` already stacks below 720px. [VERIFIED: git show HEAD src/styles/global.css] quote: `.tool-grid { display: grid; gap: 1rem; }` / `@media (min-width: 720px) {` / `.tool-grid.split { grid-template-columns: 1fr 1fr; }`

### Pattern 3: ToolIsland static import (not dynamic tag)

**What:** Add a static import and a `slug === 'qr-code'` branch with `client:load` and `locale={locale}`.
**When to use:** CAT-03. Astro forbids `client:*` on dynamic tags.
**Example:**

```astro
---
import QrCode from './QrCode';
---
{slug === 'qr-code' && <QrCode client:load locale={locale} />}
```

Coverage test already source-reads `includes(\`slug === '${slug}'\`)`. [VERIFIED: src/components/tools/ToolIsland.test.ts:10-16] quote: `source.includes(\`slug === '${slug}'\`)`

Current last branch [VERIFIED: src/components/tools/ToolIsland.astro:39]: `{slug === 'markdown-preview' && <MarkdownPreview client:load locale={locale} />}`

Do **not** `import('qr')` from `ToolIsland.astro`.

### Pattern 4: Catalog append-only

**What:** One new `TOOLS` row. Snapshot 17 → 18. Featured stays 6. `featured: false`.
**When to use:** CAT-01.
**Example values:**

```typescript
// [VERIFIED: src/data/tools.ts:1-8] ToolCategory includes 'Generate'
//   | 'Format'
//   | 'Auth'
//   | 'Encode'
//   | 'Generate'
//   | 'Text'
//   | 'Time'
//   | 'Color';
// [VERIFIED: src/data/tools.test.ts:12-13] expect(TOOLS).toHaveLength(17);
// [VERIFIED: src/data/tools.test.ts:21-23] expect(featured).toHaveLength(6);
// last current row [VERIFIED: src/data/tools.ts:148-155]:
//   slug: 'markdown-preview',
//   name: 'Markdown Preview',
//   category: 'Format',
//   shortDescription: 'Preview GitHub-flavored Markdown in your browser.',
//   relatedSlugs: ['json-formatter', 'text-diff', 'word-counter'],
//   featured: false,
{
  slug: 'qr-code',
  name: 'QR Code',
  category: 'Generate',
  shortDescription: 'Generate a QR from text or decode an image in your browser.',
  relatedSlugs: ['uuid-generator', 'password-generator', 'hash-generator'],
  featured: false,
}
```

`name` / `shortDescription` are UI-SPEC locked EN chrome.

### Pattern 5: Additive `.qr-preview` CSS only

**What:** Append rules under `.qr-preview`. Do not retokenize `:root`. Ignore dirty-worktree visual overlay (`--bg-elev`, IBM Plex, Syne).
**When to use:** UI-SPEC preview chrome.

Locked pane chrome (UI-SPEC): `width: min(256px, 100%); aspect-ratio: 1; height: auto; background: var(--bg); border: 1px solid var(--border); border-radius: 6px;` Idle: **empty** (no children). Populated: white fill `#ffffff`, 16 px quiet zone, black modules.

HEAD `:root` tokens [VERIFIED: git show HEAD src/styles/global.css]: `--bg: #121417;` `--panel: #1a1d21;` `--text: #e8eaed;` `--muted: #9aa0a6;` `--border: #2a2f36;` `--accent: #2dd4bf;` `--danger: #f87171;` `--mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;` `--sans: "Segoe UI", system-ui, sans-serif;`

Do not copy worktree `--bg: #0c1014` / `--accent: #3ecfbf` / `--display: Syne`.

### Anti-Patterns to Avoid

- **Importing `'qr/dom.js'`:** Ships `rearCamera` / `selfieCamera` / `getUserMedia` plumbing. QR-07.
- **`encodeQR(..., 'data-url')` as PNG download:** Probe prefix `data:image/gif;base64,`. QR-02 is PNG.
- **Passing UI letters `L/M/Q/H` as `opts.ecc`:** Throws `invalid ecc=M`.
- **Calling `encodeQR('')` for idle:** Library emits a real v1 QR. Skip in lib + island.
- **`border: 0`:** `invalid border=0`. Keep default 2.
- **Writing PNG data-URLs into ToolShell `output`:** Copy would copy pixels, not decode text (QR-05).
- **Importing `qr` from the island or ToolIsland:** CAT-04 leak.
- **Importing `jsdom` / `canvas` from `src/lib`:** CAT-04 / Node-only.
- **Cloning dirty JsonFormatter / dirty ToolShell:** missing `useToolUi`; HEAD ToolShell has no `locale` prop.
- **Placeholder / sample QR when text is empty:** QR-01 / UI-SPEC forbid it.
- **`jsqr` / `@zxing` / `qr-scanner`:** extra packages; camera or out-of-scope.
- **Remote `fetch(url)` then decode:** Threat model is local File only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QR ECC, version, mask, RS, finder | Custom matrix from Wikipedia | `encodeQR(..., 'raw')` | ISO tables, mask penalty, capacity are already implemented. |
| Locator + unmask + RS decode | Custom computer vision | `decodeQR` from `qr/decode.js` | Finder/alignment/perspective; throws typed `Error('finder')`. |
| GIF/SVG raster for PNG download | Hand PNG encoder | `canvas.toDataURL('image/png')` | Browser PNG; QR-02. Encoder `data-url` is GIF. |
| Camera scan | `getUserMedia` loop | Nothing this phase | QR-07 / REQUIREMENTS out of scope. |

**Key insight:** `qr@0.7.0` is one audited zero-dep graph for both directions. The PNG boundary is **canvas**, not the encoder's GIF `data-url`. The idle boundary is **skip encode**, because empty text still encodes.

## Common Pitfalls

### Pitfall 1: Locking `qr@0.7` without a round-trip
**What goes wrong:** Decode fails on the encoder's own 1 px/module raster; users download a PNG they cannot read back.
**Why it happens:** README: "Clean 1px-per-module rasters (the encoder's default `scale: 1`) are too small for run-length finder detection — upscale them ≥2× first." [CITED: unpacked README.md]
**How to avoid:** Island paints ≥2 CSS pixels per module. 256×256 with 16 px quiet zone yields `modulePx ≥ 7` for typical URLs (spike n=29). Unit-test a synthetic scale-2 raster round-trip.
**Warning signs:** Decode of a just-downloaded PNG returns `finder`.

### Pitfall 2: `ecc: 'M'` instead of `'medium'`
**What goes wrong:** `encodeQR` throws `invalid ecc=M`; island shows encode-fail on every keystroke.
**Why it happens:** UI-SPEC labels are L/M/Q/H; library names are `low|medium|quartile|high`.
**How to avoid:** Map in `src/lib/qr.ts` only. Unit-test `'M'` default.
**Warning signs:** Preview blank with `Cannot encode this text as a QR code.` on `hello`.

### Pitfall 3: Idle still shows a QR
**What goes wrong:** Empty textarea shows a scannable v1 code.
**Why it happens:** `encodeQR('', 'raw')` returns 25×25 (probe this session).
**How to avoid:** `trim() === ''` → do not encode; blank `.qr-preview`; Download disabled.
**Warning signs:** Download enabled on first paint.

### Pitfall 4: GIF data-URL shipped as PNG
**What goes wrong:** Downloaded `qr-code.png` is a GIF; some tools mislabel it.
**Why it happens:** `encodeQR(txt, 'data-url')` → `data:image/gif;base64,...` (probe).
**How to avoid:** Canvas `toDataURL('image/png')` only.
**Warning signs:** File starts with `GIF87a` / `GIF89a`.

### Pitfall 5: CAT-04 grep of `qr` / `decode` is a false clean
**What goes wrong:** Short names minify away or false-positive on unrelated strings.
**Why it happens:** Same class as Phase 5 `marked.parse`.
**How to avoid:** Grep minify-surviving identifiers (present in the 46 817 B combined minified graph, absent from a json-only 190 B graph):

- `encodeQR`
- `decodeQR`
- `Capacity overflow`
- `invalid ecc`
- `pointsOnDetect`
- `paulmillr`
- `data:image/gif`

Do **not** treat absence of `from 'qr'` in a minified chunk as sufficient (imports rewrite). Source isolation still asserts `from 'qr'` in `qr.ts`.
**Warning signs:** JsonFormatter chunk contains `encodeQR` or `paulmillr`.

### Pitfall 6: Importing `qr/dom.js` "for svgToPng"
**What goes wrong:** Camera helpers land in the island graph; QR-07 source-read fails; CAT-04 may leak `rearCamera`.
**Why it happens:** README documents `svgToPng` next to `rearCamera`.
**How to avoid:** Never import `'qr/dom.js'`. Paint `'raw'` on canvas.
**Warning signs:** Bundle contains `rearCamera` / `selfieCamera`.

### Pitfall 7: Using `INPUT_MAX_CHARS` for images
**What goes wrong:** A 2 MB photo passes the char guard (not a string) and then hangs decode; or a small file is rejected if someone stringifies it.
**Why it happens:** QR-06 is a **byte** cap.
**How to avoid:** `IMAGE_MAX_BYTES = 5_242_880` on `file.size` before bitmap. Keep `isTooLarge` on generate text only.
**Warning signs:** 6 MB JPEG starts `createImageBitmap`.

### Pitfall 8: Decoder `MAX_IMAGE_SIDE` 4096
**What goes wrong:** A 5 MB, 5000×5000 JPEG passes the byte cap then `decodeQR` throws `expected width and height <= 4096`.
**Why it happens:** `MAX_IMAGE_SIDE = 4096` [VERIFIED: decode.js:16-24].
**How to avoid:** After bitmap, if width or height `> 4096`, show `IMAGE_TOO_LARGE_MSG` without calling `decodeQR`.
**Warning signs:** Dimension RangeError surfaces as "No QR code found".

### Pitfall 9: `decodeQR` throws
**What goes wrong:** Uncaught `Error: finder` crashes the island.
**Why it happens:** README: "It **throws** when no QR code is found."
**How to avoid:** `try/catch` in `decodeQr`; map every throw to `QR_NOT_FOUND_MSG`.
**Warning signs:** White-screen on a photo of a cat.

### Pitfall 10: Cloning dirty ToolShell / JsonFormatter
**What goes wrong:** Type errors (`locale` required, missing `useToolUi`); CAT-04 `astro build` fails on unrelated dirty pages.
**Why it happens:** Worktree ToolShell adds `locale: Locale`; HEAD does not. [VERIFIED: git show HEAD src/components/ToolShell.tsx vs worktree Read]
**How to avoid:** Clone HEAD `WordCounter.tsx`, HEAD `SqlFormatter.tsx`, HEAD `PasswordGenerator.tsx` controls, HEAD `ToolShell` (no locale prop). Do not introduce `useToolUi`. Do not pop `stash@{0}`. If dirty pages break `astro build`, isolate the build the same way Phase 3/4/5 verify noted.

### Pitfall 11: Tests import jsdom for QR
**What goes wrong:** jsdom pulled into reasoning as required; someone imports it from `src/lib/qr.ts`.
**Why it happens:** Phase 5 needed a window for DOMPurify.
**How to avoid:** `decodeQR` is pure `{width,height,data}`. Spike ran in Node without jsdom. Never `from 'jsdom'` in `src/lib`.

## Code Examples

### Encode matrix (ECC map)

```javascript
// Source: unpacked qr@0.7.0 index.js + Node probe this session
import encodeQR from 'qr';
encodeQR('https://example.com/', 'raw', { ecc: 'medium' });
// boolean[][] length 29; first two rows all false (quiet zone border 2)
encodeQR('https://example.com/', 'raw', { ecc: 'M' });
// throws: invalid ecc=M
encodeQR('', 'raw');
// 25×25 matrix — DO NOT call from idle UI
encodeQR('A'.repeat(3000), 'raw', { ecc: 'high' });
// throws: Capacity overflow
```

### Decode ImageData (file path)

```javascript
// Source: unpacked qr@0.7.0 README.md + decode.js FAIL table
import decodeQR from 'qr/decode.js';
const bitmap = await createImageBitmap(file); // local File, not fetch
const canvas = document.createElement('canvas');
canvas.width = bitmap.width;
canvas.height = bitmap.height;
const ctx = canvas.getContext('2d');
ctx.drawImage(bitmap, 0, 0);
try {
  return decodeQR(ctx.getImageData(0, 0, bitmap.width, bitmap.height), {
    effort: Infinity,
    timeLimit: Infinity,
  });
} catch {
  // Error.message is 'finder' | 'data' | … — map to English UI string
}
```

Probe round-trip (this session, Node, no jsdom):

| Input | Encoder modules | scale=1 | scale≥2 | 256×256 UI paint |
|-------|-----------------|---------|---------|------------------|
| `Hello world` ECC M | 25 | FAIL finder (qr + jsqr) | OK both | n/a (URL case used) |
| `https://example.com/` ECC M | 29 | FAIL finder | OK both | OK both (`modulePx=7`) |
| `你好世界` ECC M | 25 | FAIL finder | OK both | — |
| `'A'.repeat(200)` ECC M | 53 | OK both | OK both | — |
| noise 64×64 | — | FAIL finder / jsqr null | — | — |

### Isolation unit test (clone Markdown/SQL)

```typescript
// Source: src/lib/markdown.test.ts:121-148 [VERIFIED: src/lib/markdown.test.ts:136-148]
//   expect(mdSource).toContain("from 'marked'");
//   expect(island).not.toMatch(/from ['"]marked['"]/);
//   expect(mdSource).not.toMatch(/from ['"]jsdom['"]/);

expect(qrSource).toContain("from 'qr'");
expect(qrSource).toContain("from 'qr/decode.js'");
expect(qrSource).not.toMatch(/from ['"]qr\/dom\.js['"]/);
expect(island).not.toMatch(/from ['"]qr['"]/);
expect(island).not.toMatch(/from ['"]qr\/decode\.js['"]/);
expect(toolIsland).not.toMatch(/from ['"]qr['"]/);
expect(jsonIsland).not.toMatch(/from ['"]qr['"]/);
expect(qrSource).not.toMatch(/from ['"]jsdom['"]/);
expect(qrSource + island).not.toMatch(/getUserMedia|mediaDevices|rearCamera|selfieCamera/);
```

### Completeness markdown paths

```typescript
// [VERIFIED: src/data/tools.test.ts:46-52]
//   const en = new URL(`../content/tools/${slug}.md`, import.meta.url);
//   const zh = new URL(`../content/tools/zh/${slug}.md`, import.meta.url);
//   expect(existsSync(en), `missing EN markdown for ${slug}`).toBe(true);
```

Schema [VERIFIED: src/content.config.ts:16-29]: `locale: z.enum(['en', 'zh'])`, `howTo: z.tuple([z.string(), z.string(), z.string()])`, `faq` `.min(3).max(5)`.

### CAT-04 verification (post-build)

```bash
npm test
npm test && npm run build
# JsonFormatter island chunk must NOT contain minify-surviving qr identifiers
# QrCode island chunk MAY contain encodeQR / decodeQR / paulmillr
```

Planner: add a verification step that **fails** if `dist/_astro/JsonFormatter*.js` matches any of:

`encodeQR` | `decodeQR` | `Capacity overflow` | `invalid ecc` | `pointsOnDetect` | `paulmillr` | `data:image/gif`

Do **not** treat absence of `from 'qr'` in the minified chunk as sufficient. Do not trust a stale `dist/_astro/`. Always rebuild. If dirty pages break `astro build`, do not rewrite them — isolate the build the same way Phase 3/4/5 verify noted. Source isolation test still lands in `src/lib/qr.test.ts` regardless.

esbuild 0.28.2 probe (project `node_modules/esbuild`, unpacked tarball, `--bundle --format=esm --minify --platform=browser`):

| Entry | Minified bytes | `encodeQR` | `decodeQR` | `paulmillr` | `pointsOnDetect` | `data:image/gif` |
|-------|----------------|------------|------------|-------------|------------------|------------------|
| `encodeQR` + `decodeQR` | 46817 | present | present | present | present | present |
| `encodeQR` only | 13329 | present | absent | present | absent | present |
| `decodeQR` only | 35497 | absent | present | present | present | absent |
| json-only fixture | 190 | absent | absent | absent | absent | absent |

[VERIFIED: esbuild 0.28.2 against unpacked `qr@0.7.0`]

Also surviving in the combined graph (must not appear in JsonFormatter; not all needed in the grep): `invalid ecc`, `invalid border`, `Capacity overflow`, `quartile`, `imageOnResult`, `NV12`, `I420`, `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`.

### Limits append

```typescript
// [VERIFIED: src/lib/limits.ts:1-7] existing:
//   export const INPUT_MAX_CHARS = 100_000;
//   export const INPUT_TOO_LARGE_MSG =
//     'Input too large to process in the browser.';
export const IMAGE_MAX_BYTES = 5_242_880;
export const IMAGE_TOO_LARGE_MSG =
  'Image is too large to process in the browser.';
```

UI-SPEC ZH for image cap: `图片过大，无法在浏览器中处理。`

### EN FAQ skeleton (content collection)

```yaml
# howTo length 3, faq 3–5 [VERIFIED: src/content.config.ts:20-29]
locale: en
title: QR Code
description: Generate a QR from text or decode an image in your browser. Nothing is uploaded.
intro: Type text or a URL to preview a QR. Pick an image file to decode. Everything runs locally. This tool never uses the camera.
howTo:
  - Type text or a URL. The preview updates as you type. Choose error correction if you need it.
  - Download the QR as a PNG. The file is built in your browser.
  - Optional: choose an image file to decode. Copy the payload with Copy.
faq:
  - question: Is my text or image uploaded?
    answer: No. Encoding and decoding run in your browser. Nothing is uploaded.
  - question: Does this tool use the camera?
    answer: No. Decode is from a selected image file only. The tool never requests camera access.
  - question: Can I download SVG?
    answer: Not in this version. Download is PNG only.
```

ZH FAQ must state local/no-upload, selected file, never camera. `faq` length 3–5. `howTo` length 3.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| soldair `qrcode` + separate `jsqr` | paulmillr `qr` encode + `qr/decode.js` | `qr` 0.7.0 (2026-08-31) | One zero-dep graph; file-decode quality spiked this session |
| Webcam `getUserMedia` scanners | File `createImageBitmap` + `ImageData` | Product lock | QR-07; do not import `qr/dom.js` |
| Encoder `data-url` as "image" | Explicit canvas PNG | Always GIF in `qr` 0.7.0 | QR-02 must use canvas |
| 1 px/module rasters | ≥2 px/module (256 canvas) | Documented in `qr` README | scale=1 fails finder |

**Deprecated/outdated:**

- Blind `qr@0.7` lock without round-trip: STATE.md concern; **resolved** by spike (file decode works at ≥2 px/module).
- `jsqr` as default decoder: last 1.4.0 in 2021; extra package; no quality win on generated rasters.
- `qr-scanner` / `@zxing/browser` for this tool: camera-first.
- Using Marked-era jsdom pattern for QR tests: decoder is window-free.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | After a fresh `astro build`, Vite will keep `qr` / `qr/decode.js` out of `JsonFormatter*.js` the same way named `marked` / `diff` imports stayed isolated | CAT-04 | CAT-04 fails; planner adds a dynamic `import()` **inside** `qr.ts` only as a last resort — never from ToolIsland. Confirm with build; do not skip. |
| A2 | `createImageBitmap(File)` in evergreen browsers accepts PNG/JPEG/WebP/GIF from the locked `accept` list without a `type` option | QR-04 | Fallback: `URL.createObjectURL` + `HTMLImageElement.decode()` then draw. Still no `fetch`. |

**If this table listed only verified claims:** A1/A2 still need executor confirmation on the real `astro build` / browser bitmap path.

## Open Questions

1. **Exact generate + decode libraries** — RESOLVED: one package `qr@0.7.0`. `encodeQR` from `'qr'`; `decodeQR` from `'qr/decode.js'`. Do not install `jsqr`.
2. **File-decode quality on generated PNG** — RESOLVED by spike: FAIL at 1 px/module; OK at ≥2 px/module and at UI 256×256. Noise → `finder`.
3. **PNG pixel size / download trigger** — RESOLVED by UI-SPEC: 256×256 including 16 px quiet zone; `canvas.toDataURL('image/png')` + `<a download="qr-code.png">`.
4. **Image byte cap** — RESOLVED by UI-SPEC: `5_242_880`. Also reject `> 4096` sides.
5. **Idle empty preview** — RESOLVED: skip encode; blank `.qr-preview`; no placeholder QR.
6. **One page vs tabs** — RESOLVED by UI-SPEC: two stacked sections, generate first.
7. **EN/ZH chrome keys** — RESOLVED by UI-SPEC table (do not add `emptyHeading`).
8. **CAT-04 grep strings** — RESOLVED: seven minify-surviving IDs listed above.
9. **ECC option names** — RESOLVED: UI L/M/Q/H; library `low|medium|quartile|high`; map in lib.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `qr` `engines` `>= 20.19.0`; Vitest; Astro | ✓ | v22.22.2 | — |
| npm | install `qr@0.7.0` | ✓ | 11.9.0 | — |
| esbuild (transitive via Astro) | CAT-04 identifier probe this session | ✓ | 0.28.2 | — |
| `qr` (npm) | QR-01 encode / QR-04 decode | ✗ not in package.json yet | install 0.7.0 | — |
| `jsdom` (dev) | Existing markdown tests only | ✓ | 30.0.1 | Do not use for QR |
| ctx7 CLI | docs lookup | ✗ | — | Unpacked npm tarball (used) |
| Camera / getUserMedia | — | n/a | — | **Forbidden** |

**Missing dependencies with no fallback:**
- `qr@0.7.0` must be installed in Wave 0 before lib implementation.

**Missing dependencies with fallback:** none that block QR tests (decoder is Node-safe).

Step 2.6: QR adds one npm package and uses existing Node/Vitest. No extra OS service.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^5.0.0` |
| Config file | `vitest.config.ts` (`include: ['src/**/*.test.ts']`, `environment: 'node'`) [VERIFIED: vitest.config.ts:3-8] |
| Quick run command | `npm test` |
| Full suite command | `npm test && npm run build` |

Do **not** set `// @vitest-environment jsdom` on `qr.test.ts` unless a test truly needs a DOM. Matrix + RGBA round-trip runs in Node.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QR-01 | Non-empty text → `{ ok:true, matrix }`; `trim()===''` → `{ ok:false, error:'' }` | unit | `npx vitest run src/lib/qr.test.ts -t idle` | ❌ Wave 0 |
| QR-02 | Island uses `toDataURL('image/png')` and `download="qr-code.png"`; lib does not import data-url for production encode | unit (source-read) | `npx vitest run src/lib/qr.test.ts -t png` | ❌ Wave 0 |
| QR-03 | Default M/`medium`; L/Q/H map; `'M'` is not passed through to encodeQR | unit | `npx vitest run src/lib/qr.test.ts -t ecc` | ❌ Wave 0 |
| QR-04 | Synthetic RGBA of encoded matrix at scale 2 decodes to the same string; noise → not-found | unit | `npx vitest run src/lib/qr.test.ts -t round-trip` | ❌ Wave 0 |
| QR-05 | Island passes decoded string as ToolShell `output`; does not assign data-URL | unit (source-read) | `npx vitest run src/lib/qr.test.ts -t output` | ❌ Wave 0 |
| QR-06 | `IMAGE_MAX_BYTES` exported; island compares `file.size` before bitmap | unit + source-read | `npx vitest run src/lib/limits.test.ts` + qr tests | ❌ Wave 0 (limits append) |
| QR-07 | No `getUserMedia` / `qr/dom.js` / `capture` in lib+island | unit (source-read) | `npx vitest run src/lib/qr.test.ts -t camera` | ❌ Wave 0 |
| CAT-01 | TOOLS length 18, featured 6, slug unique | unit | `npx vitest run src/data/tools.test.ts` | ✅ (update length) |
| CAT-02 | EN+ZH markdown `existsSync(URL)` | unit | `npx vitest run src/data/tools.test.ts` | ✅ (files missing until Wave 0) |
| CAT-03 | `slug === 'qr-code'` in ToolIsland.astro | unit | `npx vitest run src/components/tools/ToolIsland.test.ts` | ✅ (branch missing until Wave 0) |
| CAT-04 | only `qr.ts` imports packages; JsonFormatter chunk clean | unit + build grep | source-read in `qr.test.ts`; `npm run build` then grep identifiers | ❌ Wave 0 |
| CAT-06 | chrome keys EN+ZH; `ZH_ERRORS` maps five strings | unit | `npx vitest run src/i18n/errors.test.ts` | ✅ (append describe) |
| CAT-05 | first ten `relatedSlugs` unchanged | manual in plan diff / do-not-edit | — | — |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test && npm run build`
- **Phase gate:** Full suite green before `/gsd-verify-work`, plus JsonFormatter chunk grep

### Wave 0 Gaps

- [ ] `src/lib/qr.ts` — `encodeQr` / `decodeQr`
- [ ] `src/lib/qr.test.ts` — idle, ECC map, capacity error, scale-2 round-trip, noise, isolation, no camera
- [ ] `src/lib/limits.ts` — `IMAGE_MAX_BYTES` / `IMAGE_TOO_LARGE_MSG`
- [ ] `src/components/tools/QrCode.tsx`
- [ ] `src/content/tools/qr-code.md` + `src/content/tools/zh/qr-code.md`
- [ ] `src/i18n/ui.ts` keys + `src/i18n/errors.ts` five maps
- [ ] Framework package: `npm install qr@0.7.0`

Existing test infrastructure (Vitest + completeness loops) covers CAT-01/02/03 once files/rows exist. New behavior tests are Wave 0.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Static catalog; no accounts |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | No authz |
| V5 Input Validation | yes | `isTooLarge` / `INPUT_MAX_CHARS` `100_000` before encode; `IMAGE_MAX_BYTES` `5_242_880` + `MAX_IMAGE_SIDE` 4096 before decode; English errors only after catch |
| V6 Cryptography | no | CSPRNG already shipped in password-generator; not this phase |

### Known Threat Patterns for in-browser QR generate/decode

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Camera / microphone permission prompt | Information Disclosure | Never import `qr/dom.js`; no `getUserMedia`; no `capture`; FAQ states no camera |
| Upload of selected image to a server | Information Disclosure | No new API routes; no `fetch(file)`; `createImageBitmap(file)` only |
| Remote image URL decode (`https://…` as input) | Information Disclosure / SSRF-in-browser | Decode accepts `File` from `<input type="file">` only; do not `fetch` user-typed URLs as images |
| GIF/HTML polyglot downloaded as PNG | Tampering | `canvas.toDataURL('image/png')` from our painted modules, not encoder GIF data-url |
| Decode hang / memory on huge raster | Denial of Service | Byte cap before read; 4096 side cap before `decodeQR`; `MAX_ARENA_BYTES` 64 MiB inside decoder |
| XSS via decoded payload in DOM | Elevation of Privilege | ToolShell `<pre><code>{output}</code>` text node (HEAD). Never `dangerouslySetInnerHTML` of payload |
| Prototype pollution via options | Tampering | Pass a fresh `{ ecc }` / `{ effort, timeLimit }`; do not spread user JSON into `encodeQR` opts |
| CAT-04 supply-chain surprise on json-formatter | Tampering | Only `qr.ts` imports the package; grep minify-surviving identifiers |
| Fingerprinting via exotic QR segmentation | Information Disclosure | Out of scope (library documents single-segment encoding). Do not add custom segments |
| `innerHTML` of user text | Elevation of Privilege | Forbidden. Preview is canvas pixels, not HTML of the source |

## Sources

### Primary (HIGH confidence)

- Unpacked npm tarball `qr-0.7.0.tgz` — `README.md` (`npm install qr`, `encodeQR` outputs, `ecc` names, file-decode snippet, throws on miss, `effort`/`timeLimit`, webcam vs file, 1 px/module warning, BoofCV quality), `package.json` (version `0.7.0`, engines `>= 20.19.0`, exports, license, zero deps), `index.d.ts` / `index.js` (`ErrorCorrection`, default `'medium'`, border default 2, `invalid ecc`, `Capacity overflow`, `data:image/gif;base64,`), `decode.d.ts` / `decode.js` (`decodeQR`, `FAIL.finder`, `MAX_IMAGE_SIDE = 4096`), `dom.d.ts` (`rearCamera` — do not import)
- Node probe this session: empty encode still 25×25; ECC letter throw; capacity overflow; scale 1 vs ≥2 round-trip; 256×256 UI paint; GIF data-url prefix; noise `finder`
- esbuild 0.28.2 minify identifier probe this session
- In-repo HEAD clone targets and completeness tests (Read this session)
- `gsd_run query package-legitimacy check` this session

### Secondary (MEDIUM confidence)

- Unpacked `jsqr-1.4.0` README — `jsQR(imageData, width, height)`; webcam sample; not installed
- Unpacked `qrcode-1.5.4` README — `errorCorrectionLevel` L/M/Q/H default M; generate-only; not installed
- Unpacked `qr-scanner-1.4.2` README — webcam out of the box; not installed
- Phase 5 `05-RESEARCH.md` — CAT-04 process, clone-target discipline, dirty-tree build break

### Tertiary (LOW confidence)

- Tavily/WebSearch snippets for package discovery — names confirmed via tarball + npm view, not used as API source
- A2 `createImageBitmap` MIME coverage — not re-probed in a real browser this session

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — unpacked tarball + `npm view` + legitimacy seam + engines quote + round-trip spike
- Architecture: HIGH — locked CONTEXT + approved UI-SPEC + in-repo 8-file pattern + Node spike
- Pitfalls: HIGH — probes of empty encode, invalid ecc letters, GIF data-url, scale=1 finder fail, minify-surviving identifiers, MAX_IMAGE_SIDE

**Research date:** 2026-09-14
**Valid until:** 2026-10-14 (30 days; pin exact `qr@0.7.0` in the plan)

## UI-SPEC honor (planner)

Approved `06-UI-SPEC.md`. Copy, layout (stacked generate then decode; split at 720px, controls first), empty preview is blank, 256×256 black-on-white, fonts, HEAD colors, `.qr-preview` chrome, no camera, no SVG, no `aria-live` on preview, `spellcheck={false}`, Copy payload is decoded text, Download PNG is the generate CTA. Do not reopen those decisions.

## Locked return (orchestrator)

| Item | Lock |
|------|------|
| Package | `qr@0.7.0` only (`npm install qr@0.7.0`) |
| Generate API | `import encodeQR from 'qr'` → `encodeQR(text, 'raw', { ecc: 'low'\|'medium'\|'quartile'\|'high' })` → `boolean[][]` |
| Decode API | `import decodeQR from 'qr/decode.js'` → `decodeQR(imageData, { effort: Infinity, timeLimit: Infinity })` → `string` (throws on miss) |
| Do not import | `'qr/dom.js'`, `'jsqr'`, `'qrcode'`, `'jsdom'` from `src/lib` |
| CAT-04 IDs (7) | `encodeQR` \| `decodeQR` \| `Capacity overflow` \| `invalid ecc` \| `pointsOnDetect` \| `paulmillr` \| `data:image/gif` |
| Byte cap | `IMAGE_MAX_BYTES = 5_242_880` plus width/height `> 4096` |
| Round-trip spike | **PASS** at ≥2 px/module and UI 256×256; **FAIL** at 1 px/module (`finder`) |
