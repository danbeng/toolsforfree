# Requirements: Devtoolbox — Bilingual Land

**Defined:** 2026-09-20
**Core Value:** A visitor gets a polished, accessible, responsive experience across all 18 tools and every page — light or dark theme, desktop or mobile — without compromising the browser-local privacy model.

## v1.2 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Kernel

- [ ] **KERN-01**: `src/i18n/locales.ts` exports `LOCALES`, `Locale`, and `LOCALE_META` (hreflang / htmlLang / nativeLabel)
- [ ] **KERN-02**: `src/i18n/path.ts` provides `localizedPath`, `switchLocalePath`, and `localeFromPathname` (EN unprefixed, ZH `/zh/`, trailing slash)
- [ ] **KERN-03**: `src/i18n/useToolUi.ts` provides `copy` / `tooLarge` / `err()` for tool islands
- [ ] **KERN-04**: `ui.ts` has EN+ZH chrome keys (home, nav Tools/Blog/About, footer, 404, langSwitch, howTo, faq, localNote, copy/copied); `Locale` is sourced from `locales.ts`

### Pages

- [ ] **PAGE-01**: Header mounts `LangSwitch.astro` (do not pop `stash@{0}` Header)
- [ ] **PAGE-02**: Header Tools/Blog/About links use `localizedPath` matching the page locale
- [ ] **PAGE-03**: Commit `src/pages/zh/` (home, tools, `[slug]`, about, blog, privacy, terms)
- [ ] **PAGE-04**: EN pages pass `locale` to `BaseLayout`; Footer / RelatedTools / 404 / content `locale` frontmatter / sitemap i18n align with locale
- [ ] **PAGE-05**: `BaseLayout` sets `<html lang>` from locale and passes locale to Header / Footer

### Islands

- [ ] **ISLE-01**: `ToolShell` accepts `locale` and localizes Copy/Copied via `ui.ts`; **no** LED / `tool-panel__chrome`
- [ ] **ISLE-02**: `ToolIsland` passes `locale` to all 18 islands (currently only the later eight)
- [ ] **ISLE-03**: The original ten islands use locale copy + `useToolUi` (or equivalent) and still wrap the no-LED `ToolShell`
- [ ] **ISLE-04**: Existing completeness tests stay green: every catalog slug has EN+ZH markdown and a `ToolIsland` `slug ===` branch

### CI

- [ ] **CI-01**: `.github/workflows/ci.yml` runs Node 20, `npm ci`, `npm test`, `astro build` (file only; no remote)
- [ ] **CI-02**: On `main` without overlay isolation, `npm test` and `astro build` pass

## Future Requirements

Deferred past v1.2. Tracked but not in this roadmap.

- Three-state theme toggle (auto / light / dark)
- Smooth theme transition animation
- Card grid 4-col at 1440px (only if catalog grows past 24)
- Real `SITE_ORIGIN` / domain
- GitHub remote + `gh repo create`

## Out of Scope

| Feature | Reason |
|---------|--------|
| LED `ToolShell.tsx` | Leave dirty; never commit this chrome |
| `src/lib/crontab.ts` | Unrelated dirty file, not this milestone |
| Popping `stash@{0}` or `stash@{1}` | Overlay chrome / unrelated i18n — do not mix |
| Creating a GitHub remote or `gh repo create` | Workflow file only |
| Changing `SITE_ORIGIN` / `https://example.com` | No real domain yet |
| New catalog tools | This milestone is land-and-CI, not More Tools |
| Additional languages beyond EN + ZH | Stay bilingual |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| KERN-01 | Phase 11 | Pending |
| KERN-02 | Phase 11 | Pending |
| KERN-03 | Phase 11 | Pending |
| KERN-04 | Phase 11 | Pending |
| PAGE-01 | Phase 12 | Pending |
| PAGE-02 | Phase 12 | Pending |
| PAGE-03 | Phase 12 | Pending |
| PAGE-04 | Phase 12 | Pending |
| PAGE-05 | Phase 12 | Pending |
| ISLE-01 | Phase 13 | Pending |
| ISLE-02 | Phase 13 | Pending |
| ISLE-03 | Phase 13 | Pending |
| ISLE-04 | Phase 13 | Pending |
| CI-01 | Phase 14 | Pending |
| CI-02 | Phase 14 | Pending |

**Coverage:**

- v1.2 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-09-20*
*Last updated: 2026-09-20 after roadmap creation*
