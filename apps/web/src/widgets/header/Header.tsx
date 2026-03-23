'use client';

import {
  Anchor,
  AppShell,
  Burger,
  Divider,
  Drawer,
  Group,
  NavLink,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { publicNavItems } from '@/shared/config/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();
  const t = useTranslations('nav');

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
                label={t(item.labelKey)}
                leftSection={item.icon}
                active={isActive(item.href, item.exact)}
                style={{ borderRadius: 'var(--mantine-radius-md)' }}
              />
            ))}
            <LocaleSwitcher />
          </Group>

          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        </Group>
      </AppShell.Header>

      <Drawer opened={opened} onClose={close} title="Menu" size="xs" position="left">
        {publicNavItems.map((item) => (
          <NavLink
            key={item.href}
            component={Link}
            href={item.href}
            label={t(item.labelKey)}
            leftSection={item.icon}
            active={isActive(item.href, item.exact)}
            onClick={close}
          />
        ))}
        <Divider my="sm" />
        <LocaleSwitcher />
      </Drawer>
    </>
  );
}
