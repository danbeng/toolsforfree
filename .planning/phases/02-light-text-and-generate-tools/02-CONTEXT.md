# Phase 2: Light text and generate tools - Context

**Gathered:** 2026-09-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship four zero-dep catalog tools at existing-tool parity (8-file checklist from Phase 1):

- `word-counter` (Text)
- `case-converter` (Text)
- `lorem-ipsum` (Generate)
- `password-generator` (Generate)

Each slice: catalog row (`featured: false`), `src/lib` + Vitest, Preact island cloned from JsonFormatter (not UuidGenerator), ToolIsland branch, EN/ZH `ui.ts`, `ZH_ERRORS` in the same slice, EN+ZH markdown/FAQ.

Does **not** include SQL, Diff, Markdown, QR, `INPUT_MAX_BYTES`, Playwright, extra featured cards, or rewiring existing tools' `relatedSlugs`.

</domain>

<decisions>
## Implementation Decisions

### Slicing
- Four sequential vertical slices: word-counter → case-converter → lorem-ipsum → password-generator; each must keep Phase 1 completeness tests green before the next
- Clone JsonFormatter + `src/lib/json.ts` as the template (has a lib). Do not clone UuidGenerator
- Categories: word-counter and case-converter → Text; lorem-ipsum and password-generator → Generate
- All four `featured: false` (featured set stays six)

### Counter and Case/Slug
- Word count via `Intl.Segmenter` `granularity: 'word'` when available; fallback: whitespace split plus each CJK ideograph counts as one word
- Sentences split on `. ? !` and fullwidth `。？！`
- Title Case: Unicode-aware first letter of whitespace-separated words; no acronym exception table
- Slug: keep CJK letters; NFKD strip Latin diacritics; strip punctuation; collapse hyphens. No pinyin. Han must not become empty

### Lorem and Password
- Embed a classic Latin word list in `src/lib/lorem.ts`; no `fetch`, no npm lorem package
- “By words” = N space-separated words ending with a period
- Password defaults: lowercase, uppercase, digits, symbols all on; exclude-similar off
- Symbol set: `!@#$%^&*-_=+` (URL/copy-safe). CSPRNG: `crypto.getRandomValues` + rejection sampling. Empty charset errors. Length 8–128, default 16

### UI and wiring
- Case converter: Color Converter-style multi-row outputs with per-row copy (UPPER, lower, Title, camel, Pascal, snake, kebab, CONSTANT, slug)
- Counter: metric tiles (words, chars ± spaces, lines, sentences, paragraphs) plus textarea — not a single ToolShell `<pre>` dump
- New tools interlink via `relatedSlugs`; do not rewrite existing ten tools' related lists
- Every English lib error gets a `ZH_ERRORS` entry in the same slice

### Claude's Discretion
Exact Segmenter fallback implementation, lorem corpus size, password regenerate button placement, metric-tile CSS using existing global classes, FAQ copy wording.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/json.ts` + `JsonFormatter.tsx` — parser result union, ToolShell, live compute
- `src/components/tools/ColorConverter.tsx` — multi-output fan-out analog for case-converter
- `src/lib/limits.ts` — `isTooLarge` / `INPUT_MAX_CHARS`
- `src/i18n/ui.ts`, `errors.ts`, `useToolUi`
- Phase 1 tests: `tools.test.ts` length snapshot 10 (must bump +1 per tool), `ToolIsland.test.ts` source-read, EN+ZH markdown existsSync

### Established Patterns
- Discriminated `{ ok: true } | { ok: false, error: string }`; empty input → empty error
- English errors in lib; `localizeError` in island
- `TOOLS` drives routes; markdown is SEO/FAQ only
- No `src/lib/index.ts` barrel

### Integration Points
- Add four `slug ===` branches to `ToolIsland.astro` (static import — these tools are light)
- Bump `toHaveLength(10)` snapshot to 11, 12, 13, 14 as each tool lands (or once at the end of the phase if planned as one wave — prefer per-slice bump so CI stays true)
- `getFeaturedTools().length === 6` must stay green

</code_context>

<specifics>
## Specific Ideas

User accepted all recommended grey-area answers in autonomous smart discuss. Keep CJK in slugs. Password CSPRNG is non-negotiable.

</specifics>

<deferred>
## Deferred Ideas

- Sentence case / line-by-line convert (CASE-05/06 v2)
- Entropy-bits hint (PASS-07 v2)
- Reading time / UTF-8 bytes (COUNT-05/06 v2)
- `<p>` wrap for lorem (LORM-06 v2)
- Rewiring old tools' relatedSlugs
- SQL / Diff / Markdown / QR (later phases)

</deferred>
