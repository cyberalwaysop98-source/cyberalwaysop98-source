import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { ease, dur } from '../../lib/motion'
import { useReducedMotion, lockScroll, scrollToId } from '../../lib/hooks'
import { meta, nav, projects, social } from '../../content'
import Notation from './Notation'

/* ⌘K / Ctrl K — or the visible trigger in Nav / the mobile menu. Built for
   the audience PRODUCT.md names outright: people who read the source and
   expect a site like this to behave like real software, not just look like
   one. It is a new VIEW, not new data — every result comes straight from
   nav/projects/meta/social, and picking a project sets #work/<id>, the
   exact deep link Work.jsx already listens for. No new content, no new
   navigation logic, just a faster way to reach what is already there. */

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
export const kbdHint = isMac ? '⌘K' : 'Ctrl K'

function buildItems() {
  const sections = nav.map((n) => ({
    group: 'Section',
    id: `cmdk-s-${n.id}`,
    label: n.label,
    sub: 'Jump to section',
    run: () => scrollToId(n.id),
  }))
  const work = projects.map((p) => ({
    group: 'Project',
    id: `cmdk-p-${p.id}`,
    label: p.title,
    sub: `${p.category} — open case study`,
    accent: p.palette.accent,
    run: () => {
      location.hash = `#work/${p.id}`
    },
  }))
  const links = [
    {
      group: 'Contact',
      id: 'cmdk-l-email',
      label: 'Email',
      sub: meta.email,
      run: () => {
        location.href = `mailto:${meta.email}`
      },
    },
    {
      group: 'Contact',
      id: 'cmdk-l-resume',
      label: 'Résumé',
      sub: 'Opens the PDF in a new tab',
      run: () => window.open(meta.resume, '_blank', 'noreferrer'),
    },
    ...social.map((s) => ({
      group: 'Contact',
      id: `cmdk-l-${s.label}`,
      label: s.label,
      sub: s.handle,
      run: () => window.open(s.href, '_blank', 'noreferrer'),
    })),
  ]
  return [...sections, ...work, ...links]
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const returnFocus = useRef(null)
  const reduced = useReducedMotion()
  const items = useMemo(buildItems, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((it) => `${it.label} ${it.sub ?? ''} ${it.group}`.toLowerCase().includes(q))
  }, [items, query])

  // grouped for rendering; index into `filtered` still drives the highlight,
  // so arrow keys move through the flat list regardless of group headers
  const grouped = useMemo(() => {
    const out = []
    for (const it of filtered) {
      const last = out[out.length - 1]
      if (last && last.group === it.group) last.items.push(it)
      else out.push({ group: it.group, items: [it] })
    }
    return out
  }, [filtered])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onTrigger = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('command-palette:open', onTrigger)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('command-palette:open', onTrigger)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement
    setQuery('')
    setHighlight(0)
    lockScroll(true)
    const t = setTimeout(() => inputRef.current?.focus(), reduced ? 0 : 50)
    return () => {
      clearTimeout(t)
      lockScroll(false)
      returnFocus.current?.focus?.()
    }
  }, [open, reduced])

  useEffect(() => setHighlight(0), [query])

  useEffect(() => {
    listRef.current?.querySelector('[data-idx="' + highlight + '"]')?.scrollIntoView({ block: 'nearest' })
  }, [highlight])

  const run = (item) => {
    setOpen(false)
    item.run()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => (filtered.length ? (h + 1) % filtered.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => (filtered.length ? (h - 1 + filtered.length) % filtered.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[highlight]) run(filtered[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  let flatIndex = -1

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[95] flex items-start justify-center bg-ink/80 px-4 pt-[14vh] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : dur.micro, ease: ease.out }}
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <m.div
            className="w-full max-w-xl border hairline bg-ink"
            initial={{ opacity: 0, y: reduced ? 0 : -10, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : -10, scale: reduced ? 1 : 0.98 }}
            transition={{ duration: reduced ? 0 : dur.ui, ease: ease.out }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-3 border-b hairline px-5 py-4">
              <span className="index text-ember" aria-hidden="true">
                /
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Jump to a section, a project, a link…"
                role="combobox"
                aria-expanded="true"
                aria-controls="cmdk-list"
                aria-activedescendant={filtered[highlight]?.id}
                autoComplete="off"
                spellCheck="false"
                className="index w-full bg-transparent text-paper placeholder:text-paper-faint focus:outline-none"
              />
              <span className="eyebrow shrink-0 text-paper-faint">Esc</span>
            </div>

            <div id="cmdk-list" role="listbox" aria-label="Results" ref={listRef} className="max-h-[52vh] overflow-y-auto overscroll-contain">
              {filtered.length === 0 && (
                <p className="meta px-5 py-8 text-center text-paper-faint">Nothing matches “{query}”.</p>
              )}
              {grouped.map((g) => (
                <div key={g.group} role="presentation">
                  <p className="eyebrow px-5 pt-4 pb-1 text-paper-faint">{g.group}</p>
                  {g.items.map((it) => {
                    flatIndex += 1
                    const i = flatIndex
                    const active = i === highlight
                    return (
                      <button
                        key={it.id}
                        id={it.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        data-idx={i}
                        onMouseEnter={() => setHighlight(i)}
                        onClick={() => run(it)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left"
                        style={{ background: active ? 'rgba(255,74,28,0.08)' : 'transparent' }}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          {it.accent && (
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: it.accent }} aria-hidden="true" />
                          )}
                          <span className="min-w-0">
                            <span className={`block truncate text-[1.05rem] ${active ? 'text-ember' : 'text-paper'}`}>{it.label}</span>
                            {it.sub && <span className="meta block truncate text-paper-faint">{it.sub}</span>}
                          </span>
                        </span>
                        {active && (
                          <span className="index shrink-0 text-ember" aria-hidden="true">
                            ↵
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t hairline px-5 py-3">
              <Notation code="CMD" tags={['Command palette']} />
              <span className="eyebrow hidden text-paper-faint sm:block">↑↓ navigate · ↵ select</span>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
