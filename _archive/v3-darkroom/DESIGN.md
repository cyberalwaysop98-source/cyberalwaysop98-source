---
name: Anshul Sharma — Creative Developer
description: A darkroom for interactive work — near-black ground, one signal ember, type and motion carrying the weight.
colors:
  ink: "#0a0a0b"
  ink-raised: "#101013"
  paper: "#ede9e3"
  paper-dim: "#8e8b86"
  paper-faint: "#7c7973"
  signal-ember: "#ff4a1c"
  hairline: "#23232a"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 11vw, 12rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.04em"
    fontVariation: "'wdth' 112"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7.5vw, 7rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.04em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 2.4vw, 2rem)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.045em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.05rem, 1.5vw, 1.5rem)"
    fontWeight: 420
    lineHeight: 1.5
    letterSpacing: "-0.011em"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.22em"
  index:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.2
    fontFeature: "'tnum'"
  control:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.14em"
  wordmark:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "-0.01em"
  meta:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 420
    lineHeight: 1.55
    letterSpacing: "0.005em"
  accent:
    fontFamily: "Bodoni Moda, ui-serif, Didot, Georgia, serif"
    fontSize: "clamp(1.75rem, 5vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.015em"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  gutter: "clamp(1.25rem, 4.5vw, 5.5rem)"
  section: "clamp(7rem, 10vw, 10rem)"
  container: "1680px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.signal-ember}"
    textColor: "{colors.paper}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    typography: "{typography.label}"
  button-ghost-hover:
    textColor: "{colors.signal-ember}"
  nav-link:
    textColor: "{colors.paper-dim}"
    typography: "{typography.label}"
    padding: "8px 12px"
  nav-link-active:
    textColor: "{colors.paper}"
  tag:
    textColor: "{colors.paper-dim}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  plate:
    backgroundColor: "{colors.ink-raised}"
    rounded: "{rounded.none}"
---

# Design System: Anshul Sharma — Creative Developer

## Overview

**Creative North Star: "The Darkroom"**

This system behaves like a room with the lights off and one safelight burning. Nothing is lit by default. Content does not appear — it *develops*: type rises out of masked containers, sections resolve as you approach them, and a slow atmospheric bloom drifts behind everything like light leaking onto paper. The near-black ground is not "dark mode" applied to a light design; it is the darkroom itself, and every visual decision assumes the viewer's eye has adjusted to it.

Density is deliberately low and the type is deliberately enormous. Horizontal hairlines do the structural work that boxes and cards do in other systems, so the page reads as one continuous document rather than a stack of containers. Colour is rationed to the point of scarcity: a single warm accent, appearing on a few percent of any screen, marks what is live, indexed, or active — and nothing else.

Surfaces have weight. Buttons pull toward the cursor and presses register. The interface is quiet but not inert; it responds like something with mass.

**Key Characteristics:**
- Near-black ground (`#0a0a0b`) with warm off-white type — never pure black on pure white
- Exactly one accent, used as punctuation rather than decoration
- Extreme weight contrast: 800 display against 420 body
- Zero shadows; depth comes from atmosphere, grain, and hairlines
- Radius is binary — square or fully round, nothing between
- Motion is the primary means of revealing content

## Colors

A monochrome darkroom palette of warm-neutral greys on near-black, interrupted by one hot signal.

### Primary
- **Signal Ember** (`#ff4a1c`): The only chromatic colour in the system. Reserved for state and indexing — the availability pulse, section numbers, the active nav underline, the timeline's progress and current marker, the hovered technology, and the emotive serif line in the hero. It never fills a large area, and it is never used for decoration or for a second purpose within one component.

### Neutral
- **Ink** (`#0a0a0b`): The room. Page ground everywhere, and the text colour on inverted (paper-filled) surfaces.
- **Raised Ink** (`#101013`): Barely-lifted surface for project plates. The only surface tone above the ground, and it is distinguishable more by its hairline border than by its fill.
- **Paper** (`#ede9e3`): Warm off-white. Headlines, primary copy, and the fill of the primary button. The warmth matters — a cold white would break the safelight logic.
- **Dim Paper** (`#8e8b86`): Supporting copy, lede paragraphs, inactive navigation, eyebrow labels. 5.83:1 on ink.
- **Faint Paper** (`#7c7973`): Metadata, handles, unfilled fields, timestamps. The quietest text permitted. 4.56:1 on ink — the floor, not a suggestion.
- **Hairline** (`#23232a`): Every divider, border, and section rule. Structural, never decorative.

### Named Rules

**The One Light Rule.** Signal Ember occupies under 10% of any viewport, and never more than one *role* within a single component. If a component already uses ember for its index number, its hover state must find another way to speak.

**The Warm Neutral Rule.** Every grey in this system carries warmth (hue ~40–60°). A neutral or cool grey introduced into this palette reads as a bug, not a variation.

**The Contrast Floor Rule.** No text colour ships below 4.5:1 against ink. `#7c7973` is the darkest text tone that exists; anything quieter must be solved with size, weight, or position instead of colour. This audience tests it.

## Typography

**Display Font:** Archivo (with `ui-sans-serif`, `system-ui` fallbacks)
**Body Font:** Archivo — same family, opposite end of its axes
**Accent Font:** Bodoni Moda, italic only (with `ui-serif`, Didot, Georgia)
**Label/Mono Font:** JetBrains Mono

**Character:** One variable grotesque does nearly all the work, stretched to 112% width and 800 weight for display and dropped to 420 for body — the hierarchy is carried by the axes of a single face rather than by a fashionable pairing. Against that, a high-contrast didone italic appears rarely and only for emotive phrases, and a technical mono handles every label and number. The effect is a wide, confident masthead voice answered by something delicate and something mechanical.

### Hierarchy
- **Display** (800, `clamp(3rem, 11vw, 12rem)`, 0.88, `wdth 112`): Hero statement only. One per page.
- **Headline** (800, `clamp(2.5rem, 7.5vw, 7rem)`, 0.88, `wdth 112`): Section openers and case-study titles.
- **Title** (600, `clamp(1.35rem, 2.4vw, 2rem)`, 0.92): Capability names, list items, sub-headings.
- **Body** (420, `clamp(1.05rem, 1.5vw, 1.5rem)`, 1.5): Lede and running copy. Hold to 46–58ch.
- **Accent** (Bodoni Moda italic, 500, `clamp(1.75rem, 5vw, 4.5rem)`): Emotive fragments in ember.

Below body, exactly three sizes carry every remaining job:

- **Label** (mono, 400, `11px`, `0.22em`, uppercase): Section eyebrows, tags, status, the notation mark. Tracking flexes 0.14–0.22em by context; the size never moves.
- **Index** (mono, 400, `11px`, tabular figures): Numbers, years, handles — anything enumerated or measured. Same size as Label, no tracking, because a number is not a label.
- **Control** (500, `12px`, `0.14em`, uppercase): Nav links and buttons. One weight step above body, which small uppercase text needs on this ground.
- **Wordmark** (600, `14px`, `-0.01em`, uppercase): The name. One role, one size, both places it appears.
- **Meta** (420, `14px`, 1.55, `+0.005em`): Small prose and metadata. The positive tracking and extra leading are dark-surface compensation, not decoration.

### Named Rules

**The 460 Rule.** The gap between display weight (800) and body weight (420) is the hierarchy. Never close it by reaching for a middle weight — 500 and 600 exist only for titles, and nothing else in the system may use them.

**The Serif Speaks Once Rule.** Bodoni Moda appears at most once per viewport, always italic, always in ember, always for a phrase with feeling in it. A second italic serif line in view means one of them is decoration.

**The Floor Rule.** Body weight sits at 420 (raised from 340 at the owner's request: 340 read too thin). Hairline weights (100–200) bloom and disintegrate on a near-black ground; this floor is a legibility constraint, not a stylistic preference.

**The Three Steps Rule.** Below body there are exactly three sizes — 11px, 12px, 14px — and every label, control, number and metadata string on the site uses one of them. Reaching for a fourth means the job wasn't identified, not that the scale was short. This replaced seven ad-hoc values living in a 6px range; a literal `text-[13px]` anywhere is drift, not nuance.

## Layout

A single centred column, max `1680px`, with fluid gutters of `clamp(1.25rem, 4.5vw, 5.5rem)`. Sections breathe at `clamp(7rem, 10vw, 10rem)` vertically — generous to the point of feeling empty on a laptop, which is intentional.

Within sections, a 12-column grid appears for editorial splits: a label column at columns 1–3 and content at 5–12, producing a wide indent that reads as a margin note against body text. Lists are full-bleed rows divided by hairlines, never cards in a grid.

Responsive behaviour is a change of strategy, not a scale-down. Above `768px`: hover-driven previews, magnetic CTAs, sticky readouts, and multi-column editorial splits. Below it: single column, inline visuals in place of hover previews, full-screen navigation, and the custom cursor removed entirely. The 2D drag control becomes single-axis on coarse pointers so vertical scrolling always survives.

**The Hairline Rule.** Structure is expressed with 1px rules at `#23232a`, never with boxes, fills, or shadows. If a region needs separating, it gets a line above it.

## Elevation & Depth

**This system has no shadows.** Not subtle ones — none. `box-shadow` does not appear anywhere in it, and adding one would break the world: light in a darkroom comes from a single source and does not cast crisp UI drop-shadows.

Depth is built from four layers instead:

1. **Atmosphere — the projector** — one fbm fragment shader on raw WebGL, fixed behind the whole page and re-lit per chapter: fog and a lit floor for the title card, a beam from an off-screen lamp onto whichever reel is playing (tinted with that project's accent), a single low point of light for Contact. A seven-blade iris opens it after the preloader; fast scrolling adds film flicker and a stray scratch. Full quality on desktop, a lighter tier on tablets, low resolution at 30 fps on phones, a still gradient under reduced motion.
2. **Grain** — an animated film-grain overlay at 4.8% opacity across the entire page, with a radial vignette beneath it.
3. **Tonal separation** — `#101013` plates against the `#0a0a0b` ground, a difference of a few percent, made legible by their hairline borders.
4. **Motion parallax** — foreground type and background atmosphere move at different rates on scroll.

**The No-Shadow Rule.** Depth is atmospheric, never cast. A new component that feels flat needs a hairline, a tonal step, or a parallax offset — not a shadow.

## Shapes

Corner radius is binary: `0px` or fully round. Plates, images, section rules, and the grid are hard-edged and square. Buttons, tags, status dots, the cursor, and the drag control are perfect pills or circles. Nothing in the system uses an intermediate radius.

The resulting form language reads as *instrument plus paper*: rectangular editorial surfaces with circular controls placed on them. Borders are always exactly 1px and always hairline-coloured; the system has no thick borders, no double rules, and no dashed strokes.

**The No Middle Radius Rule.** `0` or `9999px`. An 8px or 12px radius anywhere in this system is a defect — it is the single most reliable tell of a generic template, and this design's whole claim is not being one.

## Components

### Buttons
- **Shape:** Full pill (`9999px`), never square.
- **Primary:** Paper fill, ink text, `12px 24px`, mono label at `0.16em` uppercase tracking. On hover it fills with Signal Ember and the text flips to paper — the accent arrives *on interaction*, never at rest.
- **Ghost:** Transparent with a hairline border and paper text. On hover both border and text become ember.
- **Physicality:** CTAs sit inside a magnetic wrapper that translates them toward the cursor (35% of offset, soft spring) on fine pointers, and is inert on touch. Transitions run 500ms on colour.
- **Focus:** 2px Signal Ember outline at 3px offset, applied globally via `:focus-visible`.

### Chips / Tags
- **Style:** Hairline border, transparent fill, dim-paper mono text at `0.14em` uppercase, `4px 12px`, full pill.
- **State:** Static. Tags are metadata, not controls — they do not hover or select.

### Cards / Containers
There are no cards. The closest object is the **plate**: a square, hairline-bordered surface at `#101013` holding a screenshot of the live project. It develops on first view: desaturated and blurred, with a paper wash draining from the centre.

### Navigation
- **Style:** Fixed bar, 68px tall, transparent over the hero and shifting to `72%` ink with a 20px backdrop blur past 40px of scroll.
- **States:** Dim paper at rest, paper on hover and when active, with an ember underline that scales in from the left on the active section.
- **Behaviour:** Hides on scroll-down past 600px, returns immediately on scroll-up, and never hides while the menu is open.
- **Mobile:** A full-screen clip-path panel, bottom-aligned, with numbered links at `13vw` staggering in at 70ms intervals.

### Signature: The Projector
The Work section is lit by whichever project is active: a radial field in that project's own accent, the row's top rule drawn in the same colour, and — on desktop — a real screenshot of the live site developing in a floating frame. Pointer hover and keyboard focus drive it identically; on touch, the project crossing the middle of the screen takes the light. It is never needed to understand a project: every row carries its title, concept, metadata and (on small screens) its screenshot inline.

### Signature: The Notation
One recurring mark in the owner's initials: `AS—B01 / 3D · Editorial` for builds, `AS—E001` for Lab studies, `AS—V2 / This site` in the footer. JetBrains Mono, 11px, faint paper, one ember slash. It appears on builds, experiments, the case-study bar and the footer — nowhere else.

### The Colophon
The footer reports what the visit actually cost, read from the browser when the footer is reached: all JavaScript transferred, the quality tier the projector shader is rendering at on this device, and the images of the work fetched. No hardcoded numbers exist to go stale.

### Case study: the build log
Overview / Problem / Approach / Build / Result. Build carries measured notes (sizes read from the live bundles) and a System diagram — one hairline, one ember-ringed node per system, in order of data flow.

### The Lab
Four small live studies. Canvas loops run only while on screen and paint a single still frame under reduced motion; colour stays inside the ember family.

## Motion

One engine: Motion (`motion/react`, loaded as `LazyMotion` + `domAnimation`), with Lenis for wheel smoothing. GSAP was removed in v2 — every scroll-scrubbed effect (the pinned Statement, the Experience line) is CSS `position: sticky` plus `useScroll`, so nothing hijacks scrolling. Tokens live in `src/lib/motion.js`: micro 220ms, UI 450ms, section 900ms, cinematic 1500ms; expo-out for entrances, quart in-out between states. `MotionConfig reducedMotion="user"` applies the OS setting everywhere at once.

### Motion additions (v3)

- **Reels.** Each build in Work is a pinned scene (CSS sticky, `h-[175vh]`, desktop ≥1024px only): a shutter opens on the screen as it arrives, the film strip scrubs through six real frames of the live site, perforations run with it, and an outlined title drifts on a second plane. Phones, tablets and reduced motion get a still card instead.
- **Case study from the screen.** Opening a reel expands the dialog out of that screen's own rectangle (clip-path inset), and closing returns into it.
- **The print.** About is the one chapter on paper: a sheet opens out of the section's top edge like an aperture, and the heading develops word by word with the reader's scroll (`ScrubText`). Paper tokens: `ink-soft`, `ember-deep`, `line-paper`.
- **Credits.** Capabilities set as film credits with dotted leaders; Experience's year rolls like a camera frame counter (`Odometer`); a burnt-in timecode (`Timecode`) shows scene and running time, desktop only.
- **Labels.** Nav labels re-develop on hover (`Scramble`), keeping their accessible names.

## Do's and Don'ts

### Do:
- **Do** reveal content with masked type — an `overflow: hidden` wrapper with the text sliding from `110%` at expo-out. This is the system's signature entrance.
- **Do** separate regions with a 1px `#23232a` rule and generous space above it.
- **Do** keep the accent under 10% of any viewport, and let colour arrive on interaction rather than at rest.
- **Do** animate `transform` and `opacity` only. `scaleX` a progress bar; never animate its `width`.
- **Do** show real work only: screenshots of live builds, stacks checked against shipped bundles.
- **Do** disable the WebGL layer, parallax and scroll choreography under `prefers-reduced-motion`, keeping the site entirely usable.

### Don't:
- **Don't** add a shadow. Depth is atmospheric here.
- **Don't** use an intermediate corner radius. Square or pill.
- **Don't** introduce a second accent colour, or use ember for two roles in one component.
- **Don't** reach for weights 400–500 in body copy — the 420/800 gap is the hierarchy.
- **Don't** put a second Bodoni Moda italic line in the same viewport.
- **Don't** build a card grid. This system uses full-bleed rows divided by hairlines.
- **Don't** use a cold or neutral grey; every neutral here is warm.
