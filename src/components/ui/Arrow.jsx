import { useEffect, useRef } from 'react'
import { flyArrow } from '../../lib/micro'

/* A drawn arrow that leaves the way it points when its link is hovered,
   while a fresh one springs in behind it. Replaces the → ↗ ↓ glyphs. */
const DIRS = {
  right: { rot: 0 },
  'up-right': { rot: -45 },
  down: { rot: 90 },
  up: { rot: -90 },
  left: { rot: 180 },
}

function Glyph({ hidden }) {
  return (
    <g className="ar-g" style={hidden ? { opacity: 0 } : undefined}>
      <line x1="2" y1="8" x2="13.2" y2="8" />
      <polyline points="8.6,3.4 13.4,8 8.6,12.6" />
    </g>
  )
}

export default function Arrow({ dir = 'right', className = '' }) {
  const ref = useRef(null)
  const d = DIRS[dir] || DIRS.right

  useEffect(() => {
    const host = ref.current?.closest('a, button')
    if (!host) return
    const go = () => flyArrow(ref.current)
    host.addEventListener('pointerenter', go)
    host.addEventListener('focus', go)
    return () => {
      host.removeEventListener('pointerenter', go)
      host.removeEventListener('focus', go)
    }
  }, [])

  // the glyph is drawn pointing right and the svg is rotated, so forward is always +x
  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-dx="1"
      data-dy="0"
      className={`relative inline-block h-[0.85em] w-[0.85em] shrink-0 overflow-hidden align-[-0.05em] ${className}`}
    >
      <svg viewBox="0 0 16 16" className="absolute inset-0 h-full w-full overflow-visible" style={{ rotate: `${d.rot}deg` }}>
        <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <Glyph />
          <Glyph hidden />
        </g>
      </svg>
    </span>
  )
}
