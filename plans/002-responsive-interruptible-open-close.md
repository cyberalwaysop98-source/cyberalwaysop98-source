# 002 — Make the case study open on the click, and survive being closed mid-open

- **Status**: DONE (2026-11-23), with one deviation, below
- **Deviation from the steps**: the target's `gsap.set(el, { clipPath: originOf(id) })` followed by `gsap.to(el, { clipPath: … })` makes GSAP read the start value back from the element. Chrome shortens `inset(48% 30% 48% 30%)` to `inset(48% 30%)`, and GSAP does not expand that two-value form, so in testing the bottom and left edges jumped to 0. This happened when opening from the centred slit (Index links and deep links) and when turning round mid-close. As shipped, `originOf` returns `{ t, r, b, l }` in px, a `clip` ref holds the current four numbers, and both tweens animate that object with `onUpdate: drawClip` writing `inset(t r b l)`. The phase logic, eases, durations and `overwrite: true` are as planned.
- **Commit**: no git repository. Written against `src/components/work/CaseStudy.jsx` (259 lines, sha1 `58f5dafb5759…`) on 2026-11-23, with plan 001 applied on top
- **Severity**: HIGH (interruption bug) + MEDIUM (easing and duration)
- **Category**: Interruptibility; Easing & duration
- **Estimated scope**: 1 file, about 45 lines changed

## Problem

The dialog grows out of the clicked work sheet using a GSAP `clipPath` tween. The open/close effect has two faults.

### A. Closing during the open freezes the page's light (verified)

```jsx
// src/components/work/CaseStudy.jsx:56-95 — current
  // open / switch / close
  useEffect(() => {
    const el = panel.current
    if (id) {
      returnFocus.current = returnFocus.current || document.activeElement
      setShown(id)
      lockScroll(true)
      gsap.killTweensOf(el)
      gsap.set(el, { visibility: 'visible' })
      gsap.fromTo(
        el,
        { clipPath: shown ? 'inset(0px 0px 0px 0px)' : originOf(id) },
        {
          clipPath: 'inset(0px 0px 0px 0px)',
          duration: reduced ? 0 : 1.25,
          ease: 'power4.inOut',
          onComplete: () => {
            stage.covered = true
            closeBtn.current?.focus({ preventScroll: true })
          },
        },
      )
      el.scrollTop = 0
    } else if (shown) {
      stage.covered = false
      lockScroll(false)
      gsap.to(el, {
        clipPath: originOf(shown),
        duration: reduced ? 0 : 1,
        ease: 'power4.inOut',
        onComplete: () => {
          gsap.set(el, { visibility: 'hidden' })
          setShown(null)
          returnFocus.current?.focus?.({ preventScroll: true })
          returnFocus.current = null
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
```

The close branch does not stop the open tween. GSAP's default `overwrite` is `false`, so both tweens keep running. When the open tween finishes, its `onComplete` sets `stage.covered = true` after the close has started. `src/gl/engine.js:702` begins `if (destroyed || stage.covered || document.hidden) return`, so the WebGL light behind the whole site stops drawing until another case study is opened and closed. The same `onComplete` also moves focus to the Close button of a dialog that is closing.

To reproduce: open a study, then press Escape (or browser Back) within 1.25 s. In headless Chrome, Escape at 400 ms left `stage.covered === true` after everything settled. After a normal open and close it is `false`.

The reverse also misbehaves. Re-opening while the close is running calls `killTweensOf`, so the close's `onComplete` never runs and `shown` is still set. The `fromTo` then starts at `inset(0px 0px 0px 0px)`, and the half-closed panel snaps to full screen in one frame.

### B. The click looks ignored for about a third of a second

The open is `power4.inOut` over 1.25 s. An in-out curve starts slowly, so the growing panel covers:

- 0.03% of the distance at 100 ms
- 1.3% at 250 ms
- 6.5% at 375 ms

For about 300 ms after the click nothing visibly happens. The entrance then waits more: the title waits 0.55 s, the meta 0.75 s, and the still image waits 0.9 s before a 1.6 s `expo.inOut` wipe, which also starts slowly. Together the open runs for about 2.5 s. The close is a 1 s `power4.inOut` (current entrance code from plan 001):

```jsx
// src/components/work/CaseStudy.jsx — entrance after plan 001 (current)
      gsap.from(split.chars, { yPercent: 110, opacity: 0, duration: 1.4, stagger: 0.025, delay: 0.55, ease: 'expo.out' })
      gsap.from('.cs-in', { y: 30, opacity: 0, duration: 1.3, stagger: 0.07, delay: 0.75, ease: 'expo.out' })
      gsap.from('.cs-img', { clipPath: 'inset(0 0 100% 0)', duration: 1.6, delay: 0.9, ease: 'expo.inOut' })
```

Things entering or leaving the screen should ease **out**: fast at the start, settling at the end. The repo's entrance curve is `EASE.out` = `'expo.out'` (`src/lib/motion.js:19`, the GSAP twin of the CSS token `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`).

With `expo.out` over 0.9 s the panel is 54% open at 100 ms and 90% open at 300 ms, then takes 600 ms to settle. It responds at once and keeps its long, filmic landing.

## Target

- A `phase` ref tracks the panel: `'closed' | 'opening' | 'open' | 'closing'`.
- Both tweens use `overwrite: true`. A new tween kills the old one, so a cancelled tween's `onComplete` never fires, and the new tween starts from wherever the clip currently is.
- The clip is set to the sheet's rectangle **only** when the panel is fully closed. A re-open during a close turns around from where it is.
- **Open**: `duration: 0.9`, `ease: EASE.out`. **Close**: `duration: 0.6`, `ease: EASE.out`. Reduced motion stays `0` for both.
- Switching between studies while the panel is open runs no clip tween and moves focus to Close straight away.
- Entrance delays follow the faster open: title `0.3`, meta `0.4`, image `0.45` with `duration: 1.2` and `ease: EASE.out`.

