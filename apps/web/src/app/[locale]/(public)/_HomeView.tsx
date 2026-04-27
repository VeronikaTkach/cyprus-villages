'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { IMapMarker } from '@/shared/ui';
import { usePublicFestivals, getLatestEdition } from '@/entities/festival';
import { usePublicVillages, getTranslation } from '@/entities/village';
import { HomeContent } from './_HomeContent';

const CYPRUS_CENTER: [number, number] = [35.0, 33.2];

export function HomeView() {
  const locale = useLocale();
  const t = useTranslations('home');
  const tFestivals = useTranslations('festivals');
  const tVillages = useTranslations('villages');

  const { data: festivals, isLoading: festivalsLoading } = usePublicFestivals();
  const { data: villages, isLoading: villagesLoading } = usePublicVillages();

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Intl.DateTimeFormat(locale, { month: 'short' })
          .format(new Date(2024, i, 1))
          .replace(/^\p{Ll}/u, (c) => c.toUpperCase()),
      })),
    [locale],
  );

  const monthsWithData = useMemo(() => {
    const set = new Set<number>();
    for (const f of festivals ?? []) {
      const edition = f.displayEdition !== undefined ? f.displayEdition : getLatestEdition(f);
      if (edition?.startDate && !edition.isDateTba) {
        set.add(new Date(edition.startDate).getMonth() + 1);
      } else if (f.typicalMonth) {
        set.add(f.typicalMonth);
      }
    }
    return set;
  }, [festivals]);

  const villageMarkers = useMemo<IMapMarker[]>(
    () =>
      (villages ?? [])
        .filter((v) => v.centerLat !== null && v.centerLng !== null)
        .map((v) => {
          const en = getTranslation(v, 'en');
          return {
            lat: v.centerLat!,
            lng: v.centerLng!,
            kind: 'village' as const,
            popup: v.nameEl
              ? `${v.nameEl}${en ? ` — ${en.name}` : ''}`
              : (en?.name ?? v.slug),
          };
        }),
    [villages],
  );

  return (
    <HomeContent
      strings={{
        eyebrow: t('eyebrow'),
        title: t('title'),
        description: t('description'),
        browseFestivals: t('browseFestivals'),
        exploreMap: t('exploreMap'),
        byMonthSection: t('byMonthSection'),
        festivalsSection: t('festivalsSection'),
        villagesSection: t('villagesSection'),
        mapSection: t('mapSection'),
        festivalEmpty: tFestivals('empty'),
        villageEmpty: tVillages('empty'),
      }}
      locale={locale}
      festivals={festivals}
      villages={villages}
      festivalsLoading={festivalsLoading}
      villagesLoading={villagesLoading}
      months={months}
      monthsWithData={monthsWithData}
      villageMarkers={villageMarkers}
      mapCenter={CYPRUS_CENTER}
    />
  );
}
