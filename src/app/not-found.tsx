'use client';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
export default function NotFound(){const {localize}=useLanguage();return localize(<section className="error-page"><p className="brand-gold">404 · A DIFFERENT PATH</p><h1>Let’s find your way back.</h1><p>The page you are looking for is not here.</p><div className="actions"><Link className="button" href="/">Return home</Link><Link className="button outline" href="/services">Explore services</Link></div></section>);}
