import { chromium } from '@playwright/test';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { pageScene, sceneRoutes } from '../src/lib/page-themes';

// Capture the actual WebGL scene, including engraved text and lunar shading.
// Run a local server first. Static posters preserve the same artwork when motion
// is reduced or WebGL is unavailable, on inner pages. The original home artwork is preserved.
// Run again with PAGE_ART_MOBILE=1 to capture the fitted portrait compositions.
async function main() {
  const rawDirectory = process.env.PAGE_ART_RAW_DIR;
  const mobile = process.env.PAGE_ART_MOBILE === '1';
  const width = mobile ? 760 : 2000, height = mobile ? 1600 : 1000;
  await mkdir(rawDirectory || 'public/images/scenes', { recursive: true });
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'no-preference' });
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: unknown[]) {
      if (args[0] === 'webgl2' || args[0] === 'webgl') args[1] = { ...(args[1] as object || {}), preserveDrawingBuffer: true };
      return Reflect.apply(original, this, args);
    } as typeof original;
  });
  const page = await context.newPage();
  try {
    const requested = process.argv.slice(2);
    for (const route of sceneRoutes.filter(value => !requested.length || requested.includes(pageScene(value).id))) {
      const config = pageScene(route);
      await page.goto(`${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}/${route.slice(1)}`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
      await page.addStyleTag({ content: `.shared-cosmos>.living-scene{position:fixed!important;left:0!important;top:0!important;right:auto!important;width:${width}px!important;height:${height}px!important;opacity:1!important}` });
      await page.waitForFunction(() => document.querySelector('.shared-cosmos')?.getAttribute('data-live') === 'true', undefined, { timeout: 90_000 });
      await page.waitForTimeout(300);
      const uri = await page.locator('.shared-cosmos canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL('image/png'));
      if (rawDirectory) {
        await writeFile(`${rawDirectory}/${config.id}-astrology${mobile ? '-mobile' : ''}.png`, Buffer.from(uri.split(',')[1], 'base64'));
        console.log(`Captured ${config.id}`);
        continue;
      }
      const { default: sharp } = await import('sharp');
      const output = `public/images/scenes/${config.id}-astrology${mobile ? '-mobile' : ''}.webp`;
      await sharp(Buffer.from(uri.split(',')[1], 'base64')).webp({ quality: 90 }).toFile(output + '.tmp.webp');
      await rename(output + '.tmp.webp', output);
      console.log(`Saved ${config.id} astrology poster`);
    }
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
