---
phase: "06"
slug: "qr-code"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-09-14"
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^5.0.0 |
| **Config file** | `vitest.config.ts` (`include: ['src/**/*.test.ts']`, `environment: 'node'`) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Phase gate** | `npm test` then `npm run build` then CAT-04 JsonFormatter-chunk grep |
| **Estimated runtime** | ~5 seconds for tests; build is extra for CAT-04 |

No coverage script. No Playwright. Do not add `.tsx` tests except if an existing analog already tests islands in `.ts`. Phase gate also runs `npm run build` so content collections Zod-parse EN/ZH markdown and CAT-04 can read `dist/_astro/JsonFormatter*.js`.

Do **not** set `// @vitest-environment jsdom` on `src/lib/qr.test.ts` unless a test truly needs a DOM. Matrix + RGBA round-trip runs in Node. Never import `jsdom` from `src/lib/qr.ts`. Do not install `canvas` / `jsqr`.

CAT-04 grep identifiers (minify-surviving; do **not** treat absence of `from 'qr'` as sufficient):

`encodeQR` | `decodeQR` | `Capacity overflow` | `invalid ecc` | `pointsOnDetect` | `paulmillr` | `data:image/gif`

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green (`npm test` + `npm run build` + CAT-04 grep)
- **Max feedback latency:** 15 seconds for `npm test`; build is slower and only required on the CAT-04 task

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | QR-01 | — | Non-empty text → matrix; `trim()===''` idle empty error before encode | unit | `npm test` | ❌ W0 | ⬜ pending |
| 06-01-01 | 01 | 1 | QR-03 | — | UI L/M/Q/H maps to low/medium/quartile/high; never pass `'M'` | unit | `npm test` | ❌ W0 | ⬜ pending |
| 06-01-01 | 01 | 1 | QR-04 | T-06-CAM | Synthetic RGBA at ≥2 px/module round-trips; noise → English not-found | unit | `npm test` | ❌ W0 | ⬜ pending |
| 06-01-01 | 01 | 1 | QR-06 | T-06-SIZE | `IMAGE_MAX_BYTES` 5242880; island compares `file.size` before bitmap | unit + source-read | `npm test` | ❌ W0 | ⬜ pending |
| 06-01-01 | 01 | 1 | QR-07 | T-06-CAM | No `getUserMedia` / `qr/dom.js` / `capture` in lib+island | unit (source-read) | `npm test` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | QR-02 | T-06-GIF | Island `toDataURL('image/png')` + `download="qr-code.png"`; never encoder data-url | unit (source-read) | `npm test` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | QR-05 | T-06-XSS | ToolShell `output` is decoded string; never data-URL; never innerHTML of payload | unit (source-read) | `npm test` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | CAT-01 | — | TOOLS length 18, featured 6, slug unique, Generate, `featured: false` | unit | `npm test` | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | CAT-02 | T-06-FAQ | EN+ZH markdown `existsSync`; FAQ local / nothing uploaded / selected file / never camera | unit | `npm test` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | CAT-03 | — | `slug === 'qr-code'` + `locale={locale}` | unit | `npm test` | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | CAT-05 | — | First ten `relatedSlugs` unchanged | unit / git | `npm test` | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | CAT-06 | T-06-SIZE | Chrome keys on en+zh; ZH_ERRORS maps text-cap, image-cap, unreadable, not-an-image, encode-fail | unit | `npm test` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | CAT-04 | T-06-SC | Only `src/lib/qr.ts` imports `'qr'` and `'qr/decode.js'`; never `'qr/dom.js'`; JsonFormatter chunk has none of the seven minify-surviving identifiers | unit + build smoke | `npm test && npm run build && node … CAT-04` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/qr.ts` — `encodeQr` / `decodeQr` (`encodeQR` from `'qr'` + `decodeQR` from `'qr/decode.js'`; never `'qr/dom.js'`)
- [ ] `src/lib/qr.test.ts` — idle / ECC map / capacity / scale-2 round-trip / noise / isolation / no camera; **Node env** (no jsdom pragma)
- [ ] `src/lib/limits.ts` — `IMAGE_MAX_BYTES` / `IMAGE_TOO_LARGE_MSG`
- [ ] `src/components/tools/QrCode.tsx`
- [ ] `src/i18n/errors.ts` — map five English errors ZH
- [ ] `src/i18n/errors.test.ts` — append `qr-code` chrome-key describe (do not drop Phase 2–5 describes)
- [ ] `src/data/tools.test.ts` — bump `toHaveLength(17)` → `18`
- [ ] EN/ZH markdown so completeness `existsSync` passes
- [ ] Framework install: `npm install qr@0.7.0`
- [ ] Post-build CAT-04 grep of `dist/_astro/JsonFormatter*.js` (fails on missing chunk or leak)
- Existing `src/components/tools/ToolIsland.test.ts` covers CAT-03 as catalog grows
- Existing EN+ZH `existsSync` loop covers CAT-02 as markdown lands

*Framework install: `qr@0.7.0` only. Do not install jsqr / qrcode / qr-scanner / @zxing/* / canvas. Vitest already configured.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Split generate layout at 720px (text then QR) | QR-01 | No jsdom/tsx island tests on HEAD | Open `/tools/qr-code/` wide then narrow; text/ECC left/top, 256×256 preview right/bottom |
| Live QR as you type; empty is blank | QR-01 | Visual canvas | Type a URL; modules appear black-on-white. Clear text: blank `.qr-preview`, Download disabled, no placeholder QR |
| ECC L/M/Q/H default M | QR-03 | Visual density | Default M; switching L vs H changes module density |
| Download PNG | QR-02 | Browser download | Download is `qr-code.png` (not GIF); file opens as PNG |
| File decode + Copy | QR-04, QR-05 | File picker + clipboard | Select a generated PNG; decoded text appears; Copy writes that string |
| Oversize image | QR-06 | File size | Huge file rejected before decode; distinct from text too-large |
| No camera | QR-07 | Permission UI | No camera prompt; no video/capture control |
| ZH chrome | CAT-06 | Locale is a page prop | `/zh/tools/qr-code/` shows Generate/Decode section titles |
| Featured homepage still six | CAT-01 | Visual catalog | Homepage featured cards remain 6 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s for `npm test`
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending planner/checker (seeded 2026-09-14)
