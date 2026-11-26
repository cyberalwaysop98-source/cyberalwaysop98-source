# Anshul Sharma — Creative Developer

Personal portfolio. A single-page React app: editorial layout, a raw-WebGL hero, four case studies, a small Lab.

**Stack:** Vite 7 · React 19 · Tailwind CSS v4 · Motion (`LazyMotion`) · Lenis · raw WebGL (no 3D library).

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # → dist/
npm run preview   # serve dist/ at http://localhost:4173
```

`package.json` has no lint or test script.

## Where things live

| Path | What |
| --- | --- |
| `src/content.js` | **Every word on the site** — projects, Lab, capabilities, experience, contact. Edit this, not the components. |
| `src/App.jsx` | Section order, global `LazyMotion` + `MotionConfig reducedMotion="user"`. |
| `src/components/projector/Projector.jsx` | The page-wide light: one GLSL fragment shader on raw WebGL, fixed behind every section, re-lit per chapter (fog, beam, end-credits point), with the opening iris, scroll-speed flicker, desktop / tablet / phone tiers and a still-gradient fallback. |
| `src/lib/projector.js` | Shared projector state that sections write (tint, focus, covered, iris) and the canvas reads each frame — no React renders. |
| `src/components/projects/` | `Work` (featured build + the "projector" index), `Plate` (screenshots), `CaseStudy` (dialog, build log). |
| `src/components/ui/Notation.jsx` | The `AS—B01 / 3D · Editorial` signature mark. |
| `src/lib/hooks.js` | Media queries, Lenis smooth scroll, scroll lock, `scrollToId`, active-section observer, clock. |
| `src/lib/motion.js` | Motion tokens: durations, easings, springs. |
| `src/index.css` | Design tokens (`@theme`) and type utilities. See `DESIGN.md`. |
| `public/work/<id>-{800,1600}.webp` | Screenshots of the live projects, named after each project `id`. |
| `public/work/<id>-reel.webp` | Six 1280 × 800 frames captured while scrolling each live site, stacked with an 18px gap — the film strip each Work reel plays. |
| `public/og.png` | 1200 × 630 social preview. |
| `public/resume.pdf` | Linked from the nav and Contact. Authoritative for titles and dates. City only — no street address. |
| `vite.config.js` | Build config and the `SITE_URL` domain switch. |

Page order: Hero → Work → Lab → Capabilities → About → Experience → Statement → Contact → Footer.

## Rules this codebase keeps

- **Nothing invented.** Titles and dates come from `resume.pdf`. Project stacks and sizes were read from the live bundles; update them only from the same kind of evidence. "Shipped in" lists are derived from project stacks.
- **One animation engine.** Motion via `LazyMotion` — write `m.div`, not `motion.div` (strict mode throws). Scroll-scrubbed effects use `position: sticky` + `useScroll`; nothing hijacks scrolling.
- **Reduced motion is global.** `MotionConfig` handles Motion; the projector is replaced by a still gradient; Work reels, the paper iris and read-along text render their final state; Lab canvases paint a single frame.
- **Nothing runs unseen.** The projector stops with the tab and while a case study covers the screen; Lab loops stop off-screen; WebGL resources are released on unmount.
- **One JavaScript bundle, no 3D library.** Don't reintroduce Three.js for the hero, and don't add `manualChunks` — a manual vendor chunk once turned a lazy chunk into a static preload.
- **Case studies are linkable:** `#work/<project id>` opens one; closing always returns to the site.

## Adding a project

1. Add an entry to `projects` in `src/content.js` (copy an existing one; the first entry is featured).
2. Capture the live site at 1600 × 1000 and save `public/work/<id>-1600.webp` and `<id>-800.webp`.
3. List only stack items and numbers you can verify in the shipped bundle.

## Deploying

`npm run build` produces a static site in `dist/` — any static host works.

**Domain:** there is no confirmed production domain yet (`anshulsharma.dev` belongs to someone else). When one exists, set a single variable at build time:

```sh
SITE_URL=https://your-domain.example npm run build
```

That adds `<link rel="canonical">` and `og:url`, makes the OG/Twitter image URLs absolute, adds `url` to the Person and WebSite schema, and writes `sitemap.xml` plus a `Sitemap:` line in `robots.txt`. Unset, none of that is emitted. See `.env.example`.
