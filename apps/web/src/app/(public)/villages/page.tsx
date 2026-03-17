import type { Metadata } from 'next';
import { PageContainer, SectionTitle, EmptyState } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Villages',
};

export default function VillagesPage() {
  return (
    <PageContainer>
      <SectionTitle
        title="Villages"
        description="Traditional villages of Cyprus"
      />
      <EmptyState description="Village directory coming soon" />
    </PageContainer>
  );
}
