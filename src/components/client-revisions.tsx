'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowUpRight, Globe2, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { countries, filterCountries, regions } from '@/data/countries';
import { facebookLinks, site } from '@/data/site';
import { whatsappUrl } from '@/lib/whatsapp';
import { useLanguage } from './language-provider';

export function ClientStats() {
  const { localize } = useLanguage();
  return localize(<div className="client-stats" aria-label="AstroVision experience">
    {site.stats.map(stat => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
  </div>);
}

export function GaneshaHero() {
  const { t } = useLanguage();
  return <div className="ganesha-hero">
    <div className="ganesha-halo" aria-hidden="true"/>
    <Image src="/images/ganesha-hero.webp" alt={t('Lord Ganesha seated on a lotus, surrounded by a golden celestial halo')} fill sizes="(max-width: 760px) 88vw, 44vw" preload/>
    <svg viewBox="0 0 600 600" className="ganesha-zodiac" aria-hidden="true">
      <g fill="none" stroke="currentColor">{[265, 280, 288].map(r => <circle key={r} cx="300" cy="300" r={r}/>)}
        {Array.from({ length: 72 }, (_, i) => <path key={i} d={`M300 12v${i % 6 === 0 ? 15 : 5}`} transform={`rotate(${i * 5} 300 300)`}/>)}</g>
      {['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((sign, i) => <text key={sign} x="300" y="56" transform={`rotate(${i * 30} 300 300)`} textAnchor="middle" fill="currentColor" fontSize="22" fontFamily="Arial, sans-serif">{sign+'\uFE0E'}</text>)}
    </svg>
    <div className="ganesha-planets" aria-hidden="true"><i/><i/><i/></div>
    <span className="ganesha-caption">{t('ANCIENT WISDOM. NEW POSSIBILITIES.')}</span>
  </div>;
}

export function FacebookLinks() {
  const { t } = useLanguage();
  return <div className="facebook-links" role="group" aria-label={t('Facebook links')}>
    <span>{t('Facebook links')}</span>
    {facebookLinks.map((href, i) => <a key={href} href={href} target="_blank" rel="noopener noreferrer">Facebook {i + 1}<ArrowUpRight size={13}/></a>)}
  </div>;
}

export function ClientValues() {
  const { localize } = useLanguage();
  const values = [
    { title: 'Authenticity', text: 'Rooted in Vedic tradition and thoughtful, personal practice.', icon: Sparkles },
    { title: 'Compassion', text: 'Every person is welcomed with empathy, respect, and understanding.', icon: Heart },
    { title: 'Integrity', text: 'Honest guidance, transparent arrangements, and respect for your choices.', icon: ShieldCheck },
    { title: 'Empowerment', text: 'A fresh perspective to help you make your own informed next step.', icon: Globe2 },
  ];
  return localize(<section className="section container values-section"><p className="eyebrow">✦ OUR VALUES</p><h2>Respect, at every step.</h2><div className="values-grid client-values">
    {values.map(({ title, text, icon: Icon }) => <article key={title}><Icon/><h3>{title}</h3><p>{text}</p></article>)}
  </div></section>);
}

export function WorldwideConsultations() {
  const { locale, t, localize } = useLanguage();
  const [region, setRegion] = useState('all');
  const [query, setQuery] = useState('');
  const names = useMemo(() => new Intl.DisplayNames([locale], { type: 'region' }), [locale]);
  const displayName = (code: string) => names.of(code) || code;
  const shown = filterCountries(region, query, displayName);
  return localize(<section className="section container worldwide" aria-labelledby="worldwide-title">
    <div className="worldwide-heading"><Globe2 size={36}/><div><p className="eyebrow">CONNECTED, WHEREVER YOU ARE</p><h2 id="worldwide-title">Personal guidance.<br/><em>Across the world.</em></h2></div></div>
    <p>Connect with AstroVision by video, phone, or WhatsApp. Share your time zone and we’ll arrange a suitable consultation time together.</p>
    <div className="worldwide-toolbar"><div className="filter-row" aria-label="Filter countries by region">
      <button type="button" className={region === 'all' ? 'selected' : ''} aria-pressed={region === 'all'} onClick={() => setRegion('all')}>{t('All regions')} <span>({countries.length})</span></button>
      {regions.map(value => <button type="button" key={value} className={region === value ? 'selected' : ''} aria-pressed={region === value} onClick={() => setRegion(value)}>{t(value)} <span>({countries.filter(country => country.region === value).length})</span></button>)}
    </div><input type="search" aria-label="Search countries" placeholder="Search country, e.g. Cyprus, India, UK…" value={query} onChange={event => setQuery(event.target.value)}/></div>
    <p className="results-count" role="status">{shown.length} {t('countries shown')}</p>
    {regions.map(value => {
      const matches = shown.filter(country => country.region === value);
      return matches.length > 0 && <div className="country-region" key={value}><h3>{value}</h3><div className="country-grid">{matches.map(country => {
        const service = `Online consultation from ${country.name}`;
        const url = whatsappUrl(site.whatsapp, `Hello AstroVision, I would like to arrange an online consultation from ${country.name}. Please help me find a suitable time.`);
        const content = <><span className="country-code" aria-hidden="true">{country.code}</span><span><strong>{displayName(country.code)}</strong><small>Online consultation</small></span><ArrowUpRight size={16}/></>;
        return url ? <a className="country-card" key={country.code} href={url} target="_blank" rel="noopener noreferrer">{content}</a> : <Link className="country-card" key={country.code} href={`/contact?service=${encodeURIComponent(service)}`}>{content}</Link>;
      })}</div></div>;
    })}
    {!shown.length && <div className="empty-state"><h3>No matching countries</h3><p>Try another country or region.</p><button type="button" className="button outline" onClick={() => { setQuery(''); setRegion('all'); }}>Show all countries</button></div>}
    <div className="worldwide-footer"><p>Your country isn’t listed? Get in touch to ask about an online consultation.</p><Link href="/book" className="button">Book an online consultation <ArrowUpRight size={16}/></Link></div>
  </section>);
}
