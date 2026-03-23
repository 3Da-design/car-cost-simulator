import { CAR_SEARCH_PLACEHOLDER } from '../constants.js'
import './SimulatorInput.css'

export default function SimulatorInput({
  fileInputRef,
  importLoading,
  importMessage,
  onExportCsv,
  onImportCsv,
  carSearchText,
  setCarSearchText,
  setCarDropdownOpen,
  onCarKeyDown,
  carDropdownOpen,
  carFiltered,
  carHighlightedSafe,
  selectedCarId,
  onCarSelect,
  carDisplayName,
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
                onKeyDown={onCarKeyDown}
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
                          onCarSelect(c)
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
    </section>
  )
}
