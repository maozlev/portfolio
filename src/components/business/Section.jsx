import { NODES } from './nodes.js'
import './business.css'

export default function Section({ id, onBack, onHome }) {
  const node = NODES.find((n) => n.id === id) || NODES[0]

  return (
    <div className="section" style={{ '--c': node.color }}>
      <div className="section-glow" />

      <nav className="section-nav">
        <button className="ghost-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to map
        </button>
        <button className="ghost-btn" onClick={onHome}>Home</button>
      </nav>

      <main className="section-body">
        <p className="section-eyebrow">{String(NODES.indexOf(node) + 1).padStart(2, '0')} — OUR BUSINESS</p>
        <h1 className="section-title">{node.label}</h1>
        <p className="section-tag">{node.tagline}</p>
        <p className="section-soon">
          This section is next on the build list. Tell me what you want here and
          I&apos;ll bring it to life with the same 3D treatment.
        </p>
      </main>
    </div>
  )
}
