# Phase 1: Additive tool contract - Pattern Map

**Mapped:** 2026-09-11
**Files analyzed:** 3
**Analogs found:** 3 / 3

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/data/tools.test.ts` | test | transform | `src/data/tools.test.ts` | exact |
| `src/components/tools/ToolIsland.test.ts` | test | file-I/O | `src/data/tools.test.ts` (layout) + `src/lib/json.test.ts` (Vitest shape) | role-match |
| `.planning/codebase/CONVENTIONS.md` | config | transform | `.planning/codebase/CONVENTIONS.md` | exact |

Diff allowlist only. Do not analog-plan product files (`tools.ts`, `ToolIsland.astro`, islands, markdown, `limits.ts`).

## Pattern Assignments

### `src/data/tools.test.ts` (test, transform)

**Analog:** `src/data/tools.test.ts` (extend in place)

**Imports pattern** (lines 1-8):
```typescript
import { describe, expect, it } from 'vitest';
import {
  TOOLS,
  getFeaturedTools,
  getRelatedTools,
  getTool,
  getToolsByCategory,
} from './tools';
```

Add Node fs for CAT-02 (same file; keep vitest first per CONVENTIONS import order):
```typescript
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
```

**Core pattern — keep snapshot + featured; grow grouping** (lines 10-42):
```typescript
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
    expect(count).toBe(TOOLS.length); // was hardcoded 10 at line 41
  });
});
```

**Markdown existence (new cases, same describe):**
```typescript
it('has EN and ZH markdown for every catalog slug', () => {
  for (const { slug } of TOOLS) {
    const en = new URL(`../content/tools/${slug}.md`, import.meta.url);
    const zh = new URL(`../content/tools/zh/${slug}.md`, import.meta.url);
    expect(existsSync(en), `missing EN markdown for ${slug}`).toBe(true);
    expect(existsSync(zh), `missing ZH markdown for ${slug}`).toBe(true);
  }
});
```

Pass `URL` to `existsSync` — do not use `.pathname` (Windows). Loop `TOOLS`, never a copied slug array.

**Comment (CONTEXT requires):** one short comment that the completeness loop is the 8-file contract in `.planning/codebase/CONVENTIONS.md`.

**Do not drop:** unique slugs, featured === 6 with json-formatter + jwt-decoder, related, getTool('nope'), length-10 snapshot.

---

### `src/components/tools/ToolIsland.test.ts` (test, file-I/O)

**Analog:** `src/data/tools.test.ts` (describe/it/expect + import TOOLS) and `src/lib/json.test.ts` (colocated `*.test.ts`)

**Vitest include** (`vitest.config.ts` lines 3-8) — do not change:
```typescript
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
  },
});
```

File name must be `ToolIsland.test.ts` (not `.tsx`) so it matches `include`.

**Imports + core (new file; copy describe/it from tools.test.ts):**
```typescript
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

**Branch strings to match** (`ToolIsland.astro` lines 17-26 — read-only analog, do not edit):
```
{slug === 'json-formatter' && <JsonFormatter client:load locale={locale} />}
{slug === 'jwt-decoder' && <JwtDecoder client:load locale={locale} />}
...
{slug === 'color-converter' && <ColorConverter client:load locale={locale} />}
```

Assert substring `slug === '${slug}'` only (`includes`). Do not regex. Do not assert import lines. Do not import Preact islands. Do not compile `.astro`.

---

### `.planning/codebase/CONVENTIONS.md` (config, transform)

**Analog:** `.planning/codebase/CONVENTIONS.md` — append after Module Design, before the footer `*Convention analysis: 2026-09-10*` (lines 113-128). Do not rewrite Naming/Style.

**Existing barrel rule to extend** (lines 119-120):
```markdown
**Barrel Files:**
- Not detected. Import the concrete file (`from '../../lib/json'`), do not add `index.ts` barrels unless a new package boundary appears.
```

**Append sections (planner wording may tighten, keep eight items):**
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

**Comments convention** (lines 89-91): almost no comments in `src/`; CONTEXT overrides for the short completeness comments next to the new tests.

## Shared Patterns

### Vitest layout
**Source:** `src/data/tools.test.ts` lines 1-10, `src/lib/json.test.ts` lines 1-6
**Apply to:** both test files
```typescript
import { describe, expect, it } from 'vitest';
describe('…', () => {
  it('…', () => {
    expect(…).toBe(…);
  });
});
```
Colocate: catalog tests next to `tools.ts`; island coverage next to `ToolIsland.astro`. Node environment. Relative imports, no path aliases.

### Node fs + import.meta.url
**Source:** RESEARCH Pattern 2–3 (no in-repo fs analog)
**Apply to:** markdown existsSync and ToolIsland readFileSync
- `existsSync` / `readFileSync` with a `URL` from `new URL(..., import.meta.url)`
- Never `url.pathname` on Windows
- Fallback if URL fails: `fileURLToPath` from `node:url`

### Catalog as source of truth
**Source:** `src/data/tools.test.ts` importing `TOOLS` from `./tools`
**Apply to:** grouping, markdown loop, island branch loop
Loop `TOOLS`. Only hardcoded `10` is the snapshot `toHaveLength(10)`.

### Product freeze
**Apply to:** executor
Do not copy patterns into `src/data/tools.ts`, `ToolIsland.astro`, islands, `src/lib`, i18n, or content markdown this phase.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | `node:fs` source-read has no prior test; RESEARCH Patterns 2–3 are the recipe. All three planned files have a layout analog. |

## Metadata

**Analog search scope:** `src/**/*.test.ts`, `src/components/tools/ToolIsland.astro`, `src/data/tools.test.ts`, `.planning/codebase/CONVENTIONS.md`, `vitest.config.ts`
**Files scanned:** 12 test files + ToolIsland.astro + CONVENTIONS.md + vitest.config.ts
**Pattern extraction date:** 2026-09-11
**Tracked analogs:** `src/data/tools.test.ts`, `src/lib/json.test.ts`, `src/components/tools/ToolIsland.astro`, `.planning/codebase/CONVENTIONS.md`, `vitest.config.ts`
