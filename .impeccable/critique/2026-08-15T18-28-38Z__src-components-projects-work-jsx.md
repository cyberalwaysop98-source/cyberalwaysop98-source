---
target: work
total_score: 23
max_score: 36
na_heuristics: 10
p0_count: 3
p1_count: 2
timestamp: 2026-08-15T18-28-38Z
slug: src-components-projects-work-jsx
---
Method: dual-agent (A: a15b7e5a87b84b380 · B: a04e82ac6c524d2be)

# Critique — Selected Work

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Nothing signals a row opens an overlay vs navigating; no progress in a 2000px overlay; no signal when next wraps 03→01 |
| 2 | Match System / Real World | 3 | "Selected" claims curation three placeholders cannot support; lede promises "what it cost", no chapter delivers it |
| 3 | User Control and Freedom | 1 | Overlay pushes no history entry (history.length stays 2) so Back exits the site; only exit is a 16.5px-tall button |
| 4 | Consistency and Standards | 3 | index.css:88 border-radius 2px breaks the No Middle Radius Rule; two label systems in one row |
| 5 | Error Prevention | 3 | href/image guarded; tech placeholder renders "CATEGORY — –" as if broken; no single-project guard |
| 6 | Recognition Rather Than Recall | 3 | Index number carries row → preview → overlay, but preview repeats the number |
| 7 | Flexibility and Efficiency | 2 | Esc works, next-chaining is a real accelerator; no per-case-study URL for a link-driven audience |
| 8 | Aesthetic and Minimalist Design | 3 | Strongest quality; balance only holds while titles are short |
| 9 | Error Recovery | 2 | States absence three times, explains it zero times, no route onward |
| 10 | Help and Documentation | n/a | Three rows and one overlay need no docs; Esc is inline in the button label |
| Total | | 23/36 | Acceptable (64%) |

Heuristic 3 lowered from Assessment A's 2 to 1 in synthesis, after weighing A's missing-history finding against B's 16.5px tap-target measurement.

## Design Specificity Verdict

LLM assessment: well-executed generic. Strip content.js and this component tree ships unchanged for a furniture studio or a director's reel. Hairline rows, ember index numbers, grotesque title nudging on hover, siblings dimming, cursor-following preview, clip-path overlay with Overview/Challenge/Solution/Result, "Next project" — the canonical awards-portfolio work list, competently assembled. The Darkroom palette is applied; the Darkroom idea (content develops) is absent. Experiments has the draggable Laboratory Light, a genuinely specific object. The section numbered 01 is the least specific surface in the system.

Deterministic scan: exit 2, 2 findings on target files — design-system-font-size at Work.jsx:128 (13px) and CaseStudy.jsx:100 (15px). Across src: 18 advisory (16 font-size, design-system-radius at index.css:88, design-system-color at index.css:181). No warnings or criticals.

Detector degradation correction: the DEGRADED banner is emitted only by the static-HTML engine (detect-html.mjs:147). JSX files route to a source engine that never loads those parsers, so these findings are real output, not an undercount. The undercount warning applies to index.html scans only. The four parser modules are unfixable in place: the plugin ships no package.json and no node_modules.

Visual overlays: injection succeeded technically (title set, script executed, overlay div rendered); browser detector build logged 21 anti-patterns page-wide. Run was headless, so NO user-visible overlay exists. Inside #work at 1440: 0 findings. At 390: 3x clipped-overflow-container [warning] on the Plate wrapper.

## Overall Impression

The craft is real and the instincts are right, but the section spends its best engineering on its emptiest claim. The most elaborate interaction on the site sits on the one body of content PRODUCT.md documents as non-existent, while Experiments — where the evidence lives — is section 05. The biggest opportunity is a reallocation, not a fix.

## What's Working

1. The Plate empty state (Work.jsx:18-35) reads as an exposed-but-undeveloped negative: on-concept, derived from the product's real condition, degrades by data.
2. Focus management in the overlay (CaseStudy.jsx:22-52), confirmed independently by both agents: stores activeElement, focuses Close, traps Tab both directions, Esc closes, focus restores to the originating row. 15 tabs never escaped.
3. The row as a full-bleed button, not a card: 1310x191 hit target, ember focus ring wrapping the whole row.

## Priority Issues

[P0] Reduced motion ignored in this section. Verified under prefers-reduced-motion: preview spring-tracks pointer (y 331 to 363 over ~900ms), title translates 18px, siblings animate to 0.32, overlay runs full 975ms wipe. hooks.js:26 tests pointer only; Motion JS bypasses index.css:216. App.jsx:43 gates the cursor correctly, making this look like oversight. Fix: useFinePointer() && !useReducedMotion() at Work.jsx:43; zero transition duration at CaseStudy.jsx:65. Command: /impeccable audit

[P0] Mobile visitors can get trapped in the case study. Close button measures 99.2 x 16.5 CSS px (44px minimum), identical at 390/768/1440 — padding 0, 11px font, no min-height. Overlay pushes no history entry, so Back exits the site. Together: a phone user who misses the target and taps Back leaves the portfolio. Fix: min 44x44 on Close; pushState a hash with popstate to onClose. Command: /impeccable adapt

[P0] Hover preview collides with real project titles. Injecting realistic titles measured 306px of occlusion at 1440. Work.jsx:82 pins the plate over the same track Work.jsx:111 gives the title with flex-1 and no right reserve. Work.jsx:53 y-follow is unclamped, pushing the plate over the section lede. Layout is stable today only because content is empty. Fix: md:pr-[24vw] on the title column; clamp y to plate bounds. Command: /impeccable layout

[P1] Every terminal moment routes back into emptiness. Overlay ends on "Next project — 02 / Title to be added" at 108px looping forever; Work section ends on a bare hairline plus ~344px of void. No contact CTA, no link to Experiments. Peak-end weights the last impression, and it is a placeholder at maximum scale on a surface whose success is starting a conversation. Fix: two-up next block with a "Start a conversation" ghost CTA; close the section with a line pointing at #experiments. Command: /impeccable clarify

[P1] Row accessible name is unusable and nothing frames the absence. Computed name on mobile: "01Title to be added01Visual pendingCategory — —". No aria-haspopup="dialog". Lede promises what chapters do not deliver; metadata renders as "CATEGORY — –" with two different dash glyphs, tipping honest withholding toward abandoned. Fix: explicit aria-label plus aria-haspopup; render absent metadata as nothing; rewrite the lede to name the condition. Command: /impeccable clarify

[P2] Two contrast failures found independently. Siblings dim to opacity 0.32 while clickable, giving ~2.6:1, under the Contrast Floor Rule. "Visual pending" measures 4.38:1 against the plate (needs 4.5:1) on all three plates at mobile widths.

## Persona Red Flags

Awards Juror (desktop, ~40s, comparing 30 sites): section 01 is three rows of "Title to be added"; verdict lands before Experiments at 05. The 92px VIEW cursor promises a payoff and delivers "VISUAL PENDING". ~2 of 40 seconds go to wipe animations to reach four sentences. Nothing to paste into jury notes — no per-case-study URL.

Reduced-Motion Peer: every animation in P0-1 still runs while the custom cursor correctly disappears. Reads as inconsistency, not policy — and this is the visitor who checks.

Distracted Mobile User: opens a case study, needs to hit a 16.5px-tall Close, misses, taps Back, leaves the site.

## Minor Observations

- layoutId produces no shared-element morph: setHover(null) unmounts the source in the same click. Captured at 220ms, plate already at final size. Work.jsx:101 comment documents an effect that does not happen.
- Work.jsx:109 uses raw font-mono text-[11px] instead of .eyebrow, two lines above an element that uses .eyebrow.
- Plate ghost number is text-[26vh] in a content-sized box: 219px glyph in a 195px plate at 390x844, clipped mid-character.
- The 64px stripe overlay reads as a skeleton loader at case-study width (~20 visible stripes).
- alt="" hardcoded at Work.jsx:19-25: real project images will ship as decorative to screen readers.
- Three names for one section: nav WORK, eyebrow SELECTED WORK, heading "Projects, in full".
- md hover-preview switch fires ~200px too early: at 768-900px the preview is 138-172px wide, narrower than the mobile inline plate.
- False positives discarded: 87px overflow (artifact of injecting a 397KB script), h2 reading letter-by-letter (correctly aria-labeled with aria-hidden spans), marquee elements properly clipped.

## Questions to Consider

1. If you deleted Work today and made Experiments section 01, what would the site lose besides the shape of a portfolio?
2. Which of Overview/Challenge/Solution/Result can be filled honestly for a technique study with no client and no metric? If Result is structurally guaranteed to read "To be added", why is the template shaped like an agency case study rather than an engineer's build log?
3. The empty state is honest three times and explains itself zero times. If a juror cannot tell "withheld on purpose" from "abandoned halfway", has the honesty been communicated or only recorded?
