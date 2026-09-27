# Phase 13: Islands without LED - Research

**Researched:** 2026-09-20
**Domain:** Astro Preact islands + ToolShell locale chrome (no LED)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### No-LED ToolShell chrome
- **D-Shell:** Start from HEAD `ToolShell.tsx` (children → error → `<pre>` → Copy button). Add required `locale: Locale` and localize Copy/Copied via `t(locale)` (`copy.copy` / `copy.copied`). Do **not** commit LED, `.led`, `tool-panel__chrome`, or `chromeLocal`. Do not add a Runs locally strip. Match HEAD layout, not the dirty overlay panel.
- Dirty working-tree ToolShell currently has LED + `chromeLocal` + required locale — strip the LED chrome when landing; keep locale + Copy/Copied.

### ToolIsland locale contract
- **D-Island:** `locale` is required (`locale: Locale`). Drop `locale?` and `?? 'en'` / `= 'en'`. Pages already pass `locale={locale}` (Phase 12). Pass `locale={locale}` into **all 18** Preact islands, including the original ten that currently omit it.

### Original-ten land vs rewrite
- **D-Ten:** Land the dirty original-ten islands (they already take `{ locale }: { locale: Locale }` and call `useToolUi`). Do not rewrite from HEAD English-only islands. Do not change `src/lib` parsers. Completeness tests (`tools.test.ts` EN+ZH markdown, `ToolIsland.test.ts` slug branches) stay green.

### Later-eight copy path
- **D-Eight:** ISLE-03 requires original ten to use `useToolUi` (or equivalent). Later eight already have `locale` + `t(locale)` / `localizeError`. Do not force a `useToolUi` rewrite on the later eight this phase unless a later-eight island still omits `locale` on `ToolShell` (WordCounter currently calls `<ToolShell>` without `locale` — that must gain `locale={locale}` when ToolShell requires it). Apply `locale={locale}` on every ToolShell call site.

### Claude's Discretion
- Exact Copy button markup beyond HEAD structure + localized strings
- Whether later-eight islands keep `t(locale)` vs switching to `useToolUi` (equivalent is allowed)
- Whether ToolIsland `locale` type is imported from `locales.ts` (prefer that, not `ui.ts`)

### Deferred Ideas (OUT OF SCOPE)
- CI workflow + overlay-free green build — Phase 14
- FaqList localized heading — v1.1 lock
- Three-state theme, theme animation, 4-col grid — v2
- chromeLocal / Runs locally strip — not this milestone (would be LED-adjacent chrome)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ISLE-01 | `ToolShell` accepts `locale` and localizes Copy/Copied via `ui.ts`; **no** LED / `tool-panel__chrome` | D-Shell: clone HEAD layout; add required `locale`; `const copy = t(props.locale)` then `copy.copy` / `copy.copied`. Do not land dirty LED file. HEAD `global.css` already styles `.tool-panel button`. |
| ISLE-02 | `ToolIsland` passes `locale` to all 18 islands (currently only the later eight) | D-Island: required `locale: Locale`; add `locale={locale}` to original-ten `client:load` islands. Pages already pass `locale={locale}` into ToolIsland. |
| ISLE-03 | Original ten islands use locale copy + `useToolUi` (or equivalent) and still wrap the no-LED `ToolShell` | D-Ten: land dirty original-ten. UuidGenerator already uses `t(locale)` (equivalent). Every `<ToolShell>` must pass `locale={locale}`. |
| ISLE-04 | Existing completeness tests stay green: every catalog slug has EN+ZH markdown and a `ToolIsland` `slug ===` branch | Do not drop or rewrite `src/data/tools.test.ts` EN+ZH loop or `src/components/tools/ToolIsland.test.ts` `slug ===` loop. Keep all 18 `slug ===` branches. |
</phase_requirements>

## Summary

Phase 13 is a **path-limited land**, not a restyle and not a new stack. HEAD `ToolShell` is English Copy/Copied with layout children → error → `<pre>` → button. The dirty working-tree `ToolShell` already has required `locale` and `t(locale)` labels, but it also has forbidden LED chrome (`tool-panel__chrome`, `led`, `tool-panel__body`, `tool-output-wrap`, `tool-output-bar`, `copy.chromeLocal`, `copy.output`). Those LED class names **do not exist** in committed `src/styles/global.css`. Landing the dirty file as-is would ship overlay markup, fail TypeScript against current `ui.ts` (no `chromeLocal` / `output` keys), and poison Phase 14’s overlay-free `astro build`.

The original ten islands are already dirty with `{ locale }: { locale: Locale }` and (except UuidGenerator) `useToolUi`. ToolIsland still types `locale?` with `locale = 'en'` and only passes `locale={locale}` to the later eight. All **eight** later-eight islands already take `locale` as a prop but call `<ToolShell>` **without** `locale` — not only WordCounter. Making `locale` required on ToolShell will fail `tsc` on those eight until each call site is updated.

**Primary recommendation:** Rewrite `ToolShell.tsx` from HEAD layout + required `locale` + `t(locale)` Copy/Copied (do not `git add` the dirty LED file). Require `locale` on ToolIsland and pass it to all 18 islands. Path-limited-add the dirty original-ten islands. Add `locale={locale}` on all eight later-eight `<ToolShell>` sites. Keep later-eight on `t(locale)`. Do not touch `crontab.ts`, `global.css`, stashes, or SITE_ORIGIN.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| ToolShell chrome (Copy/Copied, error, output `<pre>`) | Browser / Client | — | Preact island; clipboard + local state; no server |
| Locale prop plumbing (pages → ToolIsland → islands → ToolShell) | Frontend Server (SSR) | Browser / Client | Astro SSG passes `locale` at build; islands hydrate with that prop |
| Original-ten island copy (`useToolUi` / equivalent) | Browser / Client | — | Island-local labels and `err()`; parsers stay in `src/lib` |
| Later-eight island copy (`t(locale)` / `localizeError`) | Browser / Client | — | Locked equivalent path; only ToolShell `locale` is missing |
| Completeness (18 slugs, EN+ZH markdown, `slug ===` branches) | CDN / Static | — | Vitest reads source + filesystem; catalog `TOOLS` is SSG source of truth |
| LED chrome / overlay CSS | — (forbidden) | — | Must not ship; overlay-free build is Phase 14 |

## Standard Stack

No new packages. Use the repo’s existing stack.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | `^7.3.2` [VERIFIED: package.json:14] | SSG pages, `client:load` islands | Project lock; do not introduce a new app framework |
| Preact | `^10.29.8` [VERIFIED: package.json:18] | Tool islands + ToolShell | Existing `jsxImportSource`: `preact` |
| `@astrojs/preact` | `^6.0.5` [VERIFIED: package.json:12] | Island hydration | Existing integration |
| TypeScript | `^7.0.2` [VERIFIED: package.json:24] | Strict typecheck | `tsconfig.json` extends `astro/tsconfigs/strict` |
| Vitest | `^5.0.0` [VERIFIED: package.json:25] | Unit + completeness tests | `npm test` → `vitest run` [VERIFIED: package.json:9] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none this phase) | — | — | Do not add Playwright, Tailwind, icon packs, or contrast packages |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| HEAD ToolShell + locale | Land dirty LED ToolShell | Forbidden by D-Shell / ISLE-01; `chromeLocal`/`output` are not on `ui.ts` |
| `useToolUi` on later eight | Keep `t(locale)` | Locked D-Eight: equivalent allowed; do not force rewrite |
| `Locale` from `ui.ts` | `Locale` from `locales.ts` | Discretion prefers `locales.ts` for ToolShell + ToolIsland |

**Installation:** none — do not run `npm install`.

## Package Legitimacy Audit

This phase installs **no** external packages.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| — | — | — | — | — | — | No installs |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```text
EN /tools/[slug]/  --locale='en'-->  ToolIsland.astro (locale: Locale, required)
ZH /zh/tools/[slug]/ --locale='zh'-->  ToolIsland.astro
                                         |
                                         | slug === branch + client:load
                                         v
                              Preact island (18)
                              locale prop required
                                         |
                    original ten: useToolUi (UuidGenerator: t())
                    later eight:  t(locale) + localizeError
                                         |
                                         | <ToolShell locale={locale} error output>
                                         v
                              ToolShell (named export)
                              t(locale) -> copy.copy / copy.copied
                              layout: children -> error -> <pre> -> Copy button
                              clipboard.writeText; 1500ms Copied
                              NO tool-panel__chrome / led / chromeLocal
```

### Recommended Project Structure

Do not add folders. Touch only:

