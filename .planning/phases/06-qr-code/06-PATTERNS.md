# Phase 6: QR generate and decode - Pattern Map

**Mapped:** 2026-09-14
**Files analyzed:** 14
**Analogs found:** 14 / 14

Clone **git HEAD** only (`git show HEAD:<path>`). Do not clone dirty worktree `JsonFormatter.tsx` (missing `useToolUi`) or dirty `ToolShell.tsx` (adds a `locale` prop HEAD does not have).

Hard analog locks:

- Island: HEAD WordCounter locale/`t()` + HEAD PasswordGenerator native controls / checkbox-in-label + HEAD SqlFormatter native `<select>` + HEAD ToolShell **NO locale prop**
- NEVER dirty JsonFormatter that imports missing `useToolUi`
- Completeness: `existsSync(URL)` not `.pathname`
- Heavy package only in `src/lib/qr.ts`: `import encodeQR from 'qr'` and `import decodeQR from 'qr/decode.js'`
- Never import `'qr/dom.js'`
- Catalog analog: markdown-preview row (append-only, featured false); bump 17→18
- CSS: additive `.qr-preview` only, like `.md-preview`

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/qr.ts` | utility | transform | HEAD `src/lib/json.ts` + `src/lib/sql.ts` | exact (union) / role-match (heavy import) |
| `src/lib/qr.test.ts` | test | transform | HEAD `src/lib/markdown.test.ts` / `sql.test.ts` | exact (isolation) |
| `src/lib/limits.ts` | utility | transform | HEAD `src/lib/limits.ts` | exact (append) |
| `src/lib/limits.test.ts` | test | transform | HEAD `src/lib/limits.test.ts` | exact (append) |
| `src/components/tools/QrCode.tsx` | component | request-response | HEAD `WordCounter.tsx` + `SqlFormatter.tsx` + `PasswordGenerator.tsx` + `ToolShell.tsx` | role-match (compose) |
| `src/components/tools/ToolIsland.astro` | component | request-response | HEAD `src/components/tools/ToolIsland.astro` | exact |
| `src/data/tools.ts` | config | transform | HEAD `src/data/tools.ts` (markdown-preview row) | exact |
| `src/data/tools.test.ts` | test | transform | HEAD `src/data/tools.test.ts` | exact |
| `src/i18n/ui.ts` | config | transform | HEAD `src/i18n/ui.ts` (`markdown-preview` keys) | exact |
| `src/i18n/errors.ts` | config | transform | HEAD `src/i18n/errors.ts` | exact |
| `src/i18n/errors.test.ts` | test | transform | HEAD `src/i18n/errors.test.ts` | role-match |
| `src/content/tools/qr-code.md` | config | file-I/O | HEAD `src/content/tools/markdown-preview.md` | exact |
| `src/content/tools/zh/qr-code.md` | config | file-I/O | HEAD `src/content/tools/zh/markdown-preview.md` | exact |
| `src/styles/global.css` | config | transform | HEAD `src/styles/global.css` (`.tool-grid.split` + additive `.md-preview`) | role-match |

Do **not** modify: `src/components/ToolShell.tsx`, `JsonFormatter.tsx`, first ten `relatedSlugs`, `src/lib/index.ts` (do not create), dirty pages. Do not import `'qr/dom.js'`.

## Pattern Assignments

### `src/lib/qr.ts` (utility, transform)

**Analog:** HEAD `src/lib/json.ts` (idle + discriminated union, never throw) + HEAD `src/lib/sql.ts` (package import **only** from this file).

**Union / never throw** (HEAD `src/lib/json.ts` entire file):

```typescript
export type JsonResult =
  | { ok: true; formatted: string }
  | { ok: false; error: string };

