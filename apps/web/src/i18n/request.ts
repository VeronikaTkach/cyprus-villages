import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, isValidLocale } from '@/shared/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  // 1. Locale from URL segment (provided by next-intl middleware)
  let locale = await requestLocale;

  // 2. Cookie override — manual switcher preference
  if (!locale || !isValidLocale(locale)) {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
    if (cookieLocale && isValidLocale(cookieLocale)) {
      locale = cookieLocale;
    }
  }

  // 3. Accept-Language browser negotiation fallback
  if (!locale || !isValidLocale(locale)) {
    const headerStore = await headers();
    const acceptLanguage = headerStore.get('accept-language') ?? '';
    const preferred = acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase();
    locale = preferred && isValidLocale(preferred) ? preferred : DEFAULT_LOCALE;
  }

  const messages = (await import(`../../messages/${locale}.json`)).default as Record<string, unknown>;

  return {
    locale,
    messages,
  };
});

// Needed by next-intl to know the supported locales at build time
export { LOCALES, DEFAULT_LOCALE };
