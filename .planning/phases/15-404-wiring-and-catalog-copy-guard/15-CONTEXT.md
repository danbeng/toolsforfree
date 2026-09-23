# Phase 15: 404 wiring and catalog-copy guard - Context

**Gathered:** 2026-09-23
**Status:** Ready for planning
**Mode:** Auto (autonomous discuss; recommended options locked)

<domain>
## Phase Boundary

A visitor on the 404 page is not sent to a missing Chinese 404, and a catalog card still renders when a tool's UI copy key is absent. Covers GUARD-01 through GUARD-05 only. Does not change `SITE_ORIGIN`, create a remote, add a host, or add `src/pages/zh/404.astro`.

</domain>

<decisions>
## Implementation Decisions

### 404 language target
- **D-01:** Do not add `src/pages/zh/404.astro`. Unknown paths, including `/zh/...`, stay on the existing root 404 document.
- **D-02:** Do not special-case `/404/` inside `switchLocalePath` or `src/i18n/path.ts`. Other pages must keep generating real locale alternates.
- **D-03:** LangSwitch on the 404 page must not link to `/zh/404/`. It reads `Astro.url.pathname` today, so changing only `BaseLayout` `path="/404/"` is not enough. Give LangSwitch an optional path override, defaulting to `Astro.url.pathname`. The 404 page sets that override to `/` (home in the other locale). Header must pass the override through. — **Reversibility:** reversible — one optional prop; other pages omit it and keep current behavior.
- **D-04:** 404 canonical and hreflang must not advertise `/zh/404/`. Do not emit locale alternates that point at a missing route. Canonical may stay on the 404 URL that was requested. Omit the zh-Hans / en / x-default alternates on this document rather than pointing them at `/zh/404/`.

### 404 noindex
- **D-05:** The 404 document gets `<meta name="robots" content="noindex">`. Other pages do not. Add an optional layout flag, default off, set only from `src/pages/404.astro`.

### Missing catalog copy
- **D-06:** `ToolCard` and `RelatedTools` must not throw when `copy.tools[slug]` is missing. Fall back to the catalog `tool.name` and `tool.shortDescription`. Do not replace a present UI-copy entry. Do not add a `throw new Error` as the fix.
- **D-07:** `ToolCard` `locale` stays optional with default `en` for this phase. Do not widen the prop change into every call site.

### Claude's Discretion
- How Header threads the LangSwitch override (optional prop vs only the 404 page rendering its own switch). Must not change LangSwitch behavior on pages that do not pass it.
- Whether the 404 canonical stays `/404/` or follows the requested path, as long as it is not `/zh/404/` and alternates are omitted.
- Test shape: a unit or build grep that fails if `dist` contains `zh/404`, plus a fallback test or assertion for a missing `copy.tools` key. Do not add a new npm package.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and roadmap
- `.planning/REQUIREMENTS.md` — GUARD-01..05. Do not implement REM/HOST/ORIG/CUT here.
- `.planning/ROADMAP.md` — Phase 15 notes: both producers, no zh 404 page, no path special-case, fallback not throw, path-limited add.
- `.planning/research/SUMMARY.md` — Phase 1 section (this milestone's first phase). Both 404 producers and both throw sites.
- `.planning/PROJECT.md` — fences: no `git add -A`, do not commit `src/lib/crontab.ts`, do not pop stashes, do not commit LED ToolShell, do not change `SITE_ORIGIN` in this phase.

### Code
- `src/pages/404.astro` — passes `path="/404/"` into BaseLayout. Locale comes from `localeFromPathname`.
- `src/components/LangSwitch.astro` — builds hrefs from `Astro.url.pathname`, not the layout path prop.
- `src/layouts/BaseLayout.astro` — canonical and hreflang use `switchLocalePath(path, locale)`. No robots meta today.
- `src/components/Header.astro` — mounts LangSwitch. Must pass any 404 override.
- `src/i18n/path.ts` — do not special-case `/404/` here.
- `src/components/ToolCard.astro` — `copy.tools[slug].name` throws when the key is missing. `locale` optional, default `en`.
- `src/components/RelatedTools.astro` — same unchecked lookup on related tools.
- `src/data/tools.ts` — `tool.name` and `tool.shortDescription` are the fallback.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `switchLocalePath` / `localizedPath`: keep using them for real pages. 404 must not feed `/404/` into the zh branch.
- Catalog `Tool` fields `name` and `shortDescription`: fallback copy already exists. Do not invent new strings.

### Established Patterns
- English unprefixed, Chinese under `/zh/`. One root `404.astro`. No `src/pages/zh/404.astro`.
- UI copy lives in `src/i18n/ui.ts`. Catalog identity lives in `src/data/tools.ts`. Happy path still prefers UI copy.

### Integration Points
- Header → LangSwitch. A new optional prop must default so EN/ZH tool pages keep switching to the same path.
- BaseLayout is used by every page. A `noindex` flag must default off.
- ToolCard is used on home and catalog. RelatedTools is used on tool pages. Both need the same fallback.

</code_context>

<specifics>
## Specific Ideas

Success criteria already locked:
1. 404 page shows no LangSwitch link to `/zh/404/`.
2. 404 canonical and hreflang do not advertise `/zh/404/`. Document is `noindex`.
3. ToolCard and RelatedTools still render when `copy.tools[slug]` is missing, using catalog name and short description, and neither throws.
4. A search of the built site for `zh/404` is empty.

</specifics>

<deferred>
## Deferred Ideas

- Localized 404 document (`src/pages/zh/404.astro`) — out of scope. Hosts serve one root `404.html`.
- Making `ToolCard` `locale` required — later tightening, not this phase.
- Compile-time `keyof` so a missing UI key fails the build — later. This phase must not throw at render time.
- `SITE_ORIGIN` / remote / deploy — Phases 16–19.

</deferred>

---

*Phase: 15-404 wiring and catalog-copy guard*
*Context gathered: 2026-09-23*