export function formatJson(input: string): JsonResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: '' };
  try {
    const value = JSON.parse(trimmed);
    return { ok: true, formatted: JSON.stringify(value, null, 2) };
  } catch {
    return { ok: false, error: 'Invalid JSON' };
  }
}
```

**Idle for this file IS json-style trim.** Copy: `if (!input.trim()) return { ok: false, error: '' }` — library would still encode `''` as a v1 QR; skip in lib and island.

**Heavy-package import isolation** (HEAD `src/lib/sql.ts` lines 1–10):

```typescript
import {
  formatDialect,
  sql,
  postgresql,
  mysql,
  sqlite,
  transactsql,
  bigquery,
} from 'sql-formatter';
```

**Copy for this file (locked):**

```typescript
import encodeQR from 'qr';
import decodeQR from 'qr/decode.js';
```

Never `'qr/dom.js'`. Never `'jsdom'`. Never `'jsqr'`. Island does not import packages. Map UI `L|M|Q|H` → `low|medium|quartile|high` **inside this file** (`ecc: 'M'` throws). Encode with `encodeQR(text, 'raw', { ecc })` only — never `'data-url'` (GIF). Decode: `decodeQR(img, { effort: Infinity, timeLimit: Infinity })`; catch → `'No QR code found in this image.'`. Capacity overflow catch → `'Cannot encode this text as a QR code.'`. Do not add `src/lib/index.ts`.

---

### `src/lib/qr.test.ts` (test, transform)

**Analog:** HEAD `src/lib/markdown.test.ts` isolation (`readFileSync` + `new URL(..., import.meta.url)`). Do **not** set `// @vitest-environment jsdom` (decoder is Node `{width,height,data}`).

**Isolation source-read** (HEAD `src/lib/sql.test.ts` / markdown.test.ts):

```typescript
it('imports sql-formatter only from sql.ts', () => {
  const sqlSource = readFileSync(new URL('./sql.ts', import.meta.url), 'utf8');
  const island = readFileSync(
    new URL('../components/tools/SqlFormatter.tsx', import.meta.url),
    'utf8',
  );
  const toolIsland = readFileSync(
    new URL('../components/tools/ToolIsland.astro', import.meta.url),
    'utf8',
  );
  const jsonLib = readFileSync(new URL('./json.ts', import.meta.url), 'utf8');
  const jsonIsland = readFileSync(
    new URL('../components/tools/JsonFormatter.tsx', import.meta.url),
    'utf8',
  );
  expect(sqlSource).toContain("from 'sql-formatter'");
  expect(island).not.toMatch(/from ['"]sql-formatter['"]/);
});
```

**Copy for this file:** assert `from 'qr'` and `from 'qr/decode.js'` only in `qr.ts`; `qrSource` does **not** `from 'qr/dom.js'` / `from 'jsdom'`; island contains `encodeQr` / `decodeQr` / `../../lib/qr` and does **not** `from 'qr'`; `toolIsland` / `json.ts` / `JsonFormatter.tsx` do not import qr. Also forbid `getUserMedia|mediaDevices|rearCamera|selfieCamera|capture` in lib+island. Completeness markdown: `existsSync(en)` via `new URL` not `.pathname`. Round-trip: synthetic RGBA at scale ≥2; idle trim; ECC map; capacity error.

---

### `src/lib/limits.ts` / `src/lib/limits.test.ts` (utility/test, transform)

**Analog:** HEAD `src/lib/limits.ts` — **append only**.

```typescript
export const INPUT_MAX_CHARS = 100_000;
export const INPUT_TOO_LARGE_MSG =
  'Input too large to process in the browser.';

export function isTooLarge(input: string): boolean {
  return input.length > INPUT_MAX_CHARS;
}
```

**Append:**

```typescript
export const IMAGE_MAX_BYTES = 5_242_880;
export const IMAGE_TOO_LARGE_MSG =
  'Image is too large to process in the browser.';
```

Do not change `isTooLarge` / `INPUT_MAX_CHARS`. Image cap is **bytes** (`file.size`), not chars.

---

### `src/components/tools/QrCode.tsx` (component, request-response)

**Analogs (HEAD only):**

