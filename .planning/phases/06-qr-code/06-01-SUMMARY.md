---
phase: 06-qr-code
plan: 01
subsystem: tools
tags: [qr-code, qr, encodeQR, decodeQR, preact, astro, vitest]

requires:
  - phase: 05-markdown-preview
    provides: 8-file catalog slice, CAT-04 isolation pattern, TOOLS length 17
provides:
  - "encodeQr wrapping encodeQR from qr plus decodeQr wrapping decodeQR from qr/decode.js"
  - "QrCode island with live generate preview, canvas PNG download, and file decode"
  - "Catalog slug qr-code, Generate, featured false; TOOLS length 18"
  - "EN+ZH markdown, ui.ts chrome, ZH_ERRORS image-cap/not-found/not-an-image/encode-fail, additive .qr-preview CSS"
  - "CAT-04: only src/lib/qr.ts imports qr and qr/decode.js"
affects: [catalog completeness]

actuals:
  tokens: 6581
  tasks: 3
  commits: 3

plan_head_before: f273a1062345d7447894e3c3a856dcddc47ed8d3

tech-stack:
  added: [qr@0.7.0]
  patterns:
    - "Thin src/lib wrap of encodeQR raw plus decodeQR with Infinity effort/timeLimit"
    - "Idle trim empty error before encodeQR; ECC letters mapped to low/medium/quartile/high"
    - "CAT-04 greps minify-surviving identifiers, not from 'qr' in minified chunks"

key-files:
  created:
    - src/lib/qr.ts
    - src/lib/qr.test.ts
    - src/components/tools/QrCode.tsx
    - src/content/tools/qr-code.md
    - src/content/tools/zh/qr-code.md
  modified:
    - package.json
    - package-lock.json
    - src/components/tools/ToolIsland.astro
    - src/data/tools.ts
    - src/data/tools.test.ts
    - src/i18n/ui.ts
    - src/i18n/errors.ts
    - src/i18n/errors.test.ts
    - src/lib/limits.ts
    - src/styles/global.css

key-decisions:
  - "Official qr@0.7.0 only; encodeQR from 'qr' and decodeQR from 'qr/decode.js'; never qr/dom.js"
  - "PNG download is canvas toDataURL image/png plus a download qr-code.png; never encoder data-url GIF"
  - "ToolShell output is decoded text only; visual QR is children .qr-preview"
  - "IMAGE_MAX_BYTES 5242880 on file.size plus width/height > 4096; keep existing text-cap map"

patterns-established:
  - "Idle trim returns ok false empty error before encodeQR because empty text still encodes a v1 QR"
  - "Map UI L/M/Q/H to library low/medium/quartile/high inside qr.ts only"
  - "Never import qr packages from the island, ToolIsland, json.ts, or JsonFormatter"

requirements-completed: [QR-01, QR-02, QR-03, QR-04, QR-05, QR-06, QR-07]

