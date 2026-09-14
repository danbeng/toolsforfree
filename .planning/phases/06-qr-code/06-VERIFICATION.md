---
phase: 06-qr-code
verified: 2026-09-14T10:33:26Z
status: passed
score: 7/7 must-haves verified
covered_files:

  - .planning/REQUIREMENTS.md
  - .planning/phases/06-qr-code/06-01-PLAN.md
  - .planning/phases/06-qr-code/06-01-SUMMARY.md
  - package-lock.json
  - package.json
  - src/components/tools/QrCode.tsx
  - src/components/tools/ToolIsland.astro
  - src/content/tools/qr-code.md
  - src/content/tools/zh/qr-code.md
  - src/data/tools.test.ts
  - src/data/tools.ts
  - src/i18n/errors.test.ts
  - src/i18n/errors.ts
  - src/i18n/ui.ts
  - src/lib/limits.ts
  - src/lib/qr.test.ts
  - src/lib/qr.ts
  - src/styles/global.css

covered_digest: "v1:sha256:847b34821759cec9455e328542ad65ce8c747276e730ef2a307465e76276c9be"
behavior_unverified: 0
overrides_applied: 0
decision_coverage:
  honored: 0
  total: 0
  not_honored: []
  reason: no trackable decisions
human_verification:

  - test: "Open /tools/qr-code/ (and /zh/tools/qr-code/ if that tree is being served): Generate section above Decode; text/ECC left or top and 256 by 256 preview right or bottom; type a URL and see live black-on-white modules with no Generate button; clear text: blank .qr-preview, Download disabled, no sample QR; Download is qr-code.png not GIF; select a generated PNG and Copy writes the decoded string; oversize image shows 图片过大，无法在浏览器中处理。 on ZH or the English image-cap string on EN; no camera prompt; homepage featured count still six."
    expected: "Stacked generate then decode; live black-on-white QR; idle preview blank with Download disabled; PNG download named qr-code.png; Copy payload is decoded text; image-cap error distinct from text-cap; no camera; featured stays six."
    why_human: "PLAN deferred this to end-of-phase human-check. No Playwright/tsx island tests. Grep cannot see clipboard contents, downloaded PNG bytes, 720px split, live typing, camera permission prompt, or ZH chrome in a real browser."
---

# Phase 6: QR generate and decode Verification Report

**Phase Goal:** Visitors can generate a downloadable QR from text or a URL and decode a selected image file entirely in the browser, without camera access
**Verified:** 2026-09-14T10:33:26Z
**Status:** human_needed
**Re-verification:** No — initial verification

**MVP note:** ROADMAP.md `mode: mvp`, but the ROADMAP phase goal is not a standard User Story (`user-story.validate` → false). Verification was not aborted: User Flow uses the PLAN goal (`valid: true`, role=visitor using Devtoolbox). Same handling as Phase 3/4/5.

## User Flow Coverage

User story: As a visitor using Devtoolbox, I want to generate a downloadable QR from text or a URL and decode a selected image file in the browser, so that I can encode and read QR payloads without uploading anything or granting camera access.

| Step | Expected | Evidence | Status |
|------|----------|----------|--------|
| Open EN/ZH page | `/tools/qr-code/` and `/zh/tools/qr-code/` SSG from `TOOLS`; island gets `locale={locale}` | `src/pages/tools/[slug].astro` / `src/pages/zh/tools/[slug].astro` `getStaticPaths` from `TOOLS`; `ToolIsland.astro` `slug === 'qr-code'` + `client:load locale={locale}` | ✓ |
| Type text or URL | Live black-on-white QR; ECC L/M/Q/H default M; no Generate button | `QrCode.tsx` textarea `onInput` → `useMemo` → `encodeQr`; native select default `'M'`; canvas 256×256 `#000` on `#fff`; `.qr-preview` children | ✓ |
| Download PNG | `canvas.toDataURL('image/png')` + `download="qr-code.png"`; never encoder GIF data-url | `onDownload` in `QrCode.tsx`; named source-read test passed | ✓ |
| Idle | Empty/whitespace text leaves `.qr-preview` blank; Download disabled; no sample QR | `encodeQr` returns `{ ok: false, error: '' }` before `encodeQR`; island renders no canvas when `!generate.matrix`; button `disabled={!generate.matrix}` | ✓ |
| Decode file + copy | Local `<input type="file">` → `createImageBitmap` → `decodeQr`; ToolShell `output` is decoded string | `onFile` in `QrCode.tsx`; `output={payload}`; HEAD ToolShell `writeText(props.output)`; scale-2 round-trip test passed | ✓ |
| Caps / no camera | Byte cap on `file.size` before bitmap; 4096 side cap; no `getUserMedia` | `IMAGE_MAX_BYTES` 5242880; width/height `> 4096`; no `capture` / `qr/dom.js`; camera-forbid test passed | ✓ |
| Outcome | Encode and read QR payloads without uploading or granting camera access | Browser-local `qr@0.7.0`; EN+ZH FAQ lock; catalog `qr-code` | ✓ |

