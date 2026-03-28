'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ActionIcon, AppShell, Burger, Center, Group, Loader, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLogout } from '@tabler/icons-react';
import { AdminSidebar } from '@/widgets/admin-sidebar';
import { useAuthStore } from '@/shared/lib/auth';
import { httpPost } from '@/shared/api/http-client';

interface IAdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: IAdminLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

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
  if (!isAuthenticated) {
    router.replace('/admin/login');
    return (
      <Center mih="100vh">
        <Loader size="sm" />
      </Center>
    );
  }

  async function handleLogout() {
    try {
      await httpPost('/auth/logout', {});
    } catch {
      // ignore — clear state regardless
    }
    setAuthenticated(false);
    router.replace('/admin/login');
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
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Tooltip label="Log out">
              <ActionIcon variant="subtle" color="gray" onClick={handleLogout} aria-label="Log out">
                <IconLogout size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>
      <AdminSidebar />
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
