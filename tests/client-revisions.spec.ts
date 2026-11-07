import { test, expect } from '@playwright/test';
import { services } from '../src/data/content';

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000', reducedMotion: 'reduce' });

test('country browser filters, resets, localizes and preserves country in an enquiry', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: /Personal guidance/ });
  await expect(section.locator('.country-card')).toHaveCount(37);
  await section.getByRole('button', { name: /^Europe/ }).click();
  await expect(section.locator('.country-card')).toHaveCount(9);
  await section.getByRole('searchbox').fill('India');
  await expect(section.getByRole('heading', { name: 'No matching countries' })).toBeVisible();
  await section.getByRole('button', { name: 'Show all countries' }).click();
  await section.getByRole('searchbox').fill('Cyprus');
  const country = section.locator('.country-card');
  await expect(country).toHaveCount(1);
  const href = await country.getAttribute('href');
  expect(decodeURIComponent(href!)).toContain('Cyprus');
  if (href!.startsWith('/contact')) {
    await country.click();
    await expect(page.locator('select[name=service]')).toHaveValue('Online consultation from Cyprus');
  }
  await page.goto('/');
  await page.locator('.language-select select').selectOption('el');
  await expect(page.locator('html')).toHaveAttribute('lang', 'el');
  await page.locator('.worldwide input').fill('Κύπρος');
  await expect(page.locator('.country-card')).toHaveCount(1);
  await expect(page.locator('.country-card strong')).toHaveText('Κύπρος');
  if (href!.startsWith('/contact')) {
    await page.locator('.country-card').click();
    await expect(page.locator('select[name=service]')).toHaveValue('Online consultation from Cyprus');
    await expect(page.locator('select[name=service] option:checked')).toContainText('Κύπρος');
  }
});

test('review page has twelve distinct supplied quotes and requested confidence figures', async ({ page }) => {
  await page.goto('/reviews');
  await expect(page.locator('.review-card')).toHaveCount(12);
  const quotes = await page.locator('blockquote').allTextContents();
  expect(new Set(quotes).size).toBe(12);
  await expect(page.locator('.review-card').first()).toContainText('Ελένη Παπαδοπούλου');
  await expect(page.locator('.review-card').first().locator('blockquote')).toHaveAttribute('lang', 'el');
  await expect(page.locator('.review-community')).toContainText('100+ happy clients');
  await page.goto('/about');
  await expect(page.locator('.client-stats')).toContainText('20+');
  await expect(page.locator('.client-values article')).toHaveCount(4);
});

test('new offerings have working detail pages, artwork and booking selection', async ({ page }) => {
  test.setTimeout(180_000);
  for (const service of services.filter(service => ['health-medical-astrology', 'numerology-consultation', 'tarot-guidance-divination', 'vastu-shastri-consultation', 'family-disputes', 'childrens-astrology', 'foreign-settlement-travel-guidance'].includes(service.slug))) {
    const response = await page.goto(`/services/${service.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText(service.title);
    const image = page.locator('.service-detail-image img');
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await page.getByRole('link', { name: 'Book this reading' }).click();
    await expect(page.locator('select[name=service]')).toHaveValue(service.title);
  }
});

test('Ganesha hero loads and respects reduced motion and the shared pause control', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('.ganesha-hero img');
  await expect.poll(() => hero.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator('html')).toHaveAttribute('data-motion-paused', 'true');
  expect(await page.locator('.ganesha-zodiac').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('html')).toHaveAttribute('data-motion-paused', 'false');
  await page.getByRole('button', { name: 'Pause animation' }).click();
  await expect.poll(() => page.locator('.ganesha-zodiac').evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused');
  await page.getByRole('button', { name: 'Resume animation' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion-paused', 'false');
});


test('mobile opening view includes the deity and primary booking action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const art = await page.locator('.ganesha-hero').boundingBox();
  expect(art).not.toBeNull();
  expect(art!.y).toBeLessThan(350);
  expect(art!.y + art!.height).toBeLessThan(700);
  await expect(page.getByRole('link', { name: 'Book a Reading', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
