import { Fragment, useEffect, useRef } from 'react'
import { gsap } from '../../lib/motion'
import { getLenis } from '../../lib/hooks'

/* A band of type that drifts on its own, runs faster while you scroll,
   and turns round when you scroll back up. Paused off screen. */
export default function Marquee({ items, tone = 'light', speed = 0.6 }) {
  const band = useRef(null)
  const track = useRef(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = track.current
    const half = () => el.scrollWidth / 2
    let w = half()
    let x = 0
    let dir = 1
    let on = false
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting))
    io.observe(band.current)
    const ro = new ResizeObserver(() => (w = half()))
    ro.observe(el)
    const tick = (t, dt) => {
      if (!on || !w) return
      const l = getLenis()
      if (l?.direction) dir = l.direction
      const v = Math.abs(l?.velocity || 0)
      x -= (speed + v * 0.35) * dir * (dt / 16.7)
      x = ((x % w) + w) % w - w
      gsap.set(el, { x, force3D: true })
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      io.disconnect()
      ro.disconnect()
    }
  }, [speed])

  const run = (
    <>
      {items.map((it, i) => (
        <Fragment key={i}>
          <span className={i % 2 ? 'italic' : 'uppercase'}>{it}</span>
          <span className="mx-[0.35em] inline-block text-flare" aria-hidden="true">
            ✳
          </span>
        </Fragment>
      ))}
    </>
  )

  return (
    <div
      ref={band}
      aria-label={items.join(', ')}
      role="marquee"
      className={`layer overflow-hidden border-y py-[2.2vh] ${tone === 'light' ? 'rule-d text-light' : 'rule-l text-ink'}`}
    >
      <div data-skew className="will-change-transform">
        <div ref={track} aria-hidden="true" className={`gpu serif flex w-max whitespace-nowrap text-[clamp(2.6rem,7.6vw,8.5rem)] leading-[1.02] ${tone === 'light' ? 'lit' : 'press'}`}>
          <span className="pr-[0.35em]">{run}</span>
          <span className="pr-[0.35em]">{run}</span>
        </div>
      </div>
    </div>
  )
}
