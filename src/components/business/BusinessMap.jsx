import * as THREE from 'three'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useCursor, AdaptiveEvents, Environment, Lightformer } from '@react-three/drei'
import { makeTileTexture } from '../sections/tiles.js'
import Laptop from './Laptop.jsx'
import Background3D from '../Background3D.jsx'
import { useIsMobile } from '../../hooks.js'
import './fan.css'

const PHI = 1.61803398875
const SCALE = 1.12
const FRAME_SHIFT = 0.7 // slide the whole wall right to make room for the laptop

// Symmetric arc, evenly spaced left→right, centre prominent.
const FRAMES = [
  { id: 'partners', label: 'Partners', tone: 'silver', icon: 'handshake', pos: [-2.7, 0, -1.4], rot: [0, 0.9, 0] },
  { id: 'who', label: 'Who We Are', tone: 'blue', icon: 'people', pos: [-1.35, 0, -0.55], rot: [0, 0.45, 0] },
  { id: 'what', label: 'Our Expertise', tone: 'cyan', icon: 'gear', pos: [0, 0, 0], rot: [0, 0, 0] },
  { id: 'use-cases', label: 'Use Cases', tone: 'gold', icon: 'layers', pos: [1.35, 0, -0.55], rot: [0, -0.45, 0] },
  { id: 'contact', label: 'Contact', tone: 'steel', icon: 'mail', pos: [2.7, 0, -1.4], rot: [0, -0.9, 0] },
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

// Static, non-interactive, double-sided copy used for the mirrored reflection.
function ReflFrame({ data, tex }) {
  return (
    <group position={data.pos} rotation={data.rot} scale={SCALE}>
      <mesh raycast={() => null} scale={[1, PHI, 0.05]} position={[0, PHI / 2, 0]}>
        <boxGeometry />
        <meshBasicMaterial color="#0e0e10" toneMapped={false} side={THREE.DoubleSide} />
        <mesh raycast={() => null} scale={[0.92, 0.94, 0.9]} position={[0, 0, 0.2]}>
          <boxGeometry />
          <meshBasicMaterial color="#f4f4f4" toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh raycast={() => null} position={[0, 0, 0.7]} scale={[0.86, 0.92, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </mesh>
    </group>
  )
}

function Gallery({ textures, selectedId, onPick, mobile }) {
  const group = useRef()
  const [hovered, setHovered] = useState(null)
  useCursor(hovered !== null)

  // On phones: centre the wall and pull the camera back so all frames fit.
  const home = mobile ? [0, 0.2, 6.6] : [0, 0.25, 4.6]
  const p = useRef(new THREE.Vector3(home[0], home[1], home[2]))
  const q = useRef(new THREE.Quaternion())

  useEffect(() => {
    const obj = selectedId && group.current.getObjectByName(selectedId)
    if (obj) {
      obj.parent.updateWorldMatrix(true, true)
      obj.parent.localToWorld(p.current.set(0, PHI / 2, 1.25))
      obj.parent.getWorldQuaternion(q.current)
    } else {
      p.current.set(home[0], home[1], home[2])
      q.current.identity()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, mobile])

  useFrame((state, dt) => {
    damp3(state.camera.position, p.current.x, p.current.y, p.current.z, 2.6, dt)
    state.camera.quaternion.slerp(q.current, 1 - Math.exp(-2.6 * dt))
  })

  return (
    <group ref={group} position={[0, -0.5, 0]} onClick={(e) => (e.stopPropagation(), onPick(e.object.name))}>
      <group position={mobile ? [0, 0, 0] : [FRAME_SHIFT, 0, 0]} scale={mobile ? 0.72 : 1}>
        {FRAMES.map((data, i) => (
          <Frame key={data.id} data={data} tex={textures[i]} selectedId={selectedId} hovered={hovered} setHovered={setHovered} />
        ))}

        {/* mirrored reflection below the floor (cheap — just flipped geometry) */}
        <group scale={[1, -1, 1]}>
          {FRAMES.map((data, i) => (
            <ReflFrame key={`r-${data.id}`} data={data} tex={textures[i]} />
          ))}
        </group>
      </group>

      {/* translucent floor — high opacity leaves only a faint, gentle reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial color="#0a0b0e" transparent opacity={0.88} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function BusinessMap({ onNavigate, onClose }) {
  const [selectedId, setSelectedId] = useState(null)
  const [navigating, setNavigating] = useState(false)
  const mobile = useIsMobile()
  const textures = useMemo(() => FRAMES.map((f) => makeTileTexture({ kind: 'theme', label: f.label, tone: f.tone, icon: f.icon })), [])

  const onPick = (id) => {
    if (navigating || !REAL_IDS.has(id)) return
    setSelectedId(id)
    setNavigating(true)
    setTimeout(() => onNavigate(id), 720)
  }

  return (
    <div className="carousel-stage">
      <Canvas dpr={1} camera={{ fov: 70, position: [0, 2, 15] }} gl={{ antialias: false, powerPreference: 'high-performance' }}>
        <fog attach="fog" args={['#0c0d12', 8, 22]} />

        <Suspense fallback={null}>
          <Background3D intensity={0.5} />
          <Gallery textures={textures} selectedId={selectedId} onPick={onPick} mobile={mobile} />
        </Suspense>

        {/* 3D laptop accent — hidden on phones (no room); never blocks a frame click */}
        {!mobile && <Laptop position={[-2, -0.25, 2.6]} scale={0.14} rotation={[0, 0.5, 0]} />}
        <Environment resolution={128} environmentIntensity={0.7}>
          <Lightformer intensity={1.6} color="#ffffff" position={[0, 4, 4]} scale={[8, 5, 1]} />
          <Lightformer intensity={0.7} color="#88aaff" position={[-5, 2, 3]} scale={[4, 4, 1]} />
        </Environment>

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
