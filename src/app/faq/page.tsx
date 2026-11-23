import { pageMetadata } from '@/lib/seo';
import Home from '@/components/home';
export const metadata = pageMetadata(
  '/faq',
  'Astrology Consultation FAQs',
  'Find answers about booking an astrology reading, preparing your birth details, privacy and online consultations.',
);
export default function Page() { return <Home page="faq"/>; }
