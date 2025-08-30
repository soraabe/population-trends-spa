import type { AnalysisResult } from '../services/data-analyzer'

type AnalysisInsightProps = {
  result: AnalysisResult
  isMobile: boolean
}

export default function AnalysisInsight({ result, isMobile }: AnalysisInsightProps) {
  return (
    <div
      style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: isMobile ? '12px' : '16px',
        marginBottom: '20px',
      }}
    >
      <h3
        style={{
          fontSize: isMobile ? '1rem' : '1.1rem',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#495057',
        }}
      >
        🤖 AI分析結果: {result.title}
      </h3>
      
      <p
        style={{
          fontSize: isMobile ? '0.85rem' : '0.9rem',
          lineHeight: '1.5',
          color: '#6c757d',
          marginBottom: result.insights.length > 0 ? '12px' : '0',
        }}
      >
        {result.description}
      </p>

      {result.insights.length > 0 && (
        <div>
          <h4
            style={{
              fontSize: isMobile ? '0.9rem' : '1rem',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#495057',
            }}
          >
            詳細データ:
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: isMobile ? '8px' : '12px',
            }}
          >
            {result.insights.map((insight, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: isMobile ? '8px' : '10px',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                }}
              >
                <div
                  style={{
                    fontWeight: '600',
                    fontSize: isMobile ? '0.8rem' : '0.85rem',
                    color: '#495057',
                  }}
                >
                  {insight.prefecture}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                    color: '#6c757d',
                    marginTop: '4px',
                  }}
                >
                  {insight.context}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}