import { useRef } from 'react'
import { m, useScroll, useTransform } from 'motion/react'
import { ease, dur } from '../../lib/motion'
import { useFinePointer, useReducedMotion, scrollToId } from '../../lib/hooks'
import { useKineticType } from '../../lib/useKineticType'
import { hero } from '../../content'
import Magnetic from '../ui/Magnetic'
import Notation from '../ui/Notation'

/* Entry order is the point: the aperture is already opening on the light,
   the slate reads in, the title rises, the lede settles, the CTAs arrive
   last. The atmosphere itself is the page-wide projector (App.jsx). */
const T = { slate: 0.15, title: 0.4, serif: 0.65, lede: 1.05, cta: 1.25, cue: 1.6 }

export default function Hero({ ready }) {
  const ref = useRef(null)
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const kinetic = useKineticType()

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // the title card recedes rather than scrolls away: type lifts and thins
  const typeY = useTransform(scrollYProgress, [0, 1], ['0%', '-38%'])
  const typeOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const typeBlur = useTransform(scrollYProgress, [0.2, 0.8], ['blur(0px)', 'blur(4px)'])

  const rise = (delay) => ({
    initial: { y: '115%' },
    animate: ready ? { y: '0%' } : { y: '115%' },
    transition: { duration: dur.cinematic, ease: ease.out, delay },
  })
  const settle = (delay) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: dur.section, ease: ease.out, delay },
  })

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pt-24 pb-8"
    >
      <m.div className="shell relative" style={{ y: typeY, opacity: typeOpacity, filter: reduced ? 'none' : typeBlur }}>
        {/* slate */}
        <ul className="mb-8 flex flex-wrap gap-x-6 gap-y-2 md:mb-12 md:gap-x-10" aria-label="About this site">
          {hero.slate.map((item, i) => (
            <li key={item} className="overflow-hidden">
              <m.span className="eyebrow block" {...rise(T.slate + i * 0.08)}>
                <span className="mr-2 text-ember">{String(i + 1).padStart(2, '0')}</span>
                {item}
              </m.span>
            </li>
          ))}
        </ul>

        {/* Kinetic type: letters part gently away from the cursor within this
            block — see src/lib/useKineticType.js. Desktop only, discoverable
            rather than announced, and fully inert under reduced motion. */}
        <h1
          ref={kinetic.rootRef}
          aria-label={`${hero.lines.join(' ')} ${hero.serif}`}
          className="display text-[length:var(--text-mega)] text-paper"
        >
          {hero.lines.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <m.span className="block will-change-transform" {...rise(T.title + i * 0.09)}>
                <span aria-hidden="true">
                  {[...line].map((ch, ci) => (
                    <span key={ci} ref={kinetic.register} className="inline-block will-change-transform">
                      {ch}
                    </span>
                  ))}
                </span>
              </m.span>
            </span>
          ))}
          {/* sized to hold on one line — the didone runs much wider than a grotesque */}
          <span className="mt-1 block overflow-hidden pb-[0.16em] md:mt-2 md:pl-[7vw]" aria-hidden="true">
            <m.span
              className="accent-serif block text-[clamp(1.75rem,5vw,4.5rem)] leading-[1.02] text-ember will-change-transform"
              {...rise(T.serif)}
            >
              {hero.serif}
            </m.span>
          </span>
        </h1>

        {kinetic.active && (
          <m.span
            aria-hidden="true"
            className="pointer-events-none fixed top-0 left-0 z-[60] -translate-x-1/2 -translate-y-[170%]"
            style={{ x: kinetic.labelX, y: kinetic.labelY, opacity: kinetic.labelOpacity }}
          >
            <Notation code="T01" tags={['Kinetic type']} className="rounded-full border hairline bg-ink/85 px-3 py-1.5 backdrop-blur-sm" />
          </m.span>
        )}

        <div className="mt-10 flex flex-col gap-8 border-t hairline pt-6 md:mt-14 md:flex-row md:items-start md:justify-between">
          <m.p
            className="max-w-[46ch] text-[length:var(--text-lede)] leading-[1.45] text-paper-dim"
            {...settle(T.lede)}
          >
            {hero.lede}
          </m.p>

          <m.div className="flex shrink-0 flex-wrap gap-3" {...settle(T.cta)}>
            {hero.ctas.map(({ label, id }, i) => (
              <Magnetic key={id} strength={0.3}>
                <button
                  type="button"
                  onClick={() => scrollToId(id)}
                  className={`control rounded-full px-6 py-3 tracking-[0.16em] transition-colors duration-500 ${
                    i === 0
                      ? 'bg-paper text-ink hover:bg-ember hover:text-paper'
                      : 'border hairline text-paper hover:border-ember hover:text-ember'
                  }`}
                >
                  {label}
                </button>
              </Magnetic>
            ))}
          </m.div>
        </div>
      </m.div>

      {/* scroll cue */}
      <m.div
        className="shell mt-10 flex items-center justify-between"
        style={{ opacity: typeOpacity }}
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: T.cue, duration: dur.section }}
      >
        <span className="eyebrow flex items-center gap-3">
          Scroll
          <span className="relative block h-px w-16 overflow-hidden bg-line">
            {!reduced && (
              <m.span
                className="absolute inset-y-0 left-0 w-1/3 bg-ember"
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: ease.inOut }}
              />
            )}
          </span>
        </span>
        {/* only where the pointer light actually runs */}
        {fine && !reduced && <span className="eyebrow">Move your cursor — the light follows</span>}
      </m.div>
    </section>
  )
}
