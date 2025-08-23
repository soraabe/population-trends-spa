import { useState, useEffect } from 'react'
import type { Prefecture } from '../types/api'

export function usePrefectures() {
  const [prefectures, setPrefectures] = useState<Prefecture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrefectures = async () => {
      try {
        const res = await fetch(
          'https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures',
          {
            headers: {
              'X-API-KEY': '8FzX5qLmN3wRtKjH7vCyP9bGdEaU4sYpT6cMfZnJ',
            },
          },
        )
        const data = await res.json()
        setPrefectures(data.result)
      } catch {
        setError('都道府県データの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPrefectures()
  }, [])

  return { prefectures, loading, error }
}