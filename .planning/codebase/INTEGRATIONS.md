# External Integrations

**Analysis Date:** 2026-09-10

## APIs & External Services

**Fonts (CDN):**
- Google Fonts - IBM Plex Mono, IBM Plex Sans, Syne loaded in `src/layouts/BaseLayout.astro`
  - SDK/Client: `<link>` to `https://fonts.googleapis.com` / `https://fonts.gstatic.com`
  - Auth: none

**Advertising:**
- Placeholder ad slots only (`src/components/AdSlot.astro`, `src/data/ads.ts`)
  - SDK/Client: none (no AdSense / GAM script)
  - Auth: none
  - `ADS_ENABLED` is `false`; UI shows a dashed “Ad” placeholder

**Product APIs:**
- None. Developer tools run locally in the browser (`src/lib/*`). Tagline in `src/data/site.ts`: nothing is uploaded.

## Data Storage

**Databases:**
- Not applicable
  - Connection: none
  - Client: none
  - Content is Markdown + TypeScript data (`src/content/`, `src/data/tools.ts`)

**File Storage:**
- Local filesystem only (source Markdown, static `dist/` after build)

**Caching:**
- None (no Redis/CDN config in-repo; host-level caching not defined)

## Authentication & Identity

**Auth Provider:**
- None
  - Implementation: public static pages; no sessions, OAuth, or cookies for identity

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- Default Astro/Node console during `astro dev` / `astro build`; no logging SDK

## CI/CD & Deployment

**Hosting:**
- Not configured. `site` is `https://example.com` in `astro.config.mjs`

**CI Pipeline:**
- None (no `.github/workflows` or other CI configs detected)

## Environment Configuration

**Required env vars:**
- None in code (no `import.meta.env` / `process.env` usage under `src/` except unused pattern search)

**Secrets location:**
- Not applicable — no `.env` files detected; do not add secrets to git

**Public constants (not secrets):**
- `SITE_ORIGIN` / `CONTACT_EMAIL` in `src/data/site.ts`

## Webhooks & Callbacks

**Incoming:**
- None (only `GET` for `src/pages/robots.txt.ts` returning sitemap URL)

**Outgoing:**
- None
- Sitemap generation via `@astrojs/sitemap` at build time (`astro.config.mjs`)
- `robots.txt` points crawlers at `sitemap-index.xml` (`src/pages/robots.txt.ts`)

---

*Integration audit: 2026-09-10*
