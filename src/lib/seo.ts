import type { Metadata } from 'next';
import { siteOrigin } from './site-origin';

export const brandName = 'AstroVision';
export const logoPath = '/images/astro-vision-logo.webp';
export const homeTitle = 'Vedic Astrology in Nicosia, Cyprus';
export const homeDescription = 'AstroVision offers Vedic astrology, palm readings, horoscope matching and spiritual guidance. Book a consultation in Nicosia, Cyprus, or online.';

export function pageMetadata(path: string, title: string, description: string, image = '/images/ganesha-hero.webp'): Metadata {
  const origin = siteOrigin();
  const displayTitle = `${title} | ${brandName}`;

  return {
    title: path === '/' ? { absolute: displayTitle } : title,
    description,
    ...(origin && {
      alternates: { canonical: new URL(path, origin) },
      openGraph: {
        type: 'website',
        url: new URL(path, origin),
        siteName: brandName,
        title: displayTitle,
        description,
        images: [new URL(image, origin)],
      },
      twitter: { card: 'summary_large_image' },
    }),
  };
}
