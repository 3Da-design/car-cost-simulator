import '../../../../components/ResultDownloadButton.css'
import SpaSectionLead from '../../../../components/SpaSectionLead.jsx'
import './ComparisonPage.css'

const POWERTRAIN_LABELS = {
  bev: 'BEV',
  phev: 'PHEV',
  fcv: 'FCV',
}

function formatYen(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '—'
  return `${num.toLocaleString('ja-JP')}円`
}

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('ja-JP')
}

/**
 * @param {{
 *   items: Array<{
 *     id: string,
 *     addedAt: string,
 *     mode: 'gasoline_hybrid'|'plugin_ev',
 *     carName: string,
 *     inputs: Record<string, unknown>,
 *     result: Record<string, unknown>
 *   }>,
 *   onRemove: (id: string) => void,
 *   onClear: () => void,
 *   onDownload: () => void,
 * }} props
 */
export default function ComparisonPage({ items, onRemove, onClear, onDownload }) {
  return (
    <main className="main">
      <section className="comparison-page" aria-label="比較結果">
        <div className="comparison-header">
          <SpaSectionLead eyebrow="Compare">比較</SpaSectionLead>
          <div className="comparison-actions">
            <button
              type="button"
              className="result-download-button"
              onClick={onDownload}
              disabled={items.length === 0}
            >
              比較結果をダウンロード
            </button>
            <button type="button" className="comparison-clear-button" onClick={onClear} disabled={items.length === 0}>
              すべて削除
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="comparison-empty">比較リストは空です。結果画面で「比較に追加」を押してください。</p>
        ) : (
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>追加日時</th>
                  <th>モード</th>
                  <th>車種</th>
                  <th>パワートレイン</th>
                  <th>年間走行距離</th>
                  <th>年間維持費</th>
                  <th>月間維持費</th>
                  <th>年間合計</th>
                  <th>月間合計</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const modeName = item.mode === 'plugin_ev' ? 'BEV/PHEV/FCV' : 'ガソリン/HV'
                  const distance = Number(item.inputs?.distance)
                  const pt = String(item.inputs?.powertrain ?? '')
                  return (
                    <tr key={item.id}>
                      <td>{formatDate(item.addedAt)}</td>
                      <td>{modeName}</td>
                      <td>{item.carName || '（未選択）'}</td>
                      <td>{pt ? POWERTRAIN_LABELS[pt] || pt : '—'}</td>
                      <td>{Number.isFinite(distance) ? `${distance.toLocaleString('ja-JP')}km` : '—'}</td>
                      <td>{formatYen(item.result?.total)}</td>
                      <td>{formatYen(item.result?.monthly)}</td>
                      <td>{formatYen(item.result?.total_with_vehicle)}</td>
                      <td>{formatYen(item.result?.monthly_with_vehicle)}</td>
                      <td>
                        <button type="button" className="comparison-row-remove" onClick={() => onRemove(item.id)}>
                          削除
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
