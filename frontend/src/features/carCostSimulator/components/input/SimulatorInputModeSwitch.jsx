/**
 * @param {object} props
 * @param {'gasoline_hybrid' | 'plugin_ev'} props.mode
 * @param {(mode: 'gasoline_hybrid' | 'plugin_ev') => void} props.onSelectMode
 */
export default function SimulatorInputModeSwitch({ mode, onSelectMode }) {
  return (
    <div className="input-mode-switch" role="tablist" aria-label="入力画面の区分">
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'gasoline_hybrid'}
        className={`input-mode-switch__btn${mode === 'gasoline_hybrid' ? ' is-active' : ''}`}
        onClick={() => onSelectMode('gasoline_hybrid')}
      >
        ガソリン・HEV
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'plugin_ev'}
        className={`input-mode-switch__btn${mode === 'plugin_ev' ? ' is-active' : ''}`}
        onClick={() => onSelectMode('plugin_ev')}
      >
        BEV・PHEV・FCV
      </button>
    </div>
  )
}
