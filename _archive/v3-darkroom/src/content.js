/* ═══════════════════════════════════════════════════════════════
   CONTENT — every word on this site lives here.
   Edit this file, not the components.

   Rule: nothing here is invented.
   - Roles, dates and education come from public/resume.pdf.
   - Project stacks and build notes were checked against the live
     bundles (September 2026). Bundle sizes are gzipped, as served.
   - Screenshots in public/work/ are captures of the live sites,
     named after each project id: <id>-1600.webp and <id>-800.webp.
   - <id>-reel.webp is six 1280 × 800 frames captured while scrolling
     each live site (November 2026), stacked with an 18px gap.
   ═══════════════════════════════════════════════════════════════ */

export const meta = {
  name: 'Anshul Sharma',
  role: 'Creative Developer',
  // the signature prefix used by every build/experiment notation
  mark: 'AS',
  email: 'anshulhere9898@gmail.com',
  phone: '+91 62305 73962',
  // city only — a street address does not belong on a public page
  location: 'Panchkula, India',
  available: 'Available for work',
  resume: '/resume.pdf',
}

// Only profiles the owner has supplied. GitHub and LinkedIn go here once they exist.
export const social = [{ label: 'Instagram', handle: '@cyber._dgaf', href: 'https://instagram.com/cyber._dgaf' }]

export const nav = [
  { label: 'Work', id: 'work' },
  { label: 'Lab', id: 'experiments' },
  { label: 'Capabilities', id: 'capabilities' },
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'experience' },
  { label: 'Contact', id: 'contact' },
]

export const hero = {
  slate: ['Panchkula / India', 'Creative development', String(new Date().getFullYear())],
  lines: ['Creative', 'Developer'],
  serif: 'code that moves like film.',
  // the literal half of the statement, right under the emotional half
  lede: 'I design and build interactive websites — code, motion, 3D and visual systems working as one piece.',
  ctas: [
    { label: 'View selected work', id: 'work' },
    { label: 'Explore the lab', id: 'experiments' },
  ],
}

/* ── Work ─────────────────────────────────────────────────────────
   All four are self-initiated concepts for fictional brands, designed
   and built solo, and live. The first entry is featured.

   dna     — the build's short signature, shown in its notation
   stack   — what the shipped bundle actually contains
   system  — how the pieces connect, in order of data flow
   notes   — build facts; numbers are measured, never estimated */
