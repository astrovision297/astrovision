import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { services } from '@/data/content';
import { ServiceDetail } from '@/components/home';
export const dynamicParams = false;
export function generateStaticParams(){return services.map(s=>({slug:s.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const service=services.find(s=>s.slug===slug);return {title:service?.title||'Service not found',description:service?.description};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!services.some(s=>s.slug===slug))notFound();return <ServiceDetail slug={slug}/>;}
