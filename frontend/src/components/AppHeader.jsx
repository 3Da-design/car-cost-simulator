import { useEffect, useRef, useState } from 'react'
import './AppHeader.css'

const SCROLL_THRESHOLD = 40

/**
 * @param {{ hasResult?: boolean }} props
 */
export default function AppHeader({ hasResult = false }) {
  const [isScrolled, setIsScrolled] = useState(
    () => typeof window !== 'undefined' && window.scrollY >= SCROLL_THRESHOLD
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef(null)
  const menuButtonRef = useRef(null)
  const rafRef = useRef(null)

  const navItems = [
    { href: '#sim-intro', label: '概要', menuIcon: 'fa-circle-info' },
    { href: '#simulation-input', label: '入力', menuIcon: 'fa-keyboard' },
    ...(hasResult
      ? [{ href: '#simulation-result', label: '結果', menuIcon: 'fa-chart-pie' }]
      : []),
  ]

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current != null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const y = window.scrollY
        const next = y >= SCROLL_THRESHOLD
        setIsScrolled(next)
        if (!next && window.matchMedia('(min-width: 769px)').matches) {
          setMenuOpen(false)
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

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

  const headerClass = [
    'header',
    isScrolled ? 'header--scrolled' : '',
    menuOpen ? 'header--menu-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header ref={headerRef} className={headerClass}>
      <div className="header-inner">
        <h1 className="header-title">
          <a
            href="#sim-intro"
            className="header-title-link"
            aria-label={isScrolled ? '自動車維持費シミュレーター（概要へ）' : undefined}
          >
            <span className="header-title-text" aria-hidden={isScrolled ? true : undefined}>
              自動車維持費シミュレーター
            </span>
            <span className="header-title-icon-wrap" aria-hidden="true">
              <i className="fa-solid fa-car header-title-icon" />
            </span>
          </a>
        </h1>
        <nav className="header-nav" aria-label="ページ内">
          <ul className="header-nav-inline">
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="header-nav-link">
                  {item.label}
                </a>
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
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="header-menu-link"
                      aria-label={item.label}
                      onClick={() => setMenuOpen(false)}
                    >
                      <i
                        className={`fa-solid ${item.menuIcon} header-menu-link-icon`}
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
