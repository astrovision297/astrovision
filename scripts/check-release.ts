import { loadEnvConfig } from '@next/env';
import { siteOrigin } from '../src/lib/site-origin';
loadEnvConfig(process.cwd());
try {
  const origin = siteOrigin();
  if (!origin || !origin.startsWith('https://') || ['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname)) {
    throw new Error('Set NEXT_PUBLIC_SITE_URL to the real HTTPS deployment origin in .env.local or your hosting environment, then rebuild.');
  }
  console.log(`Release origin validated: ${origin}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
