import { useRef } from 'react'
import { useGSAP } from '../../lib/motion'
import { registerChapter } from '../../lib/stage'
import { revealIn } from '../../lib/reveal'
import { capabilities, projects } from '../../content'
import SectionHead from '../ui/SectionHead'

/* Technical figures, one per capability. Ink lines on bone, one flare
   accent each. They draw themselves in, and move a little on hover. */
const CURVE = 'M20 128 C 82 128, 66 34, 126 34 S 196 120, 222 40'
const FIGS = [
  // 01 creative development — a bezier with its handles, and something travelling it
  <>
    <path d={CURVE} />
    <line x1="20" y1="128" x2="82" y2="128" className="flare" />
    <line x1="126" y1="34" x2="66" y2="34" className="flare" />
    <line x1="126" y1="34" x2="186" y2="34" className="flare" />
    <circle cx="82" cy="128" r="3" className="flare dot" />
    <circle cx="66" cy="34" r="3" className="flare dot" />
    <circle cx="186" cy="34" r="3" className="flare dot" />
    <rect x="16.5" y="124.5" width="7" height="7" />
    <rect x="122.5" y="30.5" width="7" height="7" />
    <rect x="218.5" y="36.5" width="7" height="7" />
    <circle r="4.5" className="dot fig-travel" style={{ offsetPath: `path('${CURVE}')` }} />
  </>,
  // 02 3D & WebGL — a wireframe cube on its axes; hidden edges dashed
  <>
    <g className="fig-spin" style={{ transformOrigin: '120px 84px' }}>
      <path d="M120 30 L172 58 L120 86 L68 58 Z" />
      <path d="M68 58 L68 116 L120 144 L172 116 L172 58" />
      <path d="M120 86 L120 144" />
      <path d="M68 116 L120 88 L172 116 M120 30 L120 88" strokeDasharray="3 4" className="fig-dash" />
    </g>
    <line x1="120" y1="84" x2="214" y2="84" className="flare" />
    <line x1="120" y1="84" x2="120" y2="8" />
    <line x1="120" y1="84" x2="40" y2="150" />
    <circle cx="120" cy="84" r="2.5" className="flare dot" />
  </>,
  // 03 design engineering — a modular grid with a specimen and its baselines
  <>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={20 + i * 35} y="20" width="27" height="120" className="fig-col" style={{ animationDelay: `${i * 0.08}s` }} />
    ))}
    <line x1="10" y1="100" x2="230" y2="100" className="flare" />
    <line x1="10" y1="56" x2="230" y2="56" strokeDasharray="2 4" />
    <text x="30" y="100" className="fig-type" fontSize="64" fontFamily="Instrument Serif, Georgia, serif" fontStyle="italic">
      Aa
    </text>
  </>,
  // 04 full stack — client, API, data, and packets moving between them
  <>
    <rect x="14" y="58" width="52" height="40" />
    <rect x="94" y="58" width="52" height="40" />
    <ellipse cx="200" cy="64" rx="26" ry="8" />
    <path d="M174 64 L174 96 A26 8 0 0 0 226 96 L226 64" />
    <line x1="66" y1="78" x2="94" y2="78" />
    <line x1="146" y1="78" x2="174" y2="78" />
    <circle r="3.5" className="flare dot fig-travel" style={{ offsetPath: "path('M66 78 L174 78')" }} />
    <circle r="3.5" className="dot fig-travel" style={{ offsetPath: "path('M174 82 L66 82')", animationDelay: '0.6s' }} />
    <line x1="24" y1="70" x2="56" y2="70" />
    <line x1="24" y1="78" x2="46" y2="78" />
    <line x1="104" y1="70" x2="136" y2="70" />
  </>,
  // 05 performance — frame times under the 16.7 ms line
  <>
    <line x1="14" y1="140" x2="228" y2="140" />
    <line x1="14" y1="58" x2="228" y2="58" className="flare" strokeDasharray="4 4" />
    {[62, 48, 70, 40, 66, 52, 74, 44, 60, 50, 68, 46].map((h, i) => (
      <rect key={i} x={22 + i * 17} y={140 - h} width="9" height={h} className="fig-bar" style={{ animationDelay: `${i * 0.05}s`, transformOrigin: `${26 + i * 17}px 140px` }} />
    ))}
  </>,
  // 06 networks & marketing — a star topology with a signal going out
  <>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2
      const x = 120 + Math.cos(a) * 62
      const y = 82 + Math.sin(a) * 52
      return (
        <g key={i}>
          <line x1="120" y1="82" x2={x} y2={y} />
          <rect x={x - 6} y={y - 6} width="12" height="12" />
        </g>
      )
    })}
    <circle cx="120" cy="82" r="10" className="flare" />
    <circle cx="120" cy="82" r="3" className="flare dot" />
    <circle cx="120" cy="82" r="22" className="fig-ping" />
  </>,
]

