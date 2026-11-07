import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { services, groups, questions } from '../src/data/content';
import { reviews, faqs, facebookLinks } from '../src/data/site';
import { countries, filterCountries } from '../src/data/countries';
import imagery from '../src/data/service-imagery.json';

const requested = ['health-medical-astrology', 'numerology-consultation', 'tarot-guidance-divination', 'vastu-shastri-consultation', 'family-disputes', 'childrens-astrology', 'foreign-settlement-travel-guidance'];
test('requested offerings are bookable catalogue entries with valid groups and local illustrations', () => {
  assert.equal(services.length, 30);
  assert.equal(new Set(services.map(service => service.slug)).size, services.length);
  for (const slug of requested) assert.ok(services.some(service => service.slug === slug), slug);
  assert.equal(services.find(service => service.slug === 'family-disputes')?.title, 'Family Problem Solutions');
  for (const service of services) {
    assert.ok(groups.some(group => group.id === service.category), service.slug);
    const asset = imagery.find(image => image.slug === service.slug);
    assert.ok(asset, service.slug);
    assert.ok(existsSync(`public${asset.src}`), asset.src);
  }
  assert.equal(new Set(imagery.map(asset => asset.src)).size, services.length);
  assert.equal(new Set(imagery.map(asset => readFileSync(`public${asset.src}`).toString('base64'))).size, services.length);
});

test('retained client testimonials have distinct content and both Facebook links are retained', () => {
  assert.equal(reviews.length, 12);
  assert.equal(new Set(reviews.map(review => review.name.normalize().trim().toLowerCase())).size, reviews.length);
  assert.equal(new Set(reviews.map(review => review.text.trim().toLowerCase())).size, reviews.length);
  assert.ok(facebookLinks.some(href => href.includes('1DoTsR1PZE')));
  assert.ok(facebookLinks.some(href => href.includes('1FL1nvAmwy')));
});

test('all guarantee FAQ copies use the requested client wording', () => {
  const answer = 'Vedic Astrology is a profound science. With accurate birth details, the readings are remarkably precise and insightful';
  assert.equal(questions.find(([, question]) => question === 'Are outcomes guaranteed?')?.[2], answer);
  assert.equal(faqs.find(([question]) => question === 'Are results guaranteed?')?.[1], answer);
});

test('country browser combines region and localized search, including common aliases', () => {
  assert.equal(countries.length, 37);
  assert.equal(new Set(countries.map(country => country.code)).size, 37);
  assert.equal(filterCountries('Europe', '').length, 9);
  assert.equal(filterCountries('all', '  UAE ')[0]?.code, 'AE');
  assert.equal(filterCountries('all', 'USA')[0]?.code, 'US');
  assert.equal(filterCountries('all', 'UK')[0]?.code, 'GB');
  assert.equal(filterCountries('Europe', 'India').length, 0);
  assert.equal(filterCountries('all', 'Κύπρος', code => code === 'CY' ? 'Κύπρος' : code)[0]?.code, 'CY');
  assert.equal(filterCountries('all', 'no-such-country').length, 0);
});
