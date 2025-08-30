import type { Prefecture, PopulationResponse } from '../types/api'

// 分析結果の型定義
export interface AnalysisResult {
  type: 'selection' | 'insight'
  selectedPrefectures: number[]     // 選択すべき県コード
  title: string                    // 分析タイトル
  description: string              // AI生成の説明
  insights: DataInsight[]          // 具体的な洞察
}

export interface DataInsight {
  prefecture: string
  value: number
  unit: string
  context: string
}

// 分析タイプの定義
export type AnalysisType = 
  | 'population_decline'      // 人口減少分析
  | 'aging_society'          // 少子高齢化分析
  | 'demographic_change'     // 人口構成変化
  | 'regional_analysis'      // 地域別分析
  | 'trend_analysis'         // トレンド分析

// 地域マッピング
const REGION_MAPPING = {
  '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  '関西': ['滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '東海': ['岐阜県', '静岡県', '愛知県', '三重県'],
  '九州': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'],
  '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
  '北海道': ['北海道']
}

class DataAnalyzer {
  private prefectures: Prefecture[]
  private populationData: Map<number, PopulationResponse>

  constructor(prefectures: Prefecture[], populationData: Map<number, PopulationResponse>) {
    this.prefectures = prefectures
    this.populationData = populationData
  }

  // 人口減少分析
  analyzePopulationDecline(): AnalysisResult {
    const results: Array<{prefCode: number, prefName: string, declineRate: number}> = []

    this.prefectures.forEach(pref => {
      const data = this.populationData.get(pref.prefCode)
      if (!data) return

      const totalSeries = data.data.find(s => s.label === '総人口')
      if (!totalSeries) return

      // 2020年と2045年のデータを取得
      const data2020 = totalSeries.data.find(d => d.year === 2020)
      const data2045 = totalSeries.data.find(d => d.year === 2045)

      if (data2020 && data2045) {
        const declineRate = ((data2020.value - data2045.value) / data2020.value) * 100
        if (declineRate > 0) { // 減少している場合のみ
          results.push({
            prefCode: pref.prefCode,
            prefName: pref.prefName,
            declineRate
          })
        }
      }
    })

    // 減少率でソートして上位5県を選択
    results.sort((a, b) => b.declineRate - a.declineRate)
    const top5 = results.slice(0, 5)

    const insights: DataInsight[] = top5.map(result => ({
      prefecture: result.prefName,
      value: result.declineRate,
      unit: '%',
      context: `2020年から2045年で${result.declineRate.toFixed(1)}%の人口減少が予測されています`
    }))

    return {
      type: 'selection',
      selectedPrefectures: top5.map(r => r.prefCode),
      title: '人口減少が激しい地域',
      description: `分析の結果、${top5[0]?.prefName}が最も深刻な人口減少（${top5[0]?.declineRate.toFixed(1)}%減）を示しています。地方都市では若年層の都市部流出と少子化の影響が顕著に表れています。`,
      insights
    }
  }

  // 少子高齢化分析
  analyzeAgingSociety(): AnalysisResult {
    const results: Array<{prefCode: number, prefName: string, agingRate: number, youthRate: number}> = []

    this.prefectures.forEach(pref => {
      const data = this.populationData.get(pref.prefCode)
      if (!data) return

      const totalSeries = data.data.find(s => s.label === '総人口')
      const elderSeries = data.data.find(s => s.label === '老年人口')
      const youthSeries = data.data.find(s => s.label === '年少人口')

      if (!totalSeries || !elderSeries || !youthSeries) return

      // 2025年のデータで高齢化率を計算
      const total2025 = totalSeries.data.find(d => d.year === 2025)
      const elder2025 = elderSeries.data.find(d => d.year === 2025)
      const youth2025 = youthSeries.data.find(d => d.year === 2025)

      if (total2025 && elder2025 && youth2025) {
        const agingRate = (elder2025.value / total2025.value) * 100
        const youthRate = (youth2025.value / total2025.value) * 100
        
        results.push({
          prefCode: pref.prefCode,
          prefName: pref.prefName,
          agingRate,
          youthRate
        })
      }
    })

    // 高齢化率で降順ソート、少子化も考慮
    results.sort((a, b) => (b.agingRate - b.youthRate) - (a.agingRate - a.youthRate))
    const top5 = results.slice(0, 5)

    const insights: DataInsight[] = top5.map(result => ({
      prefecture: result.prefName,
      value: result.agingRate,
      unit: '%',
      context: `高齢化率${result.agingRate.toFixed(1)}%、年少人口率${result.youthRate.toFixed(1)}%`
    }))

    return {
      type: 'selection',
      selectedPrefectures: top5.map(r => r.prefCode),
      title: '少子高齢化が深刻な地域',
      description: `${top5[0]?.prefName}では高齢化率が${top5[0]?.agingRate.toFixed(1)}%に達し、年少人口率は${top5[0]?.youthRate.toFixed(1)}%まで低下しています。地方では医療・介護需要の増加と労働力不足が課題となっています。`,
      insights
    }
  }

