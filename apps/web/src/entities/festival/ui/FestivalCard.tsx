'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Badge, Card, Group, Stack, Text, Title } from '@mantine/core';
import { getFestivalTranslation, getLatestEdition } from '../model';
import type { IFestival } from '../model';
import {
  CATEGORY_LABELS,
  EDITION_STATUS_COLORS,
  formatDateRange,
  formatTypicalMonth,
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
    <Card
      padding={20}
      radius="md"
      withBorder
      h="100%"
      className="cv-card"
      style={{ borderColor: 'var(--cv-line)' }}
    >
      <Stack gap={12} h="100%">
        {/* Ongoing / Soon chips — inside card to keep grid rows aligned */}
        {(isOngoing || isSoon) && (
          <Group gap={6}>
            {isOngoing && (
              <span
                className="cv-chip"
                style={{ background: 'var(--cv-primary-soft)', color: 'var(--cv-primary-ink)' }}
              >
                {t('timeline.ongoing')}
              </span>
            )}
            {isSoon && (
              <span
                className="cv-chip"
                style={{ background: 'var(--cv-tag-food-bg)', color: 'var(--cv-tag-food-fg)' }}
              >
                {t('timeline.soon')}
              </span>
            )}
          </Group>
        )}

        {/* Greek title — always shown prominently */}
        {festival.titleEl && (
          <Title order={3} lh={1.2} style={{ letterSpacing: '-0.01em' }}>
            {festival.titleEl}
          </Title>
        )}

        {/* Locale title — shown below if different from Greek */}
        {translation?.title && translation.title !== festival.titleEl && (
          <Text
            size="sm"
            style={{ color: 'var(--cv-ink-3)', fontStyle: 'italic' }}
          >
            {translation.title}
          </Text>
        )}

        {/* Category chip */}
        <span className={`cv-chip cv-chip--${festival.category.toLowerCase()}`}>
          {CATEGORY_LABELS[festival.category]}
        </span>

        {/* Timing — priority: confirmed date > typicalMonth fallback > "Dates TBA" */}
        {edition?.startDate && !edition.isDateTba ? (
          <Group gap={6} align="center">
            <Text size="sm" fw={500} style={{ color: 'var(--cv-ink)' }}>
              {formatDateRange(edition.startDate, edition.endDate)}
            </Text>
            {edition.status !== 'PUBLISHED' && (
              <Badge
                variant="dot"
                color={EDITION_STATUS_COLORS[edition.status]}
                size="xs"
              >
                {edition.status}
              </Badge>
            )}
          </Group>
        ) : festival.typicalMonth ? (
          <Text size="sm" style={{ color: 'var(--cv-ink-2)', fontStyle: 'italic' }}>
            Usually in {formatTypicalMonth(festival.typicalMonth)}
          </Text>
        ) : edition ? (
          <Group gap={6} align="center">
            <Text size="sm" fw={500} style={{ color: 'var(--cv-ink-3)' }}>
              Dates TBA
            </Text>
            {edition.status !== 'PUBLISHED' && (
              <Badge
                variant="dot"
                color={EDITION_STATUS_COLORS[edition.status]}
                size="xs"
              >
                {edition.status}
              </Badge>
            )}
          </Group>
        ) : null}

        {/* Description */}
        {translation?.description && (
          <Text
            size="sm"
            lineClamp={3}
            mt="auto"
            pt="xs"
            style={{ color: 'var(--cv-ink-2)', lineHeight: 1.55 }}
          >
            {translation.description}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
