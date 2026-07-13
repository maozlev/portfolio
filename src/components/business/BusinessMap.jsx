import * as THREE from 'three'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useCursor, AdaptiveEvents } from '@react-three/drei'
import { makeTileTexture } from '../sections/tiles.js'
import './fan.css'

const PHI = 1.61803398875
const A = Math.PI / 2.5 // steep side angle
const SCALE = 1.12

const FRAMES = [
  { id: 'what', label: 'Our Expertise', tone: 'cyan', icon: 'gear', pos: [0, 0, 1.5], rot: [0, 0, 0] },
  { id: 'who', label: 'Who We Are', tone: 'blue', icon: 'people', pos: [-1.75, 0, 0.25], rot: [0, A, 0] },
  { id: 'use-cases', label: 'Use Cases', tone: 'gold', icon: 'layers', pos: [1.75, 0, 0.25], rot: [0, -A, 0] },
  { id: 'partners', label: 'Partners', tone: 'silver', icon: 'handshake', pos: [-2.15, 0, 1.5], rot: [0, A, 0] },
  { id: 'contact', label: 'Contact', tone: 'steel', icon: 'mail', pos: [2.15, 0, 1.5], rot: [0, -A, 0] },
]
const REAL_IDS = new Set(FRAMES.map((f) => f.id))

const damp = THREE.MathUtils.damp
function damp3(v, x, y, z, l, dt) {
  v.x = damp(v.x, x, l, dt)
  v.y = damp(v.y, y, l, dt)
  v.z = damp(v.z, z, l, dt)
}
const tmpC = new THREE.Color()
function dampColor(c, hex, l, dt) {
  tmpC.set(hex)
  c.r = damp(c.r, tmpC.r, l, dt)
  c.g = damp(c.g, tmpC.g, l, dt)
  c.b = damp(c.b, tmpC.b, l, dt)
}

function Frame({ data, tex, selectedId, hovered, setHovered }) {
  const img = useRef()
  const frame = useRef()
  const isActive = selectedId === data.id
  const isHover = hovered === data.id

  useFrame((_, dt) => {
    const k = !isActive && isHover ? 0.94 : 1
    damp3(img.current.scale, 0.86 * k, 0.92 * k, 1, 8, dt)
    dampColor(frame.current.material.color, isHover || isActive ? '#ff9d2e' : '#f4f4f4', 10, dt)
  })

  return (
    <group position={data.pos} rotation={data.rot} scale={SCALE}>
      <mesh
        name={data.id}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(data.id)
        }}
        onPointerOut={() => setHovered(null)}
        scale={[1, PHI, 0.05]}
        position={[0, PHI / 2, 0]}
      >
        <boxGeometry />
        <meshBasicMaterial color="#0e0e10" toneMapped={false} />
        {/* white matte */}
        <mesh ref={frame} raycast={() => null} scale={[0.92, 0.94, 0.9]} position={[0, 0, 0.2]}>
          <boxGeometry />
          <meshBasicMaterial toneMapped={false} fog={false} />
        </mesh>
        {/* sharp poster */}
        <mesh ref={img} raycast={() => null} position={[0, 0, 0.7]} scale={[0.86, 0.92, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </mesh>
    </group>
  )
}

function Gallery({ textures, selectedId, onPick }) {
  const group = useRef()
  const [hovered, setHovered] = useState(null)
  useCursor(hovered !== null)

  const p = useRef(new THREE.Vector3(0, 0.25, 4.6))
  const q = useRef(new THREE.Quaternion())

  useEffect(() => {
    const obj = selectedId && group.current.getObjectByName(selectedId)
    if (obj) {
      obj.parent.updateWorldMatrix(true, true)
      obj.parent.localToWorld(p.current.set(0, PHI / 2, 1.25))
      obj.parent.getWorldQuaternion(q.current)
    } else {
      p.current.set(0, 0.25, 4.6)
      q.current.identity()
    }
  }, [selectedId])

  useFrame((state, dt) => {
    damp3(state.camera.position, p.current.x, p.current.y, p.current.z, 2.6, dt)
    state.camera.quaternion.slerp(q.current, 1 - Math.exp(-2.6 * dt))
  })

  return (
    <group ref={group} position={[0, -0.5, 0]} onClick={(e) => (e.stopPropagation(), onPick(e.object.name))}>
      {FRAMES.map((data, i) => (
        <Frame key={data.id} data={data} tex={textures[i]} selectedId={selectedId} hovered={hovered} setHovered={setHovered} />
      ))}
      {/* flat dark floor — fog fades it toward the horizon, no reflection cost */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial color="#050506" toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function BusinessMap({ onNavigate, onClose }) {
  const [selectedId, setSelectedId] = useState(null)
  const [navigating, setNavigating] = useState(false)
  const textures = useMemo(() => FRAMES.map((f) => makeTileTexture({ kind: 'theme', label: f.label, tone: f.tone })), [])

  const onPick = (id) => {
    if (navigating || !REAL_IDS.has(id)) return
    setSelectedId(id)
    setNavigating(true)
    setTimeout(() => onNavigate(id), 720)
  }

  return (
    <div className="carousel-stage">
      <Canvas dpr={1} camera={{ fov: 70, position: [0, 2, 15] }} gl={{ antialias: false, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#16171c']} />
        <fog attach="fog" args={['#16171c', 4, 18]} />

        <Suspense fallback={null}>
          <Gallery textures={textures} selectedId={selectedId} onPick={onPick} />
        </Suspense>

        <AdaptiveEvents />
      </Canvas>

      <div className={`carousel-fade ${navigating ? 'active' : ''}`} />

      <div className="fan-dock">
        <button className="dock-btn dock-home" onClick={onClose} aria-label="Home">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 11l8-7 8 7M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className={`carousel-hint ${selectedId !== null ? 'gone' : ''}`}>Click a frame to open</div>
    </div>
  )
}
