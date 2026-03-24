import type { Metadata } from 'next';
import { PageContainer } from '@/shared/ui';
import { FestivalEditView } from './_FestivalEditView';

export const metadata: Metadata = {
  title: 'Edit Festival',
};

interface IEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminFestivalEditPage({ params }: IEditPageProps) {
  const { id } = await params;
  return (
    <PageContainer size="sm">
      <FestivalEditView id={Number(id)} />
    </PageContainer>
  );
}
