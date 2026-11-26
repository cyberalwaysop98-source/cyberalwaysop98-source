import { useEffect, useRef, useState } from 'react'
import { m } from 'motion/react'
import { ease, dur } from '../../lib/motion'
import { useReducedMotion, lockScroll, scrollToId } from '../../lib/hooks'
import { projector } from '../../lib/projector'
import { projects } from '../../content'
import Notation from '../ui/Notation'
import Plate from './Plate'

/* A build log, not an agency case study: every chapter can be filled
   honestly for a self-initiated concept. */
const CHAPTERS = [
  ['Overview', 'overview'],
  ['Problem', 'problem'],
  ['Approach', 'approach'],
  ['Build', 'build'],
  ['Result', 'result'],
]

/* How the pieces connect, drawn as a signal path: one hairline, one node
   per system, read top to bottom in order of data flow. */
function System({ steps }) {
  return (
    <ol className="relative mt-10" aria-label="System architecture">
      <span className="absolute top-2 bottom-2 left-[3px] w-px bg-line" aria-hidden="true" />
      {steps.map(([name, role]) => (
        <li key={name} className="relative grid grid-cols-[auto_1fr] items-baseline gap-x-5 py-2.5 pl-0">
          <span className="relative z-10 mt-[0.35em] h-[7px] w-[7px] rounded-full border border-ember bg-ink" aria-hidden="true" />
          <p className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
            <span className="index min-w-[11rem] text-paper">{name}</span>
            <span className="meta text-paper-dim">{role}</span>
          </p>
        </li>
      ))}
    </ol>
  )
}

/* Where the dialog opens from. Opened from a reel, it grows out of that
   screen's own rectangle — the frame you clicked becomes the page. Opened
   any other way (a shared link, the command palette), it rises from below.
   Every state is written as inset(top% right bottom left) in the same
   units, so Motion can interpolate between them. */
const RISE = 'inset(100% 0px 0px 0px)'
const FULL = 'inset(0% 0px 0px 0px)'
function fromRect(r) {
  if (!r) return RISE
  const vw = window.innerWidth
  const vh = window.innerHeight
  return `inset(${((r.top / vh) * 100).toFixed(3)}% ${Math.max(0, vw - r.right)}px ${Math.max(0, vh - r.bottom)}px ${Math.max(0, r.left)}px)`
}

export default function CaseStudy({ project, origin, onClose, onNext }) {
  const panel = useRef(null)
  const closeBtn = useRef(null)
  const reduced = useReducedMotion()
  // fixed for the life of the dialog: it closes back into the screen it came from
  const [closed] = useState(() => (origin && origin.id === project.id ? fromRect(origin.rect) : RISE))
  const firstId = useRef(project.id)

  const idx = projects.findIndex((p) => p.id === project.id)
  // guard the single-project case, where % would point "next" at itself
  const next = projects.length > 1 ? projects[(idx + 1) % projects.length] : null

  useEffect(() => {
    const returnTo = document.activeElement
    lockScroll(true)
    closeBtn.current?.focus()

    // History owns dismissal: every close routes through history.back(), and
    // popstate is the single thing that actually closes. The entry carries the
    // project's URL, so an open case study is shareable. `onClose` must be
    // stable (useCallback) or this effect re-runs and stacks history entries.
    history.pushState({ caseStudy: true }, '', `#work/${project.id}`)
    const onPop = () => onClose()
    window.addEventListener('popstate', onPop)

    const onKey = (e) => {
      if (e.key === 'Escape') return history.back()
      if (e.key !== 'Tab') return
      // keep focus inside the dialog
      const items = panel.current.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])')
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      projector.covered = false
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPop)
      lockScroll(false)
      returnTo?.focus?.()
    }
    // the open project's id is read once; "next project" updates the URL below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose])

  // next project: re-enter at the top, and keep the URL pointing at it
  useEffect(() => {
    panel.current?.scrollTo({ top: 0 })
    if (history.state?.caseStudy) history.replaceState({ caseStudy: true }, '', `#work/${project.id}`)
  }, [project.id])

  // close first, then scroll — the page behind stays locked until unmount
  const toContact = () => {
    history.back()
    setTimeout(() => scrollToId('contact'), reduced ? 0 : 1000)
  }

  const facts = [
    ['Type', project.type],
    ['Year', project.year],
    ['Role', project.role],
    ['Stack', project.stack.join(', ')],
  ]

  // chapters develop as the reader reaches them, inside the overlay's own scroller
  const reveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { root: panel, once: true, amount: 0.25 },
    transition: { duration: dur.section, ease: ease.out },
  }

  return (
    <m.div
      className="fixed inset-0 z-[70] bg-ink"
      initial={{ clipPath: closed }}
      animate={{ clipPath: FULL }}
      // after "next project" the frame it came from no longer matches — sink instead
      exit={{ clipPath: project.id === firstId.current ? closed : RISE }}
      transition={{ duration: reduced ? 0 : dur.cinematic * 0.7, ease: ease.inOut }}
      // fully covered: the projector behind can rest
      onAnimationComplete={(def) => {
        if (def?.clipPath === FULL) projector.covered = true
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — case study`}
    >
      <div ref={panel} className="h-full overflow-y-auto overscroll-contain">
        {/* bar */}
        <div className="sticky top-0 z-10 border-b border-line/70 bg-ink/80 backdrop-blur-xl">
          <div className="shell flex h-[68px] items-center justify-between gap-6">
            <Notation code={`B${project.number}`} tags={project.dna} />
            <button
              ref={closeBtn}
              type="button"
              onClick={() => history.back()}
              /* 44px tall: this is the only exit on touch */
              className="eyebrow -mr-2 flex h-11 items-center px-2 text-paper transition-colors hover:text-ember"
            >
              Close (Esc)
            </button>
          </div>
        </div>

        <header key={project.id} className="shell pt-16 pb-10 md:pt-24">
          <p className="eyebrow">
            <span className="text-ember">{project.number}</span> — {project.category}
          </p>
          <div className="mt-5 overflow-hidden pb-[0.08em]">
            <m.h2
              className="display text-[length:var(--text-huge)] text-paper"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: dur.cinematic * 0.8, ease: ease.out, delay: reduced ? 0 : 0.45 }}
            >
              {project.title}
            </m.h2>
          </div>
          <m.p
            className="mt-6 max-w-[52ch] text-[length:var(--text-lede)] leading-[1.45] text-paper-dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: dur.section, delay: reduced ? 0 : 0.75 }}
          >
            {project.summary}
          </m.p>

          <dl className="mt-10 grid grid-cols-2 gap-6 border-t hairline pt-6 md:grid-cols-5">
            {facts.map(([k, v], i) => (
              <m.div
                key={k}
                className={k === 'Stack' ? 'col-span-2' : ''}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: dur.ui, ease: ease.out, delay: reduced ? 0 : 0.85 + i * 0.06 }}
              >
                <dt className="eyebrow">{k}</dt>
                <dd className="meta mt-2 text-paper">{v}</dd>
              </m.div>
            ))}
          </dl>
        </header>

        <div className="shell">
          {/* keyed by project so "next project" develops a fresh print */}
          <Plate key={project.id} project={project} eager className="aspect-[16/10] w-full" />
          <a
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="group mt-4 flex items-baseline justify-between gap-6 border-b hairline pb-4"
          >
            <span className="eyebrow text-paper transition-colors group-hover:text-ember">Visit the live site ↗</span>
            <span className="index truncate text-paper-faint">{project.href.replace('https://', '')}</span>
          </a>
        </div>

        <div className="shell flex flex-col py-20 md:py-28">
          {CHAPTERS.map(([label, key], i) => (
            <m.section
              key={`${project.id}-${key}`}
              className="grid grid-cols-1 gap-x-10 gap-y-4 border-t hairline py-10 md:grid-cols-12 md:py-14"
              {...reveal}
            >
              <h3 className="eyebrow md:col-span-3">
                <span className="text-ember">{String(i + 1).padStart(2, '0')}</span> / {label}
              </h3>
              <div className="md:col-span-8 md:col-start-5">
                <p className="max-w-[58ch] text-[length:var(--text-lede)] leading-[1.5] text-paper">{project.study[key]}</p>

                {key === 'build' && (
                  <>
                    <dl className="mt-10 border-t hairline">
                      {project.notes.map(([k, v]) => (
                        <div key={k} className="grid grid-cols-1 gap-2 border-b hairline py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                          <dt className="eyebrow">{k}</dt>
                          <dd className="meta max-w-[56ch] text-paper">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="eyebrow mt-12">System</p>
                    <System steps={project.system} />
                    <p className="meta mt-6 text-paper-faint">
                      Stack and sizes read from the live bundle. Sizes are gzipped, as served.
                    </p>
                  </>
                )}
              </div>
            </m.section>
          ))}
        </div>

        {/* the last frame offers the two exits the site actually wants */}
        <div className="border-t hairline">
          <div className="shell grid grid-cols-1 md:grid-cols-2">
            {next && (
              <button type="button" onClick={() => onNext(next.id)} className="group py-16 text-left md:py-24 md:pr-12">
                <span className="eyebrow block">Next project — {next.number}</span>
                <span className="display mt-5 block text-[clamp(1.9rem,4.5vw,3.6rem)] text-paper transition-colors duration-500 group-hover:text-ember">
                  {next.title}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={toContact}
              className={`group border-t hairline py-16 text-left md:border-t-0 md:py-24 ${
                next ? 'md:border-l md:pl-12' : 'md:col-span-2'
              }`}
            >
              <span className="eyebrow block">Seen enough</span>
              <span className="display mt-5 block text-[clamp(1.9rem,4.5vw,3.6rem)] text-paper transition-colors duration-500 group-hover:text-ember">
                Start a conversation
              </span>
            </button>
          </div>
        </div>
      </div>
    </m.div>
  )
}
