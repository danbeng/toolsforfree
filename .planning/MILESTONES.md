# Milestones

## v1.1 Frontend Polish (Shipped: 2026-09-19)

**Delivered:** Visual-only polish — FOUC-safe light/dark theme, accessible mobile hamburger, 3-column catalog grid with spacing tokens, and button/panel/FAQ chrome — without touching tool logic or adding packages.

**Phases completed:** 7-10 (4 phases, 4 plans, 12 tasks)

**Key accomplishments:**

- FOUC-safe two-state light/dark theming via blocking ThemeInit, static header ThemeToggle, and HEAD CSS token split
- Accessible 640px hamburger overlay on HEAD chrome: static NavMenu button, inert+visibility hide, Escape/outside-pointer/widen close, EN/ZH labels from ui.ts
- Catalog `.card-grid` at 1/2/3 columns plus `:root` `--sp-1`…`--sp-12` on HEAD English home featured and `/tools/` category lists
- Native FAQ details/summary plus .tool-panel --border shadow, --sp-4 padding, and invert hover / color-mix active on .tool-panel button

**Stats:**

- 58 files in git range `935089d`..`d9d8079` (includes planning docs)
- +8935 / −175 lines
- 4 phases, 4 plans, 12 tasks
- 3 days product work (2026-09-16 → 2026-09-18); archived 2026-09-19

**Git range:** `feat(07-01)` → `docs(v1.1): add milestone audit`

**Closeout type:** override_closeout

**Known verification overrides:** Phases 7/8/9 `verification_status=stale` because later phases edited `global.css`; Phase 10 passed; human UAT passed for 7–10. Audit 22/22. 0 newly acknowledged `audit-open` items, 0 carried forward from a prior close.

**What's next:** `/gsd-new-milestone` — v2 candidates: three-state theme, theme animation, 4-col at 1440px

---

## v1.0 More Tools (Shipped: 2026-09-14)

**Phases completed:** 6 phases, 9 plans, 27 tasks

**Key accomplishments:**

- Vitest completeness harness that fails a missing ToolIsland slug-equals branch or missing EN/ZH markdown, with catalog snapshot 10 / featured 6 / grouping TOOLS.length and the 8-file island-split checklist in CONVENTIONS.md
- In-browser word-counter with Intl.Segmenter plus Han fallback, six metric tiles, and EN/ZH catalog parity at TOOLS length 11
- In-browser case/slug converter with nine fan-out rows, CJK-preserving slugify, and EN/ZH catalog parity at TOOLS length 12
- In-browser lorem generator with embedded Latin WORDS, words/paragraphs/classic toggle, and EN/ZH catalog parity at TOOLS length 13
- In-browser CSPRNG password generator with rejection sampling, charset toggles, and EN/ZH catalog parity at TOOLS length 14
- In-browser SQL pretty-print via sql-formatter@15.8.2 formatDialect, six named dialects, and EN/ZH catalog parity at TOOLS length 15
- In-browser line-level text-diff via named `diffLines` (diff@9.0.0), two-pane island, labeled copy payload, catalog 16
- In-browser GFM markdown-preview via marked@18.0.13 + DOMPurify@3.4.15, sanitized HTML copy payload, catalog 17
- In-browser qr-code generate plus file-decode via qr@0.7.0, canvas PNG download, catalog 18

---