Outcome clause is observably true in the codebase. Browser walkthrough still needs a human (see Human Verification).

## Goal Achievement

### Observable Truths

| #   | Truth   | Status     | Evidence       |
| --- | ------- | ---------- | -------------- |
| 1   | Visitor can open `/tools/qr-code/` (and `/zh/tools/qr-code/` when that tree exists), type text or a URL, see a live black-on-white QR preview, choose ECC L/M/Q/H default M, and download PNG (QR-01, QR-02, QR-03 / ROADMAP SC1) | ✓ VERIFIED | Island: default export, `locale`/`t()` from HEAD WordCounter (not `useToolUi`), live `useMemo`, native select cloned from HEAD SqlFormatter, `button type="button"` cloned from HEAD PasswordGenerator, HEAD ToolShell with no locale prop. `encodeQr('hello')` live `{ ok: true, matrix 25×25 }`. Default M equals explicit `'M'`. Named tests idle/hello/ECC/L-vs-H/PNG source-read passed. Pages SSG all `TOOLS` slugs; ToolIsland `slug === 'qr-code'` + `locale={locale}`. PNG is `canvas.toDataURL('image/png')` + `a.download = 'qr-code.png'`. |
| 2   | Empty or whitespace-only generate text leaves `.qr-preview` blank with Download PNG disabled; no sample QR (QR-01 idle) | ✓ VERIFIED | `src/lib/qr.ts`: `if (!input.trim()) return { ok: false, error: '' }` **before** `encodeQR`. Live: `encodeQr('')` and `encodeQr('   ')` equal `{ ok: false, error: '' }`. Island: `{generate.matrix ? <canvas> : null}`; Download `disabled={!generate.matrix}`. Named idle test passed. |
| 3   | Visitor can select a local image file, decode the payload in the browser, and copy that string via ToolShell; generate never writes pixels or a data-URL into output (QR-04, QR-05 / ROADMAP SC2) | ✓ VERIFIED | File input `accept="image/png,image/jpeg,image/webp,image/gif"`, no `capture`. `createImageBitmap(file)` then `getImageData` then `decodeQr`. `ToolShell output={payload}` (decoded string only). Named scale-2 round-trip passed (`https://example.com/` raster → same payload). Noise 64×64 → `QR_NOT_FOUND_MSG`. Source-read asserts `output={payload}` and no `from 'qr'`. No `fetch` of the file. |
| 4   | Oversize image files are rejected with `IMAGE_TOO_LARGE_MSG` on `file.size` before bitmap, distinct from the text char cap; width or height over 4096 uses the same image-cap string (QR-06 / ROADMAP SC3 cap) | ✓ VERIFIED | `IMAGE_MAX_BYTES = 5_242_880`; `IMAGE_TOO_LARGE_MSG` distinct from `INPUT_TOO_LARGE_MSG`. Island: `if (file.size > IMAGE_MAX_BYTES)` localizes image-cap and `return`s before `createImageBitmap`. After bitmap: `width > 4096 \|\| height > 4096` same string, `decodeQr` not called. Text cap remains `isTooLarge(input)` before encode. Named source-read + ZH_ERRORS image-cap test passed. |
| 5   | The tool never requests camera or getUserMedia; no `qr/dom.js`, capture, or video (QR-07 / ROADMAP SC3 camera) | ✓ VERIFIED | Named test `forbids camera APIs in lib and island` passed. `qr.ts` imports `from 'qr'` and `from 'qr/decode.js'` only; no `from 'qr/dom.js'`. Island has no `getUserMedia`, `mediaDevices`, `rearCamera`, `selfieCamera`, `capture`, or `<video>`. FAQ EN/ZH lock never-camera. |
| 6   | Catalog slug `qr-code`, category Generate, featured false; TOOLS `toHaveLength` 18; `getFeaturedTools` stays 6; relatedSlugs `uuid-generator`, `password-generator`, `hash-generator`; existing ten relatedSlugs unchanged (CAT-01, CAT-05 / ROADMAP SC4 catalog) | ✓ VERIFIED | Append-only 18th row. Named tests `has exactly 18 tools` and `features exactly six tools including json-formatter and jwt-decoder` passed. Featured slugs unchanged. First ten `relatedSlugs` match `ea11dbc` (Phase 3). Completeness `existsSync(URL)` (not `.pathname`) covers EN+ZH. No `src/lib/index.ts` barrel. ui.ts keys match UI-SPEC verbatim. |
| 7   | After astro build, `dist/_astro/JsonFormatter*.js` does not contain the seven minify-surviving qr identifiers; only `src/lib/qr.ts` imports `qr` and `qr/decode.js` (CAT-04 / ROADMAP SC4 isolation) | ✓ VERIFIED | Isolation test `imports qr and qr/decode.js only from qr.ts` passed: only `src/lib/qr.ts` has `from 'qr'` and `from 'qr/decode.js'`; QrCode / ToolIsland / json.ts / JsonFormatter do not; `qr.ts` does not import `qr/dom.js` or jsdom. Dirty-main `npm run build` is the Phase 3/4/5 dirty-tree pattern (`src/pages/404.astro` missing `../i18n/path`) — not a qr-code product fail. CAT-04 taken from executor worktree dist: `G:/海外练手项目/.claude/worktrees/agent-aa1522170ac6e8d38/dist/_astro/JsonFormatter.wS29ZjPR.js` (649 bytes) CLEAN for `encodeQR`, `decodeQR`, `Capacity overflow`, `invalid ecc`, `pointsOnDetect`, `paulmillr`, `data:image/gif`. `QrCode.CCHRi2yZ.js` exists (48984 bytes) and contains `Capacity overflow`, `invalid ecc`, `pointsOnDetect`, `data:image/gif` (expected — separate chunk). `qr@0.7.0` direct dep; no jsqr, qrcode, qr-scanner, @zxing, canvas package, extra jsdom. |