export const projects = [
  {
    id: 'atelier-vance',
    number: '01',
    title: 'Atelier Vance',
    category: 'Architecture studio',
    type: 'Concept build',
    role: 'Design & development',
    year: '2025',
    dna: ['3D', 'Editorial'],
    summary: 'A site for a fictional architecture practice — editorial type over photography, with a 3D massing model loaded on demand.',
    stack: ['React', 'Three.js', 'GSAP', 'ScrollTrigger', 'Lenis'],
    href: 'https://mediumslateblue-meerkat-957815.hostingersite.com',
    palette: { bg: '#0e0d0b', accent: '#b8a58c' },
    system: [
      ['Lenis', 'smooths wheel input'],
      ['ScrollTrigger', 'maps scroll to timelines'],
      ['React', 'owns layout and state'],
      ['Dynamic import', 'loads the 3D chunk separately'],
      ['Three.js', 'renders the massing model'],
    ],
    notes: [
      ['Loading', 'Main bundle 159 KB. Three.js (230 KB) is split into its own chunk and loaded through a dynamic import, outside the main bundle.'],
      ['Rendering', 'A Three.js massing model, isolated in its own component chunk (under 1 KB of scene code).'],
      ['Motion', 'GSAP ScrollTrigger timelines over Lenis-smoothed scroll.'],
    ],
    study: {
      overview: 'An architecture studio site that behaves like a monograph: large serif statements, restrained navigation, and room around everything.',
      problem: 'Architecture sites tend to be either image grids or overdesigned. The work needs room, and the interface needs to get out of its way.',
      approach: 'Photography carries the first impression and the type sits inside it rather than beside it. A 3D massing model shows form in a way a photograph cannot.',
      build: 'The expensive part — Three.js — is kept out of the main bundle. It arrives as its own chunk through a dynamic import, so the page and photography do not wait on it.',
      result: 'Live. A self-initiated concept: no client, and no traffic or business metrics to report.',
    },
  },
  {
    id: 'kissa',
    number: '02',
    title: 'KISSA 余白',
    category: 'Café · Tokyo',
    type: 'Concept build',
    role: 'Design & development',
    year: '2025',
    dna: ['Type', '3D'],
    summary: 'A quiet kissaten in Tokyo, built around 余白 — the Japanese idea of meaningful empty space.',
    stack: ['React', 'Three.js', 'GSAP', 'ScrollTrigger', 'Lenis'],
    href: 'https://lightblue-sardine-114319.hostingersite.com',
    palette: { bg: '#0f0d0b', accent: '#c9b79c' },
    system: [
      ['Lenis', 'slows the page down'],
      ['ScrollTrigger', 'paces the reveals'],
      ['React', 'sets the typography'],
      ['Lazy chunk', 'holds the 3D scene'],
      ['Three.js', 'renders the scene'],
    ],
    notes: [
      ['Loading', 'Main bundle 172 KB. The Three.js scene is a separate 251 KB chunk, kept out of the main bundle.'],
      ['Type', 'Shippori Mincho B1 for Japanese, set against an oversized Latin serif.'],
      ['Motion', 'Slow GSAP ScrollTrigger reveals over Lenis. Very little moves, on purpose.'],
    ],
    study: {
      overview: 'A site for an old-fashioned Tokyo coffee house. The whole design is an exercise in leaving things out.',
      problem: 'Most café sites shout. A kissaten is the opposite, and the site had to feel quiet without feeling empty.',
      approach: 'Paper-toned ground, enormous serif type against Shippori Mincho, almost no interface chrome, and slow, sparse motion.',
      build: 'The 3D scene is the heaviest thing on the page, so it lives in its own chunk instead of weighing down the typography and layout code.',
      result: 'Live. A self-initiated concept: no client, and no traffic or business metrics to report.',
    },
  },
  {
    id: 'aura',
    number: '03',
    title: 'AURA HYPER-GT',
    category: 'WebGL showroom',
    type: 'Concept build',
    role: 'Design & development',
    year: '2025',
    dna: ['WebGL', 'Scroll'],
    summary: 'A scroll-driven showroom for a fictional 1,450 hp electric hyper-tourer — the product reveal staged like a film.',
    stack: ['React', 'Three.js', 'postprocessing', 'GSAP', 'ScrollTrigger', 'Lenis', 'Web Audio'],
    href: 'https://seagreen-panther-924930.hostingersite.com',
    palette: { bg: '#07090c', accent: '#d9652b' },
    system: [
      ['Lenis', 'smooths wheel input'],
      ['ScrollTrigger', 'steps through nine stages'],
      ['Three.js', 'moves camera and lights per stage'],
      ['postprocessing', 'adds bloom, vignette and noise'],
      ['Web Audio', 'plays sound, muted by default'],
    ],
    notes: [
      ['Structure', 'Nine scroll-driven stages, from a dark standby state to a four-finish configurator.'],
      ['Rendering', 'Three.js with a pmndrs postprocessing chain (bloom, vignette, noise). The car is built in code; no model file is loaded.'],
      ['Trade-off', 'Everything ships in one 343 KB bundle — Three.js is not code-split here. It is the first thing I would change.'],
    ],
    study: {
      overview: 'A launch site for a car that does not exist. The brief I set: make a browser tab feel like the first minute of a product film.',
      problem: 'Car launch pages lean on video, which is heavy, fixed, and ignores the visitor. I wanted the reveal rendered in real time and driven by the scroll.',
      approach: 'The page is a sequence of nine staged shots. Scroll moves the camera and lighting between them, and the type changes between shots rather than on top of them.',
      build: 'A real-time Three.js scene with a post-processing pass for the light. Audio is available but never plays until the visitor asks for it.',
      result: 'Live. A self-initiated concept: no client, and no traffic or business metrics to report.',
    },
  },
  {
    id: 'amber-stone',
    number: '04',
    title: 'AMBER & STONE',
    category: 'Roastery & bakery',
    type: 'Concept build',
    role: 'Design & development',
    year: '2025',
    dna: ['Type', 'Motion'],
    summary: 'A roastery, bakery and daylight kitchen — a warm editorial layout set in Cormorant Garamond.',
    stack: ['React', 'GSAP', 'ScrollTrigger', 'Lenis', 'Web Audio'],
    href: 'https://saddlebrown-swallow-946040.hostingersite.com',
    palette: { bg: '#100d0a', accent: '#c88a58' },
    system: [
      ['Lenis', 'smooths wheel input'],
      ['ScrollTrigger', 'paces reveals like turning pages'],
      ['React', 'builds the editorial layout'],
      ['Web Audio', 'plays optional café ambience'],
    ],
    notes: [
      ['Rendering', 'No WebGL. DOM, CSS and typography only — the effort went into rhythm instead.'],
      ['Loading', 'One 136 KB bundle, the lightest of the four.'],
      ['Sound', 'An optional café ambience track, muted until switched on.'],
    ],
    study: {
      overview: 'A brand site for a single-origin roastery with a sourdough bakery and a daytime kitchen.',
      problem: 'Food brands live on warmth and texture, and both disappear on a screen.',
      approach: 'Warm earth tones, a classical serif, generous margins, and scroll reveals paced like turning the pages of a menu.',
      build: 'Deliberately no 3D. The whole budget went into typography, pacing, and one small piece of sound.',
      result: 'Live. A self-initiated concept: no client, and no traffic or business metrics to report.',
    },
  },
]

/* ── Lab ──────────────────────────────────────────────────────────
   Descriptions match what each study actually does on this page. */
