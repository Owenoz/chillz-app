// ── IPTV-org Live Channel Fetcher ─────────────────────────────
// Primary: Nexonic IPTV (https://github.com/Shahrukhalid/nexonic-iptv)
//   — verified streams checked 3x/day, 4,325 working channels
// Fallback: iptv-org (https://github.com/iptv-org/iptv)

export interface IptvChannel {
  id: string
  title: string
  source_url: string
  source_type: 'hls' | 'youtube'
  category: string
  active: boolean
  country: string | null
  country_code: string | null
  display_order: number
  poster_url: string | null
  description: string | null
  group: string
  quality: string
}

// ── Hardcoded Uganda channels — verified working, tested Nov 2026 ──
// These are always shown first regardless of M3U fetch results
export const UGANDA_CHANNELS_HARDCODED: IptvChannel[] = [
  {
    id: 'ug-bukedde1',
    title: 'Bukedde TV 1',
    source_url: 'https://stream.hydeinnovations.com/bukedde1flussonic/index.m3u8',
    source_type: 'hls',
    category: 'general',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 1,
    poster_url: 'https://i.imgur.com/HFq5QlJ.png',
    description: 'Bukedde TV 1 — Uganda · Luganda news & entertainment',
    group: 'General',
    quality: '1080p',
  },
  {
    id: 'ug-bukedde2',
    title: 'Bukedde TV 2',
    source_url: 'https://stream.hydeinnovations.com/bukedde2flussonic/index.m3u8',
    source_type: 'hls',
    category: 'general',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 2,
    poster_url: 'https://i.imgur.com/ukwPZeY.png',
    description: 'Bukedde TV 2 · Uganda',
    group: 'General',
    quality: '1080p',
  },
  {
    id: 'ug-tvwest',
    title: 'TV West Uganda',
    source_url: 'https://stream.hydeinnovations.com/tvwest-flussonic/index.m3u8',
    source_type: 'hls',
    category: 'general',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 3,
    poster_url: 'https://i.imgur.com/EiJzkIz.png',
    description: 'TV West Uganda — Western Uganda news & entertainment',
    group: 'General',
    quality: '720p',
  },
  {
    id: 'ug-wanluo',
    title: 'Wan Luo TV',
    source_url: 'https://stream.hydeinnovations.com/luotv-flussonic/index.m3u8',
    source_type: 'hls',
    category: 'general',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 4,
    poster_url: 'https://i.imgur.com/4PUUp3E.png',
    description: 'Wan Luo TV · Uganda',
    group: 'General',
    quality: '720p',
  },
  {
    id: 'ug-arktv',
    title: 'Ark TV Uganda',
    source_url: 'https://stream.hydeinnovations.com/arktv-international/index.fmp4.m3u8',
    source_type: 'hls',
    category: 'culture',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 5,
    poster_url: 'https://i.imgur.com/yCHNZXD.png',
    description: 'Ark TV · Uganda Christian & Family',
    group: 'Culture',
    quality: '1080p',
  },
  // YouTube-based Uganda channels (always work)
  {
    id: 'ug-ntv-yt',
    title: 'NTV Uganda',
    source_url: 'UCTsAJZY5B9MLQMvG1lMwCOw',
    source_type: 'youtube',
    category: 'news',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 6,
    poster_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/NTV_Uganda_logo.png/320px-NTV_Uganda_logo.png',
    description: 'NTV Uganda — Live news & current affairs',
    group: 'News',
    quality: '',
  },
  {
    id: 'ug-nbs-yt',
    title: 'NBS Television',
    source_url: 'UC2rwmNnEWgeKRiM-b_z2teg',
    source_type: 'youtube',
    category: 'news',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 7,
    poster_url: 'https://yt3.googleusercontent.com/ytc/APkrFKa2BhTKCCnOgZMSzHQ3J6zOlRQ0eFP9eUL1E-8X=s176-c-k-c0x00ffffff-no-rj',
    description: 'NBS Television Uganda — Live news',
    group: 'News',
    quality: '',
  },
  {
    id: 'ug-spark-yt',
    title: 'Spark TV Uganda',
    source_url: 'UCCGpGxjCC66Qf3UBp3OkEqA',
    source_type: 'youtube',
    category: 'news',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 8,
    poster_url: 'https://yt3.googleusercontent.com/ytc/APkrFKZx6FUvFRkxXFGq8P0q0D3h5rJk7bCRSqR9=s176-c-k-c0x00ffffff-no-rj',
    description: 'Spark TV Uganda — Entertainment & news',
    group: 'News',
    quality: '',
  },
  {
    id: 'ug-galaxy-yt',
    title: 'Galaxy TV Uganda',
    source_url: 'UCq3FeSHy5M-AMIwLUQiEijw',
    source_type: 'youtube',
    category: 'entertainment',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 9,
    poster_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Galaxy_FM_logo.png/320px-Galaxy_FM_logo.png',
    description: 'Galaxy TV Uganda — Entertainment',
    group: 'Entertainment',
    quality: '',
  },
  {
    id: 'ug-bukedde-yt',
    title: 'Bukedde TV (YouTube)',
    source_url: 'UCnHQU9q_Vw-ixBHTJg-0Hkw',
    source_type: 'youtube',
    category: 'general',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 10,
    poster_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Bukedde_TV_1.png/320px-Bukedde_TV_1.png',
    description: 'Bukedde TV — Luganda news & entertainment',
    group: 'General',
    quality: '',
  },
  {
    id: 'ug-urban-yt',
    title: 'Urban TV Uganda',
    source_url: 'UC89lz8kl4E7WM3lMiOLR5bg',
    source_type: 'youtube',
    category: 'entertainment',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 11,
    poster_url: '',
    description: 'Urban TV Uganda — Music & entertainment',
    group: 'Entertainment',
    quality: '',
  },
  {
    id: 'ug-dream-yt',
    title: 'Dream TV Uganda',
    source_url: 'UC7zSHy0EFPD3SJ0FqtpELiA',
    source_type: 'youtube',
    category: 'religious',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 12,
    poster_url: 'https://i.imgur.com/XRUDhqQ.png',
    description: 'Dream TV Uganda — Christian programming',
    group: 'Religious',
    quality: '',
  },
  {
    id: 'ug-salt-yt',
    title: 'Salt TV Uganda',
    source_url: 'UCDiGPuMNBc5eDUQSCpH0JpA',
    source_type: 'youtube',
    category: 'religious',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 13,
    poster_url: 'https://i.imgur.com/AK9nE6Y.png',
    description: 'Salt TV Uganda — Christian Family TV',
    group: 'Religious',
    quality: '',
  },
  {
    id: 'ug-wbs-yt',
    title: 'WBS TV Uganda',
    source_url: 'UCMUvYCWcuJGBHCMnj8LH0AQ',
    source_type: 'youtube',
    category: 'general',
    active: true,
    country: 'Uganda',
    country_code: 'ug',
    display_order: 14,
    poster_url: '',
    description: 'WBS TV Uganda — Luganda entertainment',
    group: 'General',
    quality: '',
  },
]