  // 地域の人口構成変化分析  
  analyzeDemographicChange(): AnalysisResult {
    // 働く世代（生産年齢人口）の減少率で分析
    const results: Array<{prefCode: number, prefName: string, workforceDecline: number}> = []

    this.prefectures.forEach(pref => {
      const data = this.populationData.get(pref.prefCode)
      if (!data) return

      const workforceSeries = data.data.find(s => s.label === '生産年齢人口')
      if (!workforceSeries) return

      const data2020 = workforceSeries.data.find(d => d.year === 2020)
      const data2045 = workforceSeries.data.find(d => d.year === 2045)

      if (data2020 && data2045) {
        const declineRate = ((data2020.value - data2045.value) / data2020.value) * 100
        if (declineRate > 0) {
          results.push({
            prefCode: pref.prefCode,
            prefName: pref.prefName,
            workforceDecline: declineRate
          })
        }
      }
    })

    results.sort((a, b) => b.workforceDecline - a.workforceDecline)
    const top5 = results.slice(0, 5)

    const insights: DataInsight[] = top5.map(result => ({
      prefecture: result.prefName,
      value: result.workforceDecline,
      unit: '%',
      context: `生産年齢人口が${result.workforceDecline.toFixed(1)}%減少予測`
    }))

    return {
      type: 'selection',
      selectedPrefectures: top5.map(r => r.prefCode),
      title: '働く世代の減少が深刻な地域',
      description: `労働力の中核である生産年齢人口の減少が最も深刻なのは${top5[0]?.prefName}で、${top5[0]?.workforceDecline.toFixed(1)}%の減少が予測されます。経済活動の維持と社会保障制度への影響が懸念されます。`,
      insights
    }
  }

  // 地域別分析（関東で老年人口多いトップ5など）
  analyzeRegionalData(region: string, populationType: string, limit: number = 5, sortOrder: 'asc' | 'desc' = 'desc'): AnalysisResult {
    // 地域に含まれる県を取得
    const regionPrefectures = REGION_MAPPING[region as keyof typeof REGION_MAPPING]
    if (!regionPrefectures) {
      return {
        type: 'insight',
        selectedPrefectures: [],
        title: `地域「${region}」が見つかりません`,
        description: `対応している地域: ${Object.keys(REGION_MAPPING).join('、')}`,
        insights: []
      }
    }

    // 対象県のデータを収集
    const results: Array<{prefCode: number, prefName: string, value: number}> = []

    this.prefectures.forEach(pref => {
      // この県が指定地域に含まれるかチェック
      if (!regionPrefectures.includes(pref.prefName)) return

      const data = this.populationData.get(pref.prefCode)
      if (!data) return

      const targetSeries = data.data.find(s => s.label === populationType)
      if (!targetSeries) return

      // 最新年（2025年）のデータを取得
      const latestData = targetSeries.data.find(d => d.year === 2025)
      if (latestData) {
        results.push({
          prefCode: pref.prefCode,
          prefName: pref.prefName,
          value: latestData.value
        })
      }
    })

    // ソートして上位/下位を取得
    if (sortOrder === 'desc') {
      results.sort((a, b) => b.value - a.value)
    } else {
      results.sort((a, b) => a.value - b.value)
    }
    
    const topResults = results.slice(0, Math.min(limit, results.length))

    const insights: DataInsight[] = topResults.map(result => ({
      prefecture: result.prefName,
      value: result.value,
      unit: '人',
      context: `2025年の${populationType}: ${result.value.toLocaleString()}人`
    }))

    const sortText = sortOrder === 'desc' ? '多い' : '少ない'
    const description = topResults.length > 0 
      ? `${region}地方で${populationType}が最も${sortText}のは${topResults[0].prefName}（${topResults[0].value.toLocaleString()}人）です。地域内での人口分布の違いが明確に表れています。`
      : `${region}地方のデータが見つかりませんでした。`

    return {
      type: 'selection',
      selectedPrefectures: topResults.map(r => r.prefCode),
      title: `${region}地方の${populationType}${sortText}順`,
      description,
      insights
    }
  }
}

export { DataAnalyzer, REGION_MAPPING }