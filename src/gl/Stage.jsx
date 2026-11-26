import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/motion'
import { stage, measureChapters } from '../lib/stage'
import { createStage, pickTier } from './engine'

/* Hosts the WebGL stage: one fixed canvas between section backgrounds and
   section content (see the stacking contract in DESIGN.md). Renders on
   GSAP's ticker, after Lenis, so the light and the DOM move in the same
   frame. Under reduced motion, or without WebGL2, it renders nothing and
   the page shows its still fallbacks. */
export default function Stage({ enabled }) {
  const ref = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const canvas = ref.current
    let engine = null
    try {
      engine = createStage(canvas, pickTier())
    } catch (err) {
      console.warn('[stage] WebGL2 unavailable, showing the still version.', err)
    }
    if (!engine) {
      setFailed(true)
      return
    }
    const info = engine.info()
    stage.live = true
    stage.tier = info.tier
    stage.count = info.count
    stage.engine = engine
    document.documentElement.dataset.stage = 'live'

    gsap.ticker.add(engine.tick)

    const onResize = () => {
      engine.resize()
      measureChapters()
    }
    window.addEventListener('resize', onResize)
    ScrollTrigger.addEventListener('refresh', measureChapters)
    measureChapters()
    // measure again once layout settles (fonts, images)
    const ro = new ResizeObserver(() => measureChapters())
    ro.observe(document.body)

    document.fonts?.ready.then(() => engine.onFonts())

    // once the gate has opened, put the work's stills on the GPU in idle time,
    // so scrolling into Work never waits on a decode or an upload
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200))
    const waitGate = setInterval(() => {
      if (stage.intro < 1 || !stage.planes.size) return
      clearInterval(waitGate)
      idle(() => engine.preload([...stage.planes.values()].map((p) => p.src)), { timeout: 2000 })
    }, 400)

    const onMove = (e) => {
      if (e.pointerType === 'touch') return
      stage.mouse.x = e.clientX
      stage.mouse.y = e.clientY
      stage.mouse.on = true
    }
    const onLeave = () => (stage.mouse.on = false)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    const onLost = (e) => {
      e.preventDefault()
      stage.live = false
      document.documentElement.dataset.stage = 'still'
      setFailed(true)
    }
    canvas.addEventListener('webglcontextlost', onLost)

    return () => {
      clearInterval(waitGate)
      gsap.ticker.remove(engine.tick)
      window.removeEventListener('resize', onResize)
      ScrollTrigger.removeEventListener('refresh', measureChapters)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('webglcontextlost', onLost)
      engine.destroy()
      stage.live = false
      stage.engine = null
      delete document.documentElement.dataset.stage
    }
  }, [enabled])

  if (!enabled || failed) return null
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] h-[100lvh] w-screen"
      data-stage
    />
  )
}
