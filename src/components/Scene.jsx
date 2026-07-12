import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing'
import * as THREE from 'three'

import Figure from './Figure.jsx'
import LightOrb from './LightOrb.jsx'
import Particles from './Particles.jsx'

// Gentle camera parallax that drifts with the pointer for depth.
function Rig({ pointer }) {
  useFrame((state) => {
    const p = pointer.current
    const px = p.active ? p.x : 0
    const py = p.active ? p.y : 0
    state.camera.position.x += (px * 0.5 - state.camera.position.x) * 0.03
    state.camera.position.y += (1.35 + py * 0.25 - state.camera.position.y) * 0.03
    state.camera.lookAt(0, 1.1, 0)
  })
  return null
}

// Maps the normalized pointer to a smoothed world-space target that both the
// light orb and the figure's gaze follow.
function PointerTarget({ pointer, target }) {
  const { viewport } = useThree()
  useFrame(() => {
    const p = pointer.current
    // Rest position: upper-right, further out — like the reference image.
    const rx = p.active ? p.x : 0.88
    const ry = p.active ? p.y : 0.34
    const desiredX = rx * (viewport.width * 0.6)
    const desiredY = 1.7 + ry * 2.3
    const desiredZ = 1.4 + Math.abs(rx) * 0.6
    target.current.x += (desiredX - target.current.x) * 0.06
    target.current.y += (desiredY - target.current.y) * 0.06
    target.current.z += (desiredZ - target.current.z) * 0.06
  })
  return null
}

export default function Scene({ pointer }) {
  const target = useRef(new THREE.Vector3(3, 1.6, 1.4))

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 1.35, 6.2], fov: 38 }}
    >
      <color attach="background" args={['#050506']} />
      <fog attach="fog" args={['#050506', 7, 16]} />

      {/* Dim cinematic base lighting; most of the drama comes from the orb.
          No shadow-casting here — ContactShadows grounds the figure cheaply. */}
      <hemisphereLight intensity={0.06} color="#2a3340" groundColor="#000000" />
      <directionalLight position={[-4, 6, 2]} intensity={0.25} color="#9fb4c8" />

      <Rig pointer={pointer} />

      <Suspense fallback={null}>
        <PointerTarget pointer={pointer} target={target} />
        <LightOrb target={target} />
        <Figure target={target} />
        <Particles target={target} />

        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.7}
          scale={16}
          blur={2.6}
          far={6}
          resolution={512}
          color="#000000"
        />
        {/* Procedural reflections so the metal reads — no external HDR needed. */}
        <Environment resolution={256} environmentIntensity={0.35}>
          <Lightformer intensity={0.6} color="#4a5a6b" position={[0, 5, -2]} scale={[10, 6, 1]} />
          <Lightformer intensity={0.5} color="#66e6ff" position={[4, 2, 3]} scale={[3, 3, 1]} />
          <Lightformer intensity={0.25} color="#2b3a4a" position={[-5, 1, -3]} scale={[6, 6, 1]} />
          <Lightformer intensity={0.3} color="#5a6a7a" position={[0, 1, 6]} scale={[8, 4, 1]} />
        </Environment>
      </Suspense>

      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom
          mipmapBlur
          intensity={1.15}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.2}
          radius={0.75}
        />
        <Vignette eskil={false} offset={0.28} darkness={0.9} />
        <SMAA />
      </EffectComposer>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  )
}
