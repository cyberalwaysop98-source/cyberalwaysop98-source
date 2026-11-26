import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../../lib/motion'
import { registerChapter } from '../../lib/stage'
import { revealIn } from '../../lib/reveal'
import { getLenis, useReducedMotion } from '../../lib/hooks'
import { experiments } from '../../content'
import SectionHead from '../ui/SectionHead'

const FLARE = '255, 90, 31'
const LIGHT = '242, 240, 235'
const VOID = '9, 9, 11'

/* A canvas loop that runs only while on screen, at the device's pixel
   ratio. Under reduced motion it paints one still frame. */
function useCanvasLoop(draw) {
  const ref = useRef(null)
  const pointer = useRef({ x: 0.5, y: 0.5 })
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    // 1.5x is indistinguishable for soft dots and gradients, and fills far fewer pixels
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let raf = 0
    let t = 0
    let last = performance.now()
    const size = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const frame = (now) => {
      t += Math.min(now - last, 50) / 1000
      last = now
      draw(ctx, canvas.clientWidth, canvas.clientHeight, t, pointer.current)
      raf = requestAnimationFrame(frame)
    }
    size()
    if (reduced) {
      draw(ctx, canvas.clientWidth, canvas.clientHeight, 1.2, pointer.current)
      return
    }
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf)
      if (e.isIntersecting) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    })
    io.observe(canvas)
    const ro = new ResizeObserver(size)
    ro.observe(canvas)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [draw, reduced])

  const onPointerMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    pointer.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
  }
  return { ref, onPointerMove }
}

/* 001 — Orbit Field */
const drawOrbit = (ctx, w, h, t, p) => {
  ctx.clearRect(0, 0, w, h)
  const cx = w * 0.5 + (p.x - 0.5) * w * 0.3
  const cy = h * 0.45 + (p.y - 0.5) * h * 0.3
  const R = Math.min(w, h) * 0.28
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 + t * 0.7
    const r = R + Math.sin(a * 3 + t * 1.4) * R * 0.4 + Math.cos(a * 2 - t * 0.7) * R * 0.25
    const z = Math.sin(a + t)
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.62, 1.2 + (z + 1) * 1.3, 0, Math.PI * 2)
    ctx.fillStyle = i % 5 ? `rgba(${LIGHT}, ${0.2 + (z + 1) * 0.3})` : `rgba(${FLARE}, ${0.35 + (z + 1) * 0.3})`
    ctx.fill()
  }
}
const OrbitField = () => <canvas {...useCanvasLoop(drawOrbit)} className="absolute inset-0 h-full w-full" />

