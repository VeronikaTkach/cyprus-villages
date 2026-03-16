import { AppShell } from '@mantine/core';

interface IPublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: IPublicLayoutProps) {
  return (
    <AppShell padding="md">
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
