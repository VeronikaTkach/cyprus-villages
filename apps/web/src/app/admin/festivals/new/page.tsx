import type { Metadata } from 'next';
import { PageContainer, SectionTitle } from '@/shared/ui';
import { FestivalCreateView } from './_FestivalCreateView';

export const metadata: Metadata = {
  title: 'New Festival',
};

export default function AdminFestivalNewPage() {
  return (
    <PageContainer size="sm">
      <SectionTitle title="New Festival" description="Add a new festival entry" />
      <FestivalCreateView />
    </PageContainer>
  );
}
