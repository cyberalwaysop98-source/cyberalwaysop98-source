import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { meta, social } from '../../content'
import { scrollToId } from '../../lib/hooks'
import Notation from '../ui/Notation'

const kb = (entries) => Math.round(entries.reduce((sum, e) => sum + (e.encodedBodySize || 0), 0) / 1024)
// memory-cache hits report 0 bytes; say so rather than print a false "0 KB"
const size = (n) => (n ? `${n} KB` : 'from cache')

// what the page light is actually doing on this device, read from the canvas itself
const RENDER = {
  high: 'at full quality',
  mid: 'at a lighter tablet setting',
  low: 'at half resolution and 30 fps for this phone',
}

/* Colophon: what this visit actually cost, read from the browser's own
   Resource Timing entries when the footer is reached. No hardcoded numbers
   to drift out of date — if the build changes, the readout changes. */
function useVisitCost(ready) {
  const [cost, setCost] = useState(null)
  useEffect(() => {
    if (!ready) return
    const res = performance.getEntriesByType('resource')
    const js = res.filter((r) => /\.m?js(\?|$)/.test(r.name))
    const shots = res.filter((r) => /\/work\/.+\.webp/.test(r.name))
    const tier = document.querySelector('[data-projector]')?.dataset.tier
    setCost({ js: kb(js), shots: kb(shots), count: shots.length, render: RENDER[tier] })
  }, [ready])
  return cost
}

/* End credits: name, place, profiles, the way back — and the receipt. */
export default function Footer() {
  const ref = useRef(null)
  const reached = useInView(ref, { once: true, amount: 0.5 })
  const cost = useVisitCost(reached)

  return (
    <footer ref={ref} className="shell relative border-t hairline py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between">
        <p className="wordmark text-paper">
          {meta.name}
          <span className="ml-2 text-paper-faint">— {meta.role}</span>
        </p>
        <p className="eyebrow">
          {meta.location} · © {new Date().getFullYear()}
        </p>
        <nav aria-label="Profiles" className="flex flex-wrap items-center gap-x-6">
          {social.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="eyebrow inline-flex min-h-11 items-center text-paper-dim transition-colors hover:text-ember"
            >
              {s.label} ↗
            </a>
          ))}
          <button
            type="button"
            onClick={() => scrollToId('top')}
            className="eyebrow inline-flex min-h-11 items-center whitespace-nowrap text-paper transition-colors hover:text-ember"
          >
            Back to top ↑
          </button>
        </nav>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t hairline pt-6 md:flex-row md:items-baseline md:gap-8">
        <Notation code="V2" tags={['This site']} />
        <p className="meta max-w-[110ch] text-paper-faint" aria-live="polite">
          {cost ? (
            <>
              Measured in your browser on this visit — all of this site’s JavaScript: {size(cost.js)}. The light behind the
              whole page is one GLSL shader on raw WebGL with no 3D library,{' '}
              {cost.render ? `rendering ${cost.render}` : 'shown as a still frame here'}.{' '}
              {cost.count > 0 &&
                `${cost.count} image${cost.count === 1 ? '' : 's'} of the work loaded as you reached ${cost.count === 1 ? 'it' : 'them'}: ${size(cost.shots)}.`}
            </>
          ) : (
            'React, Motion and raw WebGL. The numbers on this line are measured when you reach it.'
          )}
        </p>
      </div>
    </footer>
  )
}
