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

describe('password-generator chrome and errors', () => {
  it('maps empty charset and length errors in ZH_ERRORS', () => {
    expect(ZH_ERRORS['Select at least one character set']).toBe('请至少选择一种字符集');
    expect(ZH_ERRORS['Length must be between 8 and 128']).toBe('长度必须在 8 到 128 之间');
    expect(localizeError('zh', 'Select at least one character set')).toBe('请至少选择一种字符集');
    expect(localizeError('zh', 'Length must be between 8 and 128')).toBe('长度必须在 8 到 128 之间');
    expect(localizeError('en', 'Select at least one character set')).toBe(
      'Select at least one character set',
    );
  });

  it('shares password-generator chrome keys on en and zh', () => {
    const keys = [
      'name',
      'shortDescription',
      'length',
      'lowercase',
      'uppercase',
      'digits',
      'symbols',
      'excludeSimilar',
      'generate',
    ];
    for (const key of keys) {
      expect(ui.en.tools['password-generator']).toHaveProperty(key);
      expect(ui.zh.tools['password-generator']).toHaveProperty(key);
    }
  });
});
