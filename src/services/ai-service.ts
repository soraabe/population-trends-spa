import type { Prefecture, PopulationResponse } from '../types/api'
import type { AnalysisResult } from './data-analyzer'

const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT || '/api/analyze'

export class AIService {
  async analyzeQuery(
    query: string,
    prefectures: Prefecture[],
    populationData: Map<number, PopulationResponse>
  ): Promise<AnalysisResult> {
    try {
      const dataContext = this.prepareDataContext(prefectures, populationData)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      let response: Response
      try {
        response = await fetch(AI_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, dataContext }),
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeoutId)
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        type: 'selection',
        selectedPrefectures: result.selectedPrefectures || [],
        title: result.title || 'AI分析結果',
        description: result.description || '',
        insights: result.insights || []
      }

    } catch (error) {
      console.error('AI analysis failed:', error)
      return {
        type: 'insight',
        selectedPrefectures: [],
        title: 'AI分析エラー',
        description: 'AI分析サーバーとの通信に失敗しました。',
        insights: []
      }
    }
  }

  private prepareDataContext(
    prefectures: Prefecture[],
    populationData: Map<number, PopulationResponse>
  ): string {
    
    const lines: string[] = []

    prefectures.forEach(pref => {
      const data = populationData.get(pref.prefCode)

      const summary: Record<string, number | null> = {
        '総人口': null,
        '年少人口': null,
        '生産年齢人口': null,
        '老年人口': null,
      }

      if (data) {
        data.data.forEach(series => {
          const latest = series.data.find(d => d.year === 2025)
          if (latest && latest.value !== null && latest.value !== undefined) {
            summary[series.label] = latest.value
          }
        })
      }

      // 全県を必ず1行で出力（未取得は「データなし」）
      lines.push(
        `${pref.prefName}[県コード:${pref.prefCode}]: ` +
        `総=${summary['総人口'] !== null ? Number(summary['総人口']).toLocaleString() : 'データなし'}人, ` +
        `年少=${summary['年少人口'] !== null ? Number(summary['年少人口']).toLocaleString() : 'データなし'}人, ` +
        `生産=${summary['生産年齢人口'] !== null ? Number(summary['生産年齢人口']).toLocaleString() : 'データなし'}人, ` +
        `老年=${summary['老年人口'] !== null ? Number(summary['老年人口']).toLocaleString() : 'データなし'}人`
      )
    })

    return lines.join('\n')
  }
}
