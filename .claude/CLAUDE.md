<!-- GSD:project-start source:PROJECT.md -->

## Project

**Devtoolbox — More Tools Milestone**

Devtoolbox is a static, bilingual (EN default + `/zh/`) catalog of browser-local developer tools. Computation stays in the visitor's browser; nothing is uploaded. This milestone adds eight missing catalog tools at the same standard as the existing ten: Preact island + `src/lib` processor + EN/ZH pages + SEO/how-to/FAQ markdown + catalog/related-tools wiring.

**Core Value:** A visitor can open any of the eight new tools, run it entirely in the browser, and get a correct result without sending data anywhere — with the same EN/ZH, SEO, and catalog treatment as the tools already shipped.

### Constraints

- **Privacy / architecture**: All tool computation in the browser (`src/lib`); no new API routes for tool logic — matches SITE_TAGLINE and existing pattern
- **Parity**: New tools must match existing tool quality (UI chrome, copy-to-clipboard, errors, EN+ZH, FAQ) — user-stated definition of done
- **Stack**: Stay on Astro + Preact + current catalog/content-collection pattern — do not introduce a new app framework
- **QR decode**: In-browser only (selected image file); no server OCR/decode API
- **Do not rewrite**: Existing ten tools are validated; this milestone is additive

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript 7.x (`typescript` `^7.0.2`) - `src/lib/*.ts`, `src/data/*.ts`, `src/i18n/*.ts`, Vitest files, `src/content.config.ts`, `src/pages/robots.txt.ts`
- Astro (`.astro` templates) - pages, layouts, presentational components under `src/pages/`, `src/layouts/`, `src/components/`
- CSS - `src/styles/global.css` plus scoped `<style>` blocks in `.astro` files
- Markdown - content collections in `src/content/blog/` and `src/content/tools/`

## Runtime

- Node.js `^20.19.0 || >=22.12.0` (required by `@astrojs/compiler-binding` in `package-lock.json`; no `.nvmrc` / `.python-version`)
- ESM (`"type": "module"` in `package.json`)
- npm (lockfileVersion 3)
- Lockfile: present (`package-lock.json`)

## Frameworks

- Astro `^7.3.2` - static site generation, routing, content collections
- Preact `^10.29.8` with `@astrojs/preact` `^6.0.5` - interactive islands (`jsxImportSource`: `preact` in `tsconfig.json`)
- `@astrojs/sitemap` `^3.7.4` - XML sitemap with `en` / `zh` i18n locales (`astro.config.mjs`)
- Vitest `^5.0.0` - unit tests (`vitest.config.ts`, `npm test` → `vitest run`)
- Astro CLI - `astro dev`, `astro build`, `astro preview`
- TypeScript via `astro/tsconfigs/strict`

## Key Dependencies

- `astro` `^7.3.2` - pages, content loaders, Zod schemas via `astro:content` in `src/content.config.ts`
- `preact` / `@astrojs/preact` - client islands for tools
- `@astrojs/sitemap` - production sitemap at site origin `https://example.com`
- No ORM, database client, or HTTP SDK in `package.json`
- Tool logic is in-browser / in-process (`src/lib/` — JSON, JWT decode, base64, URL, hash, regex, timestamp, crontab, color)

## Configuration

- No `.env` files detected
- Site origin and contact are constants in `src/data/site.ts` (`SITE_ORIGIN`, `CONTACT_EMAIL`)
- Ads flag in `src/data/ads.ts` (`ADS_ENABLED = false`)
- Astro `site` and `trailingSlash: 'always'` in `astro.config.mjs`
- `astro.config.mjs` - Preact + sitemap integrations
- `tsconfig.json` - extends `astro/tsconfigs/strict`, Preact JSX
- `vitest.config.ts` - `src/**/*.test.ts`, Node environment

## Platform Requirements

