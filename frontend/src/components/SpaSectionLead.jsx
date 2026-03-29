import './SpaSectionLead.css'

/**
 * @param {{ eyebrow: string, children?: import('react').ReactNode }} props
 */
export default function SpaSectionLead({ eyebrow, children }) {
  return (
    <div className="spa-section-header-lead">
      <p className="spa-section-eyebrow" aria-hidden="true">
        {eyebrow}
      </p>
      <h2>{children}</h2>
    </div>
  )
}
