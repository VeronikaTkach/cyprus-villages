'use client';

import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AdminSidebar } from '@/widgets/admin-sidebar';

interface IAdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: IAdminLayoutProps) {
  const [opened] = useDisclosure();

  return (
    <AppShell
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 1rem' }}>
          <span style={{ fontWeight: 700 }}>Cyprus Villages — Admin</span>
        </div>
      </AppShell.Header>
      <AdminSidebar />
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
