'use client';

import { useEffect, useRef, useState } from 'react';
import { Music2, Pause, Play, Volume2 } from 'lucide-react';
import { useLanguage } from './language-provider';

const STORAGE_KEY = 'astrovision-music';

export default function BackgroundMusic() {
  const { t } = useLanguage();
  const audio = useRef<HTMLAudioElement>(null);
  const desired = useRef(true);
  const volumeRef = useRef(0.15);
  const started = useRef(false);
  const generation = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.15);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(false);

  const persist = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: desired.current, volume: volumeRef.current })); } catch { /* Storage is optional. */ }
  };
  const blocked = () => document.hidden || Array.from(document.querySelectorAll('video')).some(video => !video.paused && !video.ended);
  const stop = () => { generation.current++; audio.current?.pause(); };
  const start = async () => {
    const player = audio.current;
    if (!player || !desired.current || blocked()) return;
    const attempt = ++generation.current;
    started.current = true;
    player.volume = volumeRef.current;
    if (!player.getAttribute('src')) player.src = '/audio/background-music-a774483e122d.mp3';
    try {
      await player.play();
      if (attempt === generation.current) setError(false);
    } catch (reason) {
      if (attempt === generation.current && !(reason instanceof DOMException && reason.name === 'AbortError')) setError(true);
    }
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (typeof saved?.enabled === 'boolean') desired.current = saved.enabled;
      if (typeof saved?.volume === 'number' && Number.isFinite(saved.volume)) {
        volumeRef.current = Math.max(0, Math.min(1, saved.volume));
        // Restore through the native media event below rather than during render.
        if (audio.current) audio.current.volume = volumeRef.current;
      }
    } catch { /* Keep the gentle default. */ }
    const firstInteraction = (event: Event) => {
      if (event instanceof KeyboardEvent && !['Enter', ' '].includes(event.key)) return;
      if (event.target instanceof Element && event.target.closest('.media-settings, [aria-controls="media-settings"], video, .video-player')) return;
      document.removeEventListener('click', firstInteraction);
      document.removeEventListener('keydown', firstInteraction);
      void start();
    };
    const sync = (event: Event) => {
      if (event.type !== 'visibilitychange' && !(event.target instanceof HTMLVideoElement)) return;
      if (blocked()) stop();
      else if (started.current && desired.current) void start();
    };
    document.addEventListener('click', firstInteraction);
    document.addEventListener('keydown', firstInteraction);
    document.addEventListener('visibilitychange', sync);
    document.addEventListener('play', sync, true);
    document.addEventListener('pause', sync, true);
    document.addEventListener('ended', sync, true);
    return () => {
      document.removeEventListener('click', firstInteraction);
      document.removeEventListener('keydown', firstInteraction);
      document.removeEventListener('visibilitychange', sync);
      document.removeEventListener('play', sync, true);
      document.removeEventListener('pause', sync, true);
      document.removeEventListener('ended', sync, true);
    };
    // The lifecycle intentionally uses refs for the current playback preference.
  }, []);

  return <div className="background-music" translate="no">
    <audio ref={audio} loop preload="none" onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onVolumeChange={() => setVolume(audio.current?.volume ?? 0.15)} onError={() => { setPlaying(false); setError(true); }}/>
    <button type="button" aria-label={t(playing ? 'Pause music' : 'Play music')} onClick={() => {
      if (playing) { desired.current = false; stop(); }
      else { desired.current = true; if (audio.current?.error) audio.current.load(); void start(); }
      persist();
    }}><Music2 size={15} aria-hidden="true"/>{playing ? <Pause size={14} aria-hidden="true"/> : <Play size={14} aria-hidden="true"/>}<span>{t(playing ? 'Pause music' : 'Play music')}</span></button>
    <button type="button" aria-label={t('Music volume')} aria-expanded={expanded} aria-controls="music-volume" onClick={() => setExpanded(value => !value)}><Volume2 size={16} aria-hidden="true"/></button>
    <label id="music-volume" hidden={!expanded}>{t('Music volume')}<input aria-label={t('Music volume')} type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={event => {
      volumeRef.current = Number(event.target.value) / 100;
      setVolume(volumeRef.current);
      if (audio.current) audio.current.volume = volumeRef.current;
      persist();
    }}/><output>{Math.round(volume * 100)}%</output></label>
    {error && <span className="music-error" role="status">{t('Music unavailable. Tap play to retry.')}</span>}
  </div>;
}
