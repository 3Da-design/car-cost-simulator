import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { flushSync } from 'react-dom'
import { API_BASE } from '../../../config/constants.js'
import { escapeCsvCell } from '../../../utils/csv.js'
import { formatEngineToThreeDecimals } from '../../../utils/numberFormat.js'
import { initialSimulatorState } from '../stores/initialState.js'
import { simulatorReducer } from '../stores/simulatorReducer.js'

export function useCarCostSimulator() {
  const [state, dispatch] = useReducer(simulatorReducer, initialSimulatorState)
  const fileInputRef = useRef(null)

  const patch = useCallback((payload) => {
    dispatch({ type: 'UPDATE', payload })
  }, [])

  const fetchCars = useCallback(() => {
    return fetch(`${API_BASE}/cars.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) {
          patch({ error: data.error })
          return []
        }
        const list = Array.isArray(data) ? data : []
        patch({ cars: list, error: null })
        return list
      })
      .catch(() => {
        patch({ error: '車一覧の取得に失敗しました' })
        return []
      })
  }, [patch])

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  useEffect(() => {
    if (!state.selectedCarId || !state.cars.length) return
    const car = state.cars.find((c) => String(c.id) === state.selectedCarId)
    if (car) {
      dispatch({ type: 'HYDRATE_FROM_CAR', payload: car })
    }
  }, [state.selectedCarId, state.cars])

  const carDisplayName = (c) => (c.maker && c.model ? `${c.maker} ${c.model}` : c.name || '')

  const makerOptions = useMemo(
    () => [...new Set(state.cars.map((c) => c.maker).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ja')),
    [state.cars]
  )

  const carsByMaker = useMemo(
    () => (state.selectedMaker ? state.cars.filter((c) => c.maker === state.selectedMaker) : []),
    [state.cars, state.selectedMaker]
  )

  const modelOptions = useMemo(
    () =>
      carsByMaker.map((c) => ({
        id: String(c.id),
        label: c.name || c.model || carDisplayName(c),
      })),
    [carsByMaker]
  )

  const selectedCarName = useMemo(
    () => state.cars.find((c) => String(c.id) === state.selectedCarId)?.name || '',
    [state.cars, state.selectedCarId]
  )

  const handleCarSelect = useCallback(
    (car) => {
      patch({ selectedCarId: String(car.id), selectedMaker: car.maker || '' })
    },
    [patch]
  )

  const handleMakerChange = useCallback(
    (e) => {
      patch({ selectedMaker: e.target.value, selectedCarId: '' })
    },
    [patch]
  )

  const handleModelChipSelect = useCallback(
    (nextCarId) => {
      const selected = carsByMaker.find((c) => String(c.id) === nextCarId)
      if (selected) handleCarSelect(selected)
    },
    [carsByMaker, handleCarSelect]
  )

  const handleCalculate = useCallback(() => {
    patch({ error: null, result: null, loading: true })
    fetch(`${API_BASE}/calc.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        distance: Number(state.distance) || 0,
        fuel: Number(state.fuel) || 0,
        gas_price: Number(state.gasPrice) || 0,
        insurance: Number(state.insurance) || 0,
        parking: Number(state.parking) || 0,
        engine: Number(state.engine) || 0,
        inspection: Number(state.inspection) || 0,
        price: Number(state.price) || 0,
        ownership_years: Number(state.ownershipYears) || 1,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        flushSync(() => {
          dispatch({ type: 'UPDATE', payload: { result: data, activeView: 'result' } })
        })
        window.requestAnimationFrame(() => {
          document.getElementById('simulation-result')?.scrollIntoView({
            block: 'start',
            behavior: 'smooth',
          })
        })
      })
      .catch(() => patch({ error: '計算に失敗しました' }))
      .finally(() => {
        dispatch({ type: 'UPDATE', payload: { loading: false } })
      })
  }, [state.distance, state.fuel, state.gasPrice, state.insurance, state.parking, state.engine, state.inspection, state.price, state.ownershipYears, patch])

  const handleExportCsv = useCallback(() => {
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
      .catch(() =>
        patch({
          error: 'エクスポートに失敗しました。バックエンドが起動しているか確認してください（npm run dev）。',
        })
      )
  }, [patch])

  const handleImportCsv = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      patch({ importMessage: null, importLoading: true })
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
            patch({ importMessage: { type: 'error', text } })
            return
          }
          patch({ importMessage: { type: 'success', text: `${data.imported} 件インポートしました` } })
          fetchCars()
        })
        .catch(() => patch({ importMessage: { type: 'error', text: 'インポートに失敗しました' } }))
        .finally(() => {
          patch({ importLoading: false })
          e.target.value = ''
        })
    },
    [patch, fetchCars]
  )

  const handleDownloadResult = useCallback(() => {
    if (!state.result) return
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
    const r = state.result
    const row = [
      selectedCarName,
      state.distance,
      state.fuel,
      state.gasPrice,
      state.price,
      state.engine,
      state.insurance,
      state.parking,
      state.inspection,
      state.ownershipYears,
      r.total,
      r.monthly,
      r.vehicle_annual,
      r.total_with_vehicle,
      r.monthly_with_vehicle,
      r.gas_cost,
      r.tax,
      r.inspection_annual,
      r.insurance,
      r.parking_annual,
    ].map(escapeCsvCell)
    const csv = '\uFEFF' + headers.join(',') + '\n' + row.join(',')
    const blob = new Blob([csv], { type: 'text/csv; charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `維持費シミュレーション結果_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [state.result, state.distance, state.fuel, state.gasPrice, state.price, state.engine, state.insurance, state.parking, state.inspection, state.ownershipYears, selectedCarName])

  const handleEngineBlur = useCallback(() => {
    if (state.engine === '') return
    patch({ engine: formatEngineToThreeDecimals(state.engine) })
  }, [state.engine, patch])

  const navigateToInput = useCallback(() => {
    flushSync(() => {
      dispatch({ type: 'UPDATE', payload: { activeView: 'input' } })
    })
    window.requestAnimationFrame(() => {
      document.getElementById('simulation-input')?.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      })
      window.history.replaceState(null, '', '#simulation-input')
    })
  }, [])

  const navigateToFooterSection = useCallback(
    (view, sectionId) => {
      const scrollTo = () => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        window.history.replaceState(null, '', `#${sectionId}`)
      }
      if (state.activeView === view) {
        window.requestAnimationFrame(scrollTo)
        return
      }
      flushSync(() => {
        dispatch({ type: 'UPDATE', payload: { activeView: view } })
      })
      window.requestAnimationFrame(scrollTo)
    },
    [state.activeView]
  )

  const setActiveView = useCallback((v) => {
    patch({ activeView: v })
  }, [patch])

  return {
    state,
    fileInputRef,
    makerOptions,
    modelOptions,
    handleMakerChange,
    handleModelChipSelect,
    handleCalculate,
    handleExportCsv,
    handleImportCsv,
    handleDownloadResult,
    handleEngineBlur,
    navigateToInput,
    navigateToFooterSection,
    setActiveView,
    patch,
  }
}
