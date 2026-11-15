import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import BackgroundMusic from '@/components/background-music';
import Celestial from '@/components/celestial';
import { LanguageProvider } from '@/components/language-provider';

const heading = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-heading' });
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const hindi = Noto_Sans_Devanagari({ subsets: ['devanagari'], weight: ['400', '500', '600'], variable: '--font-hindi', display: 'swap' });
export const metadata: Metadata = { title: { default: 'AstroVision | Personal Astrology & Spiritual Guidance', template: '%s | AstroVision' }, icons: { icon: '/images/astro-vision-logo.webp', apple: '/images/astro-vision-logo.webp' }, description: 'Traditional astrology and spiritual guidance. A calm space for your questions about relationships, work, and life.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en" data-scroll-behavior="smooth"><body className={`${heading.variable} ${body.variable} ${hindi.variable}`}><LanguageProvider><Celestial/><BackgroundMusic/>{children}</LanguageProvider></body></html>; }
