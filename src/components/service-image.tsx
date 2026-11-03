import Image from 'next/image';
import imagery from '@/data/service-imagery.json';

export const categoryImages: Record<string, string> = {
  love: 'love-relationship-guidance',
  readings: 'palm-reading',
  spiritual: 'energy-cleansing',
  career: 'career-guidance',
  wellbeing: 'spiritual-healing',
};

export default function ServiceImage({ slug, alt = '', priority = false }: { slug: string; alt?: string; priority?: boolean }) {
  const asset = imagery.find(image => image.slug === slug);
  if (!asset) return null;
  return <div className="service-image" data-service-image={slug}>
    <Image src={asset.src} alt={alt} fill sizes="(max-width: 760px) 88vw, (max-width: 1100px) 44vw, 32vw" loading={priority?"eager":"lazy"}/>
  </div>;
}
