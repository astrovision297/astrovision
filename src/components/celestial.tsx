'use client';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { pageScene } from '@/lib/page-themes';
import { useLanguage } from './language-provider';
import Image from 'next/image';
import { Component, useCallback, useEffect, useId, useState, type ReactNode } from 'react';
const PageScene = dynamic(() => import('./page-scene'), { ssr: false });
const LivingScene = dynamic(() => import('./living-scene'), { ssr: false });
class Boundary extends Component<{children: ReactNode;onError:()=>void}, {failed:boolean}> {
 state={failed:false}; static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.onError();}
 render(){return this.state.failed ? null : this.props.children;}
}
export function ZodiacWheel({ small = false }: { small?: boolean }) {
 const wheelId=useId();
 const signs=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
 return <svg viewBox="0 0 600 600" className={small ? 'zodiac-wheel small' : 'zodiac-wheel'} aria-hidden="true"><defs><radialGradient id={wheelId}><stop stopColor="#e8d08a" stopOpacity=".15"/><stop offset="1" stopColor="#d4af37" stopOpacity="0"/></radialGradient></defs><circle cx="300" cy="300" r="298" fill={`url(#${wheelId})`}/><g fill="none" stroke="currentColor">{[286,278,252,196,187,120,112].map(r=><circle key={r} cx="300" cy="300" r={r} strokeWidth={r===278 ? 2 : .7}/>)}{Array.from({length:120},(_,i)=><path key={i} d={`M300 22v${i%10===0 ? 21 : i%5===0 ? 12 : 5}`} transform={`rotate(${i*3} 300 300)`} opacity={i%5===0 ? .8 : .4}/>)}{signs.map((s,i)=><g key={s} transform={`rotate(${i*30} 300 300)`}><path d="M300 48v65" opacity=".5"/><text x="356" y="91" fill="currentColor" stroke="none" fontSize="30" transform="rotate(15 356 91)" textAnchor="middle" fontFamily="Arial, DejaVu Sans, sans-serif">{s+'\uFE0E'}</text><path d="M300 113L462 394L138 394Z" opacity=".12"/></g>)}<path d="M300 151L429 374H171Z M300 449L171 226H429Z" opacity=".6"/><circle cx="300" cy="300" r="66"/><circle cx="300" cy="300" r="57"/>{Array.from({length:24},(_,i)=><path key={i} d="M300 216l-4-20 4-10 4 10Z" transform={`rotate(${i*15} 300 300)`} fill="currentColor" stroke="none" opacity=".8"/>)}</g><text x="300" y="324" textAnchor="middle" fontSize="67" fill="currentColor" fontFamily="Georgia">☼</text></svg>;
}
// Mounted once in the root layout so route changes preserve the background and pause choice.
export default function Celestial() {
 const pathname=usePathname();
 const config=pageScene(pathname);
 const {theme,seed:variant}=config;
 const sceneKey=config.id;
 const { t }=useLanguage();
 const [paused,setPaused]=useState(false);
 const [systemPaused,setSystemPaused]=useState(true);
 const [supported,setSupported]=useState(false);
 const [ready,setReady]=useState<string|null>(null);
 const onReady=useCallback(()=>setReady(sceneKey),[sceneKey]);
 const onError=useCallback(()=>{setReady(null);setSupported(false);},[]);
 useEffect(()=>{
  const nav=navigator as Navigator & {connection?:{saveData?:boolean};deviceMemory?:number};
  let available=false;
  try {
   const gl=document.createElement('canvas').getContext('webgl2');
   available=!!gl;
   gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {}
  setSupported(available&&!nav.connection?.saveData&&(!nav.deviceMemory||nav.deviceMemory>=4));
 },[]);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{
   const stopped=media.matches||document.hidden;
   setSystemPaused(stopped);
   document.documentElement.dataset.motionPaused=String(paused||stopped);
  };
  update();media.addEventListener('change',update);document.addEventListener('visibilitychange',update);
  return()=>{media.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);};
 },[paused]);
 const active=supported&&!paused&&!systemPaused;
 useEffect(()=>{if(!active)setReady(null);},[active]);
 return <><div className="shared-cosmos" aria-hidden="true" data-theme={theme} data-scene={sceneKey} data-variant={variant} data-active={active} data-live={active&&ready===sceneKey}>
  <div className="star-field"/>
  <div className="cosmos-poster"><Image src={config.poster} alt="" fill sizes="(max-width: 760px) 180vw, 110vw" className="jyotisha-poster" unoptimized={theme!=='home'}/></div>
  {active&&<Boundary key={sceneKey} onError={onError}>{theme==='home'?<LivingScene onReady={onReady}/>:<div className="living-scene"><PageScene config={config} onReady={onReady} onError={onError}/></div>}</Boundary>}
  <div className="cosmos-shade"/>
 </div><button className="motion-toggle" type="button" aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>
  <span aria-hidden="true">{paused?'▶':'Ⅱ'}</span>{t(paused?'Resume animation':'Pause animation')}
 </button></>;
}
