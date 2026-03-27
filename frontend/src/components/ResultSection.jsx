import { forwardRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
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

function getChartColors() {
  const style = getComputedStyle(document.documentElement)
  return ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'].map(
    (v) => style.getPropertyValue(v).trim()
  )
}

const ResultSection = forwardRef(function ResultSection({ result, onDownloadResult }, ref) {
  const chartData = result
    ? {
        labels: ['ガソリン', '税金', '車検', '保険', '駐車場'],
        datasets: [
          {
            data: [
              result.gas_cost,
              result.tax,
              result.inspection_annual,
              result.insurance,
              result.parking_annual,
            ],
            backgroundColor: getChartColors(),
            borderWidth: 0,
          },
        ],
      }
    : null

  return (
    <section ref={ref} className="result-section" id="simulation-result" aria-label="計算結果">
      <div className="result-section-header">
        <h2>結果</h2>
        <button
          type="button"
          className="result-download-button"
          onClick={onDownloadResult}
        >
          入力・結果をダウンロード
        </button>
      </div>
      <div className="result-main">
        <div className="result-summary">
        <div className="result-block">
          <span className="result-label">年間維持費</span>
          <span className="result-value">{result.total.toLocaleString()}円</span>
        </div>
        <div className="result-block">
          <span className="result-label">月間維持費</span>
          <span className="result-value">{result.monthly.toLocaleString()}円</span>
        </div>
        <div className="result-block">
          <span className="result-label">
            年間合計（総額
            <span className="result-info">
              <button
                type="button"
                className="result-info-mark"
                aria-label="総額*の内訳を表示"
              >
                ※
              </button>
              <span className="result-info-body" role="tooltip">
                維持費 + 車両価格（年換算）
              </span>
            </span>
            ）
          </span>
          <span className="result-value">{result.total_with_vehicle.toLocaleString()}円</span>
        </div>
        <div className="result-block">
          <span className="result-label">
            月間合計（総額
            <span className="result-info">
              <button
                type="button"
                className="result-info-mark"
                aria-label="総額*の内訳を表示"
              >
                ※
              </button>
              <span className="result-info-body" role="tooltip">
                維持費 + 車両価格（年換算）÷12
              </span>
            </span>
            ）
          </span>
          <span className="result-value">{result.monthly_with_vehicle.toLocaleString()}円</span>
        </div>
        </div>
        <div className="breakdown">
          <h3>内訳</h3>
          <ul>
          <li className="breakdown-item breakdown-item--gas">
            <span className="breakdown-item-label">ガソリン</span>
            <span className="breakdown-item-value">{result.gas_cost.toLocaleString()}円</span>
          </li>
          <li className="breakdown-item breakdown-item--tax">
            <span className="breakdown-item-label">税金</span>
            <span className="breakdown-item-value">{result.tax.toLocaleString()}円</span>
          </li>
          <li className="breakdown-item breakdown-item--inspection">
            <span className="breakdown-item-label">車検</span>
            <span className="breakdown-item-value">{result.inspection_annual.toLocaleString()}円</span>
          </li>
          <li className="breakdown-item breakdown-item--insurance">
            <span className="breakdown-item-label">保険</span>
            <span className="breakdown-item-value">{result.insurance.toLocaleString()}円</span>
          </li>
          <li className="breakdown-item breakdown-item--parking">
            <span className="breakdown-item-label">駐車場</span>
            <span className="breakdown-item-value">{result.parking_annual.toLocaleString()}円</span>
          </li>
          <li className="breakdown-item breakdown-item--vehicle">
            <span className="breakdown-item-label">車両価格（年換算）</span>
            <span className="breakdown-item-value">{result.vehicle_annual.toLocaleString()}円</span>
          </li>
          </ul>
        </div>
        {chartData && (
          <div className="chart-wrap">
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

export default ResultSection
