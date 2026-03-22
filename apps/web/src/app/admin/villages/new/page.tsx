import type { Metadata } from 'next';
import { PageContainer, SectionTitle } from '@/shared/ui';
import { VillageCreateView } from './_VillageCreateView';

export const metadata: Metadata = {
  title: 'New Village',
};

export default function AdminVillageNewPage() {
  return (
    <PageContainer size="sm">
      <SectionTitle title="New Village" description="Add a new village entry" />
      <VillageCreateView />
    </PageContainer>
  );
}
