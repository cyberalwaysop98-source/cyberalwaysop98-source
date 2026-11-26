import Reveal from './Reveal'

/* index — LABEL, over a hairline. The same mark opens every section so
   the site reads as one document. `tone="paper"` for the one chapter
   printed on paper instead of shown on the screen. */
export default function SectionHeader({ index, label, className = '', tone = 'ink' }) {
  const onPaper = tone === 'paper'
  return (
    <Reveal className={className} amount={0.8}>
      <div className={`flex items-baseline gap-4 border-t pt-4 ${onPaper ? 'border-line-paper' : 'hairline'}`}>
        <span className={`eyebrow ${onPaper ? 'text-ember-deep' : 'text-ember'}`}>{index}</span>
        <span className={`eyebrow ${onPaper ? 'text-ink-soft' : ''}`}>{label}</span>
      </div>
    </Reveal>
  )
}
