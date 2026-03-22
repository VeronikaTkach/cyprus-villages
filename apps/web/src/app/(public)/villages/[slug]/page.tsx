import type { Metadata } from 'next';
import { PageContainer } from '@/shared/ui';
import { VillageDetailView } from './_VillageDetailView';

interface IVillagePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: IVillagePageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
  };
}

export default async function VillagePage({ params }: IVillagePageProps) {
  const { slug } = await params;
  return (
    <PageContainer>
      <VillageDetailView slug={slug} />
    </PageContainer>
  );
}
