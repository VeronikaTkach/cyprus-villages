import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/shared/ui';
import { MapView } from './_MapView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('map');
  return { title: t('title') };
}

export default async function MapPage() {
  const t = await getTranslations('map');

  return (
    <PageContainer size="1280px">
      <div style={{ marginBottom: 24 }}>
        <span
          className="cv-mono"
          style={{ display: 'block', marginBottom: 10, color: 'var(--cv-ink-3)' }}
        >
          {t('description')}
        </span>
        <h1
          style={{
            fontFamily: 'var(--cv-font-display)',
            fontSize: 'clamp(1.75rem, 4vw, var(--cv-text-2xl))',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            color: 'var(--cv-ink)',
            margin: 0,
          }}
        >
          {t('title')}
        </h1>
      </div>

      <MapView />
    </PageContainer>
  );
}
