// ── IPTV Channel Fetcher ───────────────────────────────────────
// Primary: Nexonic IPTV (https://github.com/Shahrukhalid/nexonic-iptv)
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

// ── 35 Uganda channels from InfinityX database — always available ──
export const UGANDA_CHANNELS_HARDCODED: IptvChannel[] = [
  // HLS streams (verified 200 OK with browser headers)
  { id:'ug-bukedde1',   title:'Bukedde TV 1',          source_url:'https://stream.hydeinnovations.com/bukedde1flussonic/index.m3u8',           source_type:'hls',     category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:1,  poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791489780023-zdf6z6.png', description:'Bukedde TV 1 — Luganda news & entertainment', group:'General',       quality:'1080p' },
  { id:'ug-bukedde2',   title:'Bukedde TV 2',          source_url:'https://stream.hydeinnovations.com/bukedde2flussonic/index.m3u8',           source_type:'hls',     category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:2,  poster_url:'https://i.imgur.com/ukwPZeY.png',                             description:'Bukedde TV 2 · Uganda',                      group:'General',       quality:'1080p' },
  { id:'ug-tvwest',     title:'TV West Uganda',        source_url:'https://stream.hydeinnovations.com/tvwest-flussonic/index.m3u8',            source_type:'hls',     category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:3,  poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791373456933-7p83pg.jpg', description:'Western Uganda regional entertainment & news',group:'General',       quality:'720p'  },
  { id:'ug-wanluo',     title:'Wan Luo TV',            source_url:'https://stream.hydeinnovations.com/luotv-flussonic/index.m3u8',            source_type:'hls',     category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:4,  poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791374327525-4nxr5c.jpg', description:'Wan Luo TV · Vision Group Uganda',           group:'General',       quality:'720p'  },
  { id:'ug-arktv',      title:'Ark TV Uganda',         source_url:'https://stream.hydeinnovations.com/arktv-international/index.fmp4.m3u8',   source_type:'hls',     category:'culture',      active:true, country:'Uganda', country_code:'ug', display_order:5,  poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791489862656-71y081.jpg', description:'Ark TV Uganda — Christian & Family',         group:'Culture',       quality:'1080p' },
  { id:'ug-bbstv',      title:'BBS TV Uganda',         source_url:'https://bbstv.ug/hls/ch01/index.m3u8',                                    source_type:'hls',     category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:6,  poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791373520937-p0euev.png', description:'BBS TV — Buganda Kingdom news & culture',    group:'General',       quality:''      },
  { id:'ug-tayari',     title:'Tayari West TV',        source_url:'https://stream.hydeinnovations.com/tarari-west/index.m3u8',                source_type:'hls',     category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:7,  poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791374374320-u6cj08.jpg', description:'Tayari West TV — Uganda regional news',      group:'General',       quality:'1080p' },
  { id:'ug-galaxy',     title:'Galaxy TV Uganda',      source_url:'https://livestream.galaxytv.ug/jikonkone/playlist.m3u8',                  source_type:'hls',     category:'entertainment',active:true, country:'Uganda', country_code:'ug', display_order:8,  poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791488030531-h499k8.png', description:'Galaxy TV Uganda — Entertainment & music',   group:'Entertainment', quality:''      },
  { id:'ug-kstv',       title:'KSTV Uganda',           source_url:'https://live.esteem.africa/live/kstv-uganda-a3023c.m3u8',                 source_type:'hls',     category:'entertainment',active:true, country:'Uganda', country_code:'ug', display_order:9,  poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791373757296-wmr1cp.jpg', description:'KSTV Uganda — local music & lifestyle',      group:'Entertainment', quality:''      },
  { id:'ug-krctv',      title:'KRC TV Uganda',         source_url:'https://channels.ad-ug.com/live/ch03/index.m3u8',                         source_type:'hls',     category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:10, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791484881476-lnmkl1.jpg', description:'KRC TV — Fort Portal & Western Uganda',      group:'General',       quality:''      },
  { id:'ug-kbstv',      title:'KBS TV Uganda',         source_url:'https://www.kbstv.co.ug/live/abr/master.m3u8',                           source_type:'hls',     category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:11, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791488211153-uwgrfr.jpg', description:'KBS TV Uganda',                              group:'General',       quality:''      },
  { id:'ug-forttv',     title:'FORT TV Uganda',        source_url:'https://fort.co-works.org/memfs/87017643-274a-4bc0-a786-7767a0d159c2.m3u8',source_type:'hls',    category:'entertainment',active:true, country:'Uganda', country_code:'ug', display_order:12, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791484928441-kawo0f.jpg', description:'FORT TV — Ugandan entertainment & music',    group:'Entertainment', quality:''      },
  { id:'ug-eternal',    title:'Eternal TV Uganda',     source_url:'https://live-tv.mfc-streaming-service.online/hls/orion_west.m3u8',        source_type:'hls',     category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:13, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791488684966-j6dmap.jpg', description:'Eternal TV Uganda',                          group:'General',       quality:''      },
  // Iframe/embed channels from InfinityX database
  { id:'ug-nbstv',      title:'NBS TV Uganda',         source_url:'https://ams-2629.antmedia.cloud/LiveApp/play.html?id=nbslive',            source_type:'hls',     category:'news',         active:true, country:'Uganda', country_code:'ug', display_order:14, poster_url:null,                                                           description:'NBS Television Uganda — Live news',          group:'News',          quality:''      },
  { id:'ug-ntv',        title:'NTV Uganda',            source_url:'https://ams-2629.antmedia.cloud/LiveApp/play.html?id=abul2026',           source_type:'hls',     category:'news',         active:true, country:'Uganda', country_code:'ug', display_order:15, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791373671604-jpa62n.jpg', description:'NTV Uganda — Live news & current affairs',   group:'News',          quality:''      },
  { id:'ug-worship',    title:'Worship TV Uganda',     source_url:'https://player.castr.com/live_10717b107e7511ee8142e75972f047a8',          source_type:'hls',     category:'religious',    active:true, country:'Uganda', country_code:'ug', display_order:16, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791488266246-63m24d.jpg', description:'Worship TV Uganda',                          group:'Religious',     quality:''      },
  // YouTube channels (always work — iframe embed)
  { id:'ug-manifest',   title:'Manifest Television',   source_url:'UCwx0ZOefsRbbVrY6nE75Hcg',                                               source_type:'youtube', category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:17, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791489312767-lo0emp.jpg', description:'Manifest Television Uganda',                 group:'General',       quality:''      },
  { id:'ug-ubc',        title:'UBC TV Uganda',         source_url:'https://www.youtube.com/embed/4aTdFNgEFWM',                              source_type:'youtube', category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:18, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791484783473-ef3ehg.png', description:'Uganda national public broadcaster',         group:'General',       quality:''      },
  { id:'ug-salam',      title:'Salam TV Uganda',       source_url:'https://www.youtube.com/embed/oArLFcMTzUw',                              source_type:'youtube', category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:19, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791488958261-mfeqm7.jpg', description:'Salam TV Uganda',                            group:'General',       quality:''      },
  { id:'ug-stv',        title:'STV Uganda',            source_url:'https://www.youtube.com/embed/B2HMHitQ8lk',                              source_type:'youtube', category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:20, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791489009964-27ia7m.jpg', description:'STV Uganda',                                 group:'General',       quality:''      },
  { id:'ug-nyce',       title:'Nyce TV Uganda',        source_url:'https://www.youtube.com/embed/8qkru6sLSHk',                              source_type:'youtube', category:'entertainment',active:true, country:'Uganda', country_code:'ug', display_order:21, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791488866504-edyz5c.jpg', description:'Nyce TV Uganda',                             group:'Entertainment', quality:''      },
  { id:'ug-success',    title:'Success TV Uganda',     source_url:'https://www.youtube.com/embed/nPfGlO1XMOY',                              source_type:'youtube', category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:22, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791488390086-doofh4.jpg', description:'Success TV Uganda',                          group:'General',       quality:''      },
  { id:'ug-tbs',        title:'TBS TV Uganda',         source_url:'https://www.youtube.com/embed/-KDlKPbrRB4',                              source_type:'youtube', category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:23, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791489440938-k9n0do.jpg', description:'TBS TV Uganda',                              group:'General',       quality:''      },
  { id:'ug-tagy',       title:'Tagy TV Uganda',        source_url:'https://www.youtube.com/embed/4mS7hYsbWvg',                              source_type:'youtube', category:'entertainment',active:true, country:'Uganda', country_code:'ug', display_order:24, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791489607111-unneby.jpg', description:'Tagy TV Uganda',                             group:'Entertainment', quality:''      },
  { id:'ug-gtv',        title:'GTV Uganda',            source_url:'https://www.youtube.com/embed/RCkFaESK9Y8',                              source_type:'youtube', category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:25, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791488798278-zkyru8.jpg', description:'GTV Uganda',                                 group:'General',       quality:''      },
  { id:'ug-family',     title:'Family TV Uganda',      source_url:'https://www.youtube.com/embed/live_stream?channel=UCRINpnVBPP0uplwL4anllLA', source_type:'youtube', category:'general', active:true, country:'Uganda', country_code:'ug', display_order:26, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791489250429-r72czp.jpg', description:'Family TV Uganda',                           group:'General',       quality:''      },
  { id:'ug-inspire',    title:'Inspire TV Uganda',     source_url:'https://www.youtube.com/embed/live_stream?channel=UCQj72wL868aR2xF-JS0HevA', source_type:'youtube', category:'general', active:true, country:'Uganda', country_code:'ug', display_order:27, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791489672734-rzwn72.jpg', description:'Inspire TV Uganda',                          group:'General',       quality:''      },
  { id:'ug-bunyoro',    title:'Bunyoro TV Uganda',     source_url:'https://www.youtube.com/embed/live_stream?channel=UCbK_zjmaCeY-vqDZwYtpfvA', source_type:'youtube', category:'general', active:true, country:'Uganda', country_code:'ug', display_order:28, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791489385742-6u4k96.jpg', description:'Bunyoro TV Uganda',                          group:'General',       quality:''      },
  { id:'ug-salt',       title:'Salt TV Uganda',        source_url:'https://www.youtube.com/embed/_DQTp6ho1-Q',                              source_type:'youtube', category:'religious',    active:true, country:'Uganda', country_code:'ug', display_order:29, poster_url:'https://ruljvifbvhpdaifkjxtj.supabase.co/storage/v1/object/public/tournament-assets/stream-posters/1791484838841-2wuwqj.png', description:'Salt TV — Ugandan Christian & family TV',    group:'Religious',     quality:''      },
  { id:'ug-ntv-yt',     title:'NTV Uganda (Live)',     source_url:'UCTsAJZY5B9MLQMvG1lMwCOw',                                               source_type:'youtube', category:'news',         active:true, country:'Uganda', country_code:'ug', display_order:30, poster_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/NTV_Uganda_logo.png/320px-NTV_Uganda_logo.png', description:'NTV Uganda — Live news', group:'News', quality:'' },
  { id:'ug-nbs-yt',     title:'NBS Television (Live)', source_url:'UC2rwmNnEWgeKRiM-b_z2teg',                                               source_type:'youtube', category:'news',         active:true, country:'Uganda', country_code:'ug', display_order:31, poster_url:null,                                                           description:'NBS Television Uganda', group:'News', quality:'' },
  { id:'ug-spark-yt',   title:'Spark TV Uganda',       source_url:'UCCGpGxjCC66Qf3UBp3OkEqA',                                               source_type:'youtube', category:'news',         active:true, country:'Uganda', country_code:'ug', display_order:32, poster_url:null,                                                           description:'Spark TV Uganda', group:'News', quality:'' },
  { id:'ug-urban-yt',   title:'Urban TV Uganda',       source_url:'UC89lz8kl4E7WM3lMiOLR5bg',                                               source_type:'youtube', category:'entertainment',active:true, country:'Uganda', country_code:'ug', display_order:33, poster_url:null,                                                           description:'Urban TV Uganda — Music & entertainment', group:'Entertainment', quality:'' },
  { id:'ug-wbs-yt',     title:'WBS TV Uganda',         source_url:'UCMUvYCWcuJGBHCMnj8LH0AQ',                                               source_type:'youtube', category:'general',      active:true, country:'Uganda', country_code:'ug', display_order:34, poster_url:null,                                                           description:'WBS TV Uganda — Luganda entertainment', group:'General', quality:'' },
  { id:'ug-dream-yt',   title:'Dream TV Uganda',       source_url:'UC7zSHy0EFPD3SJ0FqtpELiA',                                               source_type:'youtube', category:'religious',    active:true, country:'Uganda', country_code:'ug', display_order:35, poster_url:'https://i.imgur.com/XRUDhqQ.png',                             description:'Dream TV Uganda — Christian programming', group:'Religious', quality:'' },
]

// Country playlists — ordered by priority
export const IPTV_COUNTRY_PLAYLISTS: { code: string; name: string; flag: string; order: number }[] = [
  { code: 'ug', name: 'Uganda',       flag: '🇺🇬', order: 1  },
  { code: 'ke', name: 'Kenya',        flag: '🇰🇪', order: 2  },
  { code: 'tz', name: 'Tanzania',     flag: '🇹🇿', order: 3  },
  { code: 'rw', name: 'Rwanda',       flag: '🇷🇼', order: 4  },
  { code: 'ng', name: 'Nigeria',      flag: '🇳🇬', order: 5  },
  { code: 'gh', name: 'Ghana',        flag: '🇬🇭', order: 6  },
  { code: 'za', name: 'South Africa', flag: '🇿🇦', order: 7  },
  { code: 'et', name: 'Ethiopia',     flag: '🇪🇹', order: 8  },
  { code: 'uk', name: 'UK',           flag: '🇬🇧', order: 9  }, // nexonic uses 'uk'
  { code: 'us', name: 'USA',          flag: '🇺🇸', order: 10 },
  { code: 'fr', name: 'France',       flag: '🇫🇷', order: 11 },
  { code: 'de', name: 'Germany',      flag: '🇩🇪', order: 12 },
  { code: 'ae', name: 'Arab World',   flag: '🌍',  order: 13 },
  { code: 'in', name: 'India',        flag: '🇮🇳', order: 14 },
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

const NEXONIC_BASE    = 'https://shahrukhalid.github.io/nexonic-iptv/playlists'
const IPTV_ORG_BASE   = 'https://iptv-org.github.io/iptv'
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
        channels.push({
          id:           `iptv-${countryCode || 'intl'}-${channels.length}-${orderBase}`,
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
  const hardcoded   = code === 'ug' ? UGANDA_CHANNELS_HARDCODED : []

  const urls = [
    `${NEXONIC_BASE}/countries/${nexonicCode}.m3u`,
    `${IPTV_ORG_BASE}/countries/${iptvOrgCode}.m3u`,
    ...IPTV_ORG_MIRRORS.map(m => `${m}/countries/${iptvOrgCode}.m3u`),
  ]

  for (const url of urls) {
    try {
      const text    = await fetchM3U(url)
      const fetched = parseM3U(text, name, code, orderBase)
      if (fetched.length > 0) {
        // Hardcoded first, then M3U results (deduplicate by URL)
        const seenUrls = new Set(hardcoded.map(c => c.source_url))
        const extra    = fetched.filter(c => !seenUrls.has(c.source_url))
        return [...hardcoded, ...extra]
      }
    } catch { /* try next mirror */ }
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
      const text     = await fetchM3U(url)
      const channels = parseM3U(text, null, null, orderBase)
      if (channels.length > 0) return channels
    } catch { /* try next */ }
  }
  return []
}

export async function fetchAllCountryChannels(): Promise<Map<string, IptvChannel[]>> {
  const result = new Map<string, IptvChannel[]>()

  // Uganda always available immediately — don't wait for M3U
  result.set('ug', UGANDA_CHANNELS_HARDCODED)

  const BATCH = 3
  for (let i = 0; i < IPTV_COUNTRY_PLAYLISTS.length; i += BATCH) {
    const batch   = IPTV_COUNTRY_PLAYLISTS.slice(i, i + BATCH)
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