coverage:
  - id: D1
    description: "Visitor types text or a URL and sees a live black-on-white QR preview; idle text leaves .qr-preview blank with Download PNG disabled"
    requirement: QR-01
    verification:
      - kind: unit
        ref: src/lib/qr.test.ts#returns empty error for empty and whitespace input
        status: pass
      - kind: unit
        ref: src/lib/qr.test.ts#returns a matrix for hello
        status: pass
    human_judgment: true
    rationale: "Live preview layout, blank idle surface, and no Generate button are visual"
  - id: D2
    description: "Download PNG uses canvas toDataURL image/png and filename qr-code.png, never encoder GIF data-url"
    requirement: QR-02
    verification:
      - kind: unit
        ref: src/lib/qr.test.ts#source-reads PNG download, decoded output, size guards, and lib imports
        status: pass
    human_judgment: true
    rationale: "Downloaded file bytes and scannability are browser-only"
  - id: D3
    description: "ECC L/M/Q/H default M maps to library low/medium/quartile/high; UI letters are not passed as opts.ecc"
    requirement: QR-03
    verification:
      - kind: unit
        ref: src/lib/qr.test.ts#defaults ecc to M mapped to medium
        status: pass
      - kind: unit
        ref: src/lib/qr.test.ts#maps UI letters in qr.ts and does not pass letter M as opts.ecc
        status: pass
    human_judgment: false
  - id: D4
    description: "Selecting a local image file decodes the payload in the browser; scale-2 synthetic raster round-trips; noise is not-found"
    requirement: QR-04
    verification:
      - kind: unit
        ref: src/lib/qr.test.ts#round-trips a scale-2 synthetic raster of an encoded matrix
        status: pass
      - kind: unit
        ref: src/lib/qr.test.ts#returns QR_NOT_FOUND_MSG for 64 by 64 noise
        status: pass
    human_judgment: true
    rationale: "File picker and createImageBitmap path are browser-only"
  - id: D5
    description: "ToolShell Copy payload is the decoded string; generate never writes a data-URL into output"
    requirement: QR-05
    verification:
      - kind: unit
        ref: src/lib/qr.test.ts#source-reads PNG download, decoded output, size guards, and lib imports
        status: pass
    human_judgment: true
    rationale: "Clipboard write is browser-only"
  - id: D6
    description: "Oversize image files are rejected with IMAGE_TOO_LARGE_MSG on file.size before bitmap; width or height over 4096 uses the same string"
    requirement: QR-06
    verification:
      - kind: unit
        ref: src/lib/qr.test.ts#source-reads PNG download, decoded output, size guards, and lib imports
        status: pass
      - kind: unit
        ref: src/i18n/errors.test.ts#maps image-cap, not-found, not-an-image, encode-fail, and text-cap in ZH_ERRORS
        status: pass
    human_judgment: false
  - id: D7
    description: "The tool never requests camera or getUserMedia; qr/dom.js is not imported"
    requirement: QR-07
    verification:
      - kind: unit
        ref: src/lib/qr.test.ts#forbids camera APIs in lib and island
        status: pass
    human_judgment: false
  - id: D8
    description: "Catalog slug qr-code, Generate, featured false; TOOLS length 18; featured stays 6"
    verification:
      - kind: unit
        ref: src/data/tools.test.ts#has exactly 18 tools
        status: pass
      - kind: unit
        ref: src/data/tools.test.ts#features exactly six tools including json-formatter and jwt-decoder
        status: pass
    human_judgment: false
  - id: D9
    description: "Only src/lib/qr.ts imports qr and qr/decode.js; JsonFormatter chunk has none of the seven minify-surviving identifiers"
    verification:
      - kind: unit
        ref: src/lib/qr.test.ts#imports qr and qr/decode.js only from qr.ts
        status: pass
      - kind: other
        ref: npm run build && node CAT-04 JsonFormatter identifier grep
        status: pass
    human_judgment: false

duration: 33min
completed: 2026-09-14
status: complete
---

# Phase 6 Plan 01: QR Code Summary

**In-browser qr-code generate plus file-decode via qr@0.7.0, canvas PNG download, catalog 18**

## Performance

- **Duration:** 33 min
- **Started:** 2026-09-14T09:37:10Z
- **Completed:** 2026-09-14T10:09:50Z
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments

- Thin `src/lib/qr.ts` wraps default `encodeQR` from `qr` and `decodeQR` from `qr/decode.js`; idle trim before encode; ECC letters mapped to `low|medium|quartile|high`; never `qr/dom.js`
- `QrCode` island: stacked generate then decode, live `useMemo`, `.qr-preview` canvas 256×256 black-on-white, Download PNG via `canvas.toDataURL('image/png')`, file decode via `decodeQr`; ToolShell copy payload is decoded text
- Catalog slug `qr-code` / Generate / `featured: false`; TOOLS 17 → 18; featured stays 6; EN+ZH markdown FAQ states local / nothing uploaded / selected image file / never camera
- CAT-04 green after fresh `astro build`: JsonFormatter chunk `JsonFormatter.wS29ZjPR.js` has none of `encodeQR`, `decodeQR`, `Capacity overflow`, `invalid ecc`, `pointsOnDetect`, `paulmillr`, `data:image/gif`

