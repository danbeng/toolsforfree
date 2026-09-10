<!-- refreshed: 2026-09-10 -->
# Architecture

**Analysis Date:** 2026-09-10

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Astro pages (SSG)                         │
│  `src/pages/`  EN + duplicated `src/pages/zh/`               │
├──────────────────┬──────────────────┬───────────────────────┤
│  Marketing pages │  Tool pages      │  Blog / robots        │
│  `index.astro`   │  `tools/[slug]`  │  `blog/index.astro`   │
│  about/privacy   │  `ToolIsland`    │  `robots.txt.ts`      │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Layout + chrome                                 │
│  `src/layouts/BaseLayout.astro`                              │
│  Header / Footer / LangSwitch / AdSlot                       │
└─────────────────────────────────────────────────────────────┘
         │
         ├──────────────► Content collections (`src/content/`)
         │                toolPages + blog via `content.config.ts`
         │
         ├──────────────► Catalog (`src/data/tools.ts`, `site.ts`)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Client islands (Preact)                                     │
│  `src/components/tools/*.tsx` + `ToolShell.tsx`              │
│         │                                                    │
│         ▼                                                    │
│  Pure lib (`src/lib/*.ts`) — JSON, JWT, hash, cron, …        │
│  i18n (`src/i18n/`) — copy, paths, error localization        │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Tool catalog | Slugs, categories, related tools, featured flags | `src/data/tools.ts` |
| Site constants | Name, origin, contact, tagline | `src/data/site.ts` |
| Ad flags | Placeholder ads gated by `ADS_ENABLED` | `src/data/ads.ts` |
| Tool pages (EN) | Static paths from `TOOLS`, SEO copy from collection | `src/pages/tools/[slug].astro` |
| Tool pages (ZH) | Same layout with `locale = 'zh'` | `src/pages/zh/tools/[slug].astro` |
| ToolIsland | Maps slug → Preact island with `client:load` | `src/components/tools/ToolIsland.astro` |
| Tool UIs | Input state, call lib, show output/error | `src/components/tools/*.tsx` |
| ToolShell | Shared chrome, copy-to-clipboard, error/output | `src/components/ToolShell.tsx` |
| Pure processors | Browser-local transforms, no network | `src/lib/*.ts` |
| i18n UI copy | Locale dictionaries via `t(locale)` | `src/i18n/ui.ts` |
| i18n paths | Prefix `/zh/`, trailing slashes, hreflang helpers | `src/i18n/path.ts` |
| Content schema | Zod collections for blog + tool markdown | `src/content.config.ts` |
| Layout | Canonical, hreflang, fonts, skip link | `src/layouts/BaseLayout.astro` |

## Pattern Overview

**Overall:** Static site generation (Astro) with Preact islands for interactive tools; duplicated locale page trees instead of a middleware i18n router.

**Key Characteristics:**
- All tool computation stays in the browser (`src/lib`); no API routes except `src/pages/robots.txt.ts`.
- Catalog (`TOOLS`) is the source of truth for routing (`getStaticPaths`); markdown is SEO/how-to/FAQ only.
- English is default (unprefixed URLs); Chinese is a parallel `src/pages/zh/` tree.
- Each tool UI is a small Preact component wrapping `ToolShell` and a matching `src/lib` module.

## Layers

**Pages (routing):**
- Purpose: File-based routes, static path generation, compose layout + content + island
- Location: `src/pages/`
- Contains: `.astro` pages; one `APIRoute` for robots
- Depends on: layouts, components, `src/data`, `src/i18n`, `astro:content`
- Used by: Astro build / `astro.config.mjs`

