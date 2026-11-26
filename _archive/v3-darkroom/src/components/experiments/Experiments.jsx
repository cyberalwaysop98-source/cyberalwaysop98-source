import { useEffect, useRef, useState } from 'react'
import { m, useAnimationFrame, useMotionValue, useSpring, useTransform } from 'motion/react'
import { ease, dur } from '../../lib/motion'
import { useFinePointer, useReducedMotion, getLenis } from '../../lib/hooks'
import { experiments } from '../../content'
import SectionHeader from '../ui/SectionHeader'
import SplitText from '../ui/SplitText'
import Notation from '../ui/Notation'

const EMBER = '255, 74, 28'
const PAPER = '237, 233, 227'

/* Runs a canvas draw loop only while the canvas is on screen, at the
   device's pixel ratio. Under reduced motion it paints one still frame. */
function useCanvasLoop(draw) {
  const ref = useRef(null)
  const pointer = useRef({ x: 0.5, y: 0.5 })
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    let t = 0
    let last = performance.now()

    const size = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const frame = (now) => {
      t += Math.min(now - last, 50) / 1000 // clamp: a backgrounded tab should not jump
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
  const cx = w * 0.5 + (p.x - 0.5) * w * 0.25
  const cy = h * 0.5 + (p.y - 0.5) * h * 0.3
  const R = Math.min(w, h) * 0.26
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 + t * 0.7
    const r = R + Math.sin(a * 3 + t * 1.4) * R * 0.4 + Math.cos(a * 2 - t * 0.7) * R * 0.25
    const z = Math.sin(a + t) // fake depth: near points are larger and brighter
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.62, 1.2 + (z + 1) * 1.1, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${EMBER}, ${0.25 + (z + 1) * 0.3})`
    ctx.fill()
  }
}
function OrbitField() {
  const loop = useCanvasLoop(drawOrbit)
  return <canvas {...loop} className="h-full w-full" />
}

/* 002 — Ember Drift: one hue, varied only in temperature and alpha */
const drawDrift = (ctx, w, h, t, p) => {
  const g = ctx.createLinearGradient(w * p.x, 0, w * (1 - p.x), h)
  g.addColorStop(0, `rgba(${EMBER}, ${0.22 + p.y * 0.2})`)
  g.addColorStop(0.55, 'rgba(58, 20, 8, 0.35)')
  g.addColorStop(1, 'rgba(10, 10, 11, 0.9)')
  ctx.fillStyle = 'rgba(10, 10, 11, 0.2)' // trails
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = g
  ctx.globalAlpha = 0.35
  ctx.fillRect(0, 0, w, h)
  ctx.globalAlpha = 1
  for (let i = 0; i < 30; i++) {
    const x = (Math.sin(i * 7.3 + t * 1.2) * 0.5 + 0.5) * w
    const y = (Math.cos(i * 11.1 + t * 0.9) * 0.5 + 0.5) * h
    ctx.beginPath()
    ctx.arc(x, y, 0.8 + (Math.sin(i + t * 1.8) + 1) * 0.6, 0, Math.PI * 2)
    ctx.fillStyle = i % 3 ? `rgba(${EMBER}, 0.55)` : `rgba(${PAPER}, 0.45)`
    ctx.fill()
  }
}
function EmberDrift() {
  const loop = useCanvasLoop(drawDrift)
  return <canvas {...loop} className="h-full w-full" />
}

/* 003 — Scroll Velocity: reads Lenis's own per-frame scroll delta directly.
   The previous version derived velocity from scrollY (itself already
   Lenis-smoothed) and then ran it through a second, slow spring — two
   cascaded low-pass filters that delayed the visible reaction by close to a
   second after the user actually stopped scrolling. One source, one spring. */
const VELOCITY_CEIL = 40 // px of scroll per frame that reads as "fast" — tuned against real wheel/trackpad input

function ScrollVelocity() {
  const reduced = useReducedMotion()
  const wrapRef = useRef(null)
  const visible = useRef(true)
  const raw = useMotionValue(0)
  // holds the sign of the last real movement, so bars don't reset origin at rest
  const originX = useMotionValue(0)

  useEffect(() => {
    // reduced motion renders the static branch below, with no ref to observe
    if (reduced || !wrapRef.current) return
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting })
    io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [reduced])

  useAnimationFrame(() => {
    if (reduced || !visible.current) return
    const lenis = getLenis()
    if (!lenis) return
    raw.set(lenis.velocity)
    if (lenis.direction) originX.set(lenis.direction < 0 ? 1 : 0)
  })

  // one smoothing pass, tuned to settle in ~200ms — visible inertia, not a lag
  const speed = useSpring(raw, { stiffness: 260, damping: 32, mass: 0.4 })
  const origin = useSpring(originX, { stiffness: 500, damping: 50 })
  const bars = [0.7, 0.45, 0.85, 0.3, 0.6]

  if (reduced) {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-[6px] px-2">
        {bars.map((b, i) => (
          <div
            key={i}
            className="h-[3px] rounded-full"
            style={{ width: `${16 + b * 16}%`, background: i % 2 ? 'var(--color-paper-dim)' : 'var(--color-ember)' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="flex h-full w-full flex-col justify-center gap-[6px] px-2">
      {bars.map((b, i) => (
        <Bar key={i} speed={speed} originX={origin} base={b} i={i} />
      ))}
    </div>
  )
}
function Bar({ speed, originX, base, i }) {
  const scaleX = useTransform(speed, (v) => {
    const intensity = Math.min(1, Math.abs(v) / VELOCITY_CEIL) // clamped: no runaway on a hard fling
    return Math.min(1, 0.16 + base * 0.16 + intensity * (0.68 + base * 0.2))
  })
  return (
    <m.div
      className="h-[3px] rounded-full"
      style={{ scaleX, originX, background: i % 2 ? 'var(--color-paper-dim)' : 'var(--color-ember)' }}
    />
  )
}

/* 004 — Kinetic Type */
function KineticType({ on }) {
  return (
    <div className="flex h-full w-full items-center justify-center gap-[2px]">
      {'TYPE'.split('').map((ch, i) => (
        <m.span
          key={i}
          className="display inline-block text-[clamp(1.4rem,2.6vw,2.2rem)]"
          animate={{
            y: on ? Math.sin((i + 1) * 1.8) * 6 : 0,
            scaleY: on ? 1 + Math.sin(i * 2.1) * 0.25 : 1,
            skewX: on ? Math.cos(i * 1.5) * 8 : 0,
            color: on ? 'var(--color-ember)' : 'var(--color-paper)',
          }}
          transition={{ duration: 0.6, delay: i * 0.06, ease: ease.out }}
        >
          {ch}
        </m.span>
      ))}
    </div>
  )
}

const VISUALS = [OrbitField, EmberDrift, ScrollVelocity, KineticType]

/* warm tints only — the lab light moves, its colour temperature does not */
const FIELDS = ['18% 20%', '82% 26%', '26% 78%', '76% 74%']

export default function Experiments() {
  const [hover, setHover] = useState(null)
  // touch has no hover: every demo is simply live while it is on screen
  const fine = useFinePointer()

  return (
    <section id="experiments" className="relative overflow-hidden py-28 md:py-40">
      <m.div
        className="layer-fill"
        aria-hidden="true"
        animate={{
          // transparent outside the warm pool: the page-wide projector shows through
          background: `radial-gradient(90% 70% at ${FIELDS[hover ?? 0]}, rgb(42 17 9 / 0.85) 0%, rgb(42 17 9 / 0) 62%)`,
          opacity: hover === null ? 0.5 : 1,
        }}
        transition={{ duration: dur.cinematic * 0.7, ease: ease.out }}
      />
      <div
        className="layer-fill opacity-[0.16] [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:64px_64px]"
        aria-hidden="true"
      />

      <div className="shell relative">
        <SectionHeader index="02" label="Lab" />

        <div className="mt-10 flex flex-col justify-between gap-6 md:mt-16 md:flex-row md:items-end">
          <SplitText
            as="h2"
            text="The laboratory"
            mode="chars"
            className="display text-[length:var(--text-huge)] text-paper"
          />
          <p className="max-w-[36ch] text-paper-dim">
            Small studies, running live below. Techniques get tested here before they are trusted with a real
            build.
          </p>
        </div>

        <ul className="mt-16 flex flex-col md:mt-24" onMouseLeave={() => setHover(null)}>
          {experiments.map((xp, i) => {
            const Visual = VISUALS[i]
            const on = !fine || hover === i
            return (
              <li key={xp.number}>
                <m.div
                  tabIndex={0}
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className="grid grid-cols-1 items-center gap-3 border-t hairline py-7 md:grid-cols-12 md:gap-8 md:py-9"
                  animate={{ opacity: hover === null || hover === i ? 1 : 0.62 }}
                  transition={{ duration: dur.ui }}
                >
                  <Notation code={`E${xp.number}`} className="text-ember md:col-span-1" />

                  <m.h3
                    className="display text-[clamp(1.6rem,4vw,3.2rem)] text-paper md:col-span-3"
                    animate={{ x: hover === i ? 14 : 0 }}
                    transition={{ duration: dur.ui, ease: ease.out }}
                  >
                    {xp.title}
                  </m.h3>

                  <span className="eyebrow md:col-span-1">{xp.field}</span>

                  <div
                    className="h-[96px] border hairline transition-opacity duration-500 md:col-span-3 md:h-[84px]"
                    style={{ opacity: on ? 1 : 0.45 }}
                    aria-hidden="true"
                  >
                    <Visual on={on} />
                  </div>

                  <p className="meta max-w-[40ch] text-paper-dim md:col-span-4">{xp.body}</p>
                </m.div>
              </li>
            )
          })}
        </ul>
        <div className="border-t hairline" />
      </div>
    </section>
  )
}
