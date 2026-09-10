# Devtoolbox

Browser-based developer tools. Formatting, encoding, hashing, and conversion run locally in the page. Nothing is uploaded.

v1 ships ten tools, a tools index, about/privacy/terms, an empty blog stub, sitemap, and robots.txt.

## Setup

```bash
npm install
```

## Test

```bash
npm test
```

Runs Vitest against `src/**/*.test.ts`.

## Develop

```bash
npm run dev
```

## Build

```bash
npm run build
```

Output is static HTML in `dist/` (trailing-slash directories, hashed assets under `/_astro/`).

## Deploy

Set the canonical HTTPS origin in both places **before production**. They must match:

- `SITE_ORIGIN` in `src/data/site.ts`
- `site` in `astro.config.mjs`

Nginx sample (apex canonical, www → apex, immutable `/_astro/`, HTML `no-cache`): `nginx/devtoolbox.conf.example`.

```bash
npx astro build
rsync -av --delete dist/ user@example.com:/var/www/devtoolbox/
```

Copy the sample server config onto the host, replace `example.com`, certificate paths, and `root`. Reload Nginx.

v1 does not include Docker or CI.

## Out of scope (v1)

- Ads (slots exist; `ADS_ENABLED` stays off)
- Analytics
- Accounts
