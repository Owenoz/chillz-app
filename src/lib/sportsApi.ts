import type { Fixture } from '../data/types'

// TheSportsDB free tier API
const BASE = 'https://www.thesportsdb.com/api/v1/json/123'

// Extended league list — latest 2024/2025 season IDs
const LEAGUES = [
  { id: 4328,  name: 'English Premier League' },
  { id: 4335,  name: 'Spanish La Liga' },
  { id: 4332,  name: 'Italian Serie A' },
  { id: 4334,  name: 'French Ligue 1' },
  { id: 4331,  name: 'German Bundesliga' },
  { id: 4480,  name: 'UEFA Champions League' },
  { id: 4399,  name: 'Dutch Eredivisie' },
  { id: 4418,  name: 'Portuguese Primeira Liga' },
  { id: 4346,  name: 'Scottish Premiership' },
  { id: 4351,  name: 'Brazilian Série A' },
  { id: 4387,  name: 'MLS' },
  { id: 4350,  name: 'Argentine Primera División' },
  { id: 4344,  name: 'Turkish Süper Lig' },
  { id: 4356,  name: 'Russian Premier League' },
  { id: 4379,  name: 'Saudi Pro League' },
  // Africa
  { id: 4396,  name: 'Uganda Premier League' },
  { id: 4576,  name: 'CAF Champions League' },
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
  strThumb?:        string
}

async function fetchWithTimeout(url: string, ms = 10000): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}

function mapStatus(e: SDBEvent): Fixture['status'] {
  const s = (e.strStatus || '').toUpperCase().trim()
  if (['1H','HT','2H','ET','LIVE','IN PLAY','INPLAY','NS','PLAYING'].includes(s)) return 'IN_PLAY'
  if (['FT','AET','PEN','FINISHED','POST'].includes(s)) return 'FINISHED'
  if (['CANC','CANCELLED','ABD','ABANDONED'].includes(s)) return 'CANCELLED'
  if (['PPD','POSTPONED'].includes(s)) return 'CANCELLED'
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

  // Fetch next 15 events
  try {
    const res = await fetchWithTimeout(`${BASE}/eventsnextleague.php?id=${leagueId}&e=15`)
    if (res.ok) {
      const data = await res.json()
      const events: SDBEvent[] = data?.events || []
      events.forEach(e => fixtures.push(toFixture(e, leagueId)))
    }
  } catch { /* timeout — skip */ }

  // Fetch last 15 events (recently played)
  try {
    const res = await fetchWithTimeout(`${BASE}/eventspastleague.php?id=${leagueId}&e=15`)
    if (res.ok) {
      const data = await res.json()
      const events: SDBEvent[] = data?.events || []
      events.forEach(e => fixtures.push(toFixture(e, leagueId)))
    }
  } catch { /* skip */ }

  return fixtures
}

// Session cache — 5 minute TTL for fixtures
const FIXTURE_CACHE_KEY = 'chillz_fixtures_v2'
const FIXTURE_CACHE_META = 'chillz_fixtures_meta_v2'

function saveFixtureCache(fixtures: Fixture[]) {
  try {
    sessionStorage.setItem(FIXTURE_CACHE_KEY, JSON.stringify(fixtures))
    sessionStorage.setItem(FIXTURE_CACHE_META, Date.now().toString())
  } catch { /* ignore */ }
}

function loadFixtureCache(): Fixture[] | null {
  try {
    const meta = sessionStorage.getItem(FIXTURE_CACHE_META)
    if (!meta || Date.now() - Number(meta) > 5 * 60 * 1000) return null
    const raw = sessionStorage.getItem(FIXTURE_CACHE_KEY)
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
    results.forEach(r => {
      if (r.status === 'fulfilled') all.push(...r.value)
    })
  }

  // Deduplicate
  const seen = new Set<number>()
  const unique = all.filter(f => {
    if (seen.has(f.id)) return false
    seen.add(f.id); return true
  })

  // Sort: live first, then upcoming by date, then finished
  const sorted = unique.sort((a, b) => {
    const statusOrder = (s: string) => s === 'IN_PLAY' || s === 'PAUSED' ? 0 : s === 'SCHEDULED' || s === 'TIMED' ? 1 : 2
    const so = statusOrder(a.status) - statusOrder(b.status)
    if (so !== 0) return so
    return new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime()
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
  } catch {
    return null
  }
}
