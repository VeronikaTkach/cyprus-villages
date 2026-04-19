import { test, expect } from '@playwright/test';

test.describe('Map page', () => {
  test('loads and shows map heading', async ({ page }) => {
    await page.goto('/en/map');
    await expect(page).toHaveTitle(/Map/);
    await expect(page.getByRole('heading', { name: 'Map' })).toBeVisible();
  });

  // The Leaflet map is loaded client-side via dynamic import. We verify the
  // container is present without asserting on tile images (external OSM resource).
  test('map container renders (requires API)', async ({ page }) => {
    await page.goto('/en/map');
    // Leaflet renders a div.leaflet-container once tiles start loading.
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15_000 });
  });
});
