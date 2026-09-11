import { describe, expect, it } from 'vitest';
import { ZH_ERRORS, localizeError } from './errors';
import { ui } from './ui';

describe('lorem-ipsum chrome and errors', () => {
  it('maps Enter a count of at least 1 in ZH_ERRORS', () => {
    expect(ZH_ERRORS['Enter a count of at least 1']).toBe('请输入至少为 1 的数量');
    expect(localizeError('zh', 'Enter a count of at least 1')).toBe('请输入至少为 1 的数量');
    expect(localizeError('en', 'Enter a count of at least 1')).toBe('Enter a count of at least 1');
  });

  it('shares lorem-ipsum chrome keys on en and zh', () => {
    const keys = ['name', 'shortDescription', 'mode', 'words', 'paragraphs', 'count', 'classic', 'generate'];
    for (const key of keys) {
      expect(ui.en.tools['lorem-ipsum']).toHaveProperty(key);
      expect(ui.zh.tools['lorem-ipsum']).toHaveProperty(key);
    }
  });
});
