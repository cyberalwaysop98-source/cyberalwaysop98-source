import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  m,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { ease, dur, spring } from '../../lib/motion'
import { useActiveSection, useFinePointer, useIsDesktop, useReducedMotion } from '../../lib/hooks'
import { projector, hexToRgb } from '../../lib/projector'
import { projects } from '../../content'
import SectionHeader from '../ui/SectionHeader'
import SplitText from '../ui/SplitText'
import CaseStudy from './CaseStudy'
import Plate from './Plate'

/* Each build is a reel: a pinned scene whose screen plays frames captured
   from the live site as you scroll — public/work/<id>-reel.webp, six
   1280 × 800 frames stacked with an 18px gate between them. The page never
   claims more than it shows: these are the shipped sites, filmed. */
const FRAMES = 6
const STRIP_H = FRAMES * 800 + (FRAMES - 1) * 18
const TRAVEL = `-${((1 - 800 / STRIP_H) * 100).toFixed(3)}%`
const reel = (id) => `/work/${id}-reel.webp`
const pad = (n) => String(n).padStart(2, '0')

// case studies are linkable: #work/<project id>
const idFromHash = () => {
  const id = window.location.hash.match(/^#work\/(.+)$/)?.[1]
  return projects.some((p) => p.id === id) ? id : null
}

function Actions({ project, onOpen }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className="control rounded-full bg-paper px-6 py-3 tracking-[0.16em] text-ink transition-colors duration-500 hover:bg-ember hover:text-paper"
      >
        Open case study
      </button>
      <a
        href={project.href}
        target="_blank"
        rel="noreferrer"
        className="control rounded-full border hairline px-6 py-3 tracking-[0.16em] text-paper transition-colors duration-500 hover:border-ember hover:text-ember"
      >
        Visit live ↗<span className="sr-only"> (opens {project.title} in a new tab)</span>
      </a>
    </div>
  )
}

function Facts({ project }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t hairline pt-5">
      <dt className="eyebrow">Type</dt>
      <dd className="meta text-paper">
        {project.type} · {project.category}
      </dd>
      <dt className="eyebrow">Year</dt>
      <dd className="meta text-paper">{project.year}</dd>
      <dt className="eyebrow">Stack</dt>
      <dd className="meta text-paper-dim">{project.stack.join(' · ')}</dd>
    </dl>
  )
}

/* Desktop and tablet: the pinned scene. The section is taller than the
   viewport and the scene is CSS-sticky, so scroll scrubs the reel without
   hijacking anything. */
