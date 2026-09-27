# Devtoolbox

## What This Is

Devtoolbox is a static, bilingual (EN default + `/zh/`) catalog of 18 browser-local developer tools. Computation stays in the visitor's browser; nothing is uploaded. v1.0 shipped the catalog. v1.1 shipped visual polish. v1.2 shipped the ZH tree, LangSwitch, locale tool chrome, and a GitHub Actions workflow file. v1.3 published it: live at https://danbeng.github.io/toolsforfree/ from https://github.com/danbeng/toolsforfree.

## Core Value

A visitor gets a polished, accessible, responsive experience across all 18 tools and every page — light or dark theme, desktop or mobile — without compromising the browser-local privacy model.

## Current State

**Shipped:** v1.0 More Tools (2026-09-14) + v1.1 Frontend Polish (2026-09-19) + v1.2 Bilingual Land (2026-09-22) + v1.3 Ship (2026-09-27)

- Live: https://danbeng.github.io/toolsforfree/ (GitHub Pages project site, public repo `danbeng/toolsforfree`)
- CI: `ci.yml` (Node 22, `contents: read`) on every push/PR to `main`; `deploy.yml` publishes `dist/` only after CI succeeds for the same SHA
- Origin: `SITE_ORIGIN` and `site` = `https://danbeng.github.io`; `base: '/toolsforfree'`; every internal href, canonical, hreflang, sitemap and robots line goes through `src/i18n/base.ts` (`withBase` / `stripBase`)
- 404: `noindex`, no canonical, no alternates; LangSwitch to the two home pages

- 18 catalog tools, featured set of 6, EN unprefixed + `/zh/` tree
- Theme: `data-theme` on `<html>`, `ThemeInit.astro` first in `<head>`, static `ThemeToggle`, localStorage only on click
- Nav: `NavMenu.astro` hamburger at ≤640px (`<button>` + ARIA, Escape, inert, EN/ZH labels)
- Catalog: `.card-grid:not(.tool-grid)` 1-col → 2-col at 720px → 3-col at 1080px; `a.tool-card`; `--sp-1`…`--sp-12` on `:root`
- Chrome: `.tool-panel` shadow + `--sp-4` padding; `.tool-panel button` invert hover / color-mix active; FAQ native `details`/`summary`
- Stack unchanged: Astro 7 SSG + Preact islands + custom CSS. No Tailwind, no new npm packages this milestone.

**Known debt (still fenced):** Unrelated dirty `src/lib/crontab.ts` stays uncommitted. Do not pop `stash@{0}` or `stash@{1}`. LED `ToolShell` stays uncommitted.

**Known debt (v1.3):** `CONTACT_EMAIL` is still the placeholder `hello@example.com` and is publicly visible on the about pages. `robots.txt` under a project-site path is not read by crawlers. Missing `/zh/...` paths show the English 404. Phases 16-18 have no VALIDATION.md.

## Next Milestone Goals

Not started. `/gsd-new-milestone` when ready. Carried forward:

- Custom domain + DNS cutover (CUT-01..03): register a domain, attach it in Pages settings, then in one commit remove `base` and set `SITE_ORIGIN` / `site` to the new origin (`withBase` becomes a no-op)
- Real contact mailbox, or remove the placeholder address from the about pages
- Deferred v2: three-state theme, theme animation, 4-col grid at 1440px, preview deploys per PR, Search Console

## Requirements

### Validated

