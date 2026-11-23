import { pageMetadata } from '@/lib/seo';
import Home from '@/components/home';
export const metadata = pageMetadata(
  '/contact',
  'Contact & Directions in Nicosia',
  'Find AstroVision on Ledras Street in Nicosia, Cyprus, and get in touch via WhatsApp or Instagram to ask about a consultation.',
);
export default function Page() { return <Home page="contact"/>; }
