import { m } from 'motion/react'
import { ease, dur } from '../../lib/motion'
import { useActiveSection, scrollToId, useFinePointer, useReducedMotion } from '../../lib/hooks'
import { nav } from '../../content'

/* A roll of film along the edge of the frame, not a dot-nav borrowed from
   somewhere else. Each section is a frame: unexposed (hairline) until you
   reach it, developed (ember) once you pass it — the site's own "content
   develops" idea read as a filmstrip instead of a single plate. Desktop
   only; the mobile full-screen menu already owns wayfinding down there. */
export default function FilmRail() {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const active = useActiveSection(nav.map((n) => n.id))
  const activeIndex = nav.findIndex((n) => n.id === active)

  if (!fine) return null

  return (
    <div
      className="pointer-events-none fixed inset-y-0 right-4 z-40 hidden md:flex md:items-center xl:right-7"
      aria-hidden="true"
    >
      <div className="pointer-events-auto relative flex flex-col items-center">
        <span className="absolute top-1 bottom-1 left-1/2 w-px -translate-x-1/2 bg-line" />

        {nav.map(({ id, label }, i) => {
          const isActive = i === activeIndex
          const passed = activeIndex >= 0 && i <= activeIndex

          return (
            <button
              key={id}
              type="button"
              onClick={() => scrollToId(id)}
              aria-label={`Jump to ${label}`}
              className="group relative flex h-11 w-9 shrink-0 items-center justify-center"
            >
              <m.span
                className="relative z-10 rounded-full"
                animate={{
                  backgroundColor: passed ? 'var(--color-ember)' : 'var(--color-line)',
                  width: isActive ? 8 : 6,
                  height: isActive ? 8 : 6,
                }}
                transition={reduced ? { duration: 0 } : { duration: dur.ui, ease: ease.out }}
              />
              <span
                className="index pointer-events-none absolute right-full mr-3 whitespace-nowrap text-paper-faint opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
