export const LOCALES = ['en', 'ru', 'el'] as const;

export type TLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: TLocale = 'en';

export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const LOCALE_LABELS: Record<TLocale, string> = {
  en: 'English',
  ru: 'Русский',
  el: 'Ελληνικά',
};

export function isValidLocale(locale: string): locale is TLocale {
  return (LOCALES as readonly string[]).includes(locale);
}
