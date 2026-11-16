'use client';

import { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import videos from '@/data/video-reviews.json';
import { useLanguage } from './language-provider';

function ReviewPlayer({ video, title }: { video: typeof videos[number]; title: string }) {
  const { t } = useLanguage();
  const player = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  return <div className="video-player">
    <video ref={player} controls={started} playsInline preload="none" poster={video.poster} width={video.width} height={video.height} style={{ aspectRatio: `${video.width} / ${video.height}` }} aria-label={title} onPlay={() => setStarted(true)}>
      <source src={video.src} type="video/mp4"/>
      <a href={video.src}>{t('Open video')}</a>
    </video>
    {!started && <button type="button" className="video-play" aria-label={`${t('Play video')}: ${title}`} onClick={() => {
      setStarted(true);
      void player.current?.play().catch(() => setStarted(false));
    }}><Play size={26} fill="currentColor" aria-hidden="true"/><span>{t('Play video')}</span></button>}
  </div>;
}

export function VideoReviews() {
  const { t } = useLanguage();

  return <section className="video-reviews" aria-labelledby="video-reviews-heading">
    <h2 id="video-reviews-heading">{t('Video Reviews')}</h2>
    <div className="video-review-grid">
      {videos.map((video, index) => {
        const title = `${t('Video review')} ${index + 1}`;
        return <figure className="video-review-card" key={video.src}>
          <ReviewPlayer video={video} title={title}/>
          <figcaption><h3>{title}</h3><a className="text-link" href={video.src}>{t('Open video')}<span className="sr-only">: {title}</span></a></figcaption>
        </figure>;
      })}
    </div>
  </section>;
}
