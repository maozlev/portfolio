import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ---------- Procedural circuit-pattern skin ----------
   One PCB-like routing drawn into two aligned maps:
   - bump: grayscale traces/pads → engraved circuitry on the dark plating
   - emissive: sparse cyan traces + lit nodes → the "internal micro-lights" */
function makeCircuitTextures() {
  const s = 1024
  const bC = document.createElement('canvas')
  const eC = document.createElement('canvas')
  bC.width = bC.height = eC.width = eC.height = s
  const b = bC.getContext('2d')
  const e = eC.getContext('2d')

  b.fillStyle = '#797979'
  b.fillRect(0, 0, s, s)
  e.fillStyle = '#000000'
  e.fillRect(0, 0, s, s)

  const grid = 13
  const cell = s / grid
  const jit = () => (Math.random() - 0.5) * cell * 0.4
  const nodes = []
  for (let i = 0; i < grid; i++) {
    nodes[i] = []
    for (let j = 0; j < grid; j++) {
      nodes[i][j] = { x: i * cell + cell / 2 + jit(), y: j * cell + cell / 2 + jit() }
    }
  }

  const route = (a, c, ctx, w, style) => {
    ctx.strokeStyle = style
    ctx.lineWidth = w
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(c.x, a.y)
    ctx.lineTo(c.x, c.y)
    ctx.stroke()
  }

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const n = nodes[i][j]
      if (i < grid - 1 && Math.random() > 0.35) {
        route(n, nodes[i + 1][j], b, 4, '#4d4d4d')
        route(n, nodes[i + 1][j], e, 2, 'rgba(60,150,180,0.35)')
      }
      if (j < grid - 1 && Math.random() > 0.55) {
        route(n, nodes[i][j + 1], b, 4, '#4d4d4d')
        route(n, nodes[i][j + 1], e, 2, 'rgba(60,150,180,0.35)')
      }
    }
  }

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const n = nodes[i][j]
      if (Math.random() > 0.45) {
        const r = 4 + Math.random() * 6
        b.fillStyle = Math.random() > 0.5 ? '#5a5a5a' : '#9a9a9a'
        b.fillRect(n.x - r, n.y - r, r * 2, r * 2)
      }
      if (Math.random() > 0.82) {
        const glow = e.createRadialGradient(n.x, n.y, 0, n.x, n.y, 14)
        glow.addColorStop(0, 'rgba(150,240,255,1)')
        glow.addColorStop(0.4, 'rgba(80,210,255,0.7)')
        glow.addColorStop(1, 'rgba(0,0,0,0)')
        e.fillStyle = glow
        e.fillRect(n.x - 14, n.y - 14, 28, 28)
      }
    }
  }

  const bump = new THREE.CanvasTexture(bC)
  const emissive = new THREE.CanvasTexture(eC)
  for (const t of [bump, emissive]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 2)
    t.anisotropy = 4
  }
  emissive.colorSpace = THREE.SRGBColorSpace
  return { bump, emissive }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}
function lerp(a, b, t) {
  return a + (b - a) * t
}

function Bone({ mat, args, ...props }) {
  return (
    <mesh castShadow material={mat} {...props}>
      <cylinderGeometry args={args} />
    </mesh>
  )
}
function Ball({ mat, r = 0.1, ...props }) {
  return (
    <mesh castShadow material={mat} {...props}>
      <sphereGeometry args={[r, 28, 28]} />
    </mesh>
  )
}

