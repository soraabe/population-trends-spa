// GET /api/prefectures -> proxies to external Yumemi API with server-side key
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const key = process.env.POP_API_KEY || process.env.VITE_API_KEY
  if (!key) return res.status(500).json({ error: 'POP_API_KEY not configured' })

  const url = 'https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures'
  try {
    const r = await fetch(url, { headers: { 'X-API-KEY': key } })
    const body = await r.text()
    res.status(r.status)
    res.setHeader('content-type', r.headers.get('content-type') || 'application/json')
    return res.send(body)
  } catch (e) {
    console.error('prefectures proxy error', e)
    return res.status(502).json({ error: 'Upstream error' })
  }
}

