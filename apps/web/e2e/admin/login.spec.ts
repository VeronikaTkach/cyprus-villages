import { test, expect } from '@playwright/test';

/**
 * Admin auth flow.
 * Requires both the Next.js dev server AND the NestJS API to be running,
 * with a seeded database (admin@cyprus-villages.dev / Admin1234!).
 */
test.describe('Admin login', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: 'Cyprus Villages' })).toBeVisible();
    await expect(page.getByText('Admin login')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('successful login redirects to admin dashboard (requires API)', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByLabel('Email').fill('admin@cyprus-villages.dev');
    await page.getByLabel('Password').fill('Admin1234!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL('/admin', { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('wrong credentials show error (requires API)', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByLabel('Email').fill('admin@cyprus-villages.dev');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Error alert must appear; URL must stay on login.
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
