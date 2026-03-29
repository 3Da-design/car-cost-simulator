import { useState, useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import './App.css'
import { API_BASE } from './constants.js'
import AppHeader from './components/layout/AppHeader.jsx'
import AppFooter from './components/layout/AppFooter.jsx'
import SpaLeftNav from './components/layout/SpaLeftNav.jsx'
import SimulatorIntro from './components/SimulatorIntro.jsx'
import SimulatorInput from './components/SimulatorInput.jsx'
import ResultSection from './components/ResultSection.jsx'

function App() {
  const [cars, setCars] = useState([])
  const [activeView, setActiveView] = useState('intro')
  const [selectedCarId, setSelectedCarId] = useState('')
  const [distance, setDistance] = useState(10000)
  const [gasPrice, setGasPrice] = useState(170)
  const [insurance, setInsurance] = useState(80000)
  const [parking, setParking] = useState(5000)
  const [inspection, setInspection] = useState(100000)
  const [ownershipYears, setOwnershipYears] = useState(5)
  const [fuel, setFuel] = useState('')
  const [engine, setEngine] = useState('')
  const [price, setPrice] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [importMessage, setImportMessage] = useState(null)
  const [importLoading, setImportLoading] = useState(false)
  const [selectedMaker, setSelectedMaker] = useState('')
  const fileInputRef = useRef(null)
  const formatEngineToThreeDecimals = (value) => {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return ''
    return numeric.toFixed(3)
  }

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
      setEngine(formatEngineToThreeDecimals(car.engine))
      setPrice(String(car.price))
      setInspection(car.inspection ?? 100000)
    }
  }, [selectedCarId, cars])

  const carDisplayName = (c) => (c.maker && c.model ? `${c.maker} ${c.model}` : (c.name || ''))
  const makerOptions = [...new Set(cars.map((c) => c.maker).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'ja')
  )
  const carsByMaker = selectedMaker
    ? cars.filter((c) => c.maker === selectedMaker)
    : []
  const modelOptions = carsByMaker.map((c) => ({
    id: String(c.id),
    label: c.name || c.model || carDisplayName(c),
  }))
  const selectedCarName = cars.find((c) => String(c.id) === selectedCarId)?.name || ''

  const handleCarSelect = (car) => {
    setSelectedCarId(String(car.id))
    setSelectedMaker(car.maker || '')
  }

  const handleMakerChange = (e) => {
    const nextMaker = e.target.value
    setSelectedMaker(nextMaker)
    setSelectedCarId('')
  }

  const handleModelChipSelect = (nextCarId) => {
    const selected = carsByMaker.find((c) => String(c.id) === nextCarId)
    if (selected) {
      handleCarSelect(selected)
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
        price: Number(price) || 0,
        ownership_years: Number(ownershipYears) || 1,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        flushSync(() => {
          setResult(data)
          setActiveView('result')
        })
        window.requestAnimationFrame(() => {
          document.getElementById('simulation-result')?.scrollIntoView({
            block: 'start',
            behavior: 'smooth',
          })
        })
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
      '保有年数(年)',
      '年間維持費(円)',
      '月間維持費(円)',
      '車両価格年換算(円)',
      '年間合計(維持費+車両価格)(円)',
      '月間合計(維持費+車両価格)(円)',
      'ガソリン(円)',
      '税金(円)',
      '車検(円)',
      '保険(円)',
      '駐車場(円)',
    ]
    const row = [
      selectedCarName,
      distance,
      fuel,
      gasPrice,
      price,
      engine,
      insurance,
      parking,
      inspection,
      ownershipYears,
      result.total,
      result.monthly,
      result.vehicle_annual,
      result.total_with_vehicle,
      result.monthly_with_vehicle,
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

  const handleEngineBlur = () => {
    if (engine === '') return
    setEngine(formatEngineToThreeDecimals(engine))
  }

  const errorAlert =
    error != null && error !== '' ? (
      <p className="error" role="alert">
        {error}
      </p>
    ) : null

  const navItems = [
    { id: 'intro', label: '概要', icon: 'fa-circle-info' },
    { id: 'input', label: '入力', icon: 'fa-keyboard' },
    { id: 'result', label: '結果', icon: 'fa-chart-pie', disabled: !result },
  ]

  const navigateToInput = () => {
    flushSync(() => {
      setActiveView('input')
    })
    window.requestAnimationFrame(() => {
      document.getElementById('simulation-input')?.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      })
      window.history.replaceState(null, '', '#simulation-input')
    })
  }

  const navigateToFooterSection = (view, sectionId) => {
    const scrollTo = () => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.replaceState(null, '', `#${sectionId}`)
    }
    if (activeView === view) {
      window.requestAnimationFrame(scrollTo)
      return
    }
    flushSync(() => {
      setActiveView(view)
    })
    window.requestAnimationFrame(scrollTo)
  }

  const renderMainContent = () => {
    if (activeView === 'intro') return <SimulatorIntro onGoToInput={navigateToInput} />
    if (activeView === 'input') {
      return (
        <main className="main">
          <SimulatorInput
            fileInputRef={fileInputRef}
            importLoading={importLoading}
            importMessage={importMessage}
            onExportCsv={handleExportCsv}
            onImportCsv={handleImportCsv}
            selectedMaker={selectedMaker}
            makerOptions={makerOptions}
            onMakerChange={handleMakerChange}
            modelOptions={modelOptions}
            onModelChipSelect={handleModelChipSelect}
            selectedCarId={selectedCarId}
            distance={distance}
            setDistance={setDistance}
            fuel={fuel}
            setFuel={setFuel}
            gasPrice={gasPrice}
            setGasPrice={setGasPrice}
            price={price}
            setPrice={setPrice}
            engine={engine}
            setEngine={setEngine}
            onEngineBlur={handleEngineBlur}
            insurance={insurance}
            setInsurance={setInsurance}
            parking={parking}
            setParking={setParking}
            inspection={inspection}
            setInspection={setInspection}
            ownershipYears={ownershipYears}
            setOwnershipYears={setOwnershipYears}
            onCalculate={handleCalculate}
            loading={loading}
          />
          {errorAlert}
        </main>
      )
    }
    if (!result) {
      return (
        <main className="main">
          <p className="error" role="alert">
            先に入力画面で計算を実行してください。
          </p>
        </main>
      )
    }
    return (
      <main className="main">
        <ResultSection result={result} onDownloadResult={handleDownloadResult} />
      </main>
    )
  }

  return (
    <div className="app">
      <AppHeader hasResult={Boolean(result)} showNav={false} />
      <div className="spa-layout">
        <SpaLeftNav items={navItems} activeId={activeView} onSelect={setActiveView} />
        <section className="content-pane">
          {renderMainContent()}
        </section>
      </div>
      <AppFooter hasResult={Boolean(result)} onNavigateToSection={navigateToFooterSection} />
    </div>
  )
}

export default App
