import { useRef } from 'react'
import { gsap, useGSAP, MOTION_OK } from '../../lib/motion'
import { registerChapter } from '../../lib/stage'
import { useReducedMotion } from '../../lib/hooks'
import { statement } from '../../content'

/* The lit chapter condenses back into one point. The statement is ink on
   bone, so it stays readable only inside the shrinking light — outside it
   the dark covers it. (The stage draws the dark; see engine direct().) */
export default function Iris() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  const [a, b, c, d] = statement.lines

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.from('.iris-line', {
          yPercent: 100,
          opacity: 0,
          duration: 1.4,
          stagger: 0.09,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 55%', once: true },
        })
        gsap.to('.iris-text', {
          scale: 0.86,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section
      id="statement"
      ref={(el) => registerChapter('iris', el)}
      className={`relative ${reduced ? 'py-[18vh]' : 'h-[200vh]'}`}
      aria-label="Statement"
    >
      <div ref={root} className={reduced ? 'relative' : 'absolute inset-0'}>
        <div
          className={`${reduced ? 'relative' : 'sticky top-0 h-[100svh]'} z-[2] flex flex-col items-center justify-center px-[var(--gutter)] text-center`}
        >
          <p className="iris-text display text-ink">
            {[a, b].map((l) => (
              <span key={l} className="block overflow-hidden">
                <span className="iris-line block">{l}</span>
              </span>
            ))}
            <span className="block overflow-hidden">
              <span className="iris-line block">
                {c} <em className="serif normal-case italic">{d}</em>
              </span>
            </span>
          </p>
          <p className="meta mt-8 max-w-[44ch] text-ink-dim">{statement.note}</p>
        </div>
      </div>
    </section>
  )
}
