'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { SegmentedControl } from '@mantine/core';
import { LOCALES, LOCALE_COOKIE } from '@/shared/i18n';

const LOCALE_SHORT: Record<string, string> = {
  en: 'EN',
  ru: 'RU',
  el: 'ΕΛ',
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(newLocale: string) {
    document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    router.replace(pathname, { locale: newLocale });
  }

  const data = LOCALES.map((l) => ({ label: LOCALE_SHORT[l] ?? l, value: l }));

  return (
    <SegmentedControl size="xs" value={locale} onChange={handleChange} data={data} />
  );
}
