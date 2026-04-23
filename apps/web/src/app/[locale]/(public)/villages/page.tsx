import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/shared/ui';
import { VillagesListView } from './_VillagesListView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('villages');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function VillagesPage() {
  const t = await getTranslations('villages');

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

      <VillagesListView />
    </PageContainer>
  );
}