export default function Figure({ target }) {
  const root = useRef()
  const torso = useRef()
  const hips = useRef()
  const head = useRef()
  const visor = useRef()

  const scratch = useMemo(
    () => ({
      localTarget: new THREE.Vector3(),
      headWorld: new THREE.Vector3(),
      toTarget: new THREE.Vector3(),
      facing: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      pose: { lean: 0, shiftX: 0, shoulder: 0, hipDrop: 0, headTilt: 0 },
    }),
    []
  )

  const [bodyMat, jointMat] = useMemo(() => {
    const { bump, emissive } = makeCircuitTextures()
    const body = new THREE.MeshPhysicalMaterial({
      color: '#20252f',
      metalness: 0.94,
      roughness: 0.5,
      bumpMap: bump,
      bumpScale: 0.02,
      roughnessMap: bump,
      emissiveMap: emissive,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.7,
      clearcoat: 0.5,
      clearcoatRoughness: 0.35,
      envMapIntensity: 1.15,
    })
    const joint = new THREE.MeshStandardMaterial({
      color: '#0f131a',
      metalness: 0.95,
      roughness: 0.32,
      envMapIntensity: 1.1,
    })
    return [body, joint]
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const s = scratch

    // Target in the figure's local frame → gaze angles.
    s.localTarget.copy(target.current)
    if (root.current) root.current.worldToLocal(s.localTarget)
    const dx = s.localTarget.x
    const dy = s.localTarget.y - 1.6
    const dz = s.localTarget.z
    const yaw = Math.atan2(dx, dz)
    const pitch = Math.atan2(dy, Math.hypot(dx, dz))
    const h = clamp(yaw / 1.1, -1, 1) // horizontal amount, +right

    // --- Whole-body weight shift toward the entity ---
    const p = s.pose
    p.lean = lerp(p.lean, -h * 0.05, 0.05) // torso leans toward target
    p.shiftX = lerp(p.shiftX, h * 0.06, 0.05) // weight steps toward target
    p.shoulder = lerp(p.shoulder, -h * 0.1, 0.05) // near shoulder drops
    p.hipDrop = lerp(p.hipDrop, h * 0.07, 0.05) // hips counter-tilt
    p.headTilt = lerp(p.headTilt, -h * 0.14, 0.06)

    if (root.current) {
      root.current.position.x = p.shiftX
      root.current.position.y = Math.sin(t * 0.9) * 0.01
      root.current.rotation.z = p.lean + Math.sin(t * 0.5) * 0.003
    }
    if (torso.current) {
      const wantY = clamp(yaw * 0.32, -0.3, 0.3)
      torso.current.rotation.y = lerp(torso.current.rotation.y, wantY, 0.05)
      torso.current.rotation.z = p.shoulder
    }
    if (hips.current) {
      hips.current.rotation.z = p.hipDrop
    }
    if (head.current) {
      const wantY = clamp(yaw, -0.85, 0.85)
      const wantX = clamp(-pitch, -0.45, 0.4)
      head.current.rotation.y = lerp(head.current.rotation.y, wantY, 0.09)
      head.current.rotation.x = lerp(head.current.rotation.x, wantX, 0.09)
      head.current.rotation.z = lerp(head.current.rotation.z, p.headTilt, 0.09)
    }

    // --- Cyan shimmer: micro-lights flicker and travel; brighten toward light ---
    let align = 0.5
    if (head.current) {
      head.current.getWorldPosition(s.headWorld)
      s.toTarget.copy(target.current).sub(s.headWorld).normalize()
      head.current.getWorldQuaternion(s.quat)
      s.facing.set(0, 0, 1).applyQuaternion(s.quat)
      align = clamp(s.toTarget.dot(s.facing), 0, 1)
    }
    const flicker =
      0.62 +
      Math.sin(t * 3.1) * 0.12 +
      Math.sin(t * 11.3) * 0.06 +
      Math.sin(t * 27.7) * 0.03
    bodyMat.emissiveIntensity = flicker + align * 0.5
    if (bodyMat.emissiveMap) bodyMat.emissiveMap.offset.x = t * 0.015
    if (visor.current) {
      visor.current.material.emissiveIntensity = 0.15 + align * align * 1.1
    }
  })

  return (
    <group ref={root}>
      <group ref={torso}>
        <Ball mat={bodyMat} r={0.27} position={[0, 1.28, 0]} scale={[1.02, 0.82, 0.62]} />
        {[-1, 1].map((sd) => (
          <Ball key={`pec${sd}`} mat={bodyMat} r={0.12} position={[0.1 * sd, 1.32, 0.15]} scale={[1, 0.82, 0.55]} />
        ))}
        <Bone mat={bodyMat} args={[0.19, 0.17, 0.36, 24]} position={[0, 1.03, 0]} scale={[1, 1, 0.72]} />
        <mesh castShadow material={jointMat} position={[0, 1.24, 0.19]}>
          <boxGeometry args={[0.2, 0.16, 0.05]} />
        </mesh>
        <mesh castShadow material={jointMat} position={[0, 1.46, 0.04]}>
          <boxGeometry args={[0.34, 0.06, 0.12]} />
        </mesh>
        <Ball mat={bodyMat} r={0.2} position={[0, 0.85, 0]} scale={[1, 0.8, 0.75]} />
        {[-1, 1].map((sd) => (
          <Ball key={`delt${sd}`} mat={bodyMat} r={0.135} position={[0.27 * sd, 1.44, 0]} />
        ))}
        <Bone mat={jointMat} args={[0.07, 0.08, 0.1, 16]} position={[0, 1.52, 0]} />

        {/* Head — featureless mask */}
        <group ref={head} position={[0, 1.63, 0]}>
          <Ball mat={bodyMat} r={0.145} position={[0, 0.02, 0]} scale={[1, 1.12, 1.04]} />
          {/* smooth mask faceplate */}
          <Ball mat={jointMat} r={0.128} position={[0, -0.02, 0.05]} scale={[0.9, 1.05, 0.86]} />
          {[-1, 1].map((sd) => (
            <Bone key={`pod${sd}`} mat={jointMat} args={[0.028, 0.028, 0.05, 12]} position={[0.142 * sd, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} />
          ))}
          {/* subtle directional marking on the mask */}
          <mesh ref={visor} position={[0, 0.0, 0.135]}>
            <boxGeometry args={[0.14, 0.02, 0.03]} />
            <meshStandardMaterial color="#06121a" emissive="#66e6ff" emissiveIntensity={0.15} toneMapped={false} />
          </mesh>
        </group>

        {/* Arms */}
        {[-1, 1].map((sd) => (
          <group key={`arm${sd}`}>
            <Bone mat={bodyMat} args={[0.09, 0.072, 0.32, 18]} position={[0.29 * sd, 1.26, 0]} rotation={[0, 0, 0.13 * sd]} />
            <Ball mat={jointMat} r={0.075} position={[0.315 * sd, 1.09, 0]} />
            <Bone mat={bodyMat} args={[0.07, 0.052, 0.3, 18]} position={[0.325 * sd, 0.94, 0.005]} rotation={[0, 0, 0.06 * sd]} />
            <mesh castShadow material={jointMat} position={[0.33 * sd, 0.76, 0.01]} rotation={[0.1, 0, 0.06 * sd]}>
              <boxGeometry args={[0.075, 0.16, 0.05]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Legs — grouped so the hips can tilt */}
      <group ref={hips}>
        {[-1, 1].map((sd) => (
          <group key={`leg${sd}`}>
            <Ball mat={jointMat} r={0.11} position={[0.12 * sd, 0.82, 0]} />
            <Bone mat={bodyMat} args={[0.125, 0.095, 0.36, 20]} position={[0.13 * sd, 0.63, 0]} />
            <Ball mat={jointMat} r={0.09} position={[0.13 * sd, 0.45, 0]} />
            <Bone mat={bodyMat} args={[0.092, 0.062, 0.36, 20]} position={[0.13 * sd, 0.26, 0]} />
            <Ball mat={jointMat} r={0.062} position={[0.13 * sd, 0.09, 0]} />
            <mesh castShadow material={bodyMat} position={[0.13 * sd, 0.045, 0.06]}>
              <boxGeometry args={[0.15, 0.09, 0.32]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