**Layout / chrome:**
- Purpose: HTML document, SEO tags, header/footer
- Location: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`
- Contains: Astro components + `src/styles/global.css`
- Depends on: `src/data/site.ts`, `src/i18n/*`
- Used by: every page

**Content:**
- Purpose: Localized titles, intros, how-to steps, FAQs; optional blog posts
- Location: `src/content/tools/`, `src/content/blog/`, schema in `src/content.config.ts`
- Contains: Markdown with frontmatter; ZH tools under `src/content/tools/zh/`
- Depends on: Astro content collections
- Used by: `src/pages/tools/[slug].astro`, `src/pages/zh/tools/[slug].astro`, blog indexes

**Interactive islands:**
- Purpose: Client-side tool UIs
- Location: `src/components/tools/*.tsx`
- Contains: Preact components hydrated with `client:load`
- Depends on: `src/lib/*`, `ToolShell.tsx`, `src/i18n/useToolUi.ts`
- Used by: `ToolIsland.astro`

**Domain lib:**
- Purpose: Pure, testable transforms (format, decode, hash, regex, cron, color)
- Location: `src/lib/`
- Contains: TypeScript modules + colocated `*.test.ts`
- Depends on: Web Crypto / language builtins only
- Used by: Preact tools; Vitest

**i18n:**
- Purpose: Locale type, path rewriting, UI strings, English error → ZH map
- Location: `src/i18n/`
- Contains: `locales.ts`, `path.ts`, `ui.ts`, `errors.ts`, `useToolUi.ts`
- Depends on: none (leaf)
- Used by: pages, layout, tools

## Data Flow

### Primary Request Path

1. User hits `/tools/{slug}/` or `/zh/tools/{slug}/` (`src/pages/tools/[slug].astro` / `src/pages/zh/tools/[slug].astro`)
2. `getStaticPaths` enumerates `TOOLS` from `src/data/tools.ts`
3. Page loads `toolPages` collection and matches `locale` + slug (`[slug].astro`)
4. `BaseLayout` sets canonical + hreflang via `localizedPath` (`src/layouts/BaseLayout.astro`)
5. `ToolIsland` hydrates the matching Preact tool (`src/components/tools/ToolIsland.astro`)
6. User input → `isTooLarge` (`src/lib/limits.ts`) → lib function → `ToolShell` output/error

### Home / directory

1. `src/pages/index.astro` (or `src/pages/zh/index.astro`) calls `getFeaturedTools` / `getToolsByCategory`
2. `ToolCard.astro` links via `localizedPath(locale, '/tools/{slug}/')`

### Blog

1. `src/pages/blog/index.astro` lists `getCollection('blog')`
2. Posts live under `src/content/blog/`; empty state when none (`.gitkeep` only)

**State Management:**
- No global store. Each island uses `useState` / `useMemo` in its `.tsx` file.
- Locale is a prop (`Locale`), not React context.
- Ads are compile-time data (`ADS_ENABLED` in `src/data/ads.ts`).

## Key Abstractions

**Tool catalog (`Tool`):**
- Purpose: Routing and related-tool graph
- Examples: `src/data/tools.ts`
- Pattern: Static array + getters (`getTool`, `getFeaturedTools`, `getRelatedTools`)

**Result unions in lib:**
- Purpose: Success vs error without throwing
- Examples: `src/lib/json.ts` (`JsonResult`), similar modules in `src/lib/`
- Pattern: `{ ok: true, ... } | { ok: false, error: string }`

**ToolIsland switch:**
- Purpose: Explicit slug → component mapping (not dynamic import)
- Examples: `src/components/tools/ToolIsland.astro`
- Pattern: Boolean conditions + `client:load`

**Duplicated locale pages:**
- Purpose: SSG-friendly i18n without runtime locale detection
- Examples: `src/pages/index.astro` vs `src/pages/zh/index.astro`
- Pattern: Same markup; `const locale = 'en' | 'zh'`

**Content collections:**
- Purpose: SEO copy separate from catalog
- Examples: `src/content.config.ts`, `src/content/tools/*.md`
- Pattern: Zod schema; `locale` field; ZH files nested in `zh/`

## Entry Points

**Dev / build:**
- Location: `package.json` scripts → `astro dev` / `astro build`
- Triggers: CLI
- Responsibilities: SSG output to `dist/`; sitemap via `@astrojs/sitemap`

**Config:**
- Location: `astro.config.mjs`
- Triggers: Astro
- Responsibilities: `site`, `trailingSlash: 'always'`, Preact + sitemap i18n

**HTTP pages:**
- Location: `src/pages/**/*.astro`
- Triggers: Static file server / host
- Responsibilities: Render HTML

**robots.txt:**
- Location: `src/pages/robots.txt.ts`
- Triggers: `GET`
- Responsibilities: Allow all; point to sitemap-index.xml

## Architectural Constraints

- **Threading:** Single-threaded browser for tools; no workers. Hash uses Web Crypto asynchronously in `src/lib/hash.ts` (consumed by `HashGenerator.tsx`).
- **Global state:** Module constants only (`TOOLS`, `SITE_ORIGIN`, `ADS_ENABLED`). No singletons with mutation.
- **Circular imports:** Not detected. Layers flow pages → components → lib/i18n/data.
- **No backend:** Do not add server endpoints for tool processing; privacy model is local-only.
- **Trailing slashes:** Required (`astro.config.mjs` + `localizedPath`).
- **Default locale unprefixed:** English URLs have no `/en/` prefix (`src/i18n/path.ts`).

## Anti-Patterns

### Duplicate locale page trees

**What happens:** EN and ZH pages copy the same Astro markup with a hardcoded `locale`.
**Why it's wrong:** Drift between `src/pages/*.astro` and `src/pages/zh/*.astro`.
**Do this instead:** Keep both trees in lockstep; when adding a page, add EN and ZH files together (same pattern as `about.astro` / `zh/about.astro`).

### ToolIsland exhaustive if-chain

**What happens:** New tools need a new branch in `src/components/tools/ToolIsland.astro` plus catalog + content + tests.
**Why it's wrong:** Missing a branch yields a blank island with no build error.
**Do this instead:** Add slug to `TOOLS`, markdown (en + zh), lib + test, TSX, and a `ToolIsland` branch in the same change.

### Mixing SEO copy into `TOOLS`

**What happens:** Catalog has English `name` / `shortDescription` used on cards.
**Why it's wrong:** ZH directory still uses English catalog strings unless UI copy overrides.
**Do this instead:** Keep routing metadata in `src/data/tools.ts`; put localized long copy in `src/content/tools` and UI labels in `src/i18n/ui.ts`.

## Error Handling

**Strategy:** Lib returns `{ ok: false, error }` or empty error for blank input; UI localizes via `localizeError`.

**Patterns:**
- Size guard first: `isTooLarge` → `copy.tooLarge` (`src/lib/limits.ts`, `useToolUi.ts`)
- English error strings in lib; ZH map in `src/i18n/errors.ts`
- Missing tool or markdown throws at build: `throw new Error(\`Unknown tool ${slug}\`)` in `[slug].astro`
- `ToolShell` shows `role="alert"` for errors

## Cross-Cutting Concerns

**Logging:** Not detected (no logger; client tools are silent).
**Validation:** Zod in `src/content.config.ts`; input size in `src/lib/limits.ts`; per-tool parsers in `src/lib`.
**Authentication:** Not applicable — no user accounts. JWT tool decodes only (`src/lib/jwt.ts`), does not verify.

---

*Architecture analysis: 2026-09-10*
