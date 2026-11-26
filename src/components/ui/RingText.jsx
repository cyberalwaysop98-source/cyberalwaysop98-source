import { useEffect, useId, useRef } from 'react'
import { gsap } from '../../lib/motion'
import { getLenis } from '../../lib/hooks'

/* A caption set on a circle, turning slowly — faster while you scroll. */
export default function RingText({ text, size = 116, children, className = '' }) {
  const ring = useRef(null)
  const id = useId().replace(/:/g, '')

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let a = 0
    let on = false
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting))
    io.observe(ring.current)
    const tick = (t, dt) => {
      if (!on) return
      a += (0.12 + Math.abs(getLenis()?.velocity || 0) * 0.05) * (dt / 16.7)
      gsap.set(ring.current, { rotation: a % 360, force3D: true })
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      io.disconnect()
    }
  }, [])

  return (
    <span className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* rotate an HTML wrapper (composited), not the svg (GSAP would write an svg transform attribute and repaint) */}
      <span ref={ring} className="gpu absolute inset-0">
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <path id={id} d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
        </defs>
        {/* sized in SVG units so it renders at exactly the 11px label step */}
        <text className="label" style={{ fontSize: `${(11 * 120) / size}px`, letterSpacing: '0.12em', fill: 'currentColor' }}>
          <textPath href={`#${id}`} textLength="292" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      </span>
      <span className="relative">{children}</span>
    </span>
  )
}
