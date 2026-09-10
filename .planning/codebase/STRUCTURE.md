# Codebase Structure

**Analysis Date:** 2026-09-10

## Directory Layout

```
海外练手项目/                 # Devtoolbox Astro site
├── astro.config.mjs          # Site URL, trailingSlash, Preact, sitemap i18n
├── package.json              # Scripts: dev, build, preview, test
├── tsconfig.json             # astro/tsconfigs/strict + Preact jsxImportSource
├── .gitignore                # node_modules, dist, .astro
├── docs/superpowers/         # Specs and plans (not runtime)
│   ├── specs/
│   └── plans/
├── src/
│   ├── pages/                # File-based routes (EN default)
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   ├── 404.astro
│   │   ├── robots.txt.ts
│   │   ├── blog/index.astro
│   │   ├── tools/index.astro
│   │   ├── tools/[slug].astro
│   │   └── zh/               # Parallel ZH routes
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/           # Astro chrome + Preact tools
│   │   ├── tools/            # Islands + ToolIsland.astro
│   │   └── *.astro / ToolShell.tsx
│   ├── lib/                  # Pure tool logic + *.test.ts
│   ├── data/                 # Catalog, site, ads
│   ├── i18n/                 # Locales, paths, copy, errors
│   ├── content/
│   │   ├── blog/             # Optional markdown posts
│   │   └── tools/            # EN md + zh/ subdirectory
│   ├── content.config.ts     # Collection schemas
│   └── styles/global.css
├── dist/                     # Build output (gitignored)
└── .astro/                   # Generated types (gitignored)
```

## Directory Purposes

**src/pages:**
- Purpose: Routes. English at root; Chinese under `zh/`.
- Contains: `.astro` pages and `robots.txt.ts`
- Key files: `src/pages/tools/[slug].astro`, `src/pages/zh/tools/[slug].astro`

**src/layouts:**
- Purpose: Shared HTML shell
- Contains: `BaseLayout.astro`
- Key files: `src/layouts/BaseLayout.astro`

**src/components:**
- Purpose: Presentational Astro + interactive Preact
- Contains: Header, Footer, ToolCard, FaqList, RelatedTools, AdSlot, LangSwitch, ToolShell, `tools/`
- Key files: `src/components/tools/ToolIsland.astro`, `src/components/ToolShell.tsx`

**src/lib:**
- Purpose: Browser-local algorithms; unit tests colocated
- Contains: `json.ts`, `jwt.ts`, `base64.ts`, `url.ts`, `hash.ts`, `regex.ts`, `timestamp.ts`, `crontab.ts`, `color.ts`, `limits.ts` and matching `*.test.ts`
- Key files: `src/lib/limits.ts` (shared input cap)

**src/data:**
- Purpose: Static config (not secrets)
- Contains: `tools.ts`, `site.ts`, `ads.ts`
- Key files: `src/data/tools.ts`

**src/i18n:**
- Purpose: Locale typing and copy
- Contains: `locales.ts`, `path.ts`, `ui.ts`, `errors.ts`, `useToolUi.ts`, `path.test.ts`
- Key files: `src/i18n/ui.ts`, `src/i18n/path.ts`

**src/content:**
- Purpose: Markdown collections
- Contains: `tools/*.md`, `tools/zh/*.md`, `blog/`
- Key files: `src/content.config.ts`

**docs/superpowers:**
- Purpose: Design spec and implementation plan
- Contains: Markdown only
- Key files: `docs/superpowers/specs/2026-09-10-devtoolbox-design.md`

## Key File Locations

**Entry Points:**
- `astro.config.mjs`: Astro config
- `src/pages/index.astro`: English home
- `src/pages/zh/index.astro`: Chinese home
- `src/pages/tools/[slug].astro`: English tool page
- `src/pages/robots.txt.ts`: robots + sitemap URL

**Configuration:**
- `package.json`: dependencies and scripts
- `tsconfig.json`: TypeScript + JSX
- `src/content.config.ts`: `blog` and `toolPages` collections
- `src/data/site.ts`: `SITE_ORIGIN` (must match `astro.config.mjs` `site`)

**Core Logic:**
- `src/data/tools.ts`: catalog and `getStaticPaths` source
- `src/lib/*.ts`: processing
- `src/components/tools/*.tsx`: UI islands
- `src/i18n/path.ts`: URL localization

**Testing:**
- Colocated `src/lib/*.test.ts`, `src/data/tools.test.ts`, `src/i18n/path.test.ts`
- Runner: Vitest via `npm test` (`package.json`)

## Naming Conventions

**Files:**
- Astro pages: lowercase or `[slug].astro` matching route
- Preact tools: PascalCase matching purpose (`JsonFormatter.tsx`, `JwtDecoder.tsx`)
- Lib modules: kebab-free lowercase (`json.ts`, `crontab.ts`)
- Tests: `{module}.test.ts` next to source
- Content: `{slug}.md` matching `Tool.slug`

**Directories:**
- `src/pages/zh/` mirrors English routes
- `src/content/tools/zh/` holds ZH markdown (ids end with `/slug`)
- `src/components/tools/` for islands only

**Identifiers:**
- Tool slugs: kebab-case (`json-formatter`, `unix-timestamp`)
- Categories: PascalCase union in `src/data/tools.ts` (`Format`, `Auth`, …)
- Locale type: `'en' | 'zh'` from `src/i18n/locales.ts`

## Where to Add New Code

**New Feature (new developer tool):**
- Catalog entry: `src/data/tools.ts` (`TOOLS` + related slugs)
- Lib: `src/lib/{name}.ts` and `src/lib/{name}.test.ts`
- Island: `src/components/tools/{PascalName}.tsx` using `ToolShell` + `useToolUi`
- Register: branch in `src/components/tools/ToolIsland.astro`
- SEO markdown: `src/content/tools/{slug}.md` and `src/content/tools/zh/{slug}.md` (schema in `src/content.config.ts`)
- UI labels: `src/i18n/ui.ts` (`copy.tools[slug]`)
- Error ZH map if new English errors: `src/i18n/errors.ts`
- Routes: no new page files if using existing `[slug].astro`

**New marketing / legal page:**
- English: `src/pages/{name}.astro`
- Chinese: `src/pages/zh/{name}.astro`
- Wrap with `BaseLayout`; pass `path` without locale prefix
- Link from `src/components/Header.astro` / `Footer.astro` if needed

**New Component/Module:**
- Static chrome: `src/components/{Name}.astro`
- Shared interactive chrome: `src/components/{Name}.tsx`
- Tool-specific: `src/components/tools/`

**Utilities:**
- Shared helpers: `src/lib/`
- Path/locale helpers: `src/i18n/`
- Site-wide constants: `src/data/`

**New blog post:**
- Add `src/content/blog/{id}.md` with `title`, `description`, `pubDate`
- Listed by `src/pages/blog/index.astro` (EN links `/blog/{id}/`; add ZH listing separately if needed)

## Special Directories

**.planning/codebase:**
- Purpose: GSD architecture maps consumed by later commands
- Generated: Written by map-codebase agents
- Committed: Yes (project planning)

**docs/superpowers:**
- Purpose: Specs and plans
- Generated: No
- Committed: Yes

**dist/ and .astro/:**
- Purpose: Build artifacts and generated types
- Generated: Yes
- Committed: No (`.gitignore`)

**node_modules/:**
- Purpose: npm packages
- Generated: Yes
- Committed: No

**public/:**
- Purpose: Not present — no static assets directory yet
- Generated: No
- Committed: N/A — create `public/` at repo root for favicons/static files if needed

---

*Structure analysis: 2026-09-10*
