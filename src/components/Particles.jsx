import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Slow-drifting atmospheric dust that catches the orb light.
export default function Particles({ count = 150 }) {
  const points = useRef()

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12
      positions[i * 3 + 1] = Math.random() * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1
      speeds[i] = 0.05 + Math.random() * 0.12
    }
    return { positions, speeds }
  }, [count])

  useFrame((state) => {
    const geo = points.current?.geometry
    if (!geo) return
    const arr = geo.attributes.position.array
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * 0.004
      arr[i * 3 + 0] += Math.sin(t * 0.3 + i) * 0.0008
      if (arr[i * 3 + 1] > 5) arr[i * 3 + 1] = 0
    }
    geo.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#8fb8c8"
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
