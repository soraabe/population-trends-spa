// アクセシブルなカラーパレット管理

// カラーブラインド対応のメインカラーパレット（コントラスト強化）
const ACCESSIBLE_COLORS = [
  '#FF4444', // 明るい赤
  '#44BB44', // 明るい緑
  '#4488FF', // 明るい青
  '#FF8800', // オレンジ
  '#AA44FF', // 紫
  '#00CCAA', // ティール
  '#FF44AA', // ピンク
  '#AAAA00', // 黄緑
  '#00AAFF', // シアン
  '#FF6600', // 濃いオレンジ
] as const

// 線のパターン（dashArray）
const LINE_PATTERNS = [
  '0',        // 実線
  '5,5',      // 短い破線
  '10,5',     // 中破線
  '15,5',     // 長破線
  '5,5,10,5', // 点線
  '3,3',      // 細かい破線
  '8,3,3,3',  // 一点鎖線
  '12,3,3,3,3,3', // 二点鎖線
  '20,5',     // 長い破線
  '2,2',      // 細い点線
] as const

// 人口種別用の固定カラー（内訳表示用）
export const POPULATION_TYPE_COLORS = {
  '総人口': '#2563eb',      // 青
  '年少人口': '#dc2626',    // 赤
  '生産年齢人口': '#16a34a', // 緑
  '老年人口': '#ca8a04',    // 黄色
} as const

/**
 * 都道府県数に応じたアクセシブルなカラーパレットを生成
 * @param count 必要な色数
 * @returns カラーとパターンのペア
 */
export function generateAccessiblePalette(count: number) {
  const palette: Array<{
    color: string
    strokeDasharray: string
    name: string
  }> = []

  for (let i = 0; i < count; i++) {
    const colorIndex = i % ACCESSIBLE_COLORS.length
    const patternIndex = Math.floor(i / ACCESSIBLE_COLORS.length) % LINE_PATTERNS.length
    
    palette.push({
      color: ACCESSIBLE_COLORS[colorIndex],
      strokeDasharray: LINE_PATTERNS[patternIndex],
      name: `color-${i + 1}`,
    })
  }

  return palette
}

/**
 * 特定の都道府県に対する色を取得
 * @param prefIndex 都道府県のインデックス
 * @returns カラー設定
 */
export function getPrefectureColor(prefIndex: number) {
  const colorIndex = prefIndex % ACCESSIBLE_COLORS.length
  const patternIndex = Math.floor(prefIndex / ACCESSIBLE_COLORS.length) % LINE_PATTERNS.length
  
  return {
    color: ACCESSIBLE_COLORS[colorIndex],
    strokeDasharray: LINE_PATTERNS[patternIndex],
  }
}

/**
 * 人口種別の色を取得
 * @param type 人口種別
 * @returns カラー
 */
export function getPopulationTypeColor(type: keyof typeof POPULATION_TYPE_COLORS) {
  return POPULATION_TYPE_COLORS[type]
}