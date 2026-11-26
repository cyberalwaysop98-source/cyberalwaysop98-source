import { useEffect, useState } from 'react'
import { ScrollTrigger } from './lib/motion'
import { useReducedMotion, useSmoothScroll, lockScroll } from './lib/hooks'
import { stage, registerChapter, measureChapters } from './lib/stage'
import Stage from './gl/Stage'
import Gate from './components/gate/Gate'
import Chrome from './components/chrome/Chrome'
import Cursor from './components/ui/Cursor'
import Hero from './components/hero/Hero'
import Intro from './components/intro/Intro'
import Work from './components/work/Work'
import CaseStudy from './components/work/CaseStudy'
import Method from './components/method/Method'
import Capabilities from './components/capabilities/Capabilities'
import Lab from './components/lab/Lab'
import About from './components/about/About'
import Experience from './components/experience/Experience'
import Iris from './components/iris/Iris'
import Contact from './components/contact/Contact'
import Footer from './components/footer/Footer'
import Marquee from './components/ui/Marquee'
import { useVelocitySkew } from './lib/kinetic'
import { meta, method, name } from './content'

// the question at the gate is asked once per visit; a reload goes straight to the light
const SEEN = 'as:seen'
const seen = () => {
  try {
    return sessionStorage.getItem(SEEN) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const reduced = useReducedMotion()
  const [gate, setGate] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [entered, setEntered] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [quick] = useState(seen)

  useSmoothScroll(!reduced)
  // display type leans with the scroll's speed and settles when it stops
  useVelocitySkew(entered && !reduced)

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    if (!/^#work\//.test(location.hash)) window.scrollTo(0, 0)
  }, [])

  // reduced motion: no gate, no ignition — the page is simply there
  useEffect(() => {
    if (!reduced) return
    stage.intro = 1
    stage.load = 1
    setGate(false)
    setEntered(true)
  }, [reduced])

  useEffect(() => {
    lockScroll(gate)
    if (gate) return
    try {
      sessionStorage.setItem(SEEN, '1')
    } catch {
      /* private mode: the gate simply asks again */
    }
    measureChapters()
    ScrollTrigger.refresh()
  }, [gate])

  return (
    <>
      <a
        href="#intro"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-light focus:px-5 focus:py-2 focus:text-void"
      >
        Skip to content
      </a>

      {/* the light the whole site is shown in — fixed, between backgrounds and content */}
      <Stage enabled={!reduced} />
      {/* the colour grade and vignette: over the page, under the chrome */}
      <div className="grade" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {gate && <Gate quick={quick} onIgnite={() => setEntered(true)} onDone={() => setGate(false)} />}

      <Chrome ready={entered} />
      <Cursor />

      <main className={entered ? '' : 'invisible'} inert={!entered}>
        <Hero ready={entered} />
        <Intro />
        <Work />
        <Marquee items={method.stages.map((s) => s.word)} tone="light" />
        <Method />
        {/* the one chapter lit end to end */}
        <div ref={(el) => registerChapter('paper', el)} data-ground="bone" className="bg-bone text-ink">
          <Capabilities />
          <Lab />
          <About />
          <Marquee items={[name.word, 'a ray of light', meta.role, meta.location]} tone="ink" speed={0.45} />
          <Experience />
          <Iris />
        </div>
        <Contact />
      </main>
      <div className={entered ? '' : 'invisible'}>
        <Footer />
      </div>

      <CaseStudy />
    </>
  )
}
