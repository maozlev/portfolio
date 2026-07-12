import { Suspense, lazy, useState } from 'react'
import Overlay from './Overlay.jsx'

// react-spline pulls in the Spline runtime; load it lazily so it never blocks
// the rest of the app.
const Spline = lazy(() => import('@splinetool/react-spline'))

const SCENE_URL = 'https://prod.spline.design/ASauDWMg5jB64HeX/scene.splinecode'

export default function Hero({ onNavigate }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="view view--hero" style={{ position: 'fixed', inset: 0 }}>
      <div className={`spline-wrap ${loaded ? 'is-loaded' : ''}`}>
        <Suspense fallback={null}>
          <Spline scene={SCENE_URL} onLoad={() => setLoaded(true)} />
        </Suspense>
      </div>

      {!loaded && (
        <div className="hero-loading">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
      )}

      <Overlay onNavigate={onNavigate} />
    </div>
  )
}