```
src/components/ToolShell.tsx              # HEAD layout + required locale
src/components/tools/ToolIsland.astro     # required locale; all 18 locale={locale}
src/components/tools/{original ten}.tsx   # land dirty useToolUi (or t) islands
src/components/tools/{later eight}.tsx    # add locale={locale} on ToolShell only
src/data/tools.test.ts                    # do not edit (ISLE-04)
src/components/tools/ToolIsland.test.ts   # do not edit (ISLE-04)
src/i18n/locales.ts                       # import Locale from here
src/i18n/ui.ts                            # t(locale); copy / copied keys (do not edit)
src/i18n/useToolUi.ts                     # original-ten hook (do not edit)
src/styles/global.css                     # do not edit
src/lib/crontab.ts                        # do not add
```

### Pattern 1: No-LED ToolShell (HEAD + locale)

**What:** Named-export Preact shell. Required `locale`. Copy labels from `t(locale)`. HEAD DOM order.
**When to use:** Always this phase. This is the only legal ToolShell.

HEAD layout (no locale, hardcoded English) [VERIFIED: git show HEAD:src/components/ToolShell.tsx this session]:

```tsx
export function ToolShell(props: {
  error: string | null;
  output: string;
  children: ComponentChildren;
}) {
  // ...
  return (
    <div class="tool-panel">
      {props.children}
      {props.error ? <p class="tool-error" role="alert">{props.error}</p> : null}
      <pre class="tool-output"><code>{props.output}</code></pre>
      <button type="button" onClick={onCopy} disabled={!props.output}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
```

Landed shape (planner/executor source of truth — 13-UI-SPEC Markup). `Locale` from `locales.ts`. `copy.copy` / `copy.copied` are top-level `UiDict` keys accessed as `const copy = t(props.locale)`:

```tsx
import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { Locale } from '../i18n/locales';
import { t } from '../i18n/ui';

export function ToolShell(props: {
  error: string | null;
  output: string;
  locale: Locale;
  children: ComponentChildren;
}) {
  const [copied, setCopied] = useState(false);
  const copy = t(props.locale);

  async function onCopy() {
    if (!props.output) return;
    await navigator.clipboard.writeText(props.output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div class="tool-panel">
      {props.children}
      {props.error ? <p class="tool-error" role="alert">{props.error}</p> : null}
      <pre class="tool-output"><code>{props.output}</code></pre>
      <button type="button" onClick={onCopy} disabled={!props.output}>
        {copied ? copy.copied : copy.copy}
      </button>
    </div>
  );
}
```

Keys [VERIFIED: src/i18n/ui.ts:35-37]: `copy: 'Copy',` `copied: 'Copied',` `tooLarge: 'Input too large to process in the browser.',`
ZH [VERIFIED: src/i18n/ui.ts:259-261]: `copy: '复制',` `copied: '已复制',` `tooLarge: '输入过长，无法在浏览器中处理。',`
`t` [VERIFIED: src/i18n/ui.ts:456-458]: `export function t(locale: Locale): UiDict { return ui[locale]; }`

`Locale` [VERIFIED: src/i18n/locales.ts:1-2]: `export const LOCALES = ['en', 'zh'] as const;` `export type Locale = (typeof LOCALES)[number];`

### Pattern 2: ToolIsland required locale + exhaustive slug map

**What:** Astro wrapper maps catalog slug → Preact island with `client:load`.
**When to use:** Always. Completeness test greps `slug === '${slug}'`.

Current (illegal after this phase) [VERIFIED: src/components/tools/ToolIsland.astro:21-22]:

```
interface Props { slug: string; locale?: 'en' | 'zh' }
const { slug, locale = 'en' } = Astro.props;
```

Original ten currently omit `locale={locale}` [VERIFIED: src/components/tools/ToolIsland.astro:24-33]. Later eight already pass it [VERIFIED: src/components/tools/ToolIsland.astro:34-41].

Landed contract:

```astro
---
import type { Locale } from '../../i18n/locales';
interface Props { slug: string; locale: Locale }
const { slug, locale } = Astro.props;
---
{slug === 'json-formatter' && <JsonFormatter client:load locale={locale} />}
<!-- same locale={locale} on all 18, including original ten -->
```

Pages already pass locale [VERIFIED: src/pages/tools/[slug].astro:17,34]: `const locale = 'en' as const;` `<ToolIsland slug={slug} locale={locale} />`
ZH [VERIFIED: src/pages/zh/tools/[slug].astro:17,34]: `const locale = 'zh' as const;` `<ToolIsland slug={slug} locale={locale} />`

### Pattern 3: Original-ten `useToolUi` island (land dirty, do not rewrite from HEAD)

HEAD JsonFormatter has **no** locale [VERIFIED: git show HEAD:src/components/tools/JsonFormatter.tsx this session]: `export default function JsonFormatter()` and `<ToolShell error={result.error} output={result.output}>`.

