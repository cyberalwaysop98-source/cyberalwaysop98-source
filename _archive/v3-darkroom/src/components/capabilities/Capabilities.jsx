import { capabilities, projects } from '../../content'
import SectionHeader from '../ui/SectionHeader'
import SplitText from '../ui/SplitText'
import Reveal from '../ui/Reveal'

/* Set like film credits — discipline .......... tools — because that is
   what this is: who did what on the four builds. No meters, no
   percentages. "Shipped in" is derived from the project stacks, so it can
   only claim what shipped, and each name deep-links to that case study
   (#work/<id>), keeping every claim one click from its proof. */
const usedIn = (tech) => projects.filter((p) => p.stack.some((s) => tech.includes(s)))

export default function Capabilities() {
  return (
    <section id="capabilities" className="shell relative py-28 md:py-40">
      <SectionHeader index="03" label="Capabilities" />

      <div className="mt-10 flex flex-col justify-between gap-6 md:mt-16 md:flex-row md:items-end">
        <SplitText
          as="h2"
          text="What the work is made of"
          mode="words"
          className="display max-w-[14ch] text-[length:var(--text-huge)] text-paper"
        />
        <p className="max-w-[34ch] text-paper-dim">Six disciplines, and only the tools I have actually used.</p>
      </div>

      <ol className="mt-16 md:mt-24">
        {capabilities.map((c, i) => {
          const proof = usedIn(c.tech)
          return (
            <Reveal as="li" key={c.title} amount={0.4} y={36} delay={(i % 2) * 0.05}>
              <div className="group relative border-t hairline py-6 md:py-8">
                {/* the credit line */}
                <div className="flex items-baseline gap-4 md:gap-6">
                  <span className="index w-7 shrink-0 text-ember">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="shrink-0 text-[clamp(1.4rem,2.6vw,2.3rem)] text-paper transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:group-hover:translate-x-2">
                    {c.title}
                  </h3>
                  <span
                    className="leader hidden flex-1 self-center text-line transition-colors duration-700 group-hover:text-ember md:block"
                    aria-hidden="true"
                  />
                  <ul className="hidden shrink-0 flex-wrap justify-end gap-x-3 md:flex" aria-label={`${c.title} tools`}>
                    {c.tech.map((t) => (
                      <li key={t} className="index text-paper">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* the small print */}
                <div className="mt-3 grid grid-cols-1 gap-x-10 gap-y-3 pl-11 md:mt-4 md:grid-cols-12 md:pl-[3.25rem]">
                  <p className="meta max-w-[46ch] text-paper-dim md:col-span-6">{c.body}</p>
                  <ul className="flex flex-wrap gap-x-3 gap-y-1 md:hidden" aria-label={`${c.title} tools`}>
                    {c.tech.map((t) => (
                      <li key={t} className="index text-paper">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="md:col-span-6 md:text-right">
                    {proof.length > 0 && (
                      <p className="meta text-paper-faint">
                        Shipped in{' '}
                        {proof.map((p, j) => (
                          <span key={p.id}>
                            <a
                              href={`#work/${p.id}`}
                              className="underline decoration-line underline-offset-2 transition-colors hover:text-ember"
                            >
                              {p.title}
                            </a>
                            {j < proof.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </p>
                    )}
                    {c.proof && <p className="meta mt-2 text-paper-dim md:ml-auto md:max-w-[52ch]">{c.proof}</p>}
                  </div>
                </div>
              </div>
            </Reveal>
          )
        })}
      </ol>
      <div className="border-t hairline" />
    </section>
  )
}
