import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads and shows main heading', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveTitle(/Cyprus Villages/);
    await expect(page.getByRole('heading', { name: 'Cyprus Villages' })).toBeVisible();
  });
});
