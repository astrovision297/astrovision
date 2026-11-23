import { JsonLd } from './json-ld';
import { siteOrigin } from '@/lib/site-origin';

export function DetailBreadcrumbs({ section, title }: { section: 'services' | 'blog'; title: string }) {
  const origin = siteOrigin();
  if (!origin) return null;

  return <JsonLd data={{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: new URL('/', origin).href },
      { '@type': 'ListItem', position: 2, name: section === 'services' ? 'Services' : 'Journal', item: new URL(`/${section}`, origin).href },
      { '@type': 'ListItem', position: 3, name: title },
    ],
  }} />;
}
