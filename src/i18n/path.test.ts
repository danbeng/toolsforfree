import { describe, expect, it } from 'vitest';
import { localeFromPathname, localizedPath, switchLocalePath } from './path';

describe('localizedPath', () => {
  it('keeps EN unprefixed with a trailing slash', () => {
    expect(localizedPath('en', '/tools/')).toBe('/tools/');
  });

  it('prefixes ZH with /zh/', () => {
    expect(localizedPath('zh', '/tools/')).toBe('/zh/tools/');
  });

  it('maps EN home to /', () => {
    expect(localizedPath('en', '/')).toBe('/');
  });

  it('maps ZH home to /zh/ not /zh//', () => {
    expect(localizedPath('zh', '/')).toBe('/zh/');
  });

  it('adds leading and trailing slashes when missing', () => {
    expect(localizedPath('en', 'tools')).toBe('/tools/');
  });

  it('treats an illegal locale as en and does not throw', () => {
    expect(localizedPath('fr' as never, '/tools/')).toBe('/tools/');
  });
});

describe('switchLocalePath', () => {
  it('strips /zh when switching to en', () => {
    expect(switchLocalePath('/zh/tools/json-formatter/', 'en')).toBe(
      '/tools/json-formatter/',
    );
  });

  it('prefixes /zh when switching to zh', () => {
    expect(switchLocalePath('/tools/json-formatter/', 'zh')).toBe(
      '/zh/tools/json-formatter/',
    );
  });

  it('keeps the ZH path when switching zh to zh', () => {
    expect(switchLocalePath('/zh/tools/json-formatter/', 'zh')).toBe(
      '/zh/tools/json-formatter/',
    );
  });

  it('never returns a string that starts with two slashes', () => {
    const result = switchLocalePath('//evil.com', 'en');
    expect(result.startsWith('//')).toBe(false);
  });
});

describe('localeFromPathname', () => {
  it('treats /zh/ /zh and /zh/... as zh', () => {
    expect(localeFromPathname('/zh/')).toBe('zh');
    expect(localeFromPathname('/zh')).toBe('zh');
    expect(localeFromPathname('/zh/tools/')).toBe('zh');
  });

  it('treats /tools/ /zhfoo/ and empty input as en', () => {
    expect(localeFromPathname('/tools/')).toBe('en');
    expect(localeFromPathname('/zhfoo/')).toBe('en');
    expect(localeFromPathname('')).toBe('en');
  });

  it('is case-sensitive so /ZH/ is en', () => {
    expect(localeFromPathname('/ZH/')).toBe('en');
  });
});
