import type { Metadata } from 'next';
import { PageContainer, SectionTitle } from '@/shared/ui';
import { FestivalEditionCreateView } from './_FestivalEditionCreateView';

export const metadata: Metadata = {
  title: 'New Festival Edition',
};

interface IPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminFestivalEditionNewPage({ params }: IPageProps) {
  const { id } = await params;
  return (
    <PageContainer size="sm">
      <SectionTitle title="New Edition" description="Add a yearly edition to this festival" />
      <FestivalEditionCreateView festivalId={Number(id)} />
    </PageContainer>
  );
}
