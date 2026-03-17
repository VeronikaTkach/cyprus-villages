'use client';

import { AppShell, NavLink } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminNavItems } from '@/shared/config/navigation';

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (!pathname) return false;
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <AppShell.Navbar p="md">
      {adminNavItems.map((item) => (
        <NavLink
          key={item.href}
          component={Link}
          href={item.href}
          label={item.label}
          leftSection={item.icon}
          active={isActive(item.href, item.exact)}
        />
      ))}
    </AppShell.Navbar>
  );
}
