import { pageMetadata } from '@/lib/seo';
import Home from '@/components/home';
export const metadata = pageMetadata(
  '/services',
  'Astrology Readings & Services in Nicosia',
  'Explore birth-chart readings, palm reading, horoscope matching, relationship guidance and spiritual consultations with AstroVision in Nicosia.',
);
export default function Page() { return <Home page="services"/>; }
