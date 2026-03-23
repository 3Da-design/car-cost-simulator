import { useEffect, useMemo, useState } from 'react'
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
  const [modelPickerOpen, setModelPickerOpen] = useState(false)
  const [modelFilterText, setModelFilterText] = useState('')

  const selectedModelLabel =
    modelOptions.find((model) => model.id === selectedCarId)?.label || '車種を選択'
  const filteredModelOptions = useMemo(() => {
    const keyword = modelFilterText.trim().toLowerCase()
    if (!keyword) return modelOptions
    return modelOptions.filter((model) => model.label.toLowerCase().includes(keyword))
  }, [modelOptions, modelFilterText])

  useEffect(() => {
    if (!modelPickerOpen) return
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setModelPickerOpen(false)
        setModelFilterText('')
      }
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [modelPickerOpen])

  const handleModelPick = (id) => {
    onModelChipSelect(id)
    setModelPickerOpen(false)
    setModelFilterText('')
  }

  const handleMakerSelect = (e) => {
    onMakerChange(e)
    setModelPickerOpen(false)
    setModelFilterText('')
  }

  return (
    <section className="form-section">
      <div className="form-section-header">
        <h2>入力</h2>
        <div className="csv-tools">
          <button
            type="button"
            className="csv-export-button"
            onClick={onExportCsv}
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
            onChange={onImportCsv}
            style={{ display: 'none' }}
          />
        </div>
      </div>
      <div className="input-block">
        <h3 className="input-block-title">車・スペック</h3>
        <p className="field-hint">
          車種を選ぶと、車両価格・排気量・燃費などが自動入力されます。
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
        <button
          type="button"
          className="calc-button"
          onClick={onCalculate}
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
