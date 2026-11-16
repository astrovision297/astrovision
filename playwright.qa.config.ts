import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests',
 testMatch:'**/*.spec.ts',
 timeout:90000,
 expect:{timeout:15000},
 workers:2,
 use:{browserName:process.env.QA_BROWSER==='firefox'?'firefox':'chromium',channel:process.env.QA_BROWSER==='firefox'?undefined:(process.env.PLAYWRIGHT_CHANNEL || 'chromium'),navigationTimeout:120000,launchOptions:{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}},
});
