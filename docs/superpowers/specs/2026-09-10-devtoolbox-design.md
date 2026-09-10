# Devtoolbox v1 Design

Date: 2026-09-10  
Status: Draft for user review  
Working name: Devtoolbox (brand and domain are not locked; architecture does not depend on the name)

## 1. Goal

Build a free, English-language developer toolbox site for overseas users. Monetization is display ads later; v1 ships without live ad scripts.

Success for v1 is a live site on a real domain with HTTPS, 10 SEO-ready tool pages, home + tool index, a blog route stub, legal/about pages, ad-slot placeholders, and static sitemap/robots. Analytics, AdSense approval, and blog posts are out of scope.

Primary user: developers and indie hackers who need a quick, local, no-upload utility (JSON, JWT, Base64, regex, timestamps, crontab, hashes, UUIDs, colors).

## 2. Constraints (locked)

- One person, practice project, shippable.
- All tool computation runs in the browser. Nothing is uploaded. No application server, no database, no accounts.
- Existing overseas VPS is used only to host static files (Nginx + HTTPS).
- Blog structure is reserved; no articles in v1.
- Ad slots exist as placeholders; real ad network code is a later switch, not a v1 requirement.
- English-only. Dark theme only. No i18n, no theme toggle.

## 3. Approach

Astro static site. Each URL is a real HTML page. Tool interactivity is a small Preact island (not React). `astro build` emits `dist/`. Deploy with rsync of `dist/` to the VPS. Nginx serves `dist/`.

Rejected:

- Next.js: heavier than needed for a content/tool site with no app backend.
- SPA (Vite + client router): weak default indexing for per-tool URLs, which is the traffic model.

## 4. Information architecture

| Path | Role |
|---|---|
| `/` | Category entry + 6 featured tools |
| `/tools/` | Full directory of all 10 tools |
| `/tools/{slug}/` | One tool. Main SEO and ad surface |
| `/blog/` | Empty list + “Coming soon”. Template and collection exist |
| `/about/` | What the site is, who it is for, contact email |
| `/privacy/` | Local processing, no accounts, no uploads, no analytics/ads in v1 |
| `/terms/` | Free, as-is, no warranty on results |
| `/404` | Site chrome + short message + link to `/tools/` |
| `/sitemap.xml` | Generated at build from the tool registry + static pages |
| `/robots.txt` | Allow all; point to sitemap |

Canonical host is one of www or apex, never both. Redirect the other to the canonical host. Every page sets `<link rel="canonical">` to that host.

Footer on every page: Privacy, Terms, About, and the line “Runs in your browser.”

## 5. v1 tool list

Exactly 10 tools. Adding or removing one is a spec change.

| Slug | Name | Category |
|---|---|---|
| `json-formatter` | JSON Formatter / Validator | Format |
| `jwt-decoder` | JWT Decoder | Auth |
| `base64` | Base64 Encode / Decode | Encode |
| `url-encode` | URL Encode / Decode | Encode |
| `hash-generator` | Hash Generator (SHA-256, SHA-1) | Generate |
| `uuid-generator` | UUID Generator | Generate |
| `regex-tester` | Regex Tester | Text |
| `unix-timestamp` | Unix Timestamp Converter | Time |
| `crontab-explainer` | Crontab Explainer | Time |
| `color-converter` | Hex / RGB / HSL Converter | Color |

Not in v1: PDF/image conversion, code execution sandbox, URL fetching, OG image generation, MD5 (omit rather than add a weak-hash footgun).

### 5.1 Tool behavior rules

- **JSON:** format and validate. Invalid JSON shows an inline error. Does not evaluate JS.
- **JWT:** decode header and payload only. No signature verification, no JWKS. Copy on the page: decoding is not verification.
- **Base64 / URL:** encode and decode; mode is an explicit toggle.
- **Hash:** Web Crypto only. Algorithms: SHA-256 and SHA-1. Input is text (UTF-8). Output hex.
- **UUID:** generate v4 via `crypto.randomUUID()`. Button to generate another. No bulk thousands-at-once.
- **Regex:** pattern + flags + test string; show match/groups. Uses browser `RegExp`. No ReDoS hard timeout. FAQ states it is for typical test strings, not untrusted production workloads.
- **Unix timestamp:** seconds and milliseconds; convert to/from UTC ISO display. Invalid numbers inline-error.
- **Crontab:** five-field expressions only (minute hour day-of-month month day-of-week). Explain in English. Six-field, seven-field, and named macros (`@daily`, etc.) show an inline error.
- **Color:** convert among hex, RGB, HSL. Invalid color inline-error.

Shared limits: if input exceeds 100,000 characters, do not process; show “Input too large to process in the browser.” Do not silently truncate.

Errors stay inside the tool panel. No toasts, no redirects, no `alert()`.

## 6. Tool page template

Every `/tools/{slug}/` page uses the same template, in this order:

1. Unique `title`, `meta description`, canonical URL.
2. H1 + two-sentence explanation, including that data stays local.
3. Top `AdSlot` (placeholder in v1).
4. Tool island: input, options, output, Copy.
5. How to use (exactly 3 steps).
6. FAQ (3–5 questions aimed at search phrasing).
7. Related tools (from registry `relatedSlugs`, not hardcoded per page).
8. Bottom `AdSlot` (placeholder in v1).

How-to and FAQ live with the tool (Markdown frontmatter or a colocated content module). They are not blog posts.

Home does not dump all 10 cards above the fold. Home: short positioning line, category links, the six registry entries with `featured: true`. `/tools/` is the complete list, grouped by category. Exactly six entries are featured; which six is an implementation choice as long as JSON Formatter and JWT Decoder are included.

## 7. Data and components

Single registry: `src/data/tools.ts`.

Each entry includes at least: `slug`, `name`, `category`, `shortDescription`, `relatedSlugs`, `featured`.

Home, `/tools/`, related tools, and sitemap read this file. A new tool is: one registry row + one island component + one content file (how-to/FAQ/meta). No router changes.

Layers:

- **Layout:** header, footer, `AdSlot` positions. Used by tools and static pages.
- **Tool page template:** the eight blocks above. No calculation code.
- **Tool island:** one component per tool, hydrated with `client:load`. Only I/O and compute.

Shared UI, and only these: `ToolShell` (input/output/Copy layout), `AdSlot`, `FaqList`, `RelatedTools`.

`AdSlot` reads a config flag (env or `src/data/ads.ts`). v1 default: dashed placeholder labeled “Ad”, fluid sizes approximating 728×90 (top) and 300×250 (mid/bottom). When ads go live later, only `AdSlot` changes.

`/blog/` is an Astro content collection. v1 has zero posts. The route must render the empty state, not 404.

## 8. Visual and copy

- English, dark, documentation-like. Narrow reading column. Monospace for input/output.
- Neutral dark gray background. One accent (teal or blue) for links, focus, and Copy.
- Header: logo, Tools, Blog, About. No Login, Pricing, or trial CTAs.
- Tool workspace is a distinct panel. Desktop: input/output split or stacked; mobile: stacked.
- Ad placeholders must not reflow the tool when later replaced with real units of the same approximate size.
- Recurring line on tool pages: “Runs locally in your browser. Nothing is uploaded.”

## 9. Build, deploy, Nginx

- `astro build` → `dist/`. v1 has no required runtime env vars. Ad flag defaults to placeholder.
- Preview: `astro dev`.
- Deploy: build locally, rsync `dist/` to the VPS. No CI, no Docker in v1.
- Nginx: document root = `dist/`; TLS (Let’s Encrypt); HTTP→HTTPS; non-canonical host → canonical host.
- Caching: HTML short or no cache; hashed JS/CSS long cache.
- Headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. CSP stays loose in v1 so a later ad script is not blocked by a too-tight policy; tighten when ads are added.
- `sitemap.xml` and `robots.txt` are build outputs, not hand-edited on the server.

## 10. Privacy, terms, ads review posture

v1 ships `/privacy/`, `/terms/`, `/about/` because ad networks later check that these exist and that the site is not an empty shell.

Privacy must state, in plain English:

- Tools run locally in the browser.
- No accounts.
- No file or text uploads to our server.
- v1 loads no analytics and no ad network.
- If ads or analytics are added, this page will be updated.

About must include a reachable contact email (`hello@<domain>` or equivalent).

No live ad script and no analytics script in v1.

## 11. Testing (v1)

Manual only:

- Each tool: happy path, empty input, invalid input (bad JSON, bad JWT, invalid regex, invalid crontab, invalid color).
- Over-limit input shows the large-input message.
- With JS disabled, title, H1, how-to, and FAQ still present on tool pages (islands may be inert).
- After build, each tool has its own `dist/tools/{slug}/index.html`.
- After deploy: HTTPS, host redirect, sitemap fetches, 404 page.

No E2E suite, no visual regression, no coverage target.

Regex tester ships with 3–5 fixture examples in FAQ or comments (e.g. email-like pattern, capturing groups, invalid pattern) as the acceptance set.

## 12. Out of scope (v1)

- Auth, database, APIs, file upload
- Live ads, analytics, email capture
- Blog articles, i18n, light theme
- CI/CD, Docker, automated test suite
- Server-side tools

Later (not v1): AdSense or equivalent, Plausible/Umami, a handful of English guides, 5–10 more client-side tools in the same registry pattern.

## 13. Delivery shape

Astro app lives at repo root `G:\海外练手项目` (not a `web/` subfolder).

v1 is done when the 10 tools work locally in the browser, the IA routes exist, legal pages exist, placeholders and sitemap exist, and the site is servable as static files behind Nginx on the VPS.