1. `src/components/tools/WordCounter.tsx` — locale / `t()` / `isTooLarge` / `ToolShell` without locale / `spellcheck={false}` / `class` not `className`
2. `src/components/tools/SqlFormatter.tsx` — live `useMemo` + native `<select>` + `localizeError`
3. `src/components/tools/PasswordGenerator.tsx` — native `<button type="button">` + checkbox-in-label (native control wrapping)
4. HEAD `src/components/ToolShell.tsx` — **no** `locale` prop

**Imports + locale + size + ToolShell** (HEAD `WordCounter.tsx`):

```tsx
import { useMemo, useState } from 'preact/hooks';
import { ToolShell } from '../ToolShell';
import { countText } from '../../lib/counter';
import { INPUT_TOO_LARGE_MSG, isTooLarge } from '../../lib/limits';
import { t, type Locale } from '../../i18n/ui';

export default function WordCounter({ locale }: { locale: Locale }) {
  const [input, setInput] = useState('');
  const copy = t(locale);
  const labels = copy.tools['word-counter'];
  // ...
  return (
    <ToolShell error={result.error} output={result.output}>
```

Do **not** pass `locale` into `ToolShell`. Do **not** import `useToolUi`. Island must **not** `from 'qr'` / `'qr/decode.js'` / `'qr/dom.js'`. Map too-large via `localizeError(locale, INPUT_TOO_LARGE_MSG)` and `IMAGE_TOO_LARGE_MSG`. `error` slot: `decodeError ?? generateError`. Generate never writes pixels/data-URL into `output`. Decode payload is ToolShell `output`.

**Native select** (HEAD `SqlFormatter.tsx`):

```tsx
<label>
  {labels.dialect}
  <select
    value={dialect}
    onChange={(e) =>
      setDialect((e.target as HTMLSelectElement).value as SqlDialect)
    }
  >
```

**Copy:** ECC `<select>` L/M/Q/H, default `M`. Live `onInput` / `onChange` — no Generate button for encode.

**Native button** (HEAD `PasswordGenerator.tsx`):

```tsx
<button type="button" onClick={onGenerate}>
  {labels.generate}
</button>
<label>
  <input type="checkbox" ... />
  {labels.lowercase}
</label>
```

**Copy:** Download PNG is `<button type="button">` with `labels.downloadPng`; `canvas.toDataURL('image/png')` + `<a download="qr-code.png">`. File decode: native `<input type="file">` inside `<label>` (same wrapping as checkbox-in-label). Never `capture` / `getUserMedia`.

**HEAD ToolShell contract:**

```tsx
export function ToolShell(props: {
  error: string | null;
  output: string;
  children: ComponentChildren;
}) {
```

Copy: `{copied ? 'Copied' : 'Copy'}`, `disabled={!props.output}`, `navigator.clipboard.writeText(props.output)`. Do not add a second copy widget.

Layout: stacked generate then decode; generate uses `div.tool-grid.split` (controls first, `.qr-preview` second). Visual QR is **children**, not `<pre>`.

---

### `src/components/tools/ToolIsland.astro` (component, request-response)

**Analog:** HEAD last branch is `markdown-preview`.

```astro
import MarkdownPreview from './MarkdownPreview';
---
{slug === 'markdown-preview' && <MarkdownPreview client:load locale={locale} />}
```

**Add:** `import QrCode from './QrCode';` and `{slug === 'qr-code' && <QrCode client:load locale={locale} />}`. Completeness: `ToolIsland.test.ts` already `source.includes(\`slug === '${slug}'\`)`. Do not `import('qr')` here. Do not use dynamic tags with `client:load`.

---

### `src/data/tools.ts` (config, transform)

**Analog:** HEAD last row `markdown-preview`.

```typescript
{
  slug: 'markdown-preview',
  name: 'Markdown Preview',
  category: 'Format',
  shortDescription: 'Preview GitHub-flavored Markdown in your browser.',
  relatedSlugs: ['json-formatter', 'text-diff', 'word-counter'],
  featured: false,
},
```

**Append only:**