export const experiments = [
  {
    number: '001',
    title: 'Orbit Field',
    field: 'Canvas 2D',
    body: 'Sixty particles orbit a centre that follows the pointer. Depth is faked with size and alpha — no WebGL.',
  },
  {
    number: '002',
    title: 'Ember Drift',
    field: 'Generative',
    body: 'A gradient that re-aims itself at the pointer every frame, dusted with drifting points. One hue, many temperatures.',
  },
  {
    number: '003',
    title: 'Scroll Velocity',
    field: 'Motion',
    body: 'Bars that stretch with how fast you are scrolling this page, and settle when you stop.',
  },
  {
    number: '004',
    title: 'Kinetic Type',
    field: 'Interface',
    body: 'Letters that lift, stretch and skew in sequence on hover or keyboard focus — type treated as a material.',
  },
]

/* ── Capabilities ─────────────────────────────────────────────────
   "Shipped in" is derived from project stacks, never written by hand.
   `proof` is for capabilities demonstrated by this site itself. */
export const capabilities = [
  {
    title: 'Creative development',
    body: 'Scroll-driven pages, choreography, and interfaces that answer the visitor.',
    tech: ['GSAP', 'ScrollTrigger', 'Lenis', 'Motion'],
  },
  {
    title: '3D & WebGL',
    body: 'Real-time scenes that load only when they are needed.',
    tech: ['Three.js', 'React Three Fiber', 'GLSL', 'Blender', 'Unity'],
    proof: 'The light this whole page is shown in is one hand-written GLSL shader on raw WebGL — no 3D library.',
  },
  {
    title: 'Design engineering',
    body: 'Component architecture, design tokens, and responsive systems that stay consistent.',
    tech: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Git'],
  },
  {
    title: 'Full stack',
    body: 'APIs and data behind the interface.',
    tech: ['Node.js', 'Express', 'MongoDB'],
  },
  {
    title: 'Performance',
    body: 'Heavy things load late and stop when nobody is looking.',
    tech: ['Raw WebGL', 'IntersectionObserver', 'Responsive images', 'Lazy loading'],
    proof: 'This page ships no 3D library, renders its shader at a lower resolution and frame rate on phones, stops it when the tab is hidden, and pauses every Lab loop off-screen. The footer shows what your browser actually downloaded.',
  },
  {
    title: 'Networks & marketing',
    body: 'The work outside the browser: network infrastructure at BEL, and marketing before that.',
    tech: ['LAN / WAN', 'Network monitoring', 'Digital marketing', 'Campaign planning'],
  },
]

export const about = {
  heading: 'I care about how a thing feels the second it loads.',
  chapters: [
    {
      index: '01',
      label: 'What I build',
      body: [
        'Websites that behave more like places than pages — React on the surface, Three.js underneath, motion holding the two together.',
        'Four of them are live. All self-initiated, all designed and built alone.',
      ],
    },
    {
      index: '02',
      label: 'Background',
      body: [
        'B.Tech in Computer Science & Engineering from Chitkara University, 2025. Now a Network Manager at Bharat Electronics Limited, working across networks, web development and digital systems.',
        'Before that, marketing at Impact Lab — campaigns, social media and performance analysis. It is why I ask who a site is for before what it is built with.',
      ],
    },
    {
      index: '03',
      label: 'How I work',
      body: [
        'Technology, design, motion and performance are not four decisions. They are one decision made four times.',
        'A site that looks expensive and loads slowly is not finished. Neither is a fast one nobody remembers.',
      ],
    },
  ],
}

/* Titles, dates and duties: public/resume.pdf (authoritative).
   BEL keeps its official designation; the owner describes the work as
   web-related, so that appears as role focus rather than as a new title. */
export const experience = [
  {
    id: 'bel',
    period: '2025 — Present',
    role: 'Network Manager',
    org: 'Bharat Electronics Limited · Panchkula', //  : the separator never starts a line
    focus: 'Web development, networking and digital systems',
    body: 'Managing LAN and WAN networks: troubleshooting connectivity, monitoring network performance, and supporting secure, reliable IT infrastructure.',
    tags: ['Networks', 'Web development', 'Infrastructure'],
  },
  {
    id: 'impact-lab',
    period: '2025',
    role: 'Marketing Manager',
    org: 'Impact Lab',
    body: 'Digital marketing, social media management, campaign planning, and performance analysis to grow brand awareness and reach.',
    tags: ['Marketing', 'Campaigns'],
  },
  {
    id: 'chitkara',
    period: '2021 — 2025',
    role: 'B.Tech, Computer Science & Engineering',
    org: 'Chitkara University',
    body: 'Algorithms, systems, databases and software engineering.',
    tags: ['Computer science'],
  },
]

export const statement = {
  lines: ['I build things', 'that live between', 'code', 'and design.'],
  serifWord: 'and design.',
  note: 'Not a developer who dabbles in design. Not a designer who dabbles in code. The interesting work has always been in the gap.',
}

export const contact = {
  // "develop" — the darkroom idea behind the site, and the job title
  lines: ["Let's", 'develop', 'something.'],
  note: 'Open to freelance and full-time roles — and to the strange idea you have not found the right person for yet.',
}