Dirty JsonFormatter [VERIFIED: src/components/tools/JsonFormatter.tsx:8-21]:

```
export default function JsonFormatter({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const { copy, tooLarge, err } = useToolUi(locale);
  ...
    <ToolShell error={result.error} output={result.output} locale={locale}>
```

`useToolUi` [VERIFIED: src/i18n/useToolUi.ts:4-11]:

```
export function useToolUi(locale: Locale) {
  const copy = t(locale);
  const tooLarge = copy.tooLarge;
  function err(error: string | null): string | null {
    if (!error) return null;
    return localizeError(locale, error);
  }
  return { copy, tooLarge, err };
}
```

UuidGenerator is original-ten but uses `t(locale)` equivalent [VERIFIED: src/components/tools/UuidGenerator.tsx:3-15]: `import { t } from '../../i18n/ui';` … `<ToolShell error={null} output={output} locale={locale}>`. Do not force `useToolUi` on it.

### Pattern 4: Later-eight keep `t(locale)`; add ToolShell `locale`

WordCounter analog [VERIFIED: src/components/tools/WordCounter.tsx:5-7,30]:

```
import { t, type Locale } from '../../i18n/ui';
export default function WordCounter({ locale }: { locale: Locale }) {
...
    <ToolShell error={result.error} output={result.output}>
```

All eight later-eight ToolShell call sites omit `locale` (must add `locale={locale}`):

| File | Call site |
|------|-----------|
| WordCounter.tsx | [VERIFIED: src/components/tools/WordCounter.tsx:30] `<ToolShell error={result.error} output={result.output}>` |
| CaseConverter.tsx | [VERIFIED: src/components/tools/CaseConverter.tsx:47] `<ToolShell error={result.error} output={result.output}>` |
| LoremIpsum.tsx | [VERIFIED: src/components/tools/LoremIpsum.tsx:41] `<ToolShell error={error} output={output}>` |
| PasswordGenerator.tsx | [VERIFIED: src/components/tools/PasswordGenerator.tsx:46] `<ToolShell error={error} output={output}>` |
| SqlFormatter.tsx | [VERIFIED: src/components/tools/SqlFormatter.tsx:34] `<ToolShell error={result.error} output={result.output}>` |
| TextDiff.tsx | [VERIFIED: src/components/tools/TextDiff.tsx:66] `<ToolShell error={result.error} output={result.output}>` |
| MarkdownPreview.tsx | [VERIFIED: src/components/tools/MarkdownPreview.tsx:29] `<ToolShell error={result.error} output={result.output}>` |
| QrCode.tsx | [VERIFIED: src/components/tools/QrCode.tsx:133] `<ToolShell error={decodeError ?? generate.error} output={payload}>` |

Do **not** rewrite those islands onto `useToolUi`.

### Anti-Patterns to Avoid

- **Landing dirty ToolShell as-is:** Dirty file has LED nodes [VERIFIED: src/components/ToolShell.tsx:23-39]: `class="tool-panel__chrome"`, `class="led"`, `{copy.chromeLocal}`, `class="tool-panel__body"`, `class="tool-output-wrap"`, `class="tool-output-bar"`, `{copy.output}`. `ui.ts` has no `chromeLocal` or `output` chrome keys (grep this session: no matches under `src/i18n/`).
- **`git add -A` / adding `src/lib/crontab.ts`:** crontab is dirty and fenced. Path-limited add only.
- **`git stash pop`:** `stash@{0}` overlay chrome, `stash@{1}` unrelated i18n. Do not mix.
- **Rewriting original ten from HEAD English-only:** violates D-Ten / ISLE-03.
- **New CSS / `.copy-btn` / clipboard SVG:** UI-SPEC: no new CSS; selector stays `.tool-panel button`.
- **Vitest `-x`:** Vitest 5 CLI has no `-x` (see Validation Architecture). Use file filters or `--bail 1`.
- **Running overlay-free `astro build` as this phase’s gate:** Phase 14. This phase must still make committed ToolShell free of LED class names so Phase 14 can compile without overlay CSS.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale Copy/Copied strings | Hardcoded `'Copy'` / `'Copied'` | `t(locale)` → `copy.copy` / `copy.copied` | ISLE-01; ZH `复制` / `已复制` already in `ui.ts` |
| Island field labels / tooLarge / err | New i18n helper | Original ten: `useToolUi`; later eight: `t` + `localizeError` | Kernel already shipped Phase 11 |
| LED / Runs locally chrome | `.tool-panel__chrome`, `.led`, `chromeLocal` | HEAD `.tool-panel` only | Overlay CSS is not in `global.css`; Phase 14 needs overlay-free compile |
| Completeness of 18 tools | Manual checklist only | Keep `tools.test.ts` + `ToolIsland.test.ts` | ISLE-04 |
| Fail-fast test CLI | `vitest -x` | `npx vitest run <files>` or `--bail 1` | Vitest 5 has no `-x` |

