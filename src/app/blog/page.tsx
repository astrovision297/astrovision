import { pageMetadata } from '@/lib/seo';
import Home from '@/components/home';
export const metadata = pageMetadata(
  '/blog',
  'Astrology & Spiritual Guidance Journal',
  'Explore the AstroVision Journal for articles on moon signs, preparing for a birth-chart reading and everyday spiritual reflection.',
);
export default function Page() { return <Home page="blog"/>; }