/* 002 — Ember Drift: one hue, varied only in temperature and alpha */
const drawDrift = (ctx, w, h, t, p) => {
  ctx.fillStyle = `rgba(${VOID}, 0.2)`
  ctx.fillRect(0, 0, w, h)
  const g = ctx.createRadialGradient(w * p.x, h * p.y, 0, w * p.x, h * p.y, Math.max(w, h) * 0.7)
  g.addColorStop(0, `rgba(${FLARE}, ${0.16 + p.y * 0.12})`)
  g.addColorStop(0.5, 'rgba(60, 22, 8, 0.12)')
  g.addColorStop(1, `rgba(${VOID}, 0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 40; i++) {
    const x = (Math.sin(i * 7.3 + t * 0.6) * 0.5 + 0.5) * w
    const y = (Math.cos(i * 11.1 + t * 0.45) * 0.5 + 0.5) * h
    ctx.beginPath()
    ctx.arc(x, y, 0.8 + (Math.sin(i + t * 1.8) + 1) * 0.7, 0, Math.PI * 2)
    ctx.fillStyle = i % 3 ? `rgba(${FLARE}, 0.6)` : `rgba(${LIGHT}, 0.5)`
    ctx.fill()
  }
}
const Drift = () => <canvas {...useCanvasLoop(drawDrift)} className="absolute inset-0 h-full w-full" />

/* 003 — Scroll Velocity: reads Lenis's own per-frame scroll delta */
const vel = { v: 0, dir: 1 }
const drawVelocity = (ctx, w, h) => {
  const l = getLenis()
  const target = l ? Math.min(1, Math.abs(l.velocity) / 40) : 0
  if (l?.direction) vel.dir = l.direction
  vel.v += (target - vel.v) * 0.18
  ctx.clearRect(0, 0, w, h)
  const bars = [0.7, 0.45, 0.85, 0.3, 0.6, 0.5, 0.78]
  const gap = h / (bars.length + 1)
  bars.forEach((b, i) => {
    const len = Math.min(1, 0.12 + b * 0.14 + vel.v * (0.6 + b * 0.25)) * w * 0.78
    const y = gap * (i + 1)
    const x0 = vel.dir < 0 ? w * 0.89 - len : w * 0.11
    ctx.fillStyle = i % 2 ? `rgba(${LIGHT}, 0.55)` : `rgba(${FLARE}, 0.9)`
    ctx.fillRect(x0, y - 1.5, len, 3)
  })
}
const Velocity = () => <canvas {...useCanvasLoop(drawVelocity)} className="absolute inset-0 h-full w-full" />

/* 004 — Kinetic Type: letters lift, stretch and skew in sequence */
function Kinetic({ tile }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = tile.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const letters = ref.current.querySelectorAll('span')
    const on = () =>
      gsap.to(letters, {
        y: (i) => Math.sin((i + 1) * 1.8) * 18,
        scaleY: (i) => 1 + Math.sin(i * 2.1) * 0.3,
        skewX: (i) => Math.cos(i * 1.5) * 10,
        color: 'rgb(255 90 31)',
        duration: 0.7,
        stagger: 0.06,
        ease: 'expo.out',
      })
    const off = () => gsap.to(letters, { y: 0, scaleY: 1, skewX: 0, color: 'rgb(242 240 235)', duration: 0.9, stagger: 0.04, ease: 'expo.out' })
    el.addEventListener('pointerenter', on)
    el.addEventListener('pointerleave', off)
    el.addEventListener('focusin', on)
    el.addEventListener('focusout', off)
    return () => {
      el.removeEventListener('pointerenter', on)
      el.removeEventListener('pointerleave', off)
      el.removeEventListener('focusin', on)
      el.removeEventListener('focusout', off)
    }
  }, [tile])
  return (
    <div ref={ref} aria-hidden="true" className="display absolute inset-0 flex items-center justify-center gap-[0.04em] pb-16 text-light">
      {'TYPE'.split('').map((c, i) => (
        <span key={i} className="inline-block origin-bottom">
          {c}
        </span>
      ))}
    </div>
  )
}

const SPANS = ['md:col-span-7', 'md:col-span-5', 'md:col-span-5', 'md:col-span-7']

function Tile({ xp, i }) {
  const tile = useRef(null)
  const Visual = [OrbitField, Drift, Velocity][i]
  return (
    <li
      ref={tile}
      data-reveal="pixels"
      data-veil="var(--color-bone)"
      data-delay={String((i % 2) * 0.15)}
      className={`tile-depth group relative col-span-12 h-[clamp(320px,36vw,520px)] overflow-hidden bg-void text-light ${SPANS[i]}`}
      aria-label={`${xp.title}: ${xp.body}`}
    >
      {i < 3 ? <Visual /> : <Kinetic tile={tile} />}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 md:p-7">
        <div className="flex items-baseline justify-between">
          <span className="label tnum">
            AS<span className="text-flare">—</span>E{xp.number}
          </span>
          <span className="label text-light-dim">{xp.field}</span>
        </div>
        <div>
          <h3 className="title lit transition-transform duration-700 group-hover:translate-x-2">{xp.title}</h3>
          <p className="meta mt-2 max-w-[38ch] text-light-dim">{xp.body}</p>
        </div>
      </div>
    </li>
  )
}

export default function Lab() {
  const root = useRef(null)
  useGSAP(() => revealIn(root.current), { scope: root })

  return (
    <section id="lab" ref={(el) => registerChapter('lab', el)} className="relative py-[14vh]" aria-labelledby="lab-title">
      <div ref={root} className="layer shell">
        <SectionHead n="05" label="Lab" aside="Running live, below" tone="l" />
        <div className="mt-8 grid-12 items-end gap-y-6">
          <h2 id="lab-title" className="h2 press col-span-12 md:col-span-8" data-skew>
            <span className="block" data-reveal="chars">Small studies,</span>{' '}
            <em className="block italic" data-reveal="focus" data-delay="0.2">tried here first.</em>
          </h2>
          <p className="meta col-span-12 max-w-[36ch] text-ink-dim md:col-span-4 md:justify-self-end" data-reveal="para">
            Techniques get tested here before they are trusted with a real build. Each loop stops when it leaves the screen.
          </p>
        </div>
        <ul className="mt-14 grid-12 gap-3">
          {experiments.map((xp, i) => (
            <Tile key={xp.number} xp={xp} i={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
