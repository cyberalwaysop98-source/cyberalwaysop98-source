import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './motion'

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
/* Fine pointer + hover = desktop. Drives the cursor, magnetics and hover-only art. */
export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)')
export const useIsMobile = () => useMedia('(max-width: 767px)')

/* ── smooth scroll ─────────────────────────────────────────────
   Lenis smooths wheel/trackpad only — touch stays native. It runs on
   GSAP's ticker, first in line, so ScrollTrigger and the WebGL stage
   read the same scroll position in the same frame. */

let lenis = null

export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, syncTouch: false, autoRaf: false })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t) => lenis?.raf(t * 1000)
    gsap.ticker.add(raf, false, true)
    return () => {
      gsap.ticker.remove(raf)
      lenis?.destroy()
      lenis = null
    }
  }, [enabled])
}

export const getLenis = () => lenis

export function scrollToId(id, { immediate = false } = {}) {
  const el = id === 'top' ? 0 : document.getElementById(id)
  if (el === null) return
  // a menu closing in the same click releases a scroll lock in React's commit;
  // scroll one task later so lenis.start() can't cancel it
  setTimeout(() => {
    if (lenis) lenis.scrollTo(el, { duration: immediate ? 0 : 1.8, immediate, force: true })
    else if (el === 0) window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' })
    else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth', block: 'start' })
  })
}

export const lockScroll = (locked) => {
  if (lenis) locked ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

/* ── active chapter ───────────────────────────────────────────
   One observer for "where you are" — the nav's chapter readout and
   the menu agree because they read the same thing. */

export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  const key = ids.join(',')

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (seen) setActive(seen.target.id)
      },
      { rootMargin: '-48% 0px -48% 0px', threshold: 0 },
    )
    key.split(',').forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [key])

  return active
}

/* ── live clock ────────────────────────────────────────────────
   The base of operations speaking, not the visitor's local time. */

const formatClock = (timeZone) =>
  new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())

export function useClock(timeZone = 'Asia/Kolkata') {
  const [time, setTime] = useState(() => formatClock(timeZone))
  useEffect(() => {
    const id = setInterval(() => setTime(formatClock(timeZone)), 10000)
    return () => clearInterval(id)
  }, [timeZone])
  return time
}
