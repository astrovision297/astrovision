import Home from '@/components/home';
import { JsonLd } from '@/components/json-ld';
import { site } from '@/data/site';
import { brandName, homeDescription, homeTitle, logoPath, pageMetadata } from '@/lib/seo';
import { siteOrigin } from '@/lib/site-origin';

export const metadata = pageMetadata('/', homeTitle, homeDescription);

export default function Page() {
  const origin = siteOrigin();
  if (!origin) return <Home />;

  const url = new URL('/', origin).href;
  const businessId = `${url}#business`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${url}#website`,
        url,
        name: brandName,
        alternateName: site.name,
        inLanguage: 'en',
        publisher: { '@id': businessId },
      },
      {
        '@type': 'LocalBusiness',
        '@id': businessId,
        url,
        name: brandName,
        alternateName: site.name,
        description: homeDescription,
        logo: new URL(logoPath, origin).href,
        address: {
          '@type': 'PostalAddress',
          streetAddress: site.address.street,
          addressLocality: site.address.city,
          postalCode: site.address.postalCode,
          addressCountry: site.address.countryCode,
        },
        hasMap: site.maps,
        sameAs: [site.instagram, site.facebook],
        ...(site.phone && { telephone: site.phone }),
        ...(site.email && { email: site.email }),
      },
    ],
  };

  return <><JsonLd data={structuredData} /><Home /></>;
}
