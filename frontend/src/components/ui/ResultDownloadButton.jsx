import './ResultDownloadButton.css'

/**
 * @param {{ onClick: () => void, disabled?: boolean }} props
 */
export default function ResultDownloadButton({ onClick, disabled = false }) {
  return (
    <button type="button" className="result-download-button" onClick={onClick} disabled={disabled}>
      入力・結果をダウンロード
    </button>
  )
}
