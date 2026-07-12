import * as THREE from 'three'
import { extend } from '@react-three/fiber'

/* Curved plane (from the drei carousel example) — bends a plane into a gentle
   arc so the cards feel like a physical ring. */
class BentPlaneGeometry extends THREE.PlaneGeometry {
  constructor(radius = 0.08, ...args) {
    super(...args)
    const p = this.parameters
    const hw = p.width * 0.5
    const a = new THREE.Vector2(-hw, 0)
    const b = new THREE.Vector2(0, radius)
    const c = new THREE.Vector2(hw, 0)
    const ab = new THREE.Vector2().subVectors(a, b)
    const bc = new THREE.Vector2().subVectors(b, c)
    const ac = new THREE.Vector2().subVectors(a, c)
    const r = (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)))
    const center = new THREE.Vector2(0, radius - r)
    const baseV = new THREE.Vector2().subVectors(a, center)
    const baseAngle = baseV.angle() - Math.PI * 0.5
    const arc = baseAngle * 2
    const uv = this.attributes.uv
    const pos = this.attributes.position
    const mainV = new THREE.Vector2()
    for (let i = 0; i < uv.count; i++) {
      const uvRatio = 1 - uv.getX(i)
      const y = pos.getY(i)
      mainV.copy(c).rotateAround(center, arc * uvRatio)
      pos.setXYZ(i, mainV.x, y, -mainV.y)
    }
    pos.needsUpdate = true
  }
}
extend({ BentPlaneGeometry })

const TONES = {
  blue: { g1: '#33507a', g2: '#151f2d', edge: '#5b7aa0', txt: '#eaf2fc' },
  gold: { g1: '#c6a45f', g2: '#6d5a2f', edge: '#e6c987', txt: '#241c07' },
  cyan: { g1: '#8fdcea', g2: '#2c788e', edge: '#b6f2ff', txt: '#052430' },
  silver: { g1: '#d2d8e0', g2: '#878f99', edge: '#eef2f7', txt: '#171d25' },
  steel: { g1: '#59646f', g2: '#2b333c', edge: '#76828f', txt: '#eaf1f8' },
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }
}

function drawIcon(ctx, id, cx, cy, s, color) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = s * 0.05
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  if (id === 'who') {
    for (const d of [-1, 1]) {
      const hx = cx + d * s * 0.17
      ctx.beginPath()
      ctx.arc(hx, cy - s * 0.12, s * 0.12, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(hx, cy + s * 0.2, s * 0.22, Math.PI * 1.15, Math.PI * 1.85)
      ctx.stroke()
    }
  } else if (id === 'use-cases') {
    const w = s * 0.5
    const h = s * 0.62
    const x = cx - w / 2
    const y = cy - h / 2
    roundRect(ctx, x, y, w, h, s * 0.06)
    ctx.stroke()
    roundRect(ctx, cx - s * 0.12, y - s * 0.06, s * 0.24, s * 0.12, s * 0.04)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + w * 0.24, y + h * 0.52)
    ctx.lineTo(x + w * 0.44, y + h * 0.7)
    ctx.lineTo(x + w * 0.78, y + h * 0.34)
    ctx.stroke()
  } else if (id === 'what') {
    const gx = cx - s * 0.13
    const gy = cy + s * 0.03
    const gr = s * 0.14
    ctx.beginPath()
    ctx.arc(gx, gy, gr, 0, Math.PI * 2)
    ctx.stroke()
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(gx + Math.cos(a) * gr, gy + Math.sin(a) * gr)
      ctx.lineTo(gx + Math.cos(a) * (gr + s * 0.05), gy + Math.sin(a) * (gr + s * 0.05))
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.arc(gx, gy, gr * 0.4, 0, Math.PI * 2)
    ctx.stroke()
    const bx = cx + s * 0.17
    const by = cy - s * 0.13
    const br = s * 0.11
    ctx.beginPath()
    ctx.arc(bx, by, br, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(bx - br * 0.5, by + br * 1.2)
    ctx.lineTo(bx + br * 0.5, by + br * 1.2)
    ctx.moveTo(bx - br * 0.32, by + br * 1.6)
    ctx.lineTo(bx + br * 0.32, by + br * 1.6)
    ctx.stroke()
  } else if (id === 'partners') {
    ctx.beginPath()
    ctx.arc(cx - s * 0.1, cy, s * 0.16, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx + s * 0.1, cy, s * 0.16, 0, Math.PI * 2)
    ctx.stroke()
  } else if (id === 'contact') {
    const w = s * 0.5
    const h = s * 0.34
    const x = cx - w / 2
    const y = cy - h / 2
    roundRect(ctx, x, y, w, h, s * 0.04)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y + h * 0.16)
    ctx.lineTo(cx, y + h * 0.62)
    ctx.lineTo(x + w, y + h * 0.16)
    ctx.stroke()
  }
  ctx.restore()
}

export function makeCardTexture(item) {
  const W = 512
  const H = 690
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  const tone = TONES[item.tone] || TONES.steel

  const draw = () => {
    ctx.clearRect(0, 0, W, H)
    const pad = 10
    const r = 48
    ctx.save()
    roundRect(ctx, pad, pad, W - 2 * pad, H - 2 * pad, r)
    ctx.clip()
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, tone.g1)
    g.addColorStop(1, tone.g2)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    const hl = ctx.createLinearGradient(0, 0, 0, H * 0.45)
    hl.addColorStop(0, 'rgba(255,255,255,0.2)')
    hl.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = hl
    ctx.fillRect(0, 0, W, H * 0.45)
    ctx.restore()

    ctx.save()
    roundRect(ctx, pad + 3, pad + 3, W - 2 * pad - 6, H - 2 * pad - 6, r - 3)
    ctx.lineWidth = 4
    ctx.strokeStyle = tone.edge
    ctx.globalAlpha = 0.85
    ctx.stroke()
    ctx.restore()

    drawIcon(ctx, item.id, W / 2, H * 0.4, W * 0.34, tone.txt)

    ctx.save()
    ctx.fillStyle = tone.txt
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.direction = item.dir || 'ltr'
    const fam = "'Heebo','Segoe UI',sans-serif"
    let size = 58
    ctx.font = `700 ${size}px ${fam}`
    const maxW = W * 0.78
    while (ctx.measureText(item.label).width > maxW && size > 24) {
      size -= 2
      ctx.font = `700 ${size}px ${fam}`
    }
    ctx.fillText(item.label, W / 2, H * 0.72)
    ctx.restore()
  }

  draw()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      draw()
      tex.needsUpdate = true
    })
  }
  return tex
}
