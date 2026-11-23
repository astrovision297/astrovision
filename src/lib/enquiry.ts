import { zonedDateTime } from './time-zone';

function possibleAppointmentTimes(date: string, time: string, timeZone: string) {
  const localAsUtc = Date.parse(`${date}T${time}Z`);
  if (!Number.isFinite(localAsUtc)) return [];

  // Check the offsets on either side of the date so repeated and skipped hours are handled.
  const day = 86_400_000;
  return [localAsUtc - day, localAsUtc + day].flatMap(reference => {
    const nearby = zonedDateTime(new Date(reference), timeZone);
    const offset = Date.parse(`${nearby.date}T${nearby.time}Z`) - reference;
    const candidate = localAsUtc - offset;
    const local = zonedDateTime(new Date(candidate), timeZone);
    return local.date === date && local.time === time ? [candidate] : [];
  });
}

// Validate locally before any personal details enter a prepared message.
export function validateEnquiry(data: FormData, birthChart = false, now = new Date()) {
  const value = (name: string) => String(data.get(name) ?? '').trim();
  const errors: Record<string, string> = {};
  if (!value('name')) errors.name = 'Enter your name, using more than spaces.';
  const phone = value('phone');
  const digits = phone.replace(/\D/g, '');
  if (!/^\+?[\d() .-]+$/.test(phone) || digits.length < 7 || digits.length > 15 || /^0+$/.test(digits)) {
    errors.phone = 'Enter a phone number with country code and 7–15 digits.';
  }
  const timezone = value('timezone');
  let localNow: ReturnType<typeof zonedDateTime> | undefined;
  try {
    if (!timezone) throw new Error('Empty time zone');
    localNow = zonedDateTime(now, timezone);
  } catch {
    errors.timezone = 'Enter a valid time zone, such as Europe/Nicosia.';
  }
  if (birthChart && !value('birthplace')) errors.birthplace = 'Enter your birth city and country, using more than spaces.';
  const date = value('date');
  const time = value('time');
  if (localNow && date) {
    if (date < localNow.date) errors.date = 'Choose today or a future date in your time zone.';
    else if (time) {
      const possibleTimes = possibleAppointmentTimes(date, time, timezone);
      if (!possibleTimes.length) errors.time = 'Choose a time that exists on this date in your time zone.';
      else if (possibleTimes.every(candidate => candidate <= now.getTime())) {
        errors.time = 'Choose a time that is still ahead in your time zone.';
      }
    }
  }
  return errors;
}
