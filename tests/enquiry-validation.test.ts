import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnquiry } from '../src/lib/enquiry';
import { siteOrigin } from '../src/lib/site-origin';
const now = new Date('2026-11-03T12:00:00Z');
function check(values: Record<string,string> = {}, birthChart = false) {
  const data = new FormData();
  Object.entries({name:'Alex',phone:'+357 99123456',timezone:'Europe/Nicosia',...values}).forEach(([k,v])=>data.set(k,v));
  return validateEnquiry(data,birthChart,now);
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
test('canonical origin is normalized and invalid deployment URLs are rejected',()=>{
  assert.equal(siteOrigin('https://example.com/'),'https://example.com');
  assert.equal(siteOrigin(''),undefined);
  for(const url of ['ftp://example.com','https://example.com/path','https://a:b@example.com','https://example.com/?secret=yes']) assert.throws(()=>siteOrigin(url));
});

test('configured metadata publishes all 39 canonical pages and its sitemap reference', async()=>{
  const {default:sitemap}=await import('../src/app/sitemap');
  const {default:robots}=await import('../src/app/robots');
  const previous=process.env.NEXT_PUBLIC_SITE_URL;
  try {
    process.env.NEXT_PUBLIC_SITE_URL='https://qa.example.com/';
    const urls=sitemap().map(entry=>entry.url);
    assert.equal(urls.length,39);
    assert.equal(new Set(urls).size,39);
    assert.ok(urls.every(url=>url.startsWith('https://qa.example.com')));
    assert.equal(robots().sitemap,'https://qa.example.com/sitemap.xml');
  } finally {
    if(previous===undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL=previous;
  }
});
