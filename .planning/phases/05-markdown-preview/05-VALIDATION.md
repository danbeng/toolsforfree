---
phase: "05"
slug: "markdown-preview"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-09-13"
---

# Phase 5 — Validation Strategy

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

`src/lib/markdown.test.ts` first line must be `// @vitest-environment jsdom` (A1). `jsdom@30.0.1` is a **devDependency only**. Never import `jsdom` from `src/lib/markdown.ts`.

CAT-04 grep identifiers (minify-surviving; do **not** treat absence of `marked.parse` / `sanitize` / `gfm` as sufficient):

`DOMPurify` | `FORBID_TAGS` | `ALLOWED_URI_REGEXP` | `uponSanitizeElement` | `listIsTask` | `listReplaceTask` | `github.com/markedjs/marked`

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
| 05-01-01 | 01 | 1 | MD-01 | — | GFM heading/list/link/fence/table/strike/task in sanitized `html` | unit | `npm test` | ❌ W0 | ⬜ pending |
| 05-01-01 | 01 | 1 | MD-02 | T-05-XSS | `<script>` / `onerror` stripped; source never passes Marked `sanitize` | unit | `npm test` | ❌ W0 | ⬜ pending |
| 05-01-01 | 01 | 1 | MD-03 | T-05-IMG | `https` and `data:` images absent; no `<img`; picture/video/style url stripped | unit | `npm test` | ❌ W0 | ⬜ pending |
| 05-01-01 | 01 | 1 | MD-05 | — | `''` → `{ ok:false, error:'' }`; image-only → `html === ''` after normalizeEmpty | unit | `npm test` | ❌ W0 | ⬜ pending |
| 05-01-01 | 01 | 1 | Idle | — | Empty source skips parse; whitespace-only may parse then sanitize to `''` | unit | `npm test` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | MD-04 | T-05-XSS | Island passes sanitized string as ToolShell `output`; `dangerouslySetInnerHTML` only of that string | unit (source-read) | `npm test` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | MD-05 | — | No `emptyHeading` / `emptyBody` chrome keys; blank `.md-preview` when idle | unit (source-read) | `npm test` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | CAT-01 | — | TOOLS length 17, featured 6, slug unique, Format, `featured: false` | unit | `npm test` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | CAT-02 | T-05-FAQ | EN+ZH markdown `existsSync`; FAQ local / nothing uploaded / not WYSIWYG / remote images blocked | unit | `npm test` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | CAT-03 | — | `slug === 'markdown-preview'` + `locale={locale}` | unit | `npm test` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | CAT-05 | — | First ten `relatedSlugs` unchanged | unit / git | `npm test` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | CAT-06 | T-05-SIZE | Chrome keys on en+zh; `ZH_ERRORS` maps `INPUT_TOO_LARGE_MSG`; Copy via ToolShell | unit | `npm test` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | CAT-04 | T-05-SC | Only `src/lib/markdown.ts` imports `'marked'` and `'dompurify'`; never `'jsdom'` from lib; JsonFormatter chunk has none of the seven minify-surviving identifiers | unit + build smoke | `npm test && npm run build && node … CAT-04` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/markdown.ts` — `renderMarkdown` (`marked.parse` then `DOMPurify.sanitize` with locked CFG; `normalizeEmpty`; never Marked `sanitize`)
- [ ] `src/lib/markdown.test.ts` — idle / GFM / XSS / img strip / normalizeEmpty / isolation; `// @vitest-environment jsdom`
- [ ] `src/components/tools/MarkdownPreview.tsx`
- [ ] `src/i18n/errors.ts` — map `INPUT_TOO_LARGE_MSG` ZH
- [ ] `src/i18n/errors.test.ts` — append `markdown-preview` chrome-key describe (do not drop Phase 2/3/4 describes)
- [ ] `src/data/tools.test.ts` — bump `toHaveLength(16)` → `17`
- [ ] EN/ZH markdown so completeness `existsSync` passes
- [ ] Framework install: `npm install marked@18.0.13 dompurify@3.4.15` and `npm install -D jsdom@30.0.1`
- [ ] Post-build CAT-04 grep of `dist/_astro/JsonFormatter*.js` (fails on missing chunk or leak)
- Existing `src/components/tools/ToolIsland.test.ts` covers CAT-03 as catalog grows
- Existing EN+ZH `existsSync` loop covers CAT-02 as markdown lands

*Framework install: `marked@18.0.13` + `dompurify@3.4.15` + `jsdom@30.0.1` (dev). Vitest already configured.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Split layout at 720px (source then preview) | MD-01 | No jsdom/tsx island tests on HEAD | Open `/tools/markdown-preview/` wide then narrow; Markdown left/top, Preview right/bottom |
| Live GFM preview as you type | MD-01 | Visual HTML surface is `.md-preview` not ToolShell `<pre>` | Paste heading/list/table/task/fence; preview updates without a Generate button |
| Empty preview is blank, not placeholder | MD-05 | Visual | Empty source: `.md-preview` has no children and no “Start typing” copy |
| XSS does not execute | MD-02 | Browser-only | Paste `<script>alert(1)</script>` and `![x](https://evil.example/x.png)`; no alert, no network image request, no broken-image icon |
| Copy clipboard is sanitized HTML | MD-04 | Clipboard is browser-only | Copy writes the sanitized HTML string, not source Markdown |
| ZH chrome | CAT-06 | Locale is a page prop | `/zh/tools/markdown-preview/` shows Markdown / 预览 |
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
