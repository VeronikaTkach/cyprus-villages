'use client';

import { useTranslations } from 'next-intl';
import { Text } from '@mantine/core';
import { LeafletMap, LoadingState } from '@/shared/ui';
import type { IMapMarker } from '@/shared/ui';
import { usePublicVillages, getTranslation } from '@/entities/village';
import { useFestivalMapMarkers } from '@/entities/festival';
import { usePublicMapPoints, buildLocationPointMarkers } from '@/entities/location-point';

// Cyprus geographic center
const CYPRUS_CENTER: [number, number] = [35.0, 33.2];

export function MapView() {
  const t = useTranslations('map');
  const { data: villages, isLoading: villagesLoading, isError: villagesError } = usePublicVillages();
  const { data: festivalMarkers, isLoading: festivalsLoading } = useFestivalMapMarkers();
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

  // Festival venue markers from dedicated map endpoint (representative edition, no fallback)
  for (const marker of festivalMarkers ?? []) {
    markers.push({
      lat: marker.lat,
      lng: marker.lng,
      kind: 'venue',
      popup: marker.titleEl,
    });
  }

  markers.push(...buildLocationPointMarkers(locationPoints ?? []));

  return (
    <div
      style={{
        border: '1px solid var(--cv-line)',
        borderRadius: 'var(--cv-radius-lg)',
        overflow: 'hidden',
      }}
    >
      <LeafletMap
        markers={markers}
        center={CYPRUS_CENTER}
        zoom={9}
        height="clamp(400px, 65vh, 700px)"
      />
    </div>
  );
}
