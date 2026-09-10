import { describe, expect, it } from 'vitest';
import { INPUT_MAX_CHARS, isTooLarge } from './limits';

describe('isTooLarge', () => {
  it('is false at the limit', () => {
    expect(isTooLarge('a'.repeat(INPUT_MAX_CHARS))).toBe(false);
  });
  it('is true over the limit', () => {
    expect(isTooLarge('a'.repeat(INPUT_MAX_CHARS + 1))).toBe(true);
  });
});
