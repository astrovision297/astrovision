import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnquiry } from '../src/lib/enquiry';
import { siteOrigin } from '../src/lib/site-origin';
const now = new Date('2026-11-03T12:00:00Z');
function check(values: Record<string,string> = {}, birthChart = false, reference = now) {
  const data = new FormData();
  Object.entries({name:'Alex',phone:'+357 99123456',timezone:'Europe/Nicosia',...values}).forEach(([k,v])=>data.set(k,v));
  return validateEnquiry(data,birthChart,reference);
}
test('rejects unusable phone numbers, whitespace and invalid zones',()=>{
  for(const phone of ['abcdefg','123','-------','00000000','+1234567890123456']) assert.ok(check({phone}).phone,phone);
  assert.deepEqual(check(),{});
  assert.ok(check({name:'  '}).name);
  assert.ok(check({timezone:'  '}).timezone);
  assert.ok(check({timezone:'Nicosia nonsense'}).timezone);
  assert.ok(check({birthplace:'  '},true).birthplace);
});
test('dated preferences respect the chosen zone and reject elapsed minutes',()=>{
  assert.ok(check({date:'2026-11-03',time:'13:59'}).time);
  assert.ok(check({date:'2026-11-03',time:'14:00'}).time);
  assert.deepEqual(check({date:'2026-11-03',time:'14:01'}),{});
  assert.deepEqual(check({date:'2026-11-03',time:'13:00',timezone:'America/New_York'}),{});
  assert.ok(check({date:'2026-11-02'}).date);
  assert.deepEqual(check({time:'14:30'}),{});
});
test('preferred dates follow local midnight and times handle DST transitions', () => {
  const reference = new Date('2026-07-12T21:15:00Z');
  assert.ok(check({ date: '2026-07-12' }, false, reference).date);
  assert.deepEqual(check({ date: '2026-07-12', time: '18:00', timezone: 'America/New_York' }, false, reference), {});

  const beforeSpringChange = new Date('2026-03-28T20:00:00Z');
  assert.match(check({ date: '2026-03-29', time: '03:30' }, false, beforeSpringChange).time, /exists/);
  assert.deepEqual(check({ date: '2026-03-29', time: '04:30' }, false, beforeSpringChange), {});

  const repeatedTime = { date: '2026-10-25', time: '03:15' };
  assert.deepEqual(check(repeatedTime, false, new Date('2026-10-25T00:45:00Z')), {});
  assert.match(check(repeatedTime, false, new Date('2026-10-25T01:45:00Z')).time, /still ahead/);
});
test('canonical origin is normalized and invalid deployment URLs are rejected',()=>{
  assert.equal(siteOrigin('https://example.com/'),'https://example.com');
  assert.equal(siteOrigin(''),undefined);
  for(const url of ['ftp://example.com','https://example.com/path','https://a:b@example.com','https://example.com/?secret=yes']) assert.throws(()=>siteOrigin(url));
});

test('configured metadata publishes all 45 canonical pages and its sitemap reference', async()=>{
  const {default:sitemap}=await import('../src/app/sitemap');
  const {default:robots}=await import('../src/app/robots');
  const previous=process.env.NEXT_PUBLIC_SITE_URL;
  const previousVercelDomain=process.env.VERCEL_PROJECT_PRODUCTION_URL;
  try {
    process.env.VERCEL_PROJECT_PRODUCTION_URL='production.example.com';
    process.env.NEXT_PUBLIC_SITE_URL='https://qa.example.com/';
    const urls=sitemap().map(entry=>entry.url);
    assert.equal(urls.length,45);
    assert.equal(new Set(urls).size,45);
    assert.ok(urls.includes('https://qa.example.com/'));
    assert.ok(urls.every(url=>url.startsWith('https://qa.example.com')));
    assert.equal(robots().sitemap,'https://qa.example.com/sitemap.xml');

    delete process.env.NEXT_PUBLIC_SITE_URL;
    assert.equal(sitemap()[0].url,'https://production.example.com/');
    assert.equal(robots().sitemap,'https://production.example.com/sitemap.xml');
  } finally {
    if(previous===undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL=previous;
    if(previousVercelDomain===undefined) delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    else process.env.VERCEL_PROJECT_PRODUCTION_URL=previousVercelDomain;
  }
});
