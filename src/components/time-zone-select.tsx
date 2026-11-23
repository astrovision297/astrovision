import { useEffect, useState } from 'react';
import { consultationTimeZone } from '@/lib/time-zone';

const fallbackZones = [
  'Africa/Johannesburg', 'America/Chicago', 'America/Los_Angeles', 'America/New_York', 'America/Sao_Paulo',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney',
  'Europe/Athens', 'Europe/Istanbul', 'Europe/London', 'Europe/Paris', 'Pacific/Auckland',
];

type ZoneGroups = Record<string, string[]>;

function availableZones(): ZoneGroups {
  const zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : fallbackZones;
  const visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const groups: ZoneGroups = {};

  for (const zone of [...new Set([...zones, visitorZone])].sort()) {
    if (!zone.includes('/') || [consultationTimeZone, 'Asia/Nicosia'].includes(zone)) continue;
    const region = zone.split('/')[0];
    (groups[region] ??= []).push(zone);
  }

  return groups;
}

export function TimeZoneSelect({ invalid, onChange }: { invalid: boolean; onChange: (zone: string) => void }) {
  const [groups, setGroups] = useState<ZoneGroups>({});
  useEffect(() => { setGroups(availableZones()); }, []);

  return (
    <select
      name="timezone"
      defaultValue={consultationTimeZone}
      aria-invalid={invalid}
      aria-describedby={invalid ? 'timezone-error' : undefined}
      onChange={event => onChange(event.target.value)}
      required
      translate="no"
    >
      <option value={consultationTimeZone}>{consultationTimeZone}</option>
      <option value="UTC">UTC</option>
      {Object.entries(groups).map(([region, zones]) => (
        <optgroup key={region} label={region}>
          {zones.map(zone => (
            <option key={zone} value={zone}>{zone.slice(region.length + 1).replaceAll('_', ' ')}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
