import { describe, expect, it } from 'vitest';
import { LOCALES, LOCALE_META, type Locale } from './locales';

describe('LOCALES', () => {
  it('is en then zh', () => {
    expect(LOCALES).toEqual(['en', 'zh']);
  });

  it('exposes en meta', () => {
    expect(LOCALE_META.en).toEqual({
      hreflang: 'en',
      htmlLang: 'en',
      nativeLabel: 'English',
    });
  });

  it('exposes zh-Hans meta', () => {
    expect(LOCALE_META.zh).toEqual({
      hreflang: 'zh-Hans',
      htmlLang: 'zh-Hans',
      nativeLabel: '中文',
    });
  });
});

const _keep: Locale = 'en';
void _keep;
