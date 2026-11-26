/* The label row every chapter opens with: its number and name resolve
   from glyphs, and a hairline draws out under them and fades. */
export default function SectionHead({ n, label, aside, tone = 'd', className = '' }) {
  const dim = tone === 'd' ? 'text-light-dim' : 'text-ink-dim'
  return (
    <div className={`relative flex items-baseline justify-between gap-6 pb-3 ${className}`}>
      <p className={`label tnum ${dim}`} data-reveal="scramble">
        ({n}) — {label}
      </p>
      {typeof aside === 'string' ? (
        <p className={`label ${dim}`} data-reveal="scramble" data-delay="0.15">
          {aside}
        </p>
      ) : (
        aside
      )}
      <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-px ${tone === 'd' ? 'rule-fade-d' : 'rule-fade-l'}`} data-reveal="rule" />
    </div>
  )
}
