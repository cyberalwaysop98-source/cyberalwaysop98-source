import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, GLYPHS } from '../../lib/motion'
import { useActiveSection, useClock, scrollToId, lockScroll } from '../../lib/hooks'
import { setSound, onSound, soundOn, press, menu } from '../../lib/sound'
import { equalizer, menuIcon, menuIconHover } from '../../lib/micro'
import { meta, nav, social } from '../../content'
import Magnetic from '../ui/Magnetic'
import Roll from '../ui/Roll'
import Arrow from '../ui/Arrow'
import RayMark from '../ui/RayMark'

/* The chrome's words sit on a layer blended by difference, so they read
   on void, on bone, over the flood and over a dark tile without having
   to know which is under them. The two pills keep their own glass. */
const BLEND = 'text-white mix-blend-difference'

function ChapterReadout() {
  const active = useActiveSection(nav.map((n) => n.id))
  const ref = useRef(null)
  const item = nav.find((n) => n.id === active) || nav[0]
  useEffect(() => {
    if (!ref.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.to(ref.current, { duration: 0.8, scrambleText: { text: `${item.n} — ${item.label}`, chars: GLYPHS, speed: 0.6 }, ease: 'none' })
  }, [item])
  return (
    <span ref={ref} className="label tnum" aria-live="off">
      {item.n} — {item.label}
    </span>
  )
}

/* four bars that dance on organic, never-in-step heights while sound is on */
function SoundToggle() {
  const [on, setOn] = useState(soundOn())
  const bars = useRef([])
  useEffect(() => onSound(setOn), [])
  useEffect(() => {
    const eq = on ? equalizer(bars.current) : null
    if (!on) bars.current.forEach((b) => b && (b.style.transform = 'scaleY(0.18)'))
    return () => eq?.stop()
  }, [on])
  return (
    <button
      type="button"
      onClick={(e) => {
        setSound(!on)
        if (!on) press(e.clientX)
      }}
      aria-pressed={on}
      data-cursor={on ? 'Mute' : 'Sound'}
      className="label pointer-events-auto inline-flex min-h-11 items-center gap-3"
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <i key={i} ref={(el) => (bars.current[i] = el)} className="block h-full w-[2px] origin-bottom bg-current" style={{ transform: 'scaleY(0.18)' }} />
        ))}
      </span>
      <Roll>{`Sound ${on ? 'on' : 'off'}`}</Roll>
    </button>
  )
}

