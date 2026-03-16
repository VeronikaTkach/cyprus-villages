import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { ColorSchemeScript } from '@mantine/core';
import { Providers } from './providers/providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cyprus Villages',
  description: 'Festival calendar for Cyprus villages',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
