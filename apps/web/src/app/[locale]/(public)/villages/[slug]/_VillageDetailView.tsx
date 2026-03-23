'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Stack, Title, Text, Group, Divider } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { LoadingState } from '@/shared/ui';
import { usePublicVillage, getTranslation } from '@/entities/village';

interface IVillageDetailViewProps {
  slug: string;
}

export function VillageDetailView({ slug }: IVillageDetailViewProps) {
  const locale = useLocale();
  const t = useTranslations('villages');
  const { data: village, isLoading, isError } = usePublicVillage(slug);

  if (isLoading) return <LoadingState />;
  if (isError || !village) return <Text c="red">{t('notFound')}</Text>;

  const translation = getTranslation(village, locale);

  return (
    <Stack gap="lg">
      <div>
        <Group gap="sm" align="baseline" mb={4}>
          <Title order={1}>{translation?.name ?? village.slug}</Title>
          {village.nameEl && locale !== 'el' && (
            <Text size="xl" c="dimmed">
              {village.nameEl}
            </Text>
          )}
        </Group>
      </div>

      {(village.district ?? village.region) && (
        <Group gap="xs">
          <IconMapPin size={16} color="var(--mantine-color-teal-6)" />
          <Text c="dimmed">
            {[village.district, village.region].filter(Boolean).join(', ')}
          </Text>
        </Group>
      )}

      {translation?.description && (
        <>
          <Divider />
          <Text size="md" style={{ lineHeight: 1.7 }}>
            {translation.description}
          </Text>
        </>
      )}
    </Stack>
  );
}
