import { pageMetadata } from '@/lib/seo';
import Home from '@/components/home';
export const metadata = pageMetadata(
  '/horoscope',
  'Daily Zodiac Reflections & Sun Sign Finder',
  'Explore daily zodiac reflections, find your sun sign, or request a personal birth-chart reading.',
);
export default function Page() { return <Home page="horoscope"/>; }
