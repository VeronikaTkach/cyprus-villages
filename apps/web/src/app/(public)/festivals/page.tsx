import type { Metadata } from 'next';
import { PageContainer, SectionTitle, EmptyState } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Festivals',
};

export default function FestivalsPage() {
  return (
    <PageContainer>
      <SectionTitle
        title="Festivals"
        description="Traditional festivals across Cypriot villages"
      />
      <EmptyState description="Festival listings coming soon" />
    </PageContainer>
  );
}