- ✓ JSON Formatter / Validator — existing
- ✓ JWT Decoder (decode only, not verify) — existing
- ✓ Base64 Encode / Decode — existing
- ✓ URL Encode / Decode — existing
- ✓ Hash Generator (SHA-256 / SHA-1) — existing
- ✓ UUID v4 Generator — existing
- ✓ Regex Tester — existing
- ✓ Unix Timestamp Converter — existing
- ✓ Crontab Explainer — existing
- ✓ Color Converter — existing
- ✓ EN + ZH tool pages, header/footer, lang switch, sitemap — existing
- ✓ Tool catalog (`src/data/tools.ts`) as routing source of truth — existing
- ✓ Browser-local processors in `src/lib` + Preact islands + ToolShell — existing
- ✓ Word / character counter — v1.0 Phase 2
- ✓ Case / Slug converter — v1.0 Phase 2
- ✓ Lorem ipsum generator — v1.0 Phase 2
- ✓ Password generator — v1.0 Phase 2
- ✓ SQL formatter — v1.0 Phase 3
- ✓ Text Diff — v1.0 Phase 4
- ✓ Markdown preview (sanitized GFM, remote images stripped) — v1.0 Phase 5
- ✓ QR code generate + decode (PNG download + in-browser file decode, no camera) — v1.0 Phase 6
- ✓ Light/dark theme with CSS variable split and system preference detection — v1.1
- ✓ Theme toggle in header with localStorage persistence — v1.1
- ✓ Mobile hamburger menu at ≤640px with accessible keyboard support — v1.1
- ✓ Card grid 3-column layout at ≥1080px breakpoint — v1.1
- ✓ CSS variable spacing scale (`--sp-1`…`--sp-12`) — v1.1
- ✓ Button hover/active/focus-visible polish — v1.1
- ✓ Tool-panel chrome refinement (consistent borders, shadows, spacing) — v1.1
- ✓ FAQ `<details>` collapsible instead of always-visible `<dl>` — v1.1
- ✓ Header LangSwitch, seven ZH routes, EN locale pass, sitemap i18n — v1.2
- ✓ No-LED ToolShell locale Copy/Copied on all 18 islands — v1.2
- ✓ GitHub Actions workflow file (Node 22, `npm ci`, `npm test`, `astro build`) — v1.2

- ✓ 404 LangSwitch/canonical/hreflang never advertise `/zh/404/`; 404 is `noindex` — v1.3 Phase 15 (canonical removed in Phase 18)
- ✓ ToolCard and RelatedTools fall back to catalog name/description instead of throwing — v1.3 Phase 15
- ✓ GitHub remote `danbeng/toolsforfree`; `main` and tag `v1.2` pushed; CI runs and is green — v1.3 Phase 16
- ✓ GitHub Pages deploy gated on CI; trailing-slash URLs and site 404 live — v1.3 Phase 17
- ✓ Origin `https://danbeng.github.io` with `/toolsforfree` base on every internal link and SEO URL — v1.3 Phase 18

### Active

None. Next milestone not started.

### Out of Scope

- LED `ToolShell.tsx` — leave dirty; never commit this chrome
- `src/lib/crontab.ts` — unrelated dirty file
- Popping `stash@{0}` or `stash@{1}`
- Inventing a domain, GitHub owner, or mailbox — the user supplies them
- New catalog tools — not planned
- Three-state theme toggle — deferred v2
- Smooth theme transition animation — deferred v2
- Card grid 4-col at 1440px — deferred v2
- Component framework migration — stay Astro + Preact
- Tailwind or CSS-in-JS
- Additional languages beyond EN + ZH

## Context

- Brownfield on `G:\海外练手项目`. Codebase mapped in `.planning/codebase/`.
- Product name: Devtoolbox. Tagline: "Browser-based developer tools. Nothing is uploaded."
- Stack: Astro 7 SSG, Preact islands, TypeScript, Vitest, content collections, duplicated `src/pages/zh/` tree.
- Catalog (`TOOLS`) drives `getStaticPaths`. Markdown is SEO/how-to/FAQ only.
- v1.1 closeout: `override_closeout` — phases 7/8/9 verification digest stale after later `global.css` edits; human UAT passed; Phase 10 verification passed; audit 22/22.
- v1.2 lands the ZH overlay that v1.1 refused to mix into visual commits. LED ToolShell and `crontab.ts` stay out.
- v1.3 closeout: `verified_closeout` — phases 15, 16, 18 read stale (Phase 18 edited files Phase 15 fingerprinted; summaries gained frontmatter) and were re-verified on current code; all four passed. Audit 15/15, integration PASS, status `tech_debt`.

## Constraints

- **Privacy**: All tool computation stays in the browser; theme is localStorage-only
- **Stack**: Astro + Preact + custom CSS variables — no Tailwind, no new framework
- **Path-limited add**: Never `git add -A`; do not stage LED ToolShell, `crontab.ts`, or stash contents
- **Do not pop stashes**: `stash@{0}` `gsd-phase7-overlay-chrome-temp`; `stash@{1}` `pre-02-01-merge unrelated i18n`
- **CI and deploy**: `ci.yml` stays a read-only Node 22 test/build gate; `deploy.yml` is the only publisher and runs only after CI succeeds for the same SHA. Plain pushes only; never force-push or retag
- **Do not rewrite tools**: Catalog logic and `src/lib` processors stay as shipped (except do not commit dirty `crontab.ts`)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Eight locked tools (Markdown preview, Diff, SQL format, Case/Slug, Password, Word count, Lorem, QR generate+decode) | Competitor-gap mix: developer daily + light consumer; all doable client-side | ✓ All eight shipped through Phase 6 (catalog 18, featured 6) |
| Ship at existing-tool parity (not "tools first, copy later") | Catalog SEO and bilingual UX are part of the product | ✓ Honored through Phase 6 |
| QR includes decode from image, not just generate | User chose generate+decode; still browser-local | ✓ File decode, no camera |
| No general image tools, no backend, no i18n expansion, no rewrite of the ten | Keeps milestone additive | ✓ Honored |
| Visual polish milestone scope (theme, mobile nav, grid, spacing, chrome) | User selected all four areas; baseline is HEAD not dirty overlay | ✓ Phases 7–10 shipped |
| FAQ is native details/summary; panel/button chrome is CSS only | Locked Phase 10 CONTEXT; HEAD ToolShell unclassed Copy | ✓ Phase 10 |
| Catalog grid uses `.card-grid:not(.tool-grid)` and `a.tool-card` | HEAD WordCounter/TextDiff reuse those class names on metric tiles (CR-01) | ✓ Phase 9 `ecac093` |
| CSS variables for light/dark split (not media-query-only) | Enables manual toggle + system preference + localStorage | ✓ Phase 7 |
| ThemeInit never writes storage; first visit follows OS until click | THM-05; two-state only | ✓ Phase 7 |
| Hamburger menu via `<button>` + ARIA (not checkbox hack) | Accessible open/close, Escape, EN+ZH labels | ✓ Phase 8 |
| Repo public so GitHub Pages can serve it | Private Pages returned HTTP 422 on the user's plan; user chose public (2026-09-23) | ✓ Phase 17 |
| GitHub Pages hostname as origin, custom domain deferred | No domain registered; user chose github.io over keeping `example.com` (2026-09-24) | ✓ Phase 18; CUT-01..03 carried forward |
| Base-aware hrefs via `withBase`, path helpers stay logical | Project site needs `/toolsforfree`; `path.ts` tests stay unchanged; helper becomes a no-op when `base` is removed | ✓ Phase 18 |
| Noindex 404 emits no canonical | `/toolsforfree/404/` really 404s (Astro builds `404.html`); a canonical to a 404 contradicts `noindex` | ✓ Phase 18 (amends Phase 15) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

<details>
<summary>v1.1 milestone brief (archived 2026-09-19)</summary>

v1.1 was a visual-only polish pass on the 18-tool catalog: light/dark theme with no FOUC, accessible ≤640px hamburger, catalog 3-col at ≥1080px plus `--sp-*` scale, then button/panel/FAQ chrome. No `src/lib` or catalog logic changes. No Tailwind. No new npm packages.

</details>

---
*Last updated: 2026-09-23 after starting v1.3 Ship*
