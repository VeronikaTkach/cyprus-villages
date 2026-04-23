'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Image, Text } from '@mantine/core';
import { IconCalendar, IconMapPin, IconParking } from '@tabler/icons-react';
import { Link } from '@/i18n/navigation';
import { LoadingState, LeafletMap } from '@/shared/ui';
import type { IMapMarker } from '@/shared/ui';
import {
  usePublicFestival,
  getFestivalTranslation,
  getLatestEdition,
  CATEGORY_LABELS,
  EDITION_STATUS_LABELS,
  EDITION_STATUS_COLORS,
  formatDateRange,
  formatTypicalMonth,
} from '@/entities/festival';
import type { IFestivalEditionBrief } from '@/entities/festival';
import { usePublicMapPoints, locationPointTypeToMarkerKind } from '@/entities/location-point';

interface IFestivalDetailViewProps {
  slug: string;
}

// ── Edition timing helpers (presentation only, no logic change) ────────────

function editionDateLabel(edition: IFestivalEditionBrief): {
  text: string;
  isApprox: boolean;
} {
  if (edition.startDate && !edition.isDateTba) {
    return { text: formatDateRange(edition.startDate, edition.endDate), isApprox: false };
  }
  return { text: 'Date TBA', isApprox: true };
}

// ── Component ─────────────────────────────────────────────────────────────

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

  const displayTitle = festival.titleEl ?? translation?.title ?? festival.slug;

  // Timing for the info strip — priority: confirmed date > typicalMonth > TBA
  const timingConfirmed =
    latestEdition?.startDate && !latestEdition.isDateTba
      ? formatDateRange(latestEdition.startDate, latestEdition.endDate)
      : null;
  const timingApprox = !timingConfirmed && festival.typicalMonth
    ? `Usually in ${formatTypicalMonth(festival.typicalMonth)}`
    : null;
  const timingTba = !timingConfirmed && !timingApprox;

  return (
    <div>
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/festivals"
          className="cv-mono"
          style={{ color: 'var(--cv-ink-3)', textDecoration: 'none' }}
        >
          {t('title')}
        </Link>
        <span className="cv-mono" style={{ color: 'var(--cv-ink-4)', margin: '0 8px' }}>
          ›
        </span>
        <span className="cv-mono" style={{ color: 'var(--cv-ink-2)' }}>
          {displayTitle}
        </span>
      </div>

      {/* ── Hero block ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          paddingBottom: 28,
          borderBottom: '1px solid var(--cv-line)',
          marginBottom: 32,
        }}
      >
        {/* Category chip */}
        <div>
          <span className={`cv-chip cv-chip--${festival.category.toLowerCase()}`}>
            {CATEGORY_LABELS[festival.category]}
          </span>
        </div>

        {/* Greek title — primary identity */}
        {festival.titleEl && (
          <h1
            style={{
              fontFamily: 'var(--cv-font-display)',
              fontSize: 'clamp(1.8rem, 5vw, var(--cv-text-3xl))',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: 'var(--cv-ink)',
              margin: 0,
            }}
          >
            {festival.titleEl}
          </h1>
        )}

        {/* Locale title — softer, italic, only when different */}
        {translation?.title && translation.title !== festival.titleEl && (
          <div
            style={{
              fontFamily: 'var(--cv-font-display)',
              fontStyle: 'italic',
              color: 'var(--cv-ink-3)',
              fontSize: 'var(--cv-text-xl)',
              fontWeight: 400,
            }}
          >
            {translation.title}
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

      {/* ── Info strip ──────────────────────────────────────────────────── */}
      {(latestEdition || festival.typicalMonth) && (
        <div className="cv-infostrip" style={{ marginBottom: 40 }}>
          {/* Timing cell */}
          <div className="cv-infostrip__item">
            <span className="cv-infostrip__k">
              <IconCalendar size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              {timingConfirmed ? 'Next edition' : 'Timing'}
            </span>
            {timingConfirmed && (
              <span className="cv-infostrip__v">{timingConfirmed}</span>
            )}
            {timingApprox && (
              <span className="cv-infostrip__v cv-infostrip__v--approx">{timingApprox}</span>
            )}
            {timingTba && (
              <span className="cv-infostrip__v cv-infostrip__v--approx">Dates TBA</span>
            )}
          </div>

          {/* Venue cell */}
          {latestEdition?.venueName && (
            <div className="cv-infostrip__item">
              <span className="cv-infostrip__k">
                <IconMapPin size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Venue
              </span>
              <span className="cv-infostrip__v">{latestEdition.venueName}</span>
            </div>
          )}

          {/* Parking cell */}
          {latestEdition?.parkingName && (
            <div className="cv-infostrip__item">
              <span className="cv-infostrip__k">
                <IconParking size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Parking
              </span>
              <span className="cv-infostrip__v">{latestEdition.parkingName}</span>
            </div>
          )}

          {/* Status cell — only for non-published */}
          {latestEdition && latestEdition.status !== 'PUBLISHED' && (
            <div className="cv-infostrip__item">
              <span className="cv-infostrip__k">Status</span>
              <span
                className="cv-infostrip__v"
                style={{ color: `var(--mantine-color-${EDITION_STATUS_COLORS[latestEdition.status]}-6)` }}
              >
                {EDITION_STATUS_LABELS[latestEdition.status]}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Cover image ─────────────────────────────────────────────────── */}
      <Image
        src={festival.media?.[0]?.url ?? '/images/placeholder.svg'}
        alt={festival.media?.[0]?.alt ?? displayTitle}
        radius="lg"
        mah={400}
        fit="cover"
        style={{ marginBottom: 56 }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/images/placeholder.svg';
        }}
      />

      {/* ── Editions timeline ────────────────────────────────────────────── */}
      {festival.editions.length > 0 && (
        <section style={{ marginBottom: 56 }}>
          <div
            style={{
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
              Editions
            </h2>
          </div>

          <div className="cv-editions">
            {festival.editions.map((edition, i) => {
              const isCurrent = i === 0;
              const { text, isApprox } = editionDateLabel(edition);

              return (
                <div
                  key={edition.id}
                  className={`cv-edition${isCurrent ? ' cv-edition--current' : ''}`}
                >
                  <div className="cv-edition__year">
                    {edition.year}
                    {isCurrent && (
                      <span
                        className="cv-mono"
                        style={{ color: 'var(--cv-primary-ink)', fontSize: 10 }}
                      >
                        Latest
                      </span>
                    )}
                    {edition.status !== 'PUBLISHED' && (
                      <span
                        className="cv-mono"
                        style={{
                          color: `var(--mantine-color-${EDITION_STATUS_COLORS[edition.status]}-6)`,
                          fontSize: 10,
                        }}
                      >
                        {EDITION_STATUS_LABELS[edition.status]}
                      </span>
                    )}
                  </div>
                  <div className={`cv-edition__when${isApprox ? ' cv-edition__when--approx' : ''}`}>
                    {text}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      {markers.length > 0 && (
        <section>
          <div
            style={{
              paddingBottom: 12,
              borderBottom: '1px solid var(--cv-line)',
              marginBottom: 20,
            }}
          >
            <span className="cv-mono" style={{ color: 'var(--cv-ink-3)' }}>
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
              center={mapCenter}
              zoom={15}
              height={300}
            />
          </div>
        </section>
      )}
    </div>
  );
}
