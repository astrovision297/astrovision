import { articles, services } from '../data/content';

export const artThemes = ['home', 'about', 'services', 'how-it-works', 'reviews', 'contact', 'book', 'horoscope', 'blog', 'faq', 'privacy', 'terms'] as const;
export type ArtTheme = typeof artThemes[number];
export function pageArt(path: string): ArtTheme {
  const section = path.split('/')[1] || 'home';
  return artThemes.includes(section as ArtTheme) ? section as ArtTheme : 'faq';
}

// Stable route seeds keep compositions identical across reloads and poster capture.
export function pageVariant(path: string): number {
  const parts = path.split('/').filter(Boolean);
  if (parts.length < 2) return 0;
  let hash = 2166136261;
  for (const character of parts.join('/')) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0) || 1;
}

export type SceneMotif = ArtTheme | 'love' | 'readings' | 'spiritual' | 'career' | 'wellbeing' | 'preparation' | 'moon' | 'calm';
export type PageSceneConfig = { id: string; theme: ArtTheme; motif: SceneMotif; seed: number; edition: number; poster: string };
export function pageScene(path: string): PageSceneConfig {
  const theme = pageArt(path);
  const slug = path.split('/').filter(Boolean)[1];
  const service = theme === 'services' ? services.find(item => item.slug === slug) : undefined;
  const article = theme === 'blog' ? articles.find(item => item.slug === slug) : undefined;
  const articleMotifs = ['preparation', 'moon', 'calm'] as const;
  const detail = service || article;
  const id = detail ? `${theme}-${detail.slug}` : theme;
  return {
    id, theme,
    motif: service ? service.category as SceneMotif : article ? articleMotifs[articles.indexOf(article)] : theme,
    seed: pageVariant(path),
    edition: service ? services.filter(item => item.category === service.category).indexOf(service) : 0,
    poster: theme === 'home' ? '/images/jyotisha-poster.svg' : `/images/scenes/${id}-astrology.webp`,
  };
}
export const sceneRoutes = [
  ...artThemes.filter(theme => theme !== 'home').map(theme => `/${theme}`),
  ...services.map(service => `/services/${service.slug}`),
  ...articles.map(article => `/blog/${article.slug}`),
];
