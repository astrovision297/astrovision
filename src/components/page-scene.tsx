'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Group } from 'three';
import { createPageArt, disposePageArt, animatePageArt } from '@/lib/page-art';
import type { PageSceneConfig } from '@/lib/page-themes';

function Sculpture({ config, onReady }: { config: PageSceneConfig; onReady: () => void }) {
  const { id, motif, edition, seed, theme } = config;
  const model = useMemo(() => createPageArt(theme, { motif, edition, seed }), [id, motif, edition, seed, theme]);
  const rendered = useRef(false);
  const elapsed = useRef(0);
  const { viewport, size } = useThree();
  const composition = useRef<Group>(null);
  const scroll = useRef(0);
  useEffect(() => {
    const update = () => { scroll.current = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight); };
    update(); window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => () => disposePageArt(model), [model]);
  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, .05);
    animatePageArt(model, elapsed.current);
    if (composition.current) {
      const target = scroll.current * .22;
      composition.current.rotation.z += (target - composition.current.rotation.z) * Math.min(1, delta * 2);
      composition.current.position.y = Math.sin(elapsed.current * .16) * .12;
    }
    if (!rendered.current) { rendered.current = true; onReady(); }
  });
  // Fit the focal artwork on phones; the surrounding star volume fills the viewport.
  const scale = Math.min(viewport.width / (size.width <= 760 ? 6.8 : 10), viewport.height / 8.6);
  return <group ref={composition} position={[size.width <= 760 ? 0 : viewport.width * .18, 0, 0]} scale={scale}><primitive object={model}/></group>;
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
