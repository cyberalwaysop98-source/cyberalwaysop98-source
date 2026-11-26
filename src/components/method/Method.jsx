import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP, MOTION_OK } from '../../lib/motion'
import { registerChapter, stage } from '../../lib/stage'
import { useReducedMotion } from '../../lib/hooks'
import { method } from '../../content'

// where each form holds, as fractions of the pinned scroll — mirrors the stage's sequence
const CUT = [0.14, 0.34, 0.54, 0.72]
const FORMS = ['</>', 'Aa', '∿', '◯', '·']
const at = (p) => CUT.findIndex((c) => p < c) === -1 ? 4 : CUT.findIndex((c) => p < c)

function Readout() {
  const [info, setInfo] = useState(null)
  useEffect(() => {
    const id = setTimeout(() => stage.live && setInfo({ count: stage.count, tier: stage.tier }), 400)
    return () => clearTimeout(id)
  }, [])
  if (!info) return <span className="label text-light-dim">One idea, four forms</span>
  return (
    <span className="label tnum text-light-dim">
      {info.count.toLocaleString('en-GB')} points · 1 draw call
    </span>
  )
}

export default function Method() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  const words = [...method.stages.map((s) => s.word), method.end.word]
  const notes = [...method.stages.map((s) => s.note), method.end.note]

  useGSAP(
    () => {
      if (reduced) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        let current = 0
        const ws = gsap.utils.toArray('.m-word')
        const ns = gsap.utils.toArray('.m-note')
        const gs = gsap.utils.toArray('.m-form')
        // every word flips in letter by letter, hinged like a split-flap board
        const letters = ws.map((w) => SplitText.create(w, { type: 'chars' }).chars)
        gsap.set(letters.flat(), { transformPerspective: 700, transformOrigin: '50% 50% -0.3em' })
        letters.forEach((cs, i) => gsap.set(cs, { yPercent: i === 0 ? 0 : 110, rotationX: i === 0 ? 0 : -80, opacity: i === 0 ? 1 : 0 }))
        gsap.set(ns, { opacity: (i) => (i === 0 ? 1 : 0) })
        gsap.set(gs, { opacity: (i) => (i === 0 ? 1 : 0) })

        const show = (next) => {
          if (next === current) return
          const dir = next > current ? 1 : -1
          gsap.to(letters[current], {
            yPercent: -110 * dir,
            rotationX: 80 * dir,
            opacity: 0,
            duration: 0.8,
            stagger: { each: 0.025, from: dir > 0 ? 'start' : 'end' },
            ease: 'power3.in',
            overwrite: true,
          })
          gsap.fromTo(
            letters[next],
            { yPercent: 110 * dir, rotationX: -80 * dir, opacity: 0 },
            {
              yPercent: 0,
              rotationX: 0,
              opacity: 1,
              duration: 1.1,
              delay: 0.25,
              stagger: { each: 0.035, from: dir > 0 ? 'start' : 'end' },
              ease: 'expo.out',
              overwrite: true,
            },
          )
          gsap.to(ns[current], { opacity: 0, y: -10 * dir, duration: 0.5, overwrite: true })
          gsap.fromTo(ns[next], { opacity: 0, y: 10 * dir }, { opacity: 1, y: 0, duration: 0.9, delay: 0.3, overwrite: true })
          gsap.to(gs[current], { opacity: 0, duration: 0.4, overwrite: true })
          gsap.to(gs[next], { opacity: 1, duration: 0.8, delay: 0.2, overwrite: true })
          current = next
        }

        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const p = self.progress
            show(at(p))
            gsap.set('.m-bar', { scaleX: Math.min(1, p / 0.75) })
          },
        })

        // the frame fades out as the light floods
        gsap.to('.m-frame', {
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: () => `top+=${(root.current.offsetHeight - innerHeight) * 0.88} top`, end: () => `top+=${(root.current.offsetHeight - innerHeight) * 0.97} top`, scrub: true },
        })
        gsap.from('.m-in', {
          opacity: 0,
          y: 24,
          stagger: 0.08,
          duration: 1.2,
          scrollTrigger: { trigger: root.current, start: 'top 60%', once: true },
        })
      })
    },
    { scope: root, dependencies: [reduced] },
  )

  if (reduced) {
    return (
      <section id="method" ref={(el) => registerChapter('method', el)} className="relative py-[16vh]" aria-labelledby="method-title">
        <div className="layer shell">
          <p className="label text-light-dim">(03) — Method</p>
          <h2 id="method-title" className="h2 mt-6">{method.end.word}</h2>
          <p className="mt-6 max-w-[48ch] text-light-dim">{method.end.note}</p>
          <ol className="mt-12">
            {method.stages.map((s, i) => (
              <li key={s.word} className="grid-12 border-t rule-d py-6">
                <span className="label tnum col-span-2 text-flare">0{i + 1}</span>
                <span className="title col-span-10 md:col-span-4">{s.word}</span>
                <span className="meta col-span-12 text-light-dim md:col-span-6">{s.note}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  return (
    <section id="method" ref={(el) => registerChapter('method', el)} className="relative h-[420vh]" aria-labelledby="method-title">
      <div ref={root} className="absolute inset-0">
        <div className="m-frame sticky top-0 z-[2] h-[100svh] overflow-hidden">
          <div className="shell relative flex h-full flex-col justify-between pb-14 pt-[calc(var(--nav-h)+1.25rem)]">
            <div className="m-in flex items-baseline justify-between">
              <p className="label text-light-dim">(03) — Method</p>
              <Readout />
            </div>

            {/* registration marks around the form, like a plate on a light table */}
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[min(56vh,70vw)] w-[min(56vh,70vw)] -translate-x-1/2 -translate-y-1/2">
              {['left-0 top-0', 'right-0 top-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((c) => (
                <span key={c} className={`m-in absolute ${c} label text-light-dim`}>+</span>
              ))}
              {/* the forms as type, for anyone without the live stage */}
              <div className="absolute inset-0 hidden items-center justify-center [html:not([data-stage=live])_&]:flex">
                {FORMS.map((f) => (
                  <span key={f} className="m-form serif absolute text-[clamp(6rem,18vw,14rem)] italic text-light/80">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="m-in flex items-start gap-4">
              <div className="w-40">
                <p className="label tnum">
                  <span className="text-flare">Forms</span> — 04
                </p>
                <span className="mt-3 block h-px w-full bg-[var(--color-line-d)]">
                  <span className="m-bar block h-full origin-left scale-x-0 bg-light" />
                </span>
              </div>
            </div>

            <div className="text-center">
              <h2 id="method-title" className="sr-only">
                {method.end.word} {method.end.note}
              </h2>
              <div aria-hidden="true" data-skew className="display lit relative mx-auto grid overflow-hidden pb-[0.05em]">
                {words.map((w, i) => (
                  <span key={w} className={`m-word col-start-1 row-start-1 block ${i === words.length - 1 ? 'serif normal-case italic' : ''}`}>
                    {w}
                  </span>
                ))}
              </div>
              <div aria-hidden="true" className="relative mx-auto mt-5 grid max-w-[46ch]">
                {notes.map((n) => (
                  <p key={n} className="m-note meta col-start-1 row-start-1 text-light-dim">
                    {n}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
