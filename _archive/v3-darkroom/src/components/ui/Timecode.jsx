import { useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'motion/react'
import { useActiveSection, useFinePointer } from '../../lib/hooks'
import { SCENE_IDS } from '../projector/Projector'

const LABELS = {
  top: 'Title',
  work: 'Work',
  experiments: 'Lab',
  capabilities: 'Capabilities',
  about: 'About',
  experience: 'Experience',
  statement: 'Statement',
  contact: 'Contact',
}

// scroll as running time: 8px of page is one frame, at 24 frames a second
const PX_PER_FRAME = 8
const two = (n) => String(n).padStart(2, '0')
function timecode(y) {
  const f = Math.max(0, Math.floor(y / PX_PER_FRAME))
  const s = Math.floor(f / 24)
  return `${two(Math.floor(s / 3600))}:${two(Math.floor(s / 60) % 60)}:${two(s % 60)}:${two(f % 24)}`
}

/* A camera's burnt-in timecode, bottom-left: the scene you are in and how
   far into the reel you are. It writes straight to the DOM from the scroll
   value — no React render per frame. Desktop only, decorative, and it
   inverts against whatever it sits over, so it reads on screen and print. */
export default function Timecode() {
  const fine = useFinePointer()
  const tc = useRef(null)
  const scene = useActiveSection(SCENE_IDS) || 'top'
  const { scrollY } = useScroll()

  const box = useRef(null)
  useMotionValueEvent(scrollY, 'change', (y) => {
    if (tc.current) tc.current.textContent = timecode(y)
    // roll the credits clear: step aside for the footer in this corner
    if (box.current) {
      const end = y + window.innerHeight > document.documentElement.scrollHeight - 220
      box.current.dataset.end = end ? '1' : ''
    }
  })

  if (!fine) return null
  const n = SCENE_IDS.indexOf(scene) + 1

  return (
    <div
      ref={box}
      className="index pointer-events-none fixed bottom-5 left-5 z-40 hidden items-baseline gap-4 text-paper mix-blend-difference transition-opacity duration-700 data-[end=1]:opacity-0! lg:flex xl:left-7"
      // the title card has its own scroll cue in this corner
      style={{ opacity: scene === 'top' ? 0 : 1 }}
      aria-hidden="true"
    >
      <span className="tracking-[0.14em] uppercase">
        Sc.{two(n)} <span className="opacity-60">{LABELS[scene]}</span>
      </span>
      <span ref={tc} className="tabular-nums opacity-80">
        00:00:00:00
      </span>
    </div>
  )
}
