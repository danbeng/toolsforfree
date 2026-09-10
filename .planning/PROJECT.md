# Devtoolbox — More Tools Milestone

## What This Is

Devtoolbox is a static, bilingual (EN default + `/zh/`) catalog of browser-local developer tools. Computation stays in the visitor's browser; nothing is uploaded. This milestone adds eight missing catalog tools at the same standard as the existing ten: Preact island + `src/lib` processor + EN/ZH pages + SEO/how-to/FAQ markdown + catalog/related-tools wiring.

## Core Value

A visitor can open any of the eight new tools, run it entirely in the browser, and get a correct result without sending data anywhere — with the same EN/ZH, SEO, and catalog treatment as the tools already shipped.

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

### Active

- [ ] Markdown preview (render Markdown to HTML in the browser)
- [ ] Text Diff (compare two texts, show a readable diff)
- [ ] SQL formatter (pretty-print SQL in the browser)
- [ ] Case / Slug converter (upper/lower/title/camel/snake/kebab + URL slug)
- [ ] Password generator (length, charset options, copy result)
- [ ] Word / character counter (counts for pasted text)
- [ ] Lorem ipsum generator (paragraphs/words, copy result)
- [ ] QR code generate + decode (text/URL → QR image download; image → decoded text, still in-browser)

Each new tool must ship at existing-tool parity: `src/lib` logic, Preact UI via ToolIsland/ToolShell, catalog entry + related slugs, EN and ZH routes, content-collection SEO/how-to/FAQ in both locales.

### Out of Scope

- General image processing (compress, crop, format convert, OCR) — not this milestone; QR decode is the only image-in exception
- Accounts, saved history, cloud APIs, server-side file upload — site remains static / browser-local
- Rewriting the existing ten tools — they only get catalog/related-tool links if needed
- Additional languages or a new site/domain — stay EN + ZH
- JWT verification, HMAC as a new product surface, YAML↔JSON, HTML encode, number-base converter, CSS/JS minify — considered and deferred; not in the locked eight
- QR scanning via camera stream — decode is from an uploaded/selected image file in the browser, not a live camera app

## Context

- Brownfield on `G:\海外练手项目`. Codebase already mapped (`.planning/codebase/`).
- Product name: Devtoolbox. Tagline: "Browser-based developer tools. Nothing is uploaded."
- Stack in use: Astro 7 SSG, Preact islands, TypeScript, Vitest, content collections, duplicated `src/pages/zh/` tree (not middleware i18n).
- Catalog (`TOOLS` in `src/data/tools.ts`) drives `getStaticPaths`. Markdown is SEO/how-to/FAQ only.
- Existing categories: Format, Auth, Encode, Generate, Text, Time, Color. New tools will need category assignments (likely Format / Text / Generate; QR may need a new category or sit under Generate).
- Motivation: close competitor gaps vs developer-tool sites and light consumer utilities, without becoming a TinyWow-scale kitchen sink.
- Target batch size: 6–10 tools; locked list is 8.

## Constraints

- **Privacy / architecture**: All tool computation in the browser (`src/lib`); no new API routes for tool logic — matches SITE_TAGLINE and existing pattern
- **Parity**: New tools must match existing tool quality (UI chrome, copy-to-clipboard, errors, EN+ZH, FAQ) — user-stated definition of done
- **Stack**: Stay on Astro + Preact + current catalog/content-collection pattern — do not introduce a new app framework
- **QR decode**: In-browser only (selected image file); no server OCR/decode API
- **Do not rewrite**: Existing ten tools are validated; this milestone is additive

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Eight locked tools (Markdown preview, Diff, SQL format, Case/Slug, Password, Word count, Lorem, QR generate+decode) | Competitor-gap mix: developer daily + light consumer; all doable client-side | — Pending |
| Ship at existing-tool parity (not "tools first, copy later") | Catalog SEO and bilingual UX are part of the product, not a follow-up | — Pending |
| QR includes decode from image, not just generate | User chose generate+decode; still browser-local | — Pending |
| No general image tools, no backend, no i18n expansion, no rewrite of the ten | Keeps milestone additive and within current architecture | — Pending |
| Brownfield additive milestone, not a greenfield site | Code and map already exist | — Pending |

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
*Last updated: 2026-09-11 after initialization*
