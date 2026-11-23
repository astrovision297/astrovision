import { pageMetadata } from '@/lib/seo';
import Home from '@/components/home';
export const metadata = pageMetadata(
  '/about',
  'About Our Astrology Practice in Nicosia',
  'Learn about our approach to Vedic astrology and what to expect from a personal consultation on Ledras Street in Nicosia or online.',
);
export default function Page() { return <Home page="about"/>; }
