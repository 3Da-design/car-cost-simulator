import './CsvButtons.css'

/**
 * @param {{ onClick: () => void, disabled?: boolean }} props
 */
export default function CsvExportButton({ onClick, disabled = false }) {
  return (
    <button type="button" className="csv-export-button" onClick={onClick} disabled={disabled}>
      CSVでダウンロード
    </button>
  )
}
