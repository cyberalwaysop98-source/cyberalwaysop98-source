/* Letters that roll to a copy of themselves on hover of the nearest link
   or button (CSS in index.css). Screen readers get the text whole. */
export default function Roll({ children, className = '' }) {
  const text = String(children)
  return (
    <span className={className}>
      <span className="roll-t" aria-hidden="true">
        {[...text].map((c, i) => (
          <span key={i} className="roll-c" style={{ '--i': i }}>
            {c}
          </span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  )
}
