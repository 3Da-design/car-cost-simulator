import { useEffect, useMemo, useState } from 'react'
import SpaSectionLead from './ui/SpaSectionLead.jsx'
import CsvExportButton from './ui/CsvExportButton.jsx'
import CsvImportButton from './ui/CsvImportButton.jsx'
import CalcButton from './ui/CalcButton.jsx'
import './SimulatorInput.css'

export default function SimulatorInput({
  fileInputRef,
  importLoading,
  importMessage,
  onExportCsv,
  onImportCsv,
  selectedMaker,
  makerOptions,
  onMakerChange,
  modelOptions,
  onModelChipSelect,
  selectedCarId,
  distance,
  setDistance,
  fuel,
  setFuel,
  gasPrice,
  setGasPrice,
  price,
  setPrice,
  engine,
  setEngine,
  onEngineBlur,
  insurance,
  setInsurance,
  parking,
  setParking,
  inspection,
  setInspection,
  ownershipYears,
  setOwnershipYears,
  onCalculate,
  loading,
}) {
  const initials = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const [modelPickerOpen, setModelPickerOpen] = useState(false)
  const [modelFilterText, setModelFilterText] = useState('')
  const [selectedInitial, setSelectedInitial] = useState('')

  const selectedModelLabel =
    modelOptions.find((model) => model.id === selectedCarId)?.label || '車種を選択'
  const filteredModelOptions = useMemo(() => {
    const keyword = modelFilterText.trim().toLowerCase()
    return modelOptions.filter((model) => {
      const label = model.label || ''
      const matchesKeyword = !keyword || label.toLowerCase().includes(keyword)
      const matchesInitial =
        !selectedInitial || label.trim().toUpperCase().startsWith(selectedInitial)
      return matchesKeyword && matchesInitial
    })
  }, [modelOptions, modelFilterText, selectedInitial])

  useEffect(() => {
    if (!modelPickerOpen) return
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setModelPickerOpen(false)
        setModelFilterText('')
        setSelectedInitial('')
      }
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [modelPickerOpen])

  const handleModelPick = (id) => {
    onModelChipSelect(id)
    setModelPickerOpen(false)
    setModelFilterText('')
    setSelectedInitial('')
  }

  const handleMakerSelect = (e) => {
    onMakerChange(e)
    setModelPickerOpen(false)
    setModelFilterText('')
    setSelectedInitial('')
  }

  return (
    <section className="form-section" id="simulation-input">
      <div className="form-section-header">
        <SpaSectionLead eyebrow="Input">入力</SpaSectionLead>
        <div className="csv-tools">
          <CsvExportButton onClick={onExportCsv} />
          <CsvImportButton
            onClick={() => fileInputRef.current?.click()}
            disabled={importLoading}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={onImportCsv}
            style={{ display: 'none' }}
          />
        </div>
      </div>
      <div className="input-block">
        <h3 className="input-block-title">車・スペック</h3>
        <p className="field-hint">
          メーカーから車種を選ぶと、車両価格・排気量・燃費などが自動入力されます。
        </p>
        <div className="form-grid form-grid--car-spec">
          <label className="car-spec-row-wide">
            メーカー
            <select
              value={selectedMaker}
              onChange={handleMakerSelect}
            >
              <option value="">メーカーを選択</option>
              {makerOptions.map((maker) => (
                <option key={maker} value={maker}>
                  {maker}
                </option>
              ))}
            </select>
          </label>
          {selectedMaker && (
            <label className="car-spec-row-wide model-select-row model-select-row--appear">
              車種（選択）
              <button
                type="button"
                className="model-picker-trigger"
                onClick={() => setModelPickerOpen(true)}
                disabled={modelOptions.length === 0}
              >
                {selectedModelLabel}
              </button>
            </label>
          )}
          <label>
            車両価格（円）
            <input
              type="number"
              min="0"
              placeholder="例: 2500000"
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
              placeholder="例: 1.500"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              onBlur={onEngineBlur}
            />
          </label>
          <label>
            燃費（km/L）
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="例: 20.5"
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="input-block">
        <h3 className="input-block-title">走行・ガソリン</h3>
        <p className="field-hint">
          ガソリン価格は地域や時期で変わるため、入力値は目安の例です。
        </p>
        <div className="form-grid">
          <label>
            年間走行距離（km）
            <input
              type="number"
              min="0"
              placeholder="例: 10000"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </label>
          <label>
            ガソリン価格（円/L）
            <input
              type="number"
              min="0"
              placeholder="例: 170（相場は変動します）"
              value={gasPrice}
              onChange={(e) => setGasPrice(e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="input-block">
        <h3 className="input-block-title">毎年かかるお金</h3>
        <div className="form-grid">
          <label>
            任意保険（円/年）
            <input
              type="number"
              min="0"
              placeholder="例: 80000"
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
            />
          </label>
          <label>
            駐車場（円/月）
            <input
              type="number"
              min="0"
              placeholder="例: 5000"
              value={parking}
              onChange={(e) => setParking(e.target.value)}
            />
          </label>
          <label>
            車検費用（2年分・円）
            <input
              type="number"
              min="0"
              placeholder="例: 100000（2年分の目安）"
              value={inspection}
              onChange={(e) => setInspection(e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="input-block">
        <h3 className="input-block-title">シミュレーションの前提</h3>
        <div className="form-grid">
          <label>
            保有年数（年）
            <input
              type="number"
              min="1"
              step="1"
              placeholder="例: 5"
              value={ownershipYears}
              onChange={(e) => setOwnershipYears(e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="form-actions">
        <CalcButton onClick={onCalculate} loading={loading} />
      </div>
      {importMessage && (
        <p className={importMessage.type === 'success' ? 'import-success' : 'error'}>
          {importMessage.text}
        </p>
      )}
      {modelPickerOpen && (
        <div className="model-picker-modal-overlay" role="dialog" aria-modal="true" aria-label="車種選択">
          <div className="model-picker-modal">
            <div className="model-picker-modal-header">
              <h4>車種を選択</h4>
              <button
                type="button"
                className="model-picker-close"
                onClick={() => {
                  setModelPickerOpen(false)
                  setModelFilterText('')
                  setSelectedInitial('')
                }}
              >
                閉じる
              </button>
            </div>
            <input
              type="text"
              className="model-picker-search"
              placeholder="車種を絞り込み"
              value={modelFilterText}
              onChange={(e) => setModelFilterText(e.target.value)}
            />
            <div className="model-initial-filter" role="group" aria-label="頭文字フィルター">
              <button
                type="button"
                className={`model-initial-chip ${selectedInitial === '' ? 'model-initial-chip--active' : ''}`}
                onClick={() => setSelectedInitial('')}
              >
                すべて
              </button>
              {initials.map((initial) => (
                <button
                  key={initial}
                  type="button"
                  className={`model-initial-chip ${selectedInitial === initial ? 'model-initial-chip--active' : ''}`}
                  onClick={() => setSelectedInitial(initial)}
                >
                  {initial}
                </button>
              ))}
            </div>
            <div className="model-picker-list" role="listbox" aria-label="車種候補リスト">
              {filteredModelOptions.length === 0 ? (
                <p className="model-chip-empty">該当車種がありません</p>
              ) : (
                filteredModelOptions.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    className={`model-list-item ${model.id === selectedCarId ? 'model-list-item--selected' : ''}`}
                    onClick={() => handleModelPick(model.id)}
                  >
                    {model.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
