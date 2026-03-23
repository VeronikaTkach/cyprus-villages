'use client';

import { useLocale } from 'next-intl';
import { Card, Text, Badge, Group, Stack } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { getTranslation } from '../model';
import type { IVillage } from '../model';

interface IVillageCardProps {
  village: IVillage;
}

export function VillageCard({ village }: IVillageCardProps) {
  const locale = useLocale();
  const t = getTranslation(village, locale);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Text fw={600} size="lg" lineClamp={1}>
            {t?.name ?? village.slug}
          </Text>
          {village.nameEl && locale !== 'el' && (
            <Text c="dimmed" size="sm" style={{ flexShrink: 0 }}>
              {village.nameEl}
            </Text>
          )}
        </Group>

        {(village.district ?? village.region) && (
          <Group gap="xs">
            <IconMapPin size={14} color="var(--mantine-color-dimmed)" />
            <Text c="dimmed" size="sm">
              {[village.district, village.region].filter(Boolean).join(', ')}
            </Text>
          </Group>
        )}

        {t?.description && (
          <Text size="sm" c="dimmed" lineClamp={3}>
            {t.description}
          </Text>
        )}

        <Badge variant="light" color="teal" size="sm" mt="xs">
          {village.slug}
        </Badge>
      </Stack>
    </Card>
  );
}