// Country playlists — ordered by priority
export const IPTV_COUNTRY_PLAYLISTS: { code: string; name: string; flag: string; order: number }[] = [
  { code: 'ug', name: 'Uganda',        flag: '🇺🇬', order: 1 },
  { code: 'ke', name: 'Kenya',         flag: '🇰🇪', order: 2 },
  { code: 'tz', name: 'Tanzania',      flag: '🇹🇿', order: 3 },
  { code: 'rw', name: 'Rwanda',        flag: '🇷🇼', order: 4 },
  { code: 'ng', name: 'Nigeria',       flag: '🇳🇬', order: 5 },
  { code: 'gh', name: 'Ghana',         flag: '🇬🇭', order: 6 },
  { code: 'za', name: 'South Africa',  flag: '🇿🇦', order: 7 },
  { code: 'et', name: 'Ethiopia',      flag: '🇪🇹', order: 8 },
  { code: 'uk', name: 'UK',            flag: '🇬🇧', order: 9 },
  { code: 'us', name: 'USA',           flag: '🇺🇸', order: 10 },
  { code: 'fr', name: 'France',        flag: '🇫🇷', order: 11 },
  { code: 'de', name: 'Germany',       flag: '🇩🇪', order: 12 },
  { code: 'ae', name: 'Arab World',    flag: '🌍',  order: 13 },
  { code: 'in', name: 'India',         flag: '🇮🇳', order: 14 },
]

