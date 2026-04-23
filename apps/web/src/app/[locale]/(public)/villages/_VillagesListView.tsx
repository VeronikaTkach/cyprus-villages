'use client';

import { useTranslations } from 'next-intl';
import { SimpleGrid, Text } from '@mantine/core';
import { Link } from '@/i18n/navigation';
import { EmptyState, LoadingState } from '@/shared/ui';
import { VillageCard, usePublicVillages } from '@/entities/village';

export function VillagesListView() {
  const t = useTranslations('villages');
  const { data: villages, isLoading, isError } = usePublicVillages();

  if (isLoading) return <LoadingState />;
  if (isError) return <Text c="red">{t('loadError')}</Text>;
  if (!villages?.length) return <EmptyState description={t('empty')} />;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={20}>
      {villages.map((village) => (
        <Link
          key={village.id}
          href={`/villages/${village.slug}`}
          style={{ textDecoration: 'none' }}
        >
          <VillageCard village={village} />
        </Link>
      ))}
    </SimpleGrid>
  );
}
