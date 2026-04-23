'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Image, SimpleGrid, Text } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { Link } from '@/i18n/navigation';
import { EmptyState, LoadingState, LeafletMap } from '@/shared/ui';
import type { IMapMarker } from '@/shared/ui';
import { usePublicVillage, getTranslation } from '@/entities/village';
import { FestivalCard } from '@/entities/festival';
import { usePublicMapPoints, locationPointTypeToMarkerKind } from '@/entities/location-point';

interface IVillageDetailViewProps {
  slug: string;
}

export function VillageDetailView({ slug }: IVillageDetailViewProps) {
  const locale = useLocale();
  const t = useTranslations('villages');
  const tFestivals = useTranslations('festivals');
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

  const displayName = translation?.name ?? village.slug;

  return (
    <div>
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/villages"
          className="cv-mono"
          style={{ color: 'var(--cv-ink-3)', textDecoration: 'none' }}
        >
          {t('title')}
        </Link>
        <span className="cv-mono" style={{ color: 'var(--cv-ink-4)', margin: '0 8px' }}>
          ›
        </span>
        <span className="cv-mono" style={{ color: 'var(--cv-ink-2)' }}>
          {displayName}
        </span>
      </div>

      {/* ── Hero block ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          paddingBottom: 28,
          borderBottom: '1px solid var(--cv-line)',
          marginBottom: 40,
        }}
      >
        {/* Title + native name */}
        <div>
          <h1
            style={{
              display: 'inline',
              fontFamily: 'var(--cv-font-display)',
              fontSize: 'clamp(2rem, 5vw, var(--cv-text-3xl))',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: 'var(--cv-ink)',
            }}
          >
            {displayName}
          </h1>
          {village.nameEl && locale !== 'el' && (
            <span
              style={{
                marginLeft: 12,
                fontFamily: 'var(--cv-font-display)',
                fontStyle: 'italic',
                color: 'var(--cv-ink-3)',
                fontSize: 'var(--cv-text-xl)',
                fontWeight: 400,
              }}
            >
              {village.nameEl}
            </span>
          )}
        </div>

        {/* Region chip */}
        {(village.district ?? village.region) && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              className="cv-chip cv-chip--region"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <IconMapPin size={11} />
              {[village.district, village.region].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {/* Description as lede */}
        {translation?.description && (
          <p
            style={{
              margin: 0,
              color: 'var(--cv-ink-2)',
              fontSize: 'var(--cv-text-md)',
              lineHeight: 1.65,
              maxWidth: '62ch',
            }}
          >
            {translation.description}
          </p>
        )}
      </div>

      {/* ── Hero image ────────────────────────────────────────────────────── */}
      <Image
        src={village.media?.[0]?.url ?? '/images/placeholder.svg'}
        alt={village.media?.[0]?.alt ?? displayName}
        radius="lg"
        mah={400}
        fit="cover"
        style={{ marginBottom: 56 }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/images/placeholder.svg';
        }}
      />

      {/* ── Festivals ─────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 56 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingBottom: 12,
            borderBottom: '1px solid var(--cv-line)',
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--cv-font-display)',
              fontSize: 'var(--cv-text-lg)',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--cv-ink)',
              margin: 0,
            }}
          >
            {tFestivals('title')}
          </h2>
        </div>

        {village.festivals && village.festivals.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={20}>
            {village.festivals.map((festival) => (
              <FestivalCard key={festival.id} festival={festival} />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState description={tFestivals('emptyInVillage')} />
        )}
      </section>

      {/* ── Map ───────────────────────────────────────────────────────────── */}
      {markers.length > 0 && (
        <section>
          <div
            style={{
              paddingBottom: 12,
              borderBottom: '1px solid var(--cv-line)',
              marginBottom: 20,
            }}
          >
            <span
              className="cv-mono"
              style={{ color: 'var(--cv-ink-3)' }}
            >
              Location
            </span>
          </div>
          <div
            style={{
              border: '1px solid var(--cv-line)',
              borderRadius: 'var(--cv-radius-lg)',
              overflow: 'hidden',
            }}
          >
            <LeafletMap
              markers={markers}
              center={[markers[0].lat, markers[0].lng]}
              zoom={14}
              height={300}
            />
          </div>
        </section>
      )}
    </div>
  );
}
