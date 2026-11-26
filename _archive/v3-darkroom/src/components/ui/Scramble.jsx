import { useEffect, useRef } from 'react'
import { useFinePointer, useReducedMotion } from '../../lib/hooks'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/—'

/* A label that re-develops on hover: its letters run through random
   glyphs and settle left to right, like a split-flap board finding its
   word. The real text holds the layout (invisible copy underneath), so
   nothing shifts, and the parent keeps the accessible name. */
export default function Scramble({ text, className = '' }) {
  const wrap = useRef(null)
  const out = useRef(null)
  const raf = useRef(0)
  const fine = useFinePointer()
  const reduced = useReducedMotion()

  // listen on the link or button that owns the label, so its whole hit
  // area (padding included) and keyboard focus both trigger it
  useEffect(() => {
    const host = wrap.current?.closest('a, button') ?? wrap.current
    if (!host || !fine || reduced) return
    host.addEventListener('pointerenter', run)
    host.addEventListener('focus', run)
    return () => {
      host.removeEventListener('pointerenter', run)
      host.removeEventListener('focus', run)
      cancelAnimationFrame(raf.current)
    }
    // run only reads refs and the text, which is fixed per label
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fine, reduced])

  function run() {
    if (!out.current) return
    cancelAnimationFrame(raf.current)
    const start = performance.now()
    const len = text.length
    const total = 220 + len * 28
    const tick = (now) => {
      const t = now - start
      const settled = Math.floor((t / total) * (len + 2))
      let s = ''
      for (let i = 0; i < len; i++) {
        const ch = text[i]
        s += ch === ' ' || i < settled ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }
      out.current.textContent = s
      if (t < total) raf.current = requestAnimationFrame(tick)
      else out.current.textContent = text
    }
    raf.current = requestAnimationFrame(tick)
  }

  return (
    <span ref={wrap} className={`relative inline-block ${className}`} aria-hidden="true">
      <span className="invisible">{text}</span>
      <span ref={out} className="absolute inset-0 whitespace-nowrap">
        {text}
      </span>
    </span>
  )
}
