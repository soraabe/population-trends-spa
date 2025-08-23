import { useEffect, useState } from 'react'
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
  const [prefs, setPrefs] = useState<Prefecture[]>([])
  const [selectedPrefs, setSelectedPrefs] = useState<Set<number>>(new Set())
  const [populationData, setPopulationData] = useState<
    Map<number, PopulationResponse>
  >(new Map())
  const [loading, setLoading] = useState(true)
  const [populationLoading, setPopulationLoading] = useState<Set<number>>(
    new Set(),
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrefectures = async () => {
      try {
        const res = await fetch(
          'https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures',
          {
            headers: {
              'X-API-KEY': '8FzX5qLmN3wRtKjH7vCyP9bGdEaU4sYpT6cMfZnJ',
            },
          },
        )
        const data = await res.json()
        setPrefs(data.result)
      } catch {
        setError('都道府県データの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    fetchPrefectures()
  }, [])

  // prefsが更新されたら親コンポーネントに通知
  useEffect(() => {
    if (prefs.length > 0) {
      onPrefecturesChange(prefs)
    }
  }, [prefs, onPrefecturesChange])

  const fetchPopulationData = async (prefCode: number) => {
    if (populationData.has(prefCode)) return

    setPopulationLoading(prev => new Set(prev).add(prefCode))

    try {
      const res = await fetch(
        `https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/population/composition/perYear?cityCode=-&prefCode=${prefCode}`,
        {
          headers: {
            'X-API-KEY': '8FzX5qLmN3wRtKjH7vCyP9bGdEaU4sYpT6cMfZnJ',
          },
        },
      )
      const data = await res.json()
      const newData = new Map(populationData).set(prefCode, data.result)
      setPopulationData(newData)
      onDataChange(newData)
    } catch {
      setError(`都道府県${prefCode}の人口データ取得に失敗しました`)
    } finally {
      setPopulationLoading(prev => {
        const newSet = new Set(prev)
        newSet.delete(prefCode)
        return newSet
      })
    }
  }

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

  // selectedPrefsの変更を親に通知
  useEffect(() => {
    onSelectionChange(selectedPrefs)
  }, [selectedPrefs, onSelectionChange])

  if (loading) return <p>読み込み中...</p>

  if (error) return <p>エラー: {error}</p>

  return (
    <div>
      <h2
        style={{
          fontSize: isMobile ? '1.2rem' : '1.5rem',
          marginBottom: isMobile ? '15px' : '20px',
        }}
      >
        都道府県を選択してください
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(auto-fill, minmax(120px, 1fr))'
            : 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: isMobile ? '6px' : '8px',
        }}
      >
        {prefs.map(prefecture => (
          <label
            key={prefecture.prefCode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '6px' : '8px',
              opacity: populationLoading.has(prefecture.prefCode) ? 0.7 : 1,
              fontSize: isMobile ? '0.9rem' : '1rem',
              padding: isMobile ? '4px' : '0',
            }}
          >
            <input
              type="checkbox"
              id={`prefecture-${prefecture.prefCode}`}
              name={`prefecture-${prefecture.prefCode}`}
              checked={selectedPrefs.has(prefecture.prefCode)}
              onChange={() => handlePrefectureToggle(prefecture.prefCode)}
              disabled={populationLoading.has(prefecture.prefCode)}
            />
            <span>{prefecture.prefName}</span>
            {populationLoading.has(prefecture.prefCode) && (
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
    </div>
  )
}
