# Phase 1: Additive tool contract - Research

**Researched:** 2026-09-11
**Domain:** Brownfield Vitest completeness harness + CONVENTIONS.md for an Astro 7 / Preact tool catalog
**Confidence:** HIGH (in-repo seams); MEDIUM (Astro `client:*` restriction via Context7)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Completeness harness
- Extend existing `src/data/tools.test.ts` and add a ToolIsland coverage test — match current Vitest layout
- Fail a missing island branch by reading `ToolIsland.astro` source and asserting every `TOOLS` slug has a `slug === '…'` branch
- Do not insert the eight new slugs in Phase 1; catalog remains 10 tools; tests lock “every catalog slug has island + EN/ZH markdown”
- Lock featured count: `getFeaturedTools().length === 6`; new tools (when added later) must be `featured: false`

### Island split
- Do not install heavy libs in Phase 1. Document the rule: no `src/lib/index.ts` barrel; heavy deps import only from that tool’s island/`src/lib`. From Phase 3 onward, regress via `dist/_astro/`
- Keep `ToolIsland.astro` static imports. Astro forbids `client:*` on dynamic tags. Light tools stay static; SQL/MD/QR will `import()` inside their island later
- Write the 8-file checklist + island-split rule into `.planning/codebase/CONVENTIONS.md`, plus a short comment next to the tests
- Do not convert the existing ten static imports to dynamic imports

### Catalog tests
- Evolve grouping tests to `=== TOOLS.length`; keep a “currently 10 tools” snapshot assertion that later phases update when they add tools
- Assert each catalog slug has `src/content/tools/{slug}.md` and `src/content/tools/zh/{slug}.md`
- 8-file checklist: catalog row, `src/lib` + test, Preact island, ToolIsland branch, EN/ZH `ui.ts`, `ZH_ERRORS`, EN md, ZH md
- Do not change existing `relatedSlugs` in this phase (CAT-05)

### Phase 1 delivery boundary
- Almost no product-code change. Existing ten islands/pages stay as-is; only tests + `CONVENTIONS.md`
- Prove old tools via existing Vitest green; do not add Playwright or a manual click-through of all ten
- Do not add `INPUT_MAX_BYTES` now — leave it for Phase 6
- CAT-01/02/06 in this phase mean harness + rules that go green as the catalog grows; the eight tools themselves are written in Phases 2–6, not as empty shells here

### Claude's Discretion
Implementation details of how to parse `ToolIsland.astro` in tests (regex vs simple includes), exact CONVENTIONS.md wording, and whether the island-coverage test lives in `tools.test.ts` vs a sibling `ToolIsland.test.ts` that reads the `.astro` file as text.

### Deferred Ideas (OUT OF SCOPE)
- Dynamic `import()` of SQL/Markdown/QR inside their islands — Phases 3, 5, 6
- `dist/_astro/` chunk regression — from first heavy lib (Phase 3)
- `INPUT_MAX_BYTES` — Phase 6
- Eight new catalog rows / markdown / islands — Phases 2–6
- Playwright E2E of existing tools
- Per-slug Astro wrappers for ToolIsland
- Rewiring `relatedSlugs` to future tools
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CAT-01 | Each new tool is registered in `TOOLS` with a unique locked slug, category, `relatedSlugs`, and `featured: false` | Unique-slug test already exists. Keep `getFeaturedTools()` length **6**. Do **not** insert the eight slugs now. Snapshot `TOOLS` length **10**. Later slices add rows with `featured: false`; this phase only documents that rule. |
| CAT-02 | Each new tool has EN and ZH content-collection markdown so `astro build` succeeds | New filesystem asserts: `src/content/tools/{slug}.md` and `src/content/tools/zh/{slug}.md` for every `TOOLS` slug. Pages already throw `Missing content for ${slug}` / `Missing zh content for ${slug}` at build. |
| CAT-03 | `ToolIsland` maps each new slug to its Preact island; a missing branch fails tests rather than rendering a blank panel | Source-read `ToolIsland.astro` and assert every catalog slug has a `slug === '…'` branch. Do not compile the `.astro` file. |
| CAT-04 | Heavy libraries load only on that tool's page | Document island-split in CONVENTIONS.md. No heavy libs this phase. No `src/lib/index.ts`. Keep existing ten static imports. `dist/_astro/` regression is Phase 3. |
| CAT-05 | Existing ten tools keep current behavior except catalog/`relatedSlugs` wiring | No product-code edits. No `relatedSlugs` rewiring. Existing Vitest suite stays green. |
| CAT-06 | Every new tool uses live in-browser compute, copy, input size guard, EN+ZH island copy, and English lib errors with matching `ZH_ERRORS` | Encode as the 8-file checklist in CONVENTIONS.md (plus a short comment next to the tests). No empty shells this phase. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Privacy: all tool computation in the browser (`src/lib`); no new API routes for tool logic.
- Parity: new tools must match existing tool quality (chrome, copy, errors, EN+ZH, FAQ).
- Stack: stay on Astro + Preact + current catalog/content-collection pattern; do not introduce a new app framework.
- QR decode (later phases): in-browser file only; no server OCR.
- Do not rewrite the existing ten tools; this milestone is additive.
- Pure logic: `src/lib/<topic>.ts` + colocated `src/lib/<topic>.test.ts`.
- Default-export Preact islands; named-export libs/data/i18n.
- Do not add `index.ts` barrels; import the concrete file.
- Vitest: `src/**/*.test.ts`, Node environment, `npm test` → `vitest run`.
- Discriminated `{ ok: true } | { ok: false, error: string }` for parsers; English lib errors; `ZH_ERRORS` for ZH.
- Size guard is `isTooLarge` / `INPUT_MAX_CHARS` only today.
- GSD: do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it (this research file is the GSD research artifact).

