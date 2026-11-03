'use client';

import VedicScene from './vedic-scene';

// This is the single live background. Celestial hides its matching poster when ready.
export default function LivingScene({onReady,onError}:{onReady:()=>void;onError:()=>void}) {
  return <div className="living-scene"><VedicScene onReady={onReady} onError={onError}/></div>;
}
