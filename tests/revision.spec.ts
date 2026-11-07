import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000', reducedMotion: 'reduce' });
test.setTimeout(120_000);

const routes = ['/', '/about', '/services', '/how-it-works', '/reviews', '/contact', '/book', '/horoscope', '/blog', '/faq', '/privacy', '/terms'];

for (const width of [390, 1440]) {
 test(`main pages have no overflow, broken images, runtime errors or contrast failures at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of routes) {
   await page.goto(route);
   await expect(page.locator('h1')).toBeVisible();
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), route).toBe(true);
   const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
   expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), route).toEqual([]);
   const images = page.locator('main img');
   for (const img of await images.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
   }
  }
  expect(errors).toEqual([]);
 });
}

test('removed service is absent from catalogue, booking and old detail URL', async ({ page }) => {
 await page.goto('/services');
 await expect(page.locator('.service-card')).toHaveCount(30);
 await page.getByRole('searchbox').fill('Hanuman');
 await expect(page.locator('.service-card')).toHaveCount(0);
 await page.goto('/book');
 await expect(page.locator('select[name=service] option').filter({ hasText: /Hanuman/i })).toHaveCount(0);
 await expect(page.locator('select[name=language]')).toHaveCount(0);
 const response = await page.goto('/services/hanuman-puja');
 expect(response?.status()).toBe(404);
});

test('each section has distinct reduced-motion artwork', async ({ page }) => {
 const images = new Set<string>();
 for (const route of routes) {
  await page.goto(route);
  const image = page.locator('.cosmos-poster img');
  images.add((await image.getAttribute('src'))!);
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator('.shared-cosmos canvas')).toHaveCount(0);
 }
 expect(images.size).toBe(routes.length);
});

for (const locale of ['el', 'fr', 'nl', 'tr', 'hi']) {
 test(`${locale} translates the page, survives navigation/reload, and preserves form values`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const english = await page.locator('h1').innerText();
  await page.locator('.language-select select').selectOption(locale);
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect(page.locator('h1')).not.toHaveText(english);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('.header-actions > a[href="/book"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await page.locator('input[name=name]').fill('Alex');
  await page.locator('input[name=phone]').fill('+357 99123456');
  await page.locator('select[name=mode]').selectOption('Phone call');
  await page.locator('.language-select select').selectOption('en');
  await expect(page.getByLabel('Your name')).toHaveValue('Alex');
  await expect(page.getByLabel('Consultation mode')).toHaveValue('Phone call');
  await page.locator('.language-select select').selectOption(locale);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { expanded: false }).filter({ has: page.locator('svg') }).first().click();
  await expect(page.locator('#main-nav')).toBeVisible();
  expect(errors).toEqual([]);
 });
}

test('language download failure keeps the current language and offers retry', async ({ page }) => {
 await page.route('**/locales/fr.json', route => route.abort());
 await page.goto('/');
 await page.locator('.language-select select').selectOption('fr');
 await expect(page.locator('.language-error')).toContainText('Please try again');
 await expect(page.locator('html')).toHaveAttribute('lang', 'en');
 await page.unroute('**/locales/fr.json');
 await page.locator('.language-select select').selectOption('fr');
 await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('each service has its own illustration, shared with its detail page', async ({ page }) => {
 await page.goto('/services');
 const photographs = page.locator('.service-card .service-image');
 await expect(photographs).toHaveCount(30);
 const subjects = await photographs.evaluateAll(images => images.map(image => image.getAttribute('data-service-image')));
 expect(new Set(subjects).size).toBe(30);
 const sources = await page.locator('.service-card .service-image img').evaluateAll(images => images.map(image => image.getAttribute('src')));
 expect(new Set(sources).size).toBe(30);
 await expect(page.locator('.service-card .service-art')).toHaveCount(0);
 await page.goto('/services/palm-reading');
 await expect(page.locator('.service-detail-image [data-service-image=palm-reading] img')).toBeVisible();
 await expect.poll(() => page.locator('.service-detail-image img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
});

test('inner-page astrology background remains behind the whole page while scrolling', async ({ page }) => {
 for (const route of ['/how-it-works', '/services', '/blog/understanding-your-moon-sign']) {
  await page.goto(route);
  for (const fraction of [0, .5, 1]) {
   await page.evaluate(value => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * value), fraction);
   const art = await page.locator('.shared-cosmos').boundingBox();
   expect(art?.y).toBeCloseTo(0, 0);
   expect(art?.height).toBeCloseTo(page.viewportSize()!.height, 0);
   await expect(page.locator('.cosmos-poster img')).toBeVisible();
  }
 }
});
