import { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import './App.css'

ChartJS.register(ArcElement, Tooltip, Legend)

const API_BASE = '/api'
const CAR_SEARCH_PLACEHOLDER = '車名で検索（例: Raize）'

function App() {
  const [cars, setCars] = useState([])
  const [selectedCarId, setSelectedCarId] = useState('')
  const [distance, setDistance] = useState(10000)
  const [gasPrice, setGasPrice] = useState(170)
  const [insurance, setInsurance] = useState(80000)
  const [parking, setParking] = useState(20000)
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
      setCarSearchText(car.name)
    }
  }, [selectedCarId, cars])

  useEffect(() => {
    setCarHighlightedIndex(0)
  }, [carSearchText])

  const isInitialSearch = carSearchText === CAR_SEARCH_PLACEHOLDER
  const hasSearchText = carSearchText.trim().length > 0
  const carFiltered =
    isInitialSearch || !hasSearchText
      ? []
      : cars
          .filter((c) =>
            c.name.toLowerCase().includes(carSearchText.trim().toLowerCase())
          )
          .slice(0, 10)
  const carHighlightedSafe = carFiltered.length ? Math.min(carHighlightedIndex, carFiltered.length - 1) : 0

  const handleCarSelect = (car) => {
    setSelectedCarId(String(car.id))
    setCarSearchText(car.name)
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
    window.open(`${API_BASE}/cars_export.php`, '_blank')
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
          setImportMessage({ type: 'error', text: data.error })
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
            backgroundColor: [
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#8b5cf6',
              '#ec4899',
            ],
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
          <h2>入力</h2>
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
                          {c.name}
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
                readOnly
                className="readonly"
              />
            </label>
            <label>
              排気量（cc）
              <input
                type="number"
                min="0"
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
          <button
            type="button"
            className="calc-button"
            onClick={handleCalculate}
            disabled={loading}
          >
            {loading ? '計算中…' : '計算'}
          </button>
          <div className="csv-tools">
            <button
              type="button"
              className="csv-export-button"
              onClick={handleExportCsv}
            >
              CSVでダウンロード
            </button>
            <label className="csv-import-label">
              <span className="csv-import-button">CSVをインポート</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCsv}
                disabled={importLoading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          {importMessage && (
            <p className={importMessage.type === 'success' ? 'import-success' : 'error'}>
              {importMessage.text}
            </p>
          )}
        </section>

        {error && <p className="error">{error}</p>}

        {result && (
          <section className="result-section">
            <h2>結果</h2>
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