## Summary

Phase 1 is a **CI contract**, not a product slice. The catalog stays at the current ten tools. The planner must produce a smallest-diff plan that (1) extends `src/data/tools.test.ts` so grouping grows with `TOOLS.length` while a snapshot still pins “currently 10”, (2) asserts EN+ZH markdown files exist per catalog slug, (3) source-reads `ToolIsland.astro` so a missing `slug === '…'` branch fails Vitest instead of shipping a blank island, (4) locks `getFeaturedTools()` at length 6, and (5) writes the 8-file checklist plus island-split rule into `.planning/codebase/CONVENTIONS.md` with a short comment next to the tests.

Do not install packages, do not add Playwright, do not add `INPUT_MAX_BYTES`, do not insert the eight locked slugs, do not rewire `relatedSlugs`, and do not touch islands, pages, or `src/lib` product code. CAT-01/02/06 are harness + rules that go green as Phases 2–6 add the eight files per tool.

**Primary recommendation:** Keep catalog invariants in `src/data/tools.test.ts`; put the `ToolIsland.astro` source-read in a sibling `src/components/tools/ToolIsland.test.ts`; parse with `String.prototype.includes` of `slug === '${slug}'` (no regex); assert markdown with `existsSync(new URL(..., import.meta.url))`; append the 8-file checklist and island-split rule to `.planning/codebase/CONVENTIONS.md`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Catalog completeness (unique slugs, length snapshot, featured === 6) | API / Backend (static `TOOLS` module + Vitest) | — | `TOOLS` is the routing source of truth; tests live next to `src/data/tools.ts`. No browser involvement. |
| EN+ZH markdown presence | CDN / Static (content collections on disk) | API / Backend (`[slug].astro` build throw) | Files under `src/content/tools/` feed SSG. Vitest checks the files exist; `astro build` still throws if a later slice adds a catalog row without markdown. |
| ToolIsland branch coverage | Frontend Server (SSR) / SSG (`ToolIsland.astro`) | API / Backend (Vitest source-read) | Missing branch renders a blank panel at SSG time with no build error. Tests must read the `.astro` text; they must not hydrate islands. |
| Island-split / no lib barrel | CDN / Static (Vite client chunks) | Browser / Client (later `import()` inside heavy islands) | Document only in Phase 1. Chunk regression is Phase 3. Do not change the ten static imports. |
| 8-file additive checklist | API / Backend (conventions + tests) | — | Human/agent contract for Phases 2–6. Not a runtime component. |
| Existing-ten behavior freeze | Browser / Client (unchanged islands) | — | CAT-05 is “do not touch”. Prove via existing Vitest green. |

## Standard Stack

This phase installs **zero** packages. Use the repo as it is.

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vitest | `^5.0.0` | Unit tests | Already the runner. `npm test` → `vitest run`. `[VERIFIED: package.json:9,19]` quote: `"test": "vitest run"` / `"vitest": "^5.0.0"` |
| Node.js built-ins `node:fs` | Node `^20.19.0 \|\| >=22.12.0` (project); probed `v22.22.2` | `readFileSync` / `existsSync` of local files | No extra dep. Node `readFileSync` accepts `new URL(..., import.meta.url)`. `[CITED: Context7 /nodejs/node esm.md]` |
| TypeScript | `^7.0.2` | Existing strict config | Do not change `tsconfig.json`. `[VERIFIED: package.json:18]` quote: `"typescript": "^7.0.2"` |
| Astro | `^7.3.2` | Existing SSG; **not edited this phase** | `client:*` only on directly imported UI components. `[CITED: Context7 /withastro/docs directives-reference.mdx]` |
| Preact | `^10.29.8` | Existing islands; **not edited this phase** | `[VERIFIED: package.json:14]` quote: `"preact": "^10.29.8"` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| — | — | — | Do not add `memfs`, jsdom, happy-dom, Playwright, or Astro test utils. Real filesystem asserts are the point. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `includes('slug === \'…\'')` | Regex `/slug === '([^']+)'/g` | Regex can over-match comments or miss quote style. `includes` matches the current source verbatim. **Use includes.** |
| Sibling `ToolIsland.test.ts` | All asserts in `tools.test.ts` | One file is slightly smaller. Sibling colocates the source-read with `ToolIsland.astro` and keeps `tools.test.ts` catalog-only. **Use sibling.** |
| `existsSync` of markdown | `getCollection('toolPages')` in Vitest | `astro:content` is not available in the Node Vitest config. Pages already throw at build. **Use filesystem exists.** |
| Source-read `.astro` | Compile/render ToolIsland in Vitest | Needs Astro compiler / Vite plugin / jsdom. Out of scope; locked as source-read. |

**Installation:** none.

```bash
# No npm install this phase.
npm test
```

**Version verification:** `package.json` read this session. No new registry packages.

## Package Legitimacy Audit

