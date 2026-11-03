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
  try {
    if (!timezone) throw new Error('Empty time zone');
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format(now);
  } catch {
    errors.timezone = 'Enter a valid time zone, such as Europe/Nicosia.';
  }
  if (birthChart && !value('birthplace')) errors.birthplace = 'Enter your birth city and country, using more than spaces.';
  if (!errors.timezone && value('date')) {
    // Compare wall-clock values in the visitor's chosen zone, including DST.
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(now);
    const part = (type: string) => parts.find(p => p.type === type)?.value;
    const today = `${part('year')}-${part('month')}-${part('day')}`;
    if (value('date') < today) errors.date = 'Choose today or a future date in your time zone.';
    else if (value('date') === today && value('time') && value('time') <= `${part('hour')}:${part('minute')}`) {
      errors.time = 'Choose a time that is still ahead in your time zone.';
    }
  }
  return errors;
}
