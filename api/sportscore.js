// Vercel serverless function — CORS proxy for sportscore.com API
export default async function handler(req, res) {
  const { sport = 'football', limit = '100' } = req.query

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const upstream = await fetch(
      `https://sportscore.com/api/widget/matches/?sport=${encodeURIComponent(sport)}&limit=${encodeURIComponent(limit)}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Chillz/1.0',
        },
      }
    )
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Upstream error ${upstream.status}` })
    }
    const data = await upstream.json()
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30')
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', message: err.message })
  }
}