## Task Commits

Each task was committed atomically:

1. **Task 1:** `b1d3c52` (feat) ship qr-code encode plus decode vertical slice
2. **Task 2:** `0c3c027` (test) lock ECC map, scale-2 round-trip, camera-forbid, and FAQ
3. **Task 3:** `44b4ca7` (test) prove CAT-04 qr package isolation from json-formatter

**Plan metadata:** pending docs(06-01) SUMMARY commit

## Files Created/Modified

- `src/lib/qr.ts` - `encodeQr` + `decodeQr`; idle trim; ECC map; never throw
- `src/lib/qr.test.ts` - idle, hello, ECC, capacity, scale-2 round-trip, noise, camera-forbid, PNG/output source-read, FAQ, CAT-04 isolation
- `src/lib/limits.ts` - append `IMAGE_MAX_BYTES` 5242880 and `IMAGE_TOO_LARGE_MSG`
- `src/components/tools/QrCode.tsx` - default-export island; live generate; canvas PNG; file decode
- `src/components/tools/ToolIsland.astro` - static QrCode import and `slug === 'qr-code'` with `locale={locale}`
- `src/data/tools.ts` - append-only `qr-code` row
- `src/data/tools.test.ts` - `toHaveLength(18)`
- `src/i18n/ui.ts` - EN/ZH `tools['qr-code']` UI-SPEC keys
- `src/i18n/errors.ts` - ZH_ERRORS maps for image-cap, not-found, not-an-image, encode-fail
- `src/i18n/errors.test.ts` - qr-code chrome-key describe plus five English error ZH maps
- `src/content/tools/qr-code.md` - EN SEO/how-to/FAQ
- `src/content/tools/zh/qr-code.md` - ZH SEO/how-to/FAQ
- `src/styles/global.css` - additive `.qr-preview` pane chrome
- `package.json` / `package-lock.json` - `qr@0.7.0`

## Decisions Made

- Official `qr@0.7.0` only; no jsqr, qrcode, qr-scanner, @zxing, canvas, or extra jsdom
- PNG is island canvas, not encoder `data-url` (GIF)
- Clone HEAD WordCounter locale/`t()`, HEAD SqlFormatter native select, HEAD PasswordGenerator button, HEAD ToolShell with no locale prop
- Map image-cap, not-found, not-an-image, and encode-fail in `ZH_ERRORS`; keep existing text-cap
- Catalog relatedSlugs `uuid-generator`, `password-generator`, `hash-generator`; first ten relatedSlugs untouched

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] YAML howTo `Optional:` parsed as a mapping**
- **Found during:** Task 3 (`npm run build`)
- **Issue:** Unquoted `Optional: choose an image file...` made `howTo.2` an object; Astro content schema expects three strings
- **Fix:** Quote the EN (and matching ZH) howTo line so the schema stays a 3-tuple of strings
- **Files modified:** `src/content/tools/qr-code.md`, `src/content/tools/zh/qr-code.md`
- **Verification:** Fresh `npm run build` succeeded; CAT-04 grep clean
- **Committed in:** `44b4ca7` (Task 3)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required so the content collection builds. No architecture change.

## Issues Encountered

None. Fresh `npm run build` succeeded on the clean worktree without dirty-page isolation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 6 plan 01 complete; catalog completeness is 18 / featured 6
- Ready for phase verify-work (human visual of generate/decode layout, blank idle preview, PNG download, file decode Copy, ZH image-cap, no camera)
- Do not rewrite existing ten tools
- Do not phase.complete from this executor (`--no-transition`)
- Do not merge — orchestrator will ff-merge

---
*Phase: 06-qr-code*
*Completed: 2026-09-14*

## Self-Check: PASSED
