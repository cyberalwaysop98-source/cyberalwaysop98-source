/* Shared state between the page and the WebGL stage.
   Sections and GSAP write plain numbers here; the stage reads them every
   frame. No React renders are involved in anything that moves. */

export const stage = {
  /* gate */
  load: 0, // 0..1 real asset progress — the dust gathers into a ring with it
  intro: 0, // 0..1 after the gate: ring → point → burst into the hero field
  live: false, // the stage is running (false under reduced motion / no WebGL2)
  tier: 'none', // 'high' | 'mid' | 'low' | 'none'
  count: 0, // particles actually drawn
  /* pointer, in CSS px — written by the cursor layer */
  mouse: { x: -9999, y: -9999, on: false },
  /* chapter elements, measured on refresh */
  chapters: {},
  /* work planes: id → { el, src, reel, hover, reveal, open } */
  planes: new Map(),
  /* the light's position on screen this frame, CSS px — DOM callouts aim at it */
  core: { x: 0, y: 0, i: 0 },
  /* case study covering the page: the stage idles */
  covered: false,
}

/* Ref callbacks run again on every re-render (with null, then the element),
   so this ignores nulls and repeats — chapters never unmount — and measures
   a new element straight away rather than leaving it at zero. */
export const registerChapter = (id, el) => {
  if (!el || stage.chapters[id]?.el === el) return
  const r = el.getBoundingClientRect()
  stage.chapters[id] = { el, top: r.top + window.scrollY, height: r.height }
}

export const measureChapters = () => {
  const y = window.scrollY
  for (const c of Object.values(stage.chapters)) {
    const r = c.el.getBoundingClientRect()
    c.top = r.top + y
    c.height = r.height
  }
  for (const p of stage.planes.values()) {
    const r = p.el.getBoundingClientRect()
    p.top = r.top + y
    p.left = r.left
    p.width = r.width
    p.height = r.height
  }
}
