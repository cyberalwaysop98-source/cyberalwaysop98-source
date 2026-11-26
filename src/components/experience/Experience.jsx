import { useRef } from 'react'
import { useGSAP } from '../../lib/motion'
import { registerChapter } from '../../lib/stage'
import { revealIn } from '../../lib/reveal'
import { experience, meta } from '../../content'
import Roll from '../ui/Roll'
import Arrow from '../ui/Arrow'
import SectionHead from '../ui/SectionHead'

export default function Experience() {
  const root = useRef(null)
  useGSAP(() => revealIn(root.current), { scope: root })

  return (
    <section id="experience" ref={(el) => registerChapter('experience', el)} className="relative pb-[10vh] pt-[10vh]" aria-labelledby="exp-title">
      <div ref={root} className="layer shell">
        <SectionHead
          n="07"
          label="Experience"
          tone="l"
          aside={
            <a href={meta.resume} target="_blank" rel="noreferrer" className="label link-draw inline-flex items-center gap-1.5 text-ink" data-cursor="PDF">
              <Roll>Résumé</Roll> <Arrow dir="up-right" />
            </a>
          }
        />
        <h2 id="exp-title" className="h2 press mt-8" data-skew>
          <span className="block" data-reveal="chars">The record,</span>{' '}
          <em className="block italic" data-reveal="focus" data-delay="0.2">so far.</em>
        </h2>

        <ol className="mt-14">
          {experience.map((x) => (
            <li key={x.id} className="relative grid-12 gap-y-4 py-8 md:py-10">
              <span className="rule-fade-l absolute inset-x-0 top-0 h-px" data-reveal="rule" />
              <p className="serif press tnum col-span-12 text-[clamp(2.2rem,4.4vw,4.4rem)] leading-none md:col-span-4" data-reveal="scramble">
                {x.period}
              </p>
              <div className="col-span-12 md:col-span-4">
                <h3 className="title" data-reveal="lines">
                  {x.role}
                </h3>
                <p className="meta mt-2 text-ink-dim" data-reveal="fade">
                  {x.org}
                </p>
                {x.focus && (
                  <p className="label mt-3 text-ink" data-reveal="fade">
                    Role focus — {x.focus}
                  </p>
                )}
              </div>
              <div className="col-span-12 md:col-span-4">
                <p className="meta max-w-[46ch] text-ink-dim" data-reveal="para" data-delay="0.1">
                  {x.body}
                </p>
                <p className="label mt-4 text-ink-dim" data-reveal="scramble" data-delay="0.3">
                  {x.tags.join(' / ')}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <span className="block h-px bg-[var(--color-line-l)]" data-reveal="rule" />
      </div>
    </section>
  )
}
