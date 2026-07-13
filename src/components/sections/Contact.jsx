import './sections.css'

const EMAIL = 'maozlev9@gmail.com'
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent("Let's talk about my business")}`

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

function IconEye() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" {...P}>
      <path d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16z" />
      <circle cx="16" cy="16" r="3.4" />
    </svg>
  )
}
function IconTarget() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" {...P}>
      <circle cx="16" cy="16" r="11" />
      <circle cx="16" cy="16" r="5.5" />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" />
    </svg>
  )
}
function IconBolt() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" {...P}>
      <path d="M17 3 6 18h8l-1 11 11-15h-8z" />
    </svg>
  )
}

const POINTS = [
  {
    Icon: IconEye,
    title: 'We spot the hidden drag',
    body:
      'The repetitive steps, waiting and rework that have quietly become invisible — because "that’s just how it’s always been done."',
  },
  {
    Icon: IconTarget,
    title: 'We solve the real problem',
    body:
      'Not the symptom. We get to the root of what’s slowing you down and build something that actually holds up day to day.',
  },
  {
    Icon: IconBolt,
    title: 'We optimize what you already have',
    body:
      'More output from the people, data and tools you already own — no rip-and-replace, no disruption to how your team works.',
  },
]

export default function Contact({ onBack, onHome }) {
  return (
    <section className="sec usecases">
      <div className="sec-decor" />

      <nav className="sec-nav">
        <button className="ghost-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <button className="ghost-btn" onClick={onHome}>Home</button>
      </nav>

      <div className="uc-inner">
        <header className="uc-head">
          <p className="sec-eyebrow">START A PROJECT</p>
          <h1 className="uc-title">Let&apos;s find what&apos;s slowing you down.</h1>
          <p className="uc-lead">
            Most businesses are carrying inefficiencies they&apos;ve long stopped
            noticing. We map how your operation actually runs and show you where
            AI can quietly take the weight off — and the biggest wins are usually
            the ones you didn&apos;t know were even possible.
          </p>
        </header>

        <div className="uc-grid">
          {POINTS.map((p, i) => (
            <article className="uc-card" key={i} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
              <span className="uc-icon">
                <p.Icon />
              </span>
              <h3 className="uc-card-title">{p.title}</h3>
              <p className="uc-card-body">{p.body}</p>
            </article>
          ))}
        </div>

        <div className="contact-cta">
          <div className="cta-text">
            <h2 className="cta-title">Tell us about your business.</h2>
            <p className="cta-sub">
              A short, no-pressure conversation — we&apos;ll show you what&apos;s
              possible. No jargon, no commitment.
            </p>
          </div>
          <div className="cta-actions">
            <a className="btn-cta" href={MAILTO}>
              Email us
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a className="cta-mail" href={MAILTO}>{EMAIL}</a>
          </div>
        </div>
      </div>
    </section>
  )
}
