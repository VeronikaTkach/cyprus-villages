import type { Metadata } from 'next';
import { PageContainer } from '@/shared/ui';
import { VillageEditView } from './_VillageEditView';

export const metadata: Metadata = {
  title: 'Edit Village',
};

interface IEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminVillageEditPage({ params }: IEditPageProps) {
  const { id } = await params;
  return (
    <PageContainer size="sm">
      <VillageEditView id={Number(id)} />
    </PageContainer>
  );
}
