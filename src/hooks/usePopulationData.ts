import { useState, useCallback } from 'react'
import type { PopulationResponse } from '../types/api'

export function usePopulationData() {
  const [populationData, setPopulationData] = useState<
    Map<number, PopulationResponse>
  >(new Map())
  const [loadingPrefs, setLoadingPrefs] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const fetchPopulationData = useCallback(async (prefCode: number) => {
    if (populationData.has(prefCode)) return

    setLoadingPrefs(prev => new Set(prev).add(prefCode))
    setError(null)

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
      
      setPopulationData(prev => new Map(prev).set(prefCode, data.result))
    } catch {
      setError(`都道府県${prefCode}の人口データ取得に失敗しました`)
    } finally {
      setLoadingPrefs(prev => {
        const newSet = new Set(prev)
        newSet.delete(prefCode)
        return newSet
      })
    }
  }, [populationData])

  return {
    populationData,
    loadingPrefs,
    error,
    fetchPopulationData,
  }
}