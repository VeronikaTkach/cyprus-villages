'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ActionIcon, AppShell, Burger, Center, Group, Loader, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLogout } from '@tabler/icons-react';
import { AdminSidebar } from '@/widgets/admin-sidebar';
import { useAuthStore } from '@/shared/lib/auth';
import { httpGet, httpPost } from '@/shared/api/http-client';

interface IAdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: IAdminLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  // useSyncExternalStore returns false on the server and during initial hydration,
  // then true on the client — equivalent to useState(false)+useEffect setMounted(true)
  // but without calling setState inside an effect body.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  // Probe the backend once after hydration to detect a stale persisted isAuthenticated flag.
  // If the cookie is missing or expired, the 401 response triggers handleUnauthorized,
  // which clears isAuthenticated and redirects to /admin/login.
  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    void httpGet<{ ok: boolean }>('/auth/me').catch(() => {
      // 401 is handled inside httpGet — no action needed here
    });
  }, [mounted, isAuthenticated]);

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