- Node.js 20.19+ or 22.12+
- npm install from `package.json` / `package-lock.json`
- Static output from `astro build` (`dist/`)
- Placeholder canonical host `https://example.com` (`astro.config.mjs`, `src/data/site.ts`)
- No CI/CD config (no `.github/` workflows detected)

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- Pure logic lives in `src/lib/<topic>.ts` with a co-located `src/lib/<topic>.test.ts` (examples: `src/lib/json.ts`, `src/lib/jwt.ts`, `src/lib/base64.ts`).
- Preact tool UIs use PascalCase plus a `Tool` or domain suffix: `src/components/tools/JsonFormatter.tsx`, `src/components/tools/JwtDecoder.tsx`.
- Shared islands/shells: `src/components/ToolShell.tsx`, `src/components/tools/ToolIsland.astro`.
- Astro pages and static components: PascalCase `.astro` (`src/layouts/BaseLayout.astro`, `src/components/Header.astro`).
- Data/config: lowercase plural nouns (`src/data/tools.ts`, `src/data/ads.ts`, `src/data/site.ts`).
- i18n: short names (`src/i18n/locales.ts`, `src/i18n/path.ts`, `src/i18n/ui.ts`, `src/i18n/errors.ts`).
- Tool URL slugs are kebab-case (`json-formatter`, `jwt-decoder`) in `src/data/tools.ts`.
- Use camelCase verbs: `formatJson`, `decodeJwt`, `isTooLarge`, `localizeError`, `localeFromPathname`.
- Registry accessors: `getTool`, `getFeaturedTools`, `getRelatedTools`, `getToolsByCategory` in `src/data/tools.ts`.
- Default-export Preact components as the page island (`export default function JsonFormatter`).
- Named-export shared UI (`export function ToolShell` in `src/components/ToolShell.tsx`).
- camelCase locals (`trimmed`, `labels`, `result`).
- `SCREAMING_SNAKE` for module constants: `INPUT_MAX_CHARS`, `TOOLS`, `LOCALES`, `ZH_ERRORS`.
- Event handlers: `onCopy`, `onInput`.
- Exported `type` / `interface` in PascalCase: `JsonResult`, `Tool`, `ToolCategory`, `Locale`.
- Discriminated unions for parse results: `{ ok: true; ... } | { ok: false; error: string }` (see `src/lib/json.ts`).
- Derive unions from const arrays: `export type Locale = (typeof LOCALES)[number]` in `src/i18n/locales.ts`.

## Code Style

- No Prettier/Biome/ESLint config in the repo root. Match existing files:
- Not detected (no `eslint.config.*`, `.eslintrc*`, or `biome.json`).
- Typecheck via TypeScript with `tsconfig.json` extending `astro/tsconfigs/strict`.
- Preact with `"jsx": "react-jsx"` and `"jsxImportSource": "preact"` in `tsconfig.json`.
- Use Preact class attributes as `class` (not `className`) in `src/components/ToolShell.tsx`.
- Cast DOM events: `(e.target as HTMLTextAreaElement).value`.

## Import Organization

- Not detected. Use relative paths from the file (`../../lib/json`, `../i18n/ui`).
- `"type": "module"` in `package.json`. ESM only.

## Error Handling

- Do not throw from tool parsers. Return a result object:
- Empty input → `{ ok: false, error: '' }` (UI treats empty error as no message).
- Invalid input → English error string (`'Invalid JSON'`, `'Not a JWT'`).
- Size guard in UI, not in parsers: `isTooLarge(input)` in `src/lib/limits.ts` then `tooLarge` copy.
- Localize English error strings in the island via `useToolUi` → `err()` / `localizeError` in `src/i18n/errors.ts`. Add new English keys to `ZH_ERRORS` when adding tools.
- `try/catch` with empty catch when parse fails (`src/lib/json.ts`); never rethrow to the UI.

## Logging

- Surface user-facing issues through `error` props on `ToolShell`, not logs.

## Comments

- Almost no comments in `src/`. Prefer self-explanatory names and tests.
- Do not add narrating comments for obvious control flow.
- Not used. Export types and function names are the documentation.

## Function Design

- Keep `src/lib/*` functions small and pure (single parse/format responsibility).
- Islands: `useState` + `useMemo` over the lib, then render `ToolShell` (see `src/components/tools/JsonFormatter.tsx`).
- Primitive string inputs for libs (`formatJson(input: string)`).
- Locale as a required prop on islands: `{ locale }: { locale: Locale }`.
- Props objects for shells (`ToolShell(props: { error, output, locale, children })`).
- Discriminated `ok` unions for parsers.
- `string | null` for localized errors (`localizeError`).
- `undefined` for missing registry lookups (`getTool`).

## Module Design

- Named exports for libs, data, and i18n.
- Default export only for Preact tool islands.
- Not detected. Import the concrete file (`from '../../lib/json'`), do not add `index.ts` barrels unless a new package boundary appears.
- Static chrome, SEO, and routing: `.astro` under `src/pages/` and `src/components/`.
- Interactive tools: Preact `.tsx` islands; wrap with `src/components/tools/ToolIsland.astro`.

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

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

