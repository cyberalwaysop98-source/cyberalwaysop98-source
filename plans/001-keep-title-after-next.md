# 001 — Keep each case study's own title after "Next"

- **Status**: DONE (2026-11-23)
- **Commit**: no git repository. Written against `src/components/work/CaseStudy.jsx` (259 lines, sha1 `58f5dafb5759…`) on 2026-11-23
- **Severity**: HIGH
- **Category**: Cohesion & tokens (a motion implementation that corrupts content), plus a one-frame flash
- **Estimated scope**: 1 file, about 15 lines

## Problem

The case study dialog animates its big title by splitting it into letters with GSAP `SplitText`. SplitText replaces the children of the `<h2>`, which React rendered. When the reader clicks **Next** at the bottom of a study, React keeps the same `<h2>` and updates a text node that is no longer in the document. The effect cleanup (`ctx.revert()`) then writes back the HTML that SplitText saved, which is the *previous* study's title.

This was verified in headless Chrome at 1440×900. Open `#work/atelier-vance` and click "Next — 02". The dialog's `aria-label` becomes "KISSA 余白 — case study", and the label, image and stack all change to Kissa. The giant heading still reads **ATELIER VANCE**. Clicking Next again still shows "ATELIER VANCE" on the Aura study. All four studies can show the wrong name.

```jsx
// src/components/work/CaseStudy.jsx:97-107 — current
  // content entrance, every time a study is shown
  useEffect(() => {
    if (!shown || !id || reduced) return
    const ctx = gsap.context(() => {
      const split = SplitText.create('.cs-title', { type: 'chars' })
      gsap.from(split.chars, { yPercent: 110, opacity: 0, duration: 1.4, stagger: 0.025, delay: 0.55, ease: 'expo.out' })
      gsap.from('.cs-in', { y: 30, opacity: 0, duration: 1.3, stagger: 0.07, delay: 0.75, ease: 'expo.out' })
      gsap.from('.cs-img', { clipPath: 'inset(0 0 100% 0)', duration: 1.6, delay: 0.9, ease: 'expo.inOut' })
    }, panel)
    return () => ctx.revert()
  }, [shown, id, reduced])
```

```jsx
// src/components/work/CaseStudy.jsx:161 — current
            <h2 className="cs-title display lit mt-6 overflow-hidden">{p.title}</h2>
```

There are two smaller problems in the same block:

1. **One-frame flash.** The entrance runs in `useEffect`, which runs after the browser paints. So the finished title, labels and image are painted once before `gsap.from` hides them. Every other animated component in this repo uses `useGSAP`, which runs as a layout effect before paint.
2. **Double run on a switch.** `id` is in the dependency list. When the hash changes, the entrance first re-runs on the *old* study (`id` is new, `shown` is still old), then again on the new one.

## Target

- The `<h2>` is keyed by the study id, so React replaces the node instead of patching text it no longer owns.
- The entrance uses `useGSAP` with `revertOnUpdate: true` and depends on `[shown, reduced]` only.
- The animation values (delays, durations, eases) do **not** change in this plan.

```jsx
// target — imports (line 2)
import { gsap, SplitText, useGSAP } from '../../lib/motion'
```

```jsx
// target — replaces lines 97-107
  // content entrance, every time a study is shown. useGSAP runs as a layout
  // effect, so the final state is never painted for a frame before it hides.
  useGSAP(
    () => {
      if (!shown || reduced) return
      const split = SplitText.create('.cs-title', { type: 'chars' })
      gsap.from(split.chars, { yPercent: 110, opacity: 0, duration: 1.4, stagger: 0.025, delay: 0.55, ease: 'expo.out' })
      gsap.from('.cs-in', { y: 30, opacity: 0, duration: 1.3, stagger: 0.07, delay: 0.75, ease: 'expo.out' })
      gsap.from('.cs-img', { clipPath: 'inset(0 0 100% 0)', duration: 1.6, delay: 0.9, ease: 'expo.inOut' })
    },
    { scope: panel, dependencies: [shown, reduced], revertOnUpdate: true },
  )
```

```jsx
// target — replaces line 161
            {/* keyed: SplitText rewrites this node's children, so React must
                replace the node rather than patch text it no longer owns */}
            <h2 key={p.id} className="cs-title display lit mt-6 overflow-hidden">{p.title}</h2>
```

## Repo conventions to follow

- Every GSAP import comes from `src/lib/motion.js`, which already exports `useGSAP`: `export { gsap, ScrollTrigger, SplitText, useGSAP }` (motion.js:32). Never import from `gsap` or `@gsap/react` directly.
- Exemplar of `useGSAP` with a scope: `src/components/about/About.jsx:9`, `useGSAP(() => revealIn(root.current), { scope: root })`.
- Comments in this codebase are short and explain *why*, in lower case, in the author's voice (see the comment above `originOf` at CaseStudy.jsx:14).

## Steps

1. In `src/components/work/CaseStudy.jsx` line 2, change `import { gsap, SplitText } from '../../lib/motion'` to `import { gsap, SplitText, useGSAP } from '../../lib/motion'`.
2. Replace the whole `useEffect` block at lines 97-107 (from the comment `// content entrance, every time a study is shown` to `}, [shown, id, reduced])`) with the `useGSAP` block in **Target**. Keep `useEffect` in the React import on line 1, because other effects still use it.
3. Replace line 161 (the `<h2 className="cs-title …">`) with the keyed `<h2 key={p.id} …>` and its comment from **Target**. Do not change its class list.
4. Save. Make no other edits.

## Boundaries

- Do NOT touch the open/switch/close effect (lines 56-95). Plan 002 owns it.
- Do NOT change any delay, duration, ease, stagger or `from` value. Plans 002 and 003 retime them.
- Do NOT touch `src/lib/reveal.js`, `src/lib/motion.js` or any other component.
- Do NOT add dependencies.
- If the code at the cited lines does not match the excerpts above, STOP and report; do not improvise.

## Verification

- **Mechanical**: `npm run build` finishes with no errors. `npx vite` starts and the browser console shows no errors when a study is opened.
- **Feel check** (dev server, desktop window, past the gate screen):
  - Click the first work sheet to open **Atelier Vance**. Scroll to the bottom of the dialog and click **Next — 02**. The giant title reads **KISSA 余白**. Click Next again: **AURA HYPER-GT**. Again: the fourth study's own title. Again: back to **ATELIER VANCE**.
  - In the console after each switch, `document.querySelector('[aria-label$="case study"] .cs-title').textContent` matches the dialog's `aria-label` minus " — case study".
  - In DevTools, open the Animations panel, set playback to 10%, and open a study. The title is never fully visible before its letters start rising; it is hidden from the first painted frame.
  - Turn on `prefers-reduced-motion: reduce` (Rendering panel) and repeat the Next chain. Titles are correct, appear instantly and do not move.
- **Done when**: the four Next clicks show four correct titles, and the build passes.
