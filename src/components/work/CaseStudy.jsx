import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, SplitText, useGSAP, EASE } from '../../lib/motion'
import { lockScroll } from '../../lib/hooks'
import { stage } from '../../lib/stage'
import { revealIn } from '../../lib/reveal'
import { projects } from '../../content'
import Roll from '../ui/Roll'
import Arrow from '../ui/Arrow'

const read = () => {
  const m = window.location.hash.match(/^#work\/([\w-]+)$/)
  return m && projects.some((p) => p.id === m[1]) ? m[1] : null
}

/* the rectangle to open out of, in px from each edge: the sheet on screen,
   or a slit in the middle */
function originOf(id) {
  const el = stage.planes.get(id)?.el
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (el) {
    const r = el.getBoundingClientRect()
    if (r.bottom > 0 && r.top < vh) {
      return { t: Math.max(0, r.top), r: Math.max(0, vw - r.right), b: Math.max(0, vh - r.bottom), l: Math.max(0, r.left) }
    }
  }
  return { t: vh * 0.48, r: vw * 0.3, b: vh * 0.48, l: vw * 0.3 }
}
const FULL = { t: 0, r: 0, b: 0, l: 0 }

const CHAPTERS = [
  ['Overview', 'overview'],
  ['Problem', 'problem'],
  ['Approach', 'approach'],
  ['Build', 'build'],
  ['Result', 'result'],
]

export default function CaseStudy() {
  const [id, setId] = useState(read)
  const [shown, setShown] = useState(null)
  const panel = useRef(null)
  const closeBtn = useRef(null)
  const returnFocus = useRef(null)
  // where the panel is: 'closed' → 'opening' → 'open' → 'closing' → 'closed'
  const phase = useRef('closed')
  const body = useRef(null)
  // how the study on screen arrived: 'open' (out of a sheet) or 'switch' (from another study)
  const arrival = useRef('open')
  // the panel's clip, tweened as four numbers rather than an inset() string:
  // the browser shortens those (inset(0px), inset(48% 30%)) and a turn-round
  // would then jump on the edges it dropped
  const clip = useRef({ ...FULL })
  const drawClip = () => {
    const c = clip.current
    panel.current.style.clipPath = `inset(${c.t}px ${c.r}px ${c.b}px ${c.l}px)`
  }
  const reduced = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const on = () => setId(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const close = useCallback(() => {
    // drop the hash without jumping the page
    history.replaceState(null, '', window.location.pathname + window.location.search)
    setId(null)
  }, [])

  // open / switch / close. Each tween overwrites the last, so a close during
  // the open (or an open during the close) turns round from wherever the
  // panel is, and a cancelled tween's onComplete never runs.
  useEffect(() => {
    const el = panel.current
    if (id) {
      returnFocus.current = returnFocus.current || document.activeElement
      lockScroll(true)
      if (phase.current === 'open') {
        // a switch between studies: the one being read steps back and fades,
        // and the next arrives at the top while nothing is on screen to jump
        arrival.current = 'switch'
        gsap.to(body.current, {
          autoAlpha: 0,
          y: -24,
          duration: reduced ? 0 : 0.35,
          ease: EASE.soft,
          overwrite: true,
          onComplete: () => {
            el.scrollTop = 0
            setShown(id)
            closeBtn.current?.focus({ preventScroll: true })
          },
        })
        return
      }
      arrival.current = 'open'
      // a switch cut short by a close can leave the old study half-faded
      if (body.current) gsap.set(body.current, { clearProps: 'opacity,visibility,transform' })
      setShown(id)
      el.scrollTop = 0
      if (phase.current === 'closed') {
        Object.assign(clip.current, originOf(id))
        drawClip()
      }
      gsap.set(el, { visibility: 'visible' })
      phase.current = 'opening'
      gsap.to(clip.current, {
        ...FULL,
        duration: reduced ? 0 : 0.9,
        ease: EASE.out,
        overwrite: true,
        onUpdate: drawClip,
        onComplete: () => {
          drawClip()
          phase.current = 'open'
          stage.covered = true
          closeBtn.current?.focus({ preventScroll: true })
        },
      })
    } else if (shown) {
      // a pending switch must not swap the study while the panel closes
      if (body.current) gsap.killTweensOf(body.current)
      phase.current = 'closing'
      stage.covered = false
      lockScroll(false)
      gsap.to(clip.current, {
        ...originOf(shown),
        duration: reduced ? 0 : 0.6,
        ease: EASE.out,
        overwrite: true,
        onUpdate: drawClip,
        onComplete: () => {
          drawClip()
          phase.current = 'closed'
          gsap.set(el, { visibility: 'hidden' })
          setShown(null)
          returnFocus.current?.focus?.({ preventScroll: true })
          returnFocus.current = null
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // content entrance, every time a study is shown. useGSAP runs as a layout
  // effect, so the final state is never painted for a frame before it hides.
  useGSAP(
    () => {
      if (!shown || reduced) return
      const split = SplitText.create('.cs-title', { type: 'chars' })
      const lead = arrival.current === 'switch' ? 0.05 : 0.3
      gsap.from(split.chars, { yPercent: 110, opacity: 0, duration: 1.4, stagger: 0.025, delay: lead, ease: EASE.out })
      gsap.from('.cs-in', { y: 30, opacity: 0, duration: 1.3, stagger: 0.07, delay: lead + 0.1, ease: EASE.out })
      gsap.from('.cs-img', { clipPath: 'inset(0 0 100% 0)', duration: 1.2, delay: lead + 0.15, ease: EASE.out })
      // the body reveals as it is read: the panel scrolls, not the window
      const undo = revealIn(body.current, { scroller: panel.current })
      // the system lights up in the order its data flows
      const links = gsap.utils.toArray('.cs-link')
      const steps = gsap.utils.toArray('.cs-step')
      const flow = gsap.timeline({
        scrollTrigger: { trigger: '.cs-flow', scroller: panel.current, start: 'top 80%', once: true },
      })
      gsap.utils.toArray('.cs-node').forEach((node, k) => {
        const at = k * 0.32
        flow.from(node, { opacity: 0.2, scale: 0.9, duration: 0.4, ease: EASE.out }, at)
        flow.from(steps[k], { opacity: 0, y: 12, duration: 0.6, ease: EASE.out }, at)
        if (links[k]) flow.from(links[k], { scaleY: 0, transformOrigin: '50% 0%', duration: 0.24, ease: 'none' }, at + 0.08)
      })
      return undo
    },
    { scope: panel, dependencies: [shown, reduced], revertOnUpdate: true },
  )

  useEffect(() => {
    if (!id) return
    const key = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab') {
        // keep focus inside the dialog
        const f = panel.current.querySelectorAll('a[href], button:not([disabled])')
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [id, close])

  const p = projects.find((x) => x.id === shown)
  const i = projects.findIndex((x) => x.id === shown)
  const next = projects[(i + 1) % projects.length]

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={p ? `${p.title} — case study` : 'Case study'}
      style={{ visibility: 'hidden' }}
      className="fixed inset-0 z-[92] overflow-y-auto overscroll-contain bg-void text-light"
      data-lenis-prevent
    >
      {p && (
        <>
          <div className="sticky top-0 z-10 flex h-[var(--nav-h)] items-center justify-between gap-4 bg-void/80 px-[var(--gutter)] backdrop-blur-md">
            <span className="label text-light-dim">
              AS<span className="text-flare">—</span>B{p.number} / {p.dna.join(' · ')}
            </span>
            <span className="label hidden text-light-dim md:block">{p.title}</span>
            <button ref={closeBtn} type="button" onClick={close} className="pill pill-glass" data-cursor="Close">
              <Roll>Close</Roll> <Arrow dir="down" />
            </button>
          </div>

          {/* keyed: a new study gets a fresh subtree, so no split text or
              inline style from the last one survives the switch */}
          <div key={p.id} ref={body}>
            <header className="shell pb-12 pt-[10vh]">
              <p className="cs-in label text-light-dim">
                {p.number} — {p.category}
              </p>
              <h2 className="cs-title display lit mt-6 overflow-hidden">{p.title}</h2>
              <dl className="cs-in mt-12 grid grid-cols-2 gap-6 border-t rule-d pt-5 md:grid-cols-4">
                {[
                  ['Type', p.type],
                  ['Role', p.role],
                  ['Year', p.year],
                  ['Stack', p.stack.join(', ')],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="label text-light-dim">{k}</dt>
                    <dd className="meta mt-2">{v}</dd>
                  </div>
                ))}
              </dl>
            </header>

            <div className="shell">
              <img
                className="cs-img graded aspect-[16/10] w-full object-cover"
                src={`/work/${p.id}-1600.webp`}
                alt={`${p.title}: the live site`}
                decoding="async"
              />
            </div>

            <div className="shell py-[12vh]">
              {CHAPTERS.map(([label, key], k) => (
                <section key={key} className="relative grid-12 gap-y-3 py-8 md:py-12">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[var(--color-line-d)]" data-reveal="rule" />
                  <h3 className="label col-span-12 text-light-dim md:col-span-3" data-reveal="fade">
                    <span className="tnum text-flare">0{k + 1}</span> — {label}
                  </h3>
                  <p className="col-span-12 max-w-[58ch] text-[1.175rem] leading-[1.6] text-light md:col-span-8 md:col-start-5" data-reveal="para" data-delay="0.08">
                    {p.study[key]}
                  </p>
                </section>
              ))}

              <section className="relative grid-12 gap-y-6 py-8 md:py-12">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[var(--color-line-d)]" data-reveal="rule" />
                <h3 className="label col-span-12 text-light-dim md:col-span-3" data-reveal="fade">System — in order of data flow</h3>
                <ol className="cs-flow col-span-12 md:col-span-9">
                  {p.system.map(([name, what], k) => (
                    <li key={name} className="relative grid grid-cols-[2rem_1fr] gap-4 pb-6 last:pb-0">
                      <span className="relative flex justify-center">
                        <i className="cs-node relative z-[1] mt-1.5 block h-2.5 w-2.5 rounded-full border border-flare bg-void" />
                        {k < p.system.length - 1 && <i className="cs-link absolute bottom-[-0.25rem] top-4 w-px bg-[var(--color-line-d-strong)]" />}
                      </span>
                      <span className="cs-step">
                        <span className="text-light">{name}</span>
                        <span className="meta block text-light-dim">{what}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="relative grid-12 gap-y-4 py-8 md:py-12">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[var(--color-line-d)]" data-reveal="rule" />
                <h3 className="label col-span-12 text-light-dim md:col-span-3" data-reveal="fade">Build notes — measured</h3>
                <dl className="col-span-12 md:col-span-9">
                  {p.notes.map(([k, v], n) => (
                    <div key={k} className="grid grid-cols-12 gap-3 border-b rule-d py-4 last:border-0" data-reveal="fade" data-delay={String(n * 0.06)}>
                      <dt className="label col-span-12 text-light-dim md:col-span-3">{k}</dt>
                      <dd className="meta col-span-12 text-light md:col-span-9">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* optional: a build's signature moment, four frames in a 2 × 2 grid,
                  captioned in the same reading order */}
              {p.sequence && (
                <section className="relative grid-12 gap-y-4 py-8 md:py-12">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[var(--color-line-d)]" data-reveal="rule" />
                  <h3 className="label col-span-12 text-light-dim md:col-span-3" data-reveal="fade">{p.sequence.label}</h3>
                  <figure className="col-span-12 md:col-span-9" data-reveal="fade">
                    <img
                      src={`/work/${p.id}-sequence.webp`}
                      alt={p.sequence.alt}
                      width={1600}
                      height={1000}
                      loading="lazy"
                      decoding="async"
                      className="w-full"
                    />
                    <figcaption>
                      <ol className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                        {p.sequence.steps.map(([name, what], k) => (
                          <li key={name} className="meta grid grid-cols-[2rem_1fr] text-light-dim">
                            <span className="tnum text-flare">0{k + 1}</span>
                            <span>
                              <span className="text-light">{name}</span> — {what}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </figcaption>
                  </figure>
                </section>
              )}

              <section className="relative grid-12 gap-y-4 py-8 md:py-12">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[var(--color-line-d)]" data-reveal="rule" />
                <h3 className="label col-span-12 text-light-dim md:col-span-3" data-reveal="fade">The site, top to bottom</h3>
                <div className="col-span-12 md:col-span-9" data-reveal="fade">
                  <img
                    src={`/work/${p.id}-reel.webp`}
                    alt={`${p.title}: six frames captured while scrolling the live site`}
                    width={1280}
                    height={4890}
                    loading="lazy"
                    className="w-full"
                  />
                </div>
              </section>
            </div>

            <footer className="shell flex flex-col gap-10 border-t rule-d pb-16 pt-10 md:flex-row md:items-end md:justify-between">
              <a href={p.href} target="_blank" rel="noreferrer" className="group" data-cursor="Visit" data-reveal="fade">
                <span className="label text-light-dim">Live</span>
                <span className="h2 lit mt-2 block transition-colors group-hover:text-flare">
                  <Roll>Visit the site</Roll> <Arrow dir="up-right" />
                </span>
              </a>
              <a href={`#work/${next.id}`} className="group text-right" data-cursor="Next" data-reveal="fade" data-delay="0.08">
                <span className="label text-light-dim">Next — {next.number}</span>
                <span className="title mt-2 block transition-transform duration-500 group-hover:-translate-x-2">
                  <Roll>{next.title}</Roll> <Arrow />
                </span>
              </a>
            </footer>
          </div>
        </>
      )}
    </div>
  )
}
