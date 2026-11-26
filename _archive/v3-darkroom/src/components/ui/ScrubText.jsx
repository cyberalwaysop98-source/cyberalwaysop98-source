import { useRef } from 'react'
import { m, useScroll, useTransform } from 'motion/react'
import { useReducedMotion } from '../../lib/hooks'

function Word({ progress, range, children }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <m.span style={{ opacity }} className="inline-block">
      {children}
    </m.span>
  )
}

/* Read-along type: every word is printed faint and comes up to full
   exposure as the reader's scroll passes it — the sentence develops at
   the speed it is read. Scroll-linked, so it never runs ahead of anyone.
   The text is announced once, whole; the words are decorative. */
export default function ScrubText({ text, as: Tag = 'p', className = '', offset = ['start 82%', 'end 48%'] }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset })

  if (reduced) {
    return (
      <Tag ref={ref} className={className}>
        {text}
      </Tag>
    )
  }

  const words = String(text).split(' ')
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => {
        const start = i / words.length
        return (
          <span key={i} aria-hidden="true">
            <Word progress={scrollYProgress} range={[start, start + 1.6 / words.length]}>
              {w}
            </Word>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        )
      })}
    </Tag>
  )
}