function Reel({ project, index, onOpen }) {
  const ref = useRef(null)
  const screen = useRef(null)
  const counter = useRef(null)
  const fine = useFinePointer()
  const flip = index % 2 === 1

  // 0 → 1 while the scene slides up into place, then while it is pinned
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start start'] })
  const { scrollYProgress: run } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const { scrollYProgress: pass } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  // the projector shutter opens on the screen as it arrives
  const shutter = useTransform(enter, [0.3, 0.95], ['inset(48% 0% 48% 0%)', 'inset(0% 0% 0% 0%)'])
  const settle = useTransform(enter, [0.3, 1], [0.9, 1])
  // the film runs while the scene holds
  const film = useTransform(run, [0.06, 0.94], ['0%', TRAVEL])
  const perfs = useTransform(run, [0, 1], ['0px', '-720px'])
  // the title drifts behind at its own speed — two planes, one scroll
  const ghost = useTransform(pass, [0, 1], flip ? ['-30%', '12%'] : ['12%', '-30%'])
  const leave = useTransform(run, [0.88, 1], [1, 0.25])

  useMotionValueEvent(run, 'change', (v) => {
    if (!counter.current) return
    const t = Math.min(1, Math.max(0, (v - 0.06) / 0.88))
    counter.current.textContent = pad(1 + Math.round(t * (FRAMES - 1)))
  })

  // the cursor becomes the button while it is over the screen
  const cx = useMotionValue(0)
  const cy = useMotionValue(0)
  const sx = useSpring(cx, spring.soft)
  const sy = useSpring(cy, spring.soft)
  const [over, setOver] = useState(false)
  const track = (e) => {
    const r = screen.current.getBoundingClientRect()
    cx.set(e.clientX - r.left)
    cy.set(e.clientY - r.top)
  }

  const open = () => onOpen(project.id, screen.current?.getBoundingClientRect())

  return (
    <article id={`project-${project.id}`} ref={ref} className="relative h-[175vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        {/* the ghost plane */}
        <m.p
          className="display pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-[clamp(7rem,19vw,22rem)] whitespace-nowrap text-transparent [-webkit-text-stroke:1px_rgb(237_233_227/0.09)]"
          style={{ x: ghost }}
          aria-hidden="true"
        >
          {project.title}
        </m.p>

        <m.div className="shell relative grid w-full grid-cols-12 items-center gap-x-[clamp(1.5rem,4vw,4rem)]" style={{ opacity: leave }}>
          {/* the screen */}
          <m.div
            className={`col-span-12 lg:col-span-8 ${flip ? 'lg:order-2 lg:col-start-5' : ''}`}
            style={{ scale: settle }}
          >
            <div className="mb-3 flex items-baseline justify-between gap-6">
              <span className="index flex items-center gap-2 text-paper-dim">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
                </span>
                Live build · {project.category}
              </span>
              <span className="index text-paper-faint" aria-hidden="true">
                FR <span ref={counter} className="text-paper">01</span> / {pad(FRAMES)}
              </span>
            </div>

            <m.button
              ref={screen}
              type="button"
              onClick={open}
              // place the disc before showing it — the screen can scroll in
              // under a pointer that has not moved yet
              onPointerEnter={(e) => {
                if (fine) track(e)
                setOver(true)
              }}
              onPointerLeave={() => setOver(false)}
              onPointerMove={fine ? track : undefined}
              aria-label={`Open the ${project.title} case study`}
              aria-haspopup="dialog"
              className={`relative block aspect-[16/10] w-full overflow-hidden bg-ink-2 ${fine ? 'cursor-none' : ''}`}
              style={{ clipPath: shutter }}
            >
              <m.img
                src={reel(project.id)}
                alt=""
                width="1280"
                height={STRIP_H}
                loading="lazy"
                decoding="async"
                className="absolute inset-x-[22px] top-0 h-auto w-[calc(100%-44px)] max-w-none will-change-transform"
                style={{ y: film }}
              />
              {/* perforations: the stock runs past the gate with the frames */}
              {['left-0', 'right-0'].map((side) => (
                <m.span
                  key={side}
                  className={`perfs absolute inset-y-0 ${side} w-[22px]`}
                  style={{ backgroundPositionY: perfs }}
                  aria-hidden="true"
                />
              ))}
              {/* gate vignette */}
              <span
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_58%,rgb(0_0_0/0.5)_100%)]"
                aria-hidden="true"
              />

              {fine && (
                <m.span
                  className="pointer-events-none absolute top-0 left-0 z-10 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ember text-paper"
                  style={{ x: sx, y: sy }}
                  animate={{ scale: over ? 1 : 0, opacity: over ? 1 : 0 }}
                  transition={{ duration: dur.ui, ease: ease.out }}
                  aria-hidden="true"
                >
                  <span className="control">Open</span>
                </m.span>
              )}
            </m.button>
          </m.div>

          {/* the slate */}
          <div className={`col-span-12 mt-10 lg:col-span-4 lg:mt-0 ${flip ? 'lg:order-1' : ''}`}>
            <p className="index text-ember">
              {project.number}
              <span className="text-paper-faint"> / {pad(projects.length)}</span>
            </p>
            <SplitText
              as="h3"
              text={project.title}
              mode="chars"
              className="display mt-5 block text-[clamp(2.2rem,4.4vw,5rem)] text-paper"
              amount={0.4}
            />
            <p className="mt-6 max-w-[38ch] text-[length:var(--text-lede)] leading-[1.45] text-paper-dim">
              {project.summary}
            </p>
            <div className="mt-8">
              <Facts project={project} />
            </div>
            <div className="mt-8">
              <Actions project={project} onOpen={open} />
            </div>
          </div>
        </m.div>
      </div>
    </article>
  )
}

/* Phones, tablets and reduced motion: no pinning, no scrubbing — the still print,
   the slate, and the same two exits. */
function Card({ project, onOpen }) {
  const ref = useRef(null)
  const open = () => onOpen(project.id, ref.current?.getBoundingClientRect())
  return (
    <article id={`project-${project.id}`} className="border-t hairline py-12 md:py-16">
      <p className="index text-ember">
        {project.number}
        <span className="text-paper-faint"> / {pad(projects.length)}</span>
      </p>
      <h3 className="display mt-4 text-[clamp(2.2rem,9vw,4.6rem)] text-paper">{project.title}</h3>
      <p className="mt-4 max-w-[48ch] text-paper-dim">{project.summary}</p>
      <button
        ref={ref}
        type="button"
        onClick={open}
        aria-label={`Open the ${project.title} case study`}
        aria-haspopup="dialog"
        className="mt-6 block w-full"
      >
        <Plate project={project} sizes="92vw" className="aspect-[16/10] w-full" />
      </button>
      <div className="mt-6">
        <Facts project={project} />
      </div>
      <div className="mt-6">
        <Actions project={project} onOpen={open} />
      </div>
    </article>
  )
}

export default function Work() {
  const section = useRef(null)
  const [openId, setOpenId] = useState(null)
  const [origin, setOrigin] = useState(null) // { id, rect } of the screen the case study grows from
  const reduced = useReducedMotion()
  // pinning needs room for the screen and its slate side by side
  const desktop = useIsDesktop()
  const pinned = !reduced && desktop

  // the projector takes the colour of whichever build is playing
  const inWork = useInView(section, { margin: '-45% 0px -45% 0px' })
  const playing = useActiveSection(projects.map((p) => `project-${p.id}`))
  useEffect(() => {
    const i = projects.findIndex((p) => `project-${p.id}` === playing)
    if (!inWork || i < 0) {
      projector.tint = projector.focus = projector.lamp = null
      return
    }
    const flip = pinned && i % 2 === 1
    projector.tint = hexToRgb(projects[i].palette.accent)
    projector.focus = pinned ? (flip ? [0.6, 0.52] : [0.4, 0.52]) : [0.5, 0.5]
    projector.lamp = flip ? [-0.12, -0.3] : [1.12, -0.3]
  }, [inWork, playing, pinned])
  useEffect(() => () => void (projector.tint = projector.focus = projector.lamp = null), [])

  // deep link: open the case study named in the hash, and make sure closing
  // it lands on the site rather than on the same URL again
  useEffect(() => {
    const openFromHash = () => {
      const id = idFromHash()
      if (!id) return
      history.replaceState(null, '', '#work')
      setOrigin(null)
      setOpenId(id)
    }
    openFromHash()
    // a pasted link on an already-open tab is a hashchange, not a load
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [])

  const onOpen = useCallback((id, rect) => {
    setOrigin(rect ? { id, rect } : null)
    setOpenId(id)
  }, [])

  // stable, so the dialog's history/focus effect runs once per open
  const close = useCallback(() => {
    projector.covered = false
    setOpenId(null)
  }, [])

  const open = projects.find((p) => p.id === openId)

  return (
    <>
      <section id="work" ref={section} className="relative pt-28 md:pt-40">
        <div className="shell relative">
          <SectionHeader index="01" label="Selected work" />
          <div className="mt-10 flex flex-col justify-between gap-6 md:mt-16 md:flex-row md:items-end">
            <SplitText
              as="h2"
              text="Four builds, all live"
              mode="words"
              className="display max-w-[12ch] text-[length:var(--text-huge)] text-paper"
            />
            <p className="max-w-[38ch] text-paper-dim">
              Self-initiated concepts, designed and built solo. The frames below were captured from each live site —
              open any one for the build notes.
            </p>
          </div>
        </div>

        {pinned ? (
          <div className="mt-8 md:mt-12">
            {projects.map((p, i) => (
              <Reel key={p.id} project={p} index={i} onOpen={onOpen} />
            ))}
          </div>
        ) : (
          <div className="shell mt-12 pb-16">
            {projects.map((p) => (
              <Card key={p.id} project={p} onOpen={onOpen} />
            ))}
            <div className="border-t hairline" />
          </div>
        )}
      </section>

      {/* key stays stable across "next project" so the dialog's history and
          focus effect runs once per open, not once per project */}
      <AnimatePresence>
        {open && <CaseStudy key="case-study" project={open} origin={origin} onClose={close} onNext={setOpenId} />}
      </AnimatePresence>
    </>
  )
}