**Score:** 7/7 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected    | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/lib/qr.ts` | `encodeQr` plus `decodeQr`; thin wrap of `encodeQR` from `qr` and `decodeQR` from `qr/decode.js`; idle trim empty error before encode; ECC letter map; never `qr/dom.js` | ✓ VERIFIED | Exists, substantive, imported by island. Idle before `encodeQR`. `ECC_TO_QR` L/M/Q/H → low/medium/quartile/high. Catch → English fail strings. Never throws. |
| `src/lib/qr.test.ts` | Node env; idle, ECC map, capacity, scale-2 round-trip, noise, isolation, camera-forbid, PNG/output source-read, FAQ lock | ✓ VERIFIED | No jsdom pragma. 12 `it`s, no skip. Source-read uses `new URL(..., import.meta.url)` (never `.pathname`). |
| `src/lib/limits.ts` | `IMAGE_MAX_BYTES` 5242880 and `IMAGE_TOO_LARGE_MSG` appended; existing `isTooLarge` unchanged | ✓ VERIFIED | Appended after existing text-cap helpers. `isTooLarge` / `INPUT_MAX_CHARS` 100000 unchanged. |
| `src/components/tools/QrCode.tsx` | Default-export island; stacked generate then decode; split generate controls then `.qr-preview`; canvas PNG download; file decode; ToolShell output is decoded string | ✓ VERIFIED | Imports `encodeQr`/`decodeQr` from `../../lib/qr`, not the npm packages. `class` not `className`. Clones HEAD WordCounter locale/`t()`, HEAD SqlFormatter native select, HEAD PasswordGenerator button, HEAD ToolShell (no locale prop). Does not import `useToolUi`. |
| `src/components/tools/ToolIsland.astro` | static QrCode import and `slug === 'qr-code'` `client:load locale={locale}` | ✓ VERIFIED | Import line 19; branch line 41. Existing branches kept. Completeness loop covers all 18 slugs. |
| `src/data/tools.ts` | `qr-code` catalog row featured false category Generate | ✓ VERIFIED | Append-only 18th object. relatedSlugs order matches PLAN. |
| `src/data/tools.test.ts` | `toHaveLength(18)`; featured still 6 | ✓ VERIFIED | Snapshot bumped; featured assertion unchanged. Named catalog tests passed. |
| `src/i18n/ui.ts` | en and zh `tools['qr-code']` UI-SPEC chrome keys only | ✓ VERIFIED | Keys name, shortDescription, generateSection, decodeSection, text, ecc, preview, downloadPng, image; EN/ZH strings match UI-SPEC table. Phase 2/3/4/5 keys retained. No emptyHeading/emptyBody on this slug. |
| `src/i18n/errors.ts` | ZH_ERRORS maps for image-cap, not-found, not-an-image, encode-fail; keep existing text-cap | ✓ VERIFIED | Four new maps plus retained `INPUT_TOO_LARGE_MSG`. Existing Phase 2/3 keys retained. |
| `src/i18n/errors.test.ts` | qr-code chrome-key describe plus five English error ZH maps | ✓ VERIFIED | Named chrome-key and image-cap/not-found/not-an-image/encode-fail/text-cap tests passed. Phase 2/3/4/5 describes kept. |
| `src/content/tools/qr-code.md` | locale en SEO howTo 3 faq 3–5 including local / nothing uploaded / selected image file / never camera | ✓ VERIFIED | howTo 3; faq 3; browser / nothing is uploaded / selected image file / never camera. |
| `src/content/tools/zh/qr-code.md` | locale zh; local / 不会上传 / selected file / never camera | ✓ VERIFIED | howTo 3; faq 3; 不会上传; 本地图片文件; 从不请求摄像头权限. |
| `src/styles/global.css` | additive `.qr-preview` pane chrome only | ✓ VERIFIED | HEAD already contains `.qr-preview` (`width: min(256px, 100%)`; `aspect-ratio: 1`; `height: auto`; `background: var(--bg)`; `border: 1px solid var(--border)`; `border-radius: 6px`). Working copy still has the same block (line 655 under dirty visual overlay). No `:root` retokenize in the committed `.qr-preview` rules. |
| `package.json` | direct dependency `qr` 0.7.0 only; no jsqr, qrcode, qr-scanner, @zxing, canvas, extra jsdom | ✓ VERIFIED | `"qr": "^0.7.0"` in dependencies. Lock + `node_modules/qr` version 0.7.0. `jsdom@30.0.1` remains the existing markdown-test devDependency only. |

`gsd_run query verify.artifacts`: 14/14 passed.

### Key Link Verification

| From | To  | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `QrCode.tsx` | `src/lib/qr.ts` | `encodeQr` after `isTooLarge` and idle skip; `decodeQr` after byte cap, bitmap, and 4096 side cap | ✓ WIRED | Guard then `encodeQr(input, ecc)`; file path `decodeQr(imageData)` |
| `src/lib/qr.ts` | qr | default `encodeQR` from package root only in this file | ✓ WIRED | `import encodeQR from 'qr'`; `encodeQR(text, 'raw', { ecc: ECC_TO_QR[ecc] })` |
| `src/lib/qr.ts` | qr/decode.js | default `decodeQR` only in this file; never `qr/dom.js` | ✓ WIRED | `import decodeQR from 'qr/decode.js'`; `{ effort: Infinity, timeLimit: Infinity }` |
| `QrCode.tsx` | `src/lib/limits.ts` | `isTooLarge` on generate text; `IMAGE_MAX_BYTES` on `file.size` | ✓ WIRED | Size path skips encode; image cap returns before bitmap |
| `ToolIsland.astro` | `QrCode.tsx` | static import + `slug === 'qr-code'` `client:load` | ✓ WIRED | Import line 19; branch line 41 |
| `tools.test.ts` | `tools.ts` | `expect(TOOLS).toHaveLength(18)` | ✓ WIRED | Snapshot 18 |
| `QrCode.tsx` | `ToolShell.tsx` | error plus decoded-string copy payload; visual QR is children `.qr-preview` | ✓ WIRED | `<ToolShell error={decodeError ?? generate.error} output={payload}>` wraps generate/decode sections |

`gsd_run query verify.key-links`: 7/7 verified.

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `QrCode.tsx` | `generate.matrix` | `encodeQr` → `encodeQR(..., 'raw')` | Yes — live `encodeQr('hello')` returns a 25×25 boolean matrix, not a static fixture | ✓ FLOWING |
| `QrCode.tsx` | canvas pixels | `paintQr` from `generate.matrix` | Yes — modules `#000000` on `#ffffff` with 16px quiet zone | ✓ FLOWING |
| `QrCode.tsx` | PNG download | `canvas.toDataURL('image/png')` | Yes — painted canvas, not encoder `data-url` GIF | ✓ FLOWING |
| `QrCode.tsx` | `payload` / ToolShell `output` | `decodeQr` → `decodeQR` | Yes — scale-2 synthetic raster round-trips to the same string | ✓ FLOWING |
| `QrCode.tsx` | `generate.error` / `decodeError` | `isTooLarge` / `IMAGE_TOO_LARGE_MSG` / lib fail strings via `localizeError` | Yes — idle error is `null`; image-cap is distinct from text-cap | ✓ FLOWING |
| `QrCode.tsx` | `input` | textarea `onInput` | User input; no static fallback / sample QR | ✓ FLOWING |

