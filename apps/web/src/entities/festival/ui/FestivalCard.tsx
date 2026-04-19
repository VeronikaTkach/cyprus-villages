'use client';

import { useLocale, useTranslations } from 'next-intl';
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
  isOngoing?: boolean;
  isSoon?: boolean;
}

export function FestivalCard({ festival, isOngoing, isSoon }: IFestivalCardProps) {
  const locale = useLocale();
  const t = useTranslations('festivals');
  const translation = getFestivalTranslation(festival, locale);
  // Prefer displayEdition when present (respects active filters); fall back to latest.
  const edition =
    festival.displayEdition !== undefined
      ? festival.displayEdition
      : getLatestEdition(festival);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Stack gap="xs" h="100%">
        {/* Ongoing / Soon badges — rendered inside the card to keep grid rows aligned */}
        {(isOngoing || isSoon) && (
          <Group gap="xs">
            {isOngoing && (
              <Badge size="xs" color="teal" variant="filled" radius="sm">
                {t('timeline.ongoing')}
              </Badge>
            )}
            {isSoon && (
              <Badge size="xs" color="orange" variant="filled" radius="sm">
                {t('timeline.soon')}
              </Badge>
            )}
          </Group>
        )}

        {/* Greek title — always shown prominently */}
        {festival.titleEl && (
          <Title order={3} lh={1.2}>
            {festival.titleEl}
          </Title>
        )}

        {/* Locale title — shown below if different from Greek */}
        {translation?.title && translation.title !== festival.titleEl && (
          <Text size="sm" c="dimmed" fw={500}>
            {translation.title}
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

        {/* Edition dates — full contrast so they stand out from description */}
        {edition && (
          <Text size="sm" fw={500} mt="xs">
            {edition.isDateTba
              ? 'Dates TBA'
              : edition.startDate
                ? formatDateRange(edition.startDate, edition.endDate)
                : null}
            {edition.status !== 'PUBLISHED' && (
              <Badge
                ml={6}
                variant="dot"
                color={EDITION_STATUS_COLORS[edition.status]}
                size="xs"
              >
                {edition.status}
              </Badge>
            )}
          </Text>
        )}

        {/* Description */}
        {translation?.description && (
          <Text size="sm" c="dimmed" lineClamp={3} mt="auto" pt="xs">
            {translation.description}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
