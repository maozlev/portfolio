import { Icons } from './FanIcons.jsx'
import './fan.css'

// Phone layout for the business hub: a readable vertical list of tappable cards
// instead of the 3D gallery (which only works in landscape).
const ITEMS = [
  { id: 'who', label: 'Who We Are', tone: 'blue', Icon: Icons.Who },
  { id: 'what', label: 'Our Expertise', tone: 'cyan', Icon: Icons.Expertise },
  { id: 'use-cases', label: 'Use Cases', tone: 'gold', Icon: Icons.Cases },
  { id: 'partners', label: 'Partners', tone: 'silver', Icon: Icons.Partners },
  { id: 'contact', label: 'Contact', tone: 'steel', Icon: Icons.Contact },
]

export default function MobileMenu({ onNavigate, onClose }) {
  return (
    <div className="mmenu">
      <header className="mmenu-head">
        <p className="sec-eyebrow">OUR BUSINESS</p>
        <h1 className="mmenu-title">Explore what we do</h1>
      </header>

      <div className="mmenu-list">
        {ITEMS.map((it) => (
          <button key={it.id} className={`mmenu-card tone-${it.tone}`} onClick={() => onNavigate(it.id)}>
            <span className="mmenu-icon">
              <it.Icon />
            </span>
            <span className="mmenu-label">{it.label}</span>
            <svg className="mmenu-arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>

      <button className="mmenu-home" onClick={onClose}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M4 11l8-7 8 7M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Home
      </button>
    </div>
  )
}
