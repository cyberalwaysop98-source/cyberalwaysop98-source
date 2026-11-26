import { useRef } from 'react'
import { m, useMotionValue, useSpring } from 'motion/react'
import { spring } from '../../lib/motion'
import { useFinePointer, useReducedMotion } from '../../lib/hooks'

/* Pulls its child toward the pointer. Desktop only — on touch it is
   an ordinary element with no listeners attached. */
export default function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, spring.soft)
  const sy = useSpring(y, spring.soft)
  const fine = useFinePointer()
  const reduced = useReducedMotion()

  if (!fine || reduced) return <div className={className}>{children}</div>

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <m.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </m.div>
  )
}
