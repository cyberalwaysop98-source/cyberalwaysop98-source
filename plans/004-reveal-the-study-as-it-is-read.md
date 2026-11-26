# 004 — Reveal each study as it is read, and light the system in data-flow order

- **Status**: DONE (2026-11-23)
- **Commit**: no git repository. Written against `src/components/work/CaseStudy.jsx` (259 lines, sha1 `58f5dafb5759…`) and `src/lib/reveal.js` (160 lines, sha1 `3504d50929e6…`) on 2026-11-23, with plans 001–003 applied on top
- **Severity**: LOW (additive: a missed opportunity, not a defect)
- **Category**: Missed opportunities
- **Estimated scope**: 2 files, about 45 lines

## Problem

Every chapter of the main page enters as it scrolls into view. Hairlines draw from the left, labels fade up, and paragraphs rise line by line (`src/lib/reveal.js`). Past its header, the case study has no motion at all. The five chapters (Overview, Problem, Approach, Build, Result), the "System — in order of data flow" diagram, the build notes, the reel and the footer are simply there. On the longest read on the site the page goes still, and the system diagram, whose whole point is an *order*, shows every step at once.

`revealIn` cannot be reused as it stands, because its ScrollTriggers watch the window. The dialog is a fixed panel that scrolls itself (`overflow-y-auto`, `data-lenis-prevent`) while the window is locked.

```js
// src/lib/reveal.js:17-25 — current
export function revealIn(scope) {
  const mm = gsap.matchMedia()
  mm.add(MOTION_OK, () => {
    const veils = []
    const els = gsap.utils.toArray('[data-reveal]', scope)
    els.forEach((el) => {
      const kind = el.dataset.reveal
      const delay = parseFloat(el.dataset.delay || 0)
      const st = { trigger: el, start: el.dataset.start || 'top 88%', once: true }
```

Current case study body (inside the keyed `<div key={p.id} ref={body}>` added by plan 003; indentation may be two spaces deeper than shown):

```jsx
            {CHAPTERS.map(([label, key], k) => (
              <section key={key} className="grid-12 gap-y-3 border-t rule-d py-8 md:py-12">
                <h3 className="label col-span-12 text-light-dim md:col-span-3">
                  <span className="tnum text-flare">0{k + 1}</span> — {label}
                </h3>
                <p className="col-span-12 max-w-[58ch] text-[1.175rem] leading-[1.6] text-light md:col-span-8 md:col-start-5">
                  {p.study[key]}
                </p>
              </section>
            ))}

            <section className="grid-12 gap-y-6 border-t rule-d py-8 md:py-12">
              <h3 className="label col-span-12 text-light-dim md:col-span-3">System — in order of data flow</h3>
              <ol className="col-span-12 md:col-span-9">
                {p.system.map(([name, what], k) => (
                  <li key={name} className="relative grid grid-cols-[2rem_1fr] gap-4 pb-6 last:pb-0">
                    <span className="relative flex justify-center">
                      <i className="relative z-[1] mt-1.5 block h-2.5 w-2.5 rounded-full border border-flare bg-void" />
                      {k < p.system.length - 1 && <i className="absolute bottom-[-0.25rem] top-4 w-px bg-[var(--color-line-d-strong)]" />}
                    </span>
                    <span>
                      <span className="text-light">{name}</span>
                      <span className="meta block text-light-dim">{what}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="grid-12 gap-y-4 border-t rule-d py-8 md:py-12">
              <h3 className="label col-span-12 text-light-dim md:col-span-3">Build notes — measured</h3>
              <dl className="col-span-12 md:col-span-9">
                {p.notes.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-12 gap-3 border-b rule-d py-4 last:border-0">
                    …
                  </div>
                ))}
              </dl>
            </section>

            <section className="grid-12 gap-y-4 border-t rule-d py-8 md:py-12">
              <h3 className="label col-span-12 text-light-dim md:col-span-3">The site, top to bottom</h3>
              <div className="col-span-12 md:col-span-9">
                <img
                  src={`/work/${p.id}-reel.webp`}
                  alt={`${p.title}: six frames captured while scrolling the live site`}
                  loading="lazy"
                  className="w-full"
                />
              </div>
            </section>
          </div>

          <footer className="shell flex flex-col gap-10 border-t rule-d pb-16 pt-10 md:flex-row md:items-end md:justify-between">
            <a href={p.href} target="_blank" rel="noreferrer" className="group" data-cursor="Visit">
            …
            <a href={`#work/${next.id}`} className="group text-right" data-cursor="Next">
