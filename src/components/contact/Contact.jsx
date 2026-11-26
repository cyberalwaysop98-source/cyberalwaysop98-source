import { useEffect, useRef, useState } from 'react'
import { gsap, SplitText, useGSAP, MOTION_OK } from '../../lib/motion'
import { registerChapter } from '../../lib/stage'
import { revealIn } from '../../lib/reveal'
import { proximity } from '../../lib/kinetic'
import { confirm } from '../../lib/sound'
import { useClock } from '../../lib/hooks'
import { contact, meta, social } from '../../content'
import Magnetic from '../ui/Magnetic'
import Roll from '../ui/Roll'
import RingText from '../ui/RingText'
import Arrow from '../ui/Arrow'
import { copied as burst } from '../../lib/micro'
import SectionHead from '../ui/SectionHead'

/* The light returns to one point, with a slow disc of dust around it.
   The words sit above and below it; the middle is left to the light. */
export default function Contact() {
  const root = useRef(null)
  const email = useRef(null)
  const copyBtn = useRef(null)
  const [copied, setCopied] = useState(false)
  const time = useClock()

  useGSAP(
    () => {
      const undo = revealIn(root.current)
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // the address types itself out, then thickens wherever the cursor is near it
        const split = SplitText.create(email.current, { type: 'chars', charsClass: 'inline-block' })
        gsap.from(split.chars, {
          opacity: 0,
          yPercent: 60,
          duration: 1,
          stagger: 0.025,
          ease: 'expo.out',
          scrollTrigger: { trigger: email.current, start: 'top 90%', once: true },
        })
        return proximity(split.chars, { mode: 'weight', radius: 260, root: email.current })
      })
      return () => {
        undo()
        mm.revert()
      }
    },
    { scope: root },
  )

  // the tick exists only once "Copied" has rendered — draw it then
  useEffect(() => {
    if (copied) burst(copyBtn.current)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(meta.email)
      setCopied(true)
      confirm()
      setTimeout(() => setCopied(false), 2200)
    } catch {
      window.location.href = `mailto:${meta.email}`
    }
  }

  const links = [
    ['Call', meta.phone, `tel:${meta.phone.replace(/\s/g, '')}`],
    ...social.map((s) => ['Elsewhere', `${s.label} ${s.handle}`, s.href]),
    ['Paper', 'Résumé, PDF', meta.resume],
  ]

  return (
    <section id="contact" ref={(el) => registerChapter('contact', el)} className="relative flex min-h-[100svh] flex-col" aria-labelledby="contact-title">
      {/* the still light, for visitors without the live stage */}
      <div aria-hidden="true" className="still-light absolute inset-0 [html[data-stage=live]_&]:hidden" />

      <div ref={root} className="layer shell flex min-h-[100svh] flex-1 flex-col justify-between pb-16 pt-[calc(var(--nav-h)+2rem)]">
        <div>
          <SectionHead
            n="08"
            label="Contact"
            aside={
              <p className="label inline-flex items-center gap-2.5">
                <span className="pulse" aria-hidden="true" />
                {meta.available}
              </p>
            }
          />
          <h2 id="contact-title" className="display lit mt-8" data-skew>
            <span className="block" data-reveal="chars">
              {contact.lines[0]}
            </span>{' '}
            <em className="serif block text-right normal-case italic" data-reveal="focus" data-delay="0.25">
              {contact.lines[1]}
            </em>
          </h2>
        </div>

        <div className="mt-[18vh]">
          <div className="flex items-end justify-between gap-6">
            <p className="label text-light-dim" data-reveal="scramble">
              Write — I read everything
            </p>
            <RingText text="Available for work — open to ideas — " size={104} className="hidden text-light-dim md:inline-flex">
              <span className="pulse" aria-hidden="true" />
            </RingText>
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <a href={`mailto:${meta.email}`} className="mega lit group relative md:whitespace-nowrap" data-cursor="Write" aria-label={`Email ${meta.email}`}>
              <span ref={email} aria-hidden="true" className="break-all md:break-normal">
                {meta.email}
              </span>
              <span aria-hidden="true" className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-flare transition-transform duration-700 group-hover:scale-x-100" />
            </a>
            <div className="flex items-center gap-3" data-reveal="fade" data-delay="0.1">
              <Magnetic>
                <button ref={copyBtn} type="button" onClick={copy} className="pill pill-glass relative overflow-visible" data-sound="confirm" data-cursor="none">
                  {/* a tick that draws itself, and a ring of rays thrown out around the button */}
                  <svg viewBox="0 0 16 16" aria-hidden="true" className={`h-3 w-3 ${copied ? '' : 'hidden'}`}>
                    <polyline className="cp-tick" points="2.5,8.5 6.4,12 13.5,4" fill="none" stroke="var(--color-flare)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <Roll key={copied ? 'y' : 'n'}>{copied ? 'Copied' : 'Copy address'}</Roll>
                  <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2">
                    {Array.from({ length: 10 }, (_, i) => {
                      const a = (i / 10) * Math.PI * 2
                      return (
                        <i
                          key={i}
                          className="cp-ray absolute -ml-[3px] -mt-[1px] block h-[2px] w-[6px] rounded-full bg-flare opacity-0"
                          data-x={Math.cos(a) * 58}
                          data-y={Math.sin(a) * 30}
                          style={{ rotate: `${(a * 180) / Math.PI}deg` }}
                        />
                      )
                    })}
                  </span>
                </button>
              </Magnetic>
              <span className="sr-only" aria-live="polite">
                {copied ? 'Email address copied' : ''}
              </span>
            </div>
          </div>

          <div className="relative mt-12 grid grid-cols-2 gap-6 pt-5 md:grid-cols-4">
            <span aria-hidden="true" className="rule-fade-d absolute inset-x-0 top-0 h-px" data-reveal="rule" />
            {links.map(([k, v, href]) => (
              <div key={v} data-reveal="fade" data-delay="0.15">
                <p className="label text-light-dim">{k}</p>
                <a
                  href={href}
                  target={href.startsWith('http') || href.endsWith('.pdf') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="link-draw meta mt-1 inline-flex min-h-11 items-center gap-1.5"
                >
                  <Roll>{v}</Roll>
                  {href.startsWith('tel:') ? null : <Arrow dir="up-right" />}
                </a>
              </div>
            ))}
            <div data-reveal="fade" data-delay="0.15">
              <p className="label text-light-dim">Base</p>
              <p className="meta tnum mt-2">
                {meta.location} · {time} IST
              </p>
            </div>
          </div>
          <p className="meta mt-8 max-w-[52ch] text-light-dim" data-reveal="para" data-delay="0.2">
            {contact.note}
          </p>
        </div>
      </div>
    </section>
  )
}
