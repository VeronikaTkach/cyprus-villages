'use client';

import { useLocale } from 'next-intl';
import { Card, Group, Stack, Text } from '@mantine/core';
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
    <Card
      padding={20}
      radius="md"
      withBorder
      className="cv-card"
      style={{ borderColor: 'var(--cv-line)' }}
    >
      <Stack gap={12}>
        {/* Title row: locale name + Greek name side by side */}
        <Group justify="space-between" align="baseline" gap={12}>
          <Text
            fw={500}
            size="lg"
            lineClamp={1}
            style={{ letterSpacing: '-0.01em', color: 'var(--cv-ink)' }}
          >
            {t?.name ?? village.slug}
          </Text>
          {village.nameEl && locale !== 'el' && (
            <Text
              size="sm"
              style={{ color: 'var(--cv-ink-3)', fontStyle: 'italic', flexShrink: 0 }}
            >
              {village.nameEl}
            </Text>
          )}
        </Group>

        {/* Region / district */}
        {(village.district ?? village.region) && (
          <Group gap={6}>
            <IconMapPin size={13} color="var(--cv-ink-4)" />
            <Text size="sm" style={{ color: 'var(--cv-ink-3)' }}>
              {[village.district, village.region].filter(Boolean).join(', ')}
            </Text>
          </Group>
        )}

        {/* Description */}
        {t?.description && (
          <Text
            size="sm"
            lineClamp={3}
            style={{ color: 'var(--cv-ink-2)', lineHeight: 1.55 }}
          >
            {t.description}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
