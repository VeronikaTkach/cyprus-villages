import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests for the Cyprus Villages web app.
 *
 * Requires a running stack:
 *   - Next.js dev server  (started automatically by webServer below if not already running)
 *   - NestJS API server   (start manually: cd apps/api && pnpm dev)
 *   - PostgreSQL with seeded data (docker compose up && pnpm db:seed)
 *
 * Run tests:
 *   pnpm test:e2e            — headless
 *   pnpm test:e2e:ui         — interactive UI mode
 */
export default defineConfig({
  testDir: './e2e',

  // Run test files in parallel; individual tests within a file run serially.
  fullyParallel: true,

  // Fail the build on CI if a test.only was accidentally committed.
  forbidOnly: !!process.env.CI,

  // One retry on CI to absorb transient flakiness.
  retries: process.env.CI ? 1 : 0,

  // Single worker on CI to avoid port/resource contention.
  workers: process.env.CI ? 1 : undefined,

  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:3000',

    // Capture trace on first retry for debugging.
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    // Reuse a running dev server locally; always start fresh on CI.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
