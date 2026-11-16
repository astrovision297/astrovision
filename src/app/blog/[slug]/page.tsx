import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articles } from '@/data/content';
import { ArticleDetail } from '@/components/home';
export const dynamicParams = false;
export function generateStaticParams(){return articles.map(a=>({slug:a.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const article=articles.find(a=>a.slug===slug);return {title:article?.title||'Article not found',description:article?.intro};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!articles.some(a=>a.slug===slug))notFound();return <ArticleDetail slug={slug}/>;}
