import { pageMetadata } from '@/lib/seo';
import Home from '@/components/home';
export const metadata = pageMetadata(
  '/privacy',
  'Privacy Policy',
  'How AstroVision’s website handles enquiry information and third-party services.',
);
export default function Page() { return <Home page="privacy"/>; }
