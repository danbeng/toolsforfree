# Devtoolbox v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a static English developer toolbox (10 in-browser tools) as Astro HTML pages with Preact islands, ad placeholders, legal pages, an empty blog route, sitemap/robots, and an Nginx sample for the overseas VPS.

**Architecture:** One Astro static app at repo root. `src/data/tools.ts` is the only tool registry. Each tool is a Preact island plus a Markdown content file; `src/pages/tools/[slug].astro` is the only tool route. Computation lives in `src/lib/*` (unit-tested). Nginx serves `dist/`. No database, no API, no accounts.

**Tech Stack:** Astro (static), Preact islands, TypeScript, `@astrojs/sitemap`, Vitest for `src/lib` and registry helpers only.

**Spec:** `docs/superpowers/specs/2026-09-10-devtoolbox-design.md`

## Global Constraints

- Astro app at repo root `G:\海外练手项目` (not a `web/` folder).
- All tool computation runs in the browser. Nothing is uploaded. No application server, no database, no accounts.
- Preact islands only (not React). Hydrate with `client:load`.
- English-only. Dark theme only. No i18n, no theme toggle.
- Exactly 10 tools; adding or removing one is a spec change.
- Shared input limit: 100,000 characters; over-limit message is exactly `Input too large to process in the browser.` Do not silently truncate.
- Errors stay inside the tool panel. No toasts, no redirects, no `alert()`.
- Recurring tool-page line: `Runs locally in your browser. Nothing is uploaded.`
- Header: logo, Tools, Blog, About. No Login, Pricing, or trial CTAs.
- Footer: Privacy, Terms, About, and `Runs in your browser.`
- Trailing slashes always (`/tools/{slug}/`).
- v1: no live ads, no analytics, no CI, no Docker, no E2E suite.
- Page/SEO checks are manual per spec. Vitest covers pure functions in `src/lib` and registry helpers only.
- Featured tools: exactly six `featured: true` entries; must include `json-formatter` and `jwt-decoder`. This plan uses: `json-formatter`, `jwt-decoder`, `regex-tester`, `hash-generator`, `unix-timestamp`, `crontab-explainer`.
- Contact email until a real domain exists: `hello@example.com`. Canonical origin until deploy: `https://example.com` (replace both in `src/data/site.ts` and `astro.config.mjs` `site` before production).

---

## File map

```
package.json
astro.config.mjs
tsconfig.json
vitest.config.ts
.gitignore
README.md
nginx/devtoolbox.conf.example
src/data/site.ts
src/data/ads.ts
src/data/tools.ts
src/lib/limits.ts
src/lib/json.ts
src/lib/jwt.ts
src/lib/base64.ts
src/lib/url.ts
src/lib/hash.ts
src/lib/regex.ts
src/lib/timestamp.ts
src/lib/crontab.ts
src/lib/color.ts
src/styles/global.css
src/layouts/BaseLayout.astro
src/components/Header.astro
src/components/Footer.astro
src/components/AdSlot.astro
src/components/FaqList.astro
src/components/RelatedTools.astro
src/components/ToolCard.astro
src/components/ToolShell.tsx
src/components/tools/ToolIsland.astro
src/components/tools/JsonFormatter.tsx
src/components/tools/JwtDecoder.tsx
src/components/tools/Base64Tool.tsx
src/components/tools/UrlEncode.tsx
src/components/tools/HashGenerator.tsx
src/components/tools/UuidGenerator.tsx
src/components/tools/RegexTester.tsx
src/components/tools/UnixTimestamp.tsx
src/components/tools/CrontabExplainer.tsx
src/components/tools/ColorConverter.tsx
src/content.config.ts
src/content/blog/.gitkeep
src/content/tools/*.md          (10 files, ids match slugs)
src/pages/index.astro
src/pages/tools/index.astro
src/pages/tools/[slug].astro
src/pages/blog/index.astro
src/pages/about.astro
src/pages/privacy.astro
src/pages/terms.astro
src/pages/404.astro
src/pages/robots.txt.ts
src/lib/*.test.ts               (colocated or src/lib/__tests__)
```

---

### Task 1: Scaffold Astro + Preact + Vitest + git

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `src/pages/index.astro`
- Test: none yet (smoke: `npm test` and `npm run build` must succeed after Task 1)

**Interfaces:**
- Consumes: nothing
- Produces: runnable Astro app at repo root; `npm test` runs Vitest; `site` in config is `https://example.com`; `trailingSlash: 'always'`

- [ ] **Step 1: Initialize git if missing**

```bash
cd "G:/海外练手项目"
git status || git init
```

Expected: a git repo. Keep existing `docs/` files.

- [ ] **Step 2: Write `.gitignore`**

```
node_modules/
dist/
.astro/
.DS_Store
*.log
```

- [ ] **Step 3: Write `package.json`**

```json
{
  "name": "devtoolbox",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 4: Install dependencies**

```bash
npm install astro @astrojs/preact @astrojs/sitemap preact
npm install -D typescript vitest
```

Do not add React. If `npm create astro` is used instead, it must target `.` (repo root) and must not delete `docs/`. Prefer the explicit `npm install` above plus the files in this task.

- [ ] **Step 5: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  trailingSlash: 'always',
  integrations: [preact(), sitemap()],
});
```

- [ ] **Step 6: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 7: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 8: Write stub `src/pages/index.astro`**

```astro
---
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Devtoolbox</title>
  </head>
  <body>
    <p>Devtoolbox</p>
  </body>
</html>
```

- [ ] **Step 9: Smoke**

Run: `npm test`  
Expected: PASS (0 tests) or Vitest “no test files” exit 0. If Vitest exits 1 on zero files, add `src/lib/limits.test.ts` in Task 3; do not add dummy tests here.

Run: `npx astro build`  
Expected: `dist/index.html` exists.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts .gitignore src/pages/index.astro
git commit -m "chore: scaffold Astro, Preact, and Vitest"
```

---

### Task 2: Site chrome — tokens, layout, header, footer

**Files:**
- Create: `src/data/site.ts`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`
- Modify: `src/pages/index.astro` to use `BaseLayout`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `src/data/site.ts` exports:
    - `SITE_NAME = 'Devtoolbox'`
    - `SITE_ORIGIN = 'https://example.com'`
    - `CONTACT_EMAIL = 'hello@example.com'`
    - `SITE_TAGLINE = 'Browser-based developer tools. Nothing is uploaded.'`
  - `BaseLayout` props: `{ title: string; description: string; path: string }` where `path` is pathname with trailing slash (e.g. `/about/`). Sets `<html lang="en">`, canonical `${SITE_ORIGIN}${path}`, dark body class.

- [ ] **Step 1: Write `src/data/site.ts`**

```ts
export const SITE_NAME = 'Devtoolbox';
export const SITE_ORIGIN = 'https://example.com';
export const CONTACT_EMAIL = 'hello@example.com';
export const SITE_TAGLINE =
  'Browser-based developer tools. Nothing is uploaded.';
```

- [ ] **Step 2: Write `src/styles/global.css`**

Use these tokens (one accent: teal):

