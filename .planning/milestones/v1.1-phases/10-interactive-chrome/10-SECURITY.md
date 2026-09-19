---
phase: "10"
slug: "interactive-chrome"
status: verified
threats_open: 0
asvs_level: 1
created: "2026-09-18"
---

# Phase 10 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| SSG FAQ strings → HTML | Author markdown `{ question, answer }` rendered as text in FaqList; not visitor input | Public FAQ copy |
| Pointer/keyboard → CSS | `:hover` / `:active` / `:focus-visible` on `.tool-panel button` and `.faq summary` | Public chrome CSS |
| Git index → overlay files | Dirty ZH tree, locale switcher, and Preact shell must not enter the commit (T-10-01) | Untracked overlay paths |
| Worktree overlay → astro build | Dirty pages may `UNRESOLVED_IMPORT`; isolate for build proof then restore | Overlay backup in git-dir |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-10-01 | Tampering | git commit / overlay pages / astro build | high | mitigate | Restore HEAD FaqList before markup; path-limited git add of FaqList.astro and global.css only; never commit `src/pages/zh/` or `LangSwitch.astro`; do not pop stash@{0} or stash@{1}; isolate overlay for build then restore | closed |
| T-10-02 | Tampering | FaqList.astro answer/question render | medium | mitigate | Astro text interpolation only; never HTML-raw FAQ strings | closed |
| T-10-03 | Elevation of privilege | global button hover | medium | mitigate | Selector is `.tool-panel button` only so `#navToggle` / `#themeToggle` cannot inherit invert | closed |
| T-10-04 | Tampering | FAQ widget | low | mitigate | Native details; no accordion script this phase | closed |
| T-10-05 | Information disclosure | Theme / contrast | low | accept | Theme localStorage is unchanged from Phase 7; contrast is public CSS | closed |
| T-10-06 | Denial of service | Chrome CSS | low | accept | Static CSS and native HTML; no layout worker | closed |
| T-10-07 | Spoofing | Copy button | low | accept | Clipboard write stays existing HEAD ToolShell; this phase does not edit it | closed |
| T-10-08 | Repudiation | FAQ clicks | low | accept | Public static pages; no accounts or audit log | closed |
| T-10-SC | Tampering | npm/pip/cargo installs | high | accept | No package-manager install this phase; Playwright, Tailwind, contrast tools, and icon packs not added | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

Evidence (L1 grep + git):

- Path-limited production commits: `1894858` (`src/components/FaqList.astro`, `src/styles/global.css`), `d6059ca` (`global.css`)
- `git log 1894858^..HEAD -- src/pages/zh src/components/LangSwitch.astro src/components/ToolShell.tsx` empty
- `git stash list` still has `gsd-phase7-overlay-chrome-temp` and `pre-02-01-merge unrelated i18n`
- `FaqList.astro` uses `{item.question}` / `{item.answer}` text interpolation; no `innerHTML` / `set:html`
- Hover is `.tool-panel button:hover:not(:disabled)`; no global `button:hover`
- Native `<details>` / `<summary>`; no `open`, `name=`, or accordion script
- `package.json` / `package-lock.json` unchanged; `src/lib/chrome.ts` does not exist

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-10-05 | T-10-05 | Theme storage unchanged; contrast is public CSS | PLAN.md threat model | 2026-09-18 |
| R-10-06 | T-10-06 | Static CSS and native HTML; no layout worker | PLAN.md threat model | 2026-09-18 |
| R-10-07 | T-10-07 | Clipboard stays HEAD ToolShell; this phase did not edit it | PLAN.md threat model | 2026-09-18 |
| R-10-08 | T-10-08 | Public static FAQ; no accounts | PLAN.md threat model | 2026-09-18 |
| R-10-SC | T-10-SC | No package-manager install this phase | PLAN.md threat model | 2026-09-18 |

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
