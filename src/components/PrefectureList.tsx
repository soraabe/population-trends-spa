import { useEffect, useState } from "react"
import type { Prefecture, PopulationResponse } from "../types/api"

type PrefectureListProps = {
  onPrefecturesChange: (prefectures: Prefecture[]) => void
  onSelectionChange: (selectedPrefs: Set<number>) => void
  onDataChange: (populationData: Map<number, PopulationResponse>) => void
}

export default function PrefectureList({ onPrefecturesChange, onSelectionChange, onDataChange }: PrefectureListProps) {
  const [prefs, setPrefs] = useState<Prefecture[]>([])
  const [selectedPrefs, setSelectedPrefs] = useState<Set<number>>(new Set())
  const [populationData, setPopulationData] = useState<Map<number, PopulationResponse>>(new Map())
  const [loading, setLoading] = useState(true)
  const [populationLoading, setPopulationLoading] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)



  useEffect(() => {
    const fetchPrefectures = async () => {
      try {
        const res = await fetch(
          "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures",
          {
            headers: {
              "X-API-KEY": "8FzX5qLmN3wRtKjH7vCyP9bGdEaU4sYpT6cMfZnJ",
            },
          }
        )
        const data = await res.json()
        setPrefs(data.result)
        onPrefecturesChange(data.result)

      } catch {
        setError("都道府県データの取得に失敗しました")

      } finally {
        setLoading(false)
      }
    }
    fetchPrefectures()
  }, [onPrefecturesChange])

  const fetchPopulationData = async (prefCode: number) => {
    if (populationData.has(prefCode)) return

    setPopulationLoading(prev => new Set(prev).add(prefCode))
    
    try {
      const res = await fetch(
        `https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/population/composition/perYear?cityCode=-&prefCode=${prefCode}`,
        {
          headers: {
            "X-API-KEY": "8FzX5qLmN3wRtKjH7vCyP9bGdEaU4sYpT6cMfZnJ",
          },
        }
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
      onSelectionChange(newSet)
      return newSet
    })
  }

  if (loading) return <p>読み込み中...</p>

  if (error) return <p>エラー: {error}</p>


  return (
    <div>
      <h2>都道府県を選択してください</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
        {prefs.map((prefecture) => (
          <label key={prefecture.prefCode} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: populationLoading.has(prefecture.prefCode) ? 0.7 : 1 }}>
            <input
              type="checkbox"
              checked={selectedPrefs.has(prefecture.prefCode)}
              onChange={() => handlePrefectureToggle(prefecture.prefCode)}
              disabled={populationLoading.has(prefecture.prefCode)}
            />
            <span>{prefecture.prefName}</span>
            {populationLoading.has(prefecture.prefCode) && <span style={{ fontSize: '12px', color: '#666' }}>読み込み中...</span>}
          </label>
        ))}
      </div>
    </div>
  )
}