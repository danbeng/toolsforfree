# Phase 13: Islands without LED - Context

**Gathered:** 2026-09-20
**Status:** Ready for planning

<domain>
## Phase Boundary

All 18 tools show locale-correct Copy/Copied and island copy, wrapping the **no-LED** ToolShell. This phase lands locale on ToolIsland for the original ten, wires original-ten islands through `useToolUi` (or equivalent), and commits a ToolShell that accepts `locale` and has **no** LED / `tool-panel__chrome`. It does not add CI (Phase 14), does not pop stashes, and does not change tool algorithms.

</domain>

<decisions>
## Implementation Decisions

### No-LED ToolShell chrome
- **D-Shell:** Start from HEAD `ToolShell.tsx` (children → error → `<pre>` → Copy button). Add required `locale: Locale` and localize Copy/Copied via `t(locale)` (`copy.copy` / `copy.copied`). Do **not** commit LED, `.led`, `tool-panel__chrome`, or `chromeLocal`. Do not add a Runs locally strip. Match HEAD layout, not the dirty overlay panel.
- Dirty working-tree ToolShell currently has LED + `chromeLocal` + required locale — strip the LED chrome when landing; keep locale + Copy/Copied.

### ToolIsland locale contract
- **D-Island:** `locale` is required (`locale: Locale`). Drop `locale?` and `?? 'en'` / `= 'en'`. Pages already pass `locale={locale}` (Phase 12). Pass `locale={locale}` into **all 18** Preact islands, including the original ten that currently omit it.

### Original-ten land vs rewrite
- **D-Ten:** Land the dirty original-ten islands (they already take `{ locale }: { locale: Locale }` and call `useToolUi`). Do not rewrite from HEAD English-only islands. Do not change `src/lib` parsers. Completeness tests (`tools.test.ts` EN+ZH markdown, `ToolIsland.test.ts` slug branches) stay green.

### Later-eight copy path
- **D-Eight:** ISLE-03 requires original ten to use `useToolUi` (or equivalent). Later eight already have `locale` + `t(locale)` / `localizeError`. Do not force a `useToolUi` rewrite on the later eight this phase unless a later-eight island still omits `locale` on `ToolShell` (WordCounter currently calls `<ToolShell>` without `locale` — that must gain `locale={locale}` when ToolShell requires it). Apply `locale={locale}` on every ToolShell call site.

### Claude's Discretion
- Exact Copy button markup beyond HEAD structure + localized strings
- Whether later-eight islands keep `t(locale)` vs switching to `useToolUi` (equivalent is allowed)
- Whether ToolIsland `locale` type is imported from `locales.ts` (prefer that, not `ui.ts`)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements / roadmap
- `.planning/REQUIREMENTS.md` — ISLE-01, ISLE-02, ISLE-03, ISLE-04
- `.planning/ROADMAP.md` — Phase 13 success criteria
- `.planning/phases/12-pages-langswitch/12-CONTEXT.md` — pages already pass locale into ToolIsland; do not re-litigate chrome

### Kernel (do not rewrite)
- `src/i18n/locales.ts` — `Locale`
- `src/i18n/ui.ts` — `copy` / `copied` / `tooLarge` / `tools[slug]`
- `src/i18n/useToolUi.ts` — `{ copy, tooLarge, err }`
- `src/i18n/errors.ts` — `localizeError`

### Current code
- HEAD `src/components/ToolShell.tsx` — no-LED layout to clone
- Dirty `src/components/ToolShell.tsx` — LED to strip; locale + Copy already present
- `src/components/tools/ToolIsland.astro` — later eight get locale; original ten do not
- `src/components/tools/JsonFormatter.tsx` — original-ten `useToolUi` analog
- `src/components/tools/WordCounter.tsx` — later-eight analog; ToolShell still missing locale prop

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useToolUi(locale)` — original ten dirty files already use it
- `t(locale)` — later eight
- Phase 11 kernel: Locale, ui copy keys, localizeError
- Completeness tests: `src/data/tools.test.ts`, `src/components/tools/ToolIsland.test.ts`

### Established Patterns
- Islands: `useState` + `useMemo` over `src/lib`, wrap `ToolShell`
- Discriminated `{ ok }` parsers; English errors localized in the island
- Size guard `isTooLarge` → `tooLarge` copy
- Default-export Preact islands; named-export ToolShell

### Integration Points
- EN/ZH `[slug].astro` already pass `locale` into ToolIsland (Phase 12)
- Phase 14 needs overlay-free `astro build` — committed ToolShell must compile without LED CSS dependencies if those classes only exist in overlay CSS

</code_context>

<specifics>
## Specific Ideas

Match HEAD visual chrome (no LED) while keeping dirty-file locale contracts:

- ToolShell: HEAD structure + required locale + `copy.copy` / `copy.copied`
- ToolIsland: required locale; all 18 `locale={locale}`
- Original ten: commit dirty `useToolUi` islands (path-limited)
- Every `<ToolShell ... locale={locale}>`
- Do not commit `crontab.ts`; do not pop stashes

Hard fences: LED ToolShell chrome, `crontab.ts`, no stash pop, path-limited add, no new tools, no SITE_ORIGIN change, no Tailwind, no new npm packages.

</specifics>

<deferred>
## Deferred Ideas

- CI workflow + overlay-free green build — Phase 14
- FaqList localized heading — v1.1 lock
- Three-state theme, theme animation, 4-col grid — v2
- chromeLocal / Runs locally strip — not this milestone (would be LED-adjacent chrome)

</deferred>

---

*Phase: 13-Islands without LED*
*Context gathered: 2026-09-20*
