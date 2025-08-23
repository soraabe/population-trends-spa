import { useEffect, useState } from 'react'
import { usePrefectures } from '../hooks/usePrefectures'
import { usePopulationData } from '../hooks/usePopulationData'
import type { Prefecture, PopulationResponse } from '../types/api'

type PrefectureListProps = {
  onPrefecturesChange: (prefectures: Prefecture[]) => void
  onSelectionChange: (selectedPrefs: Set<number>) => void
  onDataChange: (populationData: Map<number, PopulationResponse>) => void
  isMobile: boolean
}

export default function PrefectureList({
  onPrefecturesChange,
  onSelectionChange,
  onDataChange,
  isMobile,
}: PrefectureListProps) {
  const { prefectures, loading, error: prefError } = usePrefectures()
  const { 
    populationData, 
    loadingPrefs, 
    error: popError, 
    fetchPopulationData 
  } = usePopulationData()
  const [selectedPrefs, setSelectedPrefs] = useState<Set<number>>(new Set())
  const error = prefError || popError

  // prefectures が更新されたら親コンポーネントに通知
  useEffect(() => {
    if (prefectures.length > 0) {
      onPrefecturesChange(prefectures)
    }
  }, [prefectures, onPrefecturesChange])

  // populationData が更新されたら親コンポーネントに通知
  useEffect(() => {
    onDataChange(populationData)
  }, [populationData, onDataChange])

  // selectedPrefsの変更を親に通知
  useEffect(() => {
    onSelectionChange(selectedPrefs)
  }, [selectedPrefs, onSelectionChange])

  const handlePrefectureToggle = async (prefCode: number) => {
    setSelectedPrefs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(prefCode)) {
        newSet.delete(prefCode)
      } else {
        newSet.add(prefCode)
        fetchPopulationData(prefCode)
      }
      return newSet
    })
  }

  if (loading) return <p>読み込み中...</p>

  if (error) return <p>エラー: {error}</p>

  return (
    <div>
      <h2
        id="prefecture-title"
        style={{
          fontSize: isMobile ? '1.2rem' : '1.5rem',
          marginBottom: isMobile ? '15px' : '20px',
        }}
      >
        都道府県を選択してください
      </h2>
      <form>
        <fieldset
          style={{
            border: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          <legend style={{ position: 'absolute', left: '-9999px' }}>
            都道府県選択
          </legend>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? 'repeat(auto-fill, minmax(120px, 1fr))'
                : 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: isMobile ? '6px' : '8px',
            }}
          >
            {prefectures.map(prefecture => (
              <label
                key={prefecture.prefCode}
                htmlFor={`prefecture-${prefecture.prefCode}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '6px' : '8px',
                  opacity: loadingPrefs.has(prefecture.prefCode) ? 0.7 : 1,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  padding: isMobile ? '4px' : '0',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  id={`prefecture-${prefecture.prefCode}`}
                  name={`prefecture-${prefecture.prefCode}`}
                  checked={selectedPrefs.has(prefecture.prefCode)}
                  onChange={() => handlePrefectureToggle(prefecture.prefCode)}
                  disabled={loadingPrefs.has(prefecture.prefCode)}
                />
                <span>{prefecture.prefName}</span>
                {loadingPrefs.has(prefecture.prefCode) && (
                  <span
                    style={{
                      fontSize: isMobile ? '10px' : '12px',
                      color: '#666',
                    }}
                  >
                    読み込み中...
                  </span>
                )}
              </label>
            ))}
          </div>
        </fieldset>
      </form>
    </div>
  )
}