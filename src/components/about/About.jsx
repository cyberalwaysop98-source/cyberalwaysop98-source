import { useRef } from 'react'
import { useGSAP } from '../../lib/motion'
import { registerChapter } from '../../lib/stage'
import { revealIn } from '../../lib/reveal'
import { about, meta, name } from '../../content'
import SectionHead from '../ui/SectionHead'

export default function About() {
  const root = useRef(null)
  useGSAP(() => revealIn(root.current), { scope: root })
  const [first, last] = meta.name.split(' ')

  return (
    <section id="about" ref={(el) => registerChapter('about', el)} className="relative py-[14vh]" aria-labelledby="about-title">
      <div ref={root} className="layer shell">
        <SectionHead n="06" label="About" aside="Not a studio — one person" tone="l" />

        <div className="mt-10 grid-12 gap-3">
          {/* the name, and the light inside it */}
          <div data-reveal="pixels" className="tile-depth relative col-span-12 flex min-h-[clamp(300px,34vw,480px)] flex-col justify-between overflow-hidden bg-void p-6 text-light md:col-span-7 md:p-8">
            <span aria-hidden="true" className="light-point absolute right-[14%] top-[22%] h-2 w-2 rounded-full bg-light" />
            <p className="label text-light-dim">{meta.role} — {meta.location}</p>
            <h2 id="about-title" className="display lit" data-reveal="chars" data-delay="0.4" data-skew>
              {first}
            </h2>
          </div>

          {/* the etymology card */}
          <div data-reveal="pixels" className="tile-depth relative col-span-12 flex flex-col justify-between gap-8 bg-light p-6 text-ink md:col-span-5 md:p-8">
            <div className="flex items-baseline justify-between">
              <p className="label text-ink-dim">Etymology</p>
              <p className="label text-ink-dim">{name.lang}</p>
            </div>
            <div>
              <p className="h2 press italic" data-reveal="focus" data-delay="0.5">
                {name.word}
              </p>
              <p className="title mt-2 text-ink-dim" lang="sa">
                {name.script}
              </p>
              <p className="title mt-6">{name.sense}</p>
              <p className="meta mt-4 max-w-[36ch] text-ink-dim">{name.note}</p>
            </div>
          </div>

          <div data-reveal="pixels" className="tile-depth relative col-span-12 flex min-h-[clamp(200px,22vw,320px)] items-end bg-bone-2 p-6 md:col-span-5 md:p-8">
            <p className="display press text-ink" data-reveal="chars" data-delay="0.4" data-skew>
              {last}
            </p>
          </div>

          <div data-reveal="pixels" className="tile-depth relative col-span-12 flex items-end bg-void-2 p-6 text-light md:col-span-7 md:p-8">
            <p className="h2 lit max-w-[18ch]" data-reveal="lines" data-delay="0.5">
              {about.heading.split(' ').slice(0, -3).join(' ')} <em className="italic">{about.heading.split(' ').slice(-3).join(' ')}</em>
            </p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {about.chapters.map((c, i) => (
            <article key={c.index} className="relative pt-5">
              <span className="absolute inset-x-0 top-0 h-px bg-[var(--color-line-l)]" data-reveal="rule" data-delay={String(i * 0.1)} />
              <p className="label tnum text-ink-dim">
                <span className="text-flare">{c.index}</span> — {c.label}
              </p>
              {c.body.map((b, k) => (
                <p key={k} className="mt-4 max-w-[44ch] text-ink" data-reveal="para" data-delay={String(i * 0.1 + k * 0.05)}>
                  {b}
                </p>
              ))}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