```

## Target

Reuse the site's own reveal vocabulary (same kinds, same durations, same curves), bound to the panel's scroll:

- **Each body section**: its top hairline becomes a real element that draws from the left (`rule`). Its label `h3` fades up (`fade`). The chapter paragraph rises line by line (`para`) 0.08 s after.
- **System**: when the list reaches 80% of the panel's height, the steps light in data-flow order, one every **0.32 s**:
  - each node goes from `opacity: 0.2, scale: 0.9` to full, over 0.4 s with `EASE.out`
  - its text goes from `opacity: 0, y: 12` to full, over 0.6 s with `EASE.out`
  - the hairline to the next node grows down from the top (`scaleY` 0 to 1, origin `50% 0%`, 0.24 s, `ease: 'none'`, since it is a signal travelling at constant speed), starting 0.08 s after its node
- **Build notes**: each row fades up with a **60 ms** stagger (`data-delay = k × 0.06`).
- **Reel**: fades up. Its `<img>` gets `width={1280} height={4890}` (the real pixel size of every `*-reel.webp`), so the 3,800-px-tall image reserves its space before it loads and the triggers below it are measured in the right place.
- **Footer links**: fade up, the Next link 0.08 s after Visit.
- **Reduced motion**: no change. `revealIn` already does nothing outside `(prefers-reduced-motion: no-preference)`, and the entrance hook returns early, so everything is visible in its final state.

```js
// target — src/lib/reveal.js:17-25
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
```

```jsx
// target — CaseStudy.jsx imports: add under the other '../../lib/…' imports
import { revealIn } from '../../lib/reveal'
```

```jsx
// target — append inside the useGSAP entrance block, after the `.cs-img` tween
      // the body reveals as it is read: the panel scrolls, not the window
      const undo = revealIn(body.current, { scroller: panel.current })
      // the system lights up in the order its data flows
      const links = gsap.utils.toArray('.cs-link')
      const steps = gsap.utils.toArray('.cs-step')
      const flow = gsap.timeline({
        scrollTrigger: { trigger: '.cs-flow', scroller: panel.current, start: 'top 80%', once: true },
      })
      gsap.utils.toArray('.cs-node').forEach((node, k) => {
        const at = k * 0.32
        flow.from(node, { opacity: 0.2, scale: 0.9, duration: 0.4, ease: EASE.out }, at)
        flow.from(steps[k], { opacity: 0, y: 12, duration: 0.6, ease: EASE.out }, at)
        if (links[k]) flow.from(links[k], { scaleY: 0, transformOrigin: '50% 0%', duration: 0.24, ease: 'none' }, at + 0.08)
      })
      return undo
```

```jsx
// target — chapters
            {CHAPTERS.map(([label, key], k) => (
              <section key={key} className="relative grid-12 gap-y-3 py-8 md:py-12">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[var(--color-line-d)]" data-reveal="rule" />
                <h3 className="label col-span-12 text-light-dim md:col-span-3" data-reveal="fade">
                  <span className="tnum text-flare">0{k + 1}</span> — {label}
                </h3>
                <p className="col-span-12 max-w-[58ch] text-[1.175rem] leading-[1.6] text-light md:col-span-8 md:col-start-5" data-reveal="para" data-delay="0.08">
                  {p.study[key]}
                </p>
              </section>
            ))}
