import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { services } from '@/data/content';
import imagery from '@/data/service-imagery.json';
import { DetailBreadcrumbs } from '@/components/detail-breadcrumbs';
import { ServiceDetail } from '@/components/home';
import { pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find(service => service.slug === slug);
  if (!service) notFound();

  const image = imagery.find(asset => asset.slug === slug);
  return pageMetadata(`/services/${slug}`, `${service.title} in Nicosia`, service.description, image?.src);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const service = services.find(service => service.slug === slug);
  if (!service) notFound();

  return <><DetailBreadcrumbs section="services" title={service.title} /><ServiceDetail slug={slug} /></>;
}
