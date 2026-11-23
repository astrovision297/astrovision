'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUp, ArrowUpRight, ChevronDown, MapPin, Menu, Settings2, X } from 'lucide-react';
import { groups } from '@/data/content';
import { site } from '@/data/site';
import BackgroundMusic from './background-music';
import Celestial from './celestial';
import { FacebookLinks } from './client-revisions';
import { Call, Enquire, External } from './contact-links';
import { LanguageSwitcher, useLanguage } from './language-provider';

const nav = [['Home', '/'], ['About', '/about'], ['Services', '/services'], ['How It Works', '/how-it-works'], ['Reviews', '/reviews'], ['Contact', '/contact']];
const extraNav = [['Daily Horoscope', '/horoscope'], ['Journal', '/blog'], ['FAQ', '/faq']];
type Panel = 'navigation' | 'more' | 'media';

export function SiteShell({ children }: { children: ReactNode }) {
  const { localize } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState<Panel | null>(null);
  const [paused, setPaused] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const moreButton = useRef<HTMLButtonElement>(null);
  const mediaButton = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const more = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpen(null); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const button = open === 'navigation' ? menuButton : open === 'more' ? moreButton : mediaButton;
    const panel = open === 'navigation' ? navigation : open === 'more' ? more : media;
    const closeOutside = (event: Event) => {
      if (event.target instanceof Node && !panel.current?.contains(event.target) && !button.current?.contains(event.target)) {
        setOpen(null);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(null);
        button.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const toggle = (panel: Panel) => setOpen(current => current === panel ? null : panel);
  const renderLink = ([name, href]: string[]) => (
    <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}
      onClick={() => setOpen(null)}>{name}</Link>
  );

  return <>
    <Celestial paused={paused}/>
    {localize(<>
      <a href="#main" className="skip">Skip to content</a>
      <div className="topline" id="top"><span><MapPin size={12} aria-hidden="true"/> NICOSIA, CYPRUS <i/> ONLINE CONSULTATIONS WORLDWIDE</span></div>
      <header className="site-header">
        <Link href="/" className="brand" translate="no" onClick={() => setOpen(null)}>
          <Image src="/images/astro-vision-logo.webp" alt="" width={48} height={48}/>
          <span>Astro<span className="brand-gold">Vision</span><small>CLARITY · CONNECTION · GUIDANCE</small></span>
        </Link>
        <div className="header-actions">
          <LanguageSwitcher/>
          <Link href="/book" className="button compact" onClick={() => setOpen(null)}>Book Appointment <ArrowUpRight size={15}/></Link>
          <button ref={mediaButton} className="header-icon" type="button" aria-label="Media settings" aria-expanded={open === 'media'}
            aria-controls="media-settings" onClick={() => toggle('media')}>
            <Settings2 size={19} aria-hidden="true"/>
          </button>
          <div ref={media} className="media-settings" id="media-settings" hidden={open !== 'media'}>
            <BackgroundMusic/>
            <button className="motion-toggle" type="button" onClick={() => setPaused(value => !value)}>
              <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>{paused ? 'Resume animation' : 'Pause animation'}
            </button>
          </div>
          <button ref={menuButton} className="header-icon menu-toggle" type="button" aria-expanded={open === 'navigation'}
            aria-controls="main-nav" aria-label={open === 'navigation' ? 'Close menu' : 'Open menu'} onClick={() => toggle('navigation')}>
            {open === 'navigation' ? <X size={22} aria-hidden="true"/> : <Menu size={22} aria-hidden="true"/>}
          </button>
        </div>
        <nav ref={navigation} id="main-nav" aria-label="Main navigation" className={open === 'navigation' ? 'is-open' : ''}>
          {nav.map(renderLink)}
          <div className="nav-more" ref={more}>
            <button ref={moreButton} type="button" aria-label="More pages" aria-expanded={open === 'more'} aria-controls="more-pages"
              onClick={() => toggle('more')}>More <ChevronDown size={12} aria-hidden="true"/></button>
            <div id="more-pages" hidden={open !== 'more'}>{extraNav.map(renderLink)}</div>
          </div>
          <div className="mobile-nav-extras">{extraNav.map(renderLink)}</div>
        </nav>
      </header>
    </>)}
    <main id="main" tabIndex={-1}>{children}</main>
    <Footer/>
    {localize(<div className="mobile-contact">
      <Link className="button" href="/book" onClick={() => setOpen(null)}>Book Appointment <ArrowUpRight size={15} aria-hidden="true"/></Link>
      <Enquire className="mobile-chat" iconOnly/>
      <Call iconOnly/>
    </div>)}
  </>;
}
function Footer() {
  const { localize } = useLanguage();
  return localize(<footer className="footer">
    <div className="footer-main container">
      <div className="footer-brand">
        <Link href="/" className="brand" translate="no">
          <Image src="/images/astro-vision-logo.webp" alt="" width={60} height={60}/>
          <span>Astro<span className="brand-gold">Vision</span></span>
        </Link>
        <p>Ancient wisdom. A personal perspective.<br/>A little more clarity for your journey.</p>
        <div className="social-row">
          <Enquire className="footer-chat" iconOnly/>
          <External href={site.maps}><MapPin size={18} aria-hidden="true"/><span className="sr-only">Google Maps</span></External>
          <FacebookLinks/>
        </div>
      </div>
      <div>
        <h3>Explore</h3>
        {[...nav.slice(1), ...extraNav].map(([name, href]) => <Link key={href} href={href}>{name}</Link>)}
      </div>
      <div>
        <h3>Our guidance</h3>
        {groups.map(group => <Link key={group.id} href={`/services?category=${group.id}`} prefetch={false}>{group.title}</Link>)}
        <Link href="/book">Book an appointment</Link>
      </div>
      <div>
        <h3>Find us</h3>
        <External href={site.maps}>{site.location}</External>
        <p>Consultations by arrangement<br/>Time zone: Europe/Nicosia</p>
        {site.hours && <p>{site.hours}</p>}
        {site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}
        {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
        <p className="footer-languages">Read this website in your language using the language selector.</p>
      </div>
    </div>
    <div className="footer-fine container">
      <p>{site.disclaimer}</p>
      <div>
        <span>© {new Date().getFullYear()} AstroVision</span>
        <span><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Use</Link></span>
        <a href="#top">Back to top <ArrowUp size={14} aria-hidden="true"/></a>
      </div>
    </div>
  </footer>);
}