/* "Shipped in" is derived from the projects' stacks, never written by hand */
const shippedIn = (tech) => projects.filter((p) => p.stack.some((s) => tech.includes(s))).map((p) => p.title)

export default function Capabilities() {
  const root = useRef(null)
  useGSAP(() => revealIn(root.current), { scope: root })

  return (
    <section id="capabilities" ref={(el) => registerChapter('capabilities', el)} className="relative pb-[16vh] pt-[8vh]" aria-labelledby="cap-title">
      <div ref={root} className="layer shell">
        <SectionHead n="04" label="Capabilities" aside="Six instruments" tone="l" />
        <div className="mt-8 grid-12 items-end gap-y-6">
          <h2 id="cap-title" className="h2 press col-span-12 md:col-span-8" data-skew>
            <span className="block" data-reveal="chars">What I bring</span>{' '}
            <em className="block italic" data-reveal="focus" data-delay="0.2">to a build.</em>
          </h2>
          <p className="meta col-span-12 max-w-[36ch] text-ink-dim md:col-span-4 md:justify-self-end" data-reveal="para">
            Each figure is drawn in SVG and moves when you point at it. The stacks listed under each are the ones the live builds actually ship.
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-1 border-l border-t rule-l md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => {
            const shipped = shippedIn(c.tech)
            return (
              <li key={c.title} className="cap group relative flex flex-col border-b border-r rule-l p-6 transition-colors duration-700 hover:bg-bone-2 md:p-8">
                <div className="flex items-center justify-between">
                  <span className="label tnum text-ink-dim">fig. 0{i + 1}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-flare opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
                </div>
                <svg viewBox="0 0 240 160" className="fig mx-auto mt-6 w-full max-w-[300px] text-ink" aria-hidden="true" data-reveal="draw" data-delay={String((i % 3) * 0.12)}>
                  {FIGS[i]}
                </svg>
                <h3 className="title press mt-8" data-reveal="lines">{c.title}</h3>
                <p className="meta mt-3 max-w-[40ch] text-ink-dim">{c.body}</p>
                <p className="label mt-5 text-ink">{c.tech.join(' / ')}</p>
                {shipped.length > 0 && (
                  <p className="label mt-2 text-ink-dim">Shipped in — {shipped.join(', ')}</p>
                )}
                {c.proof && <p className="annotation mt-5 max-w-[42ch] text-ink">{c.proof}</p>}
              </li>
            )
          })}
        </ul>
      </div>

      <style>{`
        .fig .fig-travel { offset-distance: 0%; opacity: 0; }
        .cap:hover .fig-travel, .cap:focus-within .fig-travel { opacity: 1; animation: travel 1.8s cubic-bezier(.65,0,.35,1) infinite alternate; }
        @keyframes travel { to { offset-distance: 100%; } }
        .cap:hover .fig-spin { animation: wob 3s ease-in-out infinite alternate; }
        @keyframes wob { from { transform: rotate(-4deg) } to { transform: rotate(4deg) } }
        .cap:hover .fig-dash { animation: dash 1s linear infinite; }
        @keyframes dash { to { stroke-dashoffset: -14; } }
        .cap:hover .fig-col { animation: col 1.2s ease-in-out infinite alternate; }
        @keyframes col { to { opacity: .25 } }
        .fig .fig-type { fill: currentColor; stroke: none; }
        .cap:hover .fig-bar { animation: bar .9s cubic-bezier(.65,0,.35,1) infinite alternate; }
        @keyframes bar { to { transform: scaleY(.45) } }
        .fig-ping { opacity: 0; transform-origin: 120px 82px; }
        .cap:hover .fig-ping { animation: ping 1.6s cubic-bezier(.2,.7,.2,1) infinite; }
        @keyframes ping { from { opacity: .8; transform: scale(.4) } to { opacity: 0; transform: scale(2.6) } }
      `}</style>
    </section>
  )
}