```css
:root {
  color-scheme: dark;
  --bg: #121417;
  --panel: #1a1d21;
  --text: #e8eaed;
  --muted: #9aa0a6;
  --border: #2a2f36;
  --accent: #2dd4bf;
  --danger: #f87171;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --sans: "Segoe UI", system-ui, sans-serif;
  --content: 52rem;
}

* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--sans); }
a { color: var(--accent); }
a:focus-visible, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.wrap { max-width: var(--content); margin: 0 auto; padding: 0 1rem; }
header.site, footer.site { border-color: var(--border); }
header.site { border-bottom: 1px solid var(--border); }
footer.site { border-top: 1px solid var(--border); margin-top: 3rem; padding: 1.5rem 0 2.5rem; color: var(--muted); font-size: 0.9rem; }
.nav { display: flex; gap: 1.25rem; align-items: center; min-height: 3.25rem; }
.nav a.logo { color: var(--text); text-decoration: none; font-weight: 650; }
.nav-links { display: flex; gap: 1rem; margin-left: auto; }
.nav-links a { color: var(--text); text-decoration: none; }
.nav-links a:hover { color: var(--accent); }
```

Do not add a light-theme block.

- [ ] **Step 3: Write `src/components/Header.astro`**

```astro
---
import { SITE_NAME } from '../data/site';
---
<header class="site">
  <nav class="wrap nav">
    <a class="logo" href="/">{SITE_NAME}</a>
    <div class="nav-links">
      <a href="/tools/">Tools</a>
      <a href="/blog/">Blog</a>
      <a href="/about/">About</a>
    </div>
  </nav>
</header>
```

No Login, Pricing, or trial links.

- [ ] **Step 4: Write `src/components/Footer.astro`**

```astro
---
import { SITE_NAME } from '../data/site';
---
<footer class="site">
  <div class="wrap">
    <p>
      <a href="/privacy/">Privacy</a> ·
      <a href="/terms/">Terms</a> ·
      <a href="/about/">About</a>
    </p>
    <p>Runs in your browser.</p>
    <p>© {new Date().getFullYear()} {SITE_NAME}</p>
  </div>
</footer>
```

- [ ] **Step 5: Write `src/layouts/BaseLayout.astro`**

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { SITE_NAME, SITE_ORIGIN } from '../data/site';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  path: string;
}

const { title, description, path } = Astro.props;
const canonical = new URL(path, SITE_ORIGIN).href;
const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
  </head>
  <body>
    <Header />
    <main class="wrap">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 6: Point home at the layout**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE_NAME, SITE_TAGLINE } from '../data/site';
---
<BaseLayout title={SITE_NAME} description={SITE_TAGLINE} path="/">
  <h1>{SITE_NAME}</h1>
  <p>{SITE_TAGLINE}</p>
</BaseLayout>
```

- [ ] **Step 7: Manual check**

Run: `npx astro dev`  
Open `/` — dark page, header Tools/Blog/About, footer Privacy/Terms/About and “Runs in your browser.”

- [ ] **Step 8: Commit**

```bash
git add src/data/site.ts src/styles/global.css src/layouts/BaseLayout.astro src/components/Header.astro src/components/Footer.astro src/pages/index.astro
git commit -m "feat: add dark layout, header, and footer"
```

---

### Task 3: Registry, ads flag, AdSlot, input limit

**Files:**
- Create: `src/data/tools.ts`, `src/data/ads.ts`, `src/components/AdSlot.astro`, `src/lib/limits.ts`, `src/lib/limits.test.ts`, `src/data/tools.test.ts`
- Test: `src/lib/limits.test.ts`, `src/data/tools.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
```ts
export type ToolCategory =
  | 'Format'
  | 'Auth'
  | 'Encode'
  | 'Generate'
  | 'Text'
  | 'Time'
  | 'Color';

export interface Tool {
  slug: string;
  name: string;
  category: ToolCategory;
  shortDescription: string;
  relatedSlugs: string[];
  featured: boolean;
}

export const TOOLS: Tool[];
export function getTool(slug: string): Tool | undefined;
export function getFeaturedTools(): Tool[];
export function getToolsByCategory(): { category: ToolCategory; tools: Tool[] }[];
export function getRelatedTools(slug: string): Tool[];
```

```ts
// src/data/ads.ts
export const ADS_ENABLED = false;
export type AdSlotSize = 'leaderboard' | 'rectangle';
```

```ts
// src/lib/limits.ts
export const INPUT_MAX_CHARS = 100_000;
export const INPUT_TOO_LARGE_MSG =
  'Input too large to process in the browser.';
export function isTooLarge(input: string): boolean;
```

`AdSlot` props: `{ size: AdSlotSize }`. When `ADS_ENABLED` is false, render a dashed placeholder labeled `Ad`. Leaderboard: CSS `min-height: 90px; width: 100%; max-width: 728px`. Rectangle: `min-height: 250px; width: 100%; max-width: 300px`. Reserve those heights so later real units do not reflow.

- [ ] **Step 1: Write failing `src/lib/limits.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { INPUT_MAX_CHARS, isTooLarge } from './limits';

describe('isTooLarge', () => {
  it('is false at the limit', () => {
    expect(isTooLarge('a'.repeat(INPUT_MAX_CHARS))).toBe(false);
  });
  it('is true over the limit', () => {
    expect(isTooLarge('a'.repeat(INPUT_MAX_CHARS + 1))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/limits.test.ts`  
Expected: FAIL (cannot find module `./limits`)

- [ ] **Step 3: Write `src/lib/limits.ts`**

```ts
export const INPUT_MAX_CHARS = 100_000;
export const INPUT_TOO_LARGE_MSG =
  'Input too large to process in the browser.';

export function isTooLarge(input: string): boolean {
  return input.length > INPUT_MAX_CHARS;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/limits.test.ts`  
Expected: PASS

- [ ] **Step 5: Write failing `src/data/tools.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import {
  TOOLS,
  getFeaturedTools,
  getRelatedTools,
  getTool,
  getToolsByCategory,
} from './tools';

describe('TOOLS registry', () => {
  it('has exactly 10 tools', () => {
    expect(TOOLS).toHaveLength(10);
  });

  it('uses unique slugs', () => {
    const slugs = TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('features exactly six tools including json-formatter and jwt-decoder', () => {
    const featured = getFeaturedTools();
    expect(featured).toHaveLength(6);
    expect(featured.map((t) => t.slug)).toEqual(
      expect.arrayContaining(['json-formatter', 'jwt-decoder']),
    );
  });

  it('resolves related tools from slugs', () => {
    const related = getRelatedTools('json-formatter');
    expect(related.every((t) => t.slug !== 'json-formatter')).toBe(true);
    expect(related.length).toBeGreaterThan(0);
  });

  it('getTool returns undefined for unknown slugs', () => {
    expect(getTool('nope')).toBeUndefined();
  });

  it('groups by category without dropping tools', () => {
    const grouped = getToolsByCategory();
    const count = grouped.reduce((n, g) => n + g.tools.length, 0);
    expect(count).toBe(10);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run src/data/tools.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 7: Write `src/data/tools.ts`**

Use this exact list (related slugs must exist in the table):

```ts
export type ToolCategory =
  | 'Format'
  | 'Auth'
  | 'Encode'
  | 'Generate'
  | 'Text'
  | 'Time'
  | 'Color';

