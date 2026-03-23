import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageContainer, SectionTitle } from '@/shared/ui';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home');
  return { title: t('title') };
}

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <PageContainer>
      <SectionTitle title={t('title')} description={t('description')} />
    </PageContainer>
  );
}
