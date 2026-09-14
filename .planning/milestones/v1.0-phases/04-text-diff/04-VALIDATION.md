---
phase: "04"
slug: "text-diff"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-09-13"
---

# Phase 4 — Validation Strategy

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

CAT-04 grep identifiers (minify-surviving; do **not** treat absence of `jsdiff` / `diffLines` / `createPatch` as sufficient):

`oneChangePerToken` | `newlineIsToken` | `stripTrailingCr` | `ignoreNewlineAtEof` | `createTwoFilesPatch`

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
| 04-01-01 | 01 | 1 | DIFF-01 | — | Two string inputs reach `diffText` | unit | `npm test` | ❌ W0 | ⬜ pending |
| 04-01-01 | 01 | 1 | DIFF-02 | T-04-01 | One row per line (`kind` add/del/eq); two consecutive adds → two rows | unit | `npm test` | ❌ W0 | ⬜ pending |
| 04-01-01 | 01 | 1 | DIFF-03 | — | Trim equality; internal spaces still differ | unit | `npm test` | ❌ W0 | ⬜ pending |
| 04-01-01 | 01 | 1 | DIFF-04 | — | `added`/`removed` count lines not hunks | unit | `npm test` | ❌ W0 | ⬜ pending |
| 04-01-01 | 01 | 1 | DIFF-05 | — | Identical non-empty → `identical: true`, added=0, removed=0 | unit | `npm test` | ❌ W0 | ⬜ pending |
| 04-01-01 | 01 | 1 | Idle | — | Both empty / both whitespace → `{ ok:false, error:'' }` before `diffLines` | unit | `npm test` | ❌ W0 | ⬜ pending |
| 04-01-01 | 01 | 1 | Partial | — | Original only → all `del`; changed only → all `add` | unit | `npm test` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | DIFF-06 | T-04-02 | Island `isTooLarge` per pane; do not call `diffText` when over cap | unit + source-read | `npm test` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | CAT-01 | — | TOOLS length 16, featured 6, slug unique, Text, `featured: false` | unit | `npm test` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | CAT-02 | T-04-03 | EN+ZH markdown `existsSync`; FAQ local / nothing uploaded | unit | `npm test` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | CAT-03 | — | `slug === 'text-diff'` + `locale={locale}` | unit | `npm test` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | CAT-05 | — | First ten `relatedSlugs` unchanged | unit / git | `npm test` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | CAT-06 | T-04-01 | Chrome keys on en+zh; Copy via ToolShell; no innerHTML | unit | `npm test` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | CAT-04 | T-04-SC | Only `src/lib/diff.ts` imports `'diff'`; JsonFormatter chunk has none of the five minify-surviving identifiers | unit + build smoke | `npm test && npm run build && node … CAT-04` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/diff.ts` — wrapper (`diffLines` + idle short-circuit + `oneChangePerToken: true`)
- [ ] `src/lib/diff.test.ts` — idle / one-empty / ignore-ws internal-spaces / identical / one-row-per-line / isolation
- [ ] `src/i18n/errors.test.ts` — append `text-diff` chrome-key describe (do not drop Phase 2/3 describes)
- [ ] `src/data/tools.test.ts` — bump `toHaveLength(15)` → `16`
- [ ] EN/ZH markdown so completeness `existsSync` passes
- [ ] Framework install: `npm install diff@9.0.0`
- [ ] Post-build CAT-04 grep of `dist/_astro/JsonFormatter*.js` (fails on missing chunk or leak)
- Existing `src/components/tools/ToolIsland.test.ts` covers CAT-03 as catalog grows
- Existing EN+ZH `existsSync` loop covers CAT-02 as markdown lands

*Framework install: `diff@9.0.0` only. Vitest already configured.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Two-pane layout at 720px (side-by-side / stacked) | DIFF-01 | No jsdom/tsx island tests on HEAD | Open `/tools/text-diff/` wide then narrow; Original left/top, Changed right/bottom |
| Per-line add/delete CSS colors + `+`/`-` prefixes | DIFF-02 | Visual; color is not the only signal | Paste differing lines; added rows green + `+`; deleted rows danger + `-` |
| Copy clipboard labeled summary | CAT-06 | Clipboard is browser-only | Copy writes `Added:` / `Removed:` header plus `- `/`+ `/two-space body, not a unified patch |
| ZH chrome including 无差异 | CAT-06 | Locale is a page prop | `/zh/tools/text-diff/` shows 原文 / 改后 / 忽略行首行尾空白 / 无差异 |
| Featured homepage still six | CAT-01 | Visual catalog | Homepage featured cards remain 6 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s for `npm test`
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending planner/checker (seeded 2026-09-13)
