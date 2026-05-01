'use client';

import { Divider, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link } from '@/i18n/navigation';
import { LeafletMap, LoadingState } from '@/shared/ui';
import type { IMapMarker } from '@/shared/ui';
import { FestivalCard } from '@/entities/festival';
import type { IFestival } from '@/entities/festival';
import { VillageCard } from '@/entities/village';
import type { IVillage } from '@/entities/village';

// ─── Types ────────────────────────────────────────────────────────────────────

interface IHomeStrings {
  eyebrow: string;
  title: string;
  description: string;
  browseFestivals: string;
  exploreMap: string;
  byMonthSection: string;
  festivalsSection: string;
  villagesSection: string;
  mapSection: string;
  festivalEmpty: string;
  villageEmpty: string;
}

interface IHomeContentProps {
  strings: IHomeStrings;
  locale: string;
  festivals: IFestival[] | undefined;
  villages: IVillage[] | undefined;
  festivalsLoading: boolean;
  villagesLoading: boolean;
  months: { value: number; label: string }[];
  monthsWithData: Set<number>;
  villageMarkers: IMapMarker[];
  mapCenter: [number, number];
}

// ─── Private presentational helpers ──────────────────────────────────────────

function SectionHeader({
  label,
  linkHref,
  linkLabel,
}: {
  label: string;
  linkHref: string;
  linkLabel: string;
}) {
  return (
    <Divider
      label={
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text
            fw={600}
            size="xs"
            tt="uppercase"
            style={{
              fontFamily: 'var(--cv-font-mono)',
              letterSpacing: '0.1em',
              color: 'var(--cv-ink-2)',
            }}
          >
            {label}
          </Text>
          <Link
            href={linkHref}
            style={{
              fontFamily: 'var(--cv-font-mono)',
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--cv-primary)',
              textDecoration: 'none',
            }}
          >
            {linkLabel} →
          </Link>
        </div>
      }
      labelPosition="left"
    />
  );
}

// ─── Main presentational component ────────────────────────────────────────────