```typescript
{
  slug: 'qr-code',
  name: 'QR Code',
  category: 'Generate',
  shortDescription: 'Generate a QR from text or decode an image in your browser.',
  relatedSlugs: ['uuid-generator', 'password-generator', 'hash-generator'],
  featured: false,
}
```

Do **not** edit the first ten tools’ `relatedSlugs` (or any existing row). Category `'Generate'` already exists.

---

### `src/data/tools.test.ts` (test, transform)

**Analog:** HEAD `src/data/tools.test.ts`.

```typescript
it('has exactly 17 tools', () => {
  expect(TOOLS).toHaveLength(17);
});
expect(featured).toHaveLength(6);
```

Bump **17 → 18**. Featured stays **6**. Completeness already `existsSync(en)` / `existsSync(zh)` via `new URL(...)` — keep that; new md files make it pass. Never `.pathname`.

---

### `src/i18n/ui.ts` (config, transform)

**Analog:** HEAD `src/i18n/ui.ts` `markdown-preview` block (append both `en` and `zh`).

Append `tools['qr-code']` with UI-SPEC keys **only** on both locales. Do **not** add `emptyHeading` / `emptyBody`. Do not drop Phase 2–5 keys.

Locked copy:

| Key | EN | ZH |
|-----|----|----|
| `name` | QR Code | 二维码 |
| `shortDescription` | Generate a QR from text or decode an image in your browser. | 在浏览器里从文本生成二维码，或从图片解码。 |
| `generateSection` | Generate | 生成 |
| `decodeSection` | Decode | 解码 |
| `text` | Text or URL | 文本或网址 |
| `ecc` | Error correction | 纠错级别 |
| `preview` | Preview | 预览 |
| `downloadPng` | Download PNG | 下载 PNG |
| `image` | Image | 图片 |

ECC option labels are the letters L/M/Q/H (same both locales).

---

### `src/i18n/errors.ts` (config, transform)

**Analog:** HEAD `src/i18n/errors.ts` — **this phase maps five English strings**.

**Append** (do not drop existing keys):

```typescript
'Input too large to process in the browser.': '输入过长，无法在浏览器中处理。',
'Image is too large to process in the browser.': '图片过大，无法在浏览器中处理。',
'No QR code found in this image.': '图片中未找到二维码。',
'Could not read this file as an image.': '无法将此文件作为图片读取。',
'Cannot encode this text as a QR code.': '无法将这段文本编码为二维码。',
```

(`INPUT_TOO_LARGE_MSG` may already be mapped from Phase 5 — do not duplicate keys; keep one entry.)

---

### `src/i18n/errors.test.ts` (test, transform)

**Analog:** HEAD sql-formatter / markdown-preview describe. **Append** a `qr-code` describe; do not drop Phase 2–5 describes.

Chrome keys: `name`, `shortDescription`, `generateSection`, `decodeSection`, `text`, `ecc`, `preview`, `downloadPng`, `image` on en+zh. Assert `ZH_ERRORS` + `localizeError('zh', …)` for the five English strings.

---

### `src/content/tools/qr-code.md` / `src/content/tools/zh/qr-code.md` (config, file-I/O)

**Analog:** HEAD `src/content/tools/markdown-preview.md` (same schema as sql-formatter).

```yaml
---
locale: en
title: QR Code
description: Generate a QR from text or decode an image in your browser. Nothing is uploaded.
intro: Type text or a URL to preview a QR. Pick an image file to decode. Everything runs locally. This tool never uses the camera.
howTo:
  - Type text or a URL. The preview updates as you type. Choose error correction if you need it.
  - Download the QR as a PNG. The file is built in your browser.
  - Optional: choose an image file to decode. Copy the payload with Copy.
faq:
  - question: Is my text or image uploaded?
    answer: No. Encoding and decoding run in your browser. Nothing is uploaded.
  - question: Does this tool use the camera?
    answer: No. Decode is from a selected image file only. The tool never requests camera access.
  - question: Can I download SVG?
    answer: Not in this version. Download is PNG only.
---
```

