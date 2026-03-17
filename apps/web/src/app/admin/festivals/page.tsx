import type { Metadata } from 'next';
import { PageContainer, SectionTitle, EmptyState } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Manage Festivals',
};

export default function AdminFestivalsPage() {
  return (
    <PageContainer>
      <SectionTitle title="Festivals" description="Manage festival entries" />
      <EmptyState description="No festivals yet" />
    </PageContainer>
  );
}
