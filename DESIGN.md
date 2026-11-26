---
name: Anshul Sharma — Creative Developer
description: "Aṃśu — a ray of light, followed through the page. Void for the dark chapters, bone for the one lit chapter, a single flare."
colors:
  flare: "#ff5a1f"
  void: "#09090b"
  void-2: "#111114"
  light: "#f2f0eb"
  light-dim: "#8f8d87"
  bone: "#e8e6e0"
  bone-2: "#dcd9d1"
  ink: "#111113"
  ink-dim: "#5f5d58"
  line-d: "rgb(242 240 235 / 0.13)"
  line-d-strong: "rgb(242 240 235 / 0.26)"
  line-l: "rgb(17 17 19 / 0.16)"
  glass: "rgb(28 28 30 / 0.55)"
  glass-hover: "rgb(48 48 50 / 0.6)"
  highlight: "rgb(255 255 255 / 0.09)"
  glow: "rgb(255 214 170 / 0.14)"
  glow-flare: "rgb(255 110 50 / 0.07)"
  shade: "rgb(34 26 18 / 0.32)"
  press: "rgb(255 255 255 / 0.55)"
  grade-warm: "rgb(255 168 110 / 0.035)"
  grade-cool: "rgb(14 22 34 / 0.22)"
  vignette: "rgb(4 5 8 / 0.42)"
typography:
  display:
    fontFamily: "Instrument Serif, ui-serif, Georgia, serif"
    fontSize: "clamp(3rem, 9.2vw, 10.25rem)"
    fontWeight: 400
    lineHeight: 0.84
    letterSpacing: "-0.025em"
  giant:
    fontFamily: "Instrument Serif, ui-serif, Georgia, serif"
    fontSize: "clamp(3.4rem, 13.4vw, 15rem)"
    fontWeight: 400
    lineHeight: 0.84
  h2:
    fontFamily: "Instrument Serif, ui-serif, Georgia, serif"
    fontSize: "clamp(2.6rem, 6.4vw, 6.75rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Instrument Serif, ui-serif, Georgia, serif"
    fontSize: "clamp(1.6rem, 1.1rem + 1.2vw, 2.4rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  mega:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 6vw, 6.75rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.045em"
  numeral:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 9vw, 7.5rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.05em"
    fontFeature: "'tnum'"
  lead:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 3.15vw, 3.15rem)"
    fontWeight: 300
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.92rem + 0.28vw, 1.175rem)"
    fontWeight: 400
    lineHeight: 1.55
  annotation:
    fontFamily: "Instrument Serif, ui-serif, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.15
  meta:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.06em"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  gutter: "clamp(1rem, 2.6vw, 2.75rem)"
  container: "1760px"
  nav: "4.25rem"
components:
  button-glass:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.light}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 1.1rem"
    height: "2.5rem"
  button-glass-hover:
    backgroundColor: "{colors.glass-hover}"
  button-light:
    backgroundColor: "{colors.light}"
    textColor: "{colors.void}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 1.1rem"
    height: "2.5rem"
  button-light-hover:
    backgroundColor: "{colors.flare}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bone}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 1.1rem"
    height: "2.5rem"
  button-ink-hover:
    backgroundColor: "{colors.flare}"
  tile-void:
    backgroundColor: "{colors.void}"
    textColor: "{colors.light}"
    rounded: "{rounded.none}"
    padding: "2rem"
  tile-bone:
    backgroundColor: "{colors.bone-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "2rem"
---

# Design System: Aṃśu

## Overview

**Creative North Star: "The Ray"**

*Aṃśu* (अंशु) is Sanskrit for a ray of light, and the root of the name Anshul. The whole site follows one ray from its first frame to its last, and every surface is a state of that light: gathered at the gate, ignited in the hero, brought into focus, projected onto the work, refracted into four disciplines, flooded into one lit chapter, condensed back to a point, and returned at Contact. The system's job is to stay out of the light's way.

The mood is **luminous, exact, quiet**. Luminous because light is the only thing allowed to be loud: a WebGL core, dust graded warm-to-steel by depth, type that glows faintly where the ray touches it. Exact because every number on the page is measured in the visitor's browser, every hairline is one pixel, and every motion has one easing family. Quiet because the interface itself is small, mono-captioned and translucent, and recedes the moment the work or the light is on screen.

Nothing in the concept is invented. The etymology is the name's; every other word comes from `src/content.js`, which keeps the owner's no-invention rule.