```

```jsx
// target — system
            <section className="relative grid-12 gap-y-6 py-8 md:py-12">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[var(--color-line-d)]" data-reveal="rule" />
              <h3 className="label col-span-12 text-light-dim md:col-span-3" data-reveal="fade">System — in order of data flow</h3>
              <ol className="cs-flow col-span-12 md:col-span-9">
                {p.system.map(([name, what], k) => (
                  <li key={name} className="relative grid grid-cols-[2rem_1fr] gap-4 pb-6 last:pb-0">
                    <span className="relative flex justify-center">
                      <i className="cs-node relative z-[1] mt-1.5 block h-2.5 w-2.5 rounded-full border border-flare bg-void" />
                      {k < p.system.length - 1 && <i className="cs-link absolute bottom-[-0.25rem] top-4 w-px bg-[var(--color-line-d-strong)]" />}
                    </span>
                    <span className="cs-step">
                      <span className="text-light">{name}</span>
                      <span className="meta block text-light-dim">{what}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
```

```jsx
// target — build notes (only the changed lines; the <dt>/<dd> inside each row are unchanged)
            <section className="relative grid-12 gap-y-4 py-8 md:py-12">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[var(--color-line-d)]" data-reveal="rule" />
              <h3 className="label col-span-12 text-light-dim md:col-span-3" data-reveal="fade">Build notes — measured</h3>
              <dl className="col-span-12 md:col-span-9">
                {p.notes.map(([k, v], n) => (
                  <div key={k} className="grid grid-cols-12 gap-3 border-b rule-d py-4 last:border-0" data-reveal="fade" data-delay={String(n * 0.06)}>
```

```jsx
// target — reel
            <section className="relative grid-12 gap-y-4 py-8 md:py-12">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[var(--color-line-d)]" data-reveal="rule" />
              <h3 className="label col-span-12 text-light-dim md:col-span-3" data-reveal="fade">The site, top to bottom</h3>
              <div className="col-span-12 md:col-span-9" data-reveal="fade">
                <img
                  src={`/work/${p.id}-reel.webp`}
                  alt={`${p.title}: six frames captured while scrolling the live site`}
                  width={1280}
                  height={4890}
                  loading="lazy"
                  className="w-full"
                />
              </div>
            </section>
```

```jsx
// target — footer: add data-reveal to the two links only
            <a href={p.href} target="_blank" rel="noreferrer" className="group" data-cursor="Visit" data-reveal="fade">
            …
            <a href={`#work/${next.id}`} className="group text-right" data-cursor="Next" data-reveal="fade" data-delay="0.08">
```

## Repo conventions to follow

- **Exemplar for a drawn top rule**: `src/components/about/About.jsx:58`, `<span className="absolute inset-x-0 top-0 h-px bg-[var(--color-line-l)]" data-reveal="rule" … />` inside a `relative` parent. On void the token is `--color-line-d` (the colour `rule-d` already uses).
- **Exemplar for returning `revealIn`'s undo from `useGSAP`**: `src/components/work/Work.jsx:192-209`, `const undo = revealIn(root.current) … return undo`.
- Reveal kinds and their timings are defined once, in `src/lib/reveal.js`. Mark elements with `data-reveal`; never hand-write a duplicate tween for a kind that exists.
- Curves come from `EASE` (`src/lib/motion.js:18-23`). `'none'` is allowed only for the constant-speed connector.
- Never put `data-reveal` (a transform) on a `<section>` element. Put it on its children (the Stacking Contract in `DESIGN.md`).

## Steps

1. `src/lib/reveal.js`: change the signature and the `st` lines exactly as in the target (add the one-line comment above `export function`, add `{ scroller } = {}`, and add `if (scroller) st.scroller = scroller` right after the `const st = …` line). Change nothing else in the file. All existing callers pass one argument and keep working.
2. `src/components/work/CaseStudy.jsx`: add `import { revealIn } from '../../lib/reveal'` after the existing `'../../lib/stage'` import.
3. In the `useGSAP` entrance block, after the `.cs-img` `gsap.from(...)` line, append the target block that ends with `return undo`. The early `if (!shown || reduced) return` at the top stays as it is.
4. **Chapters**: on each `<section>`, replace `border-t rule-d` with `relative`. Insert the hairline `<span … data-reveal="rule" />` as its first child. Add `data-reveal="fade"` to the `<h3>`. Add `data-reveal="para" data-delay="0.08"` to the `<p>`.
5. **System**: as in step 4 for the `<section>`, the span and the `<h3>`. Add the class `cs-flow` to the `<ol>`, `cs-node` to the first `<i>` (the dot), `cs-link` to the second `<i>` (the line), and `className="cs-step"` to the text `<span>` that holds `name` and `what`.
6. **Build notes**: as in step 4 for the `<section>`, the span and the `<h3>`. Change the map's arguments to `([k, v], n)` and add `data-reveal="fade" data-delay={String(n * 0.06)}` to each row `<div>`.
7. **Reel**: as in step 4 for the `<section>`, the span and the `<h3>`. Add `data-reveal="fade"` to the image's wrapper `<div>`. Add `width={1280}` and `height={4890}` to the `<img>`.
8. **Footer**: add `data-reveal="fade"` to the "Visit the site" `<a>`, and `data-reveal="fade" data-delay="0.08"` to the "Next" `<a>`. Leave the `<footer>`'s own `border-t rule-d` alone.
9. Save. Make no other edits.

## Boundaries

- Do NOT touch the header (`.cs-in`, `.cs-title`, `.cs-img`) or its tweens.
- Do NOT change any reveal kind's values in `reveal.js`. Only add the `scroller` option.
- Do NOT add `data-reveal` to a `<section>`, the `<ol>`, the `<li>`s or the dialog itself.
- Do NOT remove `data-lenis-prevent` from the panel.
- Do NOT add dependencies.
- If plan 003's keyed wrapper (`<div key={p.id} ref={body}>`) is missing, STOP. Without it, `para`'s SplitText would leave stale paragraph text after Next (the same failure plan 001 fixes for the title).
- If the code does not match the **current** excerpts, STOP and report.

## Verification

- **Mechanical**: `npm run build` passes with no errors. On the main page, the Work, About and Capabilities reveals still play exactly as before, because `revealIn` with one argument behaves the same.
- **Feel check** (dev server, desktop window):
  - Open any study and scroll slowly. Each chapter's hairline draws from the left as it enters. The label fades up and the paragraph rises line by line just after. Nothing appears before you reach it, and nothing waits after you reach it.
  - At the system diagram, the dots light top to bottom with the hairline growing from each dot to the next, about a third of a second per step. It reads as a signal passing down the chain.
  - Build-notes rows arrive one after another, 60 ms apart, not all at once.
  - Drag the scrollbar straight to the bottom. Every element ends visible; nothing is stuck at opacity 0.
  - Click Next: the new study's body reveals again as you scroll it (the triggers are rebuilt per study) and every paragraph shows the new study's text.
  - In the Animations panel at 10% playback, the connectors grow at constant speed and the dots ease out.
  - With `prefers-reduced-motion: reduce`, the whole study is static and fully visible from the first frame, including all hairlines.
- **Done when**: every body element of all four studies reveals on scroll inside the dialog, the system lights in order, reduced motion is static and complete, and the main page's reveals are unchanged.
