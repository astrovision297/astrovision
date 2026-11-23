import { pageMetadata } from '@/lib/seo';
import Home from '@/components/home';
export const metadata = pageMetadata(
  '/book',
  'Book an Astrology Consultation',
  'Request a personal astrology reading with AstroVision in Nicosia or online. Share your preferences and send your enquiry by WhatsApp.',
);
export default function Page() { return <Home page="book"/>; }
