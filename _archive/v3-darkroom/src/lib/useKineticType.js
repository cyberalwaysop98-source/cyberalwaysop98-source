import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring } from 'motion/react'
import { spring } from './motion'
import { useFinePointer, useReducedMotion } from './hooks'

/* Pointer-proximity kinetic type for the hero headline: letters part gently
   away from the cursor, nearest letters moving most, on a smoothstep falloff.
   One rAF loop reads cached glyph centers plus the latest pointer position
   and writes transform/text-shadow straight onto each span via refs — no
   React state and no re-render on pointer move.

   Call once per headline. Attach `rootRef` to the element pointer events are
   measured against (the whole two-line block, so the field is continuous
   across both lines) and spread `register` onto each character span's ref.

   Desktop only (fine pointer, motion not reduced) — the whole effect,
   listeners included, never starts on touch devices. The interactive radius
   is a fraction of the headline's own rendered width, so it scales down with
   the fluid clamp() type size rather than needing a separate tablet tier. */
export function useKineticType() {
  const rootRef = useRef(null)
  const chars = useRef(new Map()) // DOM node -> eased state, see `register`
  const pointer = useRef(null)
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const active = fine && !reduced

  const labelX = useMotionValue(0)
  const labelY = useMotionValue(0)
  const labelOpacity = useMotionValue(0)
  const sx = useSpring(labelX, spring.soft)
  const sy = useSpring(labelY, spring.soft)
  const sOpacity = useSpring(labelOpacity, spring.soft)

  // A stable function identity across every render of the consuming
  // component, held in a ref rather than returned fresh each call. React
  // only invokes a ref callback when its identity changes or the node
  // mounts/unmounts — an inline `(el) => ...` here would get a new identity
  // every render, so React would detach and reattach all 17 glyphs on any
  // unrelated re-render (e.g. from the label's own visibility), discarding
  // their cached centers and permanently zeroing every distance check.
  // Keying by the element itself means it's also safe to call redundantly.
  const register = useRef((el) => {
    if (el && !chars.current.has(el)) {
      chars.current.set(el, { el, cx: 0, cy: 0, x: 0, y: 0, s: 1, r: 0, g: 0 })
    }
  }).current

  useEffect(() => {
    if (!active || !rootRef.current) return
    const root = rootRef.current
    let raf = 0
    let labelTimer = 0

    const measure = () => {
      for (const c of chars.current.values()) {
        const b = c.el.getBoundingClientRect()
        c.cx = b.left + b.width / 2
        c.cy = b.top + b.height / 2
      }
    }

    const loop = () => {
      const p = pointer.current
      const radius = Math.max(150, root.getBoundingClientRect().width * 0.14)
      for (const c of chars.current.values()) {
        let tx = 0, ty = 0, ts = 1, tr = 0, tg = 0
        if (p) {
          const dx = c.cx - p.x
          const dy = c.cy - p.y
          const dist = Math.hypot(dx, dy)
          if (dist < radius) {
            const t = 1 - dist / radius
            const influence = t * t * (3 - 2 * t) // smoothstep — soft-edged, not linear
            const nx = dist > 0.5 ? dx / dist : 0
            const ny = dist > 0.5 ? dy / dist : 0
            tx = nx * influence * 9 // parts away from the cursor
            ty = ny * influence * 5 - influence * 3 // a slight lift on top of the parting
            ts = 1 + influence * 0.055
            tr = nx * influence * 2.5
            tg = influence
          }
        }
        // ease toward the target each frame rather than snapping to it
        c.x += (tx - c.x) * 0.16
        c.y += (ty - c.y) * 0.16
        c.s += (ts - c.s) * 0.16
        c.r += (tr - c.r) * 0.16
        c.g += (tg - c.g) * 0.16
        c.el.style.transform = `translate(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px) scale(${c.s.toFixed(3)}) rotate(${c.r.toFixed(2)}deg)`
        // the "ghost": a hairline ember duplicate offset by the same parting motion
        c.el.style.textShadow =
          c.g > 0.01 ? `${(c.x * 0.4).toFixed(1)}px ${(c.y * 0.4 - 1.5).toFixed(1)}px 0 rgba(255,74,28,${(c.g * 0.5).toFixed(2)})` : ''
      }
      raf = requestAnimationFrame(loop)
    }

    const onEnter = (e) => {
      measure()
      pointer.current = { x: e.clientX, y: e.clientY }
      labelOpacity.set(1)
      clearTimeout(labelTimer)
      labelTimer = setTimeout(() => labelOpacity.set(0), 1100) // transient, not a persistent badge
    }
    const onMove = (e) => {
      pointer.current = { x: e.clientX, y: e.clientY }
      labelX.set(e.clientX)
      labelY.set(e.clientY)
    }
    const onLeave = () => {
      pointer.current = null // letters ease back to rest on the next loop tick
    }

    const ro = new ResizeObserver(measure)
    ro.observe(root)
    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(labelTimer)
      ro.disconnect()
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      for (const c of chars.current.values()) {
        c.el.style.transform = ''
        c.el.style.textShadow = ''
      }
    }
  }, [active])

  return { rootRef, register, active, labelOpacity: sOpacity, labelX: sx, labelY: sy }
}
