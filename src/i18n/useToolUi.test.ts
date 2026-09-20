import { describe, expect, it } from 'vitest';
import { useToolUi } from './useToolUi';
import { INPUT_TOO_LARGE_MSG } from '../lib/limits';

describe('useToolUi', () => {
  it('returns copy, tooLarge, err', () => {
    const { copy, tooLarge, err } = useToolUi('en');
    expect(tooLarge).toBe(INPUT_TOO_LARGE_MSG);
    expect(copy.tooLarge).toBe(INPUT_TOO_LARGE_MSG);
    expect(err('')).toBeNull();
    expect(err(null)).toBeNull();
    expect(err('Invalid JSON')).toBe('Invalid JSON');
  });

  it('maps tooLarge via ZH_ERRORS when err() is used on zh', () => {
    const { err, tooLarge } = useToolUi('zh');
    expect(err(INPUT_TOO_LARGE_MSG)).toBe('输入过长，无法在浏览器中处理。');
    expect(typeof tooLarge).toBe('string');
  });
});
