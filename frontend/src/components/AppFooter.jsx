import './AppFooter.css'

/**
 * @param {{
 *   hasResult?: boolean,
 *   onNavigateToSection: (view: 'intro' | 'input' | 'result', sectionId: string) => void,
 * }} props
 */
export default function AppFooter({ hasResult = false, onNavigateToSection }) {
  const year = new Date().getFullYear()

  return (
    <footer className="app-footer" aria-label="サイト情報">
      <div className="app-footer-inner">
        <div className="app-footer-main">
          <div className="app-footer-brand">
            <p className="app-footer-brand-name">Car Cost Simulator</p>
            <p className="app-footer-brand-tag">維持費の目安を、すぐに。</p>
          </div>
          <nav className="app-footer-nav" aria-label="ページ内">
            <ul className="app-footer-nav-list">
              <li>
                <button
                  type="button"
                  className="app-footer-nav-link"
                  onClick={() => onNavigateToSection('intro', 'sim-intro')}
                >
                  概要
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="app-footer-nav-link"
                  onClick={() => onNavigateToSection('input', 'simulation-input')}
                >
                  入力
                </button>
              </li>
              <li>
                {hasResult ? (
                  <button
                    type="button"
                    className="app-footer-nav-link"
                    onClick={() => onNavigateToSection('result', 'simulation-result')}
                  >
                    結果
                  </button>
                ) : (
                  <span className="app-footer-nav-link is-disabled" aria-disabled="true">
                    結果
                  </span>
                )}
              </li>
            </ul>
          </nav>
        </div>

        <p className="app-footer-note">
          表示される金額はシミュレーション上の目安であり、実際の維持費・諸費用と異なる場合があります。
        </p>

        <div className="app-footer-bottom">
          <p className="app-footer-copy">
            © {year} Car Cost Simulator | クルマの維持費をもっとわかりやすく
          </p>
          <button
            type="button"
            className="app-footer-back"
            onClick={() => onNavigateToSection('intro', 'sim-intro')}
          >
            トップへ
          </button>
        </div>
      </div>
    </footer>
  )
}
