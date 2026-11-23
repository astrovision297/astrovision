import { test, expect, type Page } from '@playwright/test';

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000', reducedMotion: 'reduce' });

async function fillEnquiry(page: Page) {
  await page.getByLabel('Your name').fill('Alex');
  await page.getByLabel('Phone with country code').fill('+357 99123456');
  await page.getByRole('checkbox', { name: /I agree to share/ }).check();
  await page.getByRole('button', { name: 'Prepare my enquiry' }).click();
}

test('changed details invalidate the prepared message while direct message edits remain available', async ({ page }) => {
  await page.goto('/book?service=Palm%20Reading');
  await expect(page.getByLabel('What would you like to explore?')).toHaveValue('Palm Reading');
  await fillEnquiry(page);
  const preview = page.getByRole('textbox', { name: 'Prepared enquiry message' });
  await expect(preview).toHaveValue(/interested in Palm Reading/);
  await preview.fill('');
  await expect(preview).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy your message' })).toBeDisabled();
  await expect(page.getByRole('link', { name: 'Open WhatsApp' })).toHaveCount(0);
  await preview.fill('My edited enquiry');
  await expect(preview).toHaveValue('My edited enquiry');

  await page.getByLabel('Consultation mode').selectOption('Phone call');
  await expect(preview).toHaveCount(0);
  await page.getByRole('button', { name: 'Prepare my enquiry' }).click();
  await expect(preview).toHaveValue(/Session: Phone call/);

  await page.getByLabel('Your question').fill('I would like some guidance.');
  await expect(preview).toHaveCount(0);
  await page.getByRole('button', { name: 'Prepare my enquiry' }).click();
  await expect(preview).toHaveValue(/My question: I would like some guidance\./);
  await page.getByRole('checkbox', { name: /I agree to share/ }).uncheck();
  await expect(preview).toHaveCount(0);
});

test('service prefills follow URL changes and browser Back without keeping an old preview', async ({ page }) => {
  await page.goto('/book?service=Palm%20Reading');
  const service = page.getByLabel('What would you like to explore?');
  await expect(service).toHaveValue('Palm Reading');
  await fillEnquiry(page);
  await page.evaluate(() => window.history.pushState(null, '', '?service=Career%20Guidance'));
  await expect(service).toHaveValue('Career Guidance');
  await expect(page.getByRole('textbox', { name: 'Prepared enquiry message' })).toHaveCount(0);
  await page.goBack();
  await expect(service).toHaveValue('Palm Reading');
  await page.evaluate(() => window.history.pushState(null, '', '/book'));
  await expect(service).toHaveValue('General consultation');
  await service.selectOption('Palm Reading');
  await service.selectOption('General consultation');
  await expect(service).toHaveValue('General consultation');
  await expect(page.getByLabel('Your name')).toHaveValue('Alex');
});

test('clipboard failure selects the enquiry and explains how to copy it manually', async ({ page }) => {
  await page.goto('/book');
  await fillEnquiry(page);
  const copy = page.getByRole('button', { name: 'Copy your message' });
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new Error('Clipboard unavailable'); } },
    });
  });
  await copy.click();
  await expect(page.getByRole('status').filter({ hasText: 'Automatic copying is unavailable' })).toBeVisible();
  const preview = page.getByRole('textbox', { name: 'Prepared enquiry message' });
  await expect(preview).toBeFocused();
  expect(await preview.evaluate((element: HTMLTextAreaElement) =>
    element.selectionStart === 0 && element.selectionEnd === element.value.length)).toBe(true);
});
