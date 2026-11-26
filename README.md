# Anshul Sharma — Creative Developer

Personal portfolio, v4: **Aṃśu** — Sanskrit for *a ray of light*, the root of the name. The site follows one ray from the first frame to the last: it gathers at the gate, ignites in the hero, comes into focus, projects the work, splits into four disciplines and recombines, floods the page into a lit chapter, and condenses back to a point at Contact. See `DESIGN.md` for the full chapter map.

**Stack:** Vite 7 · React 19 · Tailwind CSS v4 · GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG, ScrambleText) · anime.js 4.5 (micro-motion) · Lenis · raw WebGL2 (no 3D library) · Web Audio (synthesised, no files).

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # → dist/
npm run preview   # serve dist/ at http://localhost:4173
```

`package.json` has no lint or test script. The previous version (v3, "The Darkroom") is kept in `_archive/v3-darkroom/`.

## Where things live

| Path | What |
| --- | --- |
| `src/content.js` | **Every word on the site.** Edit this, not the components. |
| `src/App.jsx` | Chapter order, the gate, the lit-chapter wrapper. |
| `src/gl/engine.js` | The stage: one WebGL2 canvas, four passes (light, dust, sheets, veil). `direct()` decides what the light does from scroll position — read it first. |
| `src/gl/targets.js` | The eight shapes the dust morphs between, stored as rows of one float texture. |
| `src/gl/Stage.jsx` | Mounts the stage on GSAP's ticker; quality tiers, context loss, pointer. |
| `src/lib/stage.js` | Shared state the page writes and the stage reads every frame (no React renders). |
| `src/lib/motion.js` | GSAP registration and the house eases. |
| `src/lib/reveal.js` | Declarative entrances: `data-reveal="lines|chars|para|focus|fade|rule|draw|scramble|pixels"`. |
| `src/lib/kinetic.js` | Kinetic type: velocity skew (`data-skew`) and cursor proximity (letters lift, or gain weight on Geist's variable axis). |
| `src/components/ui/` | `Roll` (letters roll on hover), `Marquee` (velocity bands), `RingText` (rotating captions), `SectionHead`, `Cursor`, `Magnetic`. |
| `src/lib/soundscape.js` | The sound, click-only: a tock for links and buttons (pitched by screen position), a sweep for the menu, a chime for copy. Nothing in the background. Takes start times so it renders offline. |
| `src/lib/sound.js` | Owns the AudioContext and on/off; one pointerdown listener plays the press sound (controls with `data-sound` play their own). Off unless chosen. |
| `src/components/gate/` | The preloader: real load progress → the dust gathers into a ring → "how would you like to meet me?" |
| `src/components/work/` | `Work` (WebGL sheets + index), `CaseStudy` (dialog at `#work/<id>`). |
| `src/components/method/` | `</>` → *Aa* → wave → sphere → one point → the flood. |
| `src/components/iris/` | The lit chapter condensing into a point; the statement is readable only inside the light. |
| `public/work/<id>-{800,1600}.webp` | Stills of the live projects — the sheets' textures. |
| `public/work/<id>-reel.webp` | Six frames captured while scrolling each live site; plays on the sheet on hover, and in full in the case study. |

Page order: Gate → Hero → Intro → Work → Method → *(lit)* Capabilities → Lab → About → Experience → Statement → Contact → Footer.

## Rules this codebase keeps

- **Nothing invented.** Titles and dates come from `resume.pdf`; stacks and sizes from the live bundles. On-page numbers (bytes received at the gate, point count in Method, the footer colophon) are measured in the browser.
- **Two engines, one boundary.** GSAP owns everything driven by scroll and all type; anime.js v4 (`src/lib/micro.js`) owns only the brand mark, the drawn icons and small control responses (springs, drawn strokes, bursts). Scroll scenes are CSS `position: sticky` with ScrollTrigger reading progress — nothing hijacks the scroll. Lenis runs first on GSAP's ticker; the stage renders after it in the same frame.
- **The stacking contract.** The stage canvas is `z-index: 1`; section backgrounds paint below it, section content sits in `.layer` (`z-index: 2`) above it. Never put `transform`, `opacity` or `filter` on a section element itself.
- **Reduced motion is a real path.** No gate, no Lenis, no stage; the hero shows `.still-light`, sheets are plain `<img>`, Method is a static list, every reveal starts in its final state.
- **Every frame fits the display.** The stage learns the real refresh interval (120/144/60 Hz) and, if frames start overrunning it, lowers its resolution and then its point count — and earns them back with headroom. All smoothing is time-based, so motion feels identical at any refresh rate. Type that moves gets its own GPU layer; no animated element carries a wide text-shadow or a full-screen blend mode (each one re-paints or re-reads the frame). Images decode off the main thread and upload in idle time; reels upload in strips.
- **Nothing runs unseen.** The stage idles while a case study covers it and when the tab is hidden, skips passes that draw nothing, and lowers its resolution if frames run long. Lab loops stop off-screen.
- **No 3D library, one bundle.** Don't add Three.js; don't add `manualChunks`.
- **Case studies are linkable:** `#work/<project id>` opens one; closing clears the hash and keeps your place.

## Adding a project

1. Add an entry to `projects` in `src/content.js` (copy an existing one). Layouts cycle every four.
2. Capture the live site at 1600 × 1000 → `public/work/<id>-1600.webp` and `-800.webp`; six 1280 × 800 scroll frames stacked with an 18px gap → `<id>-reel.webp`.
3. List only stack items and numbers you can verify in the shipped bundle.
4. Optional: for a build with one signature moment, add `sequence` (label, alt, four `[name, what]` steps) and four frames of it in a 2 × 2 grid → `public/work/<id>-sequence.webp` (1600 × 1000). The case study shows it between the build notes and the reel; without `sequence` nothing changes.

## Deploying

`npm run build` produces a static site in `dist/`. Set the production domain once it exists:

```sh
SITE_URL=https://your-domain.example npm run build
```

That adds canonical + `og:url`, absolute social image URLs, and `sitemap.xml`. Unset, none of that is emitted. See `.env.example`.
