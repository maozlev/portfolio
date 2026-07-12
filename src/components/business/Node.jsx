import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Html } from '@react-three/drei'
import * as THREE from 'three'

import { glowTexture } from './textures.js'
import { iconTexture } from './icons.js'

export default function Node({ node, index, onNavigate }) {
  const lift = useRef()
  const glowMat = useRef()
  const [hover, setHover] = useState(false)

  const glow = useMemo(() => glowTexture(), [])
  const icon = useMemo(() => iconTexture(node.icon), [node.icon])
  const phase = index * 1.3

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const bob = Math.sin(t * 1.1 + phase) * 0.05
    const target = bob + (hover ? 0.28 : 0)
    if (lift.current) {
      lift.current.position.y += (target - lift.current.position.y) * 0.12
    }
    if (glowMat.current) {
      const want = hover ? 1.1 : 0.7 + Math.sin(t * 2 + phase) * 0.08
      glowMat.current.opacity += (want - glowMat.current.opacity) * 0.1
    }
  })

  const go = (e) => {
    e.stopPropagation()
    onNavigate(node.id)
  }
  const over = (e) => {
    e.stopPropagation()
    setHover(true)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    setHover(false)
    document.body.style.cursor = 'auto'
  }

  return (
    <group position={node.pos}>
      {/* Floor glow puddle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[3.4, 3.4]} />
        <meshBasicMaterial
          ref={glowMat}
          map={glow}
          color={node.color}
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <group ref={lift} onClick={go} onPointerOver={over} onPointerOut={out}>
        {/* Metallic base plate */}
        <RoundedBox args={[1.5, 0.16, 1.5]} radius={0.05} smoothness={4} position={[0, 0.14, 0]} castShadow>
          <meshStandardMaterial color="#c9ced6" metalness={0.95} roughness={0.32} envMapIntensity={1} />
        </RoundedBox>

        {/* Black chip */}
        <RoundedBox args={[1.16, 0.3, 1.16]} radius={0.05} smoothness={4} position={[0, 0.33, 0]} castShadow>
          <meshStandardMaterial color="#0b0b0d" metalness={0.7} roughness={0.28} envMapIntensity={1.2} />
        </RoundedBox>

        {/* Colored rim uplight */}
        <pointLight position={[0, 0.05, 0]} color={node.color} intensity={2.4} distance={3} decay={2} />

        {/* Icon on the chip top */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.485, 0]}>
          <planeGeometry args={[0.78, 0.78]} />
          <meshBasicMaterial map={icon} transparent depthWrite={false} toneMapped={false} />
        </mesh>

        {/* Label */}
        <Html position={[0, 1.35, 0]} center distanceFactor={11} zIndexRange={[20, 0]}>
          <button
            className={`node-label ${hover ? 'is-hover' : ''}`}
            style={{ '--c': node.color }}
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(node.id)
            }}
          >
            {node.label}
          </button>
        </Html>
      </group>
    </group>
  )
}
