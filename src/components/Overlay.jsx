import { useEffect, useState } from 'react'
import './overlay.css'

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M4.6 14a8 8 0 1 0 1-6.3L4 9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Overlay({ onNavigate }) {
  const [replayKey, setReplayKey] = useState(0)

  const go = (id) => (e) => {
    e.preventDefault()
    onNavigate?.(id)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  const replayIntro = () => setReplayKey((k) => k + 1)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'f') toggleFullscreen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="overlay" key={replayKey}>
      {/* Top bar */}
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">DANILOV<span className="dot">·</span>LEV</span>
        </div>

        <nav className="nav">
          <a href="#work" onClick={go('map')}>Work</a>
          <a href="#approach" onClick={go('map')}>Approach</a>
          <a href="#contact" onClick={go('contact')}>Contact</a>
        </nav>

        <div className="controls">
          <button className="ctrl" onClick={replayIntro} title="Replay intro" aria-label="Replay intro">
            <ResetIcon />
          </button>
          <button className="ctrl" onClick={toggleFullscreen} title="Fullscreen (F)" aria-label="Fullscreen">
            <FullscreenIcon />
          </button>
        </div>
      </header>

      {/* Hero copy */}
      <main className="hero">
        <p className="eyebrow">AI SOLUTIONS FOR INDUSTRY</p>
        <h1 className="headline">
          <span className="line">We make</span>
          <span className="line">factories <em>think.</em></span>
        </h1>
        <p className="sub">
          Simon Danilov &amp; Maoz Lev build AI systems that turn industrial
          operations into measurable output — less downtime, less waste,
          more done. We take you from idea to a running process, end to end.
        </p>

        <div className="cta">
          <a className="btn btn-primary" href="#contact" onClick={go('contact')}>
            Start your AI process
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a className="btn btn-ghost" href="#work" onClick={go('map')}>Explore our business</a>
        </div>
      </main>

      {/* Footer hint */}
      <footer className="hint">
        <span className="hint-dot" />
        Move your cursor — it&apos;s watching.
      </footer>
    </div>
  )
}
