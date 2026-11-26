import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/motion'

/* A dot that follows, and a ring with crosshair ticks that opens over
   anything interactive. data-cursor="Label" puts a word in the ring.
   Difference blending keeps it legible on void and on bone alike.
   Fine pointers only — touch keeps the native behaviour. */
export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const label = useRef(null)

  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const dx = gsap.quickTo(dot.current, 'x', { duration: reduced ? 0 : 0.12, ease: 'power3' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: reduced ? 0 : 0.12, ease: 'power3' })
    const rx = gsap.quickTo(ring.current, 'x', { duration: reduced ? 0 : 0.5, ease: 'power3' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: reduced ? 0 : 0.5, ease: 'power3' })
    let shown = false
    let current = null

    const move = (e) => {
      if (e.pointerType === 'touch') return
      if (!shown) {
        shown = true
        gsap.to([dot.current], { opacity: 1, duration: 0.3 })
      }
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
    }
    const over = (e) => {
      const t = e.target.closest?.('a, button, [data-cursor], input, textarea, [role="button"]')
      if (t === current) return
      current = t
      if (t) {
        const text = t.dataset.cursor || ''
        label.current.textContent = text === 'none' ? '' : text
        gsap.to(ring.current, { scale: text ? 1 : 0.62, opacity: 1, duration: 0.5, ease: 'expo.out' })
        gsap.to(dot.current, { scale: 0.4, duration: 0.3 })
      } else {
        gsap.to(ring.current, { scale: 0.2, opacity: 0, duration: 0.45, ease: 'power3.out' })
        gsap.to(dot.current, { scale: 1, duration: 0.3 })
      }
    }
    const down = () => gsap.to([dot.current, ring.current], { scale: '-=0.12', duration: 0.15, yoyo: true, repeat: 1 })
    const leave = () => {
      shown = false
      gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3 })
    }
    const reset = () => {
      current = null
      label.current.textContent = ''
      gsap.to(ring.current, { scale: 0.2, opacity: 0, duration: 0.45, ease: 'power3.out' })
      gsap.to(dot.current, { scale: 1, duration: 0.3 })
    }
    window.addEventListener('cursor:reset', reset)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over, { passive: true })
    document.addEventListener('pointerdown', down, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('cursor:reset', reset)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerdown', down)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[95] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
      {/* each mark blends on its own — a full-screen blend layer re-reads the whole frame every frame */}
      <div ref={dot} className="gpu fixed left-0 top-0 -ml-[3px] -mt-[3px] h-[6px] w-[6px] rounded-full bg-white opacity-0 mix-blend-difference" />
      <div
        ref={ring}
        className="gpu fixed left-0 top-0 -ml-11 -mt-11 flex h-22 w-22 scale-[0.2] items-center justify-center rounded-full border border-white opacity-0 mix-blend-difference"
      >
        {/* crosshair ticks, like a lens finder */}
        <i className="absolute -top-[5px] left-1/2 h-[9px] w-px bg-white" />
        <i className="absolute -bottom-[5px] left-1/2 h-[9px] w-px bg-white" />
        <i className="absolute -left-[5px] top-1/2 h-px w-[9px] bg-white" />
        <i className="absolute -right-[5px] top-1/2 h-px w-[9px] bg-white" />
        <span ref={label} className="label text-center leading-tight text-white" />
      </div>
    </div>
  )
}
