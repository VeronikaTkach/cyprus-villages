import type { Metadata } from 'next';
import { PageContainer, SectionTitle } from '@/shared/ui';
import { VillagesListView } from './_VillagesListView';

export const metadata: Metadata = {
  title: 'Villages',
  description: 'Discover traditional villages across Cyprus',
};

export default function VillagesPage() {
  return (
    <PageContainer>
      <SectionTitle title="Villages" description="Traditional villages of Cyprus" />
      <VillagesListView />
    </PageContainer>
  );
}
