import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageContainer, SectionTitle, EmptyState } from '@/shared/ui';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('festivals');
  return { title: t('title') };
}

export default async function FestivalsPage() {
  const t = await getTranslations('festivals');

  return (
    <PageContainer>
      <SectionTitle title={t('title')} description={t('description')} />
      <EmptyState description="Festival calendar coming soon" />
    </PageContainer>
  );
}
