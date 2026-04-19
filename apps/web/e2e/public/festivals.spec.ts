import { test, expect } from '@playwright/test';

test.describe('Festivals', () => {
  test('list page loads with heading', async ({ page }) => {
    await page.goto('/en/festivals');
    await expect(page).toHaveTitle(/Festivals/);
    await expect(page.getByRole('heading', { name: 'Festivals' })).toBeVisible();
  });

  test('list page renders festival cards (requires API)', async ({ page }) => {
    await page.goto('/en/festivals');
    // Wait for client-side fetch — seeded "Omodos Wine Festival" must be visible.
    await expect(page.getByText('Omodos Wine Festival')).toBeVisible({ timeout: 10_000 });
  });

  test('festival detail page loads from direct URL (requires API)', async ({ page }) => {
    await page.goto('/en/festivals/omodos-wine-festival');
    await expect(page.getByRole('heading', { name: 'Omodos Wine Festival' })).toBeVisible({
      timeout: 10_000,
    });
  });
});