export interface Tool {
  slug: string;
  name: string;
  category: ToolCategory;
  shortDescription: string;
  relatedSlugs: string[];
  featured: boolean;
}

export const TOOLS: Tool[] = [
  {
    slug: 'json-formatter',
    name: 'JSON Formatter / Validator',
    category: 'Format',
    shortDescription: 'Format and validate JSON in your browser.',
    relatedSlugs: ['base64', 'jwt-decoder', 'regex-tester'],
    featured: true,
  },
  {
    slug: 'jwt-decoder',
    name: 'JWT Decoder',
    category: 'Auth',
    shortDescription: 'Decode a JWT header and payload locally. Not verification.',
    relatedSlugs: ['base64', 'json-formatter', 'hash-generator'],
    featured: true,
  },
  {
    slug: 'base64',
    name: 'Base64 Encode / Decode',
    category: 'Encode',
    shortDescription: 'Encode or decode Base64 without uploading data.',
    relatedSlugs: ['url-encode', 'jwt-decoder', 'hash-generator'],
    featured: false,
  },
  {
    slug: 'url-encode',
    name: 'URL Encode / Decode',
    category: 'Encode',
    shortDescription: 'Percent-encode or decode URL components.',
    relatedSlugs: ['base64', 'json-formatter'],
    featured: false,
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    category: 'Generate',
    shortDescription: 'SHA-256 and SHA-1 hashes via Web Crypto.',
    relatedSlugs: ['uuid-generator', 'base64', 'jwt-decoder'],
    featured: true,
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    category: 'Generate',
    shortDescription: 'Generate a UUID v4 in your browser.',
    relatedSlugs: ['hash-generator', 'unix-timestamp'],
    featured: false,
  },
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    category: 'Text',
    shortDescription: 'Test a regular expression against a sample string.',
    relatedSlugs: ['json-formatter', 'url-encode'],
    featured: true,
  },
  {
    slug: 'unix-timestamp',
    name: 'Unix Timestamp Converter',
    category: 'Time',
    shortDescription: 'Convert Unix time to UTC ISO and back.',
    relatedSlugs: ['crontab-explainer', 'uuid-generator'],
    featured: true,
  },
  {
    slug: 'crontab-explainer',
    name: 'Crontab Explainer',
    category: 'Time',
    shortDescription: 'Explain a five-field cron expression in English.',
    relatedSlugs: ['unix-timestamp', 'regex-tester'],
    featured: true,
  },
  {
    slug: 'color-converter',
    name: 'Hex / RGB / HSL Converter',
    category: 'Color',
    shortDescription: 'Convert colors between hex, RGB, and HSL.',
    relatedSlugs: ['hash-generator', 'json-formatter'],
    featured: false,
  },
];

const CATEGORY_ORDER: ToolCategory[] = [
  'Format',
  'Auth',
  'Encode',
  'Generate',
  'Text',
  'Time',
  'Color',
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getFeaturedTools(): Tool[] {
  return TOOLS.filter((t) => t.featured);
}

export function getToolsByCategory(): { category: ToolCategory; tools: Tool[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    tools: TOOLS.filter((t) => t.category === category),
  })).filter((g) => g.tools.length > 0);
}

export function getRelatedTools(slug: string): Tool[] {
  const tool = getTool(slug);
  if (!tool) return [];
  return tool.relatedSlugs
    .map((s) => getTool(s))
    .filter((t): t is Tool => Boolean(t) && t.slug !== slug);
}
```

- [ ] **Step 8: Run registry tests**

Run: `npx vitest run src/data/tools.test.ts`  
Expected: PASS

- [ ] **Step 9: Write `src/data/ads.ts` and `src/components/AdSlot.astro`**

```ts
export const ADS_ENABLED = false;
export type AdSlotSize = 'leaderboard' | 'rectangle';
```

```astro
---
import { ADS_ENABLED, type AdSlotSize } from '../data/ads';

interface Props {
  size: AdSlotSize;
}

const { size } = Astro.props;
const cls = size === 'leaderboard' ? 'ad-leaderboard' : 'ad-rectangle';
---
<aside class:list={['ad-slot', cls]} aria-label="Advertisement">
  {ADS_ENABLED ? null : <span>Ad</span>}
</aside>

<style>
  .ad-slot {
    border: 1px dashed var(--border);
    color: var(--muted);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1.25rem 0;
    background: var(--panel);
  }
  .ad-leaderboard { width: 100%; max-width: 728px; min-height: 90px; }
  .ad-rectangle { width: 100%; max-width: 300px; min-height: 250px; }
</style>
```

Leave the `ADS_ENABLED` true branch empty (null) in v1 — no ad network script.

- [ ] **Step 10: Commit**

```bash
git add src/lib/limits.ts src/lib/limits.test.ts src/data/tools.ts src/data/tools.test.ts src/data/ads.ts src/components/AdSlot.astro
git commit -m "feat: add tool registry, input limits, and ad placeholders"
```

---

### Task 4: Shared tool UI + JSON tool vertical slice

**Files:**
- Create: `src/components/ToolShell.tsx`, `src/components/FaqList.astro`, `src/components/RelatedTools.astro`, `src/components/ToolCard.astro`, `src/components/tools/ToolIsland.astro`, `src/components/tools/JsonFormatter.tsx`, `src/lib/json.ts`, `src/lib/json.test.ts`, `src/content.config.ts`, `src/content/tools/json-formatter.md`, `src/pages/tools/[slug].astro`
- Modify: none of the other nine tools yet
- Test: `src/lib/json.test.ts`

**Interfaces:**
- Consumes: `Tool`, `getTool`, `getRelatedTools`, `isTooLarge`, `INPUT_TOO_LARGE_MSG`, `AdSlot`
- Produces:
```ts
export type JsonResult =
  | { ok: true; formatted: string }
  | { ok: false; error: string };

export function formatJson(input: string): JsonResult;
```
Empty input → `{ ok: false, error: '' }` so the UI shows idle (no error line). Invalid JSON → `{ ok: false, error: 'Invalid JSON' }` (do not leak parser internals).

`ToolShell` (Preact):

```tsx
export function ToolShell(props: {
  error: string | null;
  output: string;
  children: preact.ComponentChildren;
}): preact.JSX.Element;
```

Renders: children (inputs), optional error in `.tool-error` (color `var(--danger)`), output `<pre><code>` in monospace, a `Copy` button that `clipboard.writeText(output)` when output is non-empty and then labels the button `Copied` for 1500ms.

Content collection `toolPages`:

```ts
schema: z.object({
  title: z.string(),
  description: z.string(),
  intro: z.string(),
  howTo: z.tuple([z.string(), z.string(), z.string()]),
  faq: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).min(3).max(5),
})
```

Loader: `glob({ pattern: '**/*.md', base: './src/content/tools' })`. Entry id = filename without `.md` = tool slug.

`src/pages/tools/[slug].astro` `getStaticPaths` maps `TOOLS`. Page order: H1, intro, privacy line, top AdSlot leaderboard, ToolIsland, How to use ol, FaqList, RelatedTools, bottom AdSlot rectangle.

- [ ] **Step 1: Write failing `src/lib/json.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { formatJson } from './json';

