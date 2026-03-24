import type { Metadata } from 'next';
import { PageContainer, SectionTitle } from '@/shared/ui';
import { AdminFestivalsListView } from './_AdminFestivalsListView';

export const metadata: Metadata = {
  title: 'Manage Festivals',
};

export default function AdminFestivalsPage() {
  return (
    <PageContainer>
      <SectionTitle title="Festivals" description="Manage festival entries" />
      <AdminFestivalsListView />
    </PageContainer>
  );
}
