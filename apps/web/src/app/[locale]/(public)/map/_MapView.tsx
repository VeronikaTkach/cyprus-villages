'use client';

import { useTranslations } from 'next-intl';
import { Text } from '@mantine/core';
import { LeafletMap, LoadingState } from '@/shared/ui';
import type { IMapMarker } from '@/shared/ui';
import { usePublicVillages, getTranslation } from '@/entities/village';
import { usePublicFestivals, getFestivalTranslation, getLatestEdition } from '@/entities/festival';
import { usePublicMapPoints, locationPointTypeToMarkerKind } from '@/entities/location-point';

// Cyprus geographic center
const CYPRUS_CENTER: [number, number] = [35.0, 33.2];

export function MapView() {
  const t = useTranslations('map');
  const { data: villages, isLoading: villagesLoading, isError: villagesError } = usePublicVillages();
  const { data: festivals, isLoading: festivalsLoading } = usePublicFestivals();
  const { data: locationPoints } = usePublicMapPoints();

  const isLoading = villagesLoading || festivalsLoading;
  if (isLoading) return <LoadingState />;
  if (villagesError) return <Text c="red">{t('loadError')}</Text>;

  const markers: IMapMarker[] = [];

  // Village center points
  for (const village of villages ?? []) {
    if (village.centerLat !== null && village.centerLng !== null) {
      const en = getTranslation(village, 'en');
      markers.push({
        lat: village.centerLat,
        lng: village.centerLng,
        kind: 'village',
        popup: village.nameEl
          ? `${village.nameEl}${en ? ` — ${en.name}` : ''}`
          : (en?.name ?? village.slug),
      });
    }
  }

  // Festival edition venue points (latest edition only)
  for (const festival of festivals ?? []) {
    const edition = getLatestEdition(festival);
    if (edition?.venueLat !== null && edition?.venueLng !== null && edition) {
      const title =
        festival.titleEl ??
        getFestivalTranslation(festival, 'en')?.title ??
        festival.slug;
      markers.push({
        lat: edition.venueLat!,
        lng: edition.venueLng!,
        kind: 'venue',
        popup: title,
      });
    }
  }

  // LocationPoint markers from public map API
  for (const point of locationPoints ?? []) {
    markers.push({
      lat: point.lat,
      lng: point.lng,
      kind: locationPointTypeToMarkerKind(point.type),
      popup: point.label,
    });
  }

  return (
    <LeafletMap
      markers={markers}
      center={CYPRUS_CENTER}
      zoom={9}
      height="calc(100vh - 180px)"
    />
  );
}
