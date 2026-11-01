'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { createPageArt, disposePageArt, animatePageArt } from '@/lib/page-art';
import type { PageSceneConfig } from '@/lib/page-themes';

function Sculpture({ config, onReady }: { config: PageSceneConfig; onReady: () => void }) {
  const { id, motif, edition, seed, theme } = config;
  const model = useMemo(() => createPageArt(theme, { motif, edition, seed }), [id, motif, edition, seed, theme]);
  const rendered = useRef(false);
  const elapsed = useRef(0);
  const { size } = useThree();
  useEffect(() => () => disposePageArt(model), [model]);
  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, .05);
    animatePageArt(model, elapsed.current);
    if (!rendered.current) { rendered.current = true; onReady(); }
  });
  // Fit a full composition on narrow screens without increasing the pixel budget.
  return <group position={[size.width <= 760 ? .55 : 1.65, 0, 0]} scale={size.width <= 760 ? .76 : 1}><primitive object={model}/></group>;
}
function ContextGuard({ onError }: { onError: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onError(); };
    gl.domElement.addEventListener('webglcontextlost', lost);
    // React Three Fiber deliberately releases its context after unmounting.
    // Remove the listener first so pausing is not treated as a device failure.
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, onError]);
  return null;
}
export default function PageScene({ config, onReady, onError }: { config: PageSceneConfig; onReady: () => void; onError: () => void }) {
  return <Canvas dpr={[1, 1.25]} camera={{ position: [0, 0, 11.8], fov: 42 }} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }} aria-hidden="true">
    <ContextGuard onError={onError}/>
    <ambientLight intensity={1.5}/><directionalLight position={[-3, 5, 6]} intensity={3.2} color="#ffdf9c"/><directionalLight position={[4, -2, 2]} intensity={1.2} color="#9cb4d0"/>
    <Sculpture config={config} onReady={onReady}/>
  </Canvas>;
}
