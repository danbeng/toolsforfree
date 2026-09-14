import { describe, expect, it } from 'vitest';
import { ZH_ERRORS, localizeError } from './errors';
import { ui } from './ui';
import { INPUT_TOO_LARGE_MSG, IMAGE_TOO_LARGE_MSG } from '../lib/limits';
import { QR_ENCODE_FAIL_MSG, QR_NOT_FOUND_MSG } from '../lib/qr';

describe('lorem-ipsum chrome and errors', () => {
  it('maps Enter a count of at least 1 in ZH_ERRORS', () => {
    expect(ZH_ERRORS['Enter a count of at least 1']).toBe('请输入至少为 1 的数量');
    expect(localizeError('zh', 'Enter a count of at least 1')).toBe('请输入至少为 1 的数量');
    expect(localizeError('en', 'Enter a count of at least 1')).toBe('Enter a count of at least 1');
    expect(ZH_ERRORS['Count exceeds the maximum']).toBe('数量超过上限');
    expect(localizeError('zh', 'Count exceeds the maximum')).toBe('数量超过上限');
    expect(localizeError('en', 'Count exceeds the maximum')).toBe('Count exceeds the maximum');
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

describe('sql-formatter chrome and errors', () => {
  it('maps Invalid SQL in ZH_ERRORS', () => {
    expect(ZH_ERRORS['Invalid SQL']).toBe('无效的 SQL');
    expect(localizeError('zh', 'Invalid SQL')).toBe('无效的 SQL');
    expect(localizeError('en', 'Invalid SQL')).toBe('Invalid SQL');
  });

  it('shares sql-formatter chrome keys on en and zh', () => {
    const keys = ['name', 'shortDescription', 'sql', 'dialect'];
    for (const key of keys) {
      expect(ui.en.tools['sql-formatter']).toHaveProperty(key);
      expect(ui.zh.tools['sql-formatter']).toHaveProperty(key);
    }
  });
});

describe('text-diff chrome', () => {
  it('shares text-diff chrome keys on en and zh', () => {
    const keys = [
      'name',
      'shortDescription',
      'original',
      'changed',
      'added',
      'removed',
      'ignoreWhitespace',
      'noDifferences',
      'emptyHeading',
      'emptyBody',
      'noDifferencesBody',
      'tooLargeOriginal',
      'tooLargeChanged',
      'tooLargeBoth',
    ];
    for (const key of keys) {
      expect(ui.en.tools['text-diff']).toHaveProperty(key);
      expect(ui.zh.tools['text-diff']).toHaveProperty(key);
    }
  });
});

describe('markdown-preview chrome and errors', () => {
  it('shares markdown-preview chrome keys on en and zh', () => {
    const keys = ['name', 'shortDescription', 'markdown', 'preview'];
    for (const key of keys) {
      expect(ui.en.tools['markdown-preview']).toHaveProperty(key);
      expect(ui.zh.tools['markdown-preview']).toHaveProperty(key);
    }
  });

  it('maps INPUT_TOO_LARGE_MSG in ZH_ERRORS', () => {
    expect(ZH_ERRORS[INPUT_TOO_LARGE_MSG]).toBe('输入过长，无法在浏览器中处理。');
    expect(localizeError('zh', INPUT_TOO_LARGE_MSG)).toBe(
      '输入过长，无法在浏览器中处理。',
    );
    expect(localizeError('en', INPUT_TOO_LARGE_MSG)).toBe(INPUT_TOO_LARGE_MSG);
  });
});

describe('qr-code chrome and errors', () => {
  it('shares qr-code chrome keys on en and zh', () => {
    const keys = [
      'name',
      'shortDescription',
      'generateSection',
      'decodeSection',
      'text',
      'ecc',
      'preview',
      'downloadPng',
      'image',
    ];
    for (const key of keys) {
      expect(ui.en.tools['qr-code']).toHaveProperty(key);
      expect(ui.zh.tools['qr-code']).toHaveProperty(key);
    }
  });

  it('maps image-cap, not-found, not-an-image, encode-fail, and text-cap in ZH_ERRORS', () => {
    expect(ZH_ERRORS[IMAGE_TOO_LARGE_MSG]).toBe('图片过大，无法在浏览器中处理。');
    expect(localizeError('zh', IMAGE_TOO_LARGE_MSG)).toBe(
      '图片过大，无法在浏览器中处理。',
    );
    expect(ZH_ERRORS[QR_NOT_FOUND_MSG]).toBe('图片中未找到二维码。');
    expect(localizeError('zh', QR_NOT_FOUND_MSG)).toBe('图片中未找到二维码。');
    expect(ZH_ERRORS['Could not read this file as an image.']).toBe(
      '无法将此文件作为图片读取。',
    );
    expect(localizeError('zh', 'Could not read this file as an image.')).toBe(
      '无法将此文件作为图片读取。',
    );
    expect(ZH_ERRORS[QR_ENCODE_FAIL_MSG]).toBe('无法将这段文本编码为二维码。');
    expect(localizeError('zh', QR_ENCODE_FAIL_MSG)).toBe(
      '无法将这段文本编码为二维码。',
    );
    expect(ZH_ERRORS[INPUT_TOO_LARGE_MSG]).toBe('输入过长，无法在浏览器中处理。');
    expect(localizeError('zh', INPUT_TOO_LARGE_MSG)).toBe(
      '输入过长，无法在浏览器中处理。',
    );
  });
});
