import { useEffect, useRef, useState } from 'react'
import { m } from 'motion/react'
import { ease, dur } from '../../lib/motion'
import { meta, contact, social } from '../../content'
import SectionHeader from '../ui/SectionHeader'

/* The reveal lives on the h2, not on the masked child: a child translated
   fully outside its overflow-hidden parent has an intersection ratio of 0,
   so whileInView on it never fires and the headline stays hidden. */
const line = {
  hidden: { y: '115%' },
  show: { y: 0, transition: { duration: dur.cinematic * 0.8, ease: ease.out } },
}

const details = [
  { label: 'Phone', value: meta.phone, href: `tel:${meta.phone.replace(/[^+\d]/g, '')}` },
  ...social.map((s) => ({ label: s.label, value: s.handle, href: s.href, external: true })),
  { label: 'Resume', value: 'PDF ↗', href: meta.resume, external: true },
  { label: 'Location', value: meta.location },
  { label: 'Status', value: meta.available },
]

// "name@host" → ["name", "@host"], keeping each letter's position for the stagger
const split = (email) => {
  const at = email.indexOf('@')
  return at < 0 ? [{ text: email, offset: 0 }] : [{ text: email.slice(0, at), offset: 0 }, { text: email.slice(at), offset: at }]
}

/* The address is the call to action, set at display size. Clicking copies
   it — the thing most people actually want from a contact block — and the
   mail-app link sits right beside it for everyone else. */
function Email() {
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(meta.email)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2400)
    } catch {
      window.location.href = `mailto:${meta.email}`
    }
  }

  return (
    <div className="mt-12 md:mt-16">
      <div className="flex items-baseline justify-between gap-6">
        <span className="eyebrow">
          {copied ? <span className="text-ember">Copied — paste it anywhere</span> : 'Click to copy'}
        </span>
        <a
          href={`mailto:${meta.email}`}
          className="eyebrow inline-flex min-h-11 items-center text-paper transition-colors hover:text-ember"
        >
          Open in your mail app ↗
        </a>
      </div>

      <button
        type="button"
        onClick={copy}
        aria-label={`Copy the email address ${meta.email}`}
        className="group relative mt-2 block w-full text-left"
      >
        {/* two unbreakable halves, so a narrow screen wraps at the @ and
            nowhere else; each letter lifts in turn on hover */}
        <span className="display block text-[clamp(1.35rem,5.2vw,5.6rem)] leading-[1.05] text-paper" aria-hidden="true">
          {split(meta.email).map((part, w) => (
            <span key={w} className="inline-block whitespace-nowrap">
              {[...part.text].map((ch, i) => (
                <span
                  key={i}
                  className={`inline-block transition-[transform,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[0.07em] group-hover:text-ember ${
                    copied ? 'text-ember' : ''
                  }`}
                  style={{ transitionDelay: `${(part.offset + i) * 14}ms` }}
                >
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </span>
        {/* the rule under the address develops on hover */}
        <span className="mt-4 block h-px w-full bg-line" aria-hidden="true">
          <span className="block h-px w-full origin-left scale-x-0 bg-ember transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
        </span>
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Email address copied to the clipboard' : ''}
      </span>
    </div>
  )
}

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden pt-20 pb-16 md:pt-28">
      <div className="shell relative">
        <SectionHeader index="06" label="Contact" />

        <m.h2
          className="display mt-10 text-[length:var(--text-mega)] text-paper md:mt-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.08 }}
        >
          {contact.lines.map((text, i) => (
            <span key={text} className="block overflow-hidden pb-[0.06em]">
              <m.span
                className={`block will-change-transform ${i === 2 ? 'accent-serif text-ember' : ''}`}
                variants={line}
              >
                {text}
              </m.span>
            </span>
          ))}
        </m.h2>

        <p className="mt-10 max-w-[44ch] text-[length:var(--text-lede)] leading-[1.5] text-paper-dim md:mt-14">
          {contact.note}
        </p>

        <Email />

        <dl className="mt-12 grid grid-cols-1 md:mt-16 md:grid-cols-2">
          {details.map((d, i) => (
            <div
              key={d.label}
              className={`group relative flex items-baseline justify-between gap-6 border-t hairline py-6 md:py-8 ${
                i % 2 === 0 ? 'md:pr-14' : 'md:border-l md:pl-14'
              }`}
            >
              <dt
                className={`display text-[clamp(1.4rem,3vw,2.4rem)] text-paper transition-colors duration-500 ${
                  d.href ? 'group-hover:text-ember' : ''
                }`}
              >
                {d.label}
              </dt>
              <dd className="index min-w-0 truncate text-paper-dim">
                {d.href ? (
                  // stretched link: the whole row is the target, the value is the name
                  <a
                    href={d.href}
                    {...(d.external && { target: '_blank', rel: 'noreferrer' })}
                    className="transition-colors duration-500 after:absolute after:inset-0 group-hover:text-paper"
                  >
                    {d.value}
                  </a>
                ) : (
                  d.value
                )}
              </dd>
            </div>
          ))}
        </dl>
        <div className="border-t hairline" />
      </div>
    </section>
  )
}