**Key insight:** The expensive failure is committing the dirty LED ToolShell. Locale wiring is already mostly written; the plan is strip-LED + pass-locale, not a redesign.

## Common Pitfalls

### Pitfall 1: Dirty ToolShell has LED — do not land the dirty file as-is
**What goes wrong:** Executor “lands” working-tree `ToolShell.tsx` because it already has `locale`. Commit includes `tool-panel__chrome` / `.led` / `chromeLocal`.
**Why it happens:** Dirty file looks closer to ISLE-01 than HEAD (HEAD has no locale).
**How to avoid:** Write ToolShell from HEAD structure + required locale. After write, assert these strings are **absent** from `src/components/ToolShell.tsx`: `tool-panel__chrome`, `class="led"`, `tool-panel__body`, `tool-output-wrap`, `tool-output-bar`, `chromeLocal`, `copy.output`.
**Warning signs:** Diff of ToolShell still contains a chrome strip above children.

### Pitfall 2: Later-eight ToolShell calls without `locale` fail tsc once locale is required
**What goes wrong:** Plan only mentions WordCounter. The other seven later-eight islands also omit `locale` on `<ToolShell>` (table above). Strict TypeScript fails those files.
**Why it happens:** CONTEXT called out WordCounter as the analog; working tree later-eight files are currently **clean** (not in `git diff`) so they look “done”.
**How to avoid:** Patch **all eight** later-eight `<ToolShell>` opening tags to include `locale={locale}`. Do not stop at WordCounter.
**Warning signs:** `tsc` / `astro check` errors `Property 'locale' is missing` on CaseConverter, LoremIpsum, PasswordGenerator, SqlFormatter, TextDiff, MarkdownPreview, QrCode.

### Pitfall 3: Committing `crontab.ts` or popping stashes
**What goes wrong:** Unrelated dirty parser / overlay Header lands on main.
**Why it happens:** `git add -A` or “stash pop to get CSS”.
**How to avoid:** Path-limited `git add` of the file list in Files in scope. Never `git stash pop`. Never add `src/lib/crontab.ts`, `src/styles/global.css`, Header/LangSwitch/ThemeToggle/FaqList, or `src/data/site.ts`.
**Warning signs:** `git diff --cached --name-only` includes `crontab.ts` or `global.css`.

### Pitfall 4: Completeness tests go red
**What goes wrong:** ToolIsland branch deleted or slug string changed so `source.includes(\`slug === '${slug}'\`)` fails; or markdown moved.
**Why it happens:** Refactoring the if-chain into a map/dynamic import.
**How to avoid:** Keep the boolean `slug === '…'` chain. Do not edit `TOOLS` membership. Do not edit completeness tests except if a planner adds a **new** LED-absence test (optional).
**Warning signs:** `ToolIsland coverage` or `has EN and ZH markdown` fails.

