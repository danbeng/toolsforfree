# Architecture Research

**Domain:** Brownfield Astro + Preact Devtoolbox — additive 8-tool catalog expansion
**Researched:** 2026-09-11
**Confidence:** HIGH (existing pattern, from source); MEDIUM (Astro island JS splitting / `client:only` exception path)

Do not redesign the site. Each of the eight tools is one more vertical slice through the catalog already used by the ten shipped tools. Routing, layout, i18n trees, ToolShell, and content-collection schema stay.

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Astro SSG pages (unchanged)                                    │
│  EN: src/pages/tools/[slug].astro                               │
│  ZH: src/pages/zh/tools/[slug].astro  (locale = 'zh' only)      │
│  getStaticPaths() = TOOLS.map(slug)  ← add a row, get both URLs │
├────────────────────────────┬────────────────────────────────────┤
│  BaseLayout + Header/Footer│  Content collections (SEO only)    │
│  LangSwitch, AdSlot, FAQ,  │  src/content/tools/{slug}.md       │
│  RelatedTools, ToolCard    │  src/content/tools/zh/{slug}.md    │
└──────────────┬─────────────┴─────────────────┬──────────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────┐     ┌────────────────────────────────┐
│ Catalog (source of truth)│     │ i18n                           │
│ src/data/tools.ts        │     │ ui.ts  copy.tools[slug]        │
│ ToolCategory + TOOLS[]   │     │        copy.categories[Cat]    │
│ relatedSlugs / featured  │     │ errors.ts  EN→ZH map           │
└──────────────┬───────────┘     │ useToolUi(locale)              │
               │                 └────────────────────────────────┘
               ▼
