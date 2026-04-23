import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageContainer, SectionTitle } from '@/shared/ui';
import { MapView } from './_MapView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('map');
  return { title: t('title') };
}

export default async function MapPage() {
  const t = await getTranslations('map');

  return (
    <PageContainer size="1280px">
      <SectionTitle title={t('title')} description={t('description')} />
      <MapView />
    </PageContainer>
  );
}
