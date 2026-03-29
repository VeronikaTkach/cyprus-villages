'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SimpleGrid, Stack, Text } from '@mantine/core';
import { Link } from '@/i18n/navigation';
import { EmptyState, LoadingState } from '@/shared/ui';
import { FestivalCard, usePublicFestivals } from '@/entities/festival';
import type { IPublicFestivalsFilter } from '@/entities/festival';
import { FestivalsFilter } from './_FestivalsFilter';

export function FestivalsListView() {
  const t = useTranslations('festivals');
  const searchParams = useSearchParams();
  const router = useRouter();
  // usePathname is always a string here (inside a rendered page); the null union
  // is a Next.js type artefact for components that may render outside a layout.
  const pathname = usePathname() ?? '/festivals';

  // Derive filter state directly from URL — no separate useState.
  // searchParams is null during SSR before Suspense resolves; fall back to empty.
  const filters: IPublicFestivalsFilter = {
    category: searchParams?.get('category') ?? undefined,
    villageId: searchParams?.get('villageId') ? Number(searchParams.get('villageId')) : undefined,
    year: searchParams?.get('year') ? Number(searchParams.get('year')) : undefined,
    month: searchParams?.get('month') ? Number(searchParams.get('month')) : undefined,
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