┌─────────────────────────────────────────────────────────────────┐
│ ToolIsland.astro  — explicit slug → island, NOT dynamic import  │
│ {slug === 'word-counter' && <WordCounter client:load locale />} │
│ …same for the other 7. Missing branch = blank island, no error. │
├─────────────────────────────────────────────────────────────────┤
│ Preact islands  src/components/tools/*.tsx                      │
│   useState/useMemo → isTooLarge → src/lib/*.ts → ToolShell      │
│ ToolShell  chrome + copy-to-clipboard + error/output <pre>      │
├─────────────────────────────────────────────────────────────────┤
│ Pure lib  src/lib/{tool}.ts + colocated {tool}.test.ts          │
│ Result union: { ok: true, … } | { ok: false, error: string }    │
│ Browser-local only. No API routes. No workers.                  │
└─────────────────────────────────────────────────────────────────┘
```

Eight new islands plug in at three seams only: `TOOLS` row, `ToolIsland` branch, `src/lib` + `*.tsx` + EN/ZH markdown + `ui.ts` / `errors.ts`. No new `.astro` page files.

### Component Responsibilities

| Component | Responsibility | Talks to | Typical implementation |
|-----------|----------------|----------|------------------------|
| `TOOLS` catalog | Slug, category, related graph, featured | `[slug].astro` paths, home, `/tools/`, RelatedTools, ToolCard | Append 8 rows in `src/data/tools.ts` |
| `[slug].astro` EN/ZH | SSG page shell; throw if catalog or markdown missing | `TOOLS`, `toolPages` collection, `ToolIsland`, FAQ, RelatedTools | **Do not edit** except if schema/copy slots change |
| `toolPages` collection | Localized title/intro/howTo(3)/faq(3–5) | Page template only — never the island | `src/content/tools/{slug}.md` + `zh/{slug}.md` |
| `ToolIsland.astro` | Slug → Preact island with `client:load` | One matching `*.tsx` | Add one boolean branch + static import |
| Tool `*.tsx` | Input state, size guard, call lib, labels | `useToolUi`, `src/lib`, `ToolShell` | Copy `JsonFormatter.tsx` / `UuidGenerator.tsx` / `Base64Tool.tsx` |
| `ToolShell` | Chrome, error `role="alert"`, text output + Copy | Island only | Reuse as-is; extra preview/image goes in **children**, not a rewrite |
| `src/lib/*.ts` | Pure transform; English error strings | Island + Vitest | `{ ok:true } \| { ok:false, error }` like `json.ts` |
| `src/lib/limits.ts` | Shared 100k-char cap | Every text island | Reuse `isTooLarge`. Add a **byte** cap helper for QR files only |
| `src/i18n/ui.ts` | EN+ZH labels; `categories`; `tools[slug]` | ToolCard, RelatedTools, islands | Both locales required (`as const`) |
| `src/i18n/errors.ts` | Map lib English errors → ZH | `useToolUi().err` | Add a row per new English error |
| Home / tools index | Featured six + category groups | `getFeaturedTools`, `getToolsByCategory` | No code change if category union + `CATEGORY_ORDER` stay in sync |

## Recommended Project Structure

```
src/
├── data/tools.ts                 # append 8 Tool rows + relatedSlugs
├── data/tools.test.ts            # bump length 10 → 18; keep unique-slug + category-sum checks
├── lib/
│   ├── limits.ts                 # keep INPUT_MAX_CHARS; add INPUT_MAX_BYTES for QR
│   ├── word-count.ts             # + word-count.test.ts
│   ├── case.ts                   # + case.test.ts
│   ├── lorem.ts                  # + lorem.test.ts
│   ├── password.ts               # + password.test.ts
│   ├── sql.ts                    # + sql.test.ts
│   ├── diff.ts                   # + diff.test.ts
│   ├── markdown.ts               # + markdown.test.ts
│   └── qr.ts                     # + qr.test.ts  (generate + decode)
├── components/
│   ├── ToolShell.tsx             # reuse; optional extra children only
│   └── tools/
│       ├── ToolIsland.astro      # 8 new static imports + client:load branches
│       ├── WordCounter.tsx
│       ├── CaseConverter.tsx
│       ├── LoremIpsum.tsx
│       ├── PasswordGenerator.tsx
│       ├── SqlFormatter.tsx
│       ├── TextDiff.tsx
│       ├── MarkdownPreview.tsx
│       └── QrCode.tsx
├── content/tools/
│   ├── {slug}.md                 # locale: en
│   └── zh/{slug}.md              # locale: zh; collection id becomes zh/{slug}
├── i18n/ui.ts                    # copy.tools[slug] EN+ZH; no new category keys
├── i18n/errors.ts                # new English errors
└── pages/                        # DO NOT add tool routes; [slug].astro already enumerates TOOLS
```

### Structure Rationale

- **`src/data/tools.ts`:** Routing source of truth. Markdown is SEO only. Switching `getStaticPaths` to `getCollection('toolPages')` would desync EN/ZH and featured/related — do not.
- **`src/lib/` one module per tool:** Matches `json.ts`, `jwt.ts`, … Colocated Vitest. No barrel `lib/index.ts` (would drag QR/markdown deps into unrelated tests/islands).
- **`src/components/tools/`:** One PascalCase island per slug. `ToolIsland.astro` must statically import them — Astro `client:*` does not work on dynamic tags.
- **Content `zh/` subdirectory:** Existing matcher is `p.id === slug \|\| p.id.endsWith('/' + slug)`. Keep that; do not flatten ZH files.
- **No new pages:** EN+ZH `[slug].astro` already throw `Unknown tool` / `Missing content` at build. A catalog row without markdown fails the build on purpose.

### Locked slugs (kebab-case, match existing style)

| Tool | Slug | Island | Lib |
|------|------|--------|-----|
| Word / character counter | `word-counter` | `WordCounter.tsx` | `word-count.ts` |
| Case / Slug converter | `case-converter` | `CaseConverter.tsx` | `case.ts` |
| Lorem ipsum generator | `lorem-ipsum` | `LoremIpsum.tsx` | `lorem.ts` |
| Password generator | `password-generator` | `PasswordGenerator.tsx` | `password.ts` |
| SQL formatter | `sql-formatter` | `SqlFormatter.tsx` | `sql.ts` |
| Text Diff | `text-diff` | `TextDiff.tsx` | `diff.ts` |
| Markdown preview | `markdown-preview` | `MarkdownPreview.tsx` | `markdown.ts` |
| QR generate + decode | `qr-code` | `QrCode.tsx` | `qr.ts` |

Do not use `case-slug` or `qr-generator`. One slug per product surface; encode/decode (QR) and case/slug are modes inside one island, same as `base64`.

## Category Assignments

Existing union: `Format | Auth | Encode | Generate | Text | Time | Color`.

| Slug | Category | Why |
|------|----------|-----|
| `markdown-preview` | **Format** | Markup → readable output, sibling of JSON |
| `sql-formatter` | **Format** | Pretty-print, sibling of JSON |
| `text-diff` | **Text** | Two strings in, comparison out, sibling of regex |
| `case-converter` | **Text** | String transforms. Not Encode (Encode is Base64/URL percent-encoding) |
| `word-counter` | **Text** | Text analysis |
| `password-generator` | **Generate** | Like UUID / hash |
| `lorem-ipsum` | **Generate** | Generates text |
| `qr-code` | **Generate** | Generates an artifact (image); decode is the inverse mode |

**Do not add a category in this milestone.** One QR tool is not an Image section. Out of scope already forbids general image tools; an `Image` / `QR` category would frame the catalog as a TinyWow kitchen sink.

### How to add a category (only if a later milestone needs it)

1. Extend `ToolCategory` in `src/data/tools.ts`.
2. Append the name to `CATEGORY_ORDER` (home + `/tools/` follow this order; unknown categories never appear).
3. Add `categories.NewName` in **both** `ui.en` and `ui.zh` (`as const` will fail CI/typecheck if either side is missing).
4. Stop. `getToolsByCategory()` already drops empty groups. ToolCard reads `copy.categories[tool.category]`. No page edits.

`Encode` stays Base64/URL. `Auth` stays JWT. `Color` / `Time` unchanged.

### Related-slug graph (wire when the target row exists)

`getRelatedTools` silently drops unknown slugs, so forward-references are safe. Back-links on the original ten should be added in the same slice as the new tool so `/tools/json-formatter/` can point at SQL/Markdown.

| New slug | relatedSlugs | Also add this slug onto |
|----------|--------------|-------------------------|
| `word-counter` | `regex-tester`, `case-converter`, `lorem-ipsum` | `regex-tester` |
| `case-converter` | `url-encode`, `word-counter`, `lorem-ipsum` | `url-encode` |
| `lorem-ipsum` | `word-counter`, `password-generator`, `case-converter` | — |
| `password-generator` | `uuid-generator`, `hash-generator`, `lorem-ipsum` | `uuid-generator` |
| `sql-formatter` | `json-formatter`, `markdown-preview` | `json-formatter` |
| `text-diff` | `word-counter`, `markdown-preview`, `regex-tester` | `regex-tester` |
| `markdown-preview` | `json-formatter`, `word-counter`, `text-diff` | `json-formatter` |
| `qr-code` | `url-encode`, `hash-generator`, `uuid-generator` | `url-encode` |

Featured set stays **exactly six** (JSON + JWT plus the current four). New tools ship `featured: false`. `tools.test.ts` currently asserts length 10 and featured length 6 — update the catalog length; do not grow featured.

## Architectural Patterns

### Pattern 1: Vertical slice (mandatory)

**What:** One tool = one commit-sized set: lib + test + island + ToolIsland branch + catalog row + EN/ZH `ui.ts` + errors + both markdown files + test length bump.

**When to use:** Every tool. `[slug].astro` throws if the catalog row exists without markdown. A missing `ToolIsland` branch renders a blank panel with no build error.

**Trade-offs:** Cannot land “catalog first, UI later.” Prevents half-wired routes.

**Example:**

```ts
// src/data/tools.ts — one new row
{
  slug: 'word-counter',
  name: 'Word / Character Counter',
  category: 'Text',
  shortDescription: 'Count words, characters, and lines in your browser.',
  relatedSlugs: ['regex-tester', 'case-converter', 'lorem-ipsum'],
  featured: false,
}
```

### Pattern 2: Explicit ToolIsland if-chain + `client:load`

**What:** Static import + `{slug === '…' && <Island client:load locale={locale} />}`.

**When to use:** All eight tools, including Markdown and QR.

**Trade-offs:** File grows linearly (accepted; already 10 branches). Dynamic `import()` / `<component client:load>` is **invalid** in Astro — `client:*` only on directly imported framework components.

**Example:**

```astro
---
import WordCounter from './WordCounter';
import QrCode from './QrCode';
// …existing 10 + the other 6
---
{slug === 'word-counter' && <WordCounter client:load locale={locale} />}
{slug === 'qr-code' && <QrCode client:load locale={locale} />}
```

### Pattern 3: Lib result union + English errors

**What:** Lib never throws for user input. UI localizes via `err()`.

**When to use:** Parsers/formatters (SQL, markdown, diff, case, QR decode). Generators (password, lorem) can return a string and still use the union for invalid options (length 0, empty charset).

**Trade-offs:** Every new English error needs an `errors.ts` ZH row or ZH users see English.

```ts
export type SqlResult =
  | { ok: true; formatted: string }
  | { ok: false; error: string };

export function formatSql(input: string): SqlResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: '' };
  // …
}
```

Island:

```tsx
if (isTooLarge(input)) return { error: tooLarge, output: '' };
const r = formatSql(input);
return { error: r.ok ? null : err(r.error || null), output: r.ok ? r.formatted : '' };
```

### Pattern 4: ToolShell children for non-text chrome

**What:** Keep `output: string` for Copy. Put file pickers, live HTML preview, QR `<img>`, Download buttons in `children` (already the input slot).

**When to use:** Markdown (preview pane + raw HTML in `output` for Copy). QR (canvas/img + file input; `output` = decoded text or data URL). Diff can still stringify a unified diff into `<pre>`.

**Trade-offs:** Avoids a ToolShell rewrite. Markdown HTML should **not** be the only surface (tags in `<pre>` look broken) — add a preview node in children. Sanitize before `dangerouslySetInnerHTML`.

**Do not** add `client:only` just because the island has a preview.

### Pattern 5: Async / browser APIs follow HashGenerator, not UuidGenerator

**What:** `UuidGenerator` inlines `crypto.randomUUID()` with no `src/lib` — do **not** copy that. Password and lorem belong in `src/lib` so Vitest covers them. QR decode and any `FileReader` / canvas work go in `useEffect` or click handlers, same as `hashText` in `HashGenerator.tsx`.

**When to use:** QR generate/decode, markdown render if the parser is async, password via `crypto.getRandomValues`.

## Island loading: QR and Markdown

| Question | Answer |
|----------|--------|
| Default directive | **`client:load`** for all eight, same as the existing ten. Tools sit above the fold; `client:visible` would delay the textarea until scroll; `client:idle` is an unnecessary divergence. |
| `client:only="preact"` | **Not the default.** Use only if a dependency throws at **import / SSR** because it touches `window`/`document`/`canvas` at module scope. Prefer: keep the library call inside an event/`useEffect`, or `await import('…')` on first use inside the island. |
| Heavy deps (marked, sql-formatter, diff, jsQR / qrcode) | Import them **only** from that tool's `src/lib/{tool}.ts` or island. Never from `ToolIsland.astro`, `ToolShell`, or a shared barrel. Other tool pages then do not download them (island JS is per hydrated component; confidence MEDIUM pending a `astro build` bundle check). |
| Markdown SSR | There is no user Markdown at SSG time. Island hydrates empty. Stay on `client:load`. Sanitize HTML in lib before the island paints. |
| QR generate | Canvas/`<img src={dataUrl}>` after user input. Fine with `client:load` if generate runs on click/`useEffect`. |
| QR decode | Selected `File` only (no camera). `FileReader` + decode in the change handler. Add `INPUT_MAX_BYTES` (image) beside `INPUT_MAX_CHARS` (text). |
| Split generate vs decode bundles | Optional `import()` inside `QrCode.tsx` so generate-only users skip the decoder. Not required for v1 of the tool if the combined island is acceptable. |

Official Astro behavior used here (Context7 `/withastro/docs`, MEDIUM): `client:load` SSRs then hydrates immediately; `client:only` skips SSR and **requires** a framework hint (`client:only="preact"`); directives only work on components imported directly in a `.astro` file.

## Data Flow

### Request flow (unchanged)

```
GET /tools/{slug}/   or   GET /zh/tools/{slug}/
        ↓
getStaticPaths() ← TOOLS   (both locale files)
        ↓
getTool(slug)            throw if missing
getCollection('toolPages') match locale + slug   throw if missing
        ↓
BaseLayout (canonical, hreflang via localizedPath)
        ↓
ToolIsland(slug, locale) → one Preact island client:load
        ↓
User input → isTooLarge / isTooLargeBytes → lib → ToolShell output | error
```

Sitemap: `@astrojs/sitemap` walks the SSG routes. Adding a `TOOLS` row automatically emits `/tools/{slug}/` and `/zh/tools/{slug}/`. No sitemap code change.

### State

No global store. Locale is a prop (`Locale`), not context. Each island owns `useState` / `useMemo`. Ads stay compile-time (`ADS_ENABLED`).

### Key data flows

1. **Catalog → routes → cards:** `TOOLS` drives paths, home featured, `/tools/` groups, related links. `shortDescription` on `Tool` is English fallback; **cards use `copy.tools[slug]`** so ZH catalogs are not English.
2. **Markdown → SEO blocks only:** how-to / FAQ never enter the island. Island labels live in `ui.ts`.
3. **Lib → UI errors:** English string in lib → `localizeError` → ZH map or pass-through.
4. **QR file flow (new, still local):** `<input type="file">` → island → `File.arrayBuffer()` in lib → decode → text `output`. The file never goes to the network. Reject oversize before decode.

## Suggested Build Order

Atomic slices. Do not add eight catalog rows up front — build will throw on missing markdown, and ToolIsland will blank-render missing branches.

### Wave 0 — test harness only (tiny)

- Change `tools.test.ts` `"has exactly 10 tools"` to a unique-slug + `TOOLS.length` assertion that grows with the catalog (or bump per slice: 11, 12, …).
- Keep featured === 6.
- No architecture changes.

### Wave 1 — text/generate, zero new UI chrome, zero/low deps

Prove the 8-file checklist on the cheapest tools.

1. **`word-counter`** — one textarea, stats string in ToolShell. Clone `JsonFormatter` shape.
2. **`case-converter`** — mode radios like Base64 (upper/lower/title/camel/snake/kebab/slug).
3. **`lorem-ipsum`** — options + Generate button; lib must exist (do not clone UuidGenerator’s missing-lib shortcut).
4. **`password-generator`** — length/charset + Generate; `crypto.getRandomValues` in lib.

**Avoids:** ToolShell changes, file inputs, HTML injection, new categories.

### Wave 2 — formatters (libs OK, still text-shaped ToolShell)

5. **`sql-formatter`** — Format category; related to JSON. First likely npm formatter.
6. **`text-diff`** — two textareas (still `children`); unified-diff text in `output`. Second textarea is the only UI stretch.
7. **`markdown-preview`** — Format; preview node in children + sanitized HTML string in `output` for Copy. First XSS surface. Stay `client:load`.

**Avoids:** shipping Markdown before a sanitizer decision; putting `marked` in a shared module.

### Wave 3 — QR last

8. **`qr-code`** — generate + decode modes like Base64. File input, image preview, Download, byte-size guard, new error strings. Heaviest island. Optional inner `import()` for decoder.

**Depends on:** Wave 1–2 having proven catalog/content/i18n wiring. Isolates the only image-in exception.

### Intra-slice order (every tool)

```
lib + unit tests
  → island TSX (ToolShell + useToolUi)
    → ToolIsland import + branch
      → ui.ts EN+ZH labels  (typecheck fails without both)
        → errors.ts if new English errors
          → TOOLS row + relatedSlugs on existing tools
            → content/tools/{slug}.md + zh/{slug}.md
              → bump tools.test.ts length
                → npm test && astro build  (throws on missing content)
```

Lib before island so the UI never inlines algorithms. Catalog **after** markdown is ready, or in the same change — never catalog-only.

### What not to parallelize

- ToolIsland if-chain: sequential edits to one file; land one branch per slice to keep diffs reviewable.
- `ui.ts` `as const` object: same file, both locales; do not split EN/ZH across PRs.
- Do not run Wave 3 in parallel with Wave 2 on the same ToolShell experiments — Markdown preview pattern should settle first so QR image chrome copies it.

## Scaling Considerations

| Scale | Architecture adjustments |
|-------|--------------------------|
| 18 tools (this milestone) | If-chain + static catalog is the right size. SSG page count doubles per locale automatically. |
| ~30 tools | Still one `[slug].astro`. Consider grouping ToolIsland into two astro partials only if the file is painful to edit — not for runtime. |
| 100k+ visits | Bottleneck is island JS size on Markdown/QR pages, not SSG. Measure those two bundles; lazy-import decoder/parser if they dominate. CDN/static host already fits. |

### Scaling priorities

1. **First bottleneck:** Markdown + QR island bytes on their own pages. Fix with per-lib imports / inner `import()`, not a site rewrite.
2. **Second bottleneck:** ToolIsland if-chain human error (forgotten branch). Mitigation: build smoke that each `TOOLS` slug appears in `ToolIsland.astro`, or a fallback “Unknown tool island” paragraph. Optional hardening, not a new framework.

## Anti-Patterns

### Anti-Pattern 1: Catalog without markdown / island

**What people do:** Append eight `TOOLS` rows, then iterate UIs.

**Why it's wrong:** `throw new Error('Missing content for ${slug}')` at `astro build`. Missing ToolIsland branch ships an empty panel.

**Do this instead:** Vertical slice. Build after each tool.

### Anti-Pattern 2: Dynamic island import

**What people do:** `const Cmp = islands[slug]; <Cmp client:load />`.

**Why it's wrong:** Astro forbids `client:*` on dynamic tags. Hydration never attaches.

**Do this instead:** Keep the explicit if-chain.

### Anti-Pattern 3: New category for QR or Markdown

**What people do:** Add `Image` or `Markup`.

**Why it's wrong:** Home category chips and `/tools/` sections multiply; one-tool categories look empty. Conflicts with “no general image tools.”

**Do this instead:** QR → Generate; Markdown/SQL → Format; Diff/Case/Word → Text.

### Anti-Pattern 4: `client:only` by default for QR/Markdown

**What people do:** Skip SSR because “canvas/HTML.”

**Why it's wrong:** Diverges from ten working tools; blank HTML until JS; requires `client:only="preact"` hint. SSR of an empty form is free and matches ToolShell chrome.

**Do this instead:** `client:load` + browser APIs in events/`useEffect`. `client:only="preact"` only if import-time `window` crashes SSG.

### Anti-Pattern 5: ToolShell rewrite / new page templates

**What people do:** Per-tool layouts, or replace `<pre>` globally with `innerHTML`.

**Why it's wrong:** Breaks Copy + error pattern on the original ten. XSS if Markdown HTML is dumped into a shared pre.

**Do this instead:** Extra UI in island `children`. Sanitize in `src/lib/markdown.ts`. Leave `[slug].astro` shared.

### Anti-Pattern 6: Mixing SEO into `TOOLS` / skipping `ui.ts`

**What people do:** Use catalog `name` on ZH cards.

**Why it's wrong:** ToolCard and RelatedTools index `copy.tools[slug]`. Missing keys are a type/runtime hole.

**Do this instead:** Routing metadata in `tools.ts`; long copy in collections; chrome labels in `ui.ts`.

### Anti-Pattern 7: API route or camera for QR

**What people do:** Server decode, `getUserMedia` scan.

**Why it's wrong:** Violates SITE_TAGLINE and milestone out-of-scope. Privacy model is browser-local.

**Do this instead:** File input → lib decode.

### Anti-Pattern 8: Copying UuidGenerator’s missing lib

**What people do:** Inline `crypto.randomUUID()`-style logic in password/lorem/QR.

**Why it's wrong:** No unit tests; islands become the algorithm. Existing UuidGenerator is a legacy exception, not a template.

**Do this instead:** Clone `JsonFormatter` / `HashGenerator` / `Base64Tool`.

## Integration Points

### External services

| Service | Integration pattern | Notes |
|---------|---------------------|-------|
| None for tool logic | — | No new API routes. `robots.txt.ts` stays the only `APIRoute`. |
| npm libs (optional) | Import from that tool’s `src/lib` only | sql-formatter / diff / marked+sanitizer / qrcode+jsQR. Decision belongs in STACK.md; architecture only cares they stay island-local. |
| Web Crypto | `crypto.getRandomValues` / existing hash pattern | Password. Prefer this over `Math.random`. |
| FileReader / canvas | Island event handlers | QR only. |

### Internal boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Catalog ↔ pages | Direct import of `TOOLS` | SSG only |
| Pages ↔ islands | `slug` + `locale` props | No shared runtime state |
| Island ↔ lib | Function call | Lib must not import Preact or `ui.ts` |
| Island ↔ i18n | `useToolUi(locale)` / `t(locale)` | Locale is a prop |
| Lib ↔ errors.ts | English string key | ZH map must include new keys |
| Content ↔ pages | `getCollection('toolPages')` | Not used by islands |
| RelatedTools ↔ catalog | `getRelatedTools(slug)` | Drops unknown slugs |

## Per-tool UI shape (so islands stay in family)

| Slug | Clone | Inputs | Output |
|------|-------|--------|--------|
| `word-counter` | JsonFormatter | one textarea | stats text |
| `case-converter` | Base64Tool | textarea + mode radios | transformed text |
| `lorem-ipsum` | UuidGenerator **plus** lib | count/paragraph controls + button | generated text |
| `password-generator` | UuidGenerator **plus** lib | length/charset + button | password |
| `sql-formatter` | JsonFormatter | textarea | pretty SQL |
| `text-diff` | RegexTester (multi-field) | two textareas | unified diff text |
| `markdown-preview` | JsonFormatter + preview child | textarea | sanitized HTML preview + source in Copy |
| `qr-code` | Base64Tool + HashGenerator async | text + file input, generate/decode mode | image + decoded text |

## Confidence

| Claim | Level | Why |
|-------|-------|-----|
| Plug-in path (catalog, island, lib, content, i18n) | HIGH | Read from current source 2026-09-11 |
| No new pages / no new category | HIGH | `getStaticPaths` + `getToolsByCategory` already generic |
| `client:load` for all eight | HIGH for text tools; MEDIUM that QR/markdown will not need `client:only` | Depends on chosen libs not touching `window` at import |
| Per-page island JS isolation | MEDIUM | Astro islands model + Context7; WebFetch of docs.astro.build blocked here — verify with `astro build` on Markdown/QR pages |
| ToolShell children suffice for preview/QR | HIGH | `children` already wrap inputs; output stays a string |

## Gaps to address in later phase research (not architecture blockers)

- Exact npm libraries (STACK.md): SQL formatter, diff, markdown+sanitize, QR generate/decode.
- Markdown sanitizer policy (PITFALLS / security phase).
- QR byte-size number (start from a conservative cap next to `INPUT_MAX_CHARS = 100_000`; tune when the decoder is chosen).
- Whether to add a ToolIsland fallback / slug-coverage test (recommended, optional).

## Sources

- Local codebase (HIGH): `src/data/tools.ts`, `src/components/tools/ToolIsland.astro`, `src/components/ToolShell.tsx`, `src/pages/tools/[slug].astro`, `src/pages/zh/tools/[slug].astro`, `src/content.config.ts`, `src/i18n/ui.ts`, `src/i18n/errors.ts`, `src/lib/json.ts`, `src/lib/limits.ts`, `src/components/tools/JsonFormatter.tsx`, `HashGenerator.tsx`, `Base64Tool.tsx`, `UuidGenerator.tsx`, `.planning/codebase/ARCHITECTURE.md`, `.planning/PROJECT.md`
- Context7 `/withastro/docs` (MEDIUM): `client:load` vs `client:visible` vs `client:only`; directives only on directly imported framework components; SSG `getStaticPaths` + content collections
- Astro directives / framework-components docs via Context7 (MEDIUM): `client:only` requires framework hint; `client:load` is high-priority above-the-fold hydration

---
*Architecture research for: Devtoolbox 8-tool additive milestone*
*Researched: 2026-09-11*