| Chapter | State of the light | What the stage does |
| --- | --- | --- |
| Gate | Gathering | Dust gathers into a ring as assets actually load; the counter reads real progress |
| Hero | Ignition | The ring collapses to a point, flashes, and scatters into a field around a core; the cursor parts the dust |
| Intro | Focus | The camera dives through the dust while the words come into focus |
| Work | Projection | Each build is a sheet that bends like paper at the viewport's edges, ripples with scroll speed and plays its reel on hover |
| Method | Refraction | The dust forms `</>`, *Aa*, a wave and a sphere, then collapses into one point: "One decision." |
| Flood | Exposure | The point flares and floods the frame to bone |
| Capabilities · Lab · About · Experience | Daylight | No particles: ink on bone, drawn figures, tiles |
| Iris | Condensing | The lit page shrinks back to a point; the statement is readable only inside the light |
| Contact | Return | The point becomes a core with a slow disc of dust around it |

**Key Characteristics:**
- One light source, on raw WebGL2, behind every chapter; everything else is quiet chrome
- Two grounds only: void for the dark chapters, bone for the single lit one
- One flare accent, used for the light and for state, never for body text on bone
- Instrument Serif display against light-weight Geist, captioned in 11px Geist Mono
- Two motion engines with one boundary: GSAP for scroll and type, anime.js for the mark, icons and control responses
- Every on-page number is measured; nothing is claimed that does not exist

## Colors

A warm-neutral darkroom and a bone-white daylight, separated by a single flare of light.

### Primary
- **Flare** (#ff5a1f): the colour of the ray where it touches the interface. The live availability dot, active and hover states, 8% of the dust, the drawn arrows' hover, the brand mark's rays, the case study's system nodes. On bone it is a mark, never text.

### Neutral
- **Void** (#09090b): the ground of every dark chapter, and the body of the dark tiles on bone.
- **Void Raised** (#111114): the quote tile in About; one step above the ground.
- **Warm Light** (#f2f0eb): type on void, and the etymology card's ground.
- **Light Dim** (#8f8d87): supporting text on void (6.0:1).
- **Bone** (#e8e6e0): the ground of the lit chapter.
- **Bone Shadow** (#dcd9d1): the grey tiles and the hovered capability cell.
- **Ink** (#111113): type on bone (15:1), and the focus ring on bone.
- **Ink Dim** (#5f5d58): supporting text on bone (5.4:1).
- **Hairlines** (`line-d`, `line-d-strong`, `line-l`): translucent versions of the type colour, so a rule reads on either ground.

### The grade
The page is colour graded like a film, in three places:
- **The light (shaders).** Dust is graded by depth: warm near the lens, neutral in the middle, a cool steel blue far away. Method's forms are split-toned, warm from the right and cool on the left. The core runs through a filmic curve and carries a faint lens-dispersion ring.
- **The work (shader).** Every sheet gets a gentle S-curve, warm highlights, teal shadows, 12% desaturation, halation and grain. Hovering a sheet releases the grade to the site's true colours.
- **The page (CSS).** One fixed `.grade` layer under the chrome: a faint warm centre (`grade-warm`), cool edges (`grade-cool`) and a `vignette`, all plain alpha — no blend modes, which would copy the whole frame underneath on every frame.

### Named Rules
**The Two Grounds Rule.** The page has exactly two grounds. Bone appears once, as a whole chapter entered and left through the light — never as an odd section in the dark.

**The One Light Rule.** Flare is the only chroma. A second accent, or flare on running text on bone, breaks the world.

## Typography

**Display Font:** Instrument Serif (with ui-serif, Georgia)
**Body Font:** Geist, variable 300–600 (with ui-sans-serif, system-ui)
**Label/Mono Font:** Geist Mono (with ui-monospace)

**Character:** A high-contrast display serif, set uppercase for statements and italic for the emotive half of a phrase, against a light-weight grotesk that never shouts. The mono only captions: labels, indices, readouts, measured numbers.

### Hierarchy
- **Giant** (400, clamp(3.4rem, 13.4vw, 15rem), 0.84): the footer wordmark, set to the exact width of the page.
- **Display** (400, clamp(3rem, 9.2vw, 10.25rem), 0.84, uppercase): the hero, chapter titles, Method's words, the name tiles.
- **H2** (400, clamp(2.6rem, 6.4vw, 6.75rem), 0.9): section headings — upright first line, italic second.
- **Title** (400, clamp(1.6rem, 1.1rem + 1.2vw, 2.4rem), 0.95): project titles, capability names, menu entries.
- **Lead** (Geist 300, clamp(1.6rem, 3.15vw, 3.15rem), 1.12): the Intro sentence.
- **Mega** (Geist 300, clamp(1.35rem, 6vw, 6.75rem), 1): the contact address.
- **Numeral** (Geist 300, clamp(3.5rem, 9vw, 7.5rem), tabular): the gate counter.
- **Body** (Geist 400, clamp(1rem, 0.92rem + 0.28vw, 1.175rem), 1.55): running text, held to 44–58ch.
- **Annotation** (Instrument Serif italic, 1.0625rem, 1.15): the callouts on leader lines and the capability proofs.
- **Meta** (Geist 400, 0.875rem, 1.5): small prose and metadata.
- **Label** (Geist Mono 400, 0.6875rem, +0.06em, uppercase): every caption, index and readout.

### Kinetic type
Type is the second thing that moves, after the light. Upright heading lines flip up out of their masks in 3D or rise letter by letter; italic lines come into focus from blur; paragraphs rise line by line; labels resolve from glyphs; Method's words flip like a split-flap board; Intro words sharpen from blur as you scroll. Display headings lean with the scroll's speed (at most 2.6°) and settle. Letters near the cursor lift (hero headline, footer wordmark) or thicken on Geist's weight axis (the contact email). Two marquee bands run with the scroll and reverse with it; ring captions turn faster while you scroll.

### Named Rules
**The Serif Speaks, The Mono Captions Rule.** Statements are serif; anything enumerated, measured or labelled is mono. Body copy is never mono.

**The Lit Type Rule.** Display type on void carries a faint warm `glow` because the ray touches it; on bone, headings are letterpressed with `press` instead. Never both.

## Layout

A 12-column grid inside a 1760px container with a fluid gutter of clamp(1rem, 2.6vw, 2.75rem). Hairlines do the structural work on both grounds; the About and Lab tiles are the only filled surfaces. Scenes that the light performs are sticky full-viewport frames inside taller sections — Intro 190vh, Method 420vh, the statement 200vh — so the scroll drives them without being hijacked.

The chrome frames the viewport: four corner brackets, a top bar (the brand mark and wordmark with a scroll-progress hairline, the current chapter as a scrambling readout, availability and menu pills) and a bottom bar (the time in Panchkula, the sound toggle). On phones the composition collapses to one column, hover-only art becomes inline, callouts reposition to where their words fit, and the pills keep only Menu.

### Named Rules
**The Stacking Contract.** The WebGL stage is a fixed canvas at `z-index: 1`. Section backgrounds paint below it; every section's content sits in `.layer` (`z-index: 2`) above it. A section element never takes a `transform`, `opacity` or `filter` — that would make a stacking context and drop its content under the light. Animate inside `.layer`.

**The Blended Chrome Rule.** The chrome's words sit on layers blended by difference, so they read on void, bone, the flood and the dark tiles without knowing what is beneath them. Only the pills keep their own glass.

## Elevation & Depth

Depth is atmospheric first: the light, the depth-graded dust, the grade and the vignette. Surfaces add only three quiet effects, each tinted by the world rather than grey.

### Shadow Vocabulary
- **Glass pill** (`box-shadow: inset 0 1px 0 var(--color-highlight), 0 12px 30px -14px var(--color-vignette)`): an inner top highlight and a low, soft drop under every glass control.
- **Tile depth** (`box-shadow: 0 1px 0 var(--color-highlight) inset, 0 44px 80px -46px var(--color-shade)`): the About and Lab tiles lifting off bone, with a warm shade.
- **Lit type** (`text-shadow: 0 0 0.28em var(--color-glow)`): display type on void, lit by the ray. One tight shadow only: a wide blur on big type is re-painted every time the type moves.
- **Press** (`text-shadow: 0 1px 0 var(--color-press)`): headings on bone, pressed into the paper.

### The still light
Without WebGL2, or under reduced motion, the hero and Contact show `.still-light`, a radial gradient in the shader's own colours. It is atmosphere, not a palette colour; the only other place it appears is `.light-point`, the breathing light in the About name tile.

### Named Rules
**The Tinted Shadow Rule.** A shadow carries the hue of the world it falls in — warm shade on bone, vignette black under glass. A neutral grey shadow is a defect.

## Shapes

Radius is binary: `0` or `9999px`. Pills, dots, the cursor ring and the brand mark's core are round; images, tiles, the work sheets and the case study are square. Lines are 1px hairlines; drawn icons and figures use one stroke (1–1.6px) with round caps and joins.

## Components

### Buttons
Glass with weight: translucent pills that pull toward the cursor and press back.
- **Shape:** full pill (9999px), 2.5rem tall, 0 1.1rem padding, mono label.
- **Glass** (on void): a vertical glass gradient with an inner highlight; on hover it brightens and its hairline strengthens.
- **Light** (the open Menu): warm light fill, void text; flare on hover.
- **Ink** (on bone): ink fill, bone text; flare on hover.
- **Behaviour:** magnetic on fine pointers (32% of the offset, elastic release), `scale(0.985)` on press, letters roll on hover, focus ring 2px flare (ink on bone) at 3px offset.

### Links and icons
- **Roll:** every link and control label rolls its letters to a copy of themselves on hover or focus, 14ms a letter (CSS, `text-shadow` copy; screen readers get the whole word).
- **Drawn arrows:** authored SVG arrows replace every glyph. On hover the arrow leaves the way it points and a fresh one springs in behind it (anime.js).
- **Underline:** a 1px underline draws in from the left.

### Navigation
- **Top bar:** brand mark, wordmark and progress hairline at left; the chapter readout centred, scrambling to each new chapter; availability and Menu pills at right.
- **Menu:** a full-screen void panel that opens as a circle from the Menu button; numbered serif entries stagger up and turn flare on hover. It traps focus, makes the page behind it inert, closes on Escape and returns focus to the button. The icon's two strokes trade lengths on hover and spring into an × when open.
- **Mobile:** Menu is the only pill; the readout hides.

### The brand mark
A point of light with eight rays and a ring — aṃśu, drawn. It draws itself in (core springs, rays grow out in turn, the ring closes), turns once every 28s, and its rays reach out and spring back when its link is hovered. At the gate the same mark is the loader, its rays lighting one after another. Mono in the blended nav; flare rays elsewhere.

### Work sheets
Each build is drawn by the stage on a plane over its real `<img>`: it develops in with a hot edge, curls back at the viewport's top and bottom edges, ripples with scroll speed, lifts under the cursor, and plays six real frames of the live site on hover. Opening one grows the case study out of the sheet's own rectangle.

### Case study
A full-screen void dialog above everything else, linkable at `#work/<id>`: title, meta row, the still, five chapters, a system diagram (hairline with flare-ringed nodes), measured build notes, the full scroll reel, the live link and the next build. Focus is trapped and returned; Escape or Close returns to the same scroll position. It opens on the click (ease-out, 0.9s) and can be closed or reopened mid-motion, turning round from where it is. Next lifts the study being read away and brings the next in at the top. The body reveals as it scrolls inside the dialog, and the system diagram lights node by node in data-flow order.

### Tiles
Square, filled, with a warm tile shadow; they arrive through a grid of cells clearing in random order. Void tiles hold the Lab's live canvases and the name; bone-2 and light tiles hold the surname and the etymology card.

### Sound toggle
Four bars that dance on organic, never-in-step heights while sound is on (anime.js) and collapse with a spring when it is off.

### Sound
Synthesised with Web Audio, off by default, chosen at the gate — and it only ever answers a click. Nothing plays in the background; with no click, the output is silence.
- **Press:** any link or button gives a soft tock with a faint glass overtone, pitched a little higher toward the right of the screen (A minor pentatonic). It plays on press, not release, so it feels immediate.
- **Menu:** opening or closing the menu gives a short airy sweep.
- **Copy:** copying the address gives two notes, a fifth apart.
- **Bus:** high-pass, gentle glue, a limiter last; one small dark room returned low. Measured offline: clicks peak near −16 dBFS and are gone within half a second.

### Named Rules
**The Engine Boundary Rule.** GSAP owns everything driven by scroll and every piece of type; anime.js owns only the brand mark, the drawn icons and the physical responses of controls. A new effect goes to the engine whose side of the line it is on.

## Do's and Don'ts

### Do:
- **Do** let the light lead: when the work or the WebGL stage is on screen, the chrome stays small and translucent.
- **Do** keep every on-page number measured in the browser (bytes received, point count, the colophon).
- **Do** keep reduced motion a designed path: no gate, the still light, Method as a list, every scene in its final state.
- **Do** blend chrome text by difference so it reads on any ground.
- **Do** use the ink focus ring on bone and the flare ring on void.
- **Do** draw icons as SVG in one stroke weight; never use a text glyph as an icon.

### Don't:
- **Don't** add a second accent colour or a third ground.
- **Don't** put flare on body text on bone.
- **Don't** animate a section element (see the Stacking Contract).
- **Don't** invent clients, awards, numbers or testimonials.
- **Don't** use an intermediate corner radius; it is 0 or a full pill.
- **Don't** cast a grey shadow; tint it to the world it falls in.
- **Don't** give one effect two engines; it lives on its side of the Engine Boundary.