### Pitfall 5: Vitest `-x` in verification commands
**What goes wrong:** `npx vitest run -x …` exits non-zero as unknown option / unexpected behavior.
**Why it happens:** Jest/Playwright muscle memory.
**How to avoid:** Use `npx vitest run src/data/tools.test.ts src/components/tools/ToolIsland.test.ts` (file filter) or `npx vitest run --bail 1`. Confirm: `npx vitest run --help` this session lists `--bail <number>` and does **not** list `-x`. [VERIFIED: npx vitest run --help this session] [CITED: https://vitest.dev/guide/cli]

### Pitfall 6: Overlay-free astro build is Phase 14
**What goes wrong:** This phase is blocked waiting for a clean `astro build` while other dirty files remain.
**Why it happens:** CI-02 is easy to pull forward.
**How to avoid:** Phase 13 verification = Vitest completeness + ToolShell LED-absence + tsc on touched islands. Do **not** require overlay-free `astro build` here. Do require committed ToolShell to compile **without LED CSS class dependencies** (HEAD `global.css` has `.tool-panel` / `.tool-error` / `.tool-output` only — [VERIFIED: src/styles/global.css:180-218]).

### Pitfall 7: Threat — do not commit LED chrome
**What goes wrong:** Forbidden overlay ships; Phase 14 cannot be overlay-free.
**Why it happens:** Accidental `git add` of dirty ToolShell or popping `stash@{0}`.
**How to avoid:** Treat LED strings as a release-blocking grep in every commit task. Path-limited add. Human checkpoint if ToolShell diff is larger than HEAD+locale.

## Code Examples

### Original ten — land dirty (JsonFormatter analog)

```tsx
// Source: src/components/tools/JsonFormatter.tsx (dirty working tree)
import type { Locale } from '../../i18n/locales';
import { useToolUi } from '../../i18n/useToolUi';

export default function JsonFormatter({ locale }: { locale: Locale }) {
  const { copy, tooLarge, err } = useToolUi(locale);
  // ...
  return (
    <ToolShell error={result.error} output={result.output} locale={locale}>
```

### Later eight — add locale only (WordCounter analog)

```tsx
// Source: src/components/tools/WordCounter.tsx — change the ToolShell opening tag only
<ToolShell error={result.error} output={result.output} locale={locale}>
```

### Completeness tests — keep green

```ts
// Source: src/components/tools/ToolIsland.test.ts:10-16
it('maps every catalog slug to a slug === branch', () => {
  for (const { slug } of TOOLS) {
    expect(
      source.includes(`slug === '${slug}'`),
      `missing ToolIsland branch for ${slug}`,
    ).toBe(true);
  }
});
```

```ts
// Source: src/data/tools.test.ts:46-52
it('has EN and ZH markdown for every catalog slug', () => {
  for (const { slug } of TOOLS) {
    const en = new URL(`../content/tools/${slug}.md`, import.meta.url);
    const zh = new URL(`../content/tools/zh/${slug}.md`, import.meta.url);
    expect(existsSync(en), `missing EN markdown for ${slug}`).toBe(true);
    expect(existsSync(zh), `missing ZH markdown for ${slug}`).toBe(true);
  }
});
```

### Path-limited add (never `-A`)

Original ten (dirty, land): `JsonFormatter.tsx`, `JwtDecoder.tsx`, `Base64Tool.tsx`, `UrlEncode.tsx`, `HashGenerator.tsx`, `UuidGenerator.tsx`, `RegexTester.tsx`, `UnixTimestamp.tsx`, `CrontabExplainer.tsx`, `ColorConverter.tsx`.

Later eight (edit ToolShell locale): `WordCounter.tsx`, `CaseConverter.tsx`, `LoremIpsum.tsx`, `PasswordGenerator.tsx`, `SqlFormatter.tsx`, `TextDiff.tsx`, `MarkdownPreview.tsx`, `QrCode.tsx`.

Plus: `src/components/ToolShell.tsx`, `src/components/tools/ToolIsland.astro`.

Do not add: `src/lib/crontab.ts`, `src/styles/global.css`, `src/data/site.ts`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HEAD ToolShell hardcoded `'Copy'` / `'Copied'`, no `locale` | Required `locale` + `t(locale)` labels, same DOM | This phase | ISLE-01 |
| ToolIsland `locale?:` default `'en'`; original ten islands get no locale prop | Required `locale`; all 18 `locale={locale}` | This phase | ISLE-02 |
| HEAD original-ten English-only islands | Dirty `useToolUi` / `t(locale)` islands | Land, do not rewrite | ISLE-03 |
| Dirty LED ToolShell | Forbidden; strip | Never commit | Phase 14 overlay-free build |

**Deprecated/outdated:**
- LED `tool-panel__chrome` / `.led` / `chromeLocal` / Runs locally strip: out of scope for this milestone.
- Vitest `-x`: not a Vitest 5 CLI flag; do not put it in PLAN verification commands.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | (empty) | — | In-repo discrete values were Read this session. Vitest `-x` absence was confirmed via `npx vitest run --help` this session plus official CLI docs. No user confirmation needed for locked D-Shell/D-Island/D-Ten/D-Eight. |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

Discretion recommendations (not assumptions — planner should lock them):

1. Copy button markup: unclassed HEAD `<button type="button">` as 13-UI-SPEC; no `.copy-btn`, no icon.
2. Later-eight: **keep** `t(locale)` / `localizeError`; do not migrate to `useToolUi`.
3. `Locale` import on ToolShell and ToolIsland: `src/i18n/locales.ts` (not `ui.ts`). Later-eight may keep `import { t, type Locale } from '../../i18n/ui'` because `ui.ts` re-exports `Locale` [VERIFIED: src/i18n/ui.ts:1-3]: `import type { Locale } from './locales';` `export type { Locale };`

## Open Questions (RESOLVED)

No unresolved questions. Locked decisions cover chrome, locale contract, original-ten land, and later-eight equivalent copy. Discretion items above are recommended, not open.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vitest / Astro | ✓ | v22.22.2 | — |
| npm | scripts | ✓ | 11.9.0 | — |
| Vitest | ISLE-04 + sampling | ✓ | 5.0.0 (`vitest/5.0.0`) | — |
| git | path-limited add | ✓ | mingw64 git | — |
| New npm packages | — | n/a | — | Do not install |

**Missing dependencies with no fallback:** none

**Missing dependencies with fallback:** none

**Skip note:** Overlay-free `astro build` is Phase 14. Do not treat a dirty-tree `astro build` failure as a Phase 13 blocker.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `^5.0.0` [VERIFIED: package.json:25] |
| Config file | `vitest.config.ts` — `include: ['src/**/*.test.ts']`, `environment: 'node'`, `passWithNoTests: true` [VERIFIED: vitest.config.ts:3-8] |
| Quick run command | `npx vitest run src/data/tools.test.ts src/components/tools/ToolIsland.test.ts src/i18n/useToolUi.test.ts src/i18n/locales.test.ts` |
| Full suite command | `npm test` (= `vitest run`) [VERIFIED: package.json:9] |

**Vitest 5 does not support `-x`.** Do not write `vitest run -x` in PLAN.md. `npx vitest run --help` this session lists `--bail <number>` (`Stop test execution when given number of tests have failed (default: 0)`) and does not list `-x`. Official CLI: [CITED: https://vitest.dev/guide/cli] documents `--bail <number>` only (no `-x` alias).

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ISLE-01 | ToolShell has required locale + Copy/Copied via `t`; no LED classes | source grep + typecheck | `npx vitest run src/i18n/locales.test.ts src/i18n/useToolUi.test.ts` plus grep ToolShell for forbidden class names (must be empty) | ⚠️ no ToolShell source test — Wave 0 optional |
| ISLE-02 | ToolIsland passes `locale={locale}` to all 18 | source read (extend existing or grep) | `npx vitest run src/components/tools/ToolIsland.test.ts` | ✅ branch coverage exists; locale-prop assertion does not |
| ISLE-03 | Original ten use `useToolUi` or equivalent; wrap no-LED ToolShell | land + typecheck | `npx vitest run src/i18n/useToolUi.test.ts` | ✅ kernel tests; no per-island UI tests |
| ISLE-04 | Every catalog slug has EN+ZH markdown and `slug ===` branch | unit | `npx vitest run src/data/tools.test.ts src/components/tools/ToolIsland.test.ts` | ✅ |

### Sampling Rate
- **Per task commit:** `npx vitest run src/data/tools.test.ts src/components/tools/ToolIsland.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`. Do **not** require overlay-free `astro build` (Phase 14). Do require ToolShell source to contain none of: `tool-panel__chrome`, `class="led"`, `chromeLocal`.

### Wave 0 Gaps
- Optional (planner discretion): `src/components/ToolShell.test.ts` modeled on `ToolIsland.test.ts` (`readFileSync` the `.tsx`) asserting the file does **not** include `tool-panel__chrome`, `class="led"`, `chromeLocal`, `tool-output-bar`. Not required for ISLE-04.
- Optional: extend `ToolIsland.test.ts` to assert every `slug ===` branch line also contains `locale={locale}`. Not required if PLAN grep covers ISLE-02.
- Do **not** add Playwright, a new test runner, or `vitest -x`.
- Framework install: none — Vitest already in `package.json`.

Existing completeness tests cover ISLE-04. ISLE-01/02/03 are enforced by implementation + grep/typecheck, not by new e2e.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No accounts; tools are public static pages |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | No privileged routes |
| V5 Input Validation | yes (existing, do not change parsers) | Island size guard `isTooLarge`; parsers return `{ ok }` unions; do not throw |
| V6 Cryptography | no this phase | Do not touch `src/lib/hash.ts` / password Web Crypto |

### Known Threat Patterns for Astro + Preact tool islands

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Commit LED overlay / accidental `git add -A` | Tampering / Information disclosure of unreviewed chrome | Path-limited add; LED-absence grep; never stash pop |
| Clipboard write without output | Tampering | HEAD `if (!props.output) return;` + `disabled={!props.output}` |
| XSS via tool output | Tampering | Output in `<pre><code>{props.output}</code>` as text (do not `dangerouslySetInnerHTML` in ToolShell). MarkdownPreview already puts HTML string in `output` as text in `<code>` — do not change that this phase |
| Locale defaulting to `en` on ZH pages | Spoofing of UI language | Drop `locale?` / `= 'en'` on ToolIsland; pages pass explicit locale |
| Uploading tool input to a new API | Information disclosure | No new API routes; computation stays in `src/lib` / browser |

**Threat (phase-specific):** Do not commit LED chrome. Dirty ToolShell is the attack/accident surface. Verification must fail the phase if `tool-panel__chrome` or `class="led"` is in the committed ToolShell.

## Project Constraints (from CLAUDE.md)

- Privacy / architecture: all tool computation in the browser (`src/lib`); no new API routes for tool logic.
- Parity: new/landed tools match existing UI chrome, copy-to-clipboard, errors, EN+ZH, FAQ.
- Stack: stay on Astro + Preact + current catalog/content-collection pattern — no new app framework.
- Do not rewrite validated existing-ten **algorithms**; this phase lands locale on those islands, it does not change `src/lib` parsers.
- Pure logic in `src/lib/<topic>.ts` with colocated tests — do not edit parsers this phase.
- Preact islands default-export; ToolShell named-export; use `class` not `className`.
- Locale as a required prop on islands: `{ locale }: { locale: Locale }`.
- Discriminated `{ ok }` parsers; English errors localized in the island; empty error `''` is no message.
- Size guard in UI (`isTooLarge`) not in parsers.
- Do not throw from parsers; do not rethrow to the UI.
- Trailing slashes required; English unprefixed.
- GSD: path-limited work through this phase plan; no direct repo edits outside GSD.

Hard fences (ROADMAP, apply to this phase):

- Do not commit LED `ToolShell` / `tool-panel__chrome`
- Do not commit `src/lib/crontab.ts`
- Do not pop `stash@{0}` or `stash@{1}`
- Path-limited `git add` only — never `git add -A`
- No `SITE_ORIGIN` change (`'https://example.com'` [VERIFIED: src/data/site.ts:2]), no `gh repo create`, no new catalog tools
- Stay Astro + Preact; no Tailwind; no new npm packages

## Sources

### Primary (HIGH confidence)
- `git show HEAD:src/components/ToolShell.tsx` this session — no-LED layout to clone
- `src/components/ToolShell.tsx` (dirty) — LED nodes to strip
- `src/components/tools/ToolIsland.astro` — optional locale; original ten omit prop
- `src/components/tools/JsonFormatter.tsx`, `UuidGenerator.tsx`, `WordCounter.tsx` + later-eight ToolShell call sites
- `src/i18n/locales.ts`, `src/i18n/ui.ts`, `src/i18n/useToolUi.ts`
- `src/data/tools.test.ts`, `src/components/tools/ToolIsland.test.ts`
- `src/styles/global.css:180-218` — HEAD `.tool-panel` / button / error / output; no LED selectors
- `src/pages/tools/[slug].astro`, `src/pages/zh/tools/[slug].astro` — already pass locale
- `package.json`, `vitest.config.ts`
- `npx vitest run --help` this session — `--bail`, no `-x`
- `.planning/phases/13-islands-without-led/13-CONTEXT.md` (locked)
- `.planning/phases/13-islands-without-led/13-UI-SPEC.md`
- `.planning/REQUIREMENTS.md` ISLE-01–04
- `.planning/ROADMAP.md` Phase 13 + hard fences
- `.claude/CLAUDE.md` project constraints

### Secondary (MEDIUM confidence)
- [CITED: https://vitest.dev/guide/cli] — `--bail <number>`; no `-x` documented (WebFetch this session)

### Tertiary (LOW confidence)
- Research-plan seam returned **stale Phase 12 cache hits** (sitemap/hreflang questions), not the Phase 13 questions submitted. Those cache entries were **not** used as Phase 13 findings.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; versions Read from `package.json` this session
- Architecture: HIGH — HEAD vs dirty ToolShell, all 18 ToolShell call sites, ToolIsland, i18n keys Read this session
- Pitfalls: HIGH — LED land, later-eight locale gap (8 files), crontab/stash fences, Vitest `-x`, Phase 14 build split all observed in-repo or via CLI help

**Research date:** 2026-09-20
**Valid until:** 2026-10-20 (stable in-repo land; re-check only if ToolShell/i18n kernel changes)
