import { expect, test, type Page } from '@playwright/test';
import { zodiac } from '../src/data/content';

test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  reducedMotion: 'reduce',
  timezoneId: 'America/Los_Angeles',
});

async function readSigns(page: Page) {
  const picker = page.locator('.zodiac-picker');
  const reading = page.locator('.horoscope-reading p');
  const results = [];
  for (const [sign] of zodiac) {
    await picker.getByRole('button', { name: new RegExp(sign) }).click();
    await expect(reading).toBeVisible();
    results.push(await reading.innerText());
  }
  return results;
}

test('all signs update at Cyprus midnight and show the same readings after reload and on the homepage', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-07-12T20:59:15Z') });
  await page.clock.pauseAt(new Date('2026-07-12T20:59:55Z'));
  await page.goto('/horoscope');
  await expect(page.locator('.horoscope-intro .date-label')).toContainText('2026-07-12');
  const firstDay = await readSigns(page);
  expect(new Set(firstDay).size).toBe(12);

  await page.clock.runFor(5000);
  await expect(page.locator('.horoscope-intro .date-label')).toContainText('2026-07-13');
  await expect(page.locator('.zodiac-picker').getByRole('button', { name: /Pisces/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.horoscope-reading p')).not.toHaveText(firstDay.at(-1)!);
  const nextDay = await readSigns(page);
  expect(new Set(nextDay).size).toBe(12);
  for (const [index, reading] of nextDay.entries()) expect(reading).not.toBe(firstDay[index]);

  await page.reload();
  expect(await readSigns(page)).toEqual(nextDay);
  await page.goto('/');
  await expect(page.locator('.horoscope-reading p')).toHaveText(nextDay[0]);

  await page.getByRole('combobox', { name: 'Website language' }).selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('.horoscope-reading p')).not.toHaveText(nextDay[0]);
});