export const IPTV_CATEGORY_PLAYLISTS: { key: string; label: string; color: string }[] = [
  { key: 'news',          label: 'News',          color: '#ef4444' },
  { key: 'sports',        label: 'Sports',        color: '#22c55e' },
  { key: 'entertainment', label: 'Entertainment', color: '#f97316' },
  { key: 'music',         label: 'Music',         color: '#a855f7' },
  { key: 'movies',        label: 'Movies',        color: '#3b82f6' },
  { key: 'kids',          label: 'Kids',          color: '#ec4899' },
  { key: 'documentary',   label: 'Documentary',   color: '#14b8a6' },
]

const NEXONIC_BASE = 'https://shahrukhalid.github.io/nexonic-iptv/playlists'
const IPTV_ORG_BASE = 'https://iptv-org.github.io/iptv'
const IPTV_ORG_MIRRORS = [
  'https://cdn.jsdelivr.net/gh/iptv-org/iptv@gh-pages',
  'https://cdn.statically.io/gh/iptv-org/iptv/gh-pages',
]

function extractQuality(title: string): string {
  const m = title.match(/\((\d+p)\)/)
  return m ? m[1] : ''
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*\(\d+p\)/g, '')
    .replace(/\s*\[Not 24\/7\]/g, '')
    .replace(/\s*\[Geo-blocked\]/g, '')
    .replace(/\s*x-tier=\S+/g, '')
    .replace(/\s*x-status=\S+/g, '')
    .replace(/\s*x-quality=\S+/g, '')
    .trim()
}

export function parseM3U(text: string, countryName: string | null, countryCode: string | null, orderBase: number): IptvChannel[] {
  const lines = text.split('\n')
  const channels: IptvChannel[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()
    if (line.startsWith('#EXTINF')) {
      const logoMatch  = line.match(/tvg-logo="([^"]*)"/)
      const groupMatch = line.match(/group-title="([^"]*)"/)
      const titleMatch = line.match(/,(.+)$/)
      const rawTitle = titleMatch ? titleMatch[1].trim() : 'Unknown Channel'
      const logo     = logoMatch  ? logoMatch[1] : ''
      const group    = groupMatch ? groupMatch[1].split(';')[0].trim() : 'General'

      let url = ''
      let j = i + 1
      while (j < lines.length && lines[j].trim().startsWith('#')) j++
      if (j < lines.length) {
        const candidate = lines[j].trim()
        if (candidate.startsWith('http')) url = candidate
      }

      if (url) {
        const id = `iptv-${countryCode || 'intl'}-${channels.length}-${orderBase}`
        channels.push({
          id,
          title:        cleanTitle(rawTitle),
          source_url:   url,
          source_type:  'hls',
          category:     group.toLowerCase(),
          active:       true,
          country:      countryName,
          country_code: countryCode,
          display_order: orderBase + channels.length,
          poster_url:   logo || null,
          description:  `${countryName || 'International'} · ${group}`,
          group,
          quality:      extractQuality(rawTitle),
        })
        i = j + 1
        continue
      }
    }
    i++
  }
  return channels
}

const FETCH_TIMEOUT = 12000

