import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import BackgroundMusic from '@/components/background-music';
import Celestial from '@/components/celestial';
import { LanguageProvider } from '@/components/language-provider';
import { brandName, homeDescription, homeTitle, logoPath } from '@/lib/seo';

const heading = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-heading' });
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const hindi = Noto_Sans_Devanagari({ subsets: ['devanagari'], weight: ['400', '500', '600'], variable: '--font-hindi', display: 'swap' });
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  title: { default: `${homeTitle} | ${brandName}`, template: `%s | ${brandName}` },
  description: homeDescription,
  icons: { icon: logoPath, apple: logoPath },
  ...(googleVerification && { verification: { google: googleVerification } }),
  ...(process.env.VERCEL_ENV === 'preview' && { robots: { index: false } }),
};
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en" data-scroll-behavior="smooth"><body className={`${heading.variable} ${body.variable} ${hindi.variable}`}><LanguageProvider><Celestial/><BackgroundMusic/>{children}</LanguageProvider></body></html>; }
