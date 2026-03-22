'use client';

import Link from 'next/link';
import { SimpleGrid, Text } from '@mantine/core';
import { EmptyState, LoadingState } from '@/shared/ui';
import { VillageCard, usePublicVillages } from '@/entities/village';

export function VillagesListView() {
  const { data: villages, isLoading, isError } = usePublicVillages();

  if (isLoading) return <LoadingState />;
  if (isError) return <Text c="red">Failed to load villages.</Text>;
  if (!villages?.length) return <EmptyState description="No villages found." />;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
      {villages.map((village) => (
        <Link key={village.id} href={`/villages/${village.slug}`} style={{ textDecoration: 'none' }}>
          <VillageCard village={village} />
        </Link>
      ))}
    </SimpleGrid>
  );
}