export function HomeContent({
  strings: s,
  locale,
  festivals,
  villages,
  festivalsLoading,
  villagesLoading,
  months,
  monthsWithData,
  villageMarkers,
  mapCenter,
}: IHomeContentProps) {
  const previewFestivals = festivals?.slice(0, 3) ?? [];
  const previewVillages = villages?.slice(0, 3) ?? [];

  return (
    <Stack gap={72}>

      {/* ── 1. Intro ──────────────────────────────────────────────────────── */}
      <Stack gap={24} style={{ paddingTop: 48, paddingBottom: 8 }}>
        <span className="cv-mono" style={{ color: 'var(--cv-ink-3)', display: 'block' }}>
          {s.eyebrow}
        </span>

        <Title
          order={1}
          style={{
            fontFamily: 'var(--cv-font-display)',
            fontSize: 'clamp(2rem, 5vw, var(--cv-text-3xl))',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: 'var(--cv-ink)',
            maxWidth: 640,
          }}
        >
          {s.title}
        </Title>

        <Text size="md" style={{ color: 'var(--cv-ink-2)', lineHeight: 1.65, maxWidth: 520 }}>
          {s.description}
        </Text>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            href="/festivals"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '10px 20px',
              borderRadius: 'var(--cv-radius-md)',
              background: 'var(--cv-primary)',
              color: '#fff',
              fontFamily: 'var(--cv-font-ui)',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            {s.browseFestivals}
          </Link>
          <Link
            href="/map"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '10px 20px',
              borderRadius: 'var(--cv-radius-md)',
              background: 'transparent',
              color: 'var(--cv-ink-2)',
              fontFamily: 'var(--cv-font-ui)',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              border: '1px solid var(--cv-line-strong)',
            }}
          >
            {s.exploreMap}
          </Link>
        </div>
      </Stack>

      {/* ── 2. Explore by month ───────────────────────────────────────────── */}
      <Stack gap="lg">
        <SectionHeader
          label={s.byMonthSection}
          linkHref="/festivals"
          linkLabel={s.browseFestivals}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
            gap: 8,
          }}
        >
          {months.map(({ value, label }) => {
            const hasData = monthsWithData.has(value);
            return (
              <Link
                key={value}
                href={`/festivals?month=${value}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 6px',
                  borderRadius: 'var(--cv-radius-md)',
                  border: `1px solid ${hasData ? 'var(--cv-line-strong)' : 'var(--cv-line)'}`,
                  background: hasData ? 'var(--cv-surface)' : 'transparent',
                  textDecoration: 'none',
                  opacity: hasData ? 1 : 0.38,
                  transition:
                    'border-color var(--cv-dur) var(--cv-ease), background var(--cv-dur) var(--cv-ease)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--cv-font-mono)',
                    fontSize: 10.5,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: hasData ? 'var(--cv-ink-2)' : 'var(--cv-ink-4)',
                    fontWeight: hasData ? 500 : 400,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: hasData ? 'var(--cv-primary)' : 'transparent',
                    flexShrink: 0,
                  }}
                />
              </Link>
            );
          })}
        </div>
      </Stack>

      {/* ── 3. Upcoming festivals ─────────────────────────────────────────── */}
      <Stack gap="lg">
        <SectionHeader
          label={s.festivalsSection}
          linkHref="/festivals"
          linkLabel={s.browseFestivals}
        />

        {festivalsLoading && <LoadingState />}

        {!festivalsLoading && previewFestivals.length > 0 && (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={20}>
            {previewFestivals.map((festival) => (
              <Link
                key={festival.id}
                href={`/festivals/${festival.slug}`}
                style={{ textDecoration: 'none', display: 'block', height: '100%' }}
              >
                <FestivalCard festival={festival} />
              </Link>
            ))}
          </SimpleGrid>
        )}

        {!festivalsLoading && previewFestivals.length === 0 && (
          <Text size="sm" style={{ color: 'var(--cv-ink-3)' }}>
            {s.festivalEmpty}
          </Text>
        )}
      </Stack>

      {/* ── 4. Villages to discover ───────────────────────────────────────── */}
      <Stack gap="lg">
        <SectionHeader
          label={s.villagesSection}
          linkHref="/villages"
          linkLabel={s.browseFestivals}
        />

        {villagesLoading && <LoadingState />}

        {!villagesLoading && previewVillages.length > 0 && (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={20}>
            {previewVillages.map((village) => (
              <Link
                key={village.id}
                href={`/villages/${village.slug}`}
                style={{ textDecoration: 'none', display: 'block', height: '100%' }}
              >
                <VillageCard village={village} locale={locale} />
              </Link>
            ))}
          </SimpleGrid>
        )}

        {!villagesLoading && previewVillages.length === 0 && (
          <Text size="sm" style={{ color: 'var(--cv-ink-3)' }}>
            {s.villageEmpty}
          </Text>
        )}
      </Stack>

      {/* ── 5. Map preview ────────────────────────────────────────────────── */}
      {!villagesLoading && villageMarkers.length > 0 && (
        <Stack gap="lg">
          <SectionHeader label={s.mapSection} linkHref="/map" linkLabel={s.exploreMap} />

          <div style={{ position: 'relative' }}>
            <div
              style={{
                border: '1px solid var(--cv-line)',
                borderRadius: 'var(--cv-radius-lg)',
                overflow: 'hidden',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              <LeafletMap markers={villageMarkers} center={mapCenter} zoom={9} height={260} />
            </div>

            <Link
              href="/map"
              aria-label={s.exploreMap}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                padding: 16,
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 'var(--cv-radius-md)',
                  background: 'var(--cv-surface)',
                  border: '1px solid var(--cv-line-strong)',
                  fontFamily: 'var(--cv-font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--cv-ink-2)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                {s.exploreMap} →
              </span>
            </Link>
          </div>
        </Stack>
      )}
    </Stack>
  );
}
