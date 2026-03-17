import type { Metadata } from 'next';
import { PageContainer, SectionTitle } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Map',
};

export default function MapPage() {
  return (
    <PageContainer>
      <SectionTitle
        title="Map"
        description="Explore villages and festivals on the map"
      />
    </PageContainer>
  );
}
