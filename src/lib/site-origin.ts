function configuredOrigin() {
  const explicitOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return explicitOrigin || (vercelDomain ? `https://${vercelDomain}` : undefined);
}

export function siteOrigin(value = configuredOrigin()): string | undefined {
  if (!value?.trim()) return undefined;
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without a path, credentials, query or fragment.');
  }
  return url.origin;
}
