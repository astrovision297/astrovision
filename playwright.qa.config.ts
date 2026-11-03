import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests',
 timeout:90000,
 expect:{timeout:15000},
 workers:2,
 use:{browserName:process.env.QA_BROWSER==='firefox'?'firefox':'chromium',channel:process.env.QA_BROWSER==='firefox'?undefined:'chromium',navigationTimeout:120000,launchOptions:{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}},
});
