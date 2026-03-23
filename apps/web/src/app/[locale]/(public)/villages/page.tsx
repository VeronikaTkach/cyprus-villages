import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageContainer, SectionTitle } from '@/shared/ui';
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
      <SectionTitle title={t('title')} description={t('description')} />
      <VillagesListView />
    </PageContainer>
  );
}
