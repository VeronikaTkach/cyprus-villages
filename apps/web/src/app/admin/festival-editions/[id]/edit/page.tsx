import type { Metadata } from 'next';
import { PageContainer } from '@/shared/ui';
import { FestivalEditionEditView } from './_FestivalEditionEditView';

export const metadata: Metadata = {
  title: 'Edit Festival Edition',
};

interface IEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminFestivalEditionEditPage({ params }: IEditPageProps) {
  const { id } = await params;
  return (
    <PageContainer size="sm">
      <FestivalEditionEditView id={Number(id)} />
    </PageContainer>
  );
}
