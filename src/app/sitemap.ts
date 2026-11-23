import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site-origin';
import { services, articles } from '@/data/content';
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  if (!origin) return [];

  const paths = [
    '/', '/about', '/services', '/how-it-works', '/reviews', '/faq', '/contact', '/book', '/horoscope', '/blog', '/privacy', '/terms',
    ...services.map(service => `/services/${service.slug}`),
    ...articles.map(article => `/blog/${article.slug}`),
  ];

  return paths.map(path => ({ url: new URL(path, origin).href }));
}
