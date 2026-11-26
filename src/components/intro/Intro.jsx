import { Fragment, useRef } from 'react'
import { gsap, useGSAP, MOTION_OK } from '../../lib/motion'
import { registerChapter } from '../../lib/stage'
import { useReducedMotion } from '../../lib/hooks'
import { intro, projects } from '../../content'

const SCALE = ['∞', '10', '5', '3', '2', '1.5', '1', '.7', '.5', '.4', '.35', '.3']

/* the sentence, as words and inline frames of the four live builds */
function parse(text) {
  const out = []
  text.split(/(\{\d\})/).forEach((part) => {
    const m = part.match(/^\{(\d)\}$/)
    if (m) out.push({ thumb: projects[+m[1]] })
    else part.split(/\s+/).filter(Boolean).forEach((w) => out.push({ word: w }))
  })
  return out
}

export default function Intro() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  const tokens = parse(intro.text)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const items = gsap.utils.toArray('.iw, .ithumb', root.current)
        gsap.set('.iw', { opacity: 0.12, filter: 'blur(3.5px)', yPercent: 14 })
        gsap.set('.ithumb', { scale: 0, opacity: 0 })
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        })
        items.forEach((el, i) => {
          const at = (i / items.length) * 0.9
          if (el.classList.contains('ithumb')) tl.to(el, { scale: 1, opacity: 1, duration: 0.06, ease: 'back.out(2)' }, at)
          else tl.to(el, { opacity: 1, filter: 'blur(0px)', yPercent: 0, duration: 0.035, ease: 'none' }, at)
        })
        // the lens: the marker runs from infinity to sharp
        tl.fromTo('.focus-mark', { left: '0%' }, { left: '100%', duration: 0.95, ease: 'none' }, 0)

        gsap.from('.intro-head > *', {
          opacity: 0,
          y: 20,
          duration: 1.2,
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section
      id="intro"
      ref={(el) => registerChapter('intro', el)}
      className={`relative ${reduced ? 'py-[16vh]' : 'h-[170vh] md:h-[190vh]'}`}
      aria-label="Intro"
    >
      <div ref={root} className={reduced ? 'relative' : 'absolute inset-0'}>
        <div className={`${reduced ? 'relative' : 'sticky top-0 h-[100svh]'} z-[2] flex flex-col justify-center`}>
          <div className="intro-frame shell">
            <div className="intro-head mb-8 flex items-baseline justify-between md:mb-12">
              <p className="label text-light-dim">(01) — Intro</p>
              <p className="label text-light-dim">Bringing it into focus</p>
            </div>
            <p className="lead max-w-[26ch] text-light md:max-w-[34ch]" data-skew>
              {tokens.map((t, i) =>
                t.thumb ? (
                  <a
                    key={i}
                    href={`#work/${t.thumb.id}`}
                    data-cursor={t.thumb.title}
                    tabIndex={-1}
                    className="ithumb mx-[0.1em] inline-block h-[0.82em] translate-y-[0.06em] overflow-hidden align-baseline"
                    style={{ aspectRatio: '16 / 10' }}
                    aria-label={`${t.thumb.title} — open the case study`}
                  >
                    <img src={`/work/${t.thumb.id}-800.webp`} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </a>
                ) : (
                  <Fragment key={i}>
                    <span className={`iw gpu-blur inline-block ${intro.accent.some((a) => t.word.startsWith(a)) ? 'serif italic lit' : ''}`}>{t.word}</span>{' '}
                  </Fragment>
                ),
              )}
            </p>

            {/* a lens focus-distance scale; the marker reads the scroll */}
            <div className="mt-12 max-w-[34rem] md:mt-16" aria-hidden="true">
              <div className="relative flex justify-between">
                {SCALE.map((s) => (
                  <span key={s} className="label tnum flex flex-col items-center gap-1.5 text-light-dim">
                    <i className="block h-2 w-px bg-current" />
                    {s}
                  </span>
                ))}
                <i className="focus-mark absolute -top-1 block h-3.5 w-px -translate-x-1/2 bg-flare" style={{ left: '100%' }} />
              </div>
              <p className="label mt-3 text-light-dim">Focus — metres</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
