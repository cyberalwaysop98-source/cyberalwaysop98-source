import { useRef } from 'react'
import { m, useScroll, useTransform } from 'motion/react'
import { useReducedMotion } from '../../lib/hooks'
import SectionHeader from '../ui/SectionHeader'
import ScrubText from '../ui/ScrubText'
import Reveal from '../ui/Reveal'
import { about } from '../../content'

/* The one chapter printed rather than projected. Everything else on the
   site is light on a dark screen; here the darkroom produces a print —
   a sheet of paper opens out of the top edge of the section like an
   aperture, and the heading develops word by word as it is read. */
export default function About() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 96%', 'start 8%'] })
  // once fully open the clip is released, so a section taller than the
  // circle (a phone, a long chapter) is never cut off at the bottom
  const sheet = useTransform(scrollYProgress, (v) =>
    v >= 0.999 ? 'none' : `circle(${(v * 150).toFixed(2)}vmax at 50% 0%)`,
  )

  return (
    <section id="about" ref={ref} className="relative text-ink">
      <m.div
        className="absolute inset-0 rounded-b-[clamp(1.5rem,5vw,5rem)] bg-paper"
        style={{ clipPath: reduced ? 'none' : sheet }}
        aria-hidden="true"
      />

      <div className="shell relative py-28 md:py-40">
        <SectionHeader index="04" label="About" tone="paper" />

        <ScrubText
          as="h2"
          text={about.heading}
          className="display mt-10 max-w-[18ch] text-[length:var(--text-huge)] text-ink md:mt-16"
        />

        <div className="mt-20 flex flex-col md:mt-28">
          {about.chapters.map((c, i) => (
            <Reveal key={c.index} delay={i * 0.06} amount={0.25}>
              <div className="grid grid-cols-1 gap-6 border-t border-line-paper py-10 md:grid-cols-12 md:gap-10 md:py-14">
                <p className="eyebrow flex gap-3 text-ink-soft md:col-span-3">
                  <span className="text-ember-deep">{c.index}</span>
                  <span>{c.label}</span>
                </p>

                <div className="md:col-span-8 md:col-start-5">
                  {c.body.map((p, j) => (
                    <p
                      key={j}
                      className={`max-w-[54ch] text-[length:var(--text-lede)] leading-[1.5] ${
                        j === 0 ? 'text-ink' : 'mt-5 text-ink-soft'
                      }`}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
