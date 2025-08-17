import { useEffect, useState } from "react"

type Prefecture = {
  prefCode: number
  prefName: string
}

export default function PrefectureList() {
  const [prefs, setPrefs] = useState<Prefecture[]>([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)



  useEffect(() => {
    const fetchPrefectures = async () => {
      try {
        const res = await fetch(
          "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures",
          {
            headers: {
              "X-API-KEY": "8FzX5qLmN3wRtKjH7vCyP9bGdEaU4sYpT6cMfZnJ",
            },
          }
        )
        const data = await res.json()
        setPrefs(data.result)

      } catch {
        setError("都道府県データの取得に失敗しました")

      } finally {
        setLoading(false)
      }
    }
    fetchPrefectures()
  }, [])

  if (loading) return <p>読み込み中...</p>

  if (error) return <p>エラー: {error}</p>


  return (
    <ul>
      {prefs.map((p) => (
        <li key={p.prefCode}>
          {p.prefCode}: {p.prefName}
        </li>
      ))}
    </ul>
  )
}