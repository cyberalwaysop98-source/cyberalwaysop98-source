/* One motion engine: GSAP. Every animation on the site imports from here,
   so plugins are registered once and the language stays consistent. */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin, useGSAP)

gsap.defaults({ ease: 'expo.out', duration: 1.2 })
// a dropped frame should never make a scrubbed scene jump
gsap.ticker.lagSmoothing(0)
ScrollTrigger.config({ ignoreMobileResize: true })

/* the house curves */
export const EASE = {
  out: 'expo.out', // entrances
  inOut: 'power4.inOut', // state to state
  soft: 'power3.out', // hovers, small things
  in: 'power3.in',
}

/* glyph set for scramble: mono-friendly, no letters that jump width */
export const GLYPHS = '01<>/\\{}[]*+=-_#%&'

/* Under reduced motion the page is static: callers wrap choreography in
   gsap.matchMedia() with this query so the final state is the default. */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

export { gsap, ScrollTrigger, SplitText, useGSAP }
