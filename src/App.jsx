import { useState } from 'react'
import Hero from './components/Hero.jsx'
import BusinessMap from './components/business/BusinessMap.jsx'
import Section from './components/business/Section.jsx'
import WhoWeAre from './components/sections/WhoWeAre.jsx'
import UseCases from './components/sections/UseCases.jsx'

const SECTION_IDS = ['who', 'what', 'use-cases', 'partners', 'process', 'contact']

export default function App() {
  const [view, setView] = useState('hero')

  const isSection = SECTION_IDS.includes(view)

  return (
    <div className="view-fade" key={view}>
      {view === 'hero' && <Hero onNavigate={setView} />}
      {view === 'map' && (
        <BusinessMap onNavigate={setView} onClose={() => setView('hero')} />
      )}
      {view === 'who' && (
        <WhoWeAre onBack={() => setView('map')} onHome={() => setView('hero')} />
      )}
      {view === 'use-cases' && (
        <UseCases onBack={() => setView('map')} onHome={() => setView('hero')} />
      )}
      {isSection && view !== 'who' && view !== 'use-cases' && (
        <Section
          id={view}
          onBack={() => setView('map')}
          onHome={() => setView('hero')}
        />
      )}
    </div>
  )
}
