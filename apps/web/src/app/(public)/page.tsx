import type { Metadata } from 'next';
import { PageContainer } from '@/shared/ui';
import { SectionTitle } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Home',
};

export default function HomePage() {
  return (
    <PageContainer>
      <SectionTitle
        title="Cyprus Villages"
        description="Discover traditional festivals and villages across Cyprus"
      />
    </PageContainer>
  );
}
