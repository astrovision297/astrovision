'use client';

import { ArrowUpRight, Instagram, MessageCircle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { site } from '@/data/site';
import { whatsappUrl } from '@/lib/whatsapp';
import { useLanguage } from './language-provider';

export function External({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export function Enquire({ service = 'a consultation', iconOnly = false, className = 'button whatsapp' }: {
  service?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const { t } = useLanguage();
  const url = whatsappUrl(site.whatsapp, `Hello AstroVision, I would like to know more about ${service}. Please let me know the next step.`);
  return <span className="contact-options">
    {url && <External href={url} className={className}>
      <MessageCircle size={17} aria-hidden="true"/>
      <span className={iconOnly ? 'sr-only' : undefined}>{t('WhatsApp')}</span>
      {!iconOnly && <ArrowUpRight size={16} aria-hidden="true"/>}
    </External>}
    <External href={site.instagram} className={className.replace('whatsapp', 'outline')}>
      <Instagram size={17} aria-hidden="true"/>
      <span className={iconOnly ? 'sr-only' : undefined}>{t('Instagram')}</span>
      {!iconOnly && <ArrowUpRight size={16} aria-hidden="true"/>}
    </External>
  </span>;
}

export function Call({ iconOnly = false }: { iconOnly?: boolean }) {
  const { t } = useLanguage();
  return site.phone && <a className="call-link" href={`tel:${site.phone}`}>
    <Phone size={15} aria-hidden="true"/><span className={iconOnly ? 'sr-only' : undefined}>{t('Call now')}</span>
  </a>;
}
