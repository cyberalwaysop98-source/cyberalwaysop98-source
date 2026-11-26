import { useEffect, useState } from 'react'
import Lenis from 'lenis'

/* ── media queries ─────────────────────────────────────────── */

function useMedia(query, initial = false) {
  const [match, setMatch] = useState(() =>
    typeof window === 'undefined' ? initial : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')
/* Fine pointer + hover = desktop. Drives magnetics and hover-only art. */
export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)')
export const useIsMobile = () => useMedia('(max-width: 767px)')
export const useIsDesktop = () => useMedia('(min-width: 1024px)')

/* ── smooth scroll ─────────────────────────────────────────── */

let lenis = null

/* Wheel/trackpad smoothing only. Touch stays native — hijacking it is
   how portfolios get unusable on phones. */
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    // Lenis drives its own rAF; Motion's useScroll reads native scroll, so
    // nothing else needs to be told when the page moves
    lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 1, syncTouch: false, autoRaf: true })

    return () => {
      lenis?.destroy()
      lenis = null
    }
  }, [enabled])
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  // Callers often scroll in the same click that releases a scroll lock (the
  // mobile menu). The unlock lands in React's commit, and lenis.start() resets
  // any scroll already in flight — so scroll one task later, after the commit.
  setTimeout(() => {
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4, force: true })
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

export const lockScroll = (locked) => {
  if (lenis) locked ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

// Read access to the live instance — e.g. Lab's Scroll Velocity study reads
// lenis.velocity/.direction directly, which is the actual per-frame scroll
// delta and carries none of the lag a derived (scrollY → velocity) value would.
export const getLenis = () => lenis

/* ── active section tracking ──────────────────────────────────
   Shared by Nav, FilmRail, the Work projector (on touch) and Experience, so all
   agree on "where you are" from one observer instead of two. */

export function useActiveSection(ids) {
  const [active, setActive] = useState('')
  const key = ids.join(',')

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (seen) setActive(seen.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.6] },
    )
    key.split(',').forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return active
}

/* ── live clock ────────────────────────────────────────────── */

const formatClock = (timeZone) =>
  new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(
    new Date(),
  )

/* A fixed-timezone readout, not the visitor's local time — this is the
   base of operations speaking, the way a studio site names its city.
   15s granularity: a nav detail earns its keep on presence, not on
   ticking seconds nobody is here to watch. */
export function useClock(timeZone = 'Asia/Kolkata') {
  const [time, setTime] = useState(() => formatClock(timeZone))
  useEffect(() => {
    const id = setInterval(() => setTime(formatClock(timeZone)), 15000)
    return () => clearInterval(id)
  }, [timeZone])
  return time
}

