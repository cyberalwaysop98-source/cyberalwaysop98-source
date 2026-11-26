/* The micro-motion layer — anime.js v4.

   One boundary keeps two engines from overlapping: GSAP owns everything
   driven by scroll and every piece of type; anime.js owns the brand mark,
   the icons and the small physical responses of controls (springs,
   drawn strokes, bursts). Nothing here reads or writes scroll. */
import { animate } from 'animejs/animation'
import { createTimeline } from 'animejs/timeline'
import { createDrawable } from 'animejs/svg'
import { stagger, random, set, remove } from 'animejs/utils'
import { spring } from 'animejs/easings/spring'
// import only what the layer uses: the root entry pulls in the whole library
const utils = { random, set, remove }

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/* the house springs: a soft settle, and a lively one for small objects */
export const SPRING = {
  soft: spring({ bounce: 0.18, duration: 700 }),
  pop: spring({ bounce: 0.45, duration: 650 }),
}

/* the ray mark draws itself: the core lights, the rays grow out of it in
   turn, the ring closes round them */
export function drawMark(svg, { delay = 0 } = {}) {
  if (!svg || reduced()) return null
  const core = svg.querySelector('.rm-core')
  const rays = createDrawable(svg.querySelectorAll('.rm-ray'))
  const ring = createDrawable(svg.querySelectorAll('.rm-ring'))
  utils.set(rays, { draw: '0 0' })
  utils.set(ring, { draw: '0 0' })
  utils.set(core, { scale: 0 })
  return createTimeline({ delay })
    .add(core, { scale: [0, 1], ease: SPRING.pop }, 0)
    .add(rays, { draw: ['0 0', '0 1'], duration: 700, ease: 'outExpo', delay: stagger(55) }, 120)
    .add(ring, { draw: ['0 0', '0 1'], duration: 1300, ease: 'inOutQuart' }, 260)
}

/* on hover: every ray reaches out and springs back, one after another */
export function burstMark(svg) {
  if (!svg || reduced()) return
  animate(svg.querySelectorAll('.rm-ray'), {
    scale: [1, 1.45, 1],
    duration: 700,
    ease: 'outElastic(1, .5)',
    delay: stagger(35, { from: 'first' }),
  })
  animate(svg.querySelector('.rm-core'), { scale: [1, 1.6, 1], duration: 600, ease: 'outElastic(1, .45)' })
}

/* the loader: rays light one after another, round and round */
export function loadingMark(svg) {
  if (!svg || reduced()) return null
  return animate(svg.querySelectorAll('.rm-ray'), {
    opacity: [0.18, 1, 0.18],
    duration: 1100,
    ease: 'inOutSine',
    delay: stagger(110),
    loop: true,
  })
}

/* an arrow leaves the way it points; a fresh one springs in behind it */
export function flyArrow(box) {
  if (!box || reduced()) return
  const [a, b] = box.querySelectorAll('.ar-g')
  const dx = parseFloat(box.dataset.dx)
  const dy = parseFloat(box.dataset.dy)
  utils.remove([a, b])
  createTimeline()
    .add(a, { x: [0, dx * 18], y: [0, dy * 18], opacity: [1, 0], duration: 320, ease: 'inQuad' }, 0)
    .add(b, { x: [-dx * 18, 0], y: [-dy * 18, 0], opacity: [0, 1], ease: SPRING.pop }, 140)
    .add([a], { x: 0, y: 0, opacity: 1, duration: 0 })
    .add([b], { opacity: 0, duration: 0 })
}

/* sound bars: organic, never in step — each bar picks a new height as it lands */
export function equalizer(bars) {
  if (!bars?.length) return null
  if (reduced()) {
    utils.set(bars, { scaleY: 0.6 })
    return { stop: () => utils.set(bars, { scaleY: 0.18 }) }
  }
  let live = true
  const run = (bar) => {
    if (!live) return
    animate(bar, {
      scaleY: utils.random(0.25, 1, 2),
      duration: utils.random(180, 420),
      ease: 'inOutSine',
      onComplete: () => run(bar),
    })
  }
  bars.forEach(run)
  return {
    stop() {
      live = false
      utils.remove(bars)
      animate(bars, { scaleY: 0.18, ease: SPRING.pop, delay: stagger(40) })
    },
  }
}

/* the menu icon: two strokes cross into an × (or part again) on a spring */
export function menuIcon(lines, open) {
  if (!lines?.length) return
  const [top, bottom] = lines
  if (reduced()) {
    utils.set(top, { y: open ? 4.5 : 0, rotate: open ? 45 : 0, scaleX: 1 })
    utils.set(bottom, { y: open ? -4.5 : 0, rotate: open ? -45 : 0, scaleX: 1 })
    return
  }
  animate(top, { y: open ? 4.5 : 0, rotate: open ? 45 : 0, scaleX: 1, ease: SPRING.soft })
  animate(bottom, { y: open ? -4.5 : 0, rotate: open ? -45 : 0, scaleX: 1, ease: SPRING.soft })
}
/* resting on the closed icon, the strokes trade lengths */
export function menuIconHover(lines, on) {
  if (!lines?.length || reduced()) return
  const [top, bottom] = lines
  animate(top, { scaleX: on ? 0.55 : 1, ease: SPRING.soft })
  animate(bottom, { scaleX: on ? 0.8 : 1, ease: SPRING.soft, delay: 60 })
}

/* the copy button: a tick draws itself and a ring of rays bursts outward */
export function copied(button) {
  if (!button) return
  const tick = button.querySelector('.cp-tick')
  const rays = button.querySelectorAll('.cp-ray')
  if (reduced()) return
  const drawn = createDrawable(tick)
  createTimeline()
    .add(drawn, { draw: ['0 0', '0 1'], duration: 520, ease: 'outExpo' }, 0)
    .add(
      rays,
      {
        opacity: [0, 1, 0],
        scale: [0.3, 1],
        translateX: (el) => [0, parseFloat(el.dataset.x)],
        translateY: (el) => [0, parseFloat(el.dataset.y)],
        duration: 700,
        ease: 'outExpo',
        delay: stagger(18),
      },
      40,
    )
}
