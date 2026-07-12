import * as THREE from 'three'

// White line-art icons drawn to a canvas, used as an emissive map on each chip.
const S = 256
const cache = {}

function base() {
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')
  ctx.strokeStyle = '#ffffff'
  ctx.fillStyle = '#ffffff'
  ctx.lineWidth = 13
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  return { c, ctx }
}

function dot(ctx, x, y, r) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

const drawers = {
  // Who we are — two people
  people(ctx) {
    const person = (cx) => {
      ctx.beginPath()
      ctx.arc(cx, 96, 26, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, 190, 52, Math.PI * 1.15, Math.PI * 1.85)
      ctx.stroke()
    }
    person(96)
    person(160)
  },

  // What we do — AI spark
  spark(ctx) {
    const cx = 128
    const cy = 128
    const pts = []
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2
      const r = i % 2 === 0 ? 92 : 30
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
    }
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.closePath()
    ctx.stroke()
  },

  // Use cases — stacked data layers
  layers(ctx) {
    const ell = (y) => {
      ctx.beginPath()
      ctx.ellipse(128, y, 72, 20, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(56, 96)
    ctx.lineTo(56, 160)
    ctx.moveTo(200, 96)
    ctx.lineTo(200, 160)
    ctx.stroke()
    ell(160)
    ell(128)
    ell(96)
  },

  // Partners — interlocking rings
  handshake(ctx) {
    ctx.beginPath()
    ctx.arc(104, 128, 48, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(152, 128, 48, 0, Math.PI * 2)
    ctx.stroke()
  },

  // Our process — network hexagon
  network(ctx) {
    const cx = 128
    const cy = 128
    const r = 80
    const pts = []
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
    }
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.closePath()
    ctx.stroke()
    pts.forEach(([x, y]) => dot(ctx, x, y, 12))
    dot(ctx, cx, cy, 10)
  },

  // Start a project — rocket
  rocket(ctx) {
    ctx.beginPath()
    ctx.moveTo(128, 44)
    ctx.bezierCurveTo(172, 90, 172, 150, 128, 182)
    ctx.bezierCurveTo(84, 150, 84, 90, 128, 44)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(128, 108, 18, 0, Math.PI * 2)
    ctx.stroke()
    // fins
    ctx.beginPath()
    ctx.moveTo(96, 150)
    ctx.lineTo(70, 188)
    ctx.lineTo(104, 176)
    ctx.moveTo(160, 150)
    ctx.lineTo(186, 188)
    ctx.lineTo(152, 176)
    ctx.stroke()
    // flame
    ctx.beginPath()
    ctx.moveTo(116, 190)
    ctx.lineTo(128, 216)
    ctx.lineTo(140, 190)
    ctx.stroke()
  },
}

export function iconTexture(name) {
  if (cache[name]) return cache[name]
  const { c, ctx } = base()
  ;(drawers[name] || drawers.spark)(ctx)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  cache[name] = tex
  return tex
}
