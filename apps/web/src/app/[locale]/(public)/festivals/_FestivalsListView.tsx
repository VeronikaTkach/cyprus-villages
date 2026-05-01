'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Stack, Text } from '@mantine/core';
import { EmptyState, LoadingState } from '@/shared/ui';
import { usePublicFestivals, CATEGORY_LABELS, getLatestEdition } from '@/entities/festival';
import type { IPublicFestivalsFilter } from '@/entities/festival';
import { usePublicVillages } from '@/entities/village';
import { FestivalsFilter } from './_FestivalsFilter';
import { MonthStrip } from './_MonthStrip';
import { FestivalsTimeline } from './_FestivalsTimeline';

// Derived from CATEGORY_LABELS keys so it stays in sync with the entity definition.
const VALID_CATEGORIES = new Set(Object.keys(CATEGORY_LABELS));

/**
 * Parse a URL search param as a positive integer.
 * Returns undefined for missing, non-numeric, non-integer, or non-positive values
 * so that malformed params are silently dropped rather than passed to the API.
 */
function parsePositiveInt(val: string | null | undefined): number | undefined {
  if (!val) return undefined;
  const n = Number(val);
  return Number.isFinite(n) && Number.isInteger(n) && n > 0 ? n : undefined;
}

export function FestivalsListView() {
  const t = useTranslations('festivals');
  const searchParams = useSearchParams();
  const { data: villages } = usePublicVillages();
  const router = useRouter();
  // usePathname is always a string here (inside a rendered page); the null union
  // is a Next.js type artefact for components that may render outside a layout.
  const pathname = usePathname() ?? '/festivals';

  // Derive filter state directly from URL — no separate useState.
  // searchParams is null before the Suspense boundary resolves; fall back to empty.
  // All params are validated: invalid values become undefined (unselected) rather
  // than being forwarded to the API where they would trigger a 400 error.
  const rawCategory = searchParams?.get('category');
  const filters: IPublicFestivalsFilter = {
    category: rawCategory && VALID_CATEGORIES.has(rawCategory) ? rawCategory : undefined,
    villageId: parsePositiveInt(searchParams?.get('villageId')),
    year: parsePositiveInt(searchParams?.get('year')),
    month: (() => {
      const m = parsePositiveInt(searchParams?.get('month'));
      return m !== undefined && m >= 1 && m <= 12 ? m : undefined;
    })(),
  };

  const hasFilters = !!(filters.category || filters.villageId || filters.year || filters.month);

  function handleFiltersChange(newFilters: IPublicFestivalsFilter) {
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.villageId !== undefined) params.set('villageId', String(newFilters.villageId));
    if (newFilters.year !== undefined) params.set('year', String(newFilters.year));
    if (newFilters.month !== undefined) params.set('month', String(newFilters.month));
    const qs = params.toString();
    // scroll: false keeps the user's scroll position when changing filters
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const { data: festivals, isLoading, isError } = usePublicFestivals(filters);

  // Compute which months have data in the current result set.
  // Also always include the active month filter (if set) so the strip highlights
  // it even when all matched festivals have undated or cross-month latest editions.
  const activeMonths = useMemo(() => {
    const months = new Set<number>();
    for (const festival of festivals ?? []) {
      // Prefer displayEdition when present (respects active filters); fall back to latest.
      const edition =
        festival.displayEdition !== undefined
          ? festival.displayEdition
          : getLatestEdition(festival);
      if (edition && !edition.isDateTba && edition.startDate) {
        months.add(new Date(edition.startDate).getMonth() + 1);
      }
    }
    if (filters.month !== undefined) months.add(filters.month);
    return months;
  }, [festivals, filters.month]);

  const villageOptions = useMemo(
    () => (villages ?? []).map((v) => ({ value: String(v.id), label: v.nameEl ?? v.slug })),
    [villages],
  );

  return (
    <Stack gap={32}>
      <FestivalsFilter filters={filters} onChange={handleFiltersChange} villageOptions={villageOptions} />

      {!isLoading && !isError && (festivals?.length ?? 0) > 0 && (
        <MonthStrip activeMonths={activeMonths} filters={filters} onChange={handleFiltersChange} />
      )}

      {isLoading && <LoadingState />}
      {isError && <Text c="red">{t('loadError')}</Text>}

      {!isLoading && !isError && festivals !== undefined && festivals.length === 0 && (
        <EmptyState
          title={hasFilters ? t('filters.noResultsTitle') : undefined}
          description={hasFilters ? t('filters.noResultsHint') : t('empty')}
        />
      )}

      {!isLoading && !isError && festivals && festivals.length > 0 && (
        <FestivalsTimeline festivals={festivals} activeYear={filters.year} />
      )}
    </Stack>
  );
}
