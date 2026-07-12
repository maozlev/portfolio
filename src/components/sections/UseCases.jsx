import './sections.css'

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

function IconFactory() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" {...P}>
      <path d="M4 27V14l7 4V14l7 4V9l6 3v15z" />
      <path d="M4 27h24" />
      <path d="M8 22v2M14 22v2M20 22v2" />
    </svg>
  )
}
function IconFlow() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" {...P}>
      <circle cx="7" cy="8" r="3" />
      <circle cx="25" cy="8" r="3" />
      <circle cx="16" cy="24" r="3" />
      <path d="M10 8h12M8.5 10.6l6 10.8M23.5 10.6l-6 10.8" />
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
function IconEye() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" {...P}>
      <path d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16z" />
      <circle cx="16" cy="16" r="3.4" />
    </svg>
  )
}

const CASES = [
  {
    Icon: IconFactory,
    title: 'Factories that run smarter',
    body:
      'We wire AI straight into your production line — reading the machines, spotting slowdowns, and predicting failures before they ever stop the belt. The same floor, the same shift, but measurably more finished product out the door.',
    tag: 'Less downtime · more throughput',
  },
  {
    Icon: IconFlow,
    title: 'Every process, tightened',
    body:
      'From raw material to shipped order, we map where time, energy and money quietly leak — then rebuild the flow with AI-driven scheduling, live quality checks and decisions made in real time, so nothing sits waiting.',
    tag: 'Fewer bottlenecks · zero guesswork',
  },
  {
    Icon: IconBolt,
    title: 'Automation for the whole business',
    body:
      'Quotes, orders, inventory, reports, routine customer replies — the repetitive work that eats your team’s day gets handed to reliable AI agents. Your people stop pushing paper and get back to the work that actually needs them.',
    tag: 'Hours back · every single day',
  },
  {
    Icon: IconEye,
    title: 'Eyes on every unit',
    body:
      'Computer-vision inspection catches defects the instant they appear — consistent, tireless and far faster than a manual check. Quality problems get flagged on the line, long before they ever reach a customer.',
    tag: 'Catch defects early · protect the brand',
  },
]

export default function UseCases({ onBack, onHome }) {
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
          <p className="sec-eyebrow">USE CASES</p>
          <h1 className="uc-title">Where AI earns its keep.</h1>
          <p className="uc-lead">
            The factory floor is where intelligence turns into output. We embed AI
            into the machinery of how you actually operate — the lines, the
            schedules, the paperwork — and turn raw activity into measured,
            compounding results. Less waste, fewer surprises, and far more done
            with the people and equipment you already have.
          </p>
        </header>

        <div className="uc-grid">
          {CASES.map((c, i) => (
            <article className="uc-card" key={i} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
              <span className="uc-icon">
                <c.Icon />
              </span>
              <h3 className="uc-card-title">{c.title}</h3>
              <p className="uc-card-body">{c.body}</p>
              <span className="uc-tag">{c.tag}</span>
            </article>
          ))}
        </div>

        <p className="uc-foot">
          Every engagement is built for your operation specifically — no templates,
          no shelfware. We take it from first idea to a system that runs on your
          floor and keeps paying for itself.
        </p>
      </div>
    </section>
  )
}
