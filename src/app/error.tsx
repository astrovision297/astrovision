'use client';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
export default function ErrorPage({reset}:{reset:()=>void}){const {localize}=useLanguage();return localize(<section className="error-page"><h1>A moment to reconnect.</h1><p>We couldn’t load this page. Please try again.</p><div className="actions"><button className="button" onClick={reset}>Try again</button><Link href="/" className="button outline">Return home</Link></div></section>);}
