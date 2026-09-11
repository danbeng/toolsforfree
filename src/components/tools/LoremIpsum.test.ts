import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('LoremIpsum island', () => {
  const source = readFileSync(new URL('./LoremIpsum.tsx', import.meta.url), 'utf8');

  it('calls generateLorem from the lib and copies via ToolShell output', () => {
    expect(source.includes("from '../../lib/lorem'")).toBe(true);
    expect(source.includes('generateLorem')).toBe(true);
    expect(source.includes('output={output}')).toBe(true);
    expect(source.includes('type="button"')).toBe(true);
  });

  it('does not inject HTML or use a network client', () => {
    expect(source.includes('fetch')).toBe(false);
    expect(source.includes('innerHTML')).toBe(false);
    expect(source.includes('dangerouslySetInnerHTML')).toBe(false);
  });
});
