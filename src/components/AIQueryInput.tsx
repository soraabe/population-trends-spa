import { useState } from 'react'

type AIQueryInputProps = {
  onRunAnalysis: (query: string) => void
  isAnalyzing: boolean
  isMobile: boolean
}

const SAMPLE_QUERIES = [
  "人口が多い県5つ",
  "関西地方を選択",
  "人口減少が激しい県を教えて",
  "東京と大阪を比較したい",
  "九州で年少人口が少ない県3選"
]

export default function AIQueryInput({ onRunAnalysis, isAnalyzing, isMobile }: AIQueryInputProps) {
  const [query, setQuery] = useState('')
  const [showSamples, setShowSamples] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isAnalyzing) {
      onRunAnalysis(query.trim())
    }
  }

  const handleSampleClick = (sampleQuery: string) => {
    setQuery(sampleQuery)
    setShowSamples(false)
    onRunAnalysis(sampleQuery)
  }

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '2px solid #007bff',
        borderRadius: '8px',
        padding: isMobile ? '12px' : '16px',
        marginBottom: '20px',
      }}
    >
      <h3
        style={{
          fontSize: isMobile ? '1rem' : '1.1rem',
          fontWeight: 'bold',
          marginBottom: '12px',
          color: '#007bff',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🔍 AI人口分析
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例：関東で老年人口多いトップ5"
            disabled={isAnalyzing}
            style={{
              width: '100%',
              padding: isMobile ? '10px' : '12px',
              fontSize: isMobile ? '0.9rem' : '1rem',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>
        
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
          }}
        >
          <button
            type="submit"
            disabled={!query.trim() || isAnalyzing}
            style={{
              padding: isMobile ? '10px' : '10px 20px',
              backgroundColor: isAnalyzing ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: isMobile ? '0.9rem' : '1rem',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              opacity: isAnalyzing || !query.trim() ? 0.6 : 1,
            }}
          >
            {isAnalyzing ? '分析中...' : '分析実行'}
          </button>
          
          <button
            type="button"
            onClick={() => setShowSamples(!showSamples)}
            style={{
              padding: isMobile ? '8px' : '8px 16px',
              backgroundColor: 'transparent',
              color: '#007bff',
              border: '1px solid #007bff',
              borderRadius: '4px',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              cursor: 'pointer',
            }}
          >
            {showSamples ? '隠す' : 'サンプル'}
          </button>
        </div>
      </form>

      {showSamples && (
        <div style={{ marginTop: '12px' }}>
          <p
            style={{
              fontSize: isMobile ? '0.8rem' : '0.85rem',
              color: '#6c757d',
              marginBottom: '8px',
            }}
          >
            クリックして実行:
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {SAMPLE_QUERIES.map((sampleQuery, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSampleClick(sampleQuery)}
                disabled={isAnalyzing}
                style={{
                  textAlign: 'left',
                  padding: isMobile ? '8px' : '8px 12px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  fontSize: isMobile ? '0.8rem' : '0.85rem',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  opacity: isAnalyzing ? 0.6 : 1,
                  color: '#495057',
                }}
              >
                {sampleQuery}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}