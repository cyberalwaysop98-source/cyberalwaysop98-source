import { useEffect, useState } from 'react'
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import { useReducedMotion, useSmoothScroll, lockScroll } from './lib/hooks'
import { openIris } from './lib/projector'
import Preloader from './components/preloader/Preloader'
import Projector from './components/projector/Projector'
import Nav from './components/navigation/Nav'
import FilmRail from './components/ui/FilmRail'
import Timecode from './components/ui/Timecode'
import CommandPalette from './components/ui/CommandPalette'
import Hero from './components/hero/Hero'
import Work from './components/projects/Work'
import Experiments from './components/experiments/Experiments'
import Capabilities from './components/capabilities/Capabilities'
import About from './components/about/About'
import Experience from './components/experience/Experience'
import Statement from './components/statement/Statement'
import Contact from './components/contact/Contact'
import Footer from './components/footer/Footer'

// the countdown plays once per visit; a reload in the same tab goes straight to the picture
const SEEN = 'as:seen'
const seenThisSession = () => {
  try {
    return sessionStorage.getItem(SEEN) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [loading, setLoading] = useState(() => !seenThisSession())
  const reduced = useReducedMotion()

  useSmoothScroll(!reduced)

  useEffect(() => {
    lockScroll(loading)
    if (loading) return
    window.scrollTo(0, 0)
    try {
      sessionStorage.setItem(SEEN, '1')
    } catch {
      /* private mode: the countdown simply plays again */
    }
  }, [loading])

  // no countdown this time: open the aperture straight away
  useEffect(() => {
    if (!loading) openIris(1500)
    // mount only — the preloader opens it otherwise
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    // reducedMotion="user": every Motion transform honours the OS setting from one
    // place. LazyMotion + domAnimation: the site uses no layout or drag animation,
    // so the full feature bundle is not shipped (strict: a stray <motion.*> throws).
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">
      <div className="grain">
        <a
          href="#work"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[110] focus:rounded-full focus:bg-paper focus:px-5 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>

        {/* the light the whole site is shown in — fixed, behind everything */}
        <Projector />

        <AnimatePresence>
          {loading && <Preloader key="pre" onDone={() => setLoading(false)} />}
        </AnimatePresence>

        <Nav />
        <FilmRail />
        <Timecode />
        <CommandPalette />

        <main>
          <Hero ready={!loading} />
          {/* the work is real and live, so it leads; the lab shows range */}
          <Work />
          <Experiments />
          <Capabilities />
          <About />
          <Experience />
          <Statement />
          <Contact />
        </main>

        <Footer />
      </div>
    </MotionConfig>
    </LazyMotion>
  )
}
