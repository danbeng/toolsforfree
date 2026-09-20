export const LOCALES = ['en', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<
  Locale,
  { hreflang: string; htmlLang: string; nativeLabel: string }
> = {
  en: { hreflang: 'en', htmlLang: 'en', nativeLabel: 'English' },
  zh: { hreflang: 'zh-Hans', htmlLang: 'zh-Hans', nativeLabel: '中文' },
};
