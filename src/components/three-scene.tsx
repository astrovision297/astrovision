'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
const VedicScene = dynamic(() => import('./vedic-scene'), { ssr: false });
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}
export default function ThreeScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [rendered, setRendered] = useState(false);
  const onError = useCallback(() => { setRendered(false); setActive(false); }, []);
  const onReady = useCallback(() => setRendered(true), []);
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let supported = false;
    try { supported = !!document.createElement('canvas').getContext('webgl2'); } catch {}
    if (!supported || nav.connection?.saveData || (nav.deviceMemory && nav.deviceMemory < 4)) return;
    let visible = false;
    const update = () => setActive(visible && !motion.matches && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    if (ref.current) observer.observe(ref.current);
    motion.addEventListener('change', update); document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); motion.removeEventListener('change', update); document.removeEventListener('visibilitychange', update); };
  }, []);
  return <div className="cosmic-background" data-theme="jyotisha" ref={ref} aria-hidden="true"><div className="cosmic-stars"/><div className="cosmic-wheel" data-rendered={rendered && active}><Image src="/images/jyotisha-poster.svg" alt="" fill sizes="800px" className="sphere-poster" />{active && <div className="canvas-layer"><SceneBoundary><VedicScene onReady={onReady} onError={onError} /></SceneBoundary></div>}</div></div>;
}
