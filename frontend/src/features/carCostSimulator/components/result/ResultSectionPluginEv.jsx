import { forwardRef, useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import SpaSectionLead from '../../../../components/SpaSectionLead.jsx'
import ResultDownloadButton from '../../../../components/ResultDownloadButton.jsx'
import './ResultSection.css'

ChartJS.register(ArcElement, Tooltip)

const doughnutSegmentLabelsPlugin = {
  id: 'doughnutSegmentLabels',
  afterDatasetsDraw(chart) {
    const meta = chart.getDatasetMeta(0)
    if (!meta?.visible || !meta.data?.length) return

    const labels = chart.data.labels
    const { ctx } = chart
    ctx.save()

    const w = chart.width
    const fontSize = Math.max(10, Math.min(12, Math.round(w / 26)))
    ctx.font = `600 ${fontSize}px system-ui, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Noto Sans JP", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    meta.data.forEach((element, i) => {
      if (element.skip || element.hidden) return
      const label = labels[i]
      if (label == null || label === '') return

      const { x, y, startAngle, endAngle, innerRadius, outerRadius } = element.getProps(
        ['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius'],
        true
      )

      const span = endAngle - startAngle
      if (!Number.isFinite(span) || span < 0.14) return

      const midAngle = startAngle + span / 2
      const midR = (innerRadius + outerRadius) / 2
      const tx = x + Math.cos(midAngle) * midR
      const ty = y + Math.sin(midAngle) * midR

      const chord = 2 * midR * Math.sin(span / 2)
      if (chord < ctx.measureText(String(label)).width * 0.85) return

      ctx.lineWidth = Math.max(2, fontSize / 5)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.lineJoin = 'round'
      ctx.miterLimit = 2
      ctx.strokeText(String(label), tx, ty)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(String(label), tx, ty)
    })

    ctx.restore()
  },
}

function getChartColors(count) {
  const keys = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5', '--chart-6']
  const style = getComputedStyle(document.documentElement)
  return keys.slice(0, count).map((v) => style.getPropertyValue(v).trim())
}

function formatPctOfTotal(value, total) {
  if (total == null || total <= 0 || !Number.isFinite(value)) return '—'
  return `${((value / total) * 100).toFixed(1)}%`
}

function formatYenDisplay(n) {
  const x = Number(n)
  if (n === '' || n == null || !Number.isFinite(x)) return '—'
  return `${x.toLocaleString('ja-JP')}円`
}

const PT_JA = { bev: 'BEV', phev: 'PHEV', fcv: '燃料電池（FCV）' }

/**
 * @param {object} props
 * @param {import('../../types/simulator.types.js').CalcResultPluginEv} props.result
 * @param {() => void} props.onDownloadResult
 * @param {import('../../types/simulator.types.js').ResultAssumptionsPluginEv} [props.assumptions]
 */
const ResultSectionPluginEv = forwardRef(function ResultSectionPluginEv(
  { result, onDownloadResult, assumptions = {} },
  ref
) {
  const {
    carName = '',
    distance = '',
    fuel = '',
    gasPrice = '',
    engine = '',
    price = '',
    insurance = '',
    parking = '',
    inspection = '',
    ownershipYears = '',
    powertrain = '',
    electricWhPerKm = '',
    hydrogenKmPerKg = '',
    electricityPrice = '',
    hydrogenPrice = '',
    phevEvRatio = '',
  } = assumptions

  const pt = result?.powertrain || powertrain || 'bev'

  const derived = useMemo(() => {
    const distNum = Number(distance) || 0
    const perKmMaint = distNum > 0 && result ? result.total / distNum : null
    const perKmWithVehicle = distNum > 0 && result ? result.total_with_vehicle / distNum : null
    return { perKmMaint, perKmWithVehicle, distNum }
  }, [distance, result])

  const { chartData, maintenanceRows } = useMemo(() => {
    if (!result) {
      return { chartData: null, maintenanceRows: [] }
    }
    const rows = []
    const labels = []
    const data = []

    if (result.electricity_cost > 0) {
      rows.push({
        key: 'electric',
        label: '電気代',
        amount: result.electricity_cost,
        pct: formatPctOfTotal(result.electricity_cost, result.total),
        mod: 'breakdown-item--gas',
      })
      labels.push('電気代')
      data.push(result.electricity_cost)
    }
    if (result.gasoline_cost > 0) {
      rows.push({
        key: 'gasoline',
        label: 'ガソリン',
        amount: result.gasoline_cost,
        pct: formatPctOfTotal(result.gasoline_cost, result.total),
        mod: 'breakdown-item--gas',
      })
      labels.push('ガソリン')
      data.push(result.gasoline_cost)
    }
    if (result.hydrogen_cost > 0) {
      rows.push({
        key: 'hydrogen',
        label: '水素',
        amount: result.hydrogen_cost,
        pct: formatPctOfTotal(result.hydrogen_cost, result.total),
        mod: 'breakdown-item--gas',
      })
      labels.push('水素')
      data.push(result.hydrogen_cost)
    }

    rows.push(
      {
        key: 'tax',
        label: '税金',
        amount: result.tax,
        pct: formatPctOfTotal(result.tax, result.total),
        mod: 'breakdown-item--tax',
      },
      {
        key: 'inspection',
        label: '車検',
        amount: result.inspection_annual,
        pct: formatPctOfTotal(result.inspection_annual, result.total),
        mod: 'breakdown-item--inspection',
      },
      {
        key: 'insurance',
        label: '保険',
        amount: result.insurance,
        pct: formatPctOfTotal(result.insurance, result.total),
        mod: 'breakdown-item--insurance',
      },
      {
        key: 'parking',
        label: '駐車場',
        amount: result.parking_annual,
        pct: formatPctOfTotal(result.parking_annual, result.total),
        mod: 'breakdown-item--parking',
      }
    )
    labels.push('税金', '車検', '保険', '駐車場')
    data.push(result.tax, result.inspection_annual, result.insurance, result.parking_annual)

    const cd = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: getChartColors(labels.length),
          borderWidth: 0,
        },
      ],
    }
    return { chartData: cd, maintenanceRows: rows }
  }, [result])

  const vehiclePct = result
    ? formatPctOfTotal(result.vehicle_annual, result.total_with_vehicle)
    : '—'

  const displayCarName = carName.trim() ? carName : '（未選択）'

  if (!result) return null

  return (
    <section ref={ref} className="result-section" id="simulation-result" aria-label="計算結果">
      <div className="result-section-header">
        <SpaSectionLead eyebrow="Result · BEV/PHEV/FCV">結果</SpaSectionLead>
        <ResultDownloadButton onClick={onDownloadResult} />
      </div>
      <div className="result-main">
        <p className="result-plugin-note" role="note">
          税金は排気量ベースの簡易計算です。ゼロエミッション車の減税・減免は反映していません。
        </p>
        <div className="result-assumptions" aria-labelledby="result-assumptions-heading">
          <h3 id="result-assumptions-heading" className="result-subcard-title">
            計算の前提
          </h3>
          <dl className="result-assumptions-grid">
            <div className="result-assumptions-row result-assumptions-row--full">
              <dt>車種</dt>
              <dd className="result-assumptions-value result-assumptions-value--car" title={displayCarName}>
                {displayCarName}
              </dd>
            </div>
            <div className="result-assumptions-row">
              <dt>区分</dt>
              <dd>{PT_JA[pt] ?? pt}</dd>
            </div>
            <div className="result-assumptions-row">
              <dt>年間走行距離</dt>
              <dd>{distance !== '' && distance != null ? `${Number(distance).toLocaleString('ja-JP')} km` : '—'}</dd>
            </div>
            {(pt === 'bev' || pt === 'phev') && (
              <>
                <div className="result-assumptions-row">
                  <dt>電費（Wh/km）</dt>
                  <dd>{electricWhPerKm !== '' && electricWhPerKm != null ? `${electricWhPerKm} Wh/km` : '—'}</dd>
                </div>
                <div className="result-assumptions-row">
                  <dt>電気単価</dt>
                  <dd>
                    {electricityPrice !== '' && electricityPrice != null
                      ? `${Number(electricityPrice).toLocaleString('ja-JP')} 円/kWh`
                      : '—'}
                  </dd>
                </div>
              </>
            )}
            {pt === 'phev' && (
              <>
                <div className="result-assumptions-row">
                  <dt>ガソリン時燃費</dt>
                  <dd>{fuel !== '' && fuel != null ? `${fuel} km/L` : '—'}</dd>
                </div>
                <div className="result-assumptions-row">
                  <dt>ガソリン価格</dt>
                  <dd>{gasPrice !== '' && gasPrice != null ? `${Number(gasPrice).toLocaleString('ja-JP')} 円/L` : '—'}</dd>
                </div>
                <div className="result-assumptions-row">
                  <dt>電気走行の割合</dt>
                  <dd>
                    {phevEvRatio !== '' && phevEvRatio != null ? `${Number(phevEvRatio).toLocaleString('ja-JP')}` : '—'}
                  </dd>
                </div>
              </>
            )}
            {pt === 'fcv' && (
              <>
                <div className="result-assumptions-row">
                  <dt>水素費</dt>
                  <dd>{hydrogenKmPerKg !== '' && hydrogenKmPerKg != null ? `${hydrogenKmPerKg} km/kg` : '—'}</dd>
                </div>
                <div className="result-assumptions-row">
                  <dt>水素単価</dt>
                  <dd>
                    {hydrogenPrice !== '' && hydrogenPrice != null
                      ? `${Number(hydrogenPrice).toLocaleString('ja-JP')} 円/kg`
                      : '—'}
                  </dd>
                </div>
              </>
            )}
            <div className="result-assumptions-row">
              <dt>排気量</dt>
              <dd>{engine !== '' && engine != null ? `${engine} L` : '—'}</dd>
            </div>
            <div className="result-assumptions-row">
              <dt>車両価格</dt>
              <dd>{formatYenDisplay(price)}</dd>
            </div>
            <div className="result-assumptions-row">
              <dt>保有年数</dt>
              <dd>
                {ownershipYears !== '' && ownershipYears != null
                  ? `${ownershipYears} 年`
                  : '—'}
              </dd>
            </div>
            <div className="result-assumptions-row">
              <dt>任意保険</dt>
              <dd>
                {insurance !== '' && insurance != null && Number.isFinite(Number(insurance))
                  ? `${Number(insurance).toLocaleString('ja-JP')}円/年`
                  : '—'}
              </dd>
            </div>
            <div className="result-assumptions-row">
              <dt>駐車場</dt>
              <dd>
                {parking !== '' && parking != null
                  ? `${Number(parking).toLocaleString('ja-JP')}円/月`
                  : '—'}
              </dd>
            </div>
            <div className="result-assumptions-row">
              <dt>車検費用（2年分）</dt>
              <dd>{formatYenDisplay(inspection)}</dd>
            </div>
          </dl>
        </div>

        <div className="result-derived" aria-labelledby="result-derived-heading">
          <h3 id="result-derived-heading" className="result-subcard-title">
            目安
          </h3>
          <dl className="result-derived-grid">
            <div className="result-derived-row">
              <dt>年間エネルギー費（電気・ガソリン・水素の合計）</dt>
              <dd className="result-derived-value">{result.energy_cost.toLocaleString('ja-JP')}円</dd>
            </div>
            <div className="result-derived-row">
              <dt>1kmあたり（維持費）</dt>
              <dd className="result-derived-value">
                {derived.perKmMaint != null
                  ? `${derived.perKmMaint.toLocaleString('ja-JP', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} 円/km`
                  : '—'}
              </dd>
            </div>
            <div className="result-derived-row">
              <dt>1kmあたり（車両込み）</dt>
              <dd className="result-derived-value">
                {derived.perKmWithVehicle != null
                  ? `${derived.perKmWithVehicle.toLocaleString('ja-JP', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} 円/km`
                  : '—'}
              </dd>
            </div>
          </dl>
          {derived.distNum <= 0 ? (
            <p className="result-derived-footnote" role="note">
              年間走行距離が0のため、1kmあたりは算出できません。
            </p>
          ) : null}
        </div>

        <div className="result-summary">
          <div className="result-summary-card">
            <dl className="result-summary-table">
              <div className="result-summary-row">
                <dt className="result-summary-dt">年間維持費</dt>
                <dd className="result-summary-dd" aria-label={`年間維持費 ${result.total.toLocaleString()}円`}>
                  {result.total.toLocaleString()}円
                </dd>
              </div>
              <div className="result-summary-row">
                <dt className="result-summary-dt">月間維持費</dt>
                <dd className="result-summary-dd">{result.monthly.toLocaleString()}円</dd>
              </div>
              <div className="result-summary-row">
                <dt className="result-summary-dt">
                  年間合計（総額
                  <span className="result-info">
                    <button type="button" className="result-info-mark" aria-label="総額*の内訳を表示">
                      ※
                    </button>
                    <span className="result-info-body" role="tooltip">
                      維持費 + 車両価格（年換算）
                    </span>
                  </span>
                  ）
                </dt>
                <dd className="result-summary-dd">{result.total_with_vehicle.toLocaleString()}円</dd>
              </div>
              <div className="result-summary-row">
                <dt className="result-summary-dt">
                  月間合計（総額
                  <span className="result-info">
                    <button type="button" className="result-info-mark" aria-label="総額*の内訳を表示">
                      ※
                    </button>
                    <span className="result-info-body" role="tooltip">
                      維持費 + 車両価格（年換算）÷12
                    </span>
                  </span>
                  ）
                </dt>
                <dd className="result-summary-dd">{result.monthly_with_vehicle.toLocaleString()}円</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="breakdown">
          <h3>内訳</h3>
          <p className="breakdown-pct-note">
            エネルギー系と税金・車検・保険・駐車場の％は<strong>年間維持費</strong>に対する割合です（区分により行数が変わります）。車両価格は<strong>総額（維持費＋車両）</strong>に対する割合です。
          </p>
          <ul>
            {maintenanceRows.map((row) => (
              <li key={row.key} className={`breakdown-item ${row.mod}`}>
                <span className="breakdown-item-label">{row.label}</span>
                <span className="breakdown-item-value">{row.amount.toLocaleString()}円</span>
                <span className="breakdown-item-pct" aria-label={`${row.label} 年間維持費に占める割合 ${row.pct}`}>
                  {row.pct}
                </span>
              </li>
            ))}
            <li className="breakdown-item breakdown-item--vehicle">
              <span className="breakdown-item-label">車両価格（年換算）</span>
              <span className="breakdown-item-value">{result.vehicle_annual.toLocaleString()}円</span>
              <span className="breakdown-item-pct" aria-label={`車両価格 総額に占める割合 ${vehiclePct}`}>
                {vehiclePct}
              </span>
            </li>
          </ul>
        </div>
        {chartData && (
          <div className="chart-wrap">
            <h3>グラフ</h3>
            <p className="chart-caption">年間維持費の内訳（車両価格は含みません）</p>
            <Doughnut
              data={chartData}
              plugins={[doughnutSegmentLabelsPlugin]}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                cutout: '60%',
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      title(items) {
                        const item = items[0]
                        return item?.label != null ? String(item.label) : ''
                      },
                      label(ctx) {
                        const v = ctx.dataset.data[ctx.dataIndex]
                        return Number(v).toLocaleString() + '円'
                      },
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </section>
  )
})

export default ResultSectionPluginEv
