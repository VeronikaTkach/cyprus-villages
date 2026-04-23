'use client';

import { Drawer, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMenu2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { publicNavItems } from '@/shared/config/navigation';
import { LocaleSwitcher } from '@/widgets/header';

export function PublicSidebar() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();
  const t = useTranslations('nav');

  function isActive(href: string, exact?: boolean) {
    if (!pathname) return false;
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="cv-sidebar">
        <Link href="/" className="cv-brand">
          <span className="cv-brand__dot" />
          <span>Cyprus Villages</span>
        </Link>

        <nav className="cv-nav">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href, item.exact) ? 'active' : ''}
            >
              {item.icon}
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="cv-mono" style={{ fontSize: 10 }}>Language</span>
          <LocaleSwitcher />
        </div>
      </aside>

      {/* ── Mobile topbar ── */}
      <div className="cv-topbar">
        <Link href="/" className="cv-brand" style={{ fontSize: 16 }}>
          <span className="cv-brand__dot" />
          <span>Cyprus Villages</span>
        </Link>
        <button className="cv-topbar__menu" onClick={toggle} aria-label="Menu">
          <IconMenu2 size={18} />
        </button>
      </div>

      {/* ── Mobile nav drawer ── */}
      <Drawer opened={opened} onClose={close} size="xs" position="left" title="Menu">
        <nav className="cv-nav">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href, item.exact) ? 'active' : ''}
              onClick={close}
            >
              {item.icon}
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
        <Divider my="md" />
        <LocaleSwitcher />
      </Drawer>
    </>
  );
}
