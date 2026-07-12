import * as THREE from 'three'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image, MeshReflectorMaterial, Environment, Lightformer, useCursor } from '@react-three/drei'
import { makeTileDataURL } from '../sections/tiles.js'
import './fan.css'

const PHI = 1.61803398875

// Section → framed poster, laid out as a curved wall (centre = Our Expertise).
const FRAMES = [
  { id: 'what', label: 'Our Expertise', tone: 'cyan', pos: [0, 0, 0], rot: [0, 0, 0] },
  { id: 'who', label: 'Who We Are', tone: 'blue', pos: [-1.66, 0, 0.56], rot: [0, 0.5, 0] },
  { id: 'use-cases', label: 'Use Cases', tone: 'gold', pos: [1.66, 0, 0.56], rot: [0, -0.5, 0] },
  { id: 'partners', label: 'Partners', tone: 'silver', pos: [-3.08, 0, 1.68], rot: [0, 0.9, 0] },
  { id: 'contact', label: 'Contact', tone: 'steel', pos: [3.08, 0, 1.68], rot: [0, -0.9, 0] },
]

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

function Frame({ data, url, selectedId, hovered, setHovered }) {
  const image = useRef()
  const frame = useRef()
  const isActive = selectedId === data.id
  const isHover = hovered === data.id

  useFrame((_, dt) => {
    const iw = 0.85 * (!isActive && isHover ? 0.9 : 1)
    const ih = 0.9 * (!isActive && isHover ? 0.905 : 1)
    damp3(image.current.scale, iw, ih, 1, 8, dt)
    dampColor(frame.current.material.color, isHover || isActive ? '#ff9d2e' : '#f6f6f6', 10, dt)
  })

  return (
    <group position={data.pos} rotation={data.rot}>
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
        <meshStandardMaterial color="#151515" metalness={0.6} roughness={0.45} envMapIntensity={1.5} />
        <mesh ref={frame} raycast={() => null} scale={[0.9, 0.93, 0.9]} position={[0, 0, 0.2]}>
          <boxGeometry />
          <meshBasicMaterial toneMapped={false} fog={false} />
        </mesh>
        <Image raycast={() => null} ref={image} position={[0, 0, 0.7]} url={url} zoom={1} />
      </mesh>
    </group>
  )
}

function Gallery({ urls, selectedId, onPick }) {
  const group = useRef()
  const [hovered, setHovered] = useState(null)
  useCursor(hovered !== null)

  const p = useRef(new THREE.Vector3(0, 0.3, 6.4))
  const q = useRef(new THREE.Quaternion())

  useEffect(() => {
    const obj = selectedId && group.current.getObjectByName(selectedId)
    if (obj) {
      obj.parent.updateWorldMatrix(true, true)
      obj.parent.localToWorld(p.current.set(0, PHI / 2, 1.35))
      obj.parent.getWorldQuaternion(q.current)
    } else {
      p.current.set(0, 0.3, 6.4)
      q.current.identity()
    }
  }, [selectedId])

  useFrame((state, dt) => {
    damp3(state.camera.position, p.current.x, p.current.y, p.current.z, 2.6, dt)
    state.camera.quaternion.slerp(q.current, 1 - Math.exp(-2.6 * dt))
  })

  return (
    <group
      ref={group}
      position={[0, -0.5, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onPick(e.object.name)
      }}
    >
      {FRAMES.map((data, i) => (
        <Frame key={data.id} data={data} url={urls[i]} selectedId={selectedId} hovered={hovered} setHovered={setHovered} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={80}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.5}
        />
      </mesh>
    </group>
  )
}

export default function BusinessMap({ onNavigate, onClose }) {
  const [selectedId, setSelectedId] = useState(null)
  const [navigating, setNavigating] = useState(false)
  const urls = useMemo(() => FRAMES.map((f) => makeTileDataURL({ kind: 'theme', label: f.label, tone: f.tone })), [])

  const onPick = (id) => {
    if (navigating) return
    if (id !== selectedId) {
      // first click: fly the camera to the frame
      setSelectedId(id)
      return
    }
    // click the focused frame again → open its page
    setNavigating(true)
    setTimeout(() => onNavigate(id), 700)
  }

  return (
    <div className="carousel-stage">
      <Canvas dpr={[1, 1.5]} camera={{ fov: 70, position: [0, 2, 15] }}>
        <color attach="background" args={['#16171c']} />
        <fog attach="fog" args={['#16171c', 3, 16]} />
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 14, 8]} angle={0.3} penumbra={1} intensity={60} castShadow />

        <Suspense fallback={null}>
          <Gallery urls={urls} selectedId={selectedId} onPick={onPick} />
          <Environment resolution={256} environmentIntensity={0.8}>
            <Lightformer intensity={1.6} color="#ffffff" position={[0, 6, 6]} scale={[10, 8, 1]} />
            <Lightformer intensity={0.7} color="#88aaff" position={[-6, 3, 2]} scale={[5, 5, 1]} />
            <Lightformer intensity={0.6} color="#ffb060" position={[6, 3, 2]} scale={[5, 5, 1]} />
          </Environment>
        </Suspense>
      </Canvas>

      <div className={`carousel-fade ${navigating ? 'active' : ''}`} />

      <div className="fan-dock">
        <button className="dock-btn dock-home" onClick={onClose} aria-label="Home">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 11l8-7 8 7M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className={`carousel-hint ${selectedId !== null ? 'gone' : ''}`}>
        Click a frame to focus · click again to open
      </div>
    </div>
  )
}