async function fetchM3U(url: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'audio/x-mpegurl, text/plain, */*' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchCountryChannels(code: string, name: string, orderBase: number): Promise<IptvChannel[]> {
  const nexonicCode = code
  const iptvOrgCode = code === 'uk' ? 'gb' : code

  // For Uganda, start with hardcoded list immediately, then append M3U results
  const hardcoded = code === 'ug' ? UGANDA_CHANNELS_HARDCODED : []

  const urls = [
    `${NEXONIC_BASE}/countries/${nexonicCode}.m3u`,
    `${IPTV_ORG_BASE}/countries/${iptvOrgCode}.m3u`,
    ...IPTV_ORG_MIRRORS.map(m => `${m}/countries/${iptvOrgCode}.m3u`),
  ]

  for (const url of urls) {
    try {
      const text = await fetchM3U(url)
      const fetched = parseM3U(text, name, code, orderBase)
      if (fetched.length > 0) {
        // Merge: hardcoded first, then fetched (deduplicate by URL)
        const seenUrls = new Set(hardcoded.map(c => c.source_url))
        const extra = fetched.filter(c => !seenUrls.has(c.source_url))
        return [...hardcoded, ...extra]
      }
    } catch { /* try next */ }
  }

  return hardcoded.length > 0 ? hardcoded : []
}

export async function fetchCategoryChannels(key: string, orderBase: number): Promise<IptvChannel[]> {
  const urls = [
    `${IPTV_ORG_BASE}/categories/${key}.m3u`,
    `${NEXONIC_BASE}/categories/${key}.m3u`,
    ...IPTV_ORG_MIRRORS.map(m => `${m}/categories/${key}.m3u`),
  ]
  for (const url of urls) {
    try {
      const text = await fetchM3U(url)
      const channels = parseM3U(text, null, null, orderBase)
      if (channels.length > 0) return channels
    } catch { /* try next */ }
  }
  return []
}

export async function fetchAllCountryChannels(): Promise<Map<string, IptvChannel[]>> {
  const result = new Map<string, IptvChannel[]>()

  // Always put Uganda first immediately from hardcoded list
  result.set('ug', UGANDA_CHANNELS_HARDCODED)

  const BATCH = 3
  for (let i = 0; i < IPTV_COUNTRY_PLAYLISTS.length; i += BATCH) {
    const batch = IPTV_COUNTRY_PLAYLISTS.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      batch.map(c => fetchCountryChannels(c.code, c.name, c.order * 1000))
    )
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled' && r.value.length > 0) {
        result.set(batch[idx].code, r.value)
      }
    })
  }
  return result
}

// Country playlists — ordered by priority
export const IPTV_COUNTRY_PLAYLISTS: { code: string; name: string; flag: string; order: number }[] = [
  { code: 'ug', name: 'Uganda',        flag: '🇺🇬', order: 1 },
  { code: 'ke', name: 'Kenya',         flag: '🇰🇪', order: 2 },
  { code: 'tz', name: 'Tanzania',      flag: '🇹🇿', order: 3 },
  { code: 'rw', name: 'Rwanda',        flag: '🇷🇼', order: 4 },
  { code: 'ng', name: 'Nigeria',       flag: '🇳🇬', order: 5 },
  { code: 'gh', name: 'Ghana',         flag: '🇬🇭', order: 6 },
  { code: 'za', name: 'South Africa',  flag: '🇿🇦', order: 7 },
  { code: 'et', name: 'Ethiopia',      flag: '🇪🇹', order: 8 },
  { code: 'uk', name: 'UK',            flag: '🇬🇧', order: 9 },  // nexonic uses 'uk' not 'gb'
  { code: 'us', name: 'USA',           flag: '🇺🇸', order: 10 },
  { code: 'fr', name: 'France',        flag: '🇫🇷', order: 11 },
  { code: 'de', name: 'Germany',       flag: '🇩🇪', order: 12 },
  { code: 'ae', name: 'Arab World',    flag: '🌍',  order: 13 },
  { code: 'in', name: 'India',         flag: '🇮🇳', order: 14 },
]

// Category playlists for extra global content
export const IPTV_CATEGORY_PLAYLISTS: { key: string; label: string; color: string }[] = [
  { key: 'news',          label: 'News',          color: '#ef4444' },
  { key: 'sports',        label: 'Sports',        color: '#22c55e' },
  { key: 'entertainment', label: 'Entertainment', color: '#f97316' },
  { key: 'music',         label: 'Music',         color: '#a855f7' },
  { key: 'movies',        label: 'Movies',        color: '#3b82f6' },
  { key: 'kids',          label: 'Kids',          color: '#ec4899' },
  { key: 'documentary',   label: 'Documentary',   color: '#14b8a6' },
]

// ── Nexonic IPTV — primary source (verified, 4325 working channels) ──
const NEXONIC_BASE = 'https://shahrukhalid.github.io/nexonic-iptv/playlists'

// ── iptv-org — fallback source ──
const IPTV_ORG_BASE = 'https://iptv-org.github.io/iptv'

// CDN mirrors for iptv-org as extra fallback
const IPTV_ORG_MIRRORS = [
  'https://cdn.jsdelivr.net/gh/iptv-org/iptv@gh-pages',
  'https://cdn.statically.io/gh/iptv-org/iptv/gh-pages',
]

/** Extract quality label from title e.g. "(720p)" → "720p" */
function extractQuality(title: string): string {
  const m = title.match(/\((\d+p)\)/)
  return m ? m[1] : ''
}

