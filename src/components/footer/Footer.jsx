import { useEffect, useRef, useState } from 'react'
import { gsap, SplitText, ScrollTrigger, useGSAP, MOTION_OK } from '../../lib/motion'
import { stage } from '../../lib/stage'
import { scrollToId } from '../../lib/hooks'
import { meta, nav, social } from '../../content'
import { proximity } from '../../lib/kinetic'
import Roll from '../ui/Roll'
import Arrow from '../ui/Arrow'
import RayMark from '../ui/RayMark'

const kb = (entries) => Math.round(entries.reduce((sum, e) => sum + (e.encodedBodySize || 0), 0) / 1024)
// memory-cache hits report 0 bytes; say so rather than print a false "0 KB"
const size = (n) => (n ? `${n} KB` : 'from cache')

/* Colophon: what this visit actually cost, read from the browser's own
   Resource Timing entries when the footer is reached. Nothing hardcoded. */
function useVisitCost(ready) {
  const [cost, setCost] = useState(null)
  useEffect(() => {
    if (!ready) return
    const res = performance.getEntriesByType('resource')
    const js = res.filter((r) => /\.m?js(\?|$)/.test(r.name))
    const shots = res.filter((r) => /\/work\/.+\.webp/.test(r.name))
    const gl = stage.engine?.info()
    setCost({ js: kb(js), shots: kb(shots), count: shots.length, gl })
  }, [ready])
  return cost
}

/* the wordmark is set to exactly the width of the page */
function useFit(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      el.style.fontSize = '100px'
      const cs = getComputedStyle(el.parentElement)
      const w = el.parentElement.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      el.style.fontSize = `${(100 * w) / el.scrollWidth}px`
      ScrollTrigger.refresh()
    }
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(el.parentElement)
    return () => ro.disconnect()
  }, [ref])
}

export default function Footer() {
  const root = useRef(null)
  const word = useRef(null)
  const [reached, setReached] = useState(false)
  const cost = useVisitCost(reached)
  useFit(word)

  useGSAP(
    () => {
      ScrollTrigger.create({ trigger: root.current, start: 'top 70%', once: true, onEnter: () => setReached(true) })
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const split = SplitText.create(word.current, { type: 'chars', charsClass: 'inline-block' })
        gsap.from(split.chars, {
          yPercent: 100,
          ease: 'none',
          stagger: 0.04,
          scrollTrigger: { trigger: word.current, start: 'top bottom', end: 'bottom bottom', scrub: 0.8 },
        })
        // and the letters nearest the cursor lift out of the line
        return proximity(split.chars, { mode: 'lift', radius: 300, amount: 34, root: word.current })
      })
    },
    { scope: root },
  )

  return (
    <footer ref={root} className="relative overflow-hidden pt-[12vh]">
      <div className="layer">
        <div className="shell grid grid-cols-2 gap-8 border-t rule-d pt-6 md:grid-cols-4">
          <nav aria-label="Footer index">
            <p className="label text-light-dim">Index</p>
            <ul className="mt-3 columns-2 gap-4">
              {nav.slice(1).map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToId(n.id)
                    }}
                    className="link-draw meta inline-block py-0.5"
                  >
                    <Roll>{n.label}</Roll>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="label text-light-dim">Elsewhere</p>
            {social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="link-draw meta mt-3 flex w-fit items-center gap-1.5">
                <Roll>{s.label}</Roll> <Arrow dir="up-right" />
              </a>
            ))}
            <a href={meta.resume} target="_blank" rel="noreferrer" className="link-draw meta mt-1 flex w-fit items-center gap-1.5">
              <Roll>Résumé</Roll> <Arrow dir="up-right" />
            </a>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="label text-light-dim">Write</p>
            <a href={`mailto:${meta.email}`} className="link-draw meta mt-3 block w-fit">
              {meta.email}
            </a>
          </div>
          <div className="md:text-right">
            <p className="label text-light-dim">Base</p>
            <p className="meta mt-3">{meta.location}</p>
          </div>
        </div>

        <div className="shell mt-[8vh]">
          <p
            ref={word}
            data-skew
            className="serif lit w-max whitespace-nowrap uppercase leading-[0.78] tracking-[-0.03em] text-light"
            aria-label={meta.name}
            style={{ fontSize: '14vw' }}
          >
            {meta.name}
          </p>
        </div>

        <div className="shell mt-6 flex flex-col gap-4 border-t rule-d pb-20 pt-5 md:flex-row md:items-center md:justify-between">
          <p className="label flex items-center gap-2.5 text-light-dim">
            <RayMark size={16} />©&nbsp;{new Date().getFullYear()} {meta.name} · AS<span className="text-flare">—</span>V4 / This site
          </p>
          <p className="meta max-w-[90ch] text-light-dim md:text-center" aria-live="polite">
            {cost
              ? `Measured in your browser on this visit — all of this site’s JavaScript: ${size(cost.js)}. ${
                  cost.gl
                    ? `The light is hand-written GLSL on raw WebGL2, no 3D library: ${cost.gl.count.toLocaleString('en-GB')} points at ${cost.gl.dpr}× resolution on this device.`
                    : 'The live light is off here, so you are seeing its still version.'
                } ${cost.count ? `${cost.count} images of the work: ${size(cost.shots)}.` : ''}`
              : 'React, GSAP and raw WebGL2. The numbers on this line are measured when you reach it.'}
          </p>
          <button type="button" onClick={() => scrollToId('top')} className="label link-draw inline-flex min-h-11 w-fit items-center gap-1.5 whitespace-nowrap" data-cursor="Top">
            <Roll>Back to top</Roll> <Arrow dir="up" />
          </button>
        </div>
      </div>
    </footer>
  )
}
