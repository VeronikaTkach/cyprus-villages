'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Badge, Divider, Group, Image, Stack, Text, Title } from '@mantine/core';
import { IconCalendar, IconMapPin, IconParking } from '@tabler/icons-react';
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
    <Stack gap="xl">
      {/* Title block — tight internal spacing, no orphan div */}
      <Stack gap={4}>
        {festival.titleEl && <Title order={1}>{festival.titleEl}</Title>}
        {translation?.title && translation.title !== festival.titleEl && (
          <Text size="xl" c="dimmed">
            {translation.title}
          </Text>
        )}
      </Stack>

      {/* Badges — status badge hidden for published festivals (admin concept, not user-facing) */}
      <Group gap="sm">
        {festival.category && (
          <Badge color={CATEGORY_COLORS[festival.category]} variant="light">
            {CATEGORY_LABELS[festival.category]}
          </Badge>
        )}
        {latestEdition && latestEdition.status !== 'PUBLISHED' && (
          <Badge
            color={EDITION_STATUS_COLORS[latestEdition.status]}
            variant="outline"
            size="sm"
          >
            {EDITION_STATUS_LABELS[latestEdition.status]}
          </Badge>
        )}
      </Group>

      {/* Cover image — above event details so the festival is established visually first */}
      <Image
        src={festival.media?.[0]?.url ?? '/images/placeholder.svg'}
        alt={festival.media?.[0]?.alt ?? (festival.titleEl ?? translation?.title ?? festival.slug)}
        radius="md"
        mah={360}
        fit="cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/images/placeholder.svg';
        }}
      />

      {/* Event details — date, venue, parking grouped as one scannable block */}
      {latestEdition && (
        <Stack gap="xs">
          <Group gap="xs">
            <IconCalendar size={16} color="var(--mantine-color-teal-6)" />
            <Text size="sm" fw={500}>
              {latestEdition.isDateTba
                ? 'Dates TBA'
                : formatDateRange(latestEdition.startDate, latestEdition.endDate)}
            </Text>
          </Group>

          {latestEdition.venueName && (
            <Group gap="xs">
              <IconMapPin size={16} color="var(--mantine-color-blue-6)" />
              <Text size="sm">{latestEdition.venueName}</Text>
            </Group>
          )}

          {latestEdition.parkingName && (
            <Group gap="xs">
              <IconParking size={16} color="var(--mantine-color-orange-6)" />
              <Text size="sm">{latestEdition.parkingName}</Text>
            </Group>
          )}
        </Stack>
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
