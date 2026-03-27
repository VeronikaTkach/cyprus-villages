'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Badge, Divider, Group, Stack, Text, Title } from '@mantine/core';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import { LoadingState, LeafletMap } from '@/shared/ui';
import type { IMapMarker } from '@/shared/ui';
import {
  usePublicFestival,
  getFestivalTranslation,
  getLatestEdition,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  EDITION_STATUS_LABELS,
  EDITION_STATUS_COLORS,
  formatDateRange,
} from '@/entities/festival';
import { usePublicMapPoints, locationPointTypeToMarkerKind } from '@/entities/location-point';

interface IFestivalDetailViewProps {
  slug: string;
}

export function FestivalDetailView({ slug }: IFestivalDetailViewProps) {
  const locale = useLocale();
  const t = useTranslations('festivals');
  const { data: festival, isLoading, isError } = usePublicFestival(slug);
  const { data: allMapPoints } = usePublicMapPoints();

  if (isLoading) return <LoadingState />;
  if (isError || !festival) return <Text c="red">{t('notFound')}</Text>;

  const translation = getFestivalTranslation(festival, locale);
  const latestEdition = getLatestEdition(festival);

  // Build venue + parking markers from the latest edition (denormalised fields)
  const markers: IMapMarker[] = [];
  if (latestEdition) {
    if (latestEdition.venueLat !== null && latestEdition.venueLng !== null) {
      markers.push({
        lat: latestEdition.venueLat,
        lng: latestEdition.venueLng,
        kind: 'venue',
        popup: latestEdition.venueName ?? 'Venue',
      });
    }
    if (latestEdition.parkingLat !== null && latestEdition.parkingLng !== null) {
      markers.push({
        lat: latestEdition.parkingLat,
        lng: latestEdition.parkingLng,
        kind: 'parking',
        popup: latestEdition.parkingName ?? 'Parking',
      });
    }

    // Add LocationPoint markers for this edition
    for (const point of (allMapPoints ?? []).filter(
      (p) => p.festivalEditionId === latestEdition.id,
    )) {
      markers.push({
        lat: point.lat,
        lng: point.lng,
        kind: locationPointTypeToMarkerKind(point.type),
        popup: point.label,
      });
    }
  }

  // Center on venue if available, otherwise parking, otherwise Cyprus default
  const mapCenter: [number, number] | undefined =
    markers.length > 0 ? [markers[0].lat, markers[0].lng] : undefined;

  return (
    <Stack gap="lg">
      <div>
        {festival.titleEl && (
          <Title order={1} mb={4}>
            {festival.titleEl}
          </Title>
        )}
        {translation?.title && translation.title !== festival.titleEl && (
          <Text size="xl" c="dimmed">
            {translation.title}
          </Text>
        )}
      </div>

      <Group gap="sm">
        {festival.category && (
          <Badge color={CATEGORY_COLORS[festival.category]} variant="light">
            {CATEGORY_LABELS[festival.category]}
          </Badge>
        )}
        {latestEdition && (
          <Badge
            color={EDITION_STATUS_COLORS[latestEdition.status]}
            variant="outline"
            size="sm"
          >
            {EDITION_STATUS_LABELS[latestEdition.status]}
          </Badge>
        )}
      </Group>

      {latestEdition && (
        <Group gap="xs">
          <IconCalendar size={16} color="var(--mantine-color-teal-6)" />
          <Text c="dimmed">
            {latestEdition.isDateTba
              ? 'Dates TBA'
              : formatDateRange(latestEdition.startDate, latestEdition.endDate)}
          </Text>
        </Group>
      )}

      {latestEdition?.venueName && (
        <Group gap="xs">
          <IconMapPin size={16} color="var(--mantine-color-blue-6)" />
          <Text c="dimmed">{latestEdition.venueName}</Text>
        </Group>
      )}

      {latestEdition?.parkingName && (
        <Group gap="xs">
          <IconMapPin size={16} color="var(--mantine-color-orange-6)" />
          <Text c="dimmed">{latestEdition.parkingName}</Text>
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

      {markers.length > 0 && (
        <>
          <Divider />
          <LeafletMap
            markers={markers}
            center={mapCenter}
            zoom={15}
            height={280}
          />
        </>
      )}
    </Stack>
  );
}
