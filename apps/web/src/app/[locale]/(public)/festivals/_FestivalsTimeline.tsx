'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Badge, Divider, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { Link } from '@/i18n/navigation';
import { FestivalCard, getLatestEdition } from '@/entities/festival';
import type { IFestival, IFestivalEditionBrief } from '@/entities/festival';

// ── Date helpers ─────────────────────────────────────────────────────────────

/** Returns the 1-based month of an edition's startDate, or null when unavailable. */
function getEditionMonth(edition: IFestivalEditionBrief | null): number | null {
  if (!edition || edition.isDateTba || !edition.startDate) return null;
  return new Date(edition.startDate).getMonth() + 1;
}

/**
 * Returns true when a PUBLISHED edition starts within the next 30 days
 * but has not yet started.
 */
function isSoon(edition: IFestivalEditionBrief | null): boolean {
  if (!edition || !edition.startDate || edition.status !== 'PUBLISHED') return false;
  const startMs = new Date(edition.startDate).getTime();
  const nowMs = Date.now();
  const diffDays = (startMs - nowMs) / 86_400_000;
  return diffDays > 0 && diffDays <= 30;
}

/**
 * Returns true when today falls within a PUBLISHED edition's date range.
 * If endDate is absent, the edition is treated as a single-day event.
 */
function isOngoing(edition: IFestivalEditionBrief | null): boolean {
  if (!edition || !edition.startDate || edition.status !== 'PUBLISHED') return false;
  const nowMs = Date.now();
  const startMs = new Date(edition.startDate).getTime();
  // Include the full end day by adding 24 h minus 1 ms
  const endMs = new Date(edition.endDate ?? edition.startDate).getTime() + 86_400_000 - 1;
  return nowMs >= startMs && nowMs <= endMs;
}

// ── Grouping ──────────────────────────────────────────────────────────────────

interface IMonthGroup {
  /** 1–12, or null for the TBA bucket */
  month: number | null;
  festivals: IFestival[];
}

function groupByMonth(festivals: IFestival[]): IMonthGroup[] {
  const monthMap = new Map<number, IFestival[]>();
  const tba: IFestival[] = [];

  for (const festival of festivals) {
    const month = getEditionMonth(getLatestEdition(festival));
    if (month === null) {
      tba.push(festival);
    } else {
      const bucket = monthMap.get(month) ?? [];
      bucket.push(festival);
      monthMap.set(month, bucket);
    }
  }

  const groups: IMonthGroup[] = Array.from(monthMap.keys())
    .sort((a, b) => a - b)
    .map((month) => ({ month, festivals: monthMap.get(month)! }));

  if (tba.length) {
    groups.push({ month: null, festivals: tba });
  }

  return groups;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface IFestivalsTimelineProps {
  festivals: IFestival[];
  /** When set, the year is appended to every month heading (e.g. "April 2024"). */
  activeYear?: number;
}

export function FestivalsTimeline({ festivals, activeYear }: IFestivalsTimelineProps) {
  const t = useTranslations('festivals');
  const locale = useLocale();

  const groups = groupByMonth(festivals);

  if (!groups.length) return null;

  return (
    <Stack gap="xl">
      {groups.map(({ month, festivals: groupFestivals }) => {
        const monthLabel =
          month === null
            ? t('timeline.tba')
            : new Intl.DateTimeFormat(locale, { month: 'long' }).format(
                new Date(2024, month - 1, 1),
              );

        const heading =
          month === null || !activeYear ? monthLabel : `${monthLabel} ${activeYear}`;

        return (
          <Stack key={month ?? 'tba'} gap="md">
            <Divider
              label={
                <Text fw={600} size="sm" tt="uppercase" c="dimmed" px={4}>
                  {heading}
                </Text>
              }
              labelPosition="center"
            />

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {groupFestivals.map((festival) => {
                const edition = getLatestEdition(festival);
                const ongoing = isOngoing(edition);
                const soon = !ongoing && isSoon(edition);

                return (
                  <Stack key={festival.id} gap={4}>
                    {(ongoing || soon) && (
                      <Group gap="xs">
                        {ongoing && (
                          <Badge size="xs" color="teal" variant="filled" radius="sm">
                            {t('timeline.ongoing')}
                          </Badge>
                        )}
                        {soon && (
                          <Badge size="xs" color="orange" variant="filled" radius="sm">
                            {t('timeline.soon')}
                          </Badge>
                        )}
                      </Group>
                    )}
                    <Link
                      href={`/festivals/${festival.slug}`}
                      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                    >
                      <FestivalCard festival={festival} />
                    </Link>
                  </Stack>
                );
              })}
            </SimpleGrid>
          </Stack>
        );
      })}
    </Stack>
  );
}
