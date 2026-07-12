import * as THREE from 'three'

// Soft white radial puddle, tinted per-node via material color. Cached.
let _glow
export function glowTexture() {
  if (_glow) return _glow
  const s = 256
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.3, 'rgba(255,255,255,0.55)')
  g.addColorStop(0.7, 'rgba(255,255,255,0.12)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  _glow = new THREE.CanvasTexture(c)
  _glow.colorSpace = THREE.SRGBColorSpace
  return _glow
}

// Repeating gradient with bright travelling bands — scrolled along the tube to
// read as energy flowing between nodes.
let _flow
export function flowTexture() {
  if (_flow) return _flow
  const w = 256
  const h = 8
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, w, 0)
  g.addColorStop(0.0, '#ff5a10')
  g.addColorStop(0.4, '#ff7a1a')
  g.addColorStop(0.5, '#ffe4c0')
  g.addColorStop(0.6, '#ff7a1a')
  g.addColorStop(1.0, '#ff5a10')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  _flow = new THREE.CanvasTexture(c)
  _flow.wrapS = _flow.wrapT = THREE.RepeatWrapping
  _flow.colorSpace = THREE.SRGBColorSpace
  return _flow
}
