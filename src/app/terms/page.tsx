import { pageMetadata } from '@/lib/seo';
import Home from '@/components/home';
export const metadata = pageMetadata(
  '/terms',
  'Terms of Use',
  'Understand the scope of AstroVision’s traditional and belief-based guidance.',
);
export default function Page() { return <Home page="terms"/>; }
