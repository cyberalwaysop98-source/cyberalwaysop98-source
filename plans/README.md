# Animation plans: case study dialog

These plans come from an `improve-animations` audit of the four case study pages (`src/components/work/CaseStudy.jsx`, opened at `#work/<id>`) on 2026-11-23. Each plan is self-contained. Hand it to any agent, or run `improve-animations execute plans/NNN-….md`.

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Keep each case study's own title after "Next"](001-keep-title-after-next.md) | HIGH | DONE |
| 002 | [Make the case study open on the click, and survive being closed mid-open](002-responsive-interruptible-open-close.md) | HIGH + MEDIUM | DONE |
| 003 | [Give "Next" a transition instead of a cut](003-transition-between-studies.md) | MEDIUM | DONE |
| 004 | [Reveal each study as it is read, and light the system in data-flow order](004-reveal-the-study-as-it-is-read.md) | LOW (additive) | DONE |

## Execution order

Run them strictly in order: **001 → 002 → 003 → 004**. Every plan edits `CaseStudy.jsx`, and each one quotes the code as the previous plan leaves it.

- **002 depends on 001.** It retimes the `useGSAP` entrance that 001 introduces.
- **003 depends on 001 and 002.** It builds on the `phase` ref and the `overwrite: true` tweens from 002. It moves 001's `key` from the `<h2>` to a wrapper around the whole study.
- **004 depends on 003.** Its line-split paragraphs are only safe across "Next" because 003's keyed wrapper remounts the study.

001 and 002 fix verified bugs and are worth shipping even if 003 and 004 wait.

## Not planned (from the same audit)

- **LOW**: the title splits into letters under one `overflow-hidden` on the whole `<h2>`, plus an opacity fade (`CaseStudy.jsx:101, :161`). The site's own `chars` reveal masks each line (`reveal.js:47-65`). This only shows if a title wraps, and none do at 390–1920 px today.
- **LOW**: the footer's Next title slides *left* on hover (`group-hover:-translate-x-2`, Tailwind's default curve, 500 ms, `CaseStudy.jsx:250`) while its arrow flies right. Index rows slide right (`Work.jsx:165`).
- **Feel check first**: the main page scrolls through Lenis (`lerp: 0.085`), but the dialog is `data-lenis-prevent`, so wheel scrolling inside a study steps natively. A second Lenis instance bound to the panel (`wrapper` / `content` options) would match the page, but whether it is worth it is a taste call to make in the browser.
- **Needs a performance trace**: the open/close tweens `clip-path` on a full-screen panel holding a `backdrop-blur` bar and a CSS-filtered image, while the WebGL stage still draws underneath until the open completes. It may drop frames on mid-range laptops; this cannot be judged from the code alone.
