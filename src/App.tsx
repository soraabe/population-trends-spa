import { useState, useCallback } from 'react'
import PrefectureList from './components/PrefectureList'
import PopulationChart from './components/PopulationChart'
import { useResponsive } from './hooks/useResponsive'
import type { PopulationResponse, Prefecture } from './types/api'
import './App.css'

function App() {
  const [selectedPrefs, setSelectedPrefs] = useState<Set<number>>(new Set())
  const [populationData, setPopulationData] = useState<
    Map<number, PopulationResponse>
  >(new Map())
  const [prefectures, setPrefectures] = useState<Prefecture[]>([])
  const isMobile = useResponsive(700)

  const handlePrefecturesChange = useCallback(
    (newPrefectures: Prefecture[]) => {
      setPrefectures(newPrefectures)
    },
    [],
  )

  const handleSelectionChange = useCallback((newSelection: Set<number>) => {
    setSelectedPrefs(newSelection)
  }, [])

  const handleDataChange = useCallback(
    (newData: Map<number, PopulationResponse>) => {
      setPopulationData(newData)
    },
    [],
  )

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
            onPrefecturesChange={handlePrefecturesChange}
            onSelectionChange={handleSelectionChange}
            onDataChange={handleDataChange}
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
