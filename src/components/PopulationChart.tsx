import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { PopulationResponse } from "../types/api"

type PopulationChartProps = {
  data: Map<number, PopulationResponse>
  selectedPrefs: Set<number>
  prefectures: Array<{ prefCode: number; prefName: string }>
}

type PopulationType = "総人口" | "年少人口" | "生産年齢人口" | "老年人口"

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1", 
  "#d084d0", "#87ceeb", "#dda0dd", "#98fb98", "#f0e68c"
]

export default function PopulationChart({ data, selectedPrefs, prefectures }: PopulationChartProps) {
  const [selectedType, setSelectedType] = useState<PopulationType>("総人口")

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
    const chartData: { [key: string]: any }[] = []

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
      const yearData: { [key: string]: any } = { year }
      
      Array.from(selectedPrefs).forEach(prefCode => {
        const pref = prefectures.find(p => p.prefCode === prefCode)
        const populationData = data.get(prefCode)
        
        if (pref && populationData) {
          const series = populationData.data.find(s => s.label === selectedType)
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
    .map(prefCode => prefectures.find(p => p.prefCode === prefCode)?.prefName)
    .filter(Boolean)

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>人口推移グラフ</h2>
        <div style={{ marginTop: '10px' }}>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>人口種別:</label>
          {(["総人口", "年少人口", "生産年齢人口", "老年人口"] as PopulationType[]).map(type => (
            <label key={type} style={{ margin: '0 10px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="populationType"
                value={type}
                checked={selectedType === type}
                onChange={(e) => setSelectedType(e.target.value as PopulationType)}
                style={{ marginRight: '5px' }}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          {selectedPrefNames.map((prefName, index) => (
            <Line
              key={prefName}
              type="monotone"
              dataKey={prefName}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}