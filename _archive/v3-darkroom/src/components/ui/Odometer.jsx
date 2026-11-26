import { m } from 'motion/react'
import { ease, dur } from '../../lib/motion'

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/* A counter that rolls rather than swaps: every digit is a column of
   0–9 behind a one-line mask, and a change slides each column to its new
   figure, right-most first, like the frame counter on a camera body.
   Non-digits print as they are. Announced once, as the whole value. */
export default function Odometer({ value, className = '' }) {
  const chars = [...String(value)]
  return (
    <span className={`inline-flex leading-none ${className}`}>
      <span className="sr-only">{value}</span>
      {chars.map((ch, i) => {
        const d = Number(ch)
        if (Number.isNaN(d) || ch === ' ') {
          return (
            <span key={i} aria-hidden="true">
              {ch}
            </span>
          )
        }
        return (
          <span key={i} className="relative inline-block h-[1em] overflow-hidden tabular-nums" aria-hidden="true">
            <m.span
              className="flex flex-col"
              initial={false}
              animate={{ y: `${-d}em` }}
              transition={{ duration: dur.section, ease: ease.inOut, delay: (chars.length - 1 - i) * 0.07 }}
            >
              {DIGITS.map((n) => (
                <span key={n} className="block h-[1em]">
                  {n}
                </span>
              ))}
            </m.span>
          </span>
        )
      })}
    </span>
  )
}
