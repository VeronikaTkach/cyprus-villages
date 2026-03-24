'use client';

import { useLocale } from 'next-intl';
import { Badge, Card, Group, Stack, Text, Title } from '@mantine/core';
import { getFestivalTranslation, getLatestEdition } from '../model';
import type { IFestival } from '../model';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  EDITION_STATUS_COLORS,
  formatDateRange,
} from './constants';

interface IFestivalCardProps {
  festival: IFestival;
}

export function FestivalCard({ festival }: IFestivalCardProps) {
  const locale = useLocale();
  const t = getFestivalTranslation(festival, locale);
  const latest = getLatestEdition(festival);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Stack gap="xs" h="100%">
        {/* Greek title — always shown prominently */}
        {festival.titleEl && (
          <Title order={3} lh={1.2}>
            {festival.titleEl}
          </Title>
        )}

        {/* Locale title — shown below if different from Greek */}
        {t?.title && t.title !== festival.titleEl && (
          <Text size="sm" c="dimmed" fw={500}>
            {t.title}
          </Text>
        )}

        <Group gap="xs" mt={4}>
          <Badge
            variant="light"
            color={CATEGORY_COLORS[festival.category]}
            size="sm"
          >
            {CATEGORY_LABELS[festival.category]}
          </Badge>
        </Group>

        {/* Latest edition dates */}
        {latest && (
          <Text size="sm" c="dimmed" mt="xs">
            {latest.isDateTba
              ? 'Dates TBA'
              : latest.startDate
                ? formatDateRange(latest.startDate, latest.endDate)
                : null}
            {latest.status !== 'PUBLISHED' && (
              <Badge
                ml={6}
                variant="dot"
                color={EDITION_STATUS_COLORS[latest.status]}
                size="xs"
              >
                {latest.status}
              </Badge>
            )}
          </Text>
        )}

        {/* Description */}
        {t?.description && (
          <Text size="sm" c="dimmed" lineClamp={3} mt="auto" pt="xs">
            {t.description}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
