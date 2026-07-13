import { useEffect, useState } from 'react'

// True when the viewport is phone-sized. Re-evaluates on resize/orientation.
export function useIsMobile(bp = 768) {
  const get = () => (typeof window !== 'undefined' ? window.innerWidth < bp : false)
  const [mobile, setMobile] = useState(get)
  useEffect(() => {
    const on = () => setMobile(get())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [bp])
  return mobile
}
