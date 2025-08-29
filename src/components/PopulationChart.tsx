import { useState } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { PopulationResponse } from '../types/api'
import { getPrefectureColor, getPopulationTypeColor } from '../lib/colors'

type PopulationChartProps = {
  data: Map<number, PopulationResponse>
  selectedPrefs: Set<number>
  prefectures: Array<{ prefCode: number; prefName: string }>
  isMobile: boolean
}

type PopulationType = '総人口' | '年少人口' | '生産年齢人口' | '老年人口'

// カスタムツールチップコンポーネント
type TooltipPayload = {
  dataKey: string
  value: number
  color: string
}

type CustomTooltipProps = {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'white',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {/* 年を上部に表示 */}
        <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>
          {label}年
        </div>
        {payload.map((entry: TooltipPayload, index: number) => {
          // dataKeyから _solid, _dashed を除去して表示名を作成
          const displayName = String(entry.dataKey)
            .replace(/_solid$/, '')
            .replace(/_dashed$/, '')
          
          return (
            <div key={index} style={{ color: entry.color, margin: 0 }}>
              {displayName}: {entry.value?.toLocaleString()}人
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

export default function PopulationChart({
  data,
  selectedPrefs,
  prefectures,
  isMobile,
}: PopulationChartProps) {
  const [selectedType, setSelectedType] = useState<PopulationType>('総人口')
  const [showBreakdown, setShowBreakdown] = useState(false)

  if (selectedPrefs.size === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>都道府県を選択してください</p>
      </div>
    )
  }

  // グラフ用のデータを準備
  const prepareChartData = () => {
    const years = new Set<number>()
    const chartData: { [key: string]: number | string | boolean }[] = []

    // 総人口内訳表示の場合
    if (selectedType === '総人口' && showBreakdown) {
      // 全ての年を収集（総人口から）
      Array.from(selectedPrefs).forEach(prefCode => {
        const populationData = data.get(prefCode)
        if (populationData) {
          const totalSeries = populationData.data.find(s => s.label === '総人口')
          if (totalSeries) {
            totalSeries.data.forEach(item => years.add(item.year))
          }
        }
      })

      const sortedYears = Array.from(years).sort((a, b) => a - b)

      // 各年度の種別別合計データを構築
      sortedYears.forEach(year => {
        const yearData: { [key: string]: number | string | boolean } = { year }
        
        // 種別ごとの合計値を計算
        const populationTypes: PopulationType[] = ['年少人口', '生産年齢人口', '老年人口']
        const totals: { [key: string]: number } = {
          年少人口_solid: 0,
          年少人口_dashed: 0,
          生産年齢人口_solid: 0,
          生産年齢人口_dashed: 0,
          老年人口_solid: 0,
          老年人口_dashed: 0,
        }

        Array.from(selectedPrefs).forEach(prefCode => {
          const populationData = data.get(prefCode)

          if (populationData) {
            populationTypes.forEach(type => {
              const series = populationData.data.find(s => s.label === type)
              const dataPoint = series?.data.find(item => item.year === year)
              if (dataPoint) {
                // 実線用（2020年以前 + 2025年）
                if (year <= 2020 || year === 2025) {
                  totals[`${type}_solid`] += dataPoint.value
                }
                // 点線用（2025年以降）
                if (year >= 2025) {
                  totals[`${type}_dashed`] += dataPoint.value
                }
              }
            })
          }
        })

        // 合計値をyearDataに設定
        Object.keys(totals).forEach(key => {
          if (totals[key] > 0) {
            yearData[key] = totals[key]
          }
        })

        chartData.push(yearData)
      })
    } else {
      // 通常表示（従来の処理）
      Array.from(selectedPrefs).forEach(prefCode => {
        const populationData = data.get(prefCode)
        if (populationData) {
          const series = populationData.data.find(s => s.label === selectedType)
          if (series) {
            series.data.forEach(item => years.add(item.year))
          }
        }
      })

      const sortedYears = Array.from(years).sort((a, b) => a - b)

      sortedYears.forEach(year => {
        const yearData: { [key: string]: number | string | boolean } = { year }

        Array.from(selectedPrefs).forEach(prefCode => {
          const pref = prefectures.find(p => p.prefCode === prefCode)
          const populationData = data.get(prefCode)

          if (pref && populationData) {
            const series = populationData.data.find(
              s => s.label === selectedType,
            )
            const dataPoint = series?.data.find(item => item.year === year)
            if (dataPoint) {
              // 実線用（2020以前 + 2025年）
              if (year <= 2020 || year === 2025) {
                yearData[`${pref.prefName}_solid`] = dataPoint.value
              }
              // 点線用（2025年以降）
              if (year >= 2025) {
                yearData[`${pref.prefName}_dashed`] = dataPoint.value
              }
            }
          }
        })

        chartData.push(yearData)
      })
    }

    return chartData
  }

  const chartData = prepareChartData()
  const selectedPrefNames = Array.from(selectedPrefs)
    .map(
      prefCode => prefectures.find(p => p.prefCode === prefCode)?.prefName,
    )
    .filter(Boolean)

  return (
    <div
      style={{
        width: '100%',
        padding: isMobile ? '10px' : '20px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ marginBottom: isMobile ? '15px' : '20px' }}>
        <h2
          id="chart-title"
          style={{
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            marginBottom: '10px',
          }}
        >
          人口推移グラフ
        </h2>
        <form>
          <fieldset
            style={{
              border: 'none',
              padding: 0,
              margin: 0,
              marginTop: '10px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? '8px' : '0',
            }}
          >
            <legend
              style={{
                marginRight: isMobile ? '0' : '10px',
                fontWeight: 'bold',
                fontSize: isMobile ? '0.9rem' : '1rem',
                marginBottom: isMobile ? '5px' : '0',
              }}
            >
              人口種別:
            </legend>
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '5px' : '0',
              }}
            >
              {(
                [
                  '総人口',
                  '年少人口',
                  '生産年齢人口',
                  '老年人口',
                ] as PopulationType[]
              ).map(type => (
                <label
                  key={type}
                  htmlFor={`population-type-${type}`}
                  style={{
                    margin: isMobile ? '0' : '0 10px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="radio"
                    id={`population-type-${type}`}
                    name="populationType"
                    value={type}
                    checked={selectedType === type}
                    onChange={e =>
                      setSelectedType(e.target.value as PopulationType)
                    }
                    style={{ marginRight: '5px' }}
                  />
                  {type}
                </label>
              ))}
            </div>
          </fieldset>
        </form>

        {/* 総人口内訳表示トグル */}
        {selectedType === '総人口' && (
          <div style={{ marginTop: '15px' }}>
            <label
              htmlFor="breakdown-toggle"
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: isMobile ? '0.9rem' : '1rem',
                gap: '8px',
              }}
            >
              <input
                type="checkbox"
                id="breakdown-toggle"
                checked={showBreakdown}
                onChange={e => setShowBreakdown(e.target.checked)}
              />
              <span>内訳を表示（年少・生産年齢・老年人口別）</span>
            </label>
            {selectedPrefs.size > 1 && showBreakdown && (
              <div style={{ 
                fontSize: isMobile ? '0.8rem' : '0.9rem', 
                color: '#666',
                fontStyle: 'italic',
                marginTop: '5px'
              }}>
                ※複数県選択時は各種別の合計値を表示します
              </div>
            )}
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        {selectedType === '総人口' && showBreakdown ? (
          // 内訳表示時：積み上げエリアチャート
          <AreaChart
            data={chartData}
            margin={{
              top: 5,
              right: isMobile ? 15 : 30,
              left: isMobile ? 10 : 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" fontSize={isMobile ? 12 : 14} />
            <YAxis
              fontSize={isMobile ? 12 : 14}
              tickFormatter={value =>
                typeof value === 'number' ? `${(value / 10000).toFixed(0)}万人` : value
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {(() => {
              const populationTypes: PopulationType[] = ['年少人口', '生産年齢人口', '老年人口']
              
              return populationTypes.flatMap(type => {
                const typeColor = getPopulationTypeColor(type)
                
                return [
                  // 実線部分（2020年以前 + 2025年）
                  <Area
                    key={`${type}_solid`}
                    type="monotone"
                    dataKey={`${type}_solid`}
                    stackId="solid"
                    stroke={typeColor}
                    fill={typeColor}
                    fillOpacity={0.6}
                    strokeWidth={2}
                    name={type}
                  />,
                  // 点線部分（2025年以降）- Legendは非表示
                  <Area
                    key={`${type}_dashed`}
                    type="monotone"
                    dataKey={`${type}_dashed`}
                    stackId="dashed"
                    stroke={typeColor}
                    strokeDasharray="5,5"
                    fill={typeColor}
                    fillOpacity={0.4}
                    strokeWidth={2}
                    legendType="none"
                  />
                ]
              })
            })()}
          </AreaChart>
        ) : (
          // 通常表示：線グラフ（2025年以降点線対応）
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: isMobile ? 15 : 30,
              left: isMobile ? 10 : 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" fontSize={isMobile ? 12 : 14} />
            <YAxis
              fontSize={isMobile ? 12 : 14}
              tickFormatter={value =>
                typeof value === 'number' ? `${(value / 10000).toFixed(0)}万人` : value
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedPrefNames.flatMap((prefName, index) => {
              const colorConfig = getPrefectureColor(index)
              
              return [
                // 実線部分（2020年以前 + 2025年）
                <Line
                  key={`${prefName}_solid`}
                  type="monotone"
                  dataKey={`${prefName}_solid`}
                  stroke={colorConfig.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls={false}
                  name={prefName}
                />,
                // 点線部分（2025年以降）- 点は非表示で重複回避、Legendも非表示
                <Line
                  key={`${prefName}_dashed`}
                  type="monotone"
                  dataKey={`${prefName}_dashed`}
                  stroke={colorConfig.color}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                  dot={false}
                  connectNulls={false}
                  legendType="none"
                />
              ]
            })}
          </LineChart>
        )}
      </ResponsiveContainer>
      
      {/* 推計値の注意書き */}
      <div style={{ 
        marginTop: '10px', 
        fontSize: isMobile ? '0.75rem' : '0.8rem', 
        color: '#666',
        textAlign: 'center'
      }}>
        ※2025年以降は推計値
      </div>
    </div>
  )
}
