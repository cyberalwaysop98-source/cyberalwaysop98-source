import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from '../../lib/motion'
import { registerChapter, stage, measureChapters } from '../../lib/stage'
import { revealIn } from '../../lib/reveal'
import { projects } from '../../content'
import Magnetic from '../ui/Magnetic'
import Roll from '../ui/Roll'
import Arrow from '../ui/Arrow'
import SectionHead from '../ui/SectionHead'

const LAYOUT = [
  { plane: 'md:col-start-1 md:col-span-8', cap: 'md:col-start-9 md:col-span-4' },
  { plane: 'md:col-start-5 md:col-span-8', cap: 'md:col-start-1 md:col-span-4 md:row-start-1' },
  { plane: 'md:col-start-2 md:col-span-7', cap: 'md:col-start-9 md:col-span-4' },
  { plane: 'md:col-start-6 md:col-span-7', cap: 'md:col-start-1 md:col-span-4 md:row-start-1' },
]

const open = (id) => (window.location.hash = `work/${id}`)

/* The DOM keeps the place, the size and the real <img>; when the stage is
   live it draws the sheet there instead and the <img> steps aside. */
function Sheet({ p }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const small = window.innerWidth < 768
    const rec = {
      el,
      src: `/work/${p.id}-${small ? 800 : 1600}.webp`,
      reel: small ? null : `/work/${p.id}-reel.webp`,
      hover: false,
      reveal: matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0,
    }
    stage.planes.set(p.id, rec)
    measureChapters()
    // quick enough that a thumb-scroll never sees a half-developed sheet
    const st = ScrollTrigger.create({
      trigger: el,
      start: matchMedia('(pointer: coarse)').matches ? 'top bottom' : 'top 94%',
      once: true,
      onEnter: () => gsap.to(rec, { reveal: 1, duration: 1.3, ease: 'power3.out' }),
    })
    return () => {
      st.kill()
      stage.planes.delete(p.id)
    }
  }, [p.id])

  const set = (v) => {
    const rec = stage.planes.get(p.id)
    if (rec) rec.hover = v
  }

  return (
    <button
      ref={ref}
      type="button"
      data-cursor="View case"
      onPointerEnter={() => set(true)}
      onPointerLeave={() => set(false)}
      onFocus={() => set(true)}
      onBlur={() => set(false)}
      onClick={() => open(p.id)}
      className="relative block aspect-[16/10] w-full overflow-hidden text-left"
      aria-label={`${p.title} — open the case study`}
    >
      <img
        src={`/work/${p.id}-1600.webp`}
        srcSet={`/work/${p.id}-800.webp 800w, /work/${p.id}-1600.webp 1600w`}
        sizes="(min-width: 768px) 66vw, 100vw"
        alt={`${p.title}: the live site`}
        loading="lazy"
        className="graded absolute inset-0 h-full w-full object-cover [html[data-stage=live]_&]:opacity-0"
      />
    </button>
  )
}

function Row({ p, i }) {
  const L = LAYOUT[i % LAYOUT.length]
  return (
    <article className="grid-12 items-end gap-y-8 py-[9vh] md:py-[14vh]" aria-labelledby={`w-${p.id}`}>
      <div className={`col-span-12 ${L.plane}`}>
        <Sheet p={p} />
      </div>
      <div className={`col-span-12 ${L.cap} flex flex-col`}>
        <div className="flex items-center gap-3">
          <span className="label tnum text-flare" data-reveal="scramble">
            {p.number}
          </span>
          <span className="h-px flex-1 origin-left bg-[var(--color-line-d)]" data-reveal="rule" />
          <span className="label text-light-dim" data-reveal="fade">
            {p.year}
          </span>
        </div>
        <h3 id={`w-${p.id}`} className="serif lit mt-5 text-[clamp(2.4rem,4.4vw,4.6rem)] leading-[0.92]" data-reveal="chars" data-skew>
          {p.title}
        </h3>
        <p className="label mt-3 text-light-dim" data-reveal="scramble">
          {p.category} · {p.type}
        </p>
        <p className="meta mt-5 max-w-[38ch] text-light-dim" data-reveal="para" data-delay="0.1">
          {p.summary}
        </p>
        <p className="label mt-5 text-light-dim" data-reveal="fade" data-delay="0.15">
          {p.stack.join(' / ')}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-5" data-reveal="fade" data-delay="0.2">
          <Magnetic>
            <button type="button" onClick={() => open(p.id)} className="pill pill-glass" data-cursor="none">
              <Roll>View case</Roll> <Arrow />
            </button>
          </Magnetic>
          <a href={p.href} target="_blank" rel="noreferrer" className="label link-draw inline-flex min-h-11 items-center gap-1.5" data-cursor="Visit">
            <Roll>Live site</Roll> <Arrow dir="up-right" />
          </a>
        </div>
      </div>
    </article>
  )
}

/* an index of every build; the row under the cursor shows its picture beside it */
function Index() {
  const preview = useRef(null)
  const img = useRef(null)

  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = preview.current
    const x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' })
    const y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' })
    const move = (e) => {
      x(e.clientX + 48)
      y(e.clientY - 230)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  const show = (p) => {
    if (!preview.current) return
    img.current.src = `/work/${p.id}-800.webp`
    gsap.to(preview.current, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.out', overwrite: 'auto' })
  }
  const hide = () => gsap.to(preview.current, { clipPath: 'inset(50% 50% 50% 50%)', duration: 0.5, ease: 'power3.out', overwrite: 'auto' })

  return (
    <div className="shell mt-[6vh]">
      <div className="flex items-baseline justify-between border-b rule-d pb-3">
        <p className="label text-light-dim">Index — all builds</p>
        <p className="label tnum text-light-dim">({String(projects.length).padStart(2, '0')})</p>
      </div>
      <ul onPointerLeave={hide}>
        {projects.map((p) => (
          <li key={p.id} className="border-b rule-d">
            <a
              href={`#work/${p.id}`}
              onPointerEnter={() => show(p)}
              className="group grid grid-cols-12 items-baseline gap-3 py-5 md:py-6"
              data-cursor="Open"
            >
              <span className="label tnum col-span-2 text-light-dim md:col-span-1">{p.number}</span>
              <span className="title col-span-10 transition-transform duration-500 group-hover:translate-x-3 md:col-span-4">
                <Roll>{p.title}</Roll>
              </span>
              <span className="label col-span-6 hidden text-light-dim md:col-span-3 md:block">{p.category}</span>
              <span className="label col-span-6 hidden text-light-dim lg:col-span-3 lg:block">{p.stack.slice(0, 3).join(' / ')}</span>
              <span className="label tnum col-span-12 text-right text-light-dim transition-colors group-hover:text-flare md:col-span-1 lg:col-span-1">
                {p.year} <Arrow dir="up-right" />
              </span>
            </a>
          </li>
        ))}
      </ul>
      <div
        ref={preview}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[50] hidden aspect-[16/10] w-[22rem] overflow-hidden [@media(hover:hover)_and_(pointer:fine)]:block"
        style={{ clipPath: 'inset(50% 50% 50% 50%)' }}
      >
        <img ref={img} src={`/work/${projects[0].id}-800.webp`} alt="" loading="lazy" className="h-full w-full object-cover" />
      </div>
    </div>
  )
}

export default function Work() {
  const root = useRef(null)

  useGSAP(
    () => {
      const undo = revealIn(root.current)
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // the count ticks up as the header arrives
        gsap.from('.work-count', {
          textContent: 0,
          snap: { textContent: 1 },
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.work-count', start: 'top 90%', once: true },
        })
      })
      return undo
    },
    { scope: root },
  )

  return (
    <section id="work" ref={(el) => registerChapter('work', el)} className="relative pt-[10vh]" aria-labelledby="work-title">
      <div ref={root} className="layer">
        <div className="shell">
          <SectionHead n="02" label="Selected work" aside="Concept builds, live" />
          <div className="mt-8 grid-12 items-end gap-y-6">
            <h2 id="work-title" className="display lit col-span-12 md:col-span-9" data-skew>
              <span className="block" data-reveal="chars">
                Selected
              </span>{' '}
              <span className="block pl-[8vw]">
                <em className="serif normal-case italic" data-reveal="focus" data-delay="0.15">
                  work
                </em>
                <span className="sr-only"> — {projects.length} builds</span>
                <sup aria-hidden="true" className="label tnum ml-3 align-top text-flare">
                  (<span className="work-count">{String(projects.length).padStart(2, '0')}</span>)
                </sup>
              </span>
            </h2>
            <p className="meta col-span-12 max-w-[34ch] text-light-dim md:col-span-3" data-reveal="para">
              Four concept builds, live on the web — each one designed and developed alone. Open one for how it was made.
            </p>
          </div>
        </div>

        <div className="shell">
          {projects.map((p, i) => (
            <Row key={p.id} p={p} i={i} />
          ))}
        </div>

        <Index />
        <div className="h-[18vh]" />
      </div>
    </section>
  )
}
