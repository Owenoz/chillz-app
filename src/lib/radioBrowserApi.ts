// ── Radio Browser API ─────────────────────────────────────────
// Free public API: https://www.radio-browser.info/
// Docs: https://docs.radio-browser.info/

export interface RadioBrowserStation {
  stationuuid: string
  name: string
  url_resolved: string
  url: string
  favicon: string
  tags: string
  country: string
  countrycode: string
  language: string
  codec: string
  bitrate: number
  votes: number
  lastcheckok: number
  homepage: string
}

export interface RadioStation {
  id: string
  name: string
  url: string
  favicon: string
  tags: string[]
  country: string
  countrycode: string
  language: string
  codec: string
  bitrate: number
  votes: number
  homepage: string
}

// Multiple mirrors for reliability
const MIRRORS = [
  'https://de1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://at1.api.radio-browser.info',
]

const USER_AGENT = 'Chillz/1.0'

async function radioBrowserFetch(path: string): Promise<Response> {
  for (const mirror of MIRRORS) {
    try {
      const res = await fetch(`${mirror}${path}`, {
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) return res
    } catch {
      // try next mirror
    }
  }
  throw new Error('All radio-browser mirrors failed')
}

function mapStation(s: RadioBrowserStation): RadioStation {
  return {
    id: s.stationuuid,
    name: s.name.trim(),
    url: s.url_resolved || s.url,
    favicon: s.favicon || '',
    tags: s.tags ? s.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    country: s.country,
    countrycode: s.countrycode,
    language: s.language,
    codec: s.codec,
    bitrate: s.bitrate,
    votes: s.votes,
    homepage: s.homepage,
  }
}

/** Fetch top stations for a country (by votes, working only) */
export async function fetchStationsByCountry(
  country: string,
  limit = 60,
): Promise<RadioStation[]> {
  try {
    const res = await radioBrowserFetch(
      `/json/stations/bycountry/${encodeURIComponent(country)}?limit=${limit}&order=votes&reverse=true&hidebroken=true`
    )
    const data: RadioBrowserStation[] = await res.json()
    return data
      .filter(s => s.lastcheckok === 1 && (s.url_resolved || s.url))
      .map(mapStation)
  } catch {
    return []
  }
}

/** Search stations by name */
export async function searchStations(
  query: string,
  limit = 40,
): Promise<RadioStation[]> {
  try {
    const res = await radioBrowserFetch(
      `/json/stations/byname/${encodeURIComponent(query)}?limit=${limit}&order=votes&reverse=true&hidebroken=true`
    )
    const data: RadioBrowserStation[] = await res.json()
    return data
      .filter(s => s.lastcheckok === 1 && (s.url_resolved || s.url))
      .map(mapStation)
  } catch {
    return []
  }
}

/** Fetch top stations globally by tag */
export async function fetchStationsByTag(
  tag: string,
  limit = 40,
): Promise<RadioStation[]> {
  try {
    const res = await radioBrowserFetch(
      `/json/stations/bytag/${encodeURIComponent(tag)}?limit=${limit}&order=votes&reverse=true&hidebroken=true`
    )
    const data: RadioBrowserStation[] = await res.json()
    return data
      .filter(s => s.lastcheckok === 1 && (s.url_resolved || s.url))
      .map(mapStation)
  } catch {
    return []
  }
}

/** Fetch top popular stations globally */
export async function fetchTopStations(limit = 60): Promise<RadioStation[]> {
  try {
    const res = await radioBrowserFetch(
      `/json/stations?limit=${limit}&order=votes&reverse=true&hidebroken=true`
    )
    const data: RadioBrowserStation[] = await res.json()
    return data
      .filter(s => s.lastcheckok === 1 && (s.url_resolved || s.url))
      .map(mapStation)
  } catch {
    return []
  }
}

/** Record a station click (improves ranking) */
export async function recordStationClick(stationuuid: string): Promise<void> {
  try {
    await radioBrowserFetch(`/json/url/${stationuuid}`)
  } catch {
    // best effort
  }
}

// Country groups for the radio UI
export const RADIO_COUNTRY_GROUPS = [
  { key: 'Uganda',       label: '🇺🇬 Uganda',       flag: '🇺🇬' },
  { key: 'Kenya',        label: '🇰🇪 Kenya',         flag: '🇰🇪' },
  { key: 'Tanzania',     label: '🇹🇿 Tanzania',      flag: '🇹🇿' },
  { key: 'Nigeria',      label: '🇳🇬 Nigeria',       flag: '🇳🇬' },
  { key: 'Ghana',        label: '🇬🇭 Ghana',         flag: '🇬🇭' },
  { key: 'South Africa', label: '🇿🇦 South Africa',  flag: '🇿🇦' },
  { key: 'United Kingdom', label: '🇬🇧 UK',          flag: '🇬🇧' },
  { key: 'United States of America', label: '🇺🇸 USA', flag: '🇺🇸' },
]
