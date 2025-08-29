import { useState, useCallback, useEffect } from 'react'
import type { Prefecture, PopulationResponse } from '../types/api'

const API_BASE_URL = 'https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1'
const API_KEY = '8FzX5qLmN3wRtKjH7vCyP9bGdEaU4sYpT6cMfZnJ'

export function usePopulationApp() {
  // 全ての状態を一元管理
  const [prefectures, setPrefectures] = useState<Prefecture[]>([])
  const [populationData, setPopulationData] = useState<Map<number, PopulationResponse>>(new Map())
  const [selectedPrefs, setSelectedPrefs] = useState<Set<number>>(new Set())
  const [loadingPrefs, setLoadingPrefs] = useState<boolean>(true)
  const [loadingPopulation, setLoadingPopulation] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // API共通処理
  const apiRequest = async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'X-API-KEY': API_KEY }
    })
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    const data = await response.json()
    return data.result
  }

  // 都道府県データ取得
  useEffect(() => {
    const fetchPrefectures = async () => {
      try {
        setError(null)
        const result = await apiRequest('/prefectures')
        setPrefectures(result)
      } catch {
        setError('都道府県データの取得に失敗しました')
      } finally {
        setLoadingPrefs(false)
      }
    }
    fetchPrefectures()
  }, [])

  // 人口データ取得
  const fetchPopulationData = useCallback(async (prefCode: number) => {
    if (populationData.has(prefCode)) return

    setLoadingPopulation(prev => new Set(prev).add(prefCode))
    try {
      const result = await apiRequest(`/population/composition/perYear?cityCode=-&prefCode=${prefCode}`)
      setPopulationData(prev => new Map(prev).set(prefCode, result))
    } catch {
      setError(`都道府県${prefCode}の人口データ取得に失敗しました`)
    } finally {
      setLoadingPopulation(prev => {
        const newSet = new Set(prev)
        newSet.delete(prefCode)
        return newSet
      })
    }
  }, [populationData])

  // 都道府県選択/解除
  const togglePrefecture = useCallback((prefCode: number) => {
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
  }, [fetchPopulationData])

  // 全て解除
  const clearSelection = useCallback(() => {
    setSelectedPrefs(new Set())
  }, [])

  return {
    // 状態
    prefectures,
    populationData,
    selectedPrefs,
    loadingPrefs,
    loadingPopulation,
    error,
    
    // アクション
    togglePrefecture,
    clearSelection,
  }
}