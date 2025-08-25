import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { PopulationResponse } from '../types/api'

type PopulationChartProps = {
  data: Map<number, PopulationResponse>
  selectedPrefs: Set<number>
  prefectures: Array<{ prefCode: number; prefName: string }>
  isMobile: boolean
}

type PopulationType = '総人口' | '年少人口' | '生産年齢人口' | '老年人口'

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#8dd1e1',
  '#d084d0',
  '#87ceeb',
  '#dda0dd',
  '#98fb98',
  '#f0e68c',
]

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
        {payload.map((entry: TooltipPayload, index: number) => (
          <div key={index} style={{ color: entry.color, margin: 0 }}>
            {entry.dataKey}: {entry.value?.toLocaleString()}人
          </div>
        ))}
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
    const chartData: { [key: string]: number | string }[] = []

    // 全ての年を収集
    Array.from(selectedPrefs).forEach(prefCode => {
      const populationData = data.get(prefCode)
      if (populationData) {
        const series = populationData.data.find(s => s.label === selectedType)
        if (series) {
          series.data.forEach(item => years.add(item.year))
        }
      }
    })

    // 年でソート
    const sortedYears = Array.from(years).sort((a, b) => a - b)

    // チャートデータを構築
    sortedYears.forEach(year => {
      const yearData: { [key: string]: number | string } = { year }

      Array.from(selectedPrefs).forEach(prefCode => {
        const pref = prefectures.find(p => p.prefCode === prefCode)
        const populationData = data.get(prefCode)

        if (pref && populationData) {
          const series = populationData.data.find(
            s => s.label === selectedType,
          )
          const dataPoint = series?.data.find(item => item.year === year)
          if (dataPoint) {
            yearData[pref.prefName] = dataPoint.value
          }
        }
      })

      chartData.push(yearData)
    })

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
      </div>

      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
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
              typeof value === 'number' ? value.toLocaleString() : value
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {selectedPrefNames.map((prefName, index) => (
            <Line
              key={prefName}
              type="monotone"
              dataKey={prefName}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
