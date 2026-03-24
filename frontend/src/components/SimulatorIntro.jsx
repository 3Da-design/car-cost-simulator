import './SimulatorIntro.css'

export default function SimulatorIntro() {
  return (
    <section className="sim-intro" aria-labelledby="sim-intro-title">
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
