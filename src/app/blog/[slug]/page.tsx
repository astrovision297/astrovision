import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articles } from '@/data/content';
import { DetailBreadcrumbs } from '@/components/detail-breadcrumbs';
import { ArticleDetail } from '@/components/home';
import { pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find(article => article.slug === slug);
  if (!article) notFound();

  return pageMetadata(`/blog/${slug}`, article.searchTitle, article.searchDescription, article.image);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const article = articles.find(article => article.slug === slug);
  if (!article) notFound();

  return <><DetailBreadcrumbs section="blog" title={article.title} /><ArticleDetail slug={slug} /></>;
}
