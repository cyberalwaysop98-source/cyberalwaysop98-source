import { useRef } from 'react'
import { m, useScroll, useTransform } from 'motion/react'
import { useReducedMotion, useIsMobile } from '../../lib/hooks'
import { statement } from '../../content'
import SplitText from '../ui/SplitText'

/* The one place the page holds still and makes you read. On desktop the
   section is taller than the viewport and its content is CSS-sticky, so
   scroll progress scrubs the lines in without hijacking the scroll. */
const SPAN = 1.96 // line tween length 1, staggered by 0.32 across 4 lines

function Line({ progress, i, children, serif }) {
  const start = (i * 0.32) / SPAN
  const end = (i * 0.32 + 1) / SPAN
  const y = useTransform(progress, [start, end], ['115%', '0%'])
  const opacity = useTransform(progress, [start, end], [0, 1])
  return (
    <span className="block overflow-hidden pb-[0.1em]">
      <m.span style={{ y, opacity }} className={`block will-change-transform ${serif ? 'accent-serif text-ember' : ''}`}>
        {children}
      </m.span>
    </span>
  )
}

export default function Statement() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  const mobile = useIsMobile()
  const pinned = !reduced && !mobile

  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end end'] })
  const rule = useTransform(scrollYProgress, [0, 1 / SPAN], [0, 1])

  const content = (
    <div className="shell">
      <m.span
        className="block h-px w-full origin-left bg-ember"
        style={{ scaleX: pinned ? rule : 1 }}
        aria-hidden="true"
      />

      <h2 className="display mt-12 text-[length:var(--text-huge)] text-paper md:mt-20">
        {statement.lines.map((line, i) =>
          pinned ? (
            <Line key={line} i={i} progress={scrollYProgress} serif={line === statement.serifWord}>
              {line}
            </Line>
          ) : (
            <SplitText
              key={line}
              as="span"
              text={line}
              mode="words"
              delay={i * 0.06}
              className={`block ${line === statement.serifWord ? 'accent-serif text-ember' : ''}`}
            />
          ),
        )}
      </h2>

      <p className="mt-12 max-w-[52ch] text-[length:var(--text-lede)] leading-[1.5] text-paper-dim md:mt-20">
        {statement.note}
      </p>
    </div>
  )

  return pinned ? (
    <section id="statement" ref={root} className="relative h-[170vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">{content}</div>
    </section>
  ) : (
    <section id="statement" ref={root} className="relative flex min-h-[100svh] flex-col justify-center py-24">
      {content}
    </section>
  )
}
