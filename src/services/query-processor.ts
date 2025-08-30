import { AIService } from './ai-service'
import type { Prefecture, PopulationResponse } from '../types/api'
import type { AnalysisResult } from './data-analyzer'


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
    return await this.aiService.analyzeQuery(query, this.prefectures, this.populationData)
  }

  // サポートしているクエリの例を取得
  getSupportedQueries(): string[] {
    return [
      "人口が多い県5つ",
      "関西地方を選択",
      "人口減少が激しい県を教えて",
      "少子高齢化が深刻な地域",
      "東京と大阪を比較したい",
      "九州で年少人口が少ない県3選",
      "働く世代が多い県トップ10"
    ]
  }
}