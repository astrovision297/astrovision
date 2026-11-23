import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { zodiac } from '../src/data/content';
import { dailyReading } from '../src/data/daily-readings';

test('each sign gets 14 distinct localized readings before the cycle repeats', () => {
  const translations = ['en', 'el', 'fr', 'nl', 'tr', 'hi'].map(locale => (
    JSON.parse(readFileSync(`public/locales/${locale}.json`, 'utf8')) as Record<string, string>
  ));
  const allReadings = new Set<string>();
  for (const [sign] of zodiac) {
    const cycle = Array.from({ length: 14 }, (_, day) => dailyReading(sign, `2026-07-${String(day + 1).padStart(2, '0')}`));
    assert.equal(new Set(cycle).size, 14, sign);
    assert.equal(dailyReading(sign, '2026-07-15'), cycle[0]);
    for (const reading of cycle) {
      assert.ok(reading, sign);
      for (const [index, dictionary] of translations.entries()) {
        assert.ok(dictionary[reading]?.trim(), reading);
        if (index > 0) assert.notEqual(dictionary[reading], reading);
      }
      allReadings.add(reading);
    }
  }
  assert.equal(allReadings.size, 168);
});
