# Coding Conventions

**Analysis Date:** 2026-09-10

## Naming Patterns

**Files:**
- Pure logic lives in `src/lib/<topic>.ts` with a co-located `src/lib/<topic>.test.ts` (examples: `src/lib/json.ts`, `src/lib/jwt.ts`, `src/lib/base64.ts`).
- Preact tool UIs use PascalCase plus a `Tool` or domain suffix: `src/components/tools/JsonFormatter.tsx`, `src/components/tools/JwtDecoder.tsx`.
- Shared islands/shells: `src/components/ToolShell.tsx`, `src/components/tools/ToolIsland.astro`.
- Astro pages and static components: PascalCase `.astro` (`src/layouts/BaseLayout.astro`, `src/components/Header.astro`).
- Data/config: lowercase plural nouns (`src/data/tools.ts`, `src/data/ads.ts`, `src/data/site.ts`).
- i18n: short names (`src/i18n/locales.ts`, `src/i18n/path.ts`, `src/i18n/ui.ts`, `src/i18n/errors.ts`).
- Tool URL slugs are kebab-case (`json-formatter`, `jwt-decoder`) in `src/data/tools.ts`.

**Functions:**
- Use camelCase verbs: `formatJson`, `decodeJwt`, `isTooLarge`, `localizeError`, `localeFromPathname`.
- Registry accessors: `getTool`, `getFeaturedTools`, `getRelatedTools`, `getToolsByCategory` in `src/data/tools.ts`.
- Default-export Preact components as the page island (`export default function JsonFormatter`).
- Named-export shared UI (`export function ToolShell` in `src/components/ToolShell.tsx`).

**Variables:**
- camelCase locals (`trimmed`, `labels`, `result`).
- `SCREAMING_SNAKE` for module constants: `INPUT_MAX_CHARS`, `TOOLS`, `LOCALES`, `ZH_ERRORS`.
- Event handlers: `onCopy`, `onInput`.

**Types:**
- Exported `type` / `interface` in PascalCase: `JsonResult`, `Tool`, `ToolCategory`, `Locale`.
- Discriminated unions for parse results: `{ ok: true; ... } | { ok: false; error: string }` (see `src/lib/json.ts`).
- Derive unions from const arrays: `export type Locale = (typeof LOCALES)[number]` in `src/i18n/locales.ts`.

## Code Style

**Formatting:**
- No Prettier/Biome/ESLint config in the repo root. Match existing files:
  - 2-space indent
  - Single quotes
  - Semicolons
  - Trailing commas in multiline objects/arrays
  - No unused imports

**Linting:**
- Not detected (no `eslint.config.*`, `.eslintrc*`, or `biome.json`).
- Typecheck via TypeScript with `tsconfig.json` extending `astro/tsconfigs/strict`.

**JSX:**
- Preact with `"jsx": "react-jsx"` and `"jsxImportSource": "preact"` in `tsconfig.json`.
- Use Preact class attributes as `class` (not `className`) in `src/components/ToolShell.tsx`.
- Cast DOM events: `(e.target as HTMLTextAreaElement).value`.

## Import Organization

**Order:**
1. Framework / runtime (`preact/hooks`, `astro/config`, `vitest`)
2. Local components (`../ToolShell`)
3. Domain libs (`../../lib/json`, `../../lib/limits`)
4. i18n (`../../i18n/locales`, `../../i18n/useToolUi`)
5. `type` imports on their own lines: `import type { Locale } from '../../i18n/locales'`

**Path Aliases:**
- Not detected. Use relative paths from the file (`../../lib/json`, `../i18n/ui`).

**Modules:**
- `"type": "module"` in `package.json`. ESM only.

## Error Handling

**Patterns:**
- Do not throw from tool parsers. Return a result object:
  ```ts
  export type JsonResult =
    | { ok: true; formatted: string }
    | { ok: false; error: string };
  ```
- Empty input → `{ ok: false, error: '' }` (UI treats empty error as no message).
- Invalid input → English error string (`'Invalid JSON'`, `'Not a JWT'`).
- Size guard in UI, not in parsers: `isTooLarge(input)` in `src/lib/limits.ts` then `tooLarge` copy.
- Localize English error strings in the island via `useToolUi` → `err()` / `localizeError` in `src/i18n/errors.ts`. Add new English keys to `ZH_ERRORS` when adding tools.
- `try/catch` with empty catch when parse fails (`src/lib/json.ts`); never rethrow to the UI.

## Logging

**Framework:** Not detected (no logger). Do not add `console.log` in tool libs or islands.

**Patterns:**
- Surface user-facing issues through `error` props on `ToolShell`, not logs.

## Comments

**When to Comment:**
- Almost no comments in `src/`. Prefer self-explanatory names and tests.
- Do not add narrating comments for obvious control flow.

**JSDoc/TSDoc:**
- Not used. Export types and function names are the documentation.

## Function Design

**Size:**
- Keep `src/lib/*` functions small and pure (single parse/format responsibility).
- Islands: `useState` + `useMemo` over the lib, then render `ToolShell` (see `src/components/tools/JsonFormatter.tsx`).

**Parameters:**
- Primitive string inputs for libs (`formatJson(input: string)`).
- Locale as a required prop on islands: `{ locale }: { locale: Locale }`.
- Props objects for shells (`ToolShell(props: { error, output, locale, children })`).

**Return Values:**
- Discriminated `ok` unions for parsers.
- `string | null` for localized errors (`localizeError`).
- `undefined` for missing registry lookups (`getTool`).

## Module Design

**Exports:**
- Named exports for libs, data, and i18n.
- Default export only for Preact tool islands.

**Barrel Files:**
- Not detected. Import the concrete file (`from '../../lib/json'`), do not add `index.ts` barrels unless a new package boundary appears.

**Astro vs Preact:**
- Static chrome, SEO, and routing: `.astro` under `src/pages/` and `src/components/`.
- Interactive tools: Preact `.tsx` islands; wrap with `src/components/tools/ToolIsland.astro`.

## Adding a tool (8-file checklist)

One slice per tool. Do not land a catalog row without the rest. Clone `JsonFormatter.tsx` plus `src/lib/json.ts`, not `UuidGenerator.tsx` (that island has no lib).

1. Catalog row in `src/data/tools.ts` with unique kebab slug, existing `ToolCategory`, `relatedSlugs`, `featured: false`.
2. `src/lib` topic module plus colocated test with result union and English errors.
3. Preact island default export with locale, `ToolShell`, `isTooLarge`.
4. `ToolIsland.astro` static import plus slug-equals `client:load` branch.
5. EN and ZH entries in `src/i18n/ui.ts` `tools[slug]` (no new category this milestone).
6. Every new English lib error added to `ZH_ERRORS` in `src/i18n/errors.ts` in the same slice.
7. EN markdown `src/content/tools/{slug}.md` with `locale: en`, `howTo` length 3, `faq` 3-5.
8. ZH markdown `src/content/tools/zh/{slug}.md` with `locale: zh` and the same schema.

The `tools.test.ts` currently-N-tools snapshot updates when the catalog grows. Featured count stays 6. New tools must be `featured: false`; do not add featured-false asserts against tools that are not in the catalog yet.

## Island split (heavy libraries)

- Do not add `src/lib/index.ts` or any `src/lib` barrel; import the concrete file.
- Heavy deps (SQL, Markdown, QR, Diff) import only from that tool’s `src/lib` or island; light tools stay static imports in `ToolIsland.astro`.
- Keep `ToolIsland.astro` static imports plus `client:load` because Astro forbids client directives on dynamic tags.
- Do not convert the existing ten static imports to dynamic `import()`.
- SQL / Markdown / QR will dynamic-import the fat library inside their island in Phases 3, 5, 6, not at `ToolIsland.astro` top.
- From the first heavy lib (Phase 3), inspect `dist/_astro/` so `json-formatter` does not inherit those chunks.

---

*Convention analysis: 2026-09-10*