Keep `locale: en` / `locale: zh`. `howTo` length **3**. `faq` **3–5**. FAQ must state: local / nothing uploaded / selected image file / never camera.

---

### `src/styles/global.css` (config, transform)

**Analog:** HEAD `.tool-grid.split` (reuse, do not retokenize) + additive Phase 5 `.md-preview` (same append style). This phase appends **only** `.qr-preview` rules. Do not retokenize `:root`. Do not reuse Phase 4 `#3dd68c` / `#13291f`. Ignore dirty overlay `--bg-elev` / Syne.

HEAD already:

```css
.tool-grid { display: grid; gap: 1rem; }
@media (min-width: 720px) {
  .tool-grid.split { grid-template-columns: 1fr 1fr; }
}
```

**Append only** `.qr-preview` from UI-SPEC: `width: min(256px, 100%); aspect-ratio: 1; height: auto; background: var(--bg); border: 1px solid var(--border); border-radius: 6px;` Idle empty. Populated: white `#ffffff`, 16px quiet zone, black modules `#000000`. Do not set `max-height: 384px` (that was markdown).

## Shared Patterns

### Discriminated union, never throw
**Source:** HEAD `src/lib/json.ts`
**Apply to:** `src/lib/qr.ts`
`trim() === ''` → `{ ok: false, error: '' }` **before** `encodeQR`. Catch encode/decode; never rethrow.

### Size guard in the island
**Source:** HEAD `src/lib/limits.ts` + `WordCounter.tsx`
Text: `isTooLarge` / `INPUT_MAX_CHARS` before encode. Image: `IMAGE_MAX_BYTES` on `file.size` **before** bitmap; also reject width/height `> 4096`. Do not use `INPUT_MAX_CHARS` for files.

### Locale chrome via `t(locale)`
**Source:** HEAD `WordCounter.tsx` / `SqlFormatter.tsx`
`import { t, type Locale } from '../../i18n/ui'` — not `useToolUi`, not `i18n/locales`.

### HEAD ToolShell (no locale)
**Source:** HEAD `src/components/ToolShell.tsx`
`error` + `output` + `children` only. Visual QR is children (`.qr-preview`); `<pre class="tool-output">` is decoded **text**. Copy/Copied hardcoded English.

### Completeness 8-file checklist
**Source:** HEAD `tools.test.ts` + `ToolIsland.test.ts`
`existsSync(URL)` not `.pathname`; `slug === '${slug}'` source-read; `locale={locale}` on the new branch.

### CAT-04 isolation
**Source:** HEAD `src/lib/sql.test.ts` / markdown.test.ts
Only `src/lib/qr.ts` contains `from 'qr'` and `from 'qr/decode.js'`. Never `'qr/dom.js'`. After build, `dist/_astro/JsonFormatter*.js` must not contain minify-surviving: `encodeQR`, `decodeQR`, `Capacity overflow`, `invalid ecc`, `pointsOnDetect`, `paulmillr`, `data:image/gif`. Do not grep `from 'qr'` in minified chunks as sufficient.

### Camera / XSS
Never `getUserMedia`, `capture`, `<video>`, `'qr/dom.js'`. Never `dangerouslySetInnerHTML` of user text or decoded payload. Preview is canvas pixels.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | Canvas PNG download + `createImageBitmap` file decode have no in-repo analog — planner uses RESEARCH + UI-SPEC. `.qr-preview` CSS is new additive like `.md-preview`. |

## Metadata

**Analog search scope:** git HEAD `src/lib`, `src/components/tools`, `src/components/ToolShell.tsx`, `src/data`, `src/i18n`, `src/content/tools`, `src/styles/global.css`
**Files scanned:** 20 tracked analogs (all `git ls-files` non-empty)
**Pattern extraction date:** 2026-09-14
**Wave 0 install:** `npm install qr@0.7.0` (not yet in `package.json`). Do not install `jsqr`, `qrcode`, `qr-scanner`, `@zxing/*`, `canvas`, or a second `jsdom`.
