import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Soft radial sprite used for the glow halo and wisps.
function makeGlowTexture() {
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(180,245,255,1)')
  g.addColorStop(0.25, 'rgba(102,230,255,0.7)')
  g.addColorStop(0.6, 'rgba(43,143,176,0.18)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export default function LightOrb({ target }) {
  const group = useRef()
  const light = useRef()
  const core = useRef()
  const wisps = useRef([])

  const glow = useMemo(() => makeGlowTexture(), [])

  const wispSeeds = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        r: 0.18 + Math.random() * 0.22,
        speed: 0.6 + Math.random() * 1.1,
        phase: (i / 7) * Math.PI * 2,
        tilt: Math.random() * Math.PI,
        scale: 0.12 + Math.random() * 0.16,
      })),
    []
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (group.current) {
      group.current.position.copy(target.current)
    }
    if (light.current) {
      light.current.intensity = 26 + Math.sin(t * 6) * 3 + Math.sin(t * 13.7) * 1.5
    }
    if (core.current) {
      const s = 1 + Math.sin(t * 5) * 0.08
      core.current.scale.setScalar(s)
    }
    wisps.current.forEach((m, i) => {
      if (!m) return
      const s = wispSeeds[i]
      const a = t * s.speed + s.phase
      const x = Math.cos(a) * s.r
      const z = Math.sin(a) * s.r * 0.6
      const y = Math.sin(a * 1.3 + s.tilt) * s.r * 0.7
      m.position.set(x, y, z)
      const flick = 0.6 + (Math.sin(t * 7 + s.phase) * 0.5 + 0.5) * 0.6
      m.scale.setScalar(s.scale * flick)
    })
  })

  return (
    <group ref={group}>
      <pointLight ref={light} color="#7fe9ff" intensity={26} distance={14} decay={2} />

      {/* Bright core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.075, 3]} />
        <meshBasicMaterial color="#d6faff" toneMapped={false} />
      </mesh>

      {/* Halo */}
      <sprite scale={[1.9, 1.9, 1.9]}>
        <spriteMaterial
          map={glow}
          color="#8fecff"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      {/* Swirling wisps */}
      {wispSeeds.map((s, i) => (
        <sprite key={i} ref={(el) => (wisps.current[i] = el)} scale={[s.scale, s.scale, s.scale]}>
          <spriteMaterial
            map={glow}
            color="#66e6ff"
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  )
}
