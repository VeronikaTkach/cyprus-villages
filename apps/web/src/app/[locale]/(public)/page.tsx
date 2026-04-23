import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/shared/ui';
import { HomeView } from './_HomeView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home');
  return { title: t('title') };
}

export default async function HomePage() {
  return (
    <PageContainer>
      <HomeView />
    </PageContainer>
  );
}
