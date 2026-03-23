import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageContainer, SectionTitle, EmptyState } from '@/shared/ui';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('map');
  return { title: t('title') };
}

export default async function MapPage() {
  const t = await getTranslations('map');

  return (
    <PageContainer>
      <SectionTitle title={t('title')} description={t('description')} />
      <EmptyState description="Map coming soon" />
    </PageContainer>
  );
}
