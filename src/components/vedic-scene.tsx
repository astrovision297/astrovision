'use client';

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import { TextureLoader, type Group } from 'three';
import { grahas, lunarNodes } from '@/data/jyotisha';

function BrassRing({ radius, width = .012 }: { radius: number; width?: number }) {
  return <mesh><torusGeometry args={[radius, width, 8, 128]}/><meshStandardMaterial color="#dcb76c" metalness={.72} roughness={.32}/></mesh>;
}

function JyotishaChakra({ onReady }: { onReady: () => void }) {
  const rendered = useRef(false);
  const grahaRing = useRef<Group>(null);
  const nodes = useRef<Group>(null);
  const rays = useRef<Group>(null);
  const texture = useLoader(TextureLoader, '/images/jyotisha-rings.svg');
  useFrame((_, delta) => {
    if (!rendered.current) { rendered.current = true; onReady(); }
    const step = Math.min(delta, .05);
    if (grahaRing.current) grahaRing.current.rotation.z += step * .035;
    // Both nodes remain exactly opposite as their shared axis moves retrograde.
    if (nodes.current) nodes.current.rotation.z -= step * .018;
    if (rays.current) rays.current.rotation.z -= step * .024;
  });
  return <group name="JyotishaChakra" rotation={[0, 0, 0]}>
    {/* Keep the chart and labels front-facing; only markers and rays rotate. */}
    <group name="RashiNakshatraRing">
      <mesh position={[0,0,-.025]}><planeGeometry args={[6.4,6.4]}/><meshBasicMaterial map={texture} transparent depthWrite={false}/></mesh>
      {[1.824,2.336,2.432,2.918,3.008].map(radius => <BrassRing key={radius} radius={radius} width={radius===3.008?.025:.012}/>)}
      <group position={[0,0,.10]}><BrassRing radius={1.47}/></group>
      <group ref={grahaRing} position={[0,0,.16]}>
        {grahas.map((graha,i) => {
          const angle=Math.PI/6+i*Math.PI/3;
          return <group key={graha.name} name={graha.name} position={[1.47*Math.cos(angle),1.47*Math.sin(angle),0]}>
            <mesh><sphereGeometry args={[graha.size,24,16]}/><meshStandardMaterial color={graha.color} metalness={.3} roughness={.48}/></mesh>
            {graha.name==='Shani' && <mesh rotation={[.65,.2,0]}><torusGeometry args={[.20,.018,8,48]}/><meshStandardMaterial color="#b3a883" metalness={.55} roughness={.5}/></mesh>}
          </group>;
        })}
      </group>
      <group ref={nodes} position={[0,0,.2]}>{lunarNodes.map((node,i) => <group key={node} name={node} position={[i===0?1.65:-1.65,0,0]} rotation={[0,0,i*Math.PI]}>
        <mesh><torusGeometry args={[.10,.018,8,48]}/><meshStandardMaterial color={i===0?'#e2cb91':'#bc955f'} emissive={'#80602a'} emissiveIntensity={.35}/></mesh>
        <mesh position={[0,-.10,0]} rotation={[0,0,Math.PI]}><coneGeometry args={[.04,.10,3]}/><meshStandardMaterial color="#d5b875"/></mesh>
      </group>)}</group>
    </group>
    <group name="Surya" position={[0,0,.28]}>
      <mesh><sphereGeometry args={[.4,40,24]}/><meshStandardMaterial color="#ffd166" emissive="#ffb83d" emissiveIntensity={1.1} metalness={.25} roughness={.5} toneMapped={false}/></mesh>
      <BrassRing radius={.49} width={.018}/>
      <group ref={rays}>{Array.from({length:24},(_,i)=>{
        const angle=i*Math.PI/12;
        return <mesh key={i} position={[.64*Math.cos(angle),.64*Math.sin(angle),0]} rotation={[0,0,angle-Math.PI/2]} scale={[1,1,.35]}><coneGeometry args={[.065,.35,4]}/><meshStandardMaterial color="#d6a24a" metalness={.65} roughness={.34}/></mesh>;
      })}</group>
    </group>
  </group>;
}

function ContextGuard({ onError }: { onError: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onError(); };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, onError]);
  return null;
}

export default function VedicScene({ onReady, onError }: { onReady: () => void; onError: () => void }) {
  return <Canvas dpr={[1,1.25]} camera={{position:[0,0,10.2],fov:45}} gl={{alpha:true,antialias:true,powerPreference:'low-power'}} aria-hidden="true">
    <ContextGuard onError={onError}/>
    <ambientLight intensity={1.8}/><directionalLight position={[0,1,7]} intensity={3}/><directionalLight position={[-4,2,5]} intensity={.8} color="#ffe3a3"/>
    <Suspense fallback={null}><JyotishaChakra onReady={onReady}/></Suspense>
  </Canvas>;
}
