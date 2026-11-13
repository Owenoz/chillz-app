// ── Sports API — exact same setup as criki (saikotportal/criki) ──
// Source: https://github.com/saikotportal/criki/blob/main/js/config.js
// Uses TheSportsDB free tier for fixtures

import type { Fixture } from '../data/types'

const BASE = 'https://www.thesportsdb.com/api/v1/json/123'

// Exact leagues from criki config.js
const LEAGUES = [
  { id: 4328, name: 'Premier League',       sport: 'football' },
  { id: 4335, name: 'La Liga',              sport: 'football' },
  { id: 4332, name: 'Serie A',              sport: 'football' },
  { id: 4331, name: 'Bundesliga',           sport: 'football' },
  { id: 4334, name: 'Ligue 1',              sport: 'football' },
  { id: 4480, name: 'UEFA Champions League',sport: 'football' },
  { id: 4481, name: 'UEFA Europa League',   sport: 'football' },
  { id: 4429, name: 'FIFA World Cup',       sport: 'football' },
  { id: 4499, name: 'Copa America',         sport: 'football' },
  // Extra Africa + major leagues
  { id: 4396, name: 'Uganda Premier League',sport: 'football' },
  { id: 4576, name: 'CAF Champions League', sport: 'football' },
  { id: 4387, name: 'MLS',                  sport: 'football' },
  { id: 4350, name: 'Argentine Primera',    sport: 'football' },
  { id: 4379, name: 'Saudi Pro League',     sport: 'football' },
]

interface SDBEvent {
  idEvent:          string
  strLeague:        string
  strHomeTeam:      string
  strAwayTeam:      string
  strHomeTeamBadge?: string
  strAwayTeamBadge?: string
  dateEvent:        string
  strTime?:         string
  strTimestamp?:    string
  intHomeScore?:    string | null
  intAwayScore?:    string | null
  strStatus?:       string
  strVenue?:        string
  strRound?:        string
  intRound?:        string
}

async function fetchWithTimeout(url: string, ms = 10000): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try { return await fetch(url, { signal: ctrl.signal }) }
  finally { clearTimeout(timer) }
}

function mapStatus(e: SDBEvent): Fixture['status'] {
  const s = (e.strStatus || '').toUpperCase().trim()
  if (['1H','HT','2H','ET','LIVE','IN PLAY','INPLAY','NS','PLAYING'].includes(s)) return 'IN_PLAY'
  if (['FT','AET','PEN','FINISHED','POST'].includes(s)) return 'FINISHED'
  if (['CANC','CANCELLED','ABD','ABANDONED','PPD','POSTPONED'].includes(s)) return 'CANCELLED'
  return 'SCHEDULED'
}

function mapWinner(e: SDBEvent): Fixture['winner'] {
  const h = e.intHomeScore != null && e.intHomeScore !== '' ? Number(e.intHomeScore) : null
  const a = e.intAwayScore != null && e.intAwayScore !== '' ? Number(e.intAwayScore) : null
  if (h == null || a == null) return null
  if (h > a) return 'HOME_TEAM'
  if (a > h) return 'AWAY_TEAM'
  return 'DRAW'
}

function toFixture(e: SDBEvent, leagueId: number): Fixture {
  const date = e.strTimestamp
    ? new Date(e.strTimestamp).toISOString()
    : `${e.dateEvent}T${e.strTime || '00:00:00'}+00:00`
  return {
    id:               Number(e.idEvent),
    competition_id:   leagueId,
    competition_name: e.strLeague,
    matchday:         Number(e.intRound) || 0,
    utc_date:         date,
    status:           mapStatus(e),
    home_team_id:     0,
    home_team_name:   e.strHomeTeam,
    home_team_crest:  e.strHomeTeamBadge || '',
    away_team_id:     0,
    away_team_name:   e.strAwayTeam,
    away_team_crest:  e.strAwayTeamBadge || '',
    home_score:       e.intHomeScore != null && e.intHomeScore !== '' ? Number(e.intHomeScore) : null,
    away_score:       e.intAwayScore != null && e.intAwayScore !== '' ? Number(e.intAwayScore) : null,
    winner:           mapWinner(e),
    enabled:          true,
    is_match_of_day:  false,
    is_trending:      false,
    venue:            e.strVenue || null,
    city:             null,
    stage:            e.strRound || null,
  }
}

async function fetchLeague(leagueId: number): Promise<Fixture[]> {
  const fixtures: Fixture[] = []
  try {
    const res = await fetchWithTimeout(`${BASE}/eventsnextleague.php?id=${leagueId}`)
    if (res.ok) {
      const data = await res.json()
      ;(data?.events || []).forEach((e: SDBEvent) => fixtures.push(toFixture(e, leagueId)))
    }
  } catch { /* skip */ }
  try {
    const res = await fetchWithTimeout(`${BASE}/eventspastleague.php?id=${leagueId}`)
    if (res.ok) {
      const data = await res.json()
      ;(data?.events || []).forEach((e: SDBEvent) => fixtures.push(toFixture(e, leagueId)))
    }
  } catch { /* skip */ }
  return fixtures
}

const CACHE_KEY  = 'chillz_fixtures_v3'
const CACHE_META = 'chillz_fixtures_meta_v3'

function saveFixtureCache(fixtures: Fixture[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(fixtures))
    sessionStorage.setItem(CACHE_META, Date.now().toString())
  } catch { /* ignore */ }
}

function loadFixtureCache(): Fixture[] | null {
  try {
    const meta = sessionStorage.getItem(CACHE_META)
    if (!meta || Date.now() - Number(meta) > 5 * 60 * 1000) return null
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export async function fetchLiveFixtures(force = false): Promise<Fixture[]> {
  if (!force) {
    const cached = loadFixtureCache()
    if (cached) return cached
  }

  const BATCH = 3
  const all: Fixture[] = []

  for (let i = 0; i < LEAGUES.length; i += BATCH) {
    const batch = LEAGUES.slice(i, i + BATCH)
    const results = await Promise.allSettled(batch.map(l => fetchLeague(l.id)))
    results.forEach(r => { if (r.status === 'fulfilled') all.push(...r.value) })
  }

  const seen = new Set<number>()
  const unique = all.filter(f => { if (seen.has(f.id)) return false; seen.add(f.id); return true })

  const sorted = unique.sort((a, b) => {
    const o = (s: string) => s === 'IN_PLAY' || s === 'PAUSED' ? 0 : s === 'SCHEDULED' || s === 'TIMED' ? 1 : 2
    const diff = o(a.status) - o(b.status)
    return diff !== 0 ? diff : new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime()
  })

  saveFixtureCache(sorted)
  return sorted
}

export async function fetchFixtureById(id: number): Promise<Fixture | null> {
  try {
    const res = await fetchWithTimeout(`${BASE}/lookupevent.php?id=${id}`)
    if (!res.ok) return null
    const data = await res.json()
    const events: SDBEvent[] = data?.events || []
    if (!events.length) return null
    const e = events[0]
    const league = LEAGUES.find(l => l.name === e.strLeague) || LEAGUES[0]
    return toFixture(e, league.id)
  } catch { return null }
}
