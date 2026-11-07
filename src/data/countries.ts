export const regions = ['Africa', 'Asia & Gulf', 'Oceania', 'Europe', 'North America'] as const;
export type Region = typeof regions[number];
export const countries: { code: string; name: string; region: Region }[] = [
  ['MU', 'Mauritius', 'Africa'], ['ZA', 'South Africa', 'Africa'], ['KE', 'Kenya', 'Africa'],
  ['TZ', 'Tanzania', 'Africa'], ['UG', 'Uganda', 'Africa'], ['NG', 'Nigeria', 'Africa'],
  ['GH', 'Ghana', 'Africa'], ['ZM', 'Zambia', 'Africa'], ['ZW', 'Zimbabwe', 'Africa'],
  ['BW', 'Botswana', 'Africa'], ['NA', 'Namibia', 'Africa'],
  ['IN', 'India', 'Asia & Gulf'], ['LK', 'Sri Lanka', 'Asia & Gulf'], ['SG', 'Singapore', 'Asia & Gulf'],
  ['MY', 'Malaysia', 'Asia & Gulf'], ['AE', 'United Arab Emirates', 'Asia & Gulf'], ['QA', 'Qatar', 'Asia & Gulf'],
  ['SA', 'Saudi Arabia', 'Asia & Gulf'], ['KW', 'Kuwait', 'Asia & Gulf'], ['OM', 'Oman', 'Asia & Gulf'],
  ['BH', 'Bahrain', 'Asia & Gulf'], ['NP', 'Nepal', 'Asia & Gulf'], ['BD', 'Bangladesh', 'Asia & Gulf'],
  ['FJ', 'Fiji', 'Oceania'], ['AU', 'Australia', 'Oceania'], ['NZ', 'New Zealand', 'Oceania'],
  ['GB', 'United Kingdom', 'Europe'], ['FR', 'France', 'Europe'], ['DE', 'Germany', 'Europe'],
  ['IT', 'Italy', 'Europe'], ['NL', 'Netherlands', 'Europe'], ['BE', 'Belgium', 'Europe'],
  ['IE', 'Ireland', 'Europe'], ['CH', 'Switzerland', 'Europe'], ['CY', 'Cyprus', 'Europe'],
  ['US', 'United States', 'North America'], ['CA', 'Canada', 'North America'],
].map(([code, name, region]) => ({ code, name, region: region as Region }));

export function filterCountries(region: string, query: string, displayName: (code: string) => string = code => code) {
  const term = query.trim().toLocaleLowerCase();
  return countries.filter(country => (region === 'all' || country.region === region)
    && `${country.name} ${country.code} ${displayName(country.code)} ${country.code === 'AE' ? 'UAE' : country.code === 'GB' ? 'UK' : country.code === 'US' ? 'USA' : ''}`.toLocaleLowerCase().includes(term));
}
