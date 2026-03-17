'use client';

import {
  Anchor,
  AppShell,
  Burger,
  Drawer,
  Group,
  NavLink,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { publicNavItems } from '@/shared/config/navigation';

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (!pathname) return false;
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Anchor component={Link} href="/" underline="never">
            <Text fw={700} size="lg" c="teal">
              Cyprus Villages
            </Text>
          </Anchor>

          <Group gap="xs" visibleFrom="sm">
            {publicNavItems.map((item) => (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={item.icon}
                active={isActive(item.href, item.exact)}
                style={{ borderRadius: 'var(--mantine-radius-md)' }}
              />
            ))}
          </Group>

          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        </Group>
      </AppShell.Header>

      <Drawer
        opened={opened}
        onClose={close}
        title="Menu"
        size="xs"
        hiddenFrom="sm"
      >
        {publicNavItems.map((item) => (
          <NavLink
            key={item.href}
            component={Link}
            href={item.href}
            label={item.label}
            leftSection={item.icon}
            active={isActive(item.href, item.exact)}
            onClick={close}
          />
        ))}
      </Drawer>
    </>
  );
}
