import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = process.env.GOOGLE_AI_API_KEY

if (!API_KEY) {
  console.error('GOOGLE_AI_API_KEY環境変数が設定されていません')
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

export async function analyzeQuery(req, res) {

  if (!genAI) {
    return res.status(500).json({
      error: 'AI service not available. Please set GOOGLE_AI_API_KEY environment variable.'
    })
  }

  try {
    const { query, dataContext } = req.body


    if (!query || !dataContext) {
      return res.status(400).json({ error: 'Missing query or dataContext' })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
あなたは日本の人口データ分析の専門家です。ユーザーの自然言語クエリを分析して、適切な都道府県を選択してください。

ユーザーの質問: "${query}"

利用可能なデータ:
${dataContext}

県コード対応表:
北海道=1, 青森県=2, 岩手県=3, 宮城県=4, 秋田県=5, 山形県=6, 福島県=7, 茨城県=8, 栃木県=9, 群馬県=10, 埼玉県=11, 千葉県=12, 東京都=13, 神奈川県=14, 新潟県=15, 富山県=16, 石川県=17, 福井県=18, 山梨県=19, 長野県=20, 岐阜県=21, 静岡県=22, 愛知県=23, 三重県=24, 滋賀県=25, 京都府=26, 大阪府=27, 兵庫県=28, 奈良県=29, 和歌山県=30, 鳥取県=31, 島根県=32, 岡山県=33, 広島県=34, 山口県=35, 徳島県=36, 香川県=37, 愛媛県=38, 高知県=39, 福岡県=40, 佐賀県=41, 長崎県=42, 熊本県=43, 大分県=44, 宮崎県=45, 鹿児島県=46, 沖縄県=47

以下のJSON形式で回答してください:
{
  "selectedPrefectures": [選択すべき県コードの配列],
  "title": "選択理由のタイトル",
  "description": "一言解説（100文字以内）",
  "insights": [
    {
      "prefecture": "県名",
      "value": 数値,
      "unit": "単位",
      "context": "その県が選択された理由"
    }
  ]
}

重要な注意事項:
- selectedPrefecturesには必ず上記の県コード対応表の数値を使用してください
- 基準年は2020年の人口データを使用してください
- 「データなし」と表示されている県は除外してください
- 例「人口が多い県5つ」→2025年の総人口上位5県: 東京都=13, 神奈川県=14, 大阪府=27, 愛知県=23, 埼玉県=11
- 例「関西」→滋賀県=25, 京都府=26, 大阪府=27, 兵庫県=28, 奈良県=29, 和歌山県=30
- 県コードは必ず数値で返し、県名と県コードを正確に対応させてください
- contextには実際のデータ値と「2020年の○○人口」のように年次を明記してください
- 「○○が少ない県N選」では必ず実際の数値データを昇順ソートして最小値から選択
- 九州年少人口例：佐賀県103,830人 < 大分県128,920人 < 宮崎県132,392人 < 長崎県152,059人
- 必ず提供されたデータの数値を正確に比較してください
`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid AI response format')
    }

    const parsed = JSON.parse(jsonMatch[0])

    const response = {
      selectedPrefectures: (parsed.selectedPrefectures || []).map(code => Number(code)),
      title: parsed.title || 'AI分析結果',
      description: parsed.description || '',
      insights: parsed.insights || []
    }

    res.json(response)

  } catch (error) {
    res.status(500).json({
      error: 'AI analysis failed',
      selectedPrefectures: [],
      title: 'AI分析エラー',
      description: 'AI分析中にエラーが発生しました。',
      insights: []
    })
  }
}
