import { useEffect, useRef } from 'react'
import { drawMark, burstMark, loadingMark } from '../../lib/micro'

/* The brand mark: a point of light with eight rays and a ring — aṃśu,
   drawn. It draws itself in, turns very slowly, reaches out when its
   link is hovered, and doubles as the gate's loader. */
const RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 2
  const r0 = 6.2
  const r1 = i % 2 ? 10.4 : 12.6
  return { x1: 16 + Math.cos(a) * r0, y1: 16 + Math.sin(a) * r0, x2: 16 + Math.cos(a) * r1, y2: 16 + Math.sin(a) * r1 }
})

export default function RayMark({ size = 18, play = true, mode = 'mark', delay = 0, tone = 'flare', className = '' }) {
  const ref = useRef(null)

  // draw in, or run as a loader
  useEffect(() => {
    if (!play) return
    const anim = mode === 'loader' ? loadingMark(ref.current) : drawMark(ref.current, { delay })
    return () => anim?.revert?.()
  }, [play, mode, delay])

  // reach out when the link or button it sits in is hovered or focused
  useEffect(() => {
    if (mode !== 'mark') return
    const host = ref.current?.closest('a, button')
    if (!host) return
    const go = () => burstMark(ref.current)
    host.addEventListener('pointerenter', go)
    host.addEventListener('focus', go)
    return () => {
      host.removeEventListener('pointerenter', go)
      host.removeEventListener('focus', go)
    }
  }, [mode])

  return (
    <svg ref={ref} viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" className={`ray-mark shrink-0 overflow-visible ${className}`}>
      <g className="rm-turn" style={{ transformOrigin: '16px 16px' }}>
        {RAYS.map((r, i) => (
          <line
            key={i}
            className="rm-ray"
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke={tone === 'mono' ? 'currentColor' : 'var(--color-flare)'}
            strokeWidth="1.6"
            strokeLinecap="round"
            style={{ transformOrigin: `${r.x1}px ${r.y1}px` }}
          />
        ))}
      </g>
      <circle className="rm-ring" cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
      <circle className="rm-core" cx="16" cy="16" r="3.1" fill="currentColor" style={{ transformOrigin: '16px 16px' }} />
    </svg>
  )
}
