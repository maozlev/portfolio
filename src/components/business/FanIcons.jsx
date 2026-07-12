// Outline icons for the fan segments. Each animates subtly on hover via CSS
// hooks (classes on <g> / elements referenced from fan.css).
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

function Who() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" {...P}>
      <circle cx="20" cy="12" r="4" />
      <circle cx="11" cy="24" r="3.4" />
      <circle cx="29" cy="24" r="3.4" />
      <path d="M20 16v6M17 20l-4 2M23 20l4 2" />
      <path d="M20 27c-4 0-6 2-6 5M20 27c4 0 6 2 6 5" className="ico-soft" />
    </svg>
  )
}

function Cases() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" {...P}>
      <rect x="9" y="7" width="18" height="24" rx="2.5" />
      <path d="M14 7v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
      <path d="M13 15l2 2 4-4" className="ico-check" />
      <path d="M13 23h8M13 27h5" />
      <circle cx="28" cy="26" r="6" className="ico-clock" />
      <path d="M28 23v3l2 1.5" className="ico-clock" />
    </svg>
  )
}

function Expertise() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" {...P}>
      <g className="ico-gear">
        <circle cx="14" cy="24" r="4.5" />
        <path d="M14 17v-2M14 33v-2M7 24H5M23 24h-2M9 19l-1.5-1.5M20 30l-1.5-1.5M9 29l-1.5 1.5M20 18l-1.5 1.5" />
      </g>
      <g className="ico-bulb">
        <path d="M27 6a7 7 0 0 0-4 12.8V22h8v-3.2A7 7 0 0 0 27 6z" />
        <path d="M24 25h6M25 28h4" />
      </g>
    </svg>
  )
}

function Partners() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" {...P}>
      <path d="M6 18l5-4 5 3 4-1" />
      <path d="M34 18l-5-4-5 3" />
      <path d="M20 19l3.5 3.2a2 2 0 0 1-2.7 3l-1.3-1.1" className="ico-shake" />
      <path d="M16 16l-4 3.5a2 2 0 0 0 2.6 3l2.4-2 2.5 2.2a2 2 0 0 0 2.8-2.9L20 19" className="ico-shake" />
    </svg>
  )
}

function Contact() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" {...P}>
      <rect x="6" y="10" width="20" height="14" rx="2" />
      <path d="M6.5 11l9.5 7 9.5-7" className="ico-flap" />
      <path d="M27 24c2 3 5 5 8 5v-3l-3.5-1-1.5 1.5-3-3 1.5-1.5L27 18h-3c0 2 1 4 3 6z" className="ico-phone" />
    </svg>
  )
}

export const Icons = { Who, Cases, Expertise, Partners, Contact }
