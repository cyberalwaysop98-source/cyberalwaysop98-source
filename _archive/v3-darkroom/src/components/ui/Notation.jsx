import { meta } from '../../content'

/* The site's one signature mark: a build/experiment identifier in the
   owner's initials, e.g. "AS—B01 / 3D · Editorial". Used sparingly — on
   builds, experiments, and the footer — never as decoration. */
export default function Notation({ code, tags = [], className = '' }) {
  return (
    <span className={`index whitespace-nowrap uppercase tracking-[0.12em] text-paper-faint ${className}`}>
      {meta.mark}—{code}
      {tags.length > 0 && (
        <>
          <span className="mx-2 text-ember" aria-hidden="true">
            /
          </span>
          {tags.join(' · ')}
        </>
      )}
    </span>
  )
}
