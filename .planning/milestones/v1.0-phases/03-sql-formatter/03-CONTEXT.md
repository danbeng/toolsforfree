# Phase 3: SQL formatter - Context

**Gathered:** 2026-09-12
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase ships the `sql-formatter` catalog tool at existing-tool parity: visitors paste SQL in the browser, choose an explicit dialect, and copy pretty-printed SQL. Keywords UPPERCASE and 2-space indent by default. The tool does not execute SQL. Computation stays in `src/lib` plus the Preact island; no new API routes. Completeness harness from Phase 1 stays green; catalog snapshot 14 → 15; featured stays 6. json-formatter must not inherit the SQL chunk.

</domain>

<decisions>
## Implementation Decisions

### Dialect selector
- Default dialect is Standard (sql), not autodetection and not a remembered last choice
- Dialect control is a native `<select>` with the six named dialects: Standard, PostgreSQL, MySQL, SQLite, T-SQL, BigQuery
- Changing dialect immediately reformats via `useMemo` (same live-update as JsonFormatter)
- Import six named `formatDialect` entry points — never `format()` plus a string language (SQL-02)

### Invalid SQL and errors
- Invalid SQL: catch library throw, return `{ ok: false, error: English }` — do not treat a mangled half-format as success (SQL-05)
- Empty / whitespace input: `{ ok: false, error: '' }` idle contract (json / cases)
- English lib error strings plus matching `ZH_ERRORS` in this same slice (CAT-06)
- `isTooLarge` on the paste before format (T-02-03 class)

### Format defaults and island
- Keywords UPPERCASE and indent 2 spaces; no extra knobs this phase (SQL-03)
- Clone JsonFormatter island: textarea + dialect select + ToolShell Copy — not a two-pane editor, no line numbers
- Depend on the official `sql-formatter` npm package with named `formatDialect` imports
- Catalog: slug `sql-formatter`, category Format, `featured: false`; bump TOOLS length 14 → 15

### Bundle isolation and FAQ
- Only the sql-formatter island statically imports the SQL package; json-formatter must not import it (CAT-04)
- FAQ must state the tool is not an executor and dialect is not autodetection (SQL-06)
- New relatedSlugs may point at existing Format tools; do not rewrite the existing ten tools' relatedSlugs (D-13)
- Planning must confirm `formatDialect` tree-shakes in Astro 7 / Vite so other tool pages do not carry SQL strings

### Claude's Discretion
Wording of EN/ZH chrome and FAQ beyond the two required statements. Exact English error string for invalid SQL (must still map in ZH_ERRORS). How to name the Standard dialect in the select (e.g. "Standard SQL"). Related-slug trio among existing Format tools. Whether to wrap the library in a thin `src/lib/sql.ts` (preferred, matches json.ts) vs calling it from the island.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `JsonFormatter.tsx` + `src/lib/json.ts` — clone for island/lib wiring (`isTooLarge`, `useMemo`, ToolShell Copy, idle empty error)
- `ToolIsland.astro` — add static import + `slug === 'sql-formatter'` + `locale={locale}`
- `src/data/tools.ts` / `tools.test.ts` — append-only row; snapshot 14 → 15; featured 6
- `src/i18n/ui.ts` — append `tools['sql-formatter']` keys; do not drop Phase 2 keys
- `src/i18n/errors.ts` — append invalid-SQL English → ZH
- Completeness harness: `existsSync(URL)` not `.pathname`; ToolIsland source-read `includes(\`slug === '${slug}'\`)`

### Established Patterns
- 8-file additive checklist: lib + test, island, ToolIsland branch, catalog, ui.ts, EN+ZH markdown
- Parsers return discriminated `{ ok: true, ... } | { ok: false, error: string }`; never throw to UI
- English default unprefixed URLs; ZH under `src/pages/zh/`
- No `src/lib/index.ts` barrel
- Do not rewrite the existing ten tools

### Integration Points
- `src/pages/tools/[slug].astro` and `src/pages/zh/tools/[slug].astro` already pass `<ToolIsland slug={slug} locale={locale} />`
- Catalog `TOOLS` is routing source of truth
- Markdown is SEO/how-to/FAQ only (`howTo` 3, `faq` 3–5)

</code_context>

<specifics>
## Specific Ideas

- Named `formatDialect` imports for sql, postgresql, mysql, sqlite, tsql, bigquery (or the package's equivalent dialect objects) — not autodetection
- Confirm during research/plan that the json-formatter page bundle does not contain SQL-formatter identifiers
- Zero extra UI libraries; native select only
- Do not execute SQL; FAQ must say so

</specifics>

<deferred>
## Deferred Ideas

- Remember last dialect in localStorage
- Keyword-case / indent knobs
- Two-pane editor or line numbers
- Query execution / connection UI
- Additional dialects beyond the six locked names

</deferred>
