# Phase 7 — UI Review

**Audited:** 2026-09-16
**Baseline:** 07-UI-SPEC.md (approved)
**Screenshots:** not captured (Playwright out of phase scope; code-only against HEAD chrome: ThemeInit, ThemeToggle, ~230-line `global.css`)

Human UAT 9/9 already passed (FOUC, OS default, toggle, persistence, grid, diff hunks, desktop header). Hamburger / spacing scale / FAQ chrome are Phase 8–10 and are not scored as Phase 7 defects.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | `aria-label` is exactly `Toggle color theme`; no visible caption, no storage-error copy |
| 2. Visuals | 3/4 | Sun/moon + 44px hit target match contract; idle toggle has no hover (nav links do) |
| 3. Color | 4/4 | Dark `:root` and light override hex match UI-SPEC tables; accent not on idle toggle |
| 4. Typography | 4/4 | Toggle has no text; new CSS does not add 650/700; HEAD logo 650 left alone |
| 5. Spacing | 4/4 | 44×44 toggle, 1rem About–toggle gap, 47px/48px grid period as specified |
| 6. Experience Design | 4/4 | Blocking init, click persist, silent storage, first-visit OS default; UAT 9/9 |

**Overall: 23/24**

---

## Top 3 Priority Fixes

1. **Idle `#themeToggle` has no hover** — icon-only control is quieter than Tools/Blog/About (`color: var(--accent)` on hover) — **WARNING** — optional per UI-SPEC; if added, use `color: var(--accent)` only, no fill/border (Phase 10 owns button chrome).
2. **No pressed/current-theme announcement** — screen readers only hear `Toggle color theme` — contract explicitly forbids `aria-pressed` and a visually hidden current-state string this phase — defer to ZH/a11y work; do not add now.
3. **No theme `transition` on background/color** — paint is instant — contract: out of scope; do not add.

No BLOCKERs. Phase 7 chrome matches the design contract.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

- **Pass:** `src/components/ThemeToggle.astro:3` — `aria-label="Toggle color theme"` (verb + noun; not `Dark mode` / `Switch theme`).
- **Pass:** No visible “Theme” / “Dark” caption; SVGs `aria-hidden="true"`.
- **Pass:** Header keeps Tools / Blog / About labels and `/tools/` `/blog/` `/about/` hrefs (`Header.astro:9–12`).
- **Pass:** Storage failures are `try/catch` swallowed in ThemeInit and ThemeToggle; no toast, no `role="alert"`.
- **Finding (informational):** English-only chrome is the locked contract; ZH keys deferred to Phase 10.

### Pillar 2: Visuals (3/4)

- **Pass:** Both sun and moon SVGs always in the DOM; CSS flips visibility (`global.css:86–88`). Sun default (dark / missing `data-theme`); moon when `data-theme="light"`.
- **Pass:** `#themeToggle` after About inside `.nav-links`; 44×44 inline-flex, transparent, `color: var(--text)`, no accent fill/border.
- **Pass:** Desktop one-row header is UAT test 9 pass; hamburger is Phase 8.
- **WARNING:** `#themeToggle` has no `:hover` while `.nav-links a:hover` uses `--accent`. UI-SPEC says hover is not required this phase; still a hierarchy mismatch for the only icon-only header control.

### Pillar 3: Color (4/4)

Token tables in `src/styles/global.css:1–33` match UI-SPEC including light `--danger: #b91c1c` and `--grid-line: rgba(15, 23, 32, 0.10)`.

- Dark 60/30/10: `--bg #121417` / `--panel #1a1d21` / `--accent #2dd4bf`.
- Light 60/30/10: `--bg #f4f6f8` / `--panel #ffffff` / `--accent #0f766e`.
- Accent reserved: `a`, `.nav-links a:hover`, `:focus-visible`, existing `.tool-panel button` — not canvas, grid, toggle default, or diffs.
- Diff hunks: `--diff-add-fg/bg`, `--diff-del-fg`; eq `--muted`; no `--diff-del-bg`.
- `color-scheme: dark` on `:root`; `light` only on `:root[data-theme="light"]`; no `light dark`; no color-scheme meta.
- Shared `--mono` / `--sans` / `--content` only on `:root`.
- CSS line count 230 — HEAD chrome, not 662-line overlay.

### Pillar 4: Typography (4/4)

- Toggle has no visible type; no `font-weight` on `#themeToggle`.
- HEAD `.nav a.logo { font-weight: 650 }` unchanged (`global.css:62`).
- New phase CSS does not introduce a third weight or display face.
- Fonts remain Segoe UI / system-ui and ui-monospace — no IBM Plex / Syne.

### Pillar 5: Spacing (4/4)

- Toggle: width/height/min-width/min-height 44px; padding/margin 0 (`global.css:66–76`).
- `.nav-links { gap: 1rem }` — About-to-toggle spacing is the declared md (16px).
- Body grid: `transparent` through 47px, `--grid-line` 47px–48px (`global.css:45–51`).
- `.nav` `min-height: 3.25rem` and `gap: 1.25rem` left as HEAD.
- Diff `padding-left: 4px`; `.diff-lines` max-height 384px unchanged.
- No `--sp-*` tokens (Phase 9).

### Pillar 6: Experience Design (4/4)

- ThemeInit blocking `is:inline` first child of `<head>` before charset (`BaseLayout.astro:21–22`).
- Allowlist `light|dark`; else `prefers-color-scheme`; always `setAttribute`; **no `setItem`** in ThemeInit.
- ThemeToggle click: next = light→dark else light; `setAttribute` then `try/catch setItem`.
- Static Astro, not Preact; works on first click.
- Invalid storage never reaches `setAttribute`.
- Missing `data-theme` falls back to `:root` dark + sun icon.
- No loading skeleton, no empty-theme illustration, no confirm dialog.
- UAT 9/9: FOUC, OS default, click, idempotency, last-click-wins, route persistence, light grid + color-scheme, diff hunks, desktop header.

---

## Files Audited

- `src/components/ThemeInit.astro`
- `src/components/ThemeToggle.astro`
- `src/layouts/BaseLayout.astro`
- `src/components/Header.astro`
- `src/styles/global.css` (230 lines, HEAD chrome)
- `.planning/phases/07-theme-foundation/07-UI-SPEC.md`
- `.planning/phases/07-theme-foundation/07-01-PLAN.md`
- `.planning/phases/07-theme-foundation/07-01-SUMMARY.md`
- `.planning/phases/07-theme-foundation/07-CONTEXT.md`
- `.planning/phases/07-theme-foundation/07-UAT.md`

Registry audit: skipped (`components.json` absent; UI-SPEC third-party registries none).
