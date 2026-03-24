import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageContainer, SectionTitle } from '@/shared/ui';
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
      <SectionTitle title={t('title')} description={t('description')} />
      <FestivalsListView />
    </PageContainer>
  );
}
