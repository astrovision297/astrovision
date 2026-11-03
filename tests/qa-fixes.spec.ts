import { test, expect } from '@playwright/test';
test.use({baseURL:process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',reducedMotion:'reduce'});
for(const route of ['/book','/contact','/horoscope']) {
 test(`${route}: validation and time-only preferences`,async({page})=>{
  await page.goto(route);
  const form=page.locator('.booking-form');
  await form.getByLabel('Your name').fill('  ');
  await form.getByLabel('Phone with country code').fill('abcdefg');
  if(route==='/horoscope') {
   await form.getByLabel('Date of birth').fill('1990-01-01');
   await form.getByLabel('Place of birth').fill('  ');
  }
  await form.getByRole('checkbox',{name:/I agree/}).check();
  await form.getByRole('button',{name:'Prepare my enquiry'}).click();
  await expect(form.locator('#name-error')).toBeVisible();
  await expect(form.locator('#phone-error')).toBeVisible();
  if(route==='/horoscope') await expect(form.locator('#birthplace-error')).toBeVisible();
  await form.getByLabel('Your name').fill('Alex');
  await form.getByLabel('Phone with country code').fill('+357 99123456');
  if(route==='/horoscope') await form.getByLabel('Place of birth').fill('Nicosia, Cyprus');
  await form.getByLabel('Preferred time').fill('14:30');
  await form.getByRole('button',{name:'Prepare my enquiry'}).click();
  await expect(form.getByLabel('Prepared enquiry message')).toHaveValue(/Preferred time: 14:30 \(Europe\/Nicosia\)/);
 });
 test(`${route}: no-JavaScript fallback prevents submission`,async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto(`${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}${route}`);
  const form=page.locator('.booking-form');
  await expect(form.getByLabel('Your name')).toBeDisabled();
  await expect(form.getByRole('button',{name:'Prepare my enquiry'})).toBeDisabled();
  await expect(form.locator('.client-required')).toContainText('Enable JavaScript');
  expect(await form.getAttribute('method')).toBe('post');
  if(route!=='/horoscope') await expect(page.locator('iframe')).toHaveAttribute('referrerpolicy','no-referrer');
  await context.close();
 });
}
test('birthday result survives browsing another sign',async({page})=>{
 await page.goto('/horoscope');
 await expect(page.locator('.booking-form .form-submit')).toBeEnabled();
 await page.getByLabel('Find your sun sign').fill('1990-01-01');
 await page.getByRole('button',{name:/Aries/}).click();
 await expect(page.locator('.sign-finder p')).toContainText('Capricorn');
});
test('tablet header retains every navigation destination and Escape closes More',async({page})=>{
 await page.setViewportSize({width:768,height:1024});
 await page.goto('/about');
 await expect(page.locator('html')).toHaveAttribute('data-motion-paused','true');
 const nav=page.getByRole('navigation',{name:'Main navigation'});
 await expect(nav.getByRole('link',{name:'Reviews',exact:true})).toBeVisible();
 const more=nav.getByRole('button',{name:'More pages'});
 await more.click();
 for(const name of ['Daily Horoscope','Journal','FAQ']) await expect(nav.getByRole('link',{name,exact:true})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(more).toHaveAttribute('aria-expanded','false');
 await expect(more).toBeFocused();
 await expect(page.locator('.about-section a')).toHaveAttribute('href','/how-it-works');
});
test('home restores its original poster after actual WebGL context loss',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/');
 await expect(page.locator('.shared-cosmos')).toHaveAttribute('data-live','true',{timeout:60000});
 await page.locator('.shared-cosmos canvas').evaluate((canvas:HTMLCanvasElement)=>{
  canvas.getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext();
 });
 await expect(page.locator('.shared-cosmos')).toHaveAttribute('data-live','false');
 await expect(page.locator('.cosmos-poster')).toBeVisible();
 await expect(page.locator('.shared-cosmos canvas')).toHaveCount(0);
});