```jsx
// target — imports (line 2, after plan 001)
import { gsap, SplitText, useGSAP, EASE } from '../../lib/motion'
```

```jsx
// target — add directly under `const returnFocus = useRef(null)`
  // where the panel is: 'closed' → 'opening' → 'open' → 'closing' → 'closed'
  const phase = useRef('closed')
```

```jsx
// target — replaces the whole open / switch / close effect
  // open / switch / close. Each tween overwrites the last, so a close during
  // the open (or an open during the close) turns round from wherever the
  // panel is, and a cancelled tween's onComplete never runs.
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
      gsap.set(el, { visibility: 'visible' })
      phase.current = 'opening'
      gsap.to(el, {
        clipPath: 'inset(0px 0px 0px 0px)',
        duration: reduced ? 0 : 0.9,
        ease: EASE.out,
        overwrite: true,
        onComplete: () => {
          phase.current = 'open'
          stage.covered = true
          closeBtn.current?.focus({ preventScroll: true })
        },
      })
    } else if (shown) {
      phase.current = 'closing'
      stage.covered = false
      lockScroll(false)
      gsap.to(el, {
        clipPath: originOf(shown),
        duration: reduced ? 0 : 0.6,
        ease: EASE.out,
        overwrite: true,
        onComplete: () => {
          phase.current = 'closed'
          gsap.set(el, { visibility: 'hidden' })
          setShown(null)
          returnFocus.current?.focus?.({ preventScroll: true })
          returnFocus.current = null
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
```

```jsx
// target — the three entrance tweens inside the useGSAP block from plan 001
      gsap.from(split.chars, { yPercent: 110, opacity: 0, duration: 1.4, stagger: 0.025, delay: 0.3, ease: EASE.out })
      gsap.from('.cs-in', { y: 30, opacity: 0, duration: 1.3, stagger: 0.07, delay: 0.4, ease: EASE.out })
      gsap.from('.cs-img', { clipPath: 'inset(0 0 100% 0)', duration: 1.2, delay: 0.45, ease: EASE.out })
```

## Repo conventions to follow

- The house curves live in `src/lib/motion.js:18-23` as `EASE = { out: 'expo.out', inOut: 'power4.inOut', soft: 'power3.out', in: 'power3.in' }`. Use `EASE.out`; do not type `'expo.out'` again, and do not add a new curve.
- `overwrite: true` is the GSAP way to retarget. An exemplar of overwriting in this repo is `src/components/work/Work.jsx:145-147` (`overwrite: 'auto'` on the index preview). Here use `true`, because the old tween's callbacks must die with it, not just its overlapping properties.
- `stage.covered` is the only switch that idles the WebGL stage (`src/lib/stage.js:21`). It must be `true` only while the panel fully covers the page.

## Steps

1. In `src/components/work/CaseStudy.jsx` line 2, add `EASE` to the import from `'../../lib/motion'` so it reads `import { gsap, SplitText, useGSAP, EASE } from '../../lib/motion'`.
2. Directly under `const returnFocus = useRef(null)`, add the `phase` ref and its comment from **Target**.
3. Replace the whole effect that starts with the comment `// open / switch / close` and ends with `}, [id])` with the target effect above. It contains no `gsap.killTweensOf` and no `gsap.fromTo`.
4. In the `useGSAP` entrance block (added by plan 001), replace the three `gsap.from(...)` lines with the three target lines. Do not change the `SplitText.create` line or the `useGSAP` options.
5. Save. Make no other edits.

## Boundaries

- Do NOT change `originOf`, the markup, the keyboard/focus-trap effect, or `close()`.
- Do NOT touch `src/gl/engine.js`, `src/lib/stage.js` or `src/lib/motion.js`.
- Do NOT add a CustomEase or any new curve. Use `EASE.out`.
- Do NOT add dependencies.
- If plan 001 has not been applied (the entrance is still a `useEffect` with `gsap.context`), STOP: run 001 first.
- If the effect does not match the **current** excerpt, STOP and report.

## Verification

- **Mechanical**: `npm run build` passes with no errors.
- **Interruption check** (dev server via `npx vite`, past the gate screen, DevTools console). Paste:
  ```js
  const { stage } = await import('/src/lib/stage.js')
  location.hash = 'work/aura'
  await new Promise((r) => setTimeout(r, 400))
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  await new Promise((r) => setTimeout(r, 2000))
  console.log('covered after mid-open Escape:', stage.covered)
  ```
  Before this plan it prints `true`. After it, it must print `false`, and the light behind the page keeps moving.
- **Feel check**:
  - Click a work sheet. The panel visibly starts growing out of the sheet in the same instant as the click, with no perceptible wait, and settles smoothly at full screen.
  - Press Escape. The panel shrinks back into the same sheet quickly, and focus lands on that sheet's button.
  - Click a sheet, press Escape at once, then click the same sheet again before the panel has closed. The panel turns around from where it is and grows again, with no jump to full screen and no flash.
  - Open a study and scroll the dialog. The title starts rising while the panel is still settling, and the still image wipes down soon after, not seconds later.
  - In the Animations panel at 10% playback, the open curve rises steeply at the start and eases into the end, never slow-then-fast.
  - With `prefers-reduced-motion: reduce`, open and close are instant and nothing moves; focus behaves the same.
  - If the 0.6 s close reads as a snap rather than a return, raise it to `0.75` and change nothing else.
- **Done when**: the console check prints `false`, the re-open-during-close case never jumps, and the build passes.
