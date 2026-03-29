import './SpaLeftNav.css'

/**
 * @param {{
 *   items: { id: string, label: string, icon: string, disabled?: boolean }[],
 *   activeId: string,
 *   onSelect: (id: string) => void,
 * }} props
 */
export default function SpaLeftNav({ items, activeId, onSelect }) {
  return (
    <aside className="left-nav" aria-label="コンテンツ切り替え">
      <ul className="left-nav-list">
        {items.map((item) => {
          const isActive = item.id === activeId
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`left-nav-button ${isActive ? 'is-active' : ''}`}
                onClick={() => onSelect(item.id)}
                disabled={item.disabled}
                aria-current={isActive ? 'page' : undefined}
              >
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
