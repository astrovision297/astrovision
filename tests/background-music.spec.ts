import { test, expect } from '@playwright/test';

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000', reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const active = new WeakSet<HTMLMediaElement>();
    Object.defineProperty(HTMLMediaElement.prototype, 'paused', { get() { return !active.has(this); } });
    HTMLMediaElement.prototype.play = async function () {
      if (sessionStorage.getItem('block-audio') && this instanceof HTMLAudioElement) throw new DOMException('Blocked', 'NotAllowedError');
      active.add(this);
      this.dispatchEvent(new Event('play'));
      this.dispatchEvent(new Event('playing'));
    };
    HTMLMediaElement.prototype.pause = function () {
      active.delete(this);
      this.dispatchEvent(new Event('pause'));
    };
  });
  // The media lifecycle is mocked; avoid a download during control tests.
  await page.route('**/audio/background-music-a774483e122d.mp3', route => route.fulfill({ path: 'public/audio/background-music-a774483e122d.mp3', contentType: 'audio/mpeg' }));
});

test('starts on interaction, preserves pause and volume on reload', async ({ page }) => {
  await page.goto('/');
  const audio = page.locator('.background-music audio');
  await expect(audio).not.toHaveAttribute('src');
  await page.locator('h1').click();
  await page.getByRole('button', { name: 'Media settings' }).click();
  await expect(page.getByRole('button', { name: 'Pause music', exact: true })).toBeVisible();
  await expect(audio).toHaveJSProperty('volume', 0.15);
  await page.getByRole('button', { name: 'Music volume', exact: true }).click();
  await page.getByRole('slider', { name: 'Music volume' }).fill('8');
  await expect(audio).toHaveJSProperty('volume', 0.08);
  await page.getByRole('button', { name: 'Pause music', exact: true }).click();
  await page.reload();
  await page.locator('h1').click();
  await page.getByRole('button', { name: 'Media settings' }).click();
  await expect(audio).not.toHaveAttribute('src');
  await page.getByRole('button', { name: 'Play music', exact: true }).click();
  await expect(audio).toHaveJSProperty('volume', 0.08);
});

test('blocked playback offers an explicit retry', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => sessionStorage.setItem('block-audio', 'true'));
  await page.locator('h1').click();
  await page.getByRole('button', { name: 'Media settings' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Music unavailable' })).toBeVisible();
  await page.evaluate(() => sessionStorage.removeItem('block-audio'));
  await page.getByRole('button', { name: 'Play music', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause music', exact: true })).toBeVisible();
});

test('testimonial playback suspends music without changing user preference', async ({ page }) => {
  await page.goto('/');
  await page.locator('h1').click();
  await page.getByRole('button', { name: 'Media settings' }).click();
  await page.evaluate(async () => {
    const video = document.createElement('video');
    video.id = 'music-test-video';
    document.body.append(video);
    await video.play();
  });
  await expect(page.getByRole('button', { name: 'Play music', exact: true })).toBeVisible();
  await page.evaluate(() => (document.querySelector('#music-test-video') as HTMLVideoElement).pause());
  await expect(page.getByRole('button', { name: 'Pause music', exact: true })).toBeVisible();
});

test('music stays mounted across navigation and controls fit a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('h1').click();
  await page.getByRole('button', { name: 'Media settings' }).click();
  await page.evaluate(() => { document.querySelector('.background-music audio')?.setAttribute('data-player-check', 'original'); });
  await page.locator('.footer a[href="/about"]').first().click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('.background-music audio')).toHaveAttribute('data-player-check', 'original');
  await expect(page.getByRole('button', { name: 'Media settings' })).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Media settings' }).click();
  await expect(page.getByRole('button', { name: 'Pause music', exact: true })).toBeVisible();
  const music = await page.locator('.background-music').boundingBox();
  const contact = await page.locator('.mobile-contact').boundingBox();
  expect(music).not.toBeNull();
  expect(music!.x).toBeGreaterThanOrEqual(0);
  expect(music!.x + music!.width).toBeLessThanOrEqual(390);
  expect(music!.y + music!.height).toBeLessThan(contact!.y);
});
