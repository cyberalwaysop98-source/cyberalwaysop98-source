import { useEffect } from 'react'
import { gsap, ScrollTrigger } from './motion'
import { getLenis } from './hooks'

const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/* ── velocity skew ───────────────────────────────────────────────
   Display headings marked data-skew lean with the scroll's speed and
   settle when it stops. One ticker for the page; only headings on
   screen are touched. */
export function useVelocitySkew(enabled) {
  useEffect(() => {
    if (!enabled || reducedMotion()) return
    const visible = new Set()
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)))
    })
    const watch = () => document.querySelectorAll('[data-skew]').forEach((el) => io.observe(el))
    watch()
    ScrollTrigger.addEventListener('refresh', watch)
    let skew = 0
    const tick = (time, dt) => {
      const v = getLenis()?.velocity || 0
      const target = gsap.utils.clamp(-2.6, 2.6, v * -0.1)
      skew += (target - skew) * (1 - Math.pow(0.88, dt / (1000 / 60)))
      if (Math.abs(skew) < 0.005 && Math.abs(target) < 0.005) {
        if (skew !== 0) {
          skew = 0
          visible.forEach((el) => gsap.set(el, { skewY: 0 }))
        }
        return
      }
      visible.forEach((el) => gsap.set(el, { skewY: skew, force3D: true }))
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      ScrollTrigger.removeEventListener('refresh', watch)
      io.disconnect()
    }
  }, [enabled])
}

/* ── proximity ───────────────────────────────────────────────────
   Letters near the cursor react: 'lift' raises them (any face),
   'weight' thickens them on a variable axis (Geist, 300 → 600).
   Positions are measured in page space once per refresh, so moving
   the cursor never reads layout. */
export function proximity(chars, { mode = 'lift', radius = 200, amount = 26, root } = {}) {
  if (!chars?.length || !finePointer() || reducedMotion()) return () => {}
  const set = chars.map((c) =>
    mode === 'weight'
      ? gsap.quickTo(c, 'fontWeight', { duration: 0.55, ease: 'power3' })
      : gsap.quickTo(c, 'y', { duration: 0.7, ease: 'power3' }),
  )
  let pts = []
  const measure = () => {
    const y = window.scrollY
    pts = chars.map((c) => {
      const r = c.getBoundingClientRect()
      return [r.left + r.width / 2, r.top + r.height / 2 + y]
    })
  }
  measure()
  let mx = -1e5
  let my = -1e5
  let on = true
  let queued = false
  let last = []
  const io = new IntersectionObserver(([e]) => (on = e.isIntersecting))
  io.observe(root || chars[0].parentElement)
  // only when the pointer actually moves, at most once a frame, and only
  // for letters whose target changed — an idle cursor costs nothing
  const update = () => {
    queued = false
    if (!on) return
    for (let i = 0; i < pts.length; i++) {
      const d = Math.hypot(pts[i][0] - mx, pts[i][1] - my)
      let f = Math.max(0, 1 - d / radius)
      f = f * f * (3 - 2 * f)
      const v = mode === 'weight' ? Math.round(300 + 300 * f) : Math.round(-f * amount * 2) / 2
      if (v !== last[i]) {
        last[i] = v
        set[i](v)
      }
    }
  }
  const move = (e) => {
    mx = e.clientX
    my = e.clientY + window.scrollY
    if (!queued) {
      queued = true
      requestAnimationFrame(update)
    }
  }
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('resize', measure)
  ScrollTrigger.addEventListener('refresh', measure)
  return () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('resize', measure)
    ScrollTrigger.removeEventListener('refresh', measure)
    io.disconnect()
  }
}