No external packages are installed this phase.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| — | — | — | — | — | — | none |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```text
                    TOOLS catalog (src/data/tools.ts)
                         │
          ┌──────────────┼──────────────────┐
          │              │                  │
          ▼              ▼                  ▼
   getStaticPaths   getFeaturedTools   getToolsByCategory
   EN+ZH [slug]     homepage cards     /tools/ groups
          │              │
          ▼              ▼
   toolPages collection        featured.length === 6  (test lock)
   src/content/tools/{slug}.md
   src/content/tools/zh/{slug}.md
          │
          │  missing md → astro build throws
          │  "Missing content for {slug}"
          ▼
   ToolIsland.astro
   static import + {slug === 'x' && <Island client:load />}
          │
          ├─ matching branch → Preact island hydrates
          └─ no matching branch → blank panel, build still succeeds
                                  ▲
                                  │ Vitest source-read fails CI (this phase)
```

Entry: Vitest (`npm test`) and later `astro build`. Processing: read `TOOLS`, read filesystem, read `ToolIsland.astro` text. Decision: every slug must have island branch + both markdown files; featured count stays 6. External deps: none.

### Recommended Project Structure

Do **not** add product files. Only these two test/doc surfaces change:

```
src/data/tools.test.ts                         # extend catalog + markdown + snapshot
src/components/tools/ToolIsland.test.ts        # NEW — source-read coverage (discretion pick)
src/components/tools/ToolIsland.astro          # DO NOT EDIT
src/data/tools.ts                              # DO NOT EDIT
src/content/tools/{slug}.md                    # DO NOT ADD eight new files
src/content/tools/zh/{slug}.md                 # DO NOT ADD eight new files
.planning/codebase/CONVENTIONS.md              # append 8-file checklist + island-split
```

### Pattern 1: Catalog snapshot + growing grouping

**What:** Keep a literal “currently 10 tools” snapshot. Change grouping from hardcoded `10` to `TOOLS.length`.
**When to use:** This phase, then every later tool slice updates the snapshot by +1.
**Example:**

```typescript
// Source: extend src/data/tools.test.ts
// Verbatim current asserts [VERIFIED: src/data/tools.test.ts:11-13, 20-22, 38-42]:
//   it('has exactly 10 tools', () => {
//     expect(TOOLS).toHaveLength(10);
//   });
//   expect(featured).toHaveLength(6);
//   expect(count).toBe(10);

it('has exactly 10 tools', () => {
  expect(TOOLS).toHaveLength(10);
});

it('groups by category without dropping tools', () => {
  const grouped = getToolsByCategory();
  const count = grouped.reduce((n, g) => n + g.tools.length, 0);
  expect(count).toBe(TOOLS.length);
});

it('features exactly six tools including json-formatter and jwt-decoder', () => {
  const featured = getFeaturedTools();
  expect(featured).toHaveLength(6);
  expect(featured.map((t) => t.slug)).toEqual(
    expect.arrayContaining(['json-formatter', 'jwt-decoder']),
  );
});
```

### Pattern 2: Filesystem completeness for EN+ZH markdown

**What:** For each `TOOLS` slug, `existsSync` both markdown paths. Do not import `astro:content`.
**When to use:** CAT-02 harness.
**Example:**

```typescript
// Source: Node fs + URL relative to this test module
// [CITED: Context7 /nodejs/node esm.md] readFileSync(new URL('./data.proto', import.meta.url))
// [CITED: Context7 /nodejs/node fs.md] existsSync(path: string|Buffer|URL)
import { existsSync } from 'node:fs';
import { TOOLS } from './tools';

it('has EN and ZH markdown for every catalog slug', () => {
  for (const { slug } of TOOLS) {
    const en = new URL(`../content/tools/${slug}.md`, import.meta.url);
    const zh = new URL(`../content/tools/zh/${slug}.md`, import.meta.url);
    expect(existsSync(en), `missing EN markdown for ${slug}`).toBe(true);
    expect(existsSync(zh), `missing ZH markdown for ${slug}`).toBe(true);
  }
});
```

Paths that must exist today (do not invent others): `src/content/tools/{slug}.md` and `src/content/tools/zh/{slug}.md` for the ten catalog slugs. `[VERIFIED: glob src/content/tools/**/*.md this session]`

Page matchers (do not call from tests; document why files must use those names):

```typescript
// [VERIFIED: src/pages/tools/[slug].astro:24-25]
// const page = pages.find((p) => p.data.locale === locale && (p.id === slug || p.id.endsWith(`/${slug}`)));
// if (!page) throw new Error(`Missing content for ${slug}`);

// [VERIFIED: src/pages/zh/tools/[slug].astro:24-25]
// if (!page) throw new Error(`Missing zh content for ${slug}`);
```

### Pattern 3: ToolIsland source-read (discretion: sibling file + includes)

**What:** Read `ToolIsland.astro` as UTF-8 text. For every `TOOLS` slug, assert the source contains `slug === '${slug}'`.
**When to use:** CAT-03. Do not compile `.astro`. Do not import Preact islands (Vitest `include` is `src/**/*.test.ts` only; environment is `node`).
**Example:**

