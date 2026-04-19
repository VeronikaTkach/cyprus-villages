import { test, expect } from '@playwright/test';

test.describe('Villages', () => {
  test('list page loads with heading', async ({ page }) => {
    await page.goto('/en/villages');
    await expect(page).toHaveTitle(/Villages/);
    await expect(page.getByRole('heading', { name: 'Villages' })).toBeVisible();
  });

  test('list page renders village cards (requires API)', async ({ page }) => {
    await page.goto('/en/villages');
    // Wait for client-side fetch — seeded "Omodos" must be visible.
    await expect(page.getByText('Omodos')).toBeVisible({ timeout: 10_000 });
  });

  test('village detail page loads from direct URL (requires API)', async ({ page }) => {
    await page.goto('/en/villages/omodos');
    await expect(page.getByRole('heading', { name: 'Omodos' })).toBeVisible({ timeout: 10_000 });
  });

  test('navigate from list to village detail via card click (requires API)', async ({ page }) => {
    await page.goto('/en/villages');
    // Wait for the seeded card to appear, then click it.
    await page.getByText('Omodos').first().click();
    await expect(page).toHaveURL(/\/villages\/omodos/);
    await expect(page.getByRole('heading', { name: 'Omodos' })).toBeVisible({ timeout: 10_000 });
  });

  test('village detail page shows related festivals (requires API)', async ({ page }) => {
    await page.goto('/en/villages/omodos');
    // Omodos has Wine Festival and Holy Cross seeded — at least one must appear.
    await expect(
      page.getByText('Omodos Wine Festival').or(page.getByText('Holy Cross Festival')),
    ).toBeVisible({ timeout: 10_000 });
  });
});
