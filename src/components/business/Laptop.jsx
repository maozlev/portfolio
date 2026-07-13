import * as THREE from 'three'
import { Component, useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

const MODEL = '/models/mac-draco.glb'
useGLTF.preload(MODEL, true)

const OPEN = -0.42
const CLOSED = 1.575

function LaptopModel(props) {
  const group = useRef()
  const floatRef = useRef()
  const lid = useRef()
  const { nodes, materials } = useGLTF(MODEL, true)
  const [open, setOpen] = useState(true)

  // Manual (drag) rotation + drag/click bookkeeping.
  const spin = useRef({ x: 0, y: 0 })
  const drag = useRef({ active: false, lastX: 0, lastY: 0, moved: 0 })

  // Give the screen a soft powered-on glow.
  useMemo(() => {
    const s = materials['screen.001']
    if (s) {
      s.emissive = new THREE.Color('#123b45')
      s.emissiveIntensity = 1.3
      s.toneMapped = false
    }
  }, [materials])

  const onMove = useCallback((e) => {
    const d = drag.current
    if (!d.active) return
    const dx = e.clientX - d.lastX
    const dy = e.clientY - d.lastY
    d.lastX = e.clientX
    d.lastY = e.clientY
    d.moved += Math.abs(dx) + Math.abs(dy)
    spin.current.y += dx * 0.008
    spin.current.x = THREE.MathUtils.clamp(spin.current.x + dy * 0.006, -0.6, 0.6)
  }, [])

  const onUp = useCallback(() => {
    const d = drag.current
    d.active = false
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    if (d.moved < 6) setOpen((o) => !o) // it was a click, not a drag
  }, [onMove])

  const onDown = useCallback(
    (e) => {
      e.stopPropagation()
      drag.current = { active: true, lastX: e.clientX, lastY: e.clientY, moved: 0 }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [onMove, onUp]
  )

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    },
    [onMove, onUp]
  )

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (lid.current) {
      lid.current.rotation.x = THREE.MathUtils.lerp(lid.current.rotation.x, open ? OPEN : CLOSED, 0.08)
    }
    if (floatRef.current) {
      floatRef.current.position.y = Math.sin(t / 1.5) * 0.06
      floatRef.current.rotation.y = spin.current.y + Math.sin(t / 6) / 14
      floatRef.current.rotation.x = spin.current.x
      floatRef.current.rotation.z = Math.sin(t / 8) / 26
    }
  })

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'grab'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
      onPointerDown={onDown}
    >
      <group ref={floatRef}>
        <group ref={lid} rotation-x={OPEN} position={[0, -0.04, 0.41]}>
          <group position={[0, 2.96, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh material={materials.aluminium} geometry={nodes['Cube008'].geometry} />
            <mesh material={materials['matte.001']} geometry={nodes['Cube008_1'].geometry} />
            <mesh material={materials['screen.001']} geometry={nodes['Cube008_2'].geometry} />
          </group>
        </group>
        <mesh material={materials.keys} geometry={nodes.keyboard.geometry} position={[1.79, 0, 3.45]} />
        <group position={[0, -0.1, 3.39]}>
          <mesh material={materials.aluminium} geometry={nodes['Cube002'].geometry} />
          <mesh material={materials.trackpad} geometry={nodes['Cube002_1'].geometry} />
        </group>
        <mesh material={materials.touchbar} geometry={nodes.touchbar.geometry} position={[0, -0.03, 1.2]} />
      </group>
    </group>
  )
}

// If the model/decoder fails to load, render nothing — never break the gallery.
class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function Laptop(props) {
  return (
    <Boundary>
      <Suspense fallback={null}>
        <LaptopModel {...props} />
      </Suspense>
    </Boundary>
  )
}