```typescript
// Source: src/components/tools/ToolIsland.test.ts (recommended sibling)
// Current branches [VERIFIED: src/components/tools/ToolIsland.astro:17-26]:
// {slug === 'json-formatter' && <JsonFormatter client:load locale={locale} />}
// {slug === 'jwt-decoder' && <JwtDecoder client:load locale={locale} />}
// {slug === 'base64' && <Base64Tool client:load locale={locale} />}
// {slug === 'url-encode' && <UrlEncode client:load locale={locale} />}
// {slug === 'hash-generator' && <HashGenerator client:load locale={locale} />}
// {slug === 'uuid-generator' && <UuidGenerator client:load locale={locale} />}
// {slug === 'regex-tester' && <RegexTester client:load locale={locale} />}
// {slug === 'unix-timestamp' && <UnixTimestamp client:load locale={locale} />}
// {slug === 'crontab-explainer' && <CrontabExplainer client:load locale={locale} />}
// {slug === 'color-converter' && <ColorConverter client:load locale={locale} />}

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TOOLS } from '../../data/tools';

describe('ToolIsland coverage', () => {
  // Completeness: every TOOLS slug needs a ToolIsland branch. See
  // .planning/codebase/CONVENTIONS.md (8-file checklist).
  const source = readFileSync(new URL('./ToolIsland.astro', import.meta.url), 'utf8');

  it('maps every catalog slug to a slug === branch', () => {
    for (const { slug } of TOOLS) {
      expect(source.includes(`slug === '${slug}'`), `missing ToolIsland branch for ${slug}`).toBe(true);
    }
  });
});
```

**Why includes, not regex:** the production source uses single-quoted kebab slugs in `slug === '…'`. `includes` fails closed if someone writes a different quote style (test turns red; they fix the branch to match the convention). A regex that “helps” by accepting `"` or `` ` `` hides drift.

**Why a sibling file:** `tools.test.ts` currently only imports `./tools`. Reading `../components/tools/ToolIsland.astro` from `src/data/` works but mixes catalog invariants with template coverage. Vitest already includes `src/**/*.test.ts` `[VERIFIED: vitest.config.ts:5]` quote: `include: ['src/**/*.test.ts']`.

If the planner prefers one file, putting the same `readFileSync(new URL('../components/tools/ToolIsland.astro', import.meta.url), 'utf8')` into `tools.test.ts` is still in-scope (CONTEXT discretion).

### Pattern 4: CONVENTIONS.md 8-file checklist + island-split

**What:** Append a new section; do not rewrite naming/style already in the file.
**When to use:** CAT-04 / CAT-06 documentation.

Prescriptive section body (planner may tighten wording, not the eight items):

```markdown
## Adding a tool (8-file checklist)

One slice per tool. Do not land a catalog row without the rest. Clone `JsonFormatter.tsx` + `src/lib/json.ts`, not `UuidGenerator.tsx` (no lib).

1. Catalog row in `src/data/tools.ts` — unique kebab slug, existing `ToolCategory`, `relatedSlugs`, `featured: false`.
2. `src/lib/<topic>.ts` + colocated `src/lib/<topic>.test.ts` (result union; English errors).
3. Preact island `src/components/tools/<Name>.tsx` (default export; `locale` prop; `ToolShell`; `isTooLarge`).
4. `ToolIsland.astro` static import + `{slug === '<slug>' && <Name client:load locale={locale} />}`.
5. EN and ZH entries in `src/i18n/ui.ts` `tools[slug]` (and category key only if a new category is added — do not add a category this milestone).
6. Every new English lib error string added to `ZH_ERRORS` in `src/i18n/errors.ts` in the same slice.
7. EN markdown `src/content/tools/{slug}.md` (`locale: en`, `howTo` length 3, `faq` 3–5).
8. ZH markdown `src/content/tools/zh/{slug}.md` (`locale: zh`, same schema).

Update `src/data/tools.test.ts` “currently N tools” snapshot when the catalog grows. Featured count stays 6.

## Island split (heavy libraries)

