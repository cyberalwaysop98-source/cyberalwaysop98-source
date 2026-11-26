import { useEffect, useRef, useState } from 'react'
import { m } from 'motion/react'
import { ease, dur } from '../../lib/motion'
import { meta } from '../../content'
import { openIris } from '../../lib/projector'

const MIN_MS = 900 // long enough to read the name
const MAX_MS = 2400 // never hold the visitor hostage

/* Counts against real font/asset readiness, clamped so it can neither
   flash nor stall. */
export default function Preloader({ onDone }) {
  const [pct, setPct] = useState(0)
  const [phase, setPhase] = useState('count') // count → name → out
  const raf = useRef(0)

  useEffect(() => {
    const start = performance.now()
    let ready = false

    Promise.race([
      Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true }))),
      ]),
      new Promise((r) => setTimeout(r, MAX_MS)),
    ]).then(() => (ready = true))

    const tick = (now) => {
      const t = now - start
      // ceiling creeps to 92% until assets land, then releases
      const ceiling = ready && t > MIN_MS ? 100 : Math.min(92, (t / MIN_MS) * 92)
      setPct((p) => {
        const next = p + (ceiling - p) * 0.12
        return next > 99.4 ? 100 : next
      })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  /* No cut to the hero: the type clears, the aperture starts opening on the
     projector behind this layer, and the layer itself fades out over it —
     so the first thing the site shows is light arriving, not a wipe. */
  useEffect(() => {
    if (pct < 100) return
    cancelAnimationFrame(raf.current)
    const a = setTimeout(() => setPhase('name'), 60)
    const b = setTimeout(() => {
      setPhase('out')
      openIris(2100)
    }, 720)
    const c = setTimeout(onDone, 980)
    return () => [a, b, c].forEach(clearTimeout)
  }, [pct, onDone])

  const n = Math.round(pct)
  const out = phase === 'out'

  return (
    <m.div
      className="fixed inset-0 z-[80] flex flex-col justify-between overflow-hidden bg-ink"
      exit={{ opacity: 0, transition: { duration: dur.section, ease: ease.out } }}
      aria-hidden="true"
    >
      {/* progress hairline — scaleX, not width: this updates every rAF frame,
          and width would relayout a full-bleed element ~60x a second */}
      <m.div
        className="absolute top-0 left-0 h-px w-full origin-left bg-ember"
        style={{ scaleX: pct / 100 }}
      />

      <div className="shell flex flex-1 flex-col justify-center">
        <div className="overflow-hidden">
          <m.p
            className="display text-[clamp(2.5rem,8vw,7rem)] text-paper"
            animate={{ y: phase === 'count' ? 0 : '-110%' }}
            transition={{ duration: dur.ui * 1.4, ease: ease.inOut }}
          >
            {meta.name}
          </m.p>
        </div>
        <div className="-mt-[0.9em] overflow-hidden">
          <m.p
            className="accent-serif text-[clamp(2.5rem,8vw,7rem)] leading-[0.9] text-ember"
            initial={{ y: '110%' }}
            animate={{ y: phase === 'name' ? 0 : out ? '-110%' : '110%' }}
            transition={{ duration: dur.ui * 1.4, ease: ease.inOut }}
          >
            {meta.role}
          </m.p>
        </div>
      </div>

      <m.div
        className="shell flex items-end justify-between pb-8"
        animate={{ opacity: out ? 0 : 1 }}
        transition={{ duration: dur.ui }}
      >
        <span className="eyebrow">Loading experience</span>
        <span className="font-mono text-[clamp(2rem,7vw,5rem)] leading-none font-light tabular-nums text-paper-faint">
          {String(n).padStart(3, '0')}
        </span>
      </m.div>
    </m.div>
  )
}