- All tool computation stays in the browser (`src/lib`); no API routes except `src/pages/robots.txt.ts`.
- Catalog (`TOOLS`) is the source of truth for routing (`getStaticPaths`); markdown is SEO/how-to/FAQ only.
- English is default (unprefixed URLs); Chinese is a parallel `src/pages/zh/` tree.
- Each tool UI is a small Preact component wrapping `ToolShell` and a matching `src/lib` module.

## Layers

- Purpose: File-based routes, static path generation, compose layout + content + island
- Location: `src/pages/`
- Contains: `.astro` pages; one `APIRoute` for robots
- Depends on: layouts, components, `src/data`, `src/i18n`, `astro:content`
- Used by: Astro build / `astro.config.mjs`
- Purpose: HTML document, SEO tags, header/footer
- Location: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`
- Contains: Astro components + `src/styles/global.css`
- Depends on: `src/data/site.ts`, `src/i18n/*`
- Used by: every page
- Purpose: Localized titles, intros, how-to steps, FAQs; optional blog posts
- Location: `src/content/tools/`, `src/content/blog/`, schema in `src/content.config.ts`
- Contains: Markdown with frontmatter; ZH tools under `src/content/tools/zh/`
- Depends on: Astro content collections
- Used by: `src/pages/tools/[slug].astro`, `src/pages/zh/tools/[slug].astro`, blog indexes
- Purpose: Client-side tool UIs
- Location: `src/components/tools/*.tsx`
- Contains: Preact components hydrated with `client:load`
- Depends on: `src/lib/*`, `ToolShell.tsx`, `src/i18n/useToolUi.ts`
- Used by: `ToolIsland.astro`
- Purpose: Pure, testable transforms (format, decode, hash, regex, cron, color)
- Location: `src/lib/`
- Contains: TypeScript modules + colocated `*.test.ts`
- Depends on: Web Crypto / language builtins only
- Used by: Preact tools; Vitest
- Purpose: Locale type, path rewriting, UI strings, English error → ZH map
- Location: `src/i18n/`
- Contains: `locales.ts`, `path.ts`, `ui.ts`, `errors.ts`, `useToolUi.ts`
- Depends on: none (leaf)
- Used by: pages, layout, tools

## Data Flow

### Primary Request Path

### Home / directory

### Blog

- No global store. Each island uses `useState` / `useMemo` in its `.tsx` file.
- Locale is a prop (`Locale`), not React context.
- Ads are compile-time data (`ADS_ENABLED` in `src/data/ads.ts`).

## Key Abstractions

- Purpose: Routing and related-tool graph
- Examples: `src/data/tools.ts`
- Pattern: Static array + getters (`getTool`, `getFeaturedTools`, `getRelatedTools`)
- Purpose: Success vs error without throwing
- Examples: `src/lib/json.ts` (`JsonResult`), similar modules in `src/lib/`
- Pattern: `{ ok: true, ... } | { ok: false, error: string }`
- Purpose: Explicit slug → component mapping (not dynamic import)
- Examples: `src/components/tools/ToolIsland.astro`
- Pattern: Boolean conditions + `client:load`
- Purpose: SSG-friendly i18n without runtime locale detection
- Examples: `src/pages/index.astro` vs `src/pages/zh/index.astro`
- Pattern: Same markup; `const locale = 'en' | 'zh'`
- Purpose: SEO copy separate from catalog
- Examples: `src/content.config.ts`, `src/content/tools/*.md`
- Pattern: Zod schema; `locale` field; ZH files nested in `zh/`

## Entry Points

- Location: `package.json` scripts → `astro dev` / `astro build`
- Triggers: CLI
- Responsibilities: SSG output to `dist/`; sitemap via `@astrojs/sitemap`
- Location: `astro.config.mjs`
- Triggers: Astro
- Responsibilities: `site`, `trailingSlash: 'always'`, Preact + sitemap i18n
- Location: `src/pages/**/*.astro`
- Triggers: Static file server / host
- Responsibilities: Render HTML
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

### ToolIsland exhaustive if-chain

### Mixing SEO copy into `TOOLS`

## Error Handling

- Size guard first: `isTooLarge` → `copy.tooLarge` (`src/lib/limits.ts`, `useToolUi.ts`)
- English error strings in lib; ZH map in `src/i18n/errors.ts`
- Missing tool or markdown throws at build: `throw new Error(\`Unknown tool ${slug}\`)` in `[slug].astro`
- `ToolShell` shows `role="alert"` for errors

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
