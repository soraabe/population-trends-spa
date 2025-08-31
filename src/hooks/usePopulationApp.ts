import { useState, useCallback, useEffect } from 'react'
import type { Prefecture, PopulationResponse } from '../types/api'
import { QueryProcessor } from '../services/query-processor'
import type { AnalysisResult } from '../services/data-analyzer'

const API_BASE_URL = '/api'

export function usePopulationApp() {
  // 全ての状態を一元管理
  const [prefectures, setPrefectures] = useState<Prefecture[]>([])
  const [populationData, setPopulationData] = useState<Map<number, PopulationResponse>>(new Map())
  const [selectedPrefs, setSelectedPrefs] = useState<Set<number>>(new Set())
  const [loadingPrefs, setLoadingPrefs] = useState<boolean>(true)
  const [loadingPopulation, setLoadingPopulation] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  
  // AI分析関連の状態
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // API共通処理
  const apiRequest = async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
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
  const fetchPopulationData = useCallback(async (prefCode: number): Promise<PopulationResponse | undefined> => {
    if (populationData.has(prefCode)) return populationData.get(prefCode)

    setLoadingPopulation(prev => new Set(prev).add(prefCode))
    try {
      const result = await apiRequest(`/population/composition/perYear?cityCode=-&prefCode=${prefCode}`)
      setPopulationData(prev => new Map(prev).set(prefCode, result))
      return result

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
    setAnalysisResult(null) // 分析結果もクリア
  }, [])

  // AI分析実行
  const runAnalysis = useCallback(async (query: string) => {
    if (!prefectures.length) {
      setError('都道府県データが読み込まれていません')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // 1) AI実行前に、未取得の都道府県人口データをまとめて取得し、
      //    取得結果をローカルMapに反映してからAIへ渡す
      const localMap = new Map<number, PopulationResponse>(populationData)
      const allCodes = prefectures.map(p => p.prefCode)
      const missingPrefCodes = allCodes.filter(code => !localMap.has(code))

      const CONCURRENCY = 8
      for (let i = 0; i < missingPrefCodes.length; i += CONCURRENCY) {
        const batch = missingPrefCodes.slice(i, i + CONCURRENCY)
        await Promise.all(
          batch.map(async code => {
            try {
              const res = await fetchPopulationData(code)
              if (res) localMap.set(code, res)
            } catch {
              // 個別失敗は握りつぶし、他の取得は継続
            }
          })
        )
      }

      const processor = new QueryProcessor(prefectures, localMap)
      const result = await processor.processQuery(query)
      
      if (result) {
        setAnalysisResult(result)
        
        // 分析結果に基づいて県を自動選択
        if (result.selectedPrefectures.length > 0) {
          
          // 選択された県のデータを並列で取得
          const prefCodes = result.selectedPrefectures
          const fetchPromises = prefCodes.map(async (prefCode) => {
            if (!populationData.has(prefCode)) {
              return fetchPopulationData(prefCode)
            }
          })
          
          await Promise.all(fetchPromises)
          
          setSelectedPrefs(new Set(prefCodes))
        }
      }
    } catch {
      setError('分析処理中にエラーが発生しました')
    } finally {
      setIsAnalyzing(false)
    }
  }, [prefectures, populationData, fetchPopulationData])

  return {
    // 状態
    prefectures,
    populationData,
    selectedPrefs,
    loadingPrefs,
    loadingPopulation,
    error,
    analysisResult,
    isAnalyzing,
    
    // アクション
    togglePrefecture,
    clearSelection,
    runAnalysis,
  }
}
