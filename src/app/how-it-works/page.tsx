import { pageMetadata } from '@/lib/seo';
import Home from '@/components/home';
export const metadata = pageMetadata(
  '/how-it-works',
  'What to Expect from an Astrology Consultation',
  'Find out what to prepare, how the consultation works and how to arrange a Vedic astrology session in Nicosia or online.',
);
export default function Page() { return <Home page="how-it-works"/>; }
