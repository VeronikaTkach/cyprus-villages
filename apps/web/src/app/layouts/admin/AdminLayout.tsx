import { AppShell } from '@mantine/core';

interface IAdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: IAdminLayoutProps) {
  return (
    <AppShell
      navbar={{ width: 240, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Navbar p="md" />
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