function Menu({ open, onClose, origin, toggle }) {
  const root = useRef(null)
  const time = useClock()

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
      if (open) {
        gsap.set(el, { visibility: 'visible' })
        gsap.fromTo(
          el,
          { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` },
          { clipPath: `circle(${Math.hypot(innerWidth, innerHeight)}px at ${origin.x}px ${origin.y}px)`, duration: reduced ? 0 : 1.1, ease: 'power4.inOut' },
        )
        gsap.fromTo('.menu-item', { yPercent: 110 }, { yPercent: 0, duration: reduced ? 0 : 1.2, stagger: 0.05, delay: reduced ? 0 : 0.35, ease: 'expo.out' })
        gsap.fromTo('.menu-side', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: reduced ? 0 : 1, delay: reduced ? 0 : 0.6, stagger: 0.08 })
        gsap.delayedCall(0.4, () => el.querySelector('a, button')?.focus({ preventScroll: true }))
      } else if (el.style.visibility === 'visible') {
        gsap.to(el, {
          clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
          duration: reduced ? 0 : 0.8,
          ease: 'power4.inOut',
          onComplete: () => gsap.set(el, { visibility: 'hidden' }),
        })
      }
    },
    { dependencies: [open], scope: root },
  )

  // while open: the page behind is inert, Tab cycles inside the menu and its toggle, Escape closes
  useEffect(() => {
    if (!open) return
    lockScroll(true)
    const behind = [document.querySelector('main'), document.querySelector('footer')].filter(Boolean)
    behind.forEach((el) => (el.inert = true))
    const key = (e) => {
      if (e.key === 'Escape') return onClose(true)
      if (e.key !== 'Tab') return
      // the toggle sits outside the dialog in the DOM, so walk the cycle by hand
      const f = [toggle.current, ...root.current.querySelectorAll('a[href], button:not([disabled])')].filter(Boolean)
      const i = f.indexOf(document.activeElement)
      e.preventDefault()
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus()
    }
    window.addEventListener('keydown', key)
    return () => {
      lockScroll(false)
      behind.forEach((el) => (el.inert = false))
      window.removeEventListener('keydown', key)
    }
  }, [open, onClose, toggle])

  const go = (id) => {
    onClose(false)
    scrollToId(id)
  }

  return (
    <div
      ref={root}
      id="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      style={{ visibility: 'hidden' }}
      className="fixed inset-0 z-[85] overflow-y-auto bg-void text-light"
      data-lenis-prevent
    >
      <div className="shell grid min-h-full grid-cols-1 gap-12 pb-12 pt-28 md:grid-cols-12">
        <nav aria-label="Chapters" className="md:col-span-8">
          <ol>
            {nav.map((n) => (
              <li key={n.id} className="overflow-hidden border-b rule-d">
                <a
                  href={`#${n.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    go(n.id)
                  }}
                  className="menu-item group flex items-baseline gap-5 py-2 md:py-1"
                >
                  <span className="label tnum w-8 text-light-dim">{n.n}</span>
                  <span className="serif lit text-[clamp(2.6rem,6.2vw,6rem)] leading-[1.02] transition-[color,transform] duration-500 group-hover:translate-x-3 group-hover:text-flare">
                    <Roll>{n.label}</Roll>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <aside className="flex flex-col justify-end gap-8 md:col-span-4">
          <div className="menu-side">
            <p className="label text-light-dim">Write</p>
            <a href={`mailto:${meta.email}`} className="link-draw meta mt-2 inline-block">
              <Roll>{meta.email}</Roll>
            </a>
          </div>
          <div className="menu-side">
            <p className="label text-light-dim">Elsewhere</p>
            {social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="link-draw meta mt-2 inline-flex items-center gap-1.5">
                <Roll>{s.label}</Roll> <Arrow dir="up-right" />
              </a>
            ))}
            <a href={meta.resume} target="_blank" rel="noreferrer" className="link-draw meta mt-2 flex w-fit items-center gap-1.5">
              <Roll>Résumé (PDF)</Roll> <Arrow dir="up-right" />
            </a>
          </div>
          <div className="menu-side label tnum text-light-dim">
            {meta.location} — <span className="text-light">{time}</span> IST
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function Chrome({ ready }) {
  const root = useRef(null)
  const bar = useRef(null)
  const menuBtn = useRef(null)
  const icon = useRef([])
  const [open, setOpen] = useState(false)
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
  const time = useClock()

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress }),
    })
    return () => st.kill()
  }, [])

  // the menu icon's two strokes cross into an × on a spring
  useEffect(() => menuIcon(icon.current, open), [open])

  useGSAP(
    () => {
      if (!ready) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.chrome-top > *, .chrome-pills > *', { yPercent: -140, opacity: 0, duration: 1.4, stagger: 0.08, delay: 0.5, ease: 'expo.out' })
        gsap.from('.chrome-bottom > *', { yPercent: 140, opacity: 0, duration: 1.4, stagger: 0.08, delay: 0.7, ease: 'expo.out' })
        gsap.from('.corner', { scale: 0, opacity: 0, duration: 1.2, stagger: 0.06, delay: 0.4, ease: 'expo.out' })
      })
    },
    { dependencies: [ready], scope: root },
  )

  const toggle = () => {
    const r = menuBtn.current.getBoundingClientRect()
    setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
    menu(!open)
    setOpen((o) => !o)
  }
  const close = useCallback((returnFocus) => {
    setOpen(false)
    if (returnFocus) menuBtn.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div ref={root} className={ready ? '' : 'invisible'}>
      {/* the frame: four brackets at the corners of the viewport */}
      <div aria-hidden="true">
        {['left-3 top-3 border-l border-t', 'right-3 top-3 border-r border-t', 'bottom-3 left-3 border-b border-l', 'bottom-3 right-3 border-b border-r'].map((c) => (
          <i key={c} className={`corner pointer-events-none fixed z-[40] h-3.5 w-3.5 border-current opacity-70 ${BLEND} ${c}`} />
        ))}
      </div>

      <header className={`chrome-top fixed inset-x-0 top-0 z-[90] flex h-[var(--nav-h)] items-center justify-between gap-4 pl-[var(--gutter)] pr-[calc(var(--gutter)+7rem)] lg:pr-[calc(var(--gutter)+19rem)] ${BLEND}`}>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            scrollToId('top')
          }}
          className="group relative flex min-h-11 items-center gap-2.5"
          aria-label={`${meta.name}, back to the top`}
        >
          <RayMark size={18} play={ready} delay={650} tone="mono" />
          <span className="flex flex-col justify-center">
            <span className="text-[0.875rem] font-medium tracking-[-0.01em]">{meta.name}</span>
            <span className="mt-1.5 block h-px w-28 overflow-hidden bg-current/25">
              <span ref={bar} className="block h-full w-full origin-left scale-x-0 bg-current" />
            </span>
          </span>
        </a>
        <span className="hidden md:block">
          <ChapterReadout />
        </span>
      </header>

      <div className="chrome-pills fixed right-[var(--gutter)] top-0 z-[91] flex h-[var(--nav-h)] items-center gap-2">
        {/* .pill sets its own display, so the breakpoint lives on a wrapper */}
        <span className="hidden lg:block">
          <span className="pill pill-glass">
            <span className="pulse" aria-hidden="true" />
            {meta.available}
          </span>
        </span>
        <Magnetic>
          <button
            ref={menuBtn}
            type="button"
            onClick={toggle}
            onPointerEnter={() => !open && menuIconHover(icon.current, true)}
            onPointerLeave={() => !open && menuIconHover(icon.current, false)}
            aria-expanded={open}
            aria-controls="menu"
            data-sound="menu"
            data-cursor="none"
            className={`pill ${open ? 'pill-light' : 'pill-glass'} relative`}
          >
            <span className="relative flex h-2.5 w-3.5 flex-col justify-between" aria-hidden="true">
              <i ref={(el) => (icon.current[0] = el)} className="block h-px w-full origin-center bg-current" />
              <i ref={(el) => (icon.current[1] = el)} className="block h-px w-full origin-center bg-current" />
            </span>
            <Roll key={open ? 'c' : 'm'}>{open ? 'Close' : 'Menu'}</Roll>
          </button>
        </Magnetic>
      </div>

      <div className={`chrome-bottom pointer-events-none fixed inset-x-0 bottom-0 z-[40] flex items-center justify-between px-[var(--gutter)] pb-2 ${BLEND}`}>
        <span className="label tnum hidden sm:inline">Panchkula — {time} IST</span>
        <SoundToggle />
      </div>

      <Menu open={open} onClose={close} origin={origin} toggle={menuBtn} />
    </div>
  )
}
