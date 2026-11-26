import { gsap, ScrollTrigger, SplitText, MOTION_OK, GLYPHS } from './motion'

/* Declarative entrances. Mark an element with data-reveal and call
   useReveal(scope) (via revealIn) once per section:

     lines    — split into lines, each rises through its own mask
     focus    — characters come into focus from blur (the lens pull)
     fade     — a short rise and fade
     rule     — a hairline draws from the left
     draw     — every stroke in an SVG draws itself
     scramble — text resolves from glyphs (labels, numbers)
     pixels   — a grid of cells clears in random order (tiles)

   data-delay="0.2" offsets one element. Everything is visible by default;
   the hidden start state only exists inside the motion media query. */

/* scroller: the element that scrolls, when it is not the window (the case study panel) */
export function revealIn(scope, { scroller } = {}) {
  const mm = gsap.matchMedia()
  mm.add(MOTION_OK, () => {
    const veils = []
    const els = gsap.utils.toArray('[data-reveal]', scope)
    els.forEach((el) => {
      const kind = el.dataset.reveal
      const delay = parseFloat(el.dataset.delay || 0)
      const st = { trigger: el, start: el.dataset.start || 'top 88%', once: true }
      if (scroller) st.scroller = scroller

      if (kind === 'lines') {
        // each line flips up out of its mask, hinged at the top like a card
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'mask-line',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 112,
              rotationX: -62,
              transformOrigin: '50% 0%',
              transformPerspective: 900,
              duration: 1.5,
              stagger: 0.09,
              delay,
              ease: 'expo.out',
              scrollTrigger: st,
            }),
        })
      } else if (kind === 'chars') {
        // letters rise through the line's mask one after another, turning as they come
        SplitText.create(el, {
          type: 'lines,chars',
          mask: 'lines',
          linesClass: 'mask-line',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.chars, {
              yPercent: 118,
              rotation: 7,
              transformOrigin: '0% 100%',
              duration: 1.3,
              stagger: 0.028,
              delay,
              ease: 'expo.out',
              scrollTrigger: st,
            }),
        })
      } else if (kind === 'para') {
        // running text: line by line, quick and close together
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'mask-line',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, { yPercent: 105, opacity: 0, duration: 1.15, stagger: 0.06, delay, ease: 'expo.out', scrollTrigger: st }),
        })
      } else if (kind === 'focus') {
        SplitText.create(el, {
          type: 'chars',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.chars, {
              opacity: 0,
              filter: 'blur(14px)',
              yPercent: 18,
              duration: 1.6,
              stagger: { each: 0.035, from: 'center' },
              delay,
              ease: 'expo.out',
              scrollTrigger: st,
              clearProps: 'filter',
            }),
        })
      } else if (kind === 'fade') {
        gsap.from(el, { opacity: 0, y: 28, duration: 1.3, delay, ease: 'expo.out', scrollTrigger: st })
      } else if (kind === 'rule') {
        gsap.from(el, { scaleX: 0, transformOrigin: '0% 50%', duration: 1.6, delay, ease: 'expo.inOut', scrollTrigger: st })
      } else if (kind === 'draw') {
        const strokes = el.querySelectorAll('path, line, circle, rect, polyline, ellipse')
        gsap.from(strokes, {
          drawSVG: '0%',
          duration: 1.8,
          stagger: 0.04,
          delay,
          ease: 'power3.inOut',
          scrollTrigger: st,
        })
        const dots = el.querySelectorAll('.dot')
        if (dots.length) gsap.from(dots, { scale: 0, transformOrigin: '50% 50%', duration: 0.8, delay: delay + 1, stagger: 0.05, scrollTrigger: st })
      } else if (kind === 'scramble') {
        const text = el.textContent
        gsap.from(el, { opacity: 0, duration: 0.3, delay, scrollTrigger: st })
        gsap.to(el, {
          duration: Math.min(1.6, 0.4 + text.length * 0.03),
          delay,
          scrambleText: { text, chars: GLYPHS, speed: 0.5, revealDelay: 0.15 },
          ease: 'none',
          scrollTrigger: st,
        })
      } else if (kind === 'pixels') {
        veils.push(pixelate(el, delay, st))
      }
    })
    // a veil is real DOM, not a tween: take it away when the scene reverts
    return () => veils.forEach((v) => v.remove())
  })
  return () => mm.revert()
}

/* Tiles arrive the way a low-bandwidth image does: a grid of cells in the
   ground colour, cleared in random order. */
function pixelate(el, delay, st) {
  const cols = 10
  const rect = el.getBoundingClientRect()
  const size = Math.max(rect.width / cols, 24)
  const rows = Math.ceil(rect.height / size)
  const veil = document.createElement('div')
  veil.setAttribute('aria-hidden', 'true')
  veil.style.cssText = `position:absolute;inset:0;display:grid;grid-template-columns:repeat(${cols},1fr);grid-auto-rows:${size}px;pointer-events:none;z-index:3;overflow:hidden`
  const ground = el.dataset.veil || 'var(--color-bone)'
  const cells = []
  for (let i = 0; i < cols * rows; i++) {
    const c = document.createElement('i')
    c.style.cssText = `background:${ground};display:block;margin:-0.5px`
    veil.appendChild(c)
    cells.push(c)
  }
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
  el.appendChild(veil)
  gsap.to(cells, {
    opacity: 0,
    duration: 0.01,
    delay,
    stagger: { each: 0.012, from: 'random', grid: [rows, cols] },
    scrollTrigger: st,
    onComplete: () => veil.remove(),
  })
  return veil
}

export const refresh = () => ScrollTrigger.refresh()
