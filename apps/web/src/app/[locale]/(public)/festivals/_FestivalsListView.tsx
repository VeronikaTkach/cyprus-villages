'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SimpleGrid, Stack, Text } from '@mantine/core';
import { Link } from '@/i18n/navigation';
import { EmptyState, LoadingState } from '@/shared/ui';
import { FestivalCard, usePublicFestivals, CATEGORY_LABELS } from '@/entities/festival';
import type { IPublicFestivalsFilter } from '@/entities/festival';
import { FestivalsFilter } from './_FestivalsFilter';

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

  return (
    <Stack gap="lg">
      <FestivalsFilter filters={filters} onChange={handleFiltersChange} />

      {isLoading && <LoadingState />}
      {isError && <Text c="red">{t('loadError')}</Text>}

      {!isLoading && !isError && festivals !== undefined && festivals.length === 0 && (
        <EmptyState description={hasFilters ? t('filters.noResults') : t('empty')} />
      )}

      {!isLoading && !isError && festivals && festivals.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {festivals.map((festival) => (
            <Link
              key={festival.id}
              href={`/festivals/${festival.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <FestivalCard festival={festival} />
            </Link>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