No API, no DB, no hollow props. Computation stays in the browser.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Named idle | `npx vitest run src/lib/qr.test.ts -t "returns empty error for empty and whitespace input"` | 1 passed / 11 skipped | ✓ PASS |
| Named hello | `npx vitest run src/lib/qr.test.ts -t "returns a matrix for hello"` | 1 passed / 11 skipped | ✓ PASS |
| Named ECC default | `npx vitest run src/lib/qr.test.ts -t "defaults ecc to M mapped to medium"` | 1 passed / 11 skipped | ✓ PASS |
| Named ECC map source | `npx vitest run src/lib/qr.test.ts -t "maps UI letters in qr.ts and does not pass letter M as opts.ecc"` | 1 passed / 11 skipped | ✓ PASS |
| Named L vs H | `npx vitest run src/lib/qr.test.ts -t "maps L versus H to different matrices"` | 1 passed / 11 skipped | ✓ PASS |
| Named capacity | `npx vitest run src/lib/qr.test.ts -t "returns QR_ENCODE_FAIL_MSG for capacity overflow at H"` | 1 passed / 11 skipped | ✓ PASS |
| Named round-trip | `npx vitest run src/lib/qr.test.ts -t "round-trips a scale-2 synthetic raster of an encoded matrix"` | 1 passed / 11 skipped | ✓ PASS |
| Named noise | `npx vitest run src/lib/qr.test.ts -t "returns QR_NOT_FOUND_MSG for 64 by 64 noise"` | 1 passed / 11 skipped | ✓ PASS |
| Named PNG/output source-read | `npx vitest run src/lib/qr.test.ts -t "source-reads PNG download, decoded output, size guards, and lib imports"` | 1 passed / 11 skipped | ✓ PASS |
| Named camera-forbid | `npx vitest run src/lib/qr.test.ts -t "forbids camera APIs in lib and island"` | 1 passed / 11 skipped | ✓ PASS |
| Named isolation | `npx vitest run src/lib/qr.test.ts -t "imports qr and qr/decode.js only from qr.ts"` | 1 passed / 11 skipped | ✓ PASS |
| Named FAQ | `npx vitest run src/lib/qr.test.ts -t "locks EN and ZH local-only and never-camera wording"` | 1 passed / 11 skipped | ✓ PASS |
| Named catalog 18 | `npx vitest run src/data/tools.test.ts -t "has exactly 18 tools"` | 1 passed / 6 skipped | ✓ PASS |
| Named featured 6 | `npx vitest run src/data/tools.test.ts -t "features exactly six tools including json-formatter and jwt-decoder"` | 1 passed / 6 skipped | ✓ PASS |
| Named completeness markdown | `npx vitest run src/data/tools.test.ts -t "has EN and ZH markdown for every catalog slug"` | 1 passed / 6 skipped | ✓ PASS |
| Named ToolIsland branches | `npx vitest run src/components/tools/ToolIsland.test.ts` | 1 passed | ✓ PASS |
| Named chrome keys | `npx vitest run src/i18n/errors.test.ts -t "shares qr-code chrome keys"` | 1 passed / 10 skipped | ✓ PASS |
| Named ZH maps | `npx vitest run src/i18n/errors.test.ts -t "maps image-cap, not-found, not-an-image, encode-fail, and text-cap in ZH_ERRORS"` | 1 passed / 10 skipped | ✓ PASS |
| Live `encodeQr` | `node --input-type=module` import `./src/lib/qr.ts` | idle empty error; hello 25×25; M default equals `'M'`; 3000 A's at H → `Cannot encode this text as a QR code.` | ✓ PASS |
| CAT-04 worktree dist | grep seven identifiers in `JsonFormatter.wS29ZjPR.js` | CLEAN; QrCode chunk present with surviving qr strings | ✓ PASS |
| Dirty-main `astro build` | (not re-run; no `dist/_astro` on main) | Fails on dirty `src/pages/404.astro` missing `../i18n/path` — same Phase 3/4/5 dirty-tree pattern; not a qr-code fail | ? SKIP |

