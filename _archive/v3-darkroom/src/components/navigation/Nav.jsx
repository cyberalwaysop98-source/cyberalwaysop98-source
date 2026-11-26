import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'motion/react'
import { ease, dur, stagger } from '../../lib/motion'
import { scrollToId, lockScroll, useClock, useActiveSection } from '../../lib/hooks'
import { meta, nav } from '../../content'
import Magnetic from '../ui/Magnetic'
import { kbdHint } from '../ui/CommandPalette'
import Scramble from '../ui/Scramble'

const openPalette = () => window.dispatchEvent(new Event('command-palette:open'))

export default function Nav() {
  const { scrollY } = useScroll()
  const clock = useClock()
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const last = useRef(0)
  const active = useActiveSection(nav.map((n) => n.id))

  useMotionValueEvent(scrollY, 'change', (y) => {
    setSolid(y > 40)
    // only hide once past the hero, and never while the menu is open
    setHidden(!open && y > 600 && y > last.current + 4)
    last.current = y
  })

  useEffect(() => {
    lockScroll(open)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  const go = (e, id) => {
    e.preventDefault()
    setOpen(false)
    scrollToId(id)
  }

  return (
    <>
      <m.header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          solid && !open ? 'border-b border-line/70 bg-ink/72 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
        animate={{ y: hidden ? '-105%' : '0%' }}
        transition={{ duration: dur.ui, ease: ease.out }}
      >
        <div className="shell flex h-[68px] items-center justify-between gap-6">
          <a
            href="#top"
            onClick={(e) => go(e, 'top')}
            className="wordmark text-paper"
          >
            {meta.name}
            <span className="ml-2 hidden text-paper-faint sm:inline">— {meta.role}</span>
          </a>

          <nav aria-label="Sections" className="hidden items-center gap-1 xl:flex">
            {nav.map(({ label, id }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => go(e, id)}
                aria-label={label}
                aria-current={active === id ? 'location' : undefined}
                className="control group relative px-3 py-2 transition-colors duration-300 hover:text-paper"
                style={{ color: active === id ? 'var(--color-paper)' : 'var(--color-paper-dim)' }}
              >
                <Scramble text={label} />
                {/* transform + a targeted transition, not width + transition-all */}
                <span
                  className="absolute bottom-1 left-3 h-px w-[calc(100%-1.5rem)] origin-left bg-ember transition-transform duration-500"
                  style={{ transform: active === id ? 'scaleX(1)' : 'scaleX(0)' }}
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <span className="index hidden items-baseline gap-1.5 text-paper-faint min-[1440px]:flex">
              <span aria-hidden="true">IST</span>
              <span className="tabular-nums">{clock}</span>
            </span>

            <span className="hidden items-center gap-2 2xl:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
              </span>
              <span className="eyebrow whitespace-nowrap">{meta.available}</span>
            </span>

            <Magnetic strength={0.25} className="hidden md:block">
              <button
                type="button"
                onClick={openPalette}
                className="control flex items-center gap-2 rounded-full border hairline px-4 py-2 tracking-[0.16em] text-paper-dim transition-colors duration-500 hover:border-ember hover:text-ember"
              >
                Search
                <span className="index text-paper-faint">{kbdHint}</span>
              </button>
            </Magnetic>

            {meta.resume && (
              <Magnetic strength={0.25} className="hidden md:block">
                <a
                  href={meta.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="control rounded-full border hairline px-4 py-2 tracking-[0.16em] text-paper-dim transition-colors duration-500 hover:border-ember hover:text-ember"
                >
                  Resume
                </a>
              </Magnetic>
            )}

            <Magnetic strength={0.25}>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-label={open ? 'Close menu' : 'Open menu'}
                className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[5px] xl:hidden"
              >
                <m.span
                  className="block h-px w-6 bg-paper"
                  animate={{ rotate: open ? 45 : 0, y: open ? 3 : 0 }}
                  transition={{ duration: dur.micro }}
                />
                <m.span
                  className="block h-px w-6 bg-paper"
                  animate={{ rotate: open ? -45 : 0, y: open ? -3 : 0 }}
                  transition={{ duration: dur.micro }}
                />
              </button>
            </Magnetic>
          </div>
        </div>
      </m.header>

      {/* mobile: full-screen scene, not a dropdown */}
      <AnimatePresence>
        {open && (
          <m.div
            className="fixed inset-0 z-40 flex flex-col justify-end bg-ink xl:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: dur.ui * 1.6, ease: ease.inOut }}
          >
            <nav className="shell flex flex-col gap-1 pb-16">
              {nav.map(({ label, id }, i) => (
                <m.a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => go(e, id)}
                  className="display flex items-baseline gap-4 border-b border-line py-4 text-[min(13vw,6.5rem)] text-paper"
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12, transition: { duration: 0.18 } }}
                  transition={{ delay: 0.18 + i * stagger.item, duration: dur.section, ease: ease.out }}
                >
                  <span className="index text-ember">0{i + 1}</span>
                  {label}
                </m.a>
              ))}
              <m.div
                className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    openPalette()
                  }}
                  className="eyebrow text-paper transition-colors hover:text-ember"
                >
                  Search {kbdHint}
                </button>
                <a href={`mailto:${meta.email}`} className="eyebrow text-paper">
                  {meta.email}
                </a>
                {meta.resume && (
                  <a
                    href={meta.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="eyebrow text-paper-dim transition-colors hover:text-ember"
                  >
                    Resume ↗
                  </a>
                )}
              </m.div>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
