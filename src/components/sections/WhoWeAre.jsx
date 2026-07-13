import * as THREE from 'three'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import { makeTileDataURL } from './tiles.js'
import Background3D from '../Background3D.jsx'
import { useIsMobile } from '../../hooks.js'
import './sections.css'

// Only the two founders. Swap `img` for a real photo path later
// (e.g. put maoz.jpg in /public/team/ and set img: '/team/maoz.jpg').
const ITEMS = [
  {
    kind: 'founder',
    name: 'Maoz Lev',
    role: 'Co-Founder · AI & Engineering',
    bio: 'Builds the systems end to end — from the model to the factory floor.',
    tone: 'cyan',
    img: null,
  },
  {
    kind: 'founder',
    name: 'Simon Danilov',
    role: 'Co-Founder · AI & Systems',
    bio: 'Turns messy operations into reliable, automated pipelines.',
    tone: 'blue',
    img: null,
  },
]

function AvatarPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" className="avatar-svg" aria-hidden="true">
      <defs>
        <linearGradient id="wav" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2b8fb0" />
          <stop offset="1" stopColor="#0e2530" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#wav)" />
      <circle cx="50" cy="40" r="16" fill="rgba(255,255,255,0.85)" />
      <path d="M22 84c0-16 12-26 28-26s28 10 28 26z" fill="rgba(255,255,255,0.85)" />
    </svg>
  )
}

// Phone layout: readable DOM cards instead of the 3D canvas.
function WhoWeAreMobile({ onBack, onHome }) {
  return (
    <section className="sec sec--scroll">
      <div className="sec-decor" />
      <nav className="sec-nav">
        <button className="ghost-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <button className="ghost-btn" onClick={onHome}>Home</button>
      </nav>

      <div className="sec-body">
        <p className="sec-eyebrow">WHO WE ARE</p>
        <h1 className="sec-title">Two engineers.<br />One mission.</h1>
        <p className="sec-lead">
          A two-person team that brings AI into the way you already work —
          you talk directly to the people building your system.
        </p>
        <div className="people">
          {ITEMS.map((p) => (
            <article className="person-card" key={p.name}>
              <div className="avatar">{p.img ? <img src={p.img} alt={p.name} /> : <AvatarPlaceholder />}</div>
              <div className="person-meta">
                <h3 className="person-name">{p.name}</h3>
                <p className="person-role">{p.role}</p>
                <p className="person-bio">{p.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const W = 2.3
const H = 3.3
const GAP = 0.55

const RATE = 1 / 0.15
const damp = THREE.MathUtils.damp
const tmpColor = new THREE.Color()
function dampColor(color, hex, dt) {
  tmpColor.set(hex)
  color.r = damp(color.r, tmpColor.r, RATE, dt)
  color.g = damp(color.g, tmpColor.g, RATE, dt)
  color.b = damp(color.b, tmpColor.b, RATE, dt)
}

function Card({ index, url, baseX, clicked, setClicked }) {
  const ref = useRef()
  const [hovered, hover] = useState(false)

  useFrame((_, dt) => {
    const m = ref.current
    const isOpen = clicked === index
    const other = clicked !== null && !isOpen

    const sx = isOpen ? W * 1.35 : W
    const sy = isOpen ? H * 1.2 : H
    m.scale.x = damp(m.scale.x, sx, RATE, dt)
    m.scale.y = damp(m.scale.y, sy, RATE, dt)
    m.material.scale.set(m.scale.x, m.scale.y)

    let tx = baseX
    if (isOpen) tx = 0
    else if (other) tx = baseX + Math.sign(baseX || 1) * 3
    m.position.x = damp(m.position.x, tx, RATE, dt)

    m.material.grayscale = damp(m.material.grayscale, hovered || isOpen ? 0 : 0.7, RATE, dt)
    dampColor(m.material.color, hovered || isOpen ? 'white' : '#c9d0da', dt)
  })

  return (
    <Image
      ref={ref}
      url={url}
      position={[baseX, 0, 0]}
      scale={[W, H, 1]}
      radius={0.08}
      onClick={(e) => {
        e.stopPropagation()
        setClicked(index === clicked ? null : index)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        hover(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        hover(false)
        document.body.style.cursor = 'auto'
      }}
    />
  )
}

// Pulls the camera back on narrow/portrait screens so both cards stay in frame.
function ResponsiveCamera({ portraitZ, landscapeZ }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const portrait = size.width < 768 || size.width < size.height
    camera.position.z = portrait ? portraitZ : landscapeZ
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height, portraitZ, landscapeZ])
  return null
}

export default function WhoWeAre({ onBack, onHome }) {
  const mobile = useIsMobile()
  const [clicked, setClicked] = useState(null)
  const urls = useMemo(() => (mobile ? [] : ITEMS.map((it) => it.img || makeTileDataURL(it))), [mobile])

  if (mobile) return <WhoWeAreMobile onBack={onBack} onHome={onHome} />


  return (
    <section className="sec tiles-sec">
      <Canvas
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6.5], fov: 38 }}
        onPointerMissed={() => setClicked(null)}
      >
        <color attach="background" args={['#0a0b10']} />
        <ResponsiveCamera portraitZ={9.5} landscapeZ={6.5} />
        <Suspense fallback={null}>
          <Background3D intensity={0.4} />
        </Suspense>
        {urls.map((url, i) => (
          <Card
            key={i}
            index={i}
            url={url}
            baseX={i === 0 ? -(W / 2 + GAP / 2) : W / 2 + GAP / 2}
            clicked={clicked}
            setClicked={setClicked}
          />
        ))}
      </Canvas>

      <div className="tiles-head">
        <p className="sec-eyebrow">WHO WE ARE</p>
        <h1 className="tiles-title">The two behind the systems</h1>
        <p className="tiles-hint">Hover to reveal · click to focus</p>
      </div>

      <nav className="sec-nav">
        <button className="ghost-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <button className="ghost-btn" onClick={onHome}>Home</button>
      </nav>
    </section>
  )
}
