import type { Metadata } from 'next';
import { PageContainer, SectionTitle } from '@/shared/ui';
import { AdminVillagesListView } from './_AdminVillagesListView';

export const metadata: Metadata = {
  title: 'Manage Villages',
};

export default function AdminVillagesPage() {
  return (
    <PageContainer>
      <SectionTitle title="Villages" description="Manage village entries" />
      <AdminVillagesListView />
    </PageContainer>
  );
}
