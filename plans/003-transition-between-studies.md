# 003 — Give "Next" a transition instead of a cut

- **Status**: DONE (2026-11-23)
- **Commit**: no git repository. Written against `src/components/work/CaseStudy.jsx` (259 lines, sha1 `58f5dafb5759…`) on 2026-11-23, with plans 001 and 002 applied on top
- **Severity**: MEDIUM
- **Category**: Missed opportunity (a state change that teleports); Easing & duration (dead time)
- **Estimated scope**: 1 file, about 40 lines

## Problem

The footer of every study links to the next one ("Next — 02 KISSA 余白", and so on, wrapping from the fourth back to the first). Clicking it changes the hash while the panel stays open. What the reader sees:

1. The study they were reading is replaced in a single frame.
2. The dialog's scroll position jumps from the bottom to the top (`el.scrollTop = 0`) in the same frame. The reader loses their place with no motion to explain it.
3. The new title stays invisible for about 0.3–0.55 s, depending on whether plan 002 has run, before it starts to rise. Those delays were tuned to wait for the clip-path open, which does not run on a switch. Before plan 002, the first letter was measured still at `translateY(122px)` 530 ms after the click.

Current code after plans 001 and 002:

```jsx
// src/components/work/CaseStudy.jsx — the start of the open / switch / close effect (current)
  useEffect(() => {
    const el = panel.current
    if (id) {
      returnFocus.current = returnFocus.current || document.activeElement
      setShown(id)
      lockScroll(true)
      el.scrollTop = 0
      if (phase.current === 'open') {
        // a switch between studies: the panel already covers the page
        closeBtn.current?.focus({ preventScroll: true })
        return
      }
      if (phase.current === 'closed') gsap.set(el, { clipPath: originOf(id) })
```

```jsx
// the start of the close branch in the same effect (current)
    } else if (shown) {
      phase.current = 'closing'
```

```jsx
// the entrance tweens inside useGSAP (current)
      gsap.from(split.chars, { yPercent: 110, opacity: 0, duration: 1.4, stagger: 0.025, delay: 0.3, ease: EASE.out })
      gsap.from('.cs-in', { y: 30, opacity: 0, duration: 1.3, stagger: 0.07, delay: 0.4, ease: EASE.out })
      gsap.from('.cs-img', { clipPath: 'inset(0 0 100% 0)', duration: 1.2, delay: 0.45, ease: EASE.out })
```

```jsx
// the JSX (current): the sticky bar, then header / image / chapters / footer as siblings
      {p && (
        <>
          <div className="sticky top-0 z-10 flex h-[var(--nav-h)] items-center justify-between gap-4 bg-void/80 px-[var(--gutter)] backdrop-blur-md">
            …
          </div>

          <header className="shell pb-12 pt-[10vh]">
            …
            {/* keyed: SplitText rewrites this node's children, so React must
                replace the node rather than patch text it no longer owns */}
            <h2 key={p.id} className="cs-title display lit mt-6 overflow-hidden">{p.title}</h2>
            …
          </header>
          …
          <footer className="shell flex flex-col gap-10 border-t rule-d pb-16 pt-10 md:flex-row md:items-end md:justify-between">
            …
          </footer>
        </>
      )}
```

## Target

When **Next** is clicked while a study is open:

1. Everything except the sticky top bar (header, still, chapters, system, notes, reel, footer) lifts `y: -24` and fades to `autoAlpha: 0` over **0.35 s**, `ease: EASE.soft` (`'power3.out'`).
2. When it is gone, nothing is on screen to jump. Then `scrollTop = 0`, the new study is set, and focus moves to Close. The top bar never moves, so Close stays where the hand is.
3. The new study mounts in a fresh, keyed wrapper (no leftover inline styles). Its entrance starts with a **0.05 s** lead instead of the open's 0.3 s lead: title `0.05`, meta `0.15`, image `0.2`.
4. Clicking Next again during the fade retargets: the fade continues from where it is and lands on the latest study.
5. Escape during the fade cancels the pending swap, so content never changes while the panel is closing.
6. With reduced motion the fade has `duration: 0`: an instant swap, no movement.

```jsx
// target — two refs, added directly under the `phase` ref from plan 002
  const body = useRef(null)
  // how the study on screen arrived: 'open' (out of a sheet) or 'switch' (from another study)
  const arrival = useRef('open')
```

```jsx
// target — replaces the effect lines from `if (id) {` down to and including
// `if (phase.current === 'closed') gsap.set(el, { clipPath: originOf(id) })`
    if (id) {
      returnFocus.current = returnFocus.current || document.activeElement
      lockScroll(true)
      if (phase.current === 'open') {
        // a switch between studies: the one being read steps back and fades,
        // and the next arrives at the top while nothing is on screen to jump
        arrival.current = 'switch'
        gsap.to(body.current, {
          autoAlpha: 0,
          y: -24,
          duration: reduced ? 0 : 0.35,
          ease: EASE.soft,
          overwrite: true,
          onComplete: () => {
            el.scrollTop = 0
            setShown(id)
            closeBtn.current?.focus({ preventScroll: true })
          },
        })
        return
      }
      arrival.current = 'open'
      // a switch cut short by a close can leave the old study half-faded
      if (body.current) gsap.set(body.current, { clearProps: 'opacity,visibility,transform' })
      setShown(id)
      el.scrollTop = 0
      if (phase.current === 'closed') gsap.set(el, { clipPath: originOf(id) })
```

```jsx
// target — the start of the close branch
    } else if (shown) {
      // a pending switch must not swap the study while the panel closes
      if (body.current) gsap.killTweensOf(body.current)
      phase.current = 'closing'
```

```jsx
// target — the entrance tweens inside useGSAP
      const lead = arrival.current === 'switch' ? 0.05 : 0.3
      gsap.from(split.chars, { yPercent: 110, opacity: 0, duration: 1.4, stagger: 0.025, delay: lead, ease: EASE.out })
      gsap.from('.cs-in', { y: 30, opacity: 0, duration: 1.3, stagger: 0.07, delay: lead + 0.1, ease: EASE.out })
      gsap.from('.cs-img', { clipPath: 'inset(0 0 100% 0)', duration: 1.2, delay: lead + 0.15, ease: EASE.out })
```

```jsx
// target — JSX: wrap everything after the sticky bar in one keyed div
      {p && (
        <>
          <div className="sticky top-0 z-10 …">  {/* unchanged */}
            …
          </div>

          {/* keyed: a new study gets a fresh subtree, so no split text or
              inline style from the last one survives the switch */}
          <div key={p.id} ref={body}>
            <header className="shell pb-12 pt-[10vh]">
              …
              <h2 className="cs-title display lit mt-6 overflow-hidden">{p.title}</h2>
              …
            </header>
            {/* the still, the chapters, system, notes and reel: unchanged */}
            …
            <footer className="shell …">  {/* unchanged */}
              …
            </footer>
          </div>
        </>
      )}
```

## Repo conventions to follow

- Curves come from `EASE` in `src/lib/motion.js:18-23`. `EASE.soft` is `'power3.out'`, the house curve for small things, and is right for a short exit. Do not type curve strings by hand.
- Section elements are never transformed (the Stacking Contract in `DESIGN.md`). Here the transform goes on a plain wrapper `div` inside the dialog, never on a `<section>`.
- Retargeting uses `overwrite: true`, as in plan 002's open/close tweens.

## Steps

1. In `src/components/work/CaseStudy.jsx`, add the `body` and `arrival` refs (with the comment) directly under `const phase = useRef('closed')`.
2. In the open / switch / close effect, replace the block from `if (id) {` through the line `if (phase.current === 'closed') gsap.set(el, { clipPath: originOf(id) })` with the target block. Keep everything after that line unchanged (`gsap.set(el, { visibility: 'visible' })`, `phase.current = 'opening'`, the open tween).
3. In the close branch, insert the two target lines (`// a pending switch…` comment and `if (body.current) gsap.killTweensOf(body.current)`) as the first statements after `} else if (shown) {`.
4. In the `useGSAP` entrance block, replace the three `gsap.from(...)` lines with the four target lines (the `const lead = …` line plus three tweens).
5. In the JSX, after the sticky top-bar `<div>` closes, open `<div key={p.id} ref={body}>` with its comment. Close it right after `</footer>`, before the fragment's `</>`. Re-indent the wrapped lines by two spaces.
6. Remove `key={p.id}` and its two-line comment from the `<h2 className="cs-title …">`, since the wrapper's key now replaces the whole subtree. Keep the `<h2>`'s classes as they are.
7. Save. Make no other edits.

## Boundaries

- Do NOT move the sticky top bar into the wrapper. Close must stay in place through a switch.
- Do NOT change the open/close clip tweens or their durations (plan 002 set them).
- Do NOT change the markup inside the wrapped elements. Wrapping and removing the h2 key are the only markup changes.
- Do NOT add dependencies.
- If plan 001 or 002 has not been applied (no `phase` ref, no `useGSAP` entrance), STOP: run them first.
- If the code does not match the **current** excerpts, STOP and report.

## Verification

- **Mechanical**: `npm run build` passes with no errors.
- **Feel check** (dev server, desktop window):
  - Open **Atelier Vance**, scroll to the bottom and click **Next — 02**. The page you were reading lifts slightly and fades, and the scroll jump is never visible. **KISSA 余白** starts rising almost at once and the title is correct. Close stays put and holds keyboard focus.
  - Click Next twice quickly. One smooth fade, landing on the study two ahead, with no flicker of the one in between.
  - Click Next and press Escape during the fade. The panel shrinks back with the old study still in it (half-faded is fine) and never swaps content mid-close. Re-open any study: it is fully opaque.
  - At 10% playback in the Animations panel, the exit is a short ease-out (fast first, settling) and the new title's first letter starts moving within about 50 ms of the swap.
  - Keyboard only: Tab to Next, press Enter, then Tab. Focus moves from Close into the new study, never to the page behind the dialog.
  - With `prefers-reduced-motion: reduce`, Next swaps instantly with no lift and no fade animation, and the title is correct.
- **Done when**: all four Next hops show a visible exit and an immediate entrance, no frame shows a scroll jump, and the build passes.