Orchestrator already ran `npm test` on main after merge: 23 files / 155 tests passed. This pass did not re-run the full suite.

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No `scripts/*/tests/probe-*.sh`; PLAN does not declare probes | SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| QR-01 | 06-01-PLAN.md | Enter text or a URL and see a QR preview | ✓ SATISFIED | Live `useMemo` island + named hello/idle tests + live encode |
| QR-02 | 06-01-PLAN.md | Download the QR as PNG | ✓ SATISFIED | `toDataURL('image/png')` + `download = 'qr-code.png'`; named source-read |
| QR-03 | 06-01-PLAN.md | ECC L / M / Q / H default M | ✓ SATISFIED | `ECC_TO_QR` in lib; named default-M and letter-not-passed tests |
| QR-04 | 06-01-PLAN.md | Select an image file and decode in the browser | ✓ SATISFIED | File input + `createImageBitmap` + named scale-2 round-trip |
| QR-05 | 06-01-PLAN.md | Copy the decoded payload | ✓ SATISFIED | ToolShell `output={payload}`; HEAD clipboard `writeText` |
| QR-06 | 06-01-PLAN.md | Oversize image files rejected with a byte-cap error | ✓ SATISFIED | `IMAGE_MAX_BYTES` on `file.size` before bitmap; 4096 side cap |
| QR-07 | 06-01-PLAN.md | Never request camera / `getUserMedia` | ✓ SATISFIED | No `qr/dom.js`; named camera-forbid test; FAQ lock |
| CAT-01 | 06-01-PLAN.md (slice) | TOOLS unique slug, category, relatedSlugs, featured false | ✓ SATISFIED | 18th row Generate / featured false |
| CAT-02 | 06-01-PLAN.md (slice) | EN+ZH markdown | ✓ SATISFIED | both files; completeness loop |
| CAT-03 | 06-01-PLAN.md (slice) | ToolIsland branch per slug | ✓ SATISFIED | `slug === 'qr-code'`; completeness test |
| CAT-04 | 06-01-PLAN.md (slice) | qr packages only on this tool page | ✓ SATISFIED | source isolation + worktree JsonFormatter chunk CLEAN |
| CAT-05 | 06-01-PLAN.md (slice) | Existing ten relatedSlugs unchanged | ✓ SATISFIED | match Phase 3 commit `ea11dbc` first ten |
| CAT-06 | 06-01-PLAN.md (slice) | live compute, copy, size guard, EN+ZH chrome, ZH_ERRORS | ✓ SATISFIED | useMemo island + ToolShell + ui.ts + five ZH maps |

