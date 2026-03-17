'use client';

import { AppShell } from '@mantine/core';
import { Header } from '@/widgets/header';

interface IPublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: IPublicLayoutProps) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header />
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
