import { m } from 'motion/react'
import { ease, dur, stagger } from '../../lib/motion'
import { useReducedMotion } from '../../lib/hooks'

/* Masked word/char reveal. The text is announced once, whole, to screen
   readers — the pieces are decorative. */
export default function SplitText({
  text,
  as: Tag = 'span',
  mode = 'words',
  className = '',
  itemClassName = '',
  delay = 0,
  each,
  once = true,
  amount = 0.6,
  y = '110%',
}) {
  const reduced = useReducedMotion()
  const MotionTag = m[Tag] // proxy form is cached; m.create() in render remounts

  if (reduced) {
    return <Tag className={className}>{text}</Tag>
  }

  const words = String(text).split(' ')
  const step = each ?? (mode === 'chars' ? stagger.text : stagger.item)

  let i = -1
  return (
    <MotionTag
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      transition={{ delayChildren: delay, staggerChildren: step }}
    >
      {words.map((word, w) => (
        <span
          key={w}
          aria-hidden="true"
          className="inline-flex overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom"
        >
          {(mode === 'chars' ? [...word] : [word]).map((piece, c) => {
            i += 1
            return (
              <m.span
                key={c}
                className={`inline-block will-change-transform ${itemClassName}`}
                variants={{
                  hidden: { y, opacity: 0 },
                  show: {
                    y: '0%',
                    opacity: 1,
                    transition: { duration: dur.section, ease: ease.out },
                  },
                }}
              >
                {piece}
              </m.span>
            )
          })}
          {w < words.length - 1 && <span className="whitespace-pre"> </span>}
        </span>
      ))}
    </MotionTag>
  )
}
