import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { ColorSchemeScript } from '@mantine/core';
import { Providers } from './providers/providers';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Cyprus Villages',
    default: 'Cyprus Villages',
  },
  description: 'Festival calendar and guide for traditional Cypriot villages',
  applicationName: 'Cyprus Villages',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cyprus Villages',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#12b886',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
