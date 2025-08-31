import { AIService } from './ai-service'
import type { Prefecture, PopulationResponse } from '../types/api'
import type { AnalysisResult } from './data-analyzer'
import { DataAnalyzer, REGION_MAPPING } from './data-analyzer'


export class QueryProcessor {
  private prefectures: Prefecture[]
  private populationData: Map<number, PopulationResponse>
  private aiService: AIService

  constructor(prefectures: Prefecture[], populationData: Map<number, PopulationResponse>) {
    this.prefectures = prefectures
    this.populationData = populationData
    this.aiService = new AIService()
  }

  // AI使用の自然言語クエリ処理
  async processQuery(query: string): Promise<AnalysisResult> {
    const aiResult = await this.aiService.analyzeQuery(query, this.prefectures, this.populationData)

    // クエリから地域/系列/件数/並び順を推定して、必要なら決定論で上書き
    const spec = this.parseQuerySpec(query)
    if (spec.region) {
      const analyzer = new DataAnalyzer(this.prefectures, this.populationData)
      const populationType = spec.populationType || '総人口'
      const limit = spec.limit || 15
      const sortOrder = spec.sortOrder || 'desc'

      const regional = analyzer.analyzeRegionalData(spec.region, populationType, limit, sortOrder)
      return regional
    }

    return aiResult
  }

  // クエリから意図をざっくり抽出
  private parseQuerySpec(query: string): {
    region?: keyof typeof REGION_MAPPING
    populationType?: '総人口' | '年少人口' | '生産年齢人口' | '老年人口'
    limit?: number
    sortOrder?: 'asc' | 'desc'
  } {
    const q = query.trim()

    // 地域
    let region: keyof typeof REGION_MAPPING | undefined
    ;(Object.keys(REGION_MAPPING) as Array<keyof typeof REGION_MAPPING>).forEach(r => {
      if (q.includes(r)) region = r
    })

    // 系列
    let populationType: '総人口' | '年少人口' | '生産年齢人口' | '老年人口' | undefined
    if (q.includes('年少')) populationType = '年少人口'
    else if (q.includes('老年') || q.includes('高齢')) populationType = '老年人口'
    else if (q.includes('生産') || q.includes('働く')) populationType = '生産年齢人口'
    else if (q.includes('総人口') || q.includes('人口')) populationType = '総人口'

    // 件数
    let limit: number | undefined
    const m1 = q.match(/(\d+)\s*選/)
    const m2 = q.match(/トップ\s*(\d+)/)
    if (m1) limit = Number(m1[1])
    else if (m2) limit = Number(m2[1])

    // 並び順
    let sortOrder: 'asc' | 'desc' | undefined
    if (q.includes('少ない')) sortOrder = 'asc'
    else if (q.includes('多い')) sortOrder = 'desc'

    return { region, populationType, limit, sortOrder }
  }

  // サポートしているクエリの例を取得
  getSupportedQueries(): string[] {
    return [
      "人口が多い県5つ",
      "関西地方を選択",
      "人口減少が激しい県を教えて",
      "少子高齢化が深刻な地域",
      "東京と大阪を比較したい",
      "九州で年少人口が少ない県3選"
    ]
  }
}
