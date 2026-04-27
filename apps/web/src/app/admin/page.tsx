import type { Metadata } from 'next';
import { PageContainer, SectionTitle } from '@/shared/ui';
import { AdminDashboardView } from './_AdminDashboardView';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default function AdminDashboardPage() {
  return (
    <PageContainer>
      <SectionTitle title="Dashboard" description="Cyprus Villages admin panel" />
      <AdminDashboardView />
    </PageContainer>
  );
}
