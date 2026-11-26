import { useRef } from 'react'
import { AnimatePresence, m, useScroll } from 'motion/react'
import { ease, dur } from '../../lib/motion'
import { useActiveSection, useReducedMotion } from '../../lib/hooks'
import { experience } from '../../content'
import SectionHeader from '../ui/SectionHeader'
import SplitText from '../ui/SplitText'
import Odometer from '../ui/Odometer'

export default function Experience() {
  const root = useRef(null)
  const reduced = useReducedMotion()

  // the line draws as you read — scroll-scrubbed, not a canned animation
  const { scrollYProgress } = useScroll({ target: root, offset: ['start 55%', 'end 75%'] })
  // the entry crossing the middle of the viewport is the one being read
  const activeId = useActiveSection(experience.map((_, i) => `xp-${i}`))
  const active = activeId ? Number(activeId.slice(3)) : 0

  const current = experience[active]
  // "2021 — 2025" → 2021 / "to 2025";  "2025 — Present" → 2025 / "to the present"
  const [year, until] = current.period.split('—').map((s) => s.trim())
  const rest = until ? `to ${until === 'Present' ? 'the present' : until}` : ''

  return (
    <section id="experience" ref={root} className="shell relative py-28 md:py-40">
      <SectionHeader index="05" label="Experience" />

      <SplitText
        as="h2"
        text="Where the hours went"
        mode="chars"
        className="display mt-10 text-[length:var(--text-huge)] text-paper md:mt-16"
      />

      <div className="mt-16 grid grid-cols-1 gap-12 md:mt-24 md:grid-cols-12 md:gap-10">
        {/* sticky readout — CSS sticky, no pinning, no scroll hijack */}
        <div className="hidden md:col-span-4 md:block">
          <div className="sticky top-[20vh]">
            {/* the year rolls like a frame counter; the rest of the period
                reads underneath in the serif */}
            <p className="display text-[clamp(4.5rem,9vw,9.5rem)] text-paper">
              <Odometer value={year} />
            </p>
            <div className="mt-2 h-[1.3em] overflow-hidden text-[clamp(1.4rem,2.2vw,2.2rem)] leading-[1.25]">
              <AnimatePresence mode="wait" initial={false}>
                <m.p
                  key={`rest-${active}`}
                  className="accent-serif whitespace-nowrap text-ember"
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '-105%' }}
                  transition={{ duration: dur.ui, ease: ease.inOut }}
                >
                  {rest || ' '}
                </m.p>
              </AnimatePresence>
            </div>

            <div className="mt-5 overflow-hidden py-[0.12em] text-[length:var(--text-lede)] leading-[1.3]">
              <AnimatePresence mode="wait">
                <m.p
                  key={`role-${active}`}
                  className="text-paper"
                  initial={{ y: '105%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '-105%', opacity: 0 }}
                  transition={{ duration: dur.ui, ease: ease.inOut, delay: 0.04 }}
                >
                  {current.role}
                </m.p>
              </AnimatePresence>
            </div>

            <div className="mt-10 flex gap-2">
              {experience.map((e, i) => (
                <span
                  key={e.id}
                  className="h-px flex-1 transition-colors duration-500"
                  style={{
                    background: i <= active ? 'var(--color-ember)' : 'var(--color-line)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* the track */}
        <div className="relative md:col-span-7 md:col-start-6">
          <span className="absolute top-0 bottom-0 left-0 w-px bg-line" aria-hidden="true" />
          <m.span
            style={{ scaleY: reduced ? 1 : scrollYProgress }}
            className="absolute top-0 bottom-0 left-0 w-px origin-top bg-ember"
            aria-hidden="true"
          />

          <ol className="flex flex-col">
            {experience.map((e, i) => (
              <li key={e.id} id={`xp-${i}`} className="relative pb-16 pl-8 md:pb-24 md:pl-14">
                <m.span
                  className="absolute top-2 -left-[3px] h-[7px] w-[7px] rounded-full"
                  animate={{
                    backgroundColor: i <= active ? 'var(--color-ember)' : 'var(--color-line)',
                    scale: i === active ? 1.6 : 1,
                  }}
                  transition={{ duration: dur.ui, ease: ease.out }}
                  aria-hidden="true"
                />

                <m.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: dur.section, ease: ease.out }}
                >
                  <p className="eyebrow text-ember md:hidden">{e.period}</p>
                  <h3 className="display mt-2 text-[clamp(1.5rem,3.2vw,2.6rem)] text-paper md:mt-0">
                    {e.role}
                  </h3>
                  <p className="meta mt-3 tracking-[0.06em] text-paper-faint uppercase">
                    {e.org}
                  </p>
                  {e.focus && (
                    <p className="meta mt-2 text-paper-dim">
                      <span className="eyebrow mr-3">Role focus</span>
                      {e.focus}
                    </p>
                  )}
                  <p className="mt-5 max-w-[48ch] leading-[1.55] text-paper-dim">{e.body}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {e.tags.map((t) => (
                      <span
                        key={t}
                        className="eyebrow rounded-full border hairline px-3 py-1 tracking-[0.14em] text-paper-dim"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </m.div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
