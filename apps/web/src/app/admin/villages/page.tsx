import type { Metadata } from 'next';
import { PageContainer, SectionTitle, EmptyState } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Manage Villages',
};

export default function AdminVillagesPage() {
  return (
    <PageContainer>
      <SectionTitle title="Villages" description="Manage village entries" />
      <EmptyState description="No villages yet" />
    </PageContainer>
  );
}
