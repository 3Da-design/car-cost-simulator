import './SimulatorIntro.css'

function HeroVisual() {
  return (
    <div className="sim-intro-hero-icons" aria-hidden="true">
      <span className="sim-intro-hero-icon-cell sim-intro-hero-icon-cell--car">
        <i className="fa-solid fa-car-on sim-intro-hero-icon" />
      </span>
      <span className="sim-intro-hero-icon-sep" />
      <span className="sim-intro-hero-icon-cell sim-intro-hero-icon-cell--calc">
        <i className="fa-solid fa-calculator sim-intro-hero-icon" />
      </span>
      <span className="sim-intro-hero-icon-sep" />
      <span className="sim-intro-hero-icon-cell sim-intro-hero-icon-cell--cost">
        <i className="fa-solid fa-comment-dollar sim-intro-hero-icon" />
      </span>
    </div>
  )
}

export default function SimulatorIntro() {
  return (
    <section
      className="sim-intro"
      id="sim-intro"
      aria-labelledby="sim-intro-hero-title sim-intro-title sim-intro-howto-heading"
    >
      <div className="sim-intro-hero">
        <div className="sim-intro-hero-grid">
          <div className="sim-intro-hero-copy">
            <p className="sim-intro-eyebrow" aria-hidden="true">
              Simulator
            </p>
            <h1 id="sim-intro-hero-title" className="sim-intro-hero-heading">
              自動車維持費シミュレーション
            </h1>
            <p className="sim-intro-hero-catch">
              <span className="sim-intro-hero-catch-line">年間のコストが見える、</span>
              <span className="sim-intro-hero-catch-line">内訳が分かる、</span>
              <span className="sim-intro-hero-catch-line">条件で試せる。</span>
            </p>
            <p className="sim-intro-hero-lead">
              ガソリン・税金・車検・保険・駐車場まで、ざっくりでも「持ち出し感」を掴める無料の概算ツールです。
            </p>
            <a href="#simulation-input" className="sim-intro-hero-cta">
              条件を入力する
            </a>
          </div>
          <div className="sim-intro-hero-visual">
            <HeroVisual />
          </div>
        </div>
      </div>

      <div className="sim-intro-divider" aria-hidden="true" />

      <div className="sim-intro-inner">
        <p className="sim-intro-eyebrow" aria-hidden="true">
          Overview
        </p>
        <h2 id="sim-intro-title" className="sim-intro-title">
          年間・月間の維持費を、入力条件から概算できます
        </h2>
        <p className="sim-intro-lead">
          メーカーと車種を選ぶと、車両価格・排気量・燃費・車検費用の目安などが自動で入ります。<br />
          年間走行距離やガソリン単価、任意保険・駐車場代、保有年数を足し合わせて、維持費のイメージをつかめます。
        </p>

        <div className="sim-intro-howto">
          <h3 id="sim-intro-howto-heading" className="sim-intro-howto-title">
            使い方
          </h3>
          <ol className="sim-intro-howto-steps">
            <li className="sim-intro-howto-step">
              <span className="sim-intro-howto-icon-wrap" aria-hidden="true">
                <i className="fa-solid fa-car sim-intro-howto-icon" />
              </span>
              <div className="sim-intro-howto-step-body">
                <span className="sim-intro-howto-step-label">メーカーと車種を選ぶ</span>
                <span className="sim-intro-howto-step-text">
                  入力エリアでメーカーを選び、車種チップからモデルを指定します。価格・排気量・燃費・車検の目安が自動で入ります。
                </span>
              </div>
            </li>
            <li className="sim-intro-howto-step">
              <span className="sim-intro-howto-icon-wrap" aria-hidden="true">
                <i className="fa-solid fa-keyboard sim-intro-howto-icon" />
              </span>
              <div className="sim-intro-howto-step-body">
                <span className="sim-intro-howto-step-label">条件を入力・調整する</span>
                <span className="sim-intro-howto-step-text">
                  年間走行距離、ガソリン単価、任意保険、駐車場代、保有年数など、ご自身の想定に合わせて編集できます。
                </span>
              </div>
            </li>
            <li className="sim-intro-howto-step">
              <span className="sim-intro-howto-icon-wrap" aria-hidden="true">
                <i className="fa-solid fa-calculator sim-intro-howto-icon" />
              </span>
              <div className="sim-intro-howto-step-body">
                <span className="sim-intro-howto-step-label">「計算する」を押す</span>
                <span className="sim-intro-howto-step-text">
                  ボタン一つで年間・月間の維持費と、ガソリン・税金・車検などの内訳が求められます。
                </span>
              </div>
            </li>
            <li className="sim-intro-howto-step">
              <span className="sim-intro-howto-icon-wrap" aria-hidden="true">
                <i className="fa-solid fa-chart-pie sim-intro-howto-icon" />
              </span>
              <div className="sim-intro-howto-step-body">
                <span className="sim-intro-howto-step-label">結果を確認する</span>
                <span className="sim-intro-howto-step-text">
                  円グラフと一覧でコストの偏りを把握。必要なら結果を CSV でダウンロードして保存・共有できます。
                </span>
              </div>
            </li>
          </ol>
        </div>

        <ul className="sim-intro-features">
          <li className="sim-intro-feature">
            <span className="sim-intro-feature-badge" aria-hidden="true">
              1
            </span>
            <span className="sim-intro-feature-text">
              <span className="sim-intro-feature-label">車種から自動入力</span>
              データベースのスペックを反映し、手入力の手間を減らします。
            </span>
          </li>
          <li className="sim-intro-feature">
            <span className="sim-intro-feature-badge" aria-hidden="true">
              2
            </span>
            <span className="sim-intro-feature-text">
              <span className="sim-intro-feature-label">内訳で可視化</span>
              計算後は円グラフとリストで、どこにコストが寄っているか確認できます。
            </span>
          </li>
          <li className="sim-intro-feature">
            <span className="sim-intro-feature-badge" aria-hidden="true">
              3
            </span>
            <span className="sim-intro-feature-text">
              <span className="sim-intro-feature-label">CSV で入出力</span>
              条件の保存や共有に、エクスポート・インポートが使えます。
            </span>
          </li>
        </ul>
        <p className="sim-intro-note" role="note">
          表示はあくまで目安です。ガソリン価格・保険料・駐車場などは地域や契約内容で大きく変わるため、実際の金額とは異なる場合があります。
        </p>
      </div>
    </section>
  )
}
