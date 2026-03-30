import './App.css'
import AppHeader from './features/app/components/layout/AppHeader.jsx'
import AppFooter from './features/app/components/layout/AppFooter.jsx'
import SpaLeftNav from './features/app/components/layout/SpaLeftNav.jsx'
import SimulatorIntro from './features/carCostSimulator/components/intro/SimulatorIntro.jsx'
import SimulatorInput from './features/carCostSimulator/components/input/SimulatorInput.jsx'
import ResultSection from './features/carCostSimulator/components/result/ResultSection.jsx'
import { useCarCostSimulator } from './features/carCostSimulator/hooks/useCarCostSimulator.js'

function App() {
  const {
    state,
    selectedCarName,
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
  } = useCarCostSimulator()

  const {
    activeView,
    selectedCarId,
    distance,
    gasPrice,
    insurance,
    parking,
    inspection,
    ownershipYears,
    fuel,
    engine,
    price,
    result,
    loading,
    error,
    importMessage,
    importLoading,
    selectedMaker,
  } = state

  const errorAlert =
    error != null && error !== '' ? (
      <p className="error" role="alert">
        {error}
      </p>
    ) : null

  const navItems = [
    { id: 'intro', label: '概要', icon: 'fa-circle-info' },
    { id: 'input', label: '入力', icon: 'fa-keyboard' },
    { id: 'result', label: '結果', icon: 'fa-chart-pie', disabled: !result },
  ]

  const renderMainContent = () => {
    if (activeView === 'intro') return <SimulatorIntro onGoToInput={navigateToInput} />
    if (activeView === 'input') {
      return (
        <main className="main">
          <SimulatorInput
            fileInputRef={fileInputRef}
            importLoading={importLoading}
            importMessage={importMessage}
            onExportCsv={handleExportCsv}
            onImportCsv={handleImportCsv}
            selectedMaker={selectedMaker}
            makerOptions={makerOptions}
            onMakerChange={handleMakerChange}
            modelOptions={modelOptions}
            onModelChipSelect={handleModelChipSelect}
            selectedCarId={selectedCarId}
            distance={distance}
            setDistance={(v) => patch({ distance: v })}
            fuel={fuel}
            setFuel={(v) => patch({ fuel: v })}
            gasPrice={gasPrice}
            setGasPrice={(v) => patch({ gasPrice: v })}
            price={price}
            setPrice={(v) => patch({ price: v })}
            engine={engine}
            setEngine={(v) => patch({ engine: v })}
            onEngineBlur={handleEngineBlur}
            insurance={insurance}
            setInsurance={(v) => patch({ insurance: v })}
            parking={parking}
            setParking={(v) => patch({ parking: v })}
            inspection={inspection}
            setInspection={(v) => patch({ inspection: v })}
            ownershipYears={ownershipYears}
            setOwnershipYears={(v) => patch({ ownershipYears: v })}
            onCalculate={handleCalculate}
            loading={loading}
          />
          {errorAlert}
        </main>
      )
    }
    if (!result) {
      return (
        <main className="main">
          <p className="error" role="alert">
            先に入力画面で計算を実行してください。
          </p>
        </main>
      )
    }
    return (
      <main className="main">
        <ResultSection
          result={result}
          onDownloadResult={handleDownloadResult}
          assumptions={{
            carName: selectedCarName,
            distance,
            fuel,
            gasPrice,
            engine,
            price,
            insurance,
            parking,
            inspection,
            ownershipYears,
          }}
        />
      </main>
    )
  }

  return (
    <div className="app">
      <AppHeader hasResult={Boolean(result)} showNav={false} />
      <div className="spa-layout">
        <SpaLeftNav items={navItems} activeId={activeView} onSelect={setActiveView} />
        <section className="content-pane">{renderMainContent()}</section>
      </div>
      <AppFooter hasResult={Boolean(result)} onNavigateToSection={navigateToFooterSection} />
    </div>
  )
}

export default App
