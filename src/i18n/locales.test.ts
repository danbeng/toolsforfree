import { describe, expect, it } from 'vitest';
import { LOCALES, LOCALE_META, type Locale } from './locales';
import { fill, ui, type Locale as UiLocale } from './ui';
import { INPUT_TOO_LARGE_MSG } from '../lib/limits';

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

describe('ui chrome and fill', () => {
  it('replaces {name} tokens', () => {
    expect(fill('Hi {name}', { name: 'Devtoolbox' })).toBe('Hi Devtoolbox');
  });

  it('byte-matches INPUT_TOO_LARGE_MSG on en.tooLarge', () => {
    expect(ui.en.tooLarge).toBe(INPUT_TOO_LARGE_MSG);
  });

  it('exposes chrome keys on both locales', () => {
    for (const dict of [ui.en, ui.zh]) {
      expect(dict.langSwitch).toBeTruthy();
      expect(dict.navTools).toBeTruthy();
      expect(dict.navBlog).toBeTruthy();
      expect(dict.navAbout).toBeTruthy();
      expect(dict.homeLede).toBeTruthy();
      expect(dict.categories.Format).toBeTruthy();
      expect(dict.copy).toBeTruthy();
      expect(dict.copied).toBeTruthy();
      expect(dict.tools['json-formatter'].name).toBeTruthy();
    }
  });
});

const _keep: Locale = 'en';
const _keepUi: UiLocale = 'en';
void _keep;
void _keepUi;
