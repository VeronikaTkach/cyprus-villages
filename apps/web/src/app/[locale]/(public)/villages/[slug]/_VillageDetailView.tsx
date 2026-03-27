'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Divider, Group, Stack, Text, Title } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { LoadingState, LeafletMap } from '@/shared/ui';
import type { IMapMarker } from '@/shared/ui';
import { usePublicVillage, getTranslation } from '@/entities/village';
import { usePublicMapPoints, locationPointTypeToMarkerKind } from '@/entities/location-point';

interface IVillageDetailViewProps {
  slug: string;
}

export function VillageDetailView({ slug }: IVillageDetailViewProps) {
  const locale = useLocale();
  const t = useTranslations('villages');
  const { data: village, isLoading, isError } = usePublicVillage(slug);
  const { data: allMapPoints } = usePublicMapPoints();

  if (isLoading) return <LoadingState />;
  if (isError || !village) return <Text c="red">{t('notFound')}</Text>;

  const translation = getTranslation(village, locale);

  const markers: IMapMarker[] = [];

  if (village.centerLat !== null && village.centerLng !== null) {
    markers.push({
      lat: village.centerLat,
      lng: village.centerLng,
      kind: 'village',
      popup: village.nameEl ?? translation?.name ?? village.slug,
    });
  }

  for (const point of (allMapPoints ?? []).filter((p) => p.villageId === village.id)) {
    markers.push({
      lat: point.lat,
      lng: point.lng,
      kind: locationPointTypeToMarkerKind(point.type),
      popup: point.label,
    });
  }

  return (
    <Stack gap="lg">
      <div>
        <Group gap="sm" align="baseline" mb={4}>
          <Title order={1}>{translation?.name ?? village.slug}</Title>
          {village.nameEl && locale !== 'el' && (
            <Text size="xl" c="dimmed">
              {village.nameEl}
            </Text>
          )}
        </Group>
      </div>

      {(village.district ?? village.region) && (
        <Group gap="xs">
          <IconMapPin size={16} color="var(--mantine-color-teal-6)" />
          <Text c="dimmed">
            {[village.district, village.region].filter(Boolean).join(', ')}
          </Text>
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
            center={[markers[0].lat, markers[0].lng]}
            zoom={14}
            height={280}
          />
        </>
      )}
    </Stack>
  );
}
