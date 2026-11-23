import { pageMetadata } from '@/lib/seo';
import Home from '@/components/home';
export const metadata = pageMetadata(
  '/reviews',
  'Astrology Consultation Reviews',
  'Read and watch client experiences from AstroVision’s astrology consultations. Visit the Nicosia Google Maps listing for current reviews.',
);
export default function Page() { return <Home page="reviews"/>; }
