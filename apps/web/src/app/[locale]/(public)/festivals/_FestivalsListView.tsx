'use client';

import { useTranslations } from 'next-intl';
import { SimpleGrid, Text } from '@mantine/core';
import { Link } from '@/i18n/navigation';
import { EmptyState, LoadingState } from '@/shared/ui';
import { FestivalCard, usePublicFestivals } from '@/entities/festival';

export function FestivalsListView() {
  const t = useTranslations('festivals');
  const { data: festivals, isLoading, isError } = usePublicFestivals();

  if (isLoading) return <LoadingState />;
  if (isError) return <Text c="red">{t('loadError')}</Text>;
  if (!festivals?.length) return <EmptyState description={t('empty')} />;

  return (
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
  );
}
