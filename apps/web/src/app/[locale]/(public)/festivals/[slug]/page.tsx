import type { Metadata } from 'next';
import { PageContainer } from '@/shared/ui';
import { FestivalDetailView } from './_FestivalDetailView';

interface IFestivalPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: IFestivalPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
  };
}

export default async function FestivalPage({ params }: IFestivalPageProps) {
  const { slug } = await params;
  return (
    <PageContainer>
      <FestivalDetailView slug={slug} />
    </PageContainer>
  );
}
