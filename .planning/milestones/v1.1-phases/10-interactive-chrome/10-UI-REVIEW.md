# Phase 10 — UI Review

**Audited:** 2026-09-18
**Baseline:** 10-UI-SPEC.md (approved contract)
**Screenshots:** not captured (code-only audit; Playwright forbidden this review)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Committed FaqList is English `FAQ` + no empty CTA; dirty worktree ToolShell uses locale `copy.copy` / `chromeLocal` against HEAD contract |
| 2. Visuals | 2/4 | CSS panel/FAQ match spec; worktree ToolShell LED `tool-panel__chrome` competes with `.tool-panel` as primary anchor |
| 3. Color | 3/4 | Hover invert, color-mix active, `--border` shadow, FAQ `--text` / `::marker` match; CHR-07 4.5:1 is human backstop, not proven |
| 4. Typography | 4/4 | New FAQ CSS is 16px/600 summary and 16px/400 answers; logo `font-weight: 650` left alone |
| 5. Spacing | 4/4 | `.tool-panel` `padding: var(--sp-4)`; FAQ `--sp-4` / `--sp-2`; button padding still `0.4rem 0.8rem` |
| 6. Experience Design | 3/4 | Hover/active/disabled/reduced-motion/native details present; contrast + live invert remain UAT; dirty shell changes Copy chrome |

**Overall: 19/24**

---

## Top 3 Priority Fixes

1. **Dirty `ToolShell.tsx` LED overlay** — Live worktree shows `tool-panel__chrome` + `led` + Output bar, which UI-SPEC forbids as a second hero — Restore HEAD ToolShell (unclassed Copy inside `.tool-panel`) or keep overlay unshipped; do not treat the dirty file as Phase 10 chrome.
2. **CHR-07 contrast UAT still open** — Hover `--bg` on accent, active color-mix, idle accent-on-panel, FAQ `--text` on canvas need eyeball 4.5:1 in both themes — Human viewport check; do not invent pass/fail from CSS.
3. **Worktree Copy labels vs HEAD `Copy` / `Copied`** — Overlay `t(locale)` can ship ZH or `copy.output` chrome on a HEAD English contract — Do not commit ToolShell / `src/pages/zh/` / LangSwitch with this phase.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Committed phase files match contract**

- `src/components/FaqList.astro:8` — `<h2>FAQ</h2>` English, no `heading` prop.
- No `open`, no `name=`, no “No questions yet” / “Nothing to copy”.
- Empty FAQ is heading + empty `.faq` wrapper (`items.map` over `[]`).

**WARNING — worktree overlay (not in Phase 10 commits)**

- `src/components/ToolShell.tsx:13-36` uses `copy.copy` / `copy.copied` / `copy.output` / `copy.chromeLocal` instead of HEAD `Copy` / `Copied`.
- UI-SPEC: do not localize ToolShell Copy; do not add overlay copy keys.

Generic `Submit` / `Click Here` not found in in-scope chrome.

### Pillar 2: Visuals (2/4)

**CSS (in-scope) meets hierarchy**

- `.tool-panel` (`global.css:157-163`): `--panel` fill, 1px `--border`, `box-shadow: 0 1px 2px var(--border)`, radius 8px.
- FAQ is secondary `details`/`summary`; UA `summary::marker` (`:383-385`); no `list-style: none`, no chevron SVG.
- Hover/active scoped to `.tool-panel button` only; `#navToggle` / `#themeToggle` remain 44px transparent (`:78-91`, `:129-143`).
- No `transform:` on buttons.

**WARNING / BLOCKER-adjacent in worktree**

- Dirty `ToolShell.tsx:23-27` adds LED `tool-panel__chrome` — UI-SPEC: “Do not add overlay LED `tool-panel__chrome` to compete with that panel.”
- `.led` has **no** rules in `global.css`, so the span is an unstyled extra node if the overlay hydrates — still a hierarchy/contract miss versus HEAD markup.

Classification: **WARNING** for shipped CSS+FaqList; treat LED as **must-not-ship** with Phase 10.

### Pillar 3: Color (3/4)

Matches Token implementation:

- Idle button: transparent + `color`/`border` `var(--accent)` (`:168-174`).
- Hover: `background: var(--accent); color: var(--bg)` (`:176-178`).
- Active: `color-mix(in srgb, var(--accent) 72%, #000000)` fill and border (`:180-183`).
- Disabled: `opacity: 0.45` (`:185-187`).
- FAQ summary/answer/`::marker`: `var(--text)` not `--muted`.
- Accent not used as FAQ fill or panel idle border.
- Global `a:focus-visible, button:focus-visible` kept (`:68`); extra outline only on `.faq summary:focus-visible` (`:386-388`).

**WARNING:** CHR-07 / D4 contrast is explicitly a **human backstop**. Code cannot prove 4.5:1. Light-theme hover (`#f4f6f8` on `#0f766e`) is the tight pair to eyeball.

No `--led` / `--shadow` / `--radius` tokens added. Phase 7 palettes unchanged (`:7-14`, `:34-40`).

### Pillar 4: Typography (4/4)

New CSS weights 400 and 600 only:

- `.faq summary`: 16px / 600 / 1.2 (`:374-379`).
- `.faq details > p`: 16px / 400 / 1.5 (`:390-396`).
- `.nav a.logo` still `font-weight: 650` (`:74`) — not “normalized”.
- `--sans` / `--mono` unchanged; no IBM Plex / Syne.

### Pillar 5: Spacing (4/4)

- `.tool-panel` padding `var(--sp-4)` not `1rem` (`:161`).
- `.faq details` `margin: 0 0 var(--sp-4)` (`:372`).
- `.faq summary` `padding: var(--sp-2) 0` (`:380`).
- Answer `margin: 0 0 var(--sp-2)` (`:391`).
- Left alone per spec: button `0.4rem 0.8rem`, form `0.6rem` / `0.75rem`, `.tool-grid` `gap: 1rem`, footer rem, 44px toggles, `--content: 52rem`, catalog `--sp-*`.
- Shadow geometry `0 1px 2px` not tokenized as spacing.

`--sp-1`…`--sp-12` remain on `:root` only; not duplicated under light theme.

### Pillar 6: Experience Design (3/4)

Covered in CSS/markup:

| State | Evidence |
|-------|----------|
| empty Copy | HEAD pattern `disabled={!props.output}`; CSS `:hover:not(:disabled)` / `:active:not(:disabled)` blocks invert |
| empty FAQ | heading + empty `.faq` |
| loading | none required (no fetch) |
| error | existing `.tool-error`; no clipboard-failure UI added |
| populated FAQ | one `<details>` per item, no `open` |
| independent accordion | no `name` on details |
| overflow | `overflow-wrap: anywhere` on summary and answer |
| reduced motion | `transition: none` (`:189-192`) |
| focus | global 2px + summary 2px / 2px offset |

**WARNING:** Contrast invert UAT not executed (do not invent). RESEARCH A1: unsupported `color-mix` may make `:active` equal `:hover`. A2: Safari `::marker` color may ignore `--text` while triangle still shows.

Dirty ToolShell still disables Copy when `!props.output` and uses 1500ms copied timeout — interaction timing matches; chrome structure does not.

---

## Registry Safety

shadcn not initialized (`components.json` absent). UI-SPEC third-party registries: none.

Registry audit: skipped (NO_SHADCN).

---

## Files Audited

- `.planning/phases/10-interactive-chrome/10-UI-SPEC.md`
- `.planning/phases/10-interactive-chrome/10-01-PLAN.md`
- `.planning/phases/10-interactive-chrome/10-01-SUMMARY.md`
- `src/styles/global.css`
- `src/components/FaqList.astro`
- `src/components/ToolShell.tsx` (worktree overlay; out of phase commits; scored as live divergence)
