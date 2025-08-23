import { useState, useCallback, useEffect } from 'react'
import PrefectureList from './components/PrefectureList'
import PopulationChart from './components/PopulationChart'
import type { PopulationResponse, Prefecture } from './types/api'
import './App.css'

function App() {
  const [selectedPrefs, setSelectedPrefs] = useState<Set<number>>(new Set())
  const [populationData, setPopulationData] = useState<
    Map<number, PopulationResponse>
  >(new Map())
  const [prefectures, setPrefectures] = useState<Prefecture[]>([])
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
          display: isMobile ? 'flex' : 'grid',
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : '1fr 2fr',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        {isMobile ? (
          // モバイル: グラフを上、都道府県選択を下に
          <>
            <section aria-labelledby="chart-title">
              <PopulationChart
                data={populationData}
                selectedPrefs={selectedPrefs}
                prefectures={prefectures}
                isMobile={isMobile}
              />
            </section>
            <section aria-labelledby="prefecture-title">
              <PrefectureList
                onPrefecturesChange={handlePrefecturesChange}
                onSelectionChange={handleSelectionChange}
                onDataChange={handleDataChange}
                isMobile={isMobile}
              />
            </section>
          </>
        ) : (
          // デスクトップ: 都道府県選択を左、グラフを右に
          <>
            <section aria-labelledby="prefecture-title">
              <PrefectureList
                onPrefecturesChange={handlePrefecturesChange}
                onSelectionChange={handleSelectionChange}
                onDataChange={handleDataChange}
                isMobile={isMobile}
              />
            </section>
            <section aria-labelledby="chart-title">
              <PopulationChart
                data={populationData}
                selectedPrefs={selectedPrefs}
                prefectures={prefectures}
                isMobile={isMobile}
              />
            </section>
          </>
        )}
      </div>
    </main>
  )
}

export default App
