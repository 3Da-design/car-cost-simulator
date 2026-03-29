import './CsvButtons.css'

/**
 * @param {{ onClick: () => void, disabled?: boolean }} props
 */
export default function CsvImportButton({ onClick, disabled = false }) {
  return (
    <button type="button" className="csv-import-button" onClick={onClick} disabled={disabled}>
      CSVをインポート
    </button>
  )
}
