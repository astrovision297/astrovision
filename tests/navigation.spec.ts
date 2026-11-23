import { test, expect } from '@playwright/test';
import { services } from '../src/data/content';

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
  const careerCount = services.filter(service => service.category === 'career').length;
  const loveCount = services.filter(service => service.category === 'love').length;
  await page.goto('/services?category=career');
  await expect(page.locator('.service-card')).toHaveCount(careerCount);
  await page.getByRole('searchbox').fill('business');
  await expect(page.locator('.service-card')).toHaveCount(1);
  await page.locator('.footer').getByRole('link', { name: 'Love & relationships', exact: true }).click();
  await expect(page).toHaveURL(/category=love/);
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await expect(page.locator('.service-card')).toHaveCount(loveCount);
  await page.goBack();
  await expect(page.locator('.service-card')).toHaveCount(careerCount);
});

test('mobile navigation and media controls stay clear of booking on a short phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion-paused', 'true');
  await expect(page.locator('.shared-cosmos canvas')).toHaveCount(0);

  const contact = page.locator('.mobile-contact');
  const menu = page.getByRole('button', { name: 'Open menu' });
  const media = page.getByRole('button', { name: 'Media settings' });
  await menu.click();
  await expect(page.locator('#main-nav')).toBeVisible();
  await media.click();
  await expect(page.locator('#main-nav')).toBeHidden();
  await page.getByRole('button', { name: 'Music volume' }).click();
  await expect(page.getByRole('slider', { name: 'Music volume' })).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(media).toBeFocused();
  await expect(media).toHaveAttribute('aria-expanded', 'false');

  await expect(contact.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /wa\.me/);
  await expect(contact.getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', /instagram\.com/);
  await contact.getByRole('link', { name: 'Book Appointment' }).click();
  await expect(page).toHaveURL(/\/book$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
});
