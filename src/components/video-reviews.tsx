'use client';

import videos from '@/data/video-reviews.json';
import { useLanguage } from './language-provider';

export function VideoReviews() {
  const { t } = useLanguage();

  return <section className="video-reviews" aria-labelledby="video-reviews-heading">
    <h2 id="video-reviews-heading">{t('Video Reviews')}</h2>
    <div className="video-review-grid">
      {videos.map((video, index) => {
        const title = `${t('Video review')} ${index + 1}`;
        return <figure className="video-review-card" key={video.src}>
          <video controls playsInline preload="metadata" width={video.width} height={video.height} aria-label={title}>
            <source src={video.src} type="video/mp4"/>
            <a href={video.src}>{t('Open video')}</a>
          </video>
          <figcaption><h3>{title}</h3><a className="text-link" href={video.src}>{t('Open video')}<span className="sr-only">: {title}</span></a></figcaption>
        </figure>;
      })}
    </div>
  </section>;
}
