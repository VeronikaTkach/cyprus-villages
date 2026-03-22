'use client';

import { Stack, Title, Text, Badge, Group, Divider } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { LoadingState } from '@/shared/ui';
import { usePublicVillage } from '@/entities/village';

interface IVillageDetailViewProps {
  slug: string;
}

export function VillageDetailView({ slug }: IVillageDetailViewProps) {
  const { data: village, isLoading, isError } = usePublicVillage(slug);

  if (isLoading) return <LoadingState />;
  if (isError || !village) return <Text c="red">Village not found.</Text>;

  return (
    <Stack gap="lg">
      <div>
        <Group gap="sm" align="baseline" mb={4}>
          <Title order={1}>{village.nameEn}</Title>
          {village.nameEl && (
            <Text size="xl" c="dimmed">
              {village.nameEl}
            </Text>
          )}
        </Group>
        {village.nameRu && (
          <Text c="dimmed" size="md">
            {village.nameRu}
          </Text>
        )}
      </div>

      {(village.district ?? village.region) && (
        <Group gap="xs">
          <IconMapPin size={16} color="var(--mantine-color-teal-6)" />
          <Text c="dimmed">
            {[village.district, village.region].filter(Boolean).join(', ')}
          </Text>
        </Group>
      )}

      {village.descriptionEn && (
        <>
          <Divider />
          <Text size="md" style={{ lineHeight: 1.7 }}>
            {village.descriptionEn}
          </Text>
        </>
      )}

      <Badge variant="outline" color="gray" size="sm" w="fit-content">
        {village.slug}
      </Badge>
    </Stack>
  );
}
