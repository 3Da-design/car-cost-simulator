import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './AppHeader.css'

/**
 * @param {{ hasResult?: boolean, showNav?: boolean }} props
 */
export default function AppHeader({ hasResult = false, showNav = true }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef(null)
  const menuButtonRef = useRef(null)

  const navItems = showNav
    ? [
        { to: '/#sim-intro', label: '概要', menuIcon: 'fa-circle-info' },
        { to: '/#simulation-input', label: '入力', menuIcon: 'fa-keyboard' },
        ...(hasResult
          ? [{ to: '/result#simulation-result', label: '結果', menuIcon: 'fa-chart-pie' }]
          : []),
      ]
    : []

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        queueMicrotask(() => menuButtonRef.current?.focus())
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  const headerClass = ['header', menuOpen ? 'header--menu-open' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <header ref={headerRef} className={headerClass}>
      <div className="header-inner">
        <h1 className="header-title">
          <Link to="/#sim-intro" className="header-title-link">
            <span className="header-title-text">Car Cost Simulator</span>
          </Link>
        </h1>
        {showNav && (
          <nav className="header-nav" aria-label="ページ内">
            <ul className="header-nav-inline">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="header-nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="header-menu">
              <button
                type="button"
                ref={menuButtonRef}
                className="header-menu-button"
                aria-expanded={menuOpen}
                aria-controls="header-menu-panel"
                aria-haspopup="true"
                aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
                id="header-menu-button"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <i
                  className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'} header-menu-icon`}
                  aria-hidden="true"
                />
              </button>
              <div
                id="header-menu-panel"
                className="header-menu-panel"
                role="region"
                aria-label="ページ内リンク"
                hidden={!menuOpen}
              >
                <ul className="header-menu-list">
                  {navItems.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="header-menu-link"
                        aria-label={item.label}
                        onClick={() => setMenuOpen(false)}
                      >
                        <i
                          className={`fa-solid ${item.menuIcon} header-menu-link-icon`}
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
