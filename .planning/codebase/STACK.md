# Technology Stack

**Analysis Date:** 2026-09-10

## Languages

**Primary:**
- TypeScript 7.x (`typescript` `^7.0.2`) - `src/lib/*.ts`, `src/data/*.ts`, `src/i18n/*.ts`, Vitest files, `src/content.config.ts`, `src/pages/robots.txt.ts`
- Astro (`.astro` templates) - pages, layouts, presentational components under `src/pages/`, `src/layouts/`, `src/components/`

**Secondary:**
- CSS - `src/styles/global.css` plus scoped `<style>` blocks in `.astro` files
- Markdown - content collections in `src/content/blog/` and `src/content/tools/`

## Runtime

**Environment:**
- Node.js `^20.19.0 || >=22.12.0` (required by `@astrojs/compiler-binding` in `package-lock.json`; no `.nvmrc` / `.python-version`)
- ESM (`"type": "module"` in `package.json`)

**Package Manager:**
- npm (lockfileVersion 3)
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- Astro `^7.3.2` - static site generation, routing, content collections
- Preact `^10.29.8` with `@astrojs/preact` `^6.0.5` - interactive islands (`jsxImportSource`: `preact` in `tsconfig.json`)
- `@astrojs/sitemap` `^3.7.4` - XML sitemap with `en` / `zh` i18n locales (`astro.config.mjs`)

**Testing:**
- Vitest `^5.0.0` - unit tests (`vitest.config.ts`, `npm test` → `vitest run`)

**Build/Dev:**
- Astro CLI - `astro dev`, `astro build`, `astro preview`
- TypeScript via `astro/tsconfigs/strict`

## Key Dependencies

**Critical:**
- `astro` `^7.3.2` - pages, content loaders, Zod schemas via `astro:content` in `src/content.config.ts`
- `preact` / `@astrojs/preact` - client islands for tools
- `@astrojs/sitemap` - production sitemap at site origin `https://example.com`

**Infrastructure:**
- No ORM, database client, or HTTP SDK in `package.json`
- Tool logic is in-browser / in-process (`src/lib/` — JSON, JWT decode, base64, URL, hash, regex, timestamp, crontab, color)

## Configuration

**Environment:**
- No `.env` files detected
- Site origin and contact are constants in `src/data/site.ts` (`SITE_ORIGIN`, `CONTACT_EMAIL`)
- Ads flag in `src/data/ads.ts` (`ADS_ENABLED = false`)
- Astro `site` and `trailingSlash: 'always'` in `astro.config.mjs`

**Build:**
- `astro.config.mjs` - Preact + sitemap integrations
- `tsconfig.json` - extends `astro/tsconfigs/strict`, Preact JSX
- `vitest.config.ts` - `src/**/*.test.ts`, Node environment

## Platform Requirements

**Development:**
- Node.js 20.19+ or 22.12+
- npm install from `package.json` / `package-lock.json`

**Production:**
- Static output from `astro build` (`dist/`)
- Placeholder canonical host `https://example.com` (`astro.config.mjs`, `src/data/site.ts`)
- No CI/CD config (no `.github/` workflows detected)

---

*Stack analysis: 2026-09-10*
