import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  transpilePackages: [
    '@mantine/core',
    '@mantine/hooks',
    '@mantine/form',
    '@mantine/dates',
  ],
};

export default withNextIntl(nextConfig);
