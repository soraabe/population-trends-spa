import type { Prefecture } from '../types/api'

type PrefectureListProps = {
  prefectures: Prefecture[]
  selectedPrefs: Set<number>
  loadingPrefs: boolean
  loadingPopulation: Set<number>
  error: string | null
  onTogglePrefecture: (prefCode: number) => void
  onClearSelection: () => void
  isMobile: boolean
}

export default function PrefectureList({
  prefectures,
  selectedPrefs,
  loadingPrefs,
  loadingPopulation,
  error,
  onTogglePrefecture,
  onClearSelection,
  isMobile,
}: PrefectureListProps) {
  if (loadingPrefs) return <p>読み込み中...</p>

  if (error) return <p>エラー: {error}</p>

  return (
    <div>
      <h2
        id="prefecture-title"
        style={{
          fontSize: isMobile ? '1.2rem' : '1.5rem',
          marginBottom: isMobile ? '15px' : '20px',
        }}
      >
        都道府県を選択してください
      </h2>
      {selectedPrefs.size > 0 && (
        <button
          type="button"
          onClick={onClearSelection}
          style={{
            padding: '8px 16px',
            marginBottom: '15px',
            backgroundColor: '#333',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: isMobile ? '0.8rem' : '0.9rem',
          }}
        >
          全て解除 ({selectedPrefs.size}件選択中)
        </button>
      )}
      <form>
        <fieldset
          style={{
            border: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          <legend style={{ position: 'absolute', left: '-9999px' }}>
            都道府県選択
          </legend>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? 'repeat(auto-fill, minmax(120px, 1fr))'
                : 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: isMobile ? '6px' : '8px',
            }}
          >
            {prefectures.map(prefecture => (
              <label
                key={prefecture.prefCode}
                htmlFor={`prefecture-${prefecture.prefCode}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '6px' : '8px',
                  opacity: loadingPopulation.has(prefecture.prefCode) ? 0.7 : 1,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  padding: isMobile ? '4px' : '0',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  id={`prefecture-${prefecture.prefCode}`}
                  name={`prefecture-${prefecture.prefCode}`}
                  checked={selectedPrefs.has(prefecture.prefCode)}
                  onChange={() => onTogglePrefecture(prefecture.prefCode)}
                  disabled={loadingPopulation.has(prefecture.prefCode)}
                />
                <span>{prefecture.prefName}</span>
                {loadingPopulation.has(prefecture.prefCode) && (
                  <span
                    style={{
                      fontSize: isMobile ? '10px' : '12px',
                      color: '#666',
                    }}
                  >
                    読み込み中...
                  </span>
                )}
              </label>
            ))}
          </div>
        </fieldset>
      </form>
    </div>
  )
}