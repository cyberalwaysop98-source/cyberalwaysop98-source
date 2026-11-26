import { m } from 'motion/react'
import { ease, dur } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks'

/* The default entrance for anything that isn't type. */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  y = 24,
  duration = dur.section,
  amount = 0.4,
  as = 'div',
}) {
  const reduced = useReducedMotion()
  const Tag = m[as] // proxy form is cached; m.create() in render remounts

  if (reduced) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: ease.out }}
    >
      {children}
    </Tag>
  )
}