REQUIREMENTS.md IDs mapped to Phase 6: QR-01..QR-07. All claimed by PLAN `requirements:`. No orphaned Phase 6 requirements.

v2 QR-08 (SVG download) is explicitly deferred; not a gap.

### Decision Coverage

No trackable decisions in CONTEXT.md (`check.decision-coverage-verify`: skipped, `total: 0`). CONTEXT `<decisions>` exist as prose (live preview, ECC L/M/Q/H, PNG download, file-decode, no camera, catalog additive, CAT-04) and are honored in the shipped slice; the gate did not parse them as trackable entries. Non-blocking.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `src/lib/qr.test.ts` | QR-01..07, CAT-04, CAT-06 | 12 | 0 | 0 | Value (idle union, matrix, round-trip payload, capacity) + source-read (PNG, isolation, camera, FAQ) | OK |
| `src/data/tools.test.ts` | CAT-01, CAT-02, CAT-05 | 7 | 0 | 0 | Value (`toHaveLength(18)`, featured 6, existsSync(URL)) | OK |
| `src/i18n/errors.test.ts` | CAT-06 chrome keys / ZH maps | 2 (qr-code describe) | 0 | 0 | Property presence + ZH_ERRORS value | OK |
| `src/components/tools/ToolIsland.test.ts` | CAT-03 | 1 | 0 | 0 | Source includes `slug === '${slug}'` | OK |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** 0 blockers. Note (non-blocking): QR-02 PNG bytes and QR-05 clipboard write are source-read / HEAD ToolShell, as the PLAN specified; island `file.size` / 4096 guards are source-read rather than a jsdom File mock.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | No TBD/FIXME/XXX in phase files | — | — |
| `src/lib/qr.ts` | catch | empty catch → English fail string | Info | Matches project parser contract; never throws to UI |
| Dirty `ToolShell.tsx` / pages | (not this phase) | worktree ToolShell may require `locale`; 404/index import missing `../i18n/path` | Info | Pre-existing dirty tree. Island clones HEAD ToolShell (no locale prop). Do not treat as qr-code fail. |
| Dirty `src/styles/global.css` | (not this phase) | uncommitted visual overlay; `.qr-preview` still present | Info | HEAD already has `.qr-preview`; WC still has the same block. Constraint: do not fail the phase for dirty CSS. |

