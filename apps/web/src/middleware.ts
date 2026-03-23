import createMiddleware from 'next-intl/middleware';
import { LOCALES, DEFAULT_LOCALE } from '@/shared/i18n';

export default createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  localeDetection: true,
});

export const config = {
  // Apply to all routes except:
  // - /api/*
  // - /_next/* (Next.js internals)
  // - /admin/* (admin panel — no locale prefix)
  // - static files (anything with a dot extension)
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
};