/** Sanitise title */
function cleanTitle(title: string): string {
  return title
    .replace(/\s*\(\d+p\)/g, '')
    .replace(/\s*\[Not 24\/7\]/g, '')
    .replace(/\s*\[Geo-blocked\]/g, '')
    .replace(/\s*x-tier=\S+/g, '')
    .trim()
}

/** Parse raw M3U text → array of IptvChannel */
export function parseM3U(text: string, countryName: string | null, countryCode: string | null, orderBase: number): IptvChannel[] {
  const lines = text.split('\n')
  const channels: IptvChannel[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()
    if (line.startsWith('#EXTINF')) {
      const logoMatch  = line.match(/tvg-logo="([^"]*)"/)
      const groupMatch = line.match(/group-title="([^"]*)"/)
      const titleMatch = line.match(/,(.+)$/)

      const rawTitle = titleMatch ? titleMatch[1].trim() : 'Unknown Channel'
      const logo     = logoMatch  ? logoMatch[1] : ''
      const group    = groupMatch ? groupMatch[1].split(';')[0].trim() : 'General'

      let url = ''
      let j = i + 1
      while (j < lines.length && lines[j].trim().startsWith('#')) j++
      if (j < lines.length) {
        const candidate = lines[j].trim()
        if (candidate.startsWith('http')) url = candidate
      }

      if (url) {
        const id = `iptv-${countryCode || 'intl'}-${channels.length}-${orderBase}`
        channels.push({
          id,
          title:        cleanTitle(rawTitle),
          source_url:   url,
          source_type:  'hls',
          category:     group.toLowerCase(),
          active:       true,
          country:      countryName,
          country_code: countryCode,
          display_order: orderBase + channels.length,
          poster_url:   logo || null,
          description:  `${countryName || 'International'} · ${group}`,
          group,
          quality:      extractQuality(rawTitle),
        })
        i = j + 1
        continue
      }
    }
    i++
  }

  return channels
}

const FETCH_TIMEOUT = 12000

async function fetchM3U(url: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'audio/x-mpegurl, text/plain, */*' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

/** Fetch country channels — tries Nexonic first, falls back to iptv-org + CDN mirrors */
export async function fetchCountryChannels(code: string, name: string, orderBase: number): Promise<IptvChannel[]> {
  // Nexonic uses 'uk' for UK, iptv-org uses 'gb'
  const nexonicCode = code
  const iptvOrgCode = code === 'uk' ? 'gb' : code

  const urls = [
    `${NEXONIC_BASE}/countries/${nexonicCode}.m3u`,
    `${IPTV_ORG_BASE}/countries/${iptvOrgCode}.m3u`,
    ...IPTV_ORG_MIRRORS.map(m => `${m}/countries/${iptvOrgCode}.m3u`),
  ]

  for (const url of urls) {
    try {
      const text = await fetchM3U(url)
      const channels = parseM3U(text, name, code, orderBase)
      if (channels.length > 0) return channels
    } catch { /* try next */ }
  }
  return []
}

/** Fetch category channels — tries iptv-org, then CDN mirrors */
export async function fetchCategoryChannels(key: string, orderBase: number): Promise<IptvChannel[]> {
  const urls = [
    `${IPTV_ORG_BASE}/categories/${key}.m3u`,
    `${NEXONIC_BASE}/categories/${key}.m3u`,
    ...IPTV_ORG_MIRRORS.map(m => `${m}/categories/${key}.m3u`),
  ]

  for (const url of urls) {
    try {
      const text = await fetchM3U(url)
      const channels = parseM3U(text, null, null, orderBase)
      if (channels.length > 0) return channels
    } catch { /* try next */ }
  }
  return []
}

/** Load all country playlists in batches */
export async function fetchAllCountryChannels(): Promise<Map<string, IptvChannel[]>> {
  const result = new Map<string, IptvChannel[]>()
  const BATCH = 3
  for (let i = 0; i < IPTV_COUNTRY_PLAYLISTS.length; i += BATCH) {
    const batch = IPTV_COUNTRY_PLAYLISTS.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      batch.map(c => fetchCountryChannels(c.code, c.name, c.order * 1000))
    )
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled' && r.value.length > 0) {
        result.set(batch[idx].code, r.value)
      }
    })
  }
  return result
}
