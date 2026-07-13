import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Sets a photo as the scene backdrop, dimmed so foreground content stays readable.
export default function Background3D({ url = '/bg.jpg', intensity = 0.55 }) {
  const tex = useTexture(url)
  const { scene } = useThree()

  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    const prev = scene.background
    const prevI = scene.backgroundIntensity
    scene.background = tex
    scene.backgroundIntensity = intensity
    return () => {
      scene.background = prev
      scene.backgroundIntensity = prevI
    }
  }, [tex, scene, intensity])

  return null
}
