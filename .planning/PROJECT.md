# Devtoolbox — Frontend Polish

## What This Is

Devtoolbox is a static, bilingual (EN default + `/zh/`) catalog of browser-local developer tools. Computation stays in the visitor's browser; nothing is uploaded. The v1.0 milestone shipped 18 tools (10 existing + 8 new). This milestone optimizes the frontend visual layer: light/dark theme toggle, responsive mobile navigation, wider card grids, consistent spacing scale, and polished interactive chrome.

## Core Value

A visitor gets a polished, accessible, responsive experience across all 18 tools and every page — light or dark theme, desktop or mobile — without compromising the browser-local privacy model.

## Current Milestone: v1.1 Frontend Polish

**Goal:** Optimize frontend visual presentation across the entire site — theme toggle, mobile nav, wider grids, spacing scale, button/panel/FAQ polish.

**Target features:**
- Light mode + theme toggle (CSS variables split light/dark, system preference detection, manual toggle, localStorage persistence)
- Mobile hamburger menu (header nav collapse at ≤640px, accessible ☰ button)
- Card grid 3-column at wide screens + CSS variable spacing scale (4/8/12/16/24/32/48)
- Button hover/active states, tool-panel refinement, FAQ `<details>` collapsible

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
- ✓ Word / character counter — Phase 2
- ✓ Case / Slug converter — Phase 2
- ✓ Lorem ipsum generator — Phase 2
- ✓ Password generator — Phase 2
- ✓ SQL formatter — Phase 3
- ✓ Text Diff — Phase 4
- ✓ Markdown preview (sanitized GFM, remote images stripped) — Phase 5
- ✓ QR code generate + decode (PNG download + in-browser file decode, no camera) — Phase 6

### Active

- [ ] Light/dark theme with CSS variable split and system preference detection
- [ ] Theme toggle in header with localStorage persistence
- [ ] Mobile hamburger menu at ≤640px with accessible keyboard support
- [ ] Card grid 3-column layout at ≥1080px breakpoint
- [ ] CSS variable spacing scale (4/8/12/16/24/32/48)
- [ ] Button hover/active/focus-visible polish
- [ ] Tool-panel chrome refinement (consistent borders, shadows, spacing)
- [ ] FAQ `<details>` collapsible instead of always-visible `<dl>`

### Out of Scope

- Rewriting existing tool logic — visual layer only, no `src/lib` changes
- Adding new tools — this milestone is pure visual polish
- Component framework migration — stay Astro + Preact, no React/Vue/Svelte
- Tailwind or CSS-in-JS — stay with custom CSS variables and global.css
- Accessibility audit overhaul — fix obvious issues (mobile nav, contrast), not a full WCAG pass
- Animation library — CSS transitions only, no Framer Motion / GSAP
- Server-side rendering or SPA hydration beyond existing Preact islands
- Additional languages — stay EN + ZH

## Context

- Brownfield on `G:\海外练手项目`. Codebase already mapped (`.planning/codebase/`).
- Product name: Devtoolbox. Tagline: "Browser-based developer tools. Nothing is uploaded."
- Stack: Astro 7 SSG, Preact islands, TypeScript, Vitest, content collections, duplicated `src/pages/zh/` tree (not middleware i18n).
- Catalog (`TOOLS` in `src/data/tools.ts`) drives `getStaticPaths`. Markdown is SEO/how-to/FAQ only.
- Current global.css is dark-only (`color-scheme: dark` hardcoded in `:root`). No light mode tokens exist.
- Fonts: IBM Plex Mono + IBM Plex Sans + Syne via Google Fonts CDN (already preconnected).
- Body background has a distinctive grid-line pattern that needs light-mode adaptation.
- Header is sticky with backdrop blur; nav links wrap on mobile without a hamburger menu.
- `card-grid` is 1-col → 2-col at 720px; no 3-col breakpoint.
- Tool-panel chrome uses LED indicator concept; buttons are minimal (border + accent).
- FAQ uses `<dl>` with no collapse mechanism.
- Dirty main has uncommitted i18n/pages/visual CSS overlay — work from HEAD, not dirty.

## Constraints

- **Visual only**: No changes to `src/lib/*` tool logic or `src/data/tools.ts` catalog entries — visual layer is isolated to CSS and component templates
- **Stack**: Stay on Astro + Preact + custom CSS variables — no Tailwind, no CSS-in-JS, no new framework
- **Baseline**: Work from HEAD commit, not the dirty CSS overlay on main
- **Privacy**: All tool computation stays in the browser; theme toggle is localStorage-only, no server state
- **Bilingual parity**: Theme toggle and mobile nav must work in both EN and ZH trees
- **Do not rewrite tools**: Existing tool UI components get CSS-level polish only, not structural rewrites

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Eight locked tools (Markdown preview, Diff, SQL format, Case/Slug, Password, Word count, Lorem, QR generate+decode) | Competitor-gap mix: developer daily + light consumer; all doable client-side | All eight shipped through Phase 6 (catalog 18, featured 6) |
| Ship at existing-tool parity (not "tools first, copy later") | Catalog SEO and bilingual UX are part of the product, not a follow-up | Honored through Phase 6 (catalog 18, featured 6) |
| QR includes decode from image, not just generate | User chose generate+decode; still browser-local | Honored — file decode, no camera |
| No general image tools, no backend, no i18n expansion, no rewrite of the ten | Keeps milestone additive and within current architecture | Honored |
| Brownfield additive milestone, not a greenfield site | Code and map already exist | Honored |
| Visual polish milestone scope (theme, mobile nav, grid, spacing, chrome) | User selected all four areas; baseline is HEAD not dirty overlay | Pending |
| CSS variables for light/dark split (not media-query-only) | Enables manual toggle + system preference + localStorage | Pending |
| Hamburger menu via pure CSS + checkbox (no JS framework dependency) | Lightweight, works with Astro static output | Pending |

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

---
*Last updated: 2026-09-15 after v1.1 Frontend Polish milestone start*
