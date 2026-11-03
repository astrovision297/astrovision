import { test, expect } from '@playwright/test';

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000', reducedMotion: 'reduce' });

test('a search entered on arrival is retained while URL category synchronization mounts', async ({ page }) => {
  await page.goto('/services');
  await expect(page.locator('html')).toHaveAttribute('data-motion-paused', 'true');
  await page.getByRole('searchbox').fill('Palm');
  await expect(page.getByRole('searchbox')).toHaveValue('Palm');
  await expect(page.locator('.service-card')).toHaveCount(1);
  await expect(page.locator('.service-card h3')).toHaveText('Palm Reading');
});

test('footer category navigation updates the existing service list and clears its search', async ({ page }) => {
  await page.goto('/services?category=career');
  await expect(page.locator('.service-card')).toHaveCount(5);
  await page.getByRole('searchbox').fill('business');
  await expect(page.locator('.service-card')).toHaveCount(1);
  await page.locator('.footer').getByRole('link', { name: 'Love & relationships', exact: true }).click();
  await expect(page).toHaveURL(/category=love/);
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await expect(page.locator('.service-card')).toHaveCount(6);
  await page.goBack();
  await expect(page.locator('.service-card')).toHaveCount(5);
});
