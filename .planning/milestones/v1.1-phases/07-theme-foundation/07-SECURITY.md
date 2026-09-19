---
phase: "7"
slug: "theme-foundation"
status: verified
threats_open: 0
asvs_level: 1
created: "2026-09-16"
---

# Phase 7 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Visitor browser → documentElement | Untrusted `localStorage` string and `matchMedia` result become `data-theme` on `html` | Non-secret theme literal |
| Visitor click → storage | Toggle writes the `theme` key; must not persist attacker-controlled markup | `light` or `dark` literal |
| Theme scripts → page JS | Inline scripts run in page origin; must not eval or inject HTML | No user HTML |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-07-01 | Tampering | ThemeInit.astro / ThemeToggle.astro | high | mitigate | Allowlist `light`\|`dark` before `setAttribute`; never assign storage into HTML; literals only | closed |
| T-07-02 | Information disclosure | Theme persistence | medium | mitigate | Origin-scoped `localStorage` only; no cookies; value is not a secret | closed |
| T-07-03 | Denial of service | ThemeInit.astro storage get | medium | mitigate | `try/catch` around storage; still `setAttribute` from `matchMedia` so the page paints | closed |
| T-07-04 | Elevation of privilege | ThemeInit inline script | low | accept | No CSP in repo today; IIFE has no `eval`; future CSP would allow this hash or a nonce | closed |
| T-07-05 | Repudiation | Theme preference | low | accept | Preference is not an audit event; no accounts | closed |
| T-07-06 | Spoofing | ThemeToggle button | low | accept | Control is not an auth surface; `aria-label` is static English chrome | closed |
| T-07-SC | Tampering | npm/pip/cargo installs | high | accept | No package-manager install tasks this phase; Playwright and icon packs not added | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

Evidence (L1 grep):

- `ThemeInit.astro`: `getItem` in try/catch; allowlist `light`/`dark` then `matchMedia`; always `setAttribute`; no `setItem`, no `eval`, no `innerHTML`
- `ThemeToggle.astro`: next theme is ternary `light`/`dark`; `setItem` in try/catch; no `eval`, no `innerHTML`

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-07-04 | T-07-04 | No CSP today; keep the IIFE tiny with no eval | PLAN.md threat model | 2026-09-16 |
| R-07-05 | T-07-05 | Preference is not an audit event | PLAN.md threat model | 2026-09-16 |
| R-07-06 | T-07-06 | Toggle is not an auth surface | PLAN.md threat model | 2026-09-16 |
| R-07-SC | T-07-SC | No package-manager install this phase | PLAN.md threat model | 2026-09-16 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-09-16 | 7 | 7 | 0 | gsd-secure-phase (ASVS L1, skip auditor — register at plan time, threats_open 0) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-09-16
