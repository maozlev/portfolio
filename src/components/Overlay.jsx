import './overlay.css'

export default function Overlay({ onNavigate }) {
  const go = (id) => (e) => {
    e.preventDefault()
    onNavigate?.(id)
  }

  return (
    <div className="overlay">
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
      </header>

      {/* Hero copy */}
      <main className="hero">
        <p className="eyebrow">AI SOLUTIONS FOR EVERY BUSINESS</p>
        <h1 className="headline">
          <span className="line">We make your business</span>
          <span className="line"><em>work smarter.</em></span>
        </h1>
        <p className="sub">
          Simon Danilov &amp; Maoz Lev bring AI into the way you already work —
          gently optimizing your workflows so your team does more with less
          effort, and your business runs at its most productive. We&apos;re with
          you every step, from first idea to a running system.
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
