import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const header = readFileSync(new URL('../components/Header.astro', import.meta.url), 'utf8');
const langSwitch = readFileSync(new URL('../components/LangSwitch.astro', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../layouts/BaseLayout.astro', import.meta.url), 'utf8');
const enHome = readFileSync(new URL('../pages/index.astro', import.meta.url), 'utf8');
const zhHome = readFileSync(new URL('../pages/zh/index.astro', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');

describe('pages land — header LangSwitch', () => {
  it('mounts LangSwitch after #navMenu and before ThemeToggle', () => {
    expect(header.includes('LangSwitch')).toBe(true);
    expect(header.includes('localizedPath')).toBe(true);
    expect(header.includes('copy.navTools')).toBe(true);
    expect(header.includes('copy.navBlog')).toBe(true);
    expect(header.includes('copy.navAbout')).toBe(true);
    const navMenu = header.indexOf('id="navMenu"');
    const lang = header.indexOf('<LangSwitch');
    const theme = header.indexOf('<ThemeToggle');
    expect(navMenu).toBeGreaterThan(-1);
    expect(lang).toBeGreaterThan(navMenu);
    expect(lang).toBeLessThan(theme);
  });

  it('requires locale: Locale with no optional marker or en fallback', () => {
    expect(header.includes('locale: Locale')).toBe(true);
    expect(header.includes('locale?:')).toBe(false);
    expect(header.includes("?? 'en'")).toBe(false);
  });
});

describe('pages land — LangSwitch contract', () => {
  it('maps LOCALES with switchLocalePath, nativeLabel, aria-current, and lang-switch', () => {
    expect(langSwitch.includes('switchLocalePath')).toBe(true);
    expect(langSwitch.includes('nativeLabel')).toBe(true);
    expect(langSwitch.includes('aria-current')).toBe(true);
    expect(langSwitch.includes('lang-switch')).toBe(true);
  });
});

describe('pages land — BaseLayout locale', () => {
  it('sets htmlLang, switchLocalePath canonical, Header/Footer locale, and x-default', () => {
    expect(layout.includes('LOCALE_META[locale].htmlLang')).toBe(true);
    expect(layout.includes('switchLocalePath')).toBe(true);
    expect(layout.includes('Header locale={locale}')).toBe(true);
    expect(layout.includes('Footer locale={locale}')).toBe(true);
    expect(layout.includes('hreflang="x-default"') || layout.includes("hreflang='x-default'") || layout.includes('hreflang="x-default"')).toBe(true);
    expect(layout.includes('x-default')).toBe(true);
  });
});

describe('pages land — home routes', () => {
  it('passes locale on EN home and commits ZH home', () => {
    expect(enHome.includes('locale={locale}') || enHome.includes('locale={locale}')).toBe(true);
    expect(enHome.includes('locale')).toBe(true);
    expect(existsSync(new URL('../pages/zh/index.astro', import.meta.url))).toBe(true);
    expect(zhHome.includes("locale = 'zh'")).toBe(true);
  });
});

describe('pages land — lang-switch CSS', () => {
  it('includes .lang-switch and mobile ThemeToggle margin-left 0', () => {
    expect(css.includes('.lang-switch')).toBe(true);
    const mobileTheme = css.match(/@media \(max-width: 640px\) \{[\s\S]*?#themeToggle \{[\s\S]*?margin-left:\s*0;/);
    expect(mobileTheme).not.toBeNull();
  });
});

const zhRoot = new URL('../pages/zh/', import.meta.url);
const zhFiles = [
  'index.astro',
  'tools/index.astro',
  'tools/[slug].astro',
  'about.astro',
  'blog/index.astro',
  'privacy.astro',
  'terms.astro',
];

describe('pages land — ZH tree', () => {
  it('has the seven ZH routes', () => {
    for (const file of zhFiles) {
      expect(existsSync(new URL(file, zhRoot)), `missing zh/${file}`).toBe(true);
    }
  });
});

describe('pages land — FaqList items only', () => {
  it('EN and ZH slug pages include FaqList without extra props', () => {
    const enSlug = readFileSync(new URL('../pages/tools/[slug].astro', import.meta.url), 'utf8');
    const zhSlug = readFileSync(new URL('../pages/zh/tools/[slug].astro', import.meta.url), 'utf8');
    expect(enSlug.includes('FaqList')).toBe(true);
    expect(zhSlug.includes('FaqList')).toBe(true);
    expect(enSlug.includes('heading=')).toBe(false);
    expect(zhSlug.includes('heading=')).toBe(false);
  });
});
