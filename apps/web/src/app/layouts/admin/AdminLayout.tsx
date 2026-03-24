'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell, Burger, Center, Group, Loader, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AdminSidebar } from '@/widgets/admin-sidebar';
import { useAuthStore } from '@/shared/lib/auth';

interface IAdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: IAdminLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pass through the login page without any shell or auth check
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Wait for Zustand to hydrate from localStorage
  if (!mounted) {
    return (
      <Center mih="100vh">
        <Loader size="sm" />
      </Center>
    );
  }

  // Redirect to login if not authenticated
  if (!token) {
    router.replace('/admin/login');
    return (
      <Center mih="100vh">
        <Loader size="sm" />
      </Center>
    );
  }

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