describe('formatJson', () => {
  it('formats valid JSON', () => {
    const result = formatJson('{"a":1}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(JSON.parse(result.formatted)).toEqual({ a: 1 });
      expect(result.formatted.includes('\n')).toBe(true);
    }
  });

  it('returns Invalid JSON for truncated input', () => {
    expect(formatJson('{')).toEqual({ ok: false, error: 'Invalid JSON' });
  });

  it('returns empty error for empty input', () => {
    expect(formatJson('')).toEqual({ ok: false, error: '' });
    expect(formatJson('   ')).toEqual({ ok: false, error: '' });
  });

  it('does not evaluate JavaScript', () => {
    expect(formatJson('{a:1}')).toEqual({ ok: false, error: 'Invalid JSON' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/json.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Write `src/lib/json.ts`**

```ts
export type JsonResult =
  | { ok: true; formatted: string }
  | { ok: false; error: string };

export function formatJson(input: string): JsonResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: '' };
  try {
    const value = JSON.parse(trimmed);
    return { ok: true, formatted: JSON.stringify(value, null, 2) };
  } catch {
    return { ok: false, error: 'Invalid JSON' };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/json.test.ts`  
Expected: PASS

- [ ] **Step 5: Write `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
  }),
});

const toolPages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    intro: z.string(),
    howTo: z.tuple([z.string(), z.string(), z.string()]),
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .min(3)
      .max(5),
  }),
});

export const collections = { blog, toolPages };
```

Create empty `src/content/blog/.gitkeep` (no `.md` posts).

- [ ] **Step 6: Write `src/content/tools/json-formatter.md`**

```md
---
title: JSON Formatter / Validator
description: Format and validate JSON in your browser. Nothing is uploaded.
intro: Paste JSON to format and validate it locally. Invalid documents show an error; nothing leaves this page.
howTo:
  - Paste or type JSON into the input.
  - Read the formatted output or the validation error.
  - Copy the result with the Copy button.
faq:
  - question: Does this JSON formatter upload my data?
    answer: No. Formatting runs in your browser. Nothing is uploaded.
  - question: Why is my JSON invalid?
    answer: JSON requires double-quoted keys, no trailing commas, and no comments. The tool reports Invalid JSON and does not try to guess a fix.
  - question: Can I minify JSON here?
    answer: v1 pretty-prints with two-space indent. Minify is not included.
---
```

- [ ] **Step 7: Write `ToolShell.tsx`, `FaqList.astro`, `RelatedTools.astro`, `ToolCard.astro`**

`ToolShell.tsx`:

```tsx
import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

export function ToolShell(props: {
  error: string | null;
  output: string;
  children: ComponentChildren;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (!props.output) return;
    await navigator.clipboard.writeText(props.output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div class="tool-panel">
      {props.children}
      {props.error ? <p class="tool-error" role="alert">{props.error}</p> : null}
      <pre class="tool-output"><code>{props.output}</code></pre>
      <button type="button" onClick={onCopy} disabled={!props.output}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
```

Add matching CSS in `global.css`:

```css
.tool-panel { background: var(--panel); border: 1px solid var(--border); padding: 1rem; border-radius: 8px; }
.tool-panel textarea, .tool-panel input, .tool-panel select {
  width: 100%; background: var(--bg); color: var(--text); border: 1px solid var(--border);
  font-family: var(--mono); padding: 0.6rem; margin-bottom: 0.75rem;
}
.tool-panel button {
  background: transparent; color: var(--accent); border: 1px solid var(--accent);
  padding: 0.4rem 0.8rem; cursor: pointer;
}
.tool-panel button:disabled { opacity: 0.45; cursor: not-allowed; }
.tool-error { color: var(--danger); }
.tool-output { font-family: var(--mono); white-space: pre-wrap; overflow-x: auto; min-height: 6rem; }
.tool-grid { display: grid; gap: 1rem; }
@media (min-width: 720px) {
  .tool-grid.split { grid-template-columns: 1fr 1fr; }
}
```

`FaqList.astro` props `{ items: { question: string; answer: string }[] }` — render `<h2>FAQ</h2>` and a `<dl>`.

`RelatedTools.astro` props `{ slug: string }` — call `getRelatedTools(slug)`, `<h2>Related tools</h2>`, links to `/tools/${t.slug}/`.

`ToolCard.astro` props `{ tool: Tool }` — link card with name + shortDescription.

- [ ] **Step 8: Write `JsonFormatter.tsx`**

```tsx
import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { formatJson } from '../../lib/json';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: INPUT_TOO_LARGE_MSG, output: '' };
    }
    const r = formatJson(input);
    return { error: r.ok ? null : r.error || null, output: r.ok ? r.formatted : '' };
  }, [input]);

  return (
    <ToolShell error={result.error} output={result.output}>
      <label>
        JSON
        <textarea
          rows={12}
          value={input}
          onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          spellcheck={false}
        />
      </label>
    </ToolShell>
  );
}
```

- [ ] **Step 9: Write `ToolIsland.astro`**

```astro
---
import JsonFormatter from './JsonFormatter';

interface Props { slug: string }
const { slug } = Astro.props;
---
{slug === 'json-formatter' && <JsonFormatter client:load />}
```

Other slugs render nothing until later tasks add branches. Unknown slug at the page level 404s via `getStaticPaths`.

- [ ] **Step 10: Write `src/pages/tools/[slug].astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import AdSlot from '../../components/AdSlot.astro';
import FaqList from '../../components/FaqList.astro';
import RelatedTools from '../../components/RelatedTools.astro';
import ToolIsland from '../../components/tools/ToolIsland.astro';
import { getCollection } from 'astro:content';
import { TOOLS, getTool } from '../../data/tools';

export function getStaticPaths() {
  return TOOLS.map((tool) => ({ params: { slug: tool.slug } }));
}

const slug = Astro.params.slug!;
const tool = getTool(slug);
if (!tool) throw new Error(`Unknown tool ${slug}`);

const pages = await getCollection('toolPages');
const page = pages.find((p) => p.id === slug);
if (!page) throw new Error(`Missing content for ${slug}`);
---
<BaseLayout title={page.data.title} description={page.data.description} path={`/tools/${slug}/`}>
  <h1>{page.data.title}</h1>
  <p>{page.data.intro}</p>
  <p>Runs locally in your browser. Nothing is uploaded.</p>
  <AdSlot size="leaderboard" />
  <ToolIsland slug={slug} />
  <h2>How to use</h2>
  <ol>
    {page.data.howTo.map((step) => <li>{step}</li>)}
  </ol>
  <FaqList items={page.data.faq} />
  <RelatedTools slug={slug} />
  <AdSlot size="rectangle" />
</BaseLayout>
```

Build will fail until all 10 `toolPages` exist. To keep this task’s build green **without** shipping fake tools, change `getStaticPaths` **in this task only** to:

```ts
export function getStaticPaths() {
  return TOOLS.filter((t) => t.slug === 'json-formatter').map((tool) => ({
    params: { slug: tool.slug },
  }));
}
```

Task 14 restores the full `TOOLS` map after all 10 Markdown files exist. Do not leave the filter in the final codebase.

- [ ] **Step 11: Manual check**

Run: `npx astro dev`  
Open `/tools/json-formatter/` — H1, intro, privacy line, ad placeholders, textarea, how-to (3 steps), FAQ, related links. Paste `{"a":1}` → pretty JSON. Paste `{` → `Invalid JSON`. Disable JS: H1, how-to, FAQ still visible.

Run: `npx astro build`  
Expected: `dist/tools/json-formatter/index.html` exists.

- [ ] **Step 12: Commit**

```bash
git add src/lib/json.ts src/lib/json.test.ts src/content.config.ts src/content/blog/.gitkeep src/content/tools/json-formatter.md src/components/ToolShell.tsx src/components/FaqList.astro src/components/RelatedTools.astro src/components/ToolCard.astro src/components/tools/ToolIsland.astro src/components/tools/JsonFormatter.tsx src/pages/tools/\[slug\].astro src/styles/global.css
git commit -m "feat: add JSON formatter tool page and shared tool chrome"
```

---

### Task 5: Home and tool index

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/tools/index.astro`
- Test: manual

**Interfaces:**
- Consumes: `getFeaturedTools`, `getToolsByCategory`, `ToolCard`, `SITE_*`
- Produces: `/` shows tagline, category links (`#` anchors to `/tools/#category-format` etc.), six featured cards. `/tools/` lists every tool grouped by category.

- [ ] **Step 1: Write `src/pages/tools/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ToolCard from '../../components/ToolCard.astro';
import { getToolsByCategory } from '../../data/tools';

const groups = getToolsByCategory();
const idFor = (category: string) =>
  `category-${category.toLowerCase()}`;
---
<BaseLayout
  title="All tools"
  description="Browser-based developer tools. Nothing is uploaded."
  path="/tools/"
>
  <h1>All tools</h1>
  {groups.map((g) => (
    <section id={idFor(g.category)}>
      <h2>{g.category}</h2>
      {g.tools.map((tool) => <ToolCard tool={tool} />)}
    </section>
  ))}
</BaseLayout>
```

- [ ] **Step 2: Replace home**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ToolCard from '../components/ToolCard.astro';
import { SITE_NAME, SITE_TAGLINE } from '../data/site';
import { getFeaturedTools, getToolsByCategory } from '../data/tools';

const featured = getFeaturedTools();
const groups = getToolsByCategory();
---
<BaseLayout title={SITE_NAME} description={SITE_TAGLINE} path="/">
  <h1>{SITE_NAME}</h1>
  <p>{SITE_TAGLINE}</p>
  <p>
    {groups.map((g) => (
      <a href={`/tools/#category-${g.category.toLowerCase()}`}>{g.category}</a>
    ))}
  </p>
  <h2>Featured tools</h2>
  {featured.map((tool) => <ToolCard tool={tool} />)}
  <p><a href="/tools/">View all tools</a></p>
</BaseLayout>
```

Home must not list all 10 tools in the featured block.

- [ ] **Step 3: Manual check**

`/` has six featured cards including JSON and JWT. `/tools/` lists 10 grouped tools. JWT card may 404 until Task 6 — that is expected.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/tools/index.astro src/components/ToolCard.astro
git commit -m "feat: add home featured tools and tools index"
```

---

### Task 6: JWT decoder

**Files:**
- Create: `src/lib/jwt.ts`, `src/lib/jwt.test.ts`, `src/components/tools/JwtDecoder.tsx`, `src/content/tools/jwt-decoder.md`
- Modify: `src/components/tools/ToolIsland.astro`
- Test: `src/lib/jwt.test.ts`

**Interfaces:**
- Consumes: `ToolShell`, `isTooLarge`, `INPUT_TOO_LARGE_MSG`
- Produces:
```ts
export type JwtResult =
  | { ok: true; header: unknown; payload: unknown }
  | { ok: false; error: string };

export function decodeJwt(token: string): JwtResult;
```

Empty/whitespace → `{ ok: false, error: '' }`. Not three `.`-separated parts, bad base64url, or non-JSON header/payload → `{ ok: false, error: 'Not a JWT' }`. No signature verification.

- [ ] **Step 1: Write failing `src/lib/jwt.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { decodeJwt } from './jwt';

const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');
const payload = btoa(JSON.stringify({ sub: '123' }))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');

describe('decodeJwt', () => {
  it('decodes header and payload', () => {
    const result = decodeJwt(`${header}.${payload}.sig`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.header).toEqual({ alg: 'none', typ: 'JWT' });
      expect(result.payload).toEqual({ sub: '123' });
    }
  });

  it('rejects two-part tokens', () => {
    expect(decodeJwt('a.b')).toEqual({ ok: false, error: 'Not a JWT' });
  });

  it('returns empty error for empty input', () => {
    expect(decodeJwt('')).toEqual({ ok: false, error: '' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/jwt.test.ts`  
Expected: FAIL

- [ ] **Step 3: Write `src/lib/jwt.ts`**

Implement base64url decode (replace `-`/`_`, pad `=` to multiple of 4, `atob` in browser; in Node tests use `Buffer.from(s, 'base64url').toString('utf8')` if `atob` is missing). `decodeJwt` splits on `.`, requires length 3, JSON-parses header and payload.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/jwt.test.ts`  
Expected: PASS

- [ ] **Step 5: Write island and content**

`JwtDecoder.tsx`: textarea for token; output is two pretty-printed JSON blocks joined as:

```
Header
{...}

Payload
{...}
```

(put that whole string in `ToolShell` output so Copy works). Show a static note under the textarea: `Decoding is not verification. Signatures are ignored.`

`jwt-decoder.md`:

```md
---
title: JWT Decoder
description: Decode a JWT header and payload in your browser. Not signature verification.
intro: Paste a JWT to inspect its header and payload locally. This page does not verify signatures or call JWKS.
howTo:
  - Paste a JWT into the input.
  - Read the decoded header and payload.
  - Copy the JSON with the Copy button.
faq:
  - question: Does this JWT decoder verify signatures?
    answer: No. It only base64url-decodes the header and payload. Decoding is not verification.
  - question: Is my token uploaded?
    answer: No. Decoding runs in your browser. Nothing is uploaded.
  - question: Why do I see Not a JWT?
    answer: A JWT has three dot-separated parts. Invalid base64url or non-JSON header/payload also produces that error.
---
```

Add `{slug === 'jwt-decoder' && <JwtDecoder client:load />}` to `ToolIsland.astro`.

Extend `getStaticPaths` filter to `['json-formatter', 'jwt-decoder']` until Task 14.

- [ ] **Step 6: Manual check**

Happy path with a three-part token. Bad token → `Not a JWT`. Privacy line present.

- [ ] **Step 7: Commit**

```bash
git add src/lib/jwt.ts src/lib/jwt.test.ts src/components/tools/JwtDecoder.tsx src/content/tools/jwt-decoder.md src/components/tools/ToolIsland.astro src/pages/tools/\[slug\].astro
git commit -m "feat: add JWT decoder tool"
```

---

### Task 7: Base64 encode / decode

**Files:**
- Create: `src/lib/base64.ts`, `src/lib/base64.test.ts`, `src/components/tools/Base64Tool.tsx`, `src/content/tools/base64.md`
- Modify: `ToolIsland.astro`, `getStaticPaths` filter
- Test: `src/lib/base64.test.ts`

**Interfaces:**
- Produces:
```ts
export function encodeBase64(text: string): string;
export function decodeBase64(text: string): { ok: true; text: string } | { ok: false; error: string };
```

Invalid decode → `{ ok: false, error: 'Invalid Base64' }`. Mode is an explicit toggle: `encode` | `decode`.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeBase64 } from './base64';

describe('base64', () => {
  it('round-trips UTF-8 text', () => {
    const encoded = encodeBase64('hi ✓');
    const decoded = decodeBase64(encoded);
    expect(decoded).toEqual({ ok: true, text: 'hi ✓' });
  });

  it('rejects invalid Base64', () => {
    expect(decodeBase64('***')).toEqual({ ok: false, error: 'Invalid Base64' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/base64.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement `src/lib/base64.ts` using UTF-8-safe encode/decode** (`TextEncoder` + binary `btoa`/`atob`, or `Buffer` in Node). Do not use `btoa(plainString)` for non-ASCII.

- [ ] **Step 4: Run tests** — Expected: PASS

- [ ] **Step 5: Island + markdown**

Toggle Encode/Decode (two buttons or `<select>`). Empty input idle. Over-limit uses `INPUT_TOO_LARGE_MSG`.

FAQ must include: data stays local; encode vs decode; invalid Base64 error.

Add ToolIsland branch `base64`. Expand getStaticPaths filter.

- [ ] **Step 6: Manual check** — encode `hello`, decode the result, invalid string errors.

- [ ] **Step 7: Commit** — `feat: add Base64 encode and decode tool`

---

### Task 8: URL encode / decode

**Files:**
- Create: `src/lib/url.ts`, `src/lib/url.test.ts`, `src/components/tools/UrlEncode.tsx`, `src/content/tools/url-encode.md`
- Modify: `ToolIsland.astro`, getStaticPaths filter
- Test: `src/lib/url.test.ts`

**Interfaces:**
```ts
export function encodeUrl(text: string): string; // encodeURIComponent
export function decodeUrl(text: string): { ok: true; text: string } | { ok: false; error: string };
```

Invalid decode (`%zz`) → `{ ok: false, error: 'Invalid URL encoding' }`. Explicit encode/decode toggle.

- [ ] **Step 1: Failing tests** — `encodeUrl('a b') === 'a%20b'`; `decodeUrl('a%20b')` ok `a b`; `decodeUrl('%zz')` invalid.

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement with `encodeURIComponent` / `decodeURIComponent` in try/catch.

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Island, markdown (local, toggle, `%` errors), ToolIsland branch `url-encode`.

- [ ] **Step 6: Manual check**

- [ ] **Step 7: Commit** — `feat: add URL encode and decode tool`

---

### Task 9: Hash generator

**Files:**
- Create: `src/lib/hash.ts`, `src/lib/hash.test.ts`, `src/components/tools/HashGenerator.tsx`, `src/content/tools/hash-generator.md`
- Modify: `ToolIsland.astro`, getStaticPaths filter
- Test: `src/lib/hash.test.ts`

**Interfaces:**
```ts
export type HashAlg = 'SHA-256' | 'SHA-1';
export async function hashText(input: string, alg: HashAlg): Promise<string>; // lowercase hex
```

Web Crypto only. No MD5.

- [ ] **Step 1: Failing test** — `hashText('', 'SHA-256')` equals `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`; `hashText('abc', 'SHA-1')` equals `a9993e364706816aba3e25717850c26c9cd0d89d`.

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement with `crypto.subtle.digest` and `TextEncoder`. Node 20+ global crypto is enough for Vitest.

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Island — textarea + select SHA-256/SHA-1; hash on input (debounce not required). Empty input still hashes the empty string (that is correct). Over-limit: skip digest, show `INPUT_TOO_LARGE_MSG`. Markdown FAQ: local, SHA-1 vs SHA-256, no MD5.

- [ ] **Step 6: Manual check**

- [ ] **Step 7: Commit** — `feat: add SHA-1 and SHA-256 hash generator`

---

### Task 10: UUID generator

**Files:**
- Create: `src/components/tools/UuidGenerator.tsx`, `src/content/tools/uuid-generator.md`
- Modify: `ToolIsland.astro`, getStaticPaths filter
- Test: none (wrapper around `crypto.randomUUID()`)

**Interfaces:**
- Produces: island that on mount and on button `Generate` sets output to `crypto.randomUUID()`. No bulk generation.

- [ ] **Step 1: Write island** — `useState` + `useEffect` to generate once; button “Generate” calls `crypto.randomUUID()` again; `ToolShell` for Copy.

- [ ] **Step 2: Write `uuid-generator.md`** — how-to: open page, copy UUID, click Generate for another. FAQ: v4 only; local; not a bulk generator.

- [ ] **Step 3: ToolIsland branch `uuid-generator`**

- [ ] **Step 4: Manual check** — two clicks produce two different UUIDs matching `/^[0-9a-f-]{36}$/i`.

- [ ] **Step 5: Commit** — `feat: add UUID v4 generator`

---

### Task 11: Regex tester

**Files:**
- Create: `src/lib/regex.ts`, `src/lib/regex.test.ts`, `src/components/tools/RegexTester.tsx`, `src/content/tools/regex-tester.md`
- Modify: `ToolIsland.astro`, getStaticPaths filter
- Test: `src/lib/regex.test.ts`

**Interfaces:**
```ts
export type RegexMatch = { index: number; text: string; groups: string[] };
export type RegexResult =
  | { ok: true; matches: RegexMatch[] }
  | { ok: false; error: string };

export function testRegex(pattern: string, flags: string, text: string): RegexResult;
```

Empty pattern → `{ ok: false, error: '' }`. `new RegExp` throw → `{ ok: false, error: 'Invalid regular expression' }`. Use global iteration when `g` is set; without `g` return at most one match. No ReDoS timeout.

- [ ] **Step 1: Failing tests (acceptance fixtures)**

```ts
import { describe, expect, it } from 'vitest';
import { testRegex } from './regex';

describe('testRegex', () => {
  it('captures groups for an email-like pattern', () => {
    const r = testRegex('([^@]+)@(.+)', '', 'a@b.com');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.matches[0].groups).toEqual(['a', 'b.com']);
    }
  });

  it('finds multiple matches with g', () => {
    const r = testRegex('a+', 'g', 'aa-aaa');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.matches.map((m) => m.text)).toEqual(['aa', 'aaa']);
  });

  it('returns Invalid regular expression for a dangling backslash', () => {
    expect(testRegex('\\', '', 'x')).toEqual({
      ok: false,
      error: 'Invalid regular expression',
    });
  });
});
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement with `new RegExp(pattern, flags)` and `matchAll` when flags include `g`, else `exec` once.

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Island** — inputs: pattern, flags (text, default `g`), test string. Output: formatted matches (`index: text` plus groups) or error. Over-limit on test string (and on pattern) uses `INPUT_TOO_LARGE_MSG`.

Markdown FAQ must include the three fixtures in prose: email-like groups, `g` multiple matches, invalid pattern; plus “for typical test strings, not untrusted production workloads.”

- [ ] **Step 6: Manual check** of the three fixtures.

- [ ] **Step 7: Commit** — `feat: add regex tester`

---

### Task 12: Unix timestamp converter

**Files:**
- Create: `src/lib/timestamp.ts`, `src/lib/timestamp.test.ts`, `src/components/tools/UnixTimestamp.tsx`, `src/content/tools/unix-timestamp.md`
- Modify: `ToolIsland.astro`, getStaticPaths filter
- Test: `src/lib/timestamp.test.ts`

**Interfaces:**
```ts
export type TimestampResult =
  | { ok: true; iso: string; seconds: number; milliseconds: number }
  | { ok: false; error: string };

export function fromUnix(value: string, unit: 's' | 'ms'): TimestampResult;
export function fromIso(value: string): TimestampResult;
```

Empty → `{ ok: false, error: '' }`. Non-numeric / invalid date → `{ ok: false, error: 'Invalid timestamp' }`. `iso` is UTC (`toISOString()`).

- [ ] **Step 1: Failing tests** — `fromUnix('0', 's')` iso `1970-01-01T00:00:00.000Z`; `fromUnix('1000', 'ms')` same; `fromIso('1970-01-01T00:00:00.000Z')` seconds `0`; `fromUnix('nope', 's')` invalid.

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement with `Number` + `Number.isFinite` + `new Date`.

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Island** — mode Unix→ISO vs ISO→Unix; unit s/ms for Unix input; output string includes ISO, seconds, milliseconds so Copy is useful.

- [ ] **Step 6: Manual check**

- [ ] **Step 7: Commit** — `feat: add Unix timestamp converter`

---

### Task 13: Crontab explainer

**Files:**
- Create: `src/lib/crontab.ts`, `src/lib/crontab.test.ts`, `src/components/tools/CrontabExplainer.tsx`, `src/content/tools/crontab-explainer.md`
- Modify: `ToolIsland.astro`, getStaticPaths filter
- Test: `src/lib/crontab.test.ts`

**Interfaces:**
```ts
export type CrontabResult =
  | { ok: true; lines: string[] }
  | { ok: false; error: string };

export function explainCron(input: string): CrontabResult;
```

Trim, split on whitespace. If first token starts with `@` or field count is not 5 → `{ ok: false, error: 'Only five-field cron expressions are supported.' }`. Empty → `{ ok: false, error: '' }`. Five fields labeled minute, hour, day of month, month, day of week. Support `*`, lists (`1,2`), ranges (`1-5`), steps (`*/15`, `1-10/2`). Invalid tokens (letters other than `*` , out of range) → `{ ok: false, error: 'Invalid cron field' }`. Ranges: minute 0–59, hour 0–23, day-of-month 1–31, month 1–12, day-of-week 0–7 (7 = Sunday).

- [ ] **Step 1: Failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { explainCron } from './crontab';

describe('explainCron', () => {
  it('explains a five-field expression', () => {
    const r = explainCron('*/15 0 1,15 * 1-5');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.lines).toHaveLength(5);
      expect(r.lines[0].toLowerCase()).toContain('minute');
    }
  });

  it('rejects @daily', () => {
    expect(explainCron('@daily')).toEqual({
      ok: false,
      error: 'Only five-field cron expressions are supported.',
    });
  });

  it('rejects six fields', () => {
    expect(explainCron('0 0 0 1 1 *')).toEqual({
      ok: false,
      error: 'Only five-field cron expressions are supported.',
    });
  });
});
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement a small parser (no extra npm dependency).

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Island + markdown (five-field only, no `@daily`, local). Output = `lines.join('\n')`.

- [ ] **Step 6: Manual check** — `*/15 0 1,15 * 1-5`, `@daily`, six fields.

- [ ] **Step 7: Commit** — `feat: add five-field crontab explainer`

---

### Task 14: Color converter + open all tool routes

**Files:**
- Create: `src/lib/color.ts`, `src/lib/color.test.ts`, `src/components/tools/ColorConverter.tsx`, `src/content/tools/color-converter.md`
- Modify: `ToolIsland.astro`, `src/pages/tools/[slug].astro` (`getStaticPaths` must use full `TOOLS`)
- Test: `src/lib/color.test.ts`

**Interfaces:**
```ts
export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };
export type ColorValue = { hex: string; rgb: Rgb; hsl: Hsl };
export type ColorResult =
  | { ok: true; value: ColorValue }
  | { ok: false; error: string };

export function parseHex(input: string): ColorResult;
export function parseRgb(r: string, g: string, b: string): ColorResult;
export function parseHsl(h: string, s: string, l: string): ColorResult;
```

`hex` always `#rrggbb` lowercase. Invalid → `{ ok: false, error: 'Invalid color' }`. Empty-all-fields idle `{ ok: false, error: '' }`.

- [ ] **Step 1: Failing tests** — `parseHex('#ff0000')` rgb `{r:255,g:0,b:0}`; `parseHex('00ff00')` accepted (optional `#`); `parseRgb('0','0','0')` hex `#000000`; `parseHex('zzzzzz')` invalid; HSL `0,100,50` ≈ red (allow h 0, s 100, l 50 → `#ff0000`).

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement hex↔rgb↔hsl. Standard formulas; round RGB to integers; hex pad 2.

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Island** — three modes or three bound field groups (hex input, rgb inputs, hsl inputs). Editing one group updates output of all three in `ToolShell` output as:

```
#rrggbb
rgb(r, g, b)
hsl(h, s%, l%)
```

- [ ] **Step 6: Restore `getStaticPaths` to all `TOOLS`. Add ToolIsland branch. Confirm 10 markdown files exist.

- [ ] **Step 7: Build check**

Run: `npx astro build`  
Expected: all of these exist:

```
dist/tools/json-formatter/index.html
dist/tools/jwt-decoder/index.html
dist/tools/base64/index.html
dist/tools/url-encode/index.html
dist/tools/hash-generator/index.html
dist/tools/uuid-generator/index.html
dist/tools/regex-tester/index.html
dist/tools/unix-timestamp/index.html
dist/tools/crontab-explainer/index.html
dist/tools/color-converter/index.html
```

- [ ] **Step 8: Commit** — `feat: add color converter and enable all tool routes`

---

### Task 15: Blog stub, legal pages, 404

**Files:**
- Create: `src/pages/blog/index.astro`, `src/pages/about.astro`, `src/pages/privacy.astro`, `src/pages/terms.astro`, `src/pages/404.astro`
- Test: manual

**Interfaces:**
- Consumes: `getCollection('blog')`, `CONTACT_EMAIL`, `SITE_NAME`
- Produces: `/blog/` 200 with empty state, never 404. Privacy states the five required facts. About includes `CONTACT_EMAIL`. 404 uses `BaseLayout` (path `/404/`) and links to `/tools/`.

- [ ] **Step 1: Write `src/pages/blog/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('blog')).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
);
---
<BaseLayout
  title="Blog"
  description="Guides and notes. Coming soon."
  path="/blog/"
>
  <h1>Blog</h1>
  {posts.length === 0 ? (
    <p>Coming soon.</p>
  ) : (
    <ul>
      {posts.map((post) => (
        <li>
          <a href={`/blog/${post.id}/`}>{post.data.title}</a>
        </li>
      ))}
    </ul>
  )}
</BaseLayout>
```

Do not add `src/pages/blog/[id].astro` in v1 (zero posts). The list template is enough.

- [ ] **Step 2: Write about** — heading `About`, 2–3 sentences: free browser tools for developers; no accounts; contact `{CONTACT_EMAIL}`.

- [ ] **Step 3: Write privacy** — must include, in plain English:
  - Tools run locally in the browser.
  - No accounts.
  - No file or text uploads to our server.
  - v1 loads no analytics and no ad network.
  - If ads or analytics are added, this page will be updated.

- [ ] **Step 4: Write terms** — free, provided as-is, no warranty that results are correct, you are responsible for how you use outputs.

- [ ] **Step 5: Write `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Page not found" description="That page does not exist." path="/404/">
  <h1>Page not found</h1>
  <p>That URL is not a tool or a page on this site.</p>
  <p><a href="/tools/">Browse all tools</a></p>
</BaseLayout>
```

- [ ] **Step 6: Manual check** — `/blog/` shows “Coming soon.” `/about/`, `/privacy/`, `/terms/` render. Unknown path in `astro preview` after build shows 404 chrome.

- [ ] **Step 7: Commit** — `feat: add blog stub, legal pages, and 404`

---

### Task 16: robots.txt and sitemap

**Files:**
- Create: `src/pages/robots.txt.ts`
- Modify: none required if `@astrojs/sitemap` is already in `astro.config.mjs`
- Test: build output inspection

**Interfaces:**
- Consumes: `Astro.site` / `SITE_ORIGIN`
- Produces: `robots.txt` Allow all + Sitemap URL. Sitemap is a build artifact from `@astrojs/sitemap`.

- [ ] **Step 1: Write `src/pages/robots.txt.ts`**

```ts
import type { APIRoute } from 'astro';

const body = (sitemapURL: URL) => `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
  return new Response(body(sitemapURL), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

If the installed `@astrojs/sitemap` emits `sitemap.xml` instead of `sitemap-index.xml` for this small site, point Sitemap at the file that actually appears in `dist/` after a trial build. Do not invent a second sitemap by hand.

- [ ] **Step 2: Build and inspect**

Run: `npx astro build`  
Expected: `dist/robots.txt` contains `Allow: /` and a Sitemap line; a sitemap XML file exists under `dist/`; it includes `/`, `/tools/`, each tool URL, `/blog/`, `/about/`, `/privacy/`, `/terms/`.

- [ ] **Step 3: Commit** — `feat: add robots.txt and sitemap generation`

---

### Task 17: Nginx sample, README, v1 acceptance

**Files:**
- Create: `nginx/devtoolbox.conf.example`, `README.md`
- Test: full Vitest + build + manual list below

**Interfaces:**
- Consumes: `dist/` layout (`/_astro/` hashed assets, HTML at trailing-slash directories)
- Produces: copy-paste Nginx server config and deploy commands. No Docker, no CI.

- [ ] **Step 1: Write `nginx/devtoolbox.conf.example`**

```nginx
# Replace example.com, certificate paths, and root.
# Canonical host = apex. Redirect www → apex (swap if you choose www).

server {
    listen 80;
    server_name www.example.com example.com;
    return 301 https://example.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.example.com;
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    return 301 https://example.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    root /var/www/devtoolbox;
    index index.html;

    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    # CSP left unset in v1 so a later ad script is not blocked.

    location /_astro/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    location / {
        add_header Cache-Control "no-cache";
        try_files $uri $uri/ $uri/index.html =404;
    }

    error_page 404 /404.html;
}
```

Astro’s 404 file may be `dist/404.html`. If build emits `dist/404.html`, keep `error_page 404 /404.html`. If it only emits `dist/404/index.html`, change `error_page` to `/404/`.

- [ ] **Step 2: Write `README.md`**

Include: what the site is; `npm install`; `npm test`; `npm run dev`; `npm run build`; deploy:

```bash
npx astro build
rsync -av --delete dist/ user@example.com:/var/www/devtoolbox/
```

State that `SITE_ORIGIN` in `src/data/site.ts` and `site` in `astro.config.mjs` must match the canonical https origin before production. Point at `nginx/devtoolbox.conf.example`. List v1 out of scope (ads, analytics, accounts).

- [ ] **Step 3: Run full automated tests**

Run: `npm test`  
Expected: all `src/**/*.test.ts` PASS.

- [ ] **Step 4: Manual v1 gate (do not skip)**

For each of the 10 tools: happy path, empty input, invalid input (bad JSON / Not a JWT / Invalid Base64 / Invalid URL encoding / Invalid regular expression / Invalid timestamp / Only five-field… / Invalid color). Over-limit on JSON (paste >100k chars) shows `Input too large to process in the browser.`

JS disabled on `/tools/json-formatter/`: title, H1, how-to, FAQ present.

Build: every tool has `dist/tools/{slug}/index.html`.

After VPS deploy (when the user has a domain): HTTPS, host redirect, `/sitemap-index.xml` or `/sitemap.xml` fetches, 404 page.

- [ ] **Step 5: Commit**

```bash
git add nginx/devtoolbox.conf.example README.md
git commit -m "docs: add Nginx sample and deploy README"
```

---

## Self-review

**Spec coverage**

| Spec section | Task |
|---|---|
| Goal / constraints / Astro+Preact+Nginx | 1, 17 |
| IA routes | 4–5, 15–16 |
| 10 tools + behavior rules + 100k limit | 3, 4, 6–14 |
| Tool page template order | 4 |
| Registry `src/data/tools.ts` | 3 |
| Shared UI only ToolShell, AdSlot, FaqList, RelatedTools | 3–4 (`ToolCard` extra for listings) |
| Ads placeholder + ADS_ENABLED | 3 |
| Blog collection empty 200 | 4 content.config, 15 |
| Visual / copy / header-footer | 2 |
| sitemap + robots | 16 |
| Privacy/terms/about facts | 15 |
| Manual tests, regex fixtures | 11, 17 |
| Out of scope not built | throughout |
| Repo root | 1 |

**Note:** `ToolCard` is an extra listing component, not a tool-page chrome piece. Keep it; do not add a design system.

**Placeholders:** none. `example.com` / `hello@example.com` are explicit pre-domain values, not TBDs.

**Types:** `Tool`, `ToolCategory`, `JsonResult`, `JwtResult`, `HashAlg`, `RegexResult`, `TimestampResult`, `CrontabResult`, `ColorResult`, `AdSlotSize` are named once in Task 3–14 and reused.

**getStaticPaths:** temporary slug filter in Tasks 4–13; Task 14 must remove it.