No unresolved debt markers. No stubs (`return null`, empty handlers, encoder GIF data-url as PNG). No `src/lib/index.ts` barrel.

### Human Verification Required

### 1. QR generate / decode walkthrough

**Test:** Open `/tools/qr-code/` (and `/zh/tools/qr-code/` if that tree is being served): Generate section above Decode; text/ECC left or top and 256 by 256 preview right or bottom; type a URL and see live black-on-white modules with no Generate button; clear text: blank `.qr-preview`, Download disabled, no sample QR; Download is `qr-code.png` not GIF; select a generated PNG and Copy writes the decoded string; oversize image shows `图片过大，无法在浏览器中处理。` on ZH or the English image-cap string on EN; no camera prompt; homepage featured count still six.
**Expected:** Stacked generate then decode; live black-on-white QR; idle preview blank with Download disabled; PNG download named `qr-code.png`; Copy payload is decoded text; image-cap error distinct from text-cap; no camera; featured stays six.
**Why human:** PLAN deferred this to end-of-phase human-check. No Playwright/tsx island tests. Grep cannot see clipboard contents, downloaded PNG bytes, 720px split, live typing, camera permission prompt, or ZH chrome in a real browser.

### Gaps Summary

None. All seven must-haves are present, substantive, wired, and behaviorally evidenced in lib/source-read tests. Status is `human_needed` solely because the planner deferred a visual/browser walkthrough to end-of-phase.

CAT-04 evidence path: `G:/海外练手项目/.claude/worktrees/agent-aa1522170ac6e8d38/dist/_astro/JsonFormatter.wS29ZjPR.js`

---

_Verified: 2026-09-14T10:33:26Z_
_Verifier: Claude (gsd-verifier)_