- Do not add `src/lib/index.ts` (or any `src/lib` barrel). Import the concrete file.
- Heavy deps (SQL, Markdown, QR, Diff) import only from that tool’s `src/lib` or island. Light tools stay static imports in `ToolIsland.astro`.
- Keep `ToolIsland.astro` static imports + `client:load`. Astro forbids `client:*` on dynamic tags.
- Do not convert the existing ten static imports to `import()`.
- SQL / Markdown / QR will `import()` the fat library **inside** their island (Phases 3, 5, 6), not at `ToolIsland.astro` top.
- From the first heavy lib (Phase 3), inspect `dist/_astro/` so `json-formatter` does not inherit those chunks.
```

### Anti-Patterns to Avoid

- **Inserting the eight slugs now:** catalog must remain 10. Empty shells violate CONTEXT.
- **Hardcoding grouping `toBe(10)` forever:** later slices would have to remember two places; grouping must follow `TOOLS.length`.
- **Deleting the length-10 snapshot:** CONTEXT requires it; later phases update it.
- **Growing featured:** `getFeaturedTools()` stays length 6. New tools `featured: false`.
- **Dynamic tag / `client:load` on a variable component:** Astro forbids this. Keep the if-chain.
- **Converting the ten static imports to dynamic:** CAT-05 rewrite; locked out.
- **`src/lib/index.ts` barrel:** pulls future SQL/MD/QR into unrelated tests/islands.
- **Playwright or click-through of ten tools:** locked out.
- **`INPUT_MAX_BYTES`:** Phase 6.
- **`getCollection` inside Vitest:** Node environment, no `astro:content`.
- **`vi.mock('node:fs')` / memfs:** would make completeness tests lie.
- **Cloning `UuidGenerator.tsx` as the template:** it has no `src/lib`. Checklist item 2 would be skipped.
- **Rewiring `relatedSlugs`:** CAT-05 this phase.
- **Editing `[slug].astro` / islands / `limits.ts`:** product-code freeze.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Exhaustive island map | Dynamic `<Tag client:load />` or a runtime registry | Static import + `slug ===` if-chain as today | Astro: client directives only on directly imported UI components; not on dynamic tags. `[CITED: Context7 /withastro/docs directives-reference.mdx]` |
| Markdown presence | Custom content loader in tests | `existsSync` + existing `[slug].astro` build throw | Pages already fail `astro build` on missing md. Tests catch it earlier in `npm test`. |
| Island coverage | Astro compiler / Playwright render | `readFileSync` of `ToolIsland.astro` | Locked. Faster, Node-only, matches Vitest include. |
| File path from `import.meta.url` | `new URL(...).pathname` on Windows | `readFileSync`/`existsSync` with `URL`, or `fileURLToPath` | `URL.pathname` on Windows is wrong (`/C:/path/`). `[CITED: Context7 /nodejs/node url.md]` |
| Catalog framework | New CMS, generated routes, extra category | Existing `TOOLS` + `ToolCategory` union | Additive milestone. Categories stay Format/Auth/Encode/Generate/Text/Time/Color. `[VERIFIED: src/data/tools.ts:1-8]` |
| Completeness linter | ESLint plugin / codegen | Two Vitest files + CONVENTIONS.md | No ESLint in repo. Match current test layout. |

**Key insight:** The dangerous failure is silent (missing `ToolIsland` branch builds a blank panel). Markdown-missing already throws at build. Phase 1 exists to make the silent path loud in `npm test` without rewriting the ten tools.

## Common Pitfalls

### Pitfall 1: Missing ToolIsland branch is silent at build
**What goes wrong:** `astro build` succeeds; the tool page shows chrome + FAQ and a blank panel.
**Why it happens:** `[slug].astro` always renders `<ToolIsland slug={slug} />`. Unmatched `slug ===` branches render nothing. `[VERIFIED: src/pages/tools/[slug].astro:34]` quote: `<ToolIsland slug={slug} locale={locale} />`
**How to avoid:** Source-read coverage tied to `TOOLS`, not a hardcoded list of ten branch strings.
**Warning signs:** New slug in `TOOLS` and markdown, no new line in `ToolIsland.astro`.

### Pitfall 2: Hardcoded `toBe(10)` on grouping plus a snapshot
**What goes wrong:** If grouping stays `toBe(10)` and the snapshot is also 10, a later slice that bumps only the snapshot still fails grouping — or worse, someone deletes the snapshot and grouping silently accepts any length.
**Why it happens:** Current file uses `10` in two tests. `[VERIFIED: src/data/tools.test.ts:11-13, 38-42]`
**How to avoid:** Snapshot stays `toHaveLength(10)`. Grouping becomes `toBe(TOOLS.length)`.
**Warning signs:** Both asserts still say `10` after this phase.

### Pitfall 3: Featured set grows when a new tool copies `featured: true`
**What goes wrong:** Homepage shows a seventh card. CONTEXT / CAT-01 require six.
**Why it happens:** Current featured flags are mixed true/false on the ten rows. `[VERIFIED: src/data/tools.ts]` `featured: true` on json-formatter, jwt-decoder, hash-generator, regex-tester, unix-timestamp, crontab-explainer; `featured: false` on base64, url-encode, uuid-generator, color-converter. `getFeaturedTools` is `TOOLS.filter((t) => t.featured)` `[VERIFIED: src/data/tools.ts:117-119]`.
**How to avoid:** Keep `expect(getFeaturedTools()).toHaveLength(6)`. CONVENTIONS: new tools `featured: false`.
**Warning signs:** Homepage card grid length ≠ 6.

### Pitfall 4: Completeness test uses a stale slug list
**What goes wrong:** Test loops a copied array of ten slugs instead of `TOOLS`. Adding a tool does not fail CI.
**Why it happens:** Snapshot thinking.
**How to avoid:** Loop `TOOLS` from `./tools`. The length snapshot is the only hardcoded 10.
**Warning signs:** Test file contains `'markdown-preview'` before Phase 5, or a local `const SLUGS = [...]`.

### Pitfall 5: Windows path from `import.meta.url`
**What goes wrong:** `existsSync(new URL(...).pathname)` is false on Windows because pathname is `/G:/...`.
**Why it happens:** Node documents this. `[CITED: Context7 /nodejs/node url.md]`
**How to avoid:** Pass the `URL` to `existsSync`/`readFileSync`, or `fileURLToPath`.
**Warning signs:** Tests fail only on the Windows checkout (`G:\海外练手项目`).

### Pitfall 6: Regex over-matching `ToolIsland.astro`
**What goes wrong:** A comment or `import JsonFormatter` satisfies a sloppy `/json-formatter/` check while the `slug ===` branch is missing.
**Why it happens:** Import lines already contain the component name, not necessarily `slug === '…'`.
**How to avoid:** Assert the substring `slug === '${slug}'` only.
**Warning signs:** Coverage test still passes after deleting one `{slug === '…' &&` line but leaving the import.

### Pitfall 7: `src/lib` barrel “for convenience”
**What goes wrong:** Future `sql-formatter` / `marked` / `qr` land in every island that imports `../../lib`.
**Why it happens:** Habit. No barrel exists today (`Glob src/lib/index.ts` → none).
**How to avoid:** CONVENTIONS forbids `src/lib/index.ts`. Tests do not need to grep for this in Phase 1 (doc only); Phase 3 adds chunk regression.
**Warning signs:** A new `src/lib/index.ts` in a later slice.

### Pitfall 8: Treating UuidGenerator as the template
**What goes wrong:** Phase 2 tools ship without `src/lib` + tests; CAT-06 fails later.
**Why it happens:** `UuidGenerator.tsx` calls `crypto.randomUUID()` inline. `[VERIFIED: src/components/tools/UuidGenerator.tsx:11]` quote: `setOutput(crypto.randomUUID());`
**How to avoid:** CONVENTIONS says clone `JsonFormatter.tsx` + `src/lib/json.ts`.
**Warning signs:** New island with no `src/lib/*.test.ts`.

### Pitfall 9: Content schema drift
**What goes wrong:** Markdown exists but `astro build` still throws (wrong `locale`, `howTo` not 3-tuple, faq not 3–5).
**Why it happens:** Schema is strict. `[VERIFIED: src/content.config.ts:16-29]` quote: `locale: z.enum(['en', 'zh'])` / `howTo: z.tuple([z.string(), z.string(), z.string()])` / `faq` `.min(3).max(5)`.
**How to avoid:** Phase 1 only checks **file existence**. Schema validity remains `astro build`’s job (not added this phase). CONVENTIONS mentions howTo/faq counts so later slices do not invent a fourth howTo slot.
**Warning signs:** Empty `.md` files added to satisfy existsSync.

### Pitfall 10: Accidental product edits
**What goes wrong:** Planner/executor “while here” touches `relatedSlugs`, `ToolShell`, or `limits.ts`.
**Why it happens:** Architecture research lists related-slug rewires and `INPUT_MAX_BYTES`.
**How to avoid:** Diff allowlist: `src/data/tools.test.ts`, `src/components/tools/ToolIsland.test.ts`, `.planning/codebase/CONVENTIONS.md`. Nothing else.
**Warning signs:** `git diff` outside those three paths.

## Code Examples

### Current catalog invariants (do not drop)

```typescript
// Source: src/data/tools.test.ts [VERIFIED: src/data/tools.test.ts:1-43]
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

Keep unique slugs, featured === 6 (including `json-formatter` and `jwt-decoder`), related, and `getTool('nope')`. Change only grouping `10` → `TOOLS.length`, then add markdown existence.

### Tool interface and category union (do not extend this phase)

```typescript
// Source: src/data/tools.ts [VERIFIED: src/data/tools.ts:1-17]
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
```

Locked future slugs (document only, do not insert): `markdown-preview`, `text-diff`, `sql-formatter`, `case-converter`, `password-generator`, `word-counter`, `lorem-ipsum`, `qr-code`. `[VERIFIED: .planning/REQUIREMENTS.md locked slugs paragraph]`

### Vitest config (do not change)

```typescript
// Source: vitest.config.ts [VERIFIED: vitest.config.ts:1-9]
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
  },
});
```

`ToolIsland.test.ts` matches `src/**/*.test.ts`. Do not add `*.test.tsx`. Do not switch environment to jsdom.

### JsonFormatter clone target (document, do not edit)

```typescript
// Source: src/components/tools/JsonFormatter.tsx [VERIFIED: src/components/tools/JsonFormatter.tsx:1-18]
import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { formatJson } from '../../lib/json';
import { isTooLarge } from '../../lib/limits';
import type { Locale } from '../../i18n/locales';
import { useToolUi } from '../../i18n/useToolUi';

export default function JsonFormatter({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const { copy, tooLarge, err } = useToolUi(locale);
  const labels = copy.tools['json-formatter'];
  const result = useMemo(() => {
    if (isTooLarge(input)) {
      return { error: tooLarge, output: '' };
    }
    const r = formatJson(input);
    return { error: r.ok ? null : err(r.error || null), output: r.ok ? r.formatted : '' };
  }, [input, tooLarge, err]);
```

### Size guard today (do not add bytes)

```typescript
// Source: src/lib/limits.ts [VERIFIED: src/lib/limits.ts:1-7]
export const INPUT_MAX_CHARS = 100_000;
export const INPUT_TOO_LARGE_MSG =
  'Input too large to process in the browser.';

export function isTooLarge(input: string): boolean {
  return input.length > INPUT_MAX_CHARS;
}
```

No `INPUT_MAX_BYTES` in this file. Do not add it.

### Locales (EN+ZH only)

```typescript
// Source: src/i18n/locales.ts [VERIFIED: src/i18n/locales.ts:1-4]
export const LOCALES = ['en', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
```

### ZH_ERRORS exact-phrase map (document for CAT-06)

```typescript
// Source: src/i18n/errors.ts [VERIFIED: src/i18n/errors.ts:4-14]
const ZH_ERRORS: Record<string, string> = {
  'Invalid JSON': '无效的 JSON',
  'Not a JWT': '不是有效的 JWT',
  'Invalid Base64': '无效的 Base64',
  'Invalid URL encoding': '无效的 URL 编码',
  'Invalid regular expression': '无效的正则表达式',
  'Invalid timestamp': '无效的时间戳',
  'Only five-field cron expressions are supported.': '仅支持五段 cron 表达式。',
  'Invalid cron field': '无效的 cron 字段',
  'Invalid color': '无效的颜色',
};
```

New tools must add keys that match lib English strings **exactly**. Phase 1 does not add keys.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pin grouping and length both to `10` | Snapshot length 10; grouping `TOOLS.length` | This phase | Later slices update one snapshot |
| Missing island branch is a blank panel | Vitest source-read fails CI | This phase | CAT-03 |
| Static import of all islands in one `ToolIsland.astro` | Keep for the ten; fat libs `import()` inside later islands | Phase 3+ | Avoids rewriting the ten |
| Per-slug Astro wrappers | Deferred | Out of scope | Bundler isolation without touching the ten |

**Deprecated/outdated:**
- Dynamic `<Component client:load />` as a “cleaner” ToolIsland: Astro does not support `client:*` on dynamic tags. `[CITED: Context7 /withastro/docs directives-reference.mdx]`
- Playwright as Phase 1 proof of the ten tools: locked out; existing Vitest is the proof.

Astro client-directive rule (external, fenced):

DATA_k7m2p9qw_START
A client directive can only be used on a UI framework component that is directly imported into a `.astro` component. Hydration directives are not supported when using dynamic tags and custom components passed via the `components` prop.
DATA_k7m2p9qw_END

Node relative-file read (external, fenced):

DATA_n4x8c1vz_START
import { readFileSync } from 'node:fs';
const buffer = readFileSync(new URL('./data.proto', import.meta.url));
DATA_n4x8c1vz_END

Windows pathname trap (external, fenced):

DATA_b3r6t0hy_START
new URL('file:///C:/path/').pathname;      // Incorrect: /C:/path/
fileURLToPath('file:///C:/path/');         // Correct:   C:\path\ (Windows)
DATA_b3r6t0hy_END

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Unused static imports in `ToolIsland.astro` still contribute to every tool page’s client graph (Vite does not tree-shake the false `slug ===` branches). | CAT-04 / island-split | If Vite already splits per-branch, the Phase 3 `dist/_astro/` check is still required by CONTEXT but may be a no-op. Do not change imports in Phase 1 either way. `[ASSUMED]` |
| A2 | `existsSync`/`readFileSync` accepting a `URL` object works on this Node 22.22.2 + Vitest 5 Node environment without `fileURLToPath`. | Pattern 2–3 | If Vitest’s URL handling fails, switch to `fileURLToPath` (still Node built-in, no package). `[ASSUMED]` for Vitest interop; Node fs typing is `[CITED]`. |
| A3 | A short comment above the new tests will not violate the “almost no comments in `src/`” convention because CONTEXT explicitly requires it. | CONVENTIONS + tests | None — CONTEXT overrides. |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

A1/A2 do **not** need a discuss-phase blocker: fallbacks are already specified (`fileURLToPath`; island-split remains documentation).

## Open Questions (RESOLVED)

1. **Exact island-coverage file location** — RESOLVED
   - Choice: sibling `src/components/tools/ToolIsland.test.ts`.
   - What we know: CONTEXT leaves `tools.test.ts` vs sibling `ToolIsland.test.ts` to discretion.
   - Planner/plan 01-01 uses the sibling file.

2. **Whether to assert import lines as well as `slug ===` branches** — RESOLVED
   - Choice: **do not** assert import lines. `slug === '${slug}'` is the silent-blank failure. Import failures are already loud.

3. **Whether completeness tests should open markdown and check `locale:` frontmatter** — RESOLVED
   - Choice: existence only (`existsSync` URL). Zod schema + `[slug].astro` throw remain the schema gate at `astro build`. Do not parse YAML in Vitest this phase.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vitest, `node:fs` | ✓ | v22.22.2 | — |
| npm | `npm test` | ✓ | 11.9.0 | — |
| Vitest | Completeness tests | ✓ | `^5.0.0` in package.json | — |
| `src/**/*.test.ts` include | New `ToolIsland.test.ts` | ✓ | vitest.config.ts | — |
| Playwright | — | n/a | — | Do not add |
| graphify | Cross-doc graph | disabled | — | Codebase docs already read |

**Missing dependencies with no fallback:** none

**Missing dependencies with fallback:** none

Step 2.6: no new external tools. Existing Node + Vitest are sufficient.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^5.0.0` |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

There is no watch script. No coverage gate. `passWithNoTests: true` means a misnamed file will not fail CI — use `src/data/tools.test.ts` and `src/components/tools/ToolIsland.test.ts` exactly.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAT-01 | Unique slugs; featured length 6; catalog snapshot currently 10; grouping = `TOOLS.length` | unit | `npx vitest run src/data/tools.test.ts` | ✅ `src/data/tools.test.ts` (extend) |
| CAT-02 | EN+ZH markdown files exist per catalog slug | unit | `npx vitest run src/data/tools.test.ts` | ❌ Wave 0 — add cases to `tools.test.ts` |
| CAT-03 | Every `TOOLS` slug has `slug === '…'` in `ToolIsland.astro` | unit | `npx vitest run src/components/tools/ToolIsland.test.ts` | ❌ Wave 0 — new file |
| CAT-04 | No lib barrel; heavy deps isolated | docs + later build | none this phase (`dist/_astro/` is Phase 3) | ❌ Wave 0 — CONVENTIONS.md section only |
| CAT-05 | Existing ten unchanged; relatedSlugs untouched | unit (existing suite) | `npm test` | ✅ existing `src/lib/*.test.ts` + `tools.test.ts` |
| CAT-06 | 8-file checklist (live compute, copy, cap, EN+ZH, ZH_ERRORS) | docs | none (harness, not product) | ❌ Wave 0 — CONVENTIONS.md section |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** `npm test` green before `/gsd-verify-work`. Do **not** require `astro build` (no product change; avoid coupling to unrelated dirty working tree). Do **not** add Playwright.

### Wave 0 Gaps
- [ ] Extend `src/data/tools.test.ts` — grouping `TOOLS.length`; keep `toHaveLength(10)`; keep featured `toHaveLength(6)`; add EN+ZH `existsSync` loop (CAT-01, CAT-02)
- [ ] Add `src/components/tools/ToolIsland.test.ts` — `readFileSync` + `includes(\`slug === '${slug}'\`)` over `TOOLS` (CAT-03)
- [ ] Append 8-file checklist + island-split to `.planning/codebase/CONVENTIONS.md`; short comment next to the new tests (CAT-04, CAT-06)
- [ ] Framework install: none

Do not add `tests/conftest.py` or a second test runner.

## Security Domain

`security_enforcement` is enabled (`.planning/config.json` `workflow.security_enforcement: true`, `security_asvs_level: 1`). This phase adds **tests and conventions only** — no new user input surface, no new HTML, no new crypto.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No accounts |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | Public static site |
| V5 Input Validation | no (this phase) | Existing tools keep `isTooLarge` / `INPUT_MAX_CHARS`; do not add `INPUT_MAX_BYTES` |
| V6 Cryptography | no (this phase) | Password CSPRNG is Phase 2 |

### Known Threat Patterns for this phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Blank tool island (missing branch) | Denial of service / integrity of catalog UX | CAT-03 source-read test |
| Catalog/markdown desync (build 404 / throw) | Availability | CAT-02 existsSync + existing `[slug].astro` throw |
| Future XSS via Markdown `innerHTML` | Tampering / Information disclosure | Out of scope (Phase 5); do not add HTML preview now |
| Future lib barrel pulling decoder/WASM onto every page | Information disclosure (privacy budget) | CONVENTIONS island-split; no barrel |
| Completeness test that mocks `fs` | Elevation of privilege over CI (false green) | Real `node:fs` only |

Do not introduce user-controlled path concatenation beyond catalog slugs already in `TOOLS` (trusted static data). Do not read files outside `src/content/tools` and `ToolIsland.astro`.

## Sources

### Primary (HIGH confidence)
- `src/data/tools.ts`, `src/data/tools.test.ts`, `src/components/tools/ToolIsland.astro` — catalog, featured, if-chain
- `src/pages/tools/[slug].astro`, `src/pages/zh/tools/[slug].astro` — build throws, content id matcher
- `src/content.config.ts` — locale/howTo/faq schema
- `src/lib/limits.ts`, `src/i18n/errors.ts`, `src/i18n/locales.ts`, `src/i18n/ui.ts`
- `vitest.config.ts`, `package.json`
- `.planning/phases/01-additive-tool-contract/01-CONTEXT.md` — locked decisions
- `.planning/REQUIREMENTS.md` CAT-01–CAT-06
- `.planning/codebase/CONVENTIONS.md`, `TESTING.md`, `ARCHITECTURE.md`

### Secondary (MEDIUM confidence)
- Context7 `/withastro/docs` — client directives only on directly imported UI components; not on dynamic tags (`directives-reference.mdx`)
- Context7 `/nodejs/node` — `readFileSync(new URL(..., import.meta.url))`; `existsSync` PathLike includes URL; `fileURLToPath` Windows trap
- Context7 `/vitest-dev/vitest` — `include` glob config
- `.planning/research/PITFALLS.md` Pitfall 6 (static import graph) and Pitfall 9 (checklist drift)
- `.planning/research/ARCHITECTURE.md` — 8-file vertical slice, no lib barrel, featured stays six

### Tertiary (LOW confidence)
- Exact Vite 6 / Astro 7 client-chunk graph for false `slug ===` branches `[ASSUMED]` until Phase 3 `dist/_astro/` inspection
- `docs.astro.build` WebFetch blocked this session; relied on Context7 copy of the same docs tree

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; versions from `package.json` this session
- Architecture: HIGH — in-repo ToolIsland/catalog/content path; MEDIUM on bundler leak (deferred)
- Pitfalls: HIGH — silent blank island, hardcoded 10, featured 6, Windows URL pathname all grounded

**Research date:** 2026-09-11
**Valid until:** 30 days (stable brownfield contract; not a fast-moving library)

## Planner notes (prescriptive)

1. **Brownfield additive, not a walking skeleton.** Do not scaffold a new app. Do not add tools. Do not change product code except tests + CONVENTIONS.md.
2. **Diff allowlist:** `src/data/tools.test.ts`, `src/components/tools/ToolIsland.test.ts` (new), `.planning/codebase/CONVENTIONS.md`.
3. **Do not** run package install, Playwright, `INPUT_MAX_BYTES`, relatedSlugs edits, or eight new markdown/island files.
4. **Verification:** `npm test` only.
5. **Discretion locked by this research:** sibling `ToolIsland.test.ts` + `includes(\`slug === '${slug}'\`)` + `existsSync(URL)`.
