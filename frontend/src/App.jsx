import { useState, useEffect, useRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import './App.css'

ChartJS.register(ArcElement, Tooltip, Legend)

const API_BASE = '/api'
const CAR_SEARCH_PLACEHOLDER = 'メーカー・車種で検索（例: Toyota Aqua）'

function getChartColors() {
  const style = getComputedStyle(document.documentElement)
  return ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'].map(
    (v) => style.getPropertyValue(v).trim()
  )
}

function App() {
  const [cars, setCars] = useState([])
  const [selectedCarId, setSelectedCarId] = useState('')
  const [distance, setDistance] = useState(10000)
  const [gasPrice, setGasPrice] = useState(170)
  const [insurance, setInsurance] = useState(80000)
  const [parking, setParking] = useState(5000)
  const [inspection, setInspection] = useState(100000)
  const [fuel, setFuel] = useState('')
  const [engine, setEngine] = useState('')
  const [price, setPrice] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [importMessage, setImportMessage] = useState(null)
  const [importLoading, setImportLoading] = useState(false)
  const [carSearchText, setCarSearchText] = useState(CAR_SEARCH_PLACEHOLDER)
  const [carDropdownOpen, setCarDropdownOpen] = useState(false)
  const [carHighlightedIndex, setCarHighlightedIndex] = useState(0)
  const fileInputRef = useRef(null)

  const fetchCars = () => {
    return fetch(`${API_BASE}/cars.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) {
          setError(data.error)
          return []
        }
        const list = Array.isArray(data) ? data : []
        setCars(list)
        setError(null)
        return list
      })
      .catch(() => {
        setError('車一覧の取得に失敗しました')
        return []
      })
  }

  useEffect(() => {
    fetchCars()
  }, [])

  useEffect(() => {
    if (!selectedCarId || !cars.length) return
    const car = cars.find((c) => String(c.id) === selectedCarId)
    if (car) {
      setFuel(String(car.fuel))
      setEngine(String(car.engine))
      setPrice(String(car.price))
      setInspection(car.inspection ?? 100000)
      setCarSearchText(car.maker && car.model ? `${car.maker} ${car.model}` : (car.name || ''))
    }
  }, [selectedCarId, cars])

  useEffect(() => {
    setCarHighlightedIndex(0)
  }, [carSearchText])

  const isInitialSearch = carSearchText === CAR_SEARCH_PLACEHOLDER
  const hasSearchText = carSearchText.trim().length > 0
  const carDisplayName = (c) => (c.maker && c.model ? `${c.maker} ${c.model}` : (c.name || ''))
  const carFiltered =
    isInitialSearch || !hasSearchText
      ? []
      : cars
          .filter((c) =>
            carDisplayName(c).toLowerCase().includes(carSearchText.trim().toLowerCase())
          )
          .slice(0, 10)
  const carHighlightedSafe = carFiltered.length ? Math.min(carHighlightedIndex, carFiltered.length - 1) : 0

  const handleCarSelect = (car) => {
    setSelectedCarId(String(car.id))
    setCarSearchText(car.maker && car.model ? `${car.maker} ${car.model}` : (car.name || ''))
    setCarDropdownOpen(false)
  }

  const handleCarKeyDown = (e) => {
    if (!carDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault()
        setCarDropdownOpen(true)
        setCarHighlightedIndex(0)
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCarHighlightedIndex((i) => (i < carFiltered.length - 1 ? i + 1 : i))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCarHighlightedIndex((i) => (i > 0 ? i - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (carFiltered[carHighlightedSafe]) {
        handleCarSelect(carFiltered[carHighlightedSafe])
      }
    } else if (e.key === 'Escape') {
      setCarDropdownOpen(false)
    }
  }

  const handleCalculate = () => {
    setError(null)
    setResult(null)
    setLoading(true)
    fetch(`${API_BASE}/calc.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        distance: Number(distance) || 0,
        fuel: Number(fuel) || 0,
        gas_price: Number(gasPrice) || 0,
        insurance: Number(insurance) || 0,
        parking: Number(parking) || 0,
        engine: Number(engine) || 0,
        inspection: Number(inspection) || 0,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setResult(data)
      })
      .catch(() => setError('計算に失敗しました'))
      .finally(() => setLoading(false))
  }

  const handleExportCsv = () => {
    fetch(`${API_BASE}/cars_export.php`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.text()
      })
      .then((text) => {
        const blob = new Blob(['\uFEFF' + text], { type: 'text/csv; charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'cars.csv'
        a.click()
        URL.revokeObjectURL(url)
      })
      .catch(() => setError('エクスポートに失敗しました。バックエンドが起動しているか確認してください（npm run dev）。'))
  }

  const handleImportCsv = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportMessage(null)
    setImportLoading(true)
    const formData = new FormData()
    formData.append('csv', file)
    fetch(`${API_BASE}/cars_import.php`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          const text = data.detail ? `${data.error}: ${data.detail}` : data.error
          setImportMessage({ type: 'error', text })
          return
        }
        setImportMessage({ type: 'success', text: `${data.imported} 件インポートしました` })
        fetchCars()
      })
      .catch(() => setImportMessage({ type: 'error', text: 'インポートに失敗しました' }))
      .finally(() => {
        setImportLoading(false)
        e.target.value = ''
      })
  }

  const escapeCsvCell = (v) => {
    const s = String(v ?? '')
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const handleDownloadResult = () => {
    if (!result) return
    const headers = [
      '車種',
      '年間走行距離(km)',
      '燃費(km/L)',
      'ガソリン価格(円/L)',
      '車両価格(円)',
      '排気量(cc)',
      '任意保険(円/年)',
      '駐車場(円/月)',
      '車検費用(2年分・円)',
      '年間維持費(円)',
      '月間維持費(円)',
      'ガソリン(円)',
      '税金(円)',
      '車検(円)',
      '保険(円)',
      '駐車場(円)',
    ]
    const row = [
      carSearchText,
      distance,
      fuel,
      gasPrice,
      price,
      engine,
      insurance,
      parking,
      inspection,
      result.total,
      result.monthly,
      result.gas_cost,
      result.tax,
      result.inspection_annual,
      result.insurance,
      result.parking_annual,
    ].map(escapeCsvCell)
    const csv = '\uFEFF' + headers.join(',') + '\n' + row.join(',')
    const blob = new Blob([csv], { type: 'text/csv; charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `維持費シミュレーション結果_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
    <div className="app">
      <header className="header">
        <h1>車の維持費シミュレーター</h1>
      </header>

      <main className="main">
        <section className="form-section">
          <div className="form-section-header">
            <h2>入力</h2>
            <div className="csv-tools">
              <button
                type="button"
                className="csv-export-button"
                onClick={handleExportCsv}
              >
                CSVでダウンロード
              </button>
              <button
                type="button"
                className="csv-import-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importLoading}
              >
                CSVをインポート
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCsv}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className="form-grid">
            <label>
              車種
              <div className="car-combobox-wrap">
                <input
                  type="text"
                  className="car-combobox-input"
                  placeholder={CAR_SEARCH_PLACEHOLDER}
                  value={carSearchText}
                  onChange={(e) => setCarSearchText(e.target.value)}
                  onFocus={() => {
                    if (carSearchText === CAR_SEARCH_PLACEHOLDER) {
                      setCarSearchText('')
                    }
                    setCarDropdownOpen(true)
                  }}
                  onBlur={() => setTimeout(() => setCarDropdownOpen(false), 150)}
                  onKeyDown={handleCarKeyDown}
                  aria-autocomplete="list"
                  aria-expanded={carDropdownOpen}
                  aria-controls="car-listbox"
                  aria-activedescendant={carFiltered[carHighlightedSafe] ? `car-option-${carFiltered[carHighlightedSafe].id}` : undefined}
                />
                {carDropdownOpen && (
                  <ul
                    id="car-listbox"
                    className="car-combobox-list"
                    role="listbox"
                    aria-label="車種候補"
                  >
                    {carFiltered.length === 0 ? (
                      <li className="car-combobox-item car-combobox-item--empty" role="option">
                        該当する車種がありません
                      </li>
                    ) : (
                      carFiltered.map((c, i) => (
                        <li
                          key={c.id}
                          id={`car-option-${c.id}`}
                          role="option"
                          aria-selected={String(c.id) === selectedCarId}
                          className={`car-combobox-item ${i === carHighlightedSafe ? 'car-combobox-item--highlight' : ''}`}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleCarSelect(c)
                          }}
                        >
                          {carDisplayName(c)}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            </label>
            <label>
              年間走行距離（km）
              <input
                type="number"
                min="0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </label>
            <label>
              燃費（km/L）
              <input
                type="number"
                step="0.1"
                min="0"
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
              />
            </label>
            <label>
              ガソリン価格（円/L）
              <input
                type="number"
                min="0"
                value={gasPrice}
                onChange={(e) => setGasPrice(e.target.value)}
              />
            </label>
            <label>
              車両価格（円）
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
            <label>
              排気量（L）
              <input
                type="number"
                min="0"
                step="0.001"
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
              />
            </label>
            <label>
              任意保険（円/年）
              <input
                type="number"
                min="0"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
              />
            </label>
            <label>
              駐車場（円/月）
              <input
                type="number"
                min="0"
                value={parking}
                onChange={(e) => setParking(e.target.value)}
              />
            </label>
            <label>
              車検費用（2年分・円）
              <input
                type="number"
                min="0"
                value={inspection}
                onChange={(e) => setInspection(e.target.value)}
              />
            </label>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="calc-button"
              onClick={handleCalculate}
              disabled={loading}
            >
              {loading ? '計算中…' : '計算'}
            </button>
          </div>
          {importMessage && (
            <p className={importMessage.type === 'success' ? 'import-success' : 'error'}>
              {importMessage.text}
            </p>
          )}
        </section>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {result && (
          <section className="result-section">
            <div className="result-section-header">
              <h2>結果</h2>
              <button
                type="button"
                className="result-download-button"
                onClick={handleDownloadResult}
              >
                入力・結果をダウンロード
              </button>
            </div>
            <div className="result-summary">
              <div className="result-block">
                <span className="result-label">年間維持費</span>
                <span className="result-value">{result.total.toLocaleString()}円</span>
              </div>
              <div className="result-block">
                <span className="result-label">月間維持費</span>
                <span className="result-value">{result.monthly.toLocaleString()}円</span>
              </div>
            </div>
            <div className="breakdown">
              <h3>内訳</h3>
              <ul>
                <li>ガソリン: {result.gas_cost.toLocaleString()}円</li>
                <li>税金: {result.tax.toLocaleString()}円</li>
                <li>車検: {result.inspection_annual.toLocaleString()}円</li>
                <li>保険: {result.insurance.toLocaleString()}円</li>
                <li>駐車場: {result.parking_annual.toLocaleString()}円</li>
              </ul>
            </div>
            {chartData && (
              <div className="chart-wrap">
                <Doughnut
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: { position: 'bottom' },
                    },
                  }}
                />
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
