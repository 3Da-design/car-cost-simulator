import { useEffect, useMemo, useState } from 'react'

const INITIALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {{ id: string, label: string }[]} props.modelOptions
 * @param {string} props.selectedCarId
 * @param {(id: string) => void} props.onPick
 */
export default function ModelPickerModal({ open, onClose, modelOptions, selectedCarId, onPick }) {
  const [modelFilterText, setModelFilterText] = useState('')
  const [selectedInitial, setSelectedInitial] = useState('')

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
    if (!open) return
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setModelFilterText('')
        setSelectedInitial('')
        onClose()
      }
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setModelFilterText('')
      setSelectedInitial('')
    }
  }, [open])

  if (!open) return null

  const handlePick = (id) => {
    onPick(id)
    setModelFilterText('')
    setSelectedInitial('')
  }

  return (
    <div className="model-picker-modal-overlay" role="dialog" aria-modal="true" aria-label="車種選択">
      <div className="model-picker-modal">
        <div className="model-picker-modal-header">
          <h4>車種を選択</h4>
          <button
            type="button"
            className="model-picker-close"
            onClick={() => {
              setModelFilterText('')
              setSelectedInitial('')
              onClose()
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
          {INITIALS.map((initial) => (
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
                onClick={() => handlePick(model.id)}
              >
                {model.label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
