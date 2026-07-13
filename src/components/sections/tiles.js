import * as THREE from 'three'

// Poster artwork drawn on a canvas. Each section gets a distinct, 3D-shaded
// tool icon. Exposed as a data URL and as a sharp (anisotropic) CanvasTexture.

const W = 820
const H = 1180

const TONES = {
  cyan: ['#3aa9c4', '#0f2a33'],
  blue: ['#3a5a86', '#111a28'],
  gold: ['#bd9648', '#463619'],
  steel: ['#5b6672', '#20272f'],
  silver: ['#b3bbc6', '#5a616b'],
  teal: ['#2b8fb0', '#0b2028'],
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else {
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }
}

function metalFill(ctx, cy, s) {
  const g = ctx.createLinearGradient(0, cy - s * 0.6, 0, cy + s * 0.6)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.55, '#eef1f5')
  g.addColorStop(1, '#aab4c2')
  return g
}

function silhouette(ctx, cx, cy, s) {
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath()
  ctx.arc(cx, cy - s * 0.42, s * 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(cx - s * 0.62, cy + s * 0.75)
  ctx.quadraticCurveTo(cx - s * 0.6, cy + s * 0.05, cx, cy + s * 0.05)
  ctx.quadraticCurveTo(cx + s * 0.6, cy + s * 0.05, cx + s * 0.62, cy + s * 0.75)
  ctx.closePath()
  ctx.fill()
}

// 3D-ish tool icons — filled with a top-lit metal gradient + a soft drop shadow.
function drawIcon(ctx, key, cx, cy, s) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = s * 0.1
  ctx.shadowOffsetY = s * 0.05
  ctx.fillStyle = metalFill(ctx, cy, s)

  if (key === 'gear') {
    const R = s * 0.4
    const tW = s * 0.15
    const tH = s * 0.17
    ctx.save()
    ctx.translate(cx, cy)
    for (let i = 0; i < 8; i++) {
      ctx.save()
      ctx.rotate((i / 8) * Math.PI * 2)
      roundRect(ctx, -tW / 2, -R - tH * 0.55, tW, tH, tW * 0.25)
      ctx.fill()
      ctx.restore()
    }
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    ctx.shadowColor = 'transparent'
    ctx.fillStyle = 'rgba(24,30,40,0.9)'
    ctx.beginPath()
    ctx.arc(cx, cy, s * 0.15, 0, Math.PI * 2)
    ctx.fill()
  } else if (key === 'people') {
    const person = (dx, sc) => {
      ctx.beginPath()
      ctx.arc(cx + dx, cy - s * 0.16, s * 0.16 * sc, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx + dx - s * 0.26 * sc, cy + s * 0.38 * sc)
      ctx.quadraticCurveTo(cx + dx - s * 0.26 * sc, cy + s * 0.04, cx + dx, cy + s * 0.04)
      ctx.quadraticCurveTo(cx + dx + s * 0.26 * sc, cy + s * 0.04, cx + dx + s * 0.26 * sc, cy + s * 0.38 * sc)
      ctx.closePath()
      ctx.fill()
    }
    person(-s * 0.16, 0.88)
    person(s * 0.18, 1)
  } else if (key === 'layers') {
    const w = s * 0.5
    const h = s * 0.15
    const shades = ['#aab4c2', '#dfe4ea', '#ffffff']
    for (let i = 0; i < 3; i++) {
      const yy = cy + (1 - i) * h * 1.15
      ctx.fillStyle = shades[i]
      ctx.beginPath()
      ctx.moveTo(cx, yy - h)
      ctx.lineTo(cx + w, yy)
      ctx.lineTo(cx, yy + h)
      ctx.lineTo(cx - w, yy)
      ctx.closePath()
      ctx.fill()
    }
  } else if (key === 'handshake') {
    const ring = (dx) => {
      ctx.beginPath()
      ctx.arc(cx + dx, cy, s * 0.25, 0, Math.PI * 2)
      ctx.arc(cx + dx, cy, s * 0.14, 0, Math.PI * 2, true)
      ctx.fill('evenodd')
    }
    ring(-s * 0.15)
    ring(s * 0.15)
  } else if (key === 'mail') {
    const w = s * 0.64
    const h = s * 0.44
    const x = cx - w / 2
    const y = cy - h / 2
    roundRect(ctx, x, y, w, h, s * 0.05)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.strokeStyle = 'rgba(30,38,48,0.75)'
    ctx.lineWidth = s * 0.03
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(x + s * 0.03, y + h * 0.14)
    ctx.lineTo(cx, y + h * 0.56)
    ctx.lineTo(x + w - s * 0.03, y + h * 0.14)
    ctx.stroke()
  }
  ctx.restore()
}

function drawTile(item, canvas) {
  const c = canvas || document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  const [g1, g2] = TONES[item.tone] || TONES.steel

  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, g1)
  grad.addColorStop(1, g2)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  if (item.kind === 'founder') silhouette(ctx, W / 2, H * 0.4, 300)
  else drawIcon(ctx, item.icon || 'gear', W / 2, H * 0.37, 300)

  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.72)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(0,0,0,0.4)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, W, H)

  // bottom scrim so the label stays legible over any poster
  const scrim = ctx.createLinearGradient(0, H * 0.56, 0, H)
  scrim.addColorStop(0, 'rgba(0,0,0,0)')
  scrim.addColorStop(1, 'rgba(0,0,0,0.82)')
  ctx.fillStyle = scrim
  ctx.fillRect(0, H * 0.56, W, H * 0.44)

  const text = item.kind === 'founder' ? item.name : item.label || ''
  const fam = "'Space Grotesk','Segoe UI',sans-serif"
  const hasRole = item.kind === 'founder' && item.role
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.shadowColor = 'rgba(0,0,0,0.9)'
  ctx.shadowBlur = 18
  let size = 100
  ctx.font = `800 ${size}px ${fam}`
  while (ctx.measureText(text).width > W * 0.9 && size > 42) {
    size -= 2
    ctx.font = `800 ${size}px ${fam}`
  }
  ctx.fillText(text, W / 2, hasRole ? H * 0.85 : H * 0.9)
  if (hasRole) {
    ctx.shadowBlur = 8
    ctx.font = `500 34px ${fam}`
    ctx.globalAlpha = 0.88
    ctx.fillText(item.role, W / 2, H * 0.92)
    ctx.globalAlpha = 1
  }
  ctx.shadowBlur = 0
  return c
}

export function makeTileDataURL(item) {
  return drawTile(item).toDataURL()
}

export function makeTileTexture(item) {
  const c = drawTile(item)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 16
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      drawTile(item, c)
      tex.needsUpdate = true
    })
  }
  return tex
}
