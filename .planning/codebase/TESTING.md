# Testing Patterns

**Analysis Date:** 2026-09-10

## Test Framework

**Runner:**
- Vitest `^5.0.0` (`package.json` `devDependencies`)
- Config: `vitest.config.ts`

**Assertion Library:**
- Vitest built-in `expect` (imported from `'vitest'`)

**Run Commands:**
```bash
npm test              # vitest run (CI / one-shot)
npx vitest            # watch (not scripted; use when iterating)
```

No coverage script is defined.

**Config (`vitest.config.ts`):**
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
  },
});
```

- Node environment only (no jsdom/happy-dom).
- Include glob is `*.test.ts` — `.tsx` component tests are out of scope unless you change this config.

## Test File Organization

**Location:**
- Co-located next to the unit under test.

**Naming:**
- `<module>.test.ts` beside `<module>.ts`

**Structure:**
```
src/lib/json.ts
src/lib/json.test.ts
src/lib/jwt.ts
src/lib/jwt.test.ts
src/data/tools.ts
src/data/tools.test.ts
src/i18n/path.ts
src/i18n/path.test.ts
```

Existing suites:
- `src/lib/limits.test.ts`
- `src/lib/json.test.ts`
- `src/lib/jwt.test.ts`
- `src/lib/base64.test.ts`
- `src/lib/url.test.ts`
- `src/lib/hash.test.ts`
- `src/lib/regex.test.ts`
- `src/lib/timestamp.test.ts`
- `src/lib/crontab.test.ts`
- `src/lib/color.test.ts`
- `src/data/tools.test.ts`
- `src/i18n/path.test.ts`

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it } from 'vitest';
import { formatJson } from './json';

describe('formatJson', () => {
  it('formats valid JSON', () => {
    const result = formatJson('{"a":1}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(JSON.parse(result.formatted)).toEqual({ a: 1 });
    }
  });

  it('returns Invalid JSON for truncated input', () => {
    expect(formatJson('{')).toEqual({ ok: false, error: 'Invalid JSON' });
  });
});
```

**Patterns:**
- One `describe` per exported function or module (`'formatJson'`, `'decodeJwt'`, `'TOOLS registry'`, `'i18n paths'`).
- `it('does X')` in present tense, behavior-focused.
- No `beforeEach` / `afterEach` in current tests; keep tests stateless.
- Narrow `if (result.ok)` after `expect(result.ok).toBe(true)` so TypeScript discriminates the union.
- Exact equality on failure shapes: `toEqual({ ok: false, error: 'Invalid JSON' })`.

## Mocking

**Framework:** Not used. No `vi.mock`, `vi.fn`, or spies in `src/**/*.test.ts`.

**Patterns:**
```typescript
// Prefer real implementations and constructed fixtures
const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');
```

**What to Mock:**
- Nothing for `src/lib/*` parsers, `src/data/tools.ts`, or `src/i18n/path.ts`. They are pure.

**What NOT to Mock:**
- Do not mock `JSON.parse`, encoding APIs, or the tools registry.
- Do not introduce component/DOM tests unless you add a browser environment and change `include` to `*.test.tsx`.

## Fixtures and Factories

**Test Data:**
```typescript
// Inline literals in the test (json.test.ts)
formatJson('{"a":1}')
formatJson('{')
formatJson('   ')

// Built JWT parts in jwt.test.ts
const payload = btoa(JSON.stringify({ sub: '123' }))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');
```

**Location:**
- Inside the test file. No `fixtures/` or factory helpers.

**Limits:**
- Size tests use `'a'.repeat(INPUT_MAX_CHARS)` from `src/lib/limits.ts` (`src/lib/limits.test.ts`).

## Coverage

**Requirements:** None enforced (no `coverage` block in `vitest.config.ts`, no CI coverage gate detected).

**View Coverage:**
```bash
npx vitest run --coverage
```
(Would require adding `@vitest/coverage-v8` or similar; not currently a project dependency.)

**Practical coverage today:**
- Pure libs and the tools registry are unit-tested.
- Preact islands (`src/components/tools/*.tsx`), Astro pages, and `ToolShell` clipboard behavior are untested.

## Test Types

**Unit Tests:**
- Pure functions in `src/lib/*`.
- Registry invariants in `src/data/tools.test.ts` (count, unique slugs, featured set, related tools, category grouping).
- i18n path helpers in `src/i18n/path.test.ts` (prefix, trailing slashes, locale switch).

**Integration Tests:**
- Not used.

**E2E Tests:**
- Not used (no Playwright/Cypress).

## Common Patterns

**Async Testing:**
- Current tests are synchronous. If you add async libs, use:
```typescript
it('resolves', async () => {
  await expect(fn()).resolves.toEqual(/* ... */);
});
```

**Error Testing:**
```typescript
it('returns empty error for empty input', () => {
  expect(formatJson('')).toEqual({ ok: false, error: '' });
  expect(formatJson('   ')).toEqual({ ok: false, error: '' });
});

it('does not evaluate JavaScript', () => {
  expect(formatJson('{a:1}')).toEqual({ ok: false, error: 'Invalid JSON' });
});
```

- Assert the English `error` string from the lib, not localized copy (`localizeError` is not covered by a dedicated test file).
- Security-ish cases belong in the lib test (`does not evaluate JavaScript`).

**Registry tests:**
- Pin product invariants (`has exactly 10 tools`, `features exactly six tools`) in `src/data/tools.test.ts`. Update those numbers when adding a tool.

**When adding a new tool:**
1. Implement `src/lib/<name>.ts` with an `ok` union.
2. Add `src/lib/<name>.test.ts` co-located; cover valid, invalid, and empty input.
3. Register in `src/data/tools.ts` and extend `src/data/tools.test.ts` counts.
4. Map the English error in `src/i18n/errors.ts` `ZH_ERRORS`.
5. Do not add `.tsx` tests unless Vitest `include` and environment are updated.

---

*Testing analysis: 2026-09-10*
