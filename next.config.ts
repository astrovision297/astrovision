import type { NextConfig } from 'next';

const config: NextConfig = {
  async headers() {
    return [
      // Cache public media without overriding Next.js page or image responses.
      ...['/images/:path*', '/videos/:path*'].map(source => ({
        source,
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400' }],
      })),
      {
        // Audio filenames contain a content hash; a new recording gets a new URL.
        source: '/audio/background-music-:hash([a-f0-9]+).mp3',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/locales/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400' }],
      },
    ];
  },
};

export default config;
