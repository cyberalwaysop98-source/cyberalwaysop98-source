import { useRef } from 'react'
import { gsap, SplitText, useGSAP, MOTION_OK, GLYPHS } from '../../lib/motion'
import { registerChapter } from '../../lib/stage'
import { scrollToId } from '../../lib/hooks'
import { proximity } from '../../lib/kinetic'
import RingText from '../ui/RingText'
import Arrow from '../ui/Arrow'
import { hero, meta } from '../../content'

/* callouts around the light: angle (deg, 0 = right, clockwise), leader
   length, and which side of the line's end the text sits on */
const NOTES = [
  // on phones A swings up and right of the light, where its words have room
  { a: -150, l: 'clamp(150px, 21vw, 330px)', side: 'left', mobile: true, am: -100, lm: '140px' },
  { a: -12, l: 'clamp(140px, 19vw, 300px)', side: 'right' },
  { a: 172, l: 'clamp(140px, 17vw, 260px)', side: 'left' },
]

export default function Hero({ ready }) {
  const root = useRef(null)

  useGSAP(
    () => {
      if (!ready) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const title = SplitText.create('.hero-title .line', { type: 'chars', charsClass: 'inline-block gpu-blur' })
        const tl = gsap.timeline({ delay: 0.15 })
        tl.from(title.chars, {
          opacity: 0,
          filter: 'blur(18px)',
          yPercent: 30,
          scale: 1.1,
          duration: 2,
          stagger: { each: 0.045, from: 'center' },
          ease: 'expo.out',
          clearProps: 'filter',
        })
          .from('.finder', { scale: 0, rotate: -90, opacity: 0, duration: 1.8, ease: 'expo.out' }, 0.2)
          .from('.note-line', { scaleX: 0, duration: 1.4, stagger: 0.14, ease: 'expo.inOut' }, 0.5)
          .from('.note-dot', { scale: 0, duration: 0.6, stagger: 0.14, ease: 'back.out(3)' }, 1.4)
          .from('.note-text > *', { opacity: 0, x: (i, el) => (el.closest('[data-side=left]') ? 16 : -16), duration: 1.1, stagger: 0.06 }, 1.5)
          .from(SplitText.create('.hero-lede', { type: 'lines', mask: 'lines', linesClass: 'mask-line' }).lines, { yPercent: 110, duration: 1.3, stagger: 0.07 }, 0.95)
          .from('.hero-ring', { scale: 0.4, opacity: 0, rotation: -120, duration: 1.8, ease: 'expo.out' }, 1.1)
          .from('.hero-meta-rule', { scaleX: 0, transformOrigin: '0 50%', duration: 1.6, ease: 'expo.inOut' }, 0.8)
          .from('.hero-meta > *', { opacity: 0, yPercent: 60, duration: 1.2, stagger: 0.07 }, 1.2)
          .from('.hero-plate', { opacity: 0, duration: 0.4 }, 1.0)
          .to('.hero-plate', { duration: 1.2, scrambleText: { text: '{original}', chars: GLYPHS, speed: 0.5 }, ease: 'none' }, 1.0)

        // letters near the cursor lift, like a wave passing under them
        const unprox = proximity(title.chars, { mode: 'lift', radius: 240, amount: 28, root: root.current })

        // scrolling out: the title loses focus as the camera dives past it
        const out = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
        out
          .to('.hero-notes', { opacity: 0, scale: 1.15, duration: 0.35, ease: 'none' }, 0)
          .to('.finder', { scale: 2.2, opacity: 0, duration: 0.5, ease: 'none' }, 0)
          .to('.hero-title .l1', { xPercent: -14, opacity: 0, filter: 'blur(12px)', ease: 'none' }, 0)
          .to('.hero-title .l2', { xPercent: 14, opacity: 0, filter: 'blur(12px)', ease: 'none' }, 0)
          .to('.hero-lede, .hero-meta, .hero-plate, .hero-ring', { y: -60, opacity: 0, ease: 'none', duration: 0.6 }, 0)
        return unprox
      })
    },
    { dependencies: [ready], scope: root },
  )

  return (
    <section
      id="top"
      ref={(el) => {
        root.current = el
        registerChapter('hero', el)
      }}
      className="relative h-[100svh] min-h-[640px]"
      aria-label="Introduction"
    >
      {/* the still light, for visitors without the live stage */}
      <div
        aria-hidden="true"
        className="still-light absolute inset-0 [html[data-stage=live]_&]:hidden"
      />

      <div className={`layer h-full ${ready ? '' : 'invisible'}`}>
        <p className="hero-plate label absolute left-[var(--gutter)] top-[calc(var(--nav-h)+1.25rem)] text-light-dim">{hero.plate}</p>
        <p className="hero-plate label absolute right-[var(--gutter)] top-[calc(var(--nav-h)+1.25rem)] hidden text-right text-light-dim md:block">
          Fig. 1 — the light, live
        </p>

        <button
          type="button"
          onClick={() => scrollToId('intro')}
          data-cursor="Scroll"
          aria-label="Scroll to the intro"
          className="hero-ring absolute right-[var(--gutter)] top-[calc(var(--nav-h)+3.5rem)] hidden text-light md:block"
        >
          <RingText text="Scroll — bring it into focus — scroll — " size={112}>
            <span className="text-flare">
              <Arrow dir="down" />
            </span>
          </RingText>
        </button>

        {/* everything below is anchored on the light at the centre of the screen */}
        <div className="absolute left-1/2 top-1/2" aria-hidden="true">
          <div className="finder absolute -left-9 -top-9 h-18 w-18 rounded-full border border-light/25">
            {[0, 90, 180, 270].map((r) => (
              <i key={r} className="absolute left-1/2 top-1/2 h-px w-2 origin-left bg-light/60" style={{ transform: `rotate(${r}deg) translateX(36px)` }} />
            ))}
          </div>
        </div>
        <div className="hero-notes absolute left-1/2 top-1/2">
          {hero.notes.map((n, i) => {
            const s = NOTES[i]
            return (
              <div
                key={n.tag}
                data-side={s.side}
                className={`absolute left-0 top-0 [--a:var(--a-m)] [--l:var(--l-m)] md:[--a:var(--a-d)] md:[--l:var(--l-d)] ${s.mobile ? '' : 'hidden md:block'}`}
                style={{ '--a-d': `${s.a}deg`, '--l-d': s.l, '--a-m': `${s.am ?? s.a}deg`, '--l-m': s.lm ?? s.l }}
              >
                <span
                  aria-hidden="true"
                  className="note-line absolute left-0 top-0 block h-px origin-left bg-light/45"
                  style={{ width: 'calc(var(--l) - 40px)', rotate: 'var(--a)', translate: 'calc(cos(var(--a)) * 40px) calc(sin(var(--a)) * 40px)' }}
                />
                <span
                  className="absolute left-0 top-0 block"
                  style={{ translate: 'calc(cos(var(--a)) * var(--l)) calc(sin(var(--a)) * var(--l))' }}
                >
                  <span aria-hidden="true" className="note-dot absolute -left-[3.5px] -top-[3.5px] block h-[7px] w-[7px] rounded-full border border-light/80" />
                  <span
                    className={`note-text absolute top-0 flex w-[44vw] -translate-y-1/2 items-start gap-2 md:w-max ${
                      s.side === 'left' ? 'max-md:left-3 md:right-3 md:flex-row-reverse md:text-right' : 'left-3'
                    }`}
                  >
                    <sup className="label text-flare">{n.tag}</sup>
                    <span className="annotation text-light">
                      {n.text[0]}
                      <br />
                      {n.text[1]}
                    </span>
                  </span>
                </span>
              </div>
            )
          })}
        </div>

        <div className="shell absolute inset-x-0 bottom-0 pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-[calc(2.75rem+env(safe-area-inset-bottom))]">
          <div className="relative">
            {/* the headline is only the headline; the lede sits beside its first line, outside the h1 */}
            <h1 className="hero-title" data-skew>
              <span className="sr-only">{meta.name}, creative developer — </span>
              <span className="line l1 gpu-blur display lit block text-[clamp(3.6rem,12.4vw,12.5rem)]">{hero.lines[0]}</span>{' '}
              <span className="line l2 gpu-blur serif lit block text-right text-[clamp(3.6rem,12.4vw,12.5rem)] italic leading-[0.84] tracking-[-0.03em]">
                {hero.lines[1]}
              </span>
            </h1>
            <p className="hero-lede meta absolute right-0 top-[calc(clamp(3.6rem,12.4vw,12.5rem)*0.84)] hidden max-w-[34ch] -translate-y-full pb-[2em] text-light-dim md:block">
              {hero.lede}
            </p>
          </div>

          <div className="relative mt-6 md:mt-8">
            <span className="hero-meta-rule absolute inset-x-0 top-0 h-px bg-[var(--color-line-d)]" />
            <div className="hero-meta grid grid-cols-2 gap-y-3 pt-3 md:grid-cols-4">
              {hero.meta.map(([k, v]) => (
                <p key={k} className="label">
                  <span className="text-light-dim">{k} — </span>
                  {v}
                </p>
              ))}
              <button
                type="button"
                onClick={() => scrollToId('work')}
                className="label group hidden min-h-11 items-center justify-end gap-2 md:flex"
                data-cursor="Work"
              >
                See the work
                <Arrow dir="down" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
