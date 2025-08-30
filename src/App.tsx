import PrefectureList from './components/PrefectureList'
import PopulationChart from './components/PopulationChart'
import AIQueryInput from './components/AIQueryInput'
import AnalysisInsight from './components/AnalysisInsight'
import { useResponsive } from './hooks/useResponsive'
import { usePopulationApp } from './hooks/usePopulationApp'
import './App.css'

function App() {
  const isMobile = useResponsive(700)
  const {
    prefectures,
    populationData,
    selectedPrefs,
    loadingPrefs,
    loadingPopulation,
    error,
    analysisResult,
    isAnalyzing,
    togglePrefecture,
    clearSelection,
    runAnalysis,
  } = usePopulationApp()

  return (
    <main
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '10px' : '20px',
      }}
    >
      <header>
        <h1
          style={{
            fontSize: isMobile ? '1.5rem' : '2rem',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          都道府県別人口推移グラフ
        </h1>
      </header>

      {/* AI検索インターフェース */}
      <AIQueryInput
        onRunAnalysis={runAnalysis}
        isAnalyzing={isAnalyzing}
        isMobile={isMobile}
      />

      {/* AI分析結果表示 */}
      {analysisResult && (
        <AnalysisInsight
          result={analysisResult}
          isMobile={isMobile}
        />
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginTop: '20px',
          // デスクトップではgridレイアウトに切り替え
          ...(isMobile ? {} : {
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            flexDirection: undefined,
          }),
        }}
      >
        {/* 都道府県選択: モバイル時は2番目、デスクトップ時は1番目 */}
        <section 
          aria-labelledby="prefecture-title"
          style={{
            order: isMobile ? 2 : 1,
          }}
        >
          <PrefectureList
            prefectures={prefectures}
            selectedPrefs={selectedPrefs}
            loadingPrefs={loadingPrefs}
            loadingPopulation={loadingPopulation}
            error={error}
            onTogglePrefecture={togglePrefecture}
            onClearSelection={clearSelection}
            isMobile={isMobile}
          />
        </section>
        
        {/* グラフ: モバイル時は1番目、デスクトップ時は2番目 */}
        <section 
          aria-labelledby="chart-title"
          style={{
            order: isMobile ? 1 : 2,
          }}
        >
          <PopulationChart
            data={populationData}
            selectedPrefs={selectedPrefs}
            prefectures={prefectures}
            isMobile={isMobile}
          />
        </section>
      </div>
    </main>
  )
}

export default App
