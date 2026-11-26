# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: other creative developers, interactive-studio practitioners, and awards juries (Awwwards, FWA, CSSDA, Godly). They arrive from a shared link, a submission gallery, or social, usually on desktop, usually skimming many sites in one sitting. Their job is to decide within seconds whether this person's work is worth their attention — and they judge by opening the site, not by reading about it.

Secondary, downstream of the first: people who saw the work circulate and now want to commission something.

## Product Purpose

A personal portfolio for Anshul Sharma, a creative developer. It exists to earn recognition among peers, and to convert some of that recognition into project enquiries.

Success is a visitor starting a conversation about a project. Reputation is the channel, not the goal — the site is judged by peers, and paid work arrives through the reputation that judgment creates.

## Positioning

The site is itself the portfolio piece. For this audience the artifact and the evidence are the same object: how it loads, how it scrolls, how it behaves under a cursor, and what its source looks like are the claim being made.

Stated intent from the owner's brief: *"This person doesn't just build websites. This person builds digital experiences."*

## Operating Context

- Visitors are overwhelmingly desktop, mouse or trackpad, evaluating quickly and comparatively.
- A meaningful share will open devtools, check the console, test reduced-motion, and read the source. Implementation quality is visible to this audience in a way it is not to a general one.
- Discovery is link-driven (social cards, gallery listings), so the shared preview is part of the first impression.
- Sections: gate, hero, intro, work (sheets + index, case-study overlay), method, then the lit chapter (capabilities, lab, about, experience, statement), contact, footer.

## Capabilities and Constraints

- Stack (v4, "Aṃśu"): Vite 7, React 19, Tailwind v4 (CSS-first `@theme` tokens), GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG, ScrambleText) with Lenis for scroll and type, anime.js 4.5 for the brand mark and micro-interactions, raw WebGL2 for the page-wide stage (no 3D library; one JavaScript bundle, ~178 KB gzipped), and optional synthesised Web Audio. Single page; case studies are dialog overlays with shareable `#work/<id>` URLs.
- All site copy, projects, experiments, and links are driven from `src/content.js`. Content changes are data edits, not component edits.
- **Not yet supplied:** GitHub and LinkedIn URLs (never guess them — add to `social` in content.js when real); the production domain (set `SITE_URL` at build time, see README).
- Contact: anshulhere9898@gmail.com and +91 62305 73962, confirmed by the owner. Location is published as city only (Panchkula, India) — on the site and in public/resume.pdf, where the street address was removed in the launch pass.

## Brand Commitments

- Name: Anshul Sharma. Role label used throughout: "Creative Developer".
- Owner's explicit prohibitions, binding on all future work: no invented clients, awards, companies, statistics, testimonials, achievements, or project results. Where a fact is missing, the site says so plainly rather than filling the space.

## Evidence on Hand

Real, demonstrable work: **four live, self-initiated concept sites** (Atelier Vance, AURA HYPER-GT, KISSA, AMBER & STONE), their stacks verified against the shipped bundles, plus the small Lab studies on this site.

Consequences future work must respect:

- Work now leads (section 01) because live builds exist; the Lab follows as evidence of range.
- There are no client engagements or metrics. Every project is labelled "Concept build" and every Result chapter says so plainly.
- Skills (resume + owner): React, JavaScript, HTML, CSS, Node.js, Express, MongoDB, Three.js, React Three Fiber, GLSL, GSAP (used in the four concept builds, not on this site), Git, GitHub, Blender, Unity, AI-assisted development; digital marketing, campaign planning, negotiation; LAN/WAN network management.
- **Resolved factual representation** (resume.pdf is authoritative):
  - Bharat Electronics Limited — official title **Network Manager** (2025–present), shown with *Role focus: web development, networking and digital systems*, because the owner describes the work as web-related. The resume title is never replaced.
  - Impact Lab — **Marketing Manager**, 2025 (resume title; the earlier "Marketing Head, North India" wording is not used).
  - North Star Studio — **removed**; it is not in the resume or any other source in the repository.
  - Chitkara University — B.Tech, Computer Science & Engineering, 2021–2025.

## Project Classifications

| Project | Type | Role | Client | Metrics |
| --- | --- | --- | --- | --- |
| Atelier Vance (featured) | Concept build | Design & development | None | None reported |
| KISSA 余白 | Concept build | Design & development | None | None reported |
| AURA HYPER-GT | Concept build | Design & development | None | None reported |
| AMBER & STONE | Concept build | Design & development | None | None reported |

Bundle sizes quoted in case studies are measurements of the live sites (September 2026), not performance claims.

## Known Limitations

- No GitHub or LinkedIn links until the owner supplies real URLs.
- No canonical URL, og:url or sitemap until a domain is verified (`SITE_URL`).
- Screenshots are static captures; if a live project changes, recapture it.

## Product Principles

1. **The artifact is the argument.** For a peer audience, execution quality is the evidence. Anything that degrades load, frame rate, or interaction fidelity attacks the core claim directly.
2. **Never claim work that does not exist.** Empty states say "to be added" and are designed to look deliberate. Filling space with invented work would destroy the only thing this site is selling.
3. **Show the shipped thing.** Screenshots of live sites and verified stacks beat descriptions.
4. **Recognition is the channel; the enquiry is the outcome.** The site earns peer respect first, and makes starting a conversation easy for whoever that respect reaches.
5. **Craft is inspectable.** Console, source, keyboard path, and reduced-motion behaviour are all part of the portfolio, because this audience checks them.

## Accessibility & Inclusion

Required by the owner's brief and implemented: semantic HTML, keyboard navigation with visible focus (the gate, menu and case study trap and return focus), correct heading hierarchy, ARIA where needed, and full `prefers-reduced-motion` support that skips the gate, replaces the WebGL stage with a still light, and starts every scroll scene in its final state while leaving the site entirely usable. Sound is off unless the visitor chooses it.

Text colour meets WCAG AA against the ink background. This audience actively tests reduced-motion, so that path is a craft signal here rather than a compliance checkbox.
