import { test, expect } from '@playwright/test';
import { pageScene, sceneRoutes } from '../src/lib/page-themes';

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000', navigationTimeout: 120_000 });
test.setTimeout(180_000);

test('every route has its own complete fallback and no canvas under reduced motion', async ({ page }) => {
 await page.emulateMedia({ reducedMotion: 'reduce' });
 for (const route of ['/', ...sceneRoutes]) {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.shared-cosmos')).toHaveAttribute('data-scene', pageScene(route).id);
  const poster = page.locator('.cosmos-poster img');
  await expect.poll(() => poster.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0), { message: route }).toBe(true);
  await expect(page.locator('.shared-cosmos canvas')).toHaveCount(0);
 }
});

test('live scenes animate, pause, survive navigation and recover to a poster on context loss', async ({ page }) => {
 await page.emulateMedia({ reducedMotion: 'no-preference' });
 const errors: string[] = [];
 page.on('pageerror', error => errors.push(error.message));
 await page.goto('/about', { waitUntil: 'domcontentloaded' });
 const background = page.locator('.shared-cosmos');
 await expect(background).toHaveAttribute('data-live', 'true', { timeout: 60_000 });
 const canvas = background.locator('canvas');
 const before = await canvas.screenshot();
 await page.waitForTimeout(700);
 expect((await canvas.screenshot()).equals(before)).toBe(false);
 await page.getByRole('button', { name: 'Pause animation' }).click();
 await expect(background.locator('canvas')).toHaveCount(0);
 await expect(page.locator('.cosmos-poster')).toBeVisible();
 await page.locator('#main-nav > a[href="/services"]').click();
 await expect(page).toHaveURL(/\/services$/, { timeout: 30_000 });
 await expect(background).toHaveAttribute('data-scene', 'services', { timeout: 30_000 });
 await expect(background.locator('canvas')).toHaveCount(0);
 await page.getByRole('button', { name: 'Resume animation' }).click();
 await expect(background).toHaveAttribute('data-live', 'true', { timeout: 60_000 });
 await background.locator('canvas').evaluate((element: HTMLCanvasElement) => element.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
 await expect(background.locator('canvas')).toHaveCount(0);
 await expect(page.locator('.cosmos-poster')).toBeVisible();
 expect(errors).toEqual([]);
});

test('unsupported WebGL retains readable, complete artwork', async ({ page }) => {
 await page.emulateMedia({ reducedMotion: 'no-preference' });
 await page.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, ...args: unknown[]) {
   return String(args[0]).startsWith('webgl') ? null : Reflect.apply(original, this, args);
  } as typeof original;
 });
 await page.goto('/book', { waitUntil: 'domcontentloaded' });
 await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
 await expect(page.locator('.shared-cosmos canvas')).toHaveCount(0);
 await expect(page.locator('.cosmos-poster')).toBeVisible();
 await page.getByLabel('Your name').fill('Asha');
 await expect(page.getByLabel('Your name')).toHaveValue('Asha');
});


test('portrait artwork fills the screen and stays fixed while scrolling', async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 844 });
 await page.emulateMedia({ reducedMotion: 'reduce' });
 for (const route of ['/', '/about', '/faq']) {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  const background = page.locator('.shared-cosmos');
  const image = background.locator('.cosmos-poster img');
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0 && (element.currentSrc.endsWith('-mobile.webp') || element.currentSrc.includes('jyotisha-poster.svg')))).toBe(true);
  expect(await background.boundingBox()).toEqual({ x: 0, y: 0, width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  expect(await background.boundingBox()).toEqual({ x: 0, y: 0, width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 }
});
