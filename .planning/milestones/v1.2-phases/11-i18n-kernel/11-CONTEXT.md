# Phase 11: i18n Kernel - Context

**Gathered:** 2026-09-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Pages and tool islands can resolve locale, localized paths, and chrome copy from one i18n kernel: `locales.ts`, `path.ts`, `useToolUi.ts`, and EN+ZH chrome keys in `ui.ts`. This phase does not mount LangSwitch, does not commit the ZH page tree, and does not rewire ToolIsland or ToolShell (Phases 12–13).

</domain>

<decisions>
## Implementation Decisions

### Locale 模块
- `Locale` is `export type Locale = (typeof LOCALES)[number]` in `src/i18n/locales.ts`; `ui.ts` re-exports it so existing `from '../../i18n/ui'` imports keep compiling
- `LOCALE_META`: `en` → hreflang `en`, htmlLang `en`, nativeLabel `English`; `zh` → hreflang `zh-Hans`, htmlLang `zh-Hans`, nativeLabel `中文`
- `LOCALES` order is `['en', 'zh']`
- Colocated Vitest: `locales.test.ts` and `path.test.ts` (same pattern as `errors.test.ts`)

### Path 助手
- `localizedPath(locale, path)`: EN unprefixed + trailing slash (`/tools/`); ZH `/zh/tools/`
- `switchLocalePath(pathname, target)`: strip existing `/zh` prefix then apply target locale (`/zh/tools/json-formatter/` → EN `/tools/json-formatter/`)
- `localeFromPathname`: starts with `/zh/` or is exactly `/zh` → `'zh'`, else `'en'`
- Normalize unknown/malformed paths: ensure leading `/` and trailing slash; illegal locale treated as `'en'` (do not throw)

### useToolUi
- Hook returns `{ copy, tooLarge, err }` matching dirty JsonFormatter
- `copy = t(locale)`; `tooLarge` from `copy.tooLarge` (EN string matches existing `'Input too large to process in the browser.'` already in `ZH_ERRORS`)
- `err('')` / `err(null)` → `null` (ToolShell treats empty error as no message); `err` wraps `localizeError`
- This phase adds the module + tests only; island wiring is Phase 13

### Chrome 文案
- Top-level keys on `ui.en` / `ui.zh` (`homeLede`, `langSwitch`, `navPrivacy`, …); keep nested `nav.menu` / `nav.close`
- Fill `tools[slug]` EN+ZH labels for the original ten this phase (islands still Phase 13)
- Add `categories` EN+ZH matching catalog category names (ZH home already reads `copy.categories[g.category]`)
- `ui.ts` imports `Locale` from `./locales` and re-exports it

### Claude's Discretion
- Exact English/Chinese chrome strings beyond the locked keys, as long as they match what dirty pages already read (`homeKicker`, `homeFeatured`, `homeViewAll`, `notFoundTitle`, `related`, `howTo`, `faq`, `localNote`, `copy`/`copied`, footer, nav Tools/Blog/About)
- Whether `path.ts` helpers are pure string ops only (they should be — no `window`)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/i18n/ui.ts` — EN+ZH tool copy for the later eight tools; `t(locale)`; currently also exports `Locale` as `'en' | 'zh'`
- `src/i18n/errors.ts` — `ZH_ERRORS` + `localizeError(locale, error)`
- `src/i18n/errors.test.ts` — colocated Vitest pattern
- Dirty (uncommitted) consumers already import the missing modules: `LangSwitch.astro`, `Footer.astro`, `RelatedTools.astro`, `src/pages/zh/index.astro`, `src/pages/404.astro`, original-ten islands

### Established Patterns
- Named exports; no `index.ts` barrels
- `export type Locale = (typeof LOCALES)[number]` (CONVENTIONS.md)
- English error strings in libs; ZH map in `errors.ts`; islands localize via `useToolUi` → `err()`
- Trailing slashes required (`astro.config.mjs`); EN unprefixed (`src/i18n/path.ts` in CONVENTIONS)

### Integration Points
- Phase 12 will mount LangSwitch and pass locale through BaseLayout/Header/Footer
- Phase 13 will pass `locale` into ToolShell / all 18 islands
- Completeness tests (`tools.test.ts`, `ToolIsland.test.ts`) must stay green; this phase should not touch catalog slugs

</code_context>

<specifics>
## Specific Ideas

Match dirty-file import contracts so Phase 12/13 can land without rewriting callers:
- `from '../i18n/locales'` → `LOCALES`, `LOCALE_META`, `type Locale`
- `from '../i18n/path'` → `localizedPath`, `switchLocalePath`, `localeFromPathname`
- `useToolUi(locale)` → `{ copy, tooLarge, err }`
- `copy.langSwitch`, `copy.navPrivacy` / `navTerms` / `navAbout`, `copy.footerRuns`, `copy.notFoundTitle` / `notFoundDescription` / `notFoundBody` / `notFoundCta`, `copy.homeLede` / `homeKicker` / `homeFeatured` / `homeViewAll`, `copy.categories`, `copy.related`, `copy.howTo`, `copy.faq`, `copy.localNote`, `copy.copy` / `copy.copied`, `copy.tooLarge`
- Do not commit LED ToolShell, `crontab.ts`, or pop stashes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. LangSwitch mount, ZH tree, BaseLayout locale, ToolIsland locale pass, and CI are Phases 12–14.

</deferred>
