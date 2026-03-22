'use client';

import { Card, Text, Badge, Group, Stack } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import type { IVillage } from '../model';

interface IVillageCardProps {
  village: IVillage;
}

export function VillageCard({ village }: IVillageCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Text fw={600} size="lg" lineClamp={1}>
            {village.nameEn}
          </Text>
          {village.nameEl && (
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

        {village.descriptionEn && (
          <Text size="sm" c="dimmed" lineClamp={3}>
            {village.descriptionEn}
          </Text>
        )}

        <Badge variant="light" color="teal" size="sm" mt="xs">
          {village.slug}
        </Badge>
      </Stack>
    </Card>
  );
}
