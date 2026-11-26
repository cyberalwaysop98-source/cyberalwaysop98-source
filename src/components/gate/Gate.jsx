import { useEffect, useRef, useState } from 'react'
import { gsap, SplitText, useGSAP } from '../../lib/motion'
import { stage } from '../../lib/stage'
import { setSound, press } from '../../lib/sound'
import { useClock } from '../../lib/hooks'
import { gate, meta, projects } from '../../content'
import Roll from '../ui/Roll'
import Arrow from '../ui/Arrow'
import RayMark from '../ui/RayMark'

const MIN_LOAD = 2.6 // seconds — long enough for the dust to visibly gather

/* real progress: the webfonts and the four stills the work is shown with */
function useLoad(onDone) {
  const [pct, setPct] = useState(0)
  const done = useRef(false)
  useEffect(() => {
    const small = window.innerWidth < 768
    const jobs = [
      ...projects.map((p) => {
        const im = new Image()
        im.src = `/work/${p.id}-${small ? 800 : 1600}.webp`
        return im.decode().catch(() => {})
      }),
      document.fonts?.ready ?? Promise.resolve(),
      document.fonts?.load?.('italic 40px "Instrument Serif"').catch(() => {}) ?? Promise.resolve(),
    ]
    let finished = 0
    const real = { v: 0 }
    jobs.forEach((j) => j.then(() => (real.v = ++finished / jobs.length)))

    const shown = { v: 0 }
    const start = performance.now()
    const tick = () => {
      const time = Math.min(1, (performance.now() - start) / 1000 / MIN_LOAD)
      const target = Math.min(real.v, time) * 100
      shown.v += (target - shown.v) * 0.08
      if (target >= 100 && shown.v > 99.4) shown.v = 100
      stage.load = shown.v / 100
      setPct(Math.floor(shown.v))
      if (shown.v >= 100 && !done.current) {
        done.current = true
        gsap.ticker.remove(tick)
        onDone()
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return pct
}

/* bytes actually received so far, from Resource Timing */
function useReceived() {
  const [kb, setKb] = useState(0)
  useEffect(() => {
    const read = () => {
      const res = performance.getEntriesByType('resource')
      const nav = performance.getEntriesByType('navigation')[0]
      const bytes = res.reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), nav?.transferSize || 0)
      setKb(Math.round(bytes / 1024))
    }
    read()
    const id = setInterval(read, 180)
    return () => clearInterval(id)
  }, [])
  return kb
}

export default function Gate({ quick, onIgnite, onDone }) {
  const root = useRef(null)
  const [phase, setPhase] = useState('loading')
  const time = useClock()
  const kb = useReceived()
  const pct = useLoad(() => (quick ? leave(null) : setPhase('ask')))

  // the question comes into focus; the two doors rise.
  // useGSAP keeps these when the phase changes again — only unmount reverts them
  useGSAP(
    () => {
      if (phase !== 'ask') return
      gsap.to('.gate-count', { opacity: 0, scale: 0.92, filter: 'blur(10px)', duration: 0.55, ease: 'power2.out' })
      const split = SplitText.create('.gate-q', { type: 'chars' })
      gsap.from(split.chars, {
        opacity: 0,
        filter: 'blur(16px)',
        yPercent: 20,
        duration: 1.7,
        stagger: { each: 0.03, from: 'center' },
        delay: 0.5,
        ease: 'expo.out',
      })
      gsap.from('.gate-door', { y: 40, opacity: 0, duration: 1.4, stagger: 0.12, delay: 0.9, ease: 'expo.out' })
      gsap.from('.gate-door-rule', { scaleX: 0, transformOrigin: '0 50%', duration: 1.4, stagger: 0.12, delay: 1.0, ease: 'expo.inOut' })
      // a deep link opens its case study over the gate: never move focus under it
      gsap.delayedCall(1.2, () => !/^#work\//.test(location.hash) && root.current?.querySelector('.gate-door')?.focus({ preventScroll: true }))
    },
    { dependencies: [phase], scope: root },
  )

  function leave(withSound) {
    setPhase('leaving')
    window.dispatchEvent(new Event('cursor:reset'))
    if (withSound !== null) {
      setSound(withSound)
      // sound was off when this button was pressed: answer the press now
      if (withSound) press()
    }
    const tl = gsap.timeline({ onComplete: onDone })
    tl.to(root.current.querySelectorAll('.gate-q, .gate-doors, .gate-count, .gate-chrome'), {
      opacity: 0,
      filter: 'blur(12px)',
      scale: 0.97,
      duration: 0.7,
      ease: 'power3.in',
    })
    // ring → point → burst: the engine eases each stage; this is the clock
    tl.to(stage, { intro: 1, duration: 3.0, ease: 'none' }, 0.35)
    tl.call(onIgnite, null, 0.35 + 3.0 * 0.32)
  }

  const asking = phase === 'ask'

  return (
    <div
      ref={root}
      className={`fixed inset-0 z-[70] flex items-center justify-center overflow-hidden text-light ${phase === 'leaving' ? 'pointer-events-none' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
    >
      {/* still visitors and no-WebGL visitors get a drawn ring instead of the dust */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 hidden aspect-square w-[min(70vh,86vw)] -translate-x-1/2 -translate-y-1/2 rounded-full border rule-d [html:not([data-stage=live])_&]:block"
      />

      <div className="gate-chrome pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-[var(--gutter)] pt-6">
        <span className="flex items-center gap-2.5 text-[0.875rem] font-medium tracking-[-0.01em]">
          <RayMark size={18} delay={200} />
          {meta.name}
        </span>
        <span className="label text-light-dim">Plate 001 — Aṃśu</span>
      </div>

      <div className="gate-count tnum absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center" aria-live="polite">
        <div className="numeral">
          {String(pct).padStart(3, '0')}
        </div>
        <div className="label mt-3 flex items-center justify-center gap-2 text-light-dim">
          <RayMark size={14} mode="loader" />
          {pct < 100 ? 'Gathering light' : 'Ready'}
        </div>
      </div>

      {asking || phase === 'leaving' ? (
        <div className="relative flex w-full max-w-[860px] flex-col items-center px-[var(--gutter)] text-center">
          <p className="label mb-6 text-light-dim">{meta.name} · {meta.role}</p>
          <h1 className="gate-q h2">
            {gate.question[0]}
            <br />
            <em>{gate.question[1]}</em>
          </h1>
          <div className="gate-doors mt-12 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            {gate.options.map((o) => (
              <button
                key={o.n}
                type="button"
                data-cursor="Enter"
                disabled={!asking}
                onClick={() => leave(o.sound)}
                className="gate-door group relative flex flex-col items-start rounded-none border border-transparent bg-[var(--color-glass)] px-6 pb-6 pt-5 text-left backdrop-blur-md transition-colors duration-500 hover:border-[var(--color-line-d-strong)] hover:bg-[var(--color-glass-hover)]"
              >
                <span className="gate-door-rule absolute inset-x-0 top-0 h-px bg-[var(--color-line-d-strong)]" />
                <span className="flex w-full items-center justify-between">
                  <span className="label text-light-dim">{o.n}</span>
                  <span className="text-light-dim transition-colors duration-500 group-hover:text-flare">
                    <Arrow />
                  </span>
                </span>
                <span className="title lit mt-5">
                  <Roll>{o.label}</Roll>
                </span>
                <span className="meta mt-2 text-light-dim">{o.note}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="gate-chrome pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-[var(--gutter)] pb-6">
        <span className="label tnum text-light-dim">
          Received <span className="text-light">{kb.toLocaleString('en-GB')} KB</span>
        </span>
        <span className="label tnum text-light-dim">
          {meta.location.split(',')[0]} — <span className="text-light">{time}</span> IST
        </span>
      </div>
    </div>
  )
}
