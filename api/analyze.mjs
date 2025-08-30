// Vercel Serverless Function: /api/analyze
// ESM version for Node runtime on Vercel
import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.VITE_GOOGLE_AI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'Server AI key is not configured' })
    }

    const raw = req.body || {}
    const query = typeof raw.query === 'string' ? raw.query : ''
    const dataContext = typeof raw.dataContext === 'string' ? raw.dataContext : ''

    // Basic input checks
    const sizeLimit = 80_000 // ~80KB
    const approxSize = (query.length + dataContext.length) * 2
    if (approxSize > sizeLimit) {
      return res.status(413).json({ error: 'Input too large' })
    }
    if (!query) {
      return res.status(400).json({ error: 'Missing query' })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `あなたは日本の人口データ分析の専門家です。ユーザーの自然言語クエリを分析して、適切な都道府県を選択してください。\n\n` +
      `ユーザーの質問: "${query}"\n\n` +
      `利用可能なデータ:\n${dataContext}\n\n` +
      `県コード対応表:\n北海道=1, 青森県=2, 岩手県=3, 宮城県=4, 秋田県=5, 山形県=6, 福島県=7, 茨城県=8, 栃木県=9, 群馬県=10, ` +
      `埼玉県=11, 千葉県=12, 東京都=13, 神奈川県=14, 新潟県=15, 富山県=16, 石川県=17, 福井県=18, 山梨県=19, 長野県=20, ` +
      `岐阜県=21, 静岡県=22, 愛知県=23, 三重県=24, 滋賀県=25, 京都府=26, 大阪府=27, 兵庫県=28, 奈良県=29, 和歌山県=30, ` +
      `鳥取県=31, 島根県=32, 岡山県=33, 広島県=34, 山口県=35, 徳島県=36, 香川県=37, 愛媛県=38, 高知県=39, 福岡県=40, ` +
      `佐賀県=41, 長崎県=42, 熊本県=43, 大分県=44, 宮崎県=45, 鹿児島県=46, 沖縄県=47\n\n` +
      `出力はJSONのみ。説明文やコードフェンスは不要。次の形式に厳密に従うこと:\n` +
      `{"selectedPrefectures": [数値の配列], "title": "文字列", "description": "文字列", "insights": [{"prefecture": "文字列", "value": 数値, "unit": "文字列", "context": "文字列"}]}\n` +
      `制約:\n- selectedPrefecturesは上記の県コードの数値のみ\n- 2025年のデータを優先。\n- "データなし"の県は除外。\n- ユーザーがN選/トップNなど指定したら件数を尊重。`

    const result = await model.generateContent(prompt)
    const text = (result.response && typeof result.response.text === 'function')
      ? result.response.text()
      : ''

    // Try parse as-is, then fallback to first JSON object
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      const match = text && text.match(/\{[\s\S]*\}/)
      if (!match) {
        return res.status(502).json({ error: 'Invalid AI response' })
      }
      try {
        parsed = JSON.parse(match[0])
      } catch {
        return res.status(502).json({ error: 'Invalid AI response JSON' })
      }
    }

    // Minimal validation/sanitization
    const toNumber = (v) => (typeof v === 'number' ? v : Number(v))
    const unique = (arr) => Array.from(new Set(arr))
    let selected = Array.isArray(parsed.selectedPrefectures) ? parsed.selectedPrefectures.map(toNumber) : []
    selected = unique(selected.filter((n) => Number.isFinite(n) && n >= 1 && n <= 47))

    const title = typeof parsed.title === 'string' ? parsed.title : 'AI分析結果'
    const description = typeof parsed.description === 'string' ? parsed.description : ''
    const insights = Array.isArray(parsed.insights) ? parsed.insights : []

    return res.status(200).json({
      selectedPrefectures: selected,
      title,
      description,
      insights,
    })
  } catch (e) {
    console.error('Analyze API error:', e)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
