// The six business nodes. `pos` is [x, y, z] on the grid floor; the connecting
// line runs through them in array order. Each links to a section of the app.
export const NODES = [
  {
    id: 'who',
    label: 'Who we are',
    tagline: 'Two engineers, one obsession: your output.',
    pos: [-8, 0, 0.5],
    color: '#ff8a2a',
    icon: 'people',
  },
  {
    id: 'what',
    label: 'What we do',
    tagline: 'AI systems wired into how you actually operate.',
    pos: [-4.5, 0, -2.6],
    color: '#33d6ff',
    icon: 'spark',
  },
  {
    id: 'use-cases',
    label: 'Use cases',
    tagline: 'Where AI already pays for itself.',
    pos: [-1, 0, 1.2],
    color: '#37ff7a',
    icon: 'layers',
  },
  {
    id: 'partners',
    label: 'Partners',
    tagline: 'Simon Danilov & Maoz Lev.',
    pos: [0.5, 0, 4.2],
    color: '#b06cff',
    icon: 'handshake',
  },
  {
    id: 'process',
    label: 'Our process',
    tagline: 'From idea to a running system.',
    pos: [4.8, 0, -1.8],
    color: '#ff3d8b',
    icon: 'network',
  },
  {
    id: 'contact',
    label: 'Start a project',
    tagline: "Let's make your operation think.",
    pos: [7, 0, 2.6],
    color: '#ff5630',
    icon: 'rocket',
  },
]
