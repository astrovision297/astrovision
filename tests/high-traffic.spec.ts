import { test, expect } from '@playwright/test';
import videos from '../src/data/video-reviews.json';

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000', reducedMotion: 'reduce' });

test('review media waits for playback and thumbnails load without layout changes', async ({ page }) => {
  const downloads: string[] = [];
  page.on('request', request => {
    if (/\.(mp4|mp3)(?:\?|$)/.test(request.url())) downloads.push(request.url());
  });
  await page.goto('/reviews');
  const players = page.locator('.video-review-card video');
  await expect(players).toHaveCount(videos.length);
  for (const [index, player] of (await players.all()).entries()) {
    await player.scrollIntoViewIfNeeded();
    await expect(player).toHaveAttribute('preload', 'none');
    await expect(player).toHaveAttribute('poster', videos[index].poster);
    const box = await player.boundingBox();
    expect(box!.width / box!.height).toBeCloseTo(videos[index].width / videos[index].height, 1);
  }
  await page.waitForLoadState('networkidle');
  expect(downloads).toEqual([]);
  await page.getByRole('button', { name: 'Play video: Video review 1', exact: true }).click();
  await expect.poll(() => downloads.some(url => url.includes(videos[0].src))).toBe(true);
  await expect(players.first()).toHaveJSProperty('paused', false);
});

test('media is cached, range playback works, and unknown catalogue URLs return 404', async ({ request }) => {
  const audio = await request.get('/audio/background-music-a774483e122d.mp3', { headers: { Range: 'bytes=0-1023' } });
  expect(audio.status()).toBe(206);
  expect(audio.headers()['cache-control']).toContain('immutable');
  expect(audio.headers()['content-type']).toContain('audio/mpeg');
  expect((await audio.body()).byteLength).toBe(1024);
  for (const video of videos) {
    const poster = await request.get(video.poster);
    expect(poster.status()).toBe(200);
    expect(poster.headers()['cache-control']).toContain('s-maxage=86400');
    expect(poster.headers()['content-type']).toContain('image/webp');
  }
  const dictionary = await request.get('/locales/el.json');
  expect(dictionary.status()).toBe(200);
  expect(dictionary.headers()['cache-control']).toContain('max-age=0');
  for (const route of ['/services/unknown-service', '/blog/unknown-article']) {
    expect((await request.get(route)).status()).toBe(404);
  }
});
