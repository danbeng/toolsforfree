import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TOOLS } from '../../data/tools';

describe('ToolIsland coverage', () => {
  // Completeness: every TOOLS slug needs a ToolIsland branch. See
  // .planning/codebase/CONVENTIONS.md (8-file checklist).
  const source = readFileSync(new URL('./ToolIsland.astro', import.meta.url), 'utf8');

  it('maps every catalog slug to a slug === branch', () => {
    for (const { slug } of TOOLS) {
      expect(
        source.includes(`slug === '${slug}'`),
        `missing ToolIsland branch for ${slug}`,
      ).toBe(true);
    }
  });
});
