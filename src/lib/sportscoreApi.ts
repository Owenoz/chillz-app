// ── Sportscore API ─────────────────────────────────────────────
// Source: https://sportscore.com/api/widget/matches/?sport=football&limit=50

export interface SportscoreMatch {
  home: string
  away: string
  home_logo: string
  away_logo: string
  home_score: string | null
  away_score: string | null
  status: 'live' | 'upcoming' | 'finished'
  status_text: string
  time: string         // ISO date string
  competition: string
  competition_logo: string
  url: string          // relative path e.g. /football/match/.../
}

export interface SportscoreResponse {
  sport: string
  count: number
  matches: SportscoreMatch[]
  updated: string
}

const API_BASE = 'https://sportscore.com/api/widget/matches'

const CACHE_KEY  = 'chillz_sportscore_v1'
const CACHE_META = 'chillz_sportscore_meta_v1'
const CACHE_TTL  = 60 * 1000 // 1 minute

function saveCache(data: SportscoreMatch[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
    sessionStorage.setItem(CACHE_META, Date.now().toString())
  } catch { /* ignore */ }
}

function loadCache(): SportscoreMatch[] | null {
  try {
    const meta = sessionStorage.getItem(CACHE_META)
    if (!meta || Date.now() - Number(meta) > CACHE_TTL) return null
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export async function fetchMatches(sport = 'football', limit = 100, force = false): Promise<SportscoreMatch[]> {
  if (!force) {
    const cached = loadCache()
    if (cached) return cached
  }

  try {
    const res = await fetch(
      `${API_BASE}/?sport=${sport}&limit=${limit}`,
      {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Chillz/1.0' },
        signal: AbortSignal.timeout(10000),
      }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: SportscoreResponse = await res.json()
    const matches = data.matches || []
    saveCache(matches)
    return matches
  } catch {
    // Try with CORS proxy as fallback
    try {
      const res = await fetch(
        `/api/sportscore?sport=${sport}&limit=${limit}`,
        { signal: AbortSignal.timeout(8000) }
      )
      if (!res.ok) throw new Error(`proxy HTTP ${res.status}`)
      const data: SportscoreResponse = await res.json()
      const matches = data.matches || []
      saveCache(matches)
      return matches
    } catch {
      return []
    }
  }
}

export function getStatusColor(status: string): string {
  const s = status.toLowerCase()
  if (s === 'live') return '#ef4444'
  if (s === 'finished') return '#6b7280'
  return '#10b981'
}

export function formatMatchTime(isoDate: string): string {
  try {
    const d = new Date(isoDate)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)
    const isTomorrow = d.toDateString() === tomorrow.toDateString()
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (isToday) return `Today ${time}`
    if (isTomorrow) return `Tomorrow ${time}`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + time
  } catch { return '' }
}
