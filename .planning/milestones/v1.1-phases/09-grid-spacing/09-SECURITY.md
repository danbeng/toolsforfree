---
phase: "9"
slug: "grid-spacing"
status: verified
threats_open: 0
asvs_level: 1
created: "2026-09-18"
---

# Phase 9 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| SSG TOOLS registry → catalog HTML | Featured and category cards are static anchors from `getFeaturedTools` / `getToolsByCategory`; no visitor input | Public tool names and slugs |
| Viewport → CSS Grid tracks | `min-width: 720px` / `1080px` in `global.css` decide 1 / 2 / 3 columns | Public layout CSS |
| Git index → overlay files | Dirty ZH tree and locale switcher must not enter the commit (T-09-01) | Untracked overlay paths |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-09-01 | Tampering | git commit / overlay pages | high | mitigate | Restore HEAD three catalog files; path-limited git add of in-scope files only; never commit `src/pages/zh/` or `LangSwitch.astro`; do not pop stash@{0} or stash@{1} | closed |
| T-09-02 | Tampering | `.tool-grid` vs `.card-grid` | medium | mitigate | Catalog uses `.card-grid:not(.tool-grid)` (CR-01 `ecac093`); `.tool-grid.split` stays 2-col at 720px only; `a.tool-card` so island `div.tool-card` is excluded | closed |
| T-09-03 | Tampering | Catalog markup | low | mitigate | No new scripts this phase; no innerHTML; cards remain ordinary SSG anchors | closed |
| T-09-04 | Information disclosure | Grid / theme | low | accept | Column count is public CSS; theme localStorage is unchanged from Phase 7 | closed |
| T-09-05 | Denial of service | Layout CSS | low | accept | Static CSS Grid; no runtime layout worker | closed |
| T-09-06 | Spoofing | `.tool-card` links | low | accept | hrefs come from the TOOLS registry slugs; not an auth surface | closed |
| T-09-07 | Repudiation | Catalog clicks | low | accept | Public static pages; no accounts or audit log | closed |
| T-09-08 | Elevation of privilege | Spacing tokens | low | accept | Custom properties are not an access-control boundary | closed |
| T-09-SC | Tampering | npm/pip/cargo installs | high | accept | No package-manager install this phase; Playwright, Tailwind, and icon packs not added | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

Evidence (L1 grep + git):

- Path-limited production commits: `abe7151` (`src/pages/index.astro`, `src/pages/tools/index.astro`, `src/styles/global.css`), `7332634` (`global.css`), `ecac093` (`global.css`)
- `git log abe7151^..HEAD -- src/pages/zh src/components/LangSwitch.astro` empty; both remain untracked
- `git stash list` still has `gsd-phase7-overlay-chrome-temp` and `pre-02-01-merge unrelated i18n`
- `src/lib/layout.ts` does not exist; `package.json` / `package-lock.json` unchanged vs `058419a`
- `.tool-grid { gap: 1rem }` and `.tool-grid.split` 2-col at 720px only; 1080px rule is `.card-grid:not(.tool-grid)`
- `WordCounter.tsx` / `TextDiff.tsx` still `class="tool-grid card-grid"` + `div.tool-card` — excluded by `:not(.tool-grid)` / `a.tool-card`
- Catalog pages have no `<script>` / `innerHTML`; `ToolCard.astro` is `<a class="tool-card" href={/tools/${tool.slug}/}>`

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-09-04 | T-09-04 | Column count is public CSS; theme storage unchanged | PLAN.md threat model | 2026-09-18 |
| R-09-05 | T-09-05 | Static CSS Grid; no layout worker | PLAN.md threat model | 2026-09-18 |
| R-09-06 | T-09-06 | Card hrefs are TOOLS slugs, not auth | PLAN.md threat model | 2026-09-18 |
| R-09-07 | T-09-07 | Public static pages; no accounts | PLAN.md threat model | 2026-09-18 |
| R-09-08 | T-09-08 | `--sp-*` is not an access-control boundary | PLAN.md threat model | 2026-09-18 |
| R-09-SC | T-09-SC | No package-manager install this phase | PLAN.md threat model | 2026-09-18 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-09-18 | 9 | 9 | 0 | gsd-security-auditor (ASVS L1, register at plan time) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-09-18
