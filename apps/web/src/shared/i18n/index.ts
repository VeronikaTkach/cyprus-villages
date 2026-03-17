export const SUPPORTED_LOCALES = ['en', 'el'] as const;

export type TLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: TLocale = 'en';

export function isValidLocale(locale: string): locale is TLocale {
  return SUPPORTED_LOCALES.includes(locale as TLocale);
}
