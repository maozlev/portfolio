// Placeholder tile artwork generated on a canvas, returned as data URLs so drei
// <Image> can load them directly. Swap a founder's `img` for a real photo path
// later and it replaces the placeholder with no other changes.

const TONES = {
  cyan: ['#3aa9c4', '#0f2a33'],
  blue: ['#3a5a86', '#111a28'],
  gold: ['#bd9648', '#463619'],
  steel: ['#5b6672', '#20272f'],
  silver: ['#b3bbc6', '#5a616b'],
  teal: ['#2b8fb0', '#0b2028'],
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

function themeIcon(ctx, label, cx, cy, s) {
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = s * 0.05
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  // a simple abstract "node/spark" mark
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2
    const x = cx + Math.cos(a) * s * 0.5
    const y = cy + Math.sin(a) * s * 0.5
    ctx.moveTo(cx, cy)
    ctx.lineTo(x, y)
    ctx.moveTo(x, y)
    ctx.arc(x, y, s * 0.08, 0, Math.PI * 2)
  }
  ctx.stroke()
}

export function makeTileDataURL(item) {
  const W = 820
  const H = 1180
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  const [g1, g2] = TONES[item.tone] || TONES.steel

  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, g1)
  grad.addColorStop(1, g2)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // faint vertical brushed lines
  ctx.globalAlpha = 0.05
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 6) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  if (item.kind === 'founder') {
    silhouette(ctx, W / 2, H * 0.42, 300)
  } else {
    themeIcon(ctx, item.label, W / 2, H * 0.4, 300)
  }

  // vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.7)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, W, H)

  // label
  const text = item.kind === 'founder' ? item.name : item.label
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 12
  const fam = "'Space Grotesk','Segoe UI',sans-serif"
  let size = 62
  ctx.font = `700 ${size}px ${fam}`
  while (ctx.measureText(text).width > W * 0.86 && size > 28) {
    size -= 2
    ctx.font = `700 ${size}px ${fam}`
  }
  ctx.fillText(text, W / 2, H * 0.82)
  if (item.kind === 'founder' && item.role) {
    ctx.shadowBlur = 8
    ctx.font = `500 30px ${fam}`
    ctx.globalAlpha = 0.85
    ctx.fillText(item.role, W / 2, H * 0.87)
    ctx.globalAlpha = 1
  }
  ctx.shadowBlur = 0

  return c.toDataURL()
}
