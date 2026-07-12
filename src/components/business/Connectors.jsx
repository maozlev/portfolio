import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { NODES } from './nodes.js'
import { flowTexture } from './textures.js'

// A single neon line that snakes from an off-screen entry through every node,
// with orthogonal rounded "circuit" corners and energy flowing along it.
export default function Connectors() {
  const flow = useMemo(() => flowTexture(), [])

  const { core, halo, length } = useMemo(() => {
    const y = 0.09
    const pts = []
    const push = (x, z) => {
      const v = new THREE.Vector3(x, y, z)
      const last = pts[pts.length - 1]
      if (!last || last.distanceTo(v) > 0.01) pts.push(v)
    }

    const first = NODES[0]
    push(-14, first.pos[2])
    let prevZ = first.pos[2]
    for (const n of NODES) {
      push(n.pos[0], prevZ)
      push(n.pos[0], n.pos[2])
      prevZ = n.pos[2]
    }

    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0)
    const length = curve.getLength()
    const core = new THREE.TubeGeometry(curve, 500, 0.055, 10, false)
    const halo = new THREE.TubeGeometry(curve, 500, 0.17, 8, false)
    return { core, halo, length }
  }, [])

  const coreMat = useRef()

  useFrame((_, dt) => {
    flow.repeat.x = length * 0.42
    flow.offset.x -= dt * 0.35
  })

  return (
    <group>
      <mesh geometry={halo}>
        <meshBasicMaterial
          color="#ff5a12"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={core}>
        <meshBasicMaterial ref={coreMat} map={flow} toneMapped={false} />
      </mesh>
    </group>
  )
}
