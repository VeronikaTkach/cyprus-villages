import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageContainer, LoadingState } from '@/shared/ui';
import { FestivalsListView } from './_FestivalsListView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('festivals');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function FestivalsPage() {
  const t = await getTranslations('festivals');

  return (
    <PageContainer>
      <div style={{ marginBottom: 40 }}>
        <span
          className="cv-mono"
          style={{ display: 'block', marginBottom: 12, color: 'var(--cv-ink-3)' }}
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

      <Suspense fallback={<LoadingState />}>
        <FestivalsListView />
      </Suspense>
    </PageContainer>
  );
}
