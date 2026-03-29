import './CalcButton.css'

/**
 * @param {{ onClick: () => void, disabled?: boolean, loading?: boolean }} props
 */
export default function CalcButton({ onClick, disabled = false, loading = false }) {
  return (
    <button type="button" className="calc-button" onClick={onClick} disabled={disabled || loading}>
      {loading ? '計算中…' : '計算'}
    </button>
  )
}
