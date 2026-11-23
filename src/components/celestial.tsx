'use client';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { pageScene } from '@/lib/page-themes';
import Image from 'next/image';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
const PageScene = dynamic(() => import('./page-scene'), { ssr: false });
const VedicScene = dynamic(() => import('./vedic-scene'), { ssr: false });
class Boundary extends Component<{children: ReactNode;onError:()=>void}, {failed:boolean}> {
 state={failed:false}; static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.onError();}
 render(){return this.state.failed ? null : this.props.children;}
}
export default function Celestial({ paused }: { paused: boolean }) {
 const pathname=usePathname();
 const config=pageScene(pathname);
 const {theme,seed:variant}=config;
 const sceneKey=config.id;
 const [systemPaused,setSystemPaused]=useState(true);
 const [supported,setSupported]=useState(false);
 const webGL=useRef<boolean | undefined>(undefined);
 const [ready,setReady]=useState<string|null>(null);
 const onReady=useCallback(()=>setReady(sceneKey),[sceneKey]);
 const onError=useCallback(()=>{webGL.current=false;setReady(null);setSupported(false);},[]);
 useEffect(() => {
  const smallScreen = matchMedia('(max-width: 760px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const device = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  const update = () => {
   const stopped = smallScreen.matches || reducedMotion.matches || document.hidden;
   const eligible = !device.connection?.saveData && (!device.deviceMemory || device.deviceMemory >= 4);
   if (!stopped && !paused && eligible && webGL.current === undefined) {
    try {
     const gl = document.createElement('canvas').getContext('webgl2');
     webGL.current = !!gl;
     gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { webGL.current = false; }
    setSupported(webGL.current);
   }
   setSystemPaused(stopped || !eligible);
   document.documentElement.dataset.motionPaused = String(paused || stopped || !eligible);
  };
  let frame = window.requestAnimationFrame(() => { frame = window.requestAnimationFrame(update); });
  smallScreen.addEventListener('change', update);
  reducedMotion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  return () => {
   window.cancelAnimationFrame(frame);
   smallScreen.removeEventListener('change', update);
   reducedMotion.removeEventListener('change', update);
   document.removeEventListener('visibilitychange', update);
  };
 }, [paused]);
 const active=supported&&!paused&&!systemPaused;
 useEffect(()=>{if(!active)setReady(null);},[active]);
 return <div className="shared-cosmos" aria-hidden="true" data-theme={theme} data-scene={sceneKey} data-variant={variant} data-active={active} data-live={active&&ready===sceneKey}>
  <div className="star-field"/>
  <div className="cosmos-poster">{theme === 'home' ? <Image src={config.poster} alt="" fill sizes="(max-width: 760px) 180vw, 110vw" className="jyotisha-poster" loading="eager"/> : <picture><source media="(max-width: 760px)" srcSet={config.poster.replace('.webp', '-mobile.webp')}/><Image src={config.poster} alt="" fill sizes="100vw" className="jyotisha-poster" loading="eager" unoptimized/></picture>}</div>
  {active&&<Boundary key={sceneKey} onError={onError}>{theme === 'home' ? <div className="living-scene"><VedicScene onReady={onReady} onError={onError}/></div> : <div className="living-scene"><PageScene config={config} onReady={onReady} onError={onError}/></div>}</Boundary>}
  <div className="cosmos-shade"/>
 </div>;
}
