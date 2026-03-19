'use client';

import { AppShell, Burger, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AdminSidebar } from '@/widgets/admin-sidebar';

interface IAdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: IAdminLayoutProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Text fw={700} size="md">
            Cyprus Villages — Admin
          </Text>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        </Group>
      </AppShell.Header>
      <AdminSidebar />
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
