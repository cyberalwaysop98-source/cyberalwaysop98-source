import { m } from 'motion/react'
import { ease, dur } from '../../lib/motion'

/* The plate develops rather than appears — DESIGN.md's "content does not
   appear, it develops", made literal: the print starts underexposed and a
   paper wash drains from its centre the first time it enters view. */
const image = {
  hidden: { opacity: 0.5, filter: 'grayscale(1) blur(9px) brightness(1.55) contrast(0.85)' },
  show: {
    opacity: 1,
    filter: 'grayscale(0) blur(0px) brightness(1) contrast(1)',
    transition: { duration: dur.cinematic, ease: ease.out },
  },
}
const wash = {
  hidden: { clipPath: 'circle(145% at 50% 42%)' },
  show: { clipPath: 'circle(0% at 50% 42%)', transition: { duration: dur.section, delay: 0.18, ease: ease.inOut } },
}

// screenshots live at public/work/<id>-{800,1600}.webp
export const shot = (id, w = 1600) => `/work/${id}-${w}.webp`

export default function Plate({ project, className = '', sizes = '(min-width: 768px) 92vw, 100vw', eager = false }) {
  return (
    <m.div
      className={`relative overflow-hidden ${className}`}
      style={{ background: project.palette.bg }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <m.img
        variants={image}
        src={shot(project.id)}
        srcSet={`${shot(project.id, 800)} 800w, ${shot(project.id)} 1600w`}
        sizes={sizes}
        alt={`${project.title} — screenshot of the live site`}
        width="1600"
        height="1000"
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      <m.div className="pointer-events-none absolute inset-0 bg-paper" variants={wash} aria-hidden="true" />
    </m.div>
  )
}
