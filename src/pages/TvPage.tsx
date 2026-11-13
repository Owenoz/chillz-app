import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Television, Play, MagnifyingGlass, X,
  ArrowClockwise, SpinnerGap, Warning,
} from '@phosphor-icons/react'
import {
  fetchAllCountryChannels,
  fetchCategoryChannels,
  IPTV_COUNTRY_PLAYLISTS,
  IPTV_CATEGORY_PLAYLISTS,
  type IptvChannel,
} from '../lib/iptvApi'

// ── Persist channels in sessionStorage so we don't refetch on nav ──
const SESSION_KEY = 'chillz_iptv_channels_v3'
const SESSION_META_KEY = 'chillz_iptv_meta_v3'

interface ChannelState {
  byCountry: Record<string, IptvChannel[]>
  byCategory: Record<string, IptvChannel[]>
}

function saveToSession(state: ChannelState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state))
    sessionStorage.setItem(SESSION_META_KEY, Date.now().toString())
  } catch { /* storage full */ }
}

function loadFromSession(): ChannelState | null {
  try {
    const meta = sessionStorage.getItem(SESSION_META_KEY)
    if (!meta) return null
    // 15-minute cache
    if (Date.now() - Number(meta) > 15 * 60 * 1000) return null
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ChannelState
  } catch {
    return null
  }
}

// Country display info lookup
const COUNTRY_INFO = Object.fromEntries(
  IPTV_COUNTRY_PLAYLISTS.map(c => [c.code, c])
)

// Which tabs to show in filter bar
const NAV_TABS = [
  { key: 'all',   label: 'All' },
  { key: 'ug',    label: '🇺🇬 Uganda' },
  { key: 'ke',    label: '🇰🇪 Kenya' },
  { key: 'tz',    label: '🇹🇿 Tanzania' },
  { key: 'ng',    label: '🇳🇬 Nigeria' },
  { key: 'gh',    label: '🇬🇭 Ghana' },
  { key: 'za',    label: '🇿🇦 South Africa' },
  { key: 'gb',    label: '🇬🇧 UK' },
  { key: 'us',    label: '🇺🇸 USA' },
  { key: 'intl',  label: '🌍 International' },
  { key: 'cat',   label: '📂 By Category' },
]

type LoadPhase = 'idle' | 'loading' | 'done' | 'error'

export default function TvPage() {
  const navigate = useNavigate()
  const [search, setSearch]           = useState('')
  const [activeTab, setActiveTab]     = useState('all')
  const [phase, setPhase]             = useState<LoadPhase>('idle')
  const [byCountry, setByCountry]     = useState<Record<string, IptvChannel[]>>({})
  const [byCategory, setByCategory]   = useState<Record<string, IptvChannel[]>>({})
  const [catProgress, setCatProgress] = useState(0)

  // Load channels
  const load = useCallback(async (force = false) => {
    if (!force) {
      const cached = loadFromSession()
      if (cached) {
        setByCountry(cached.byCountry)
        setByCategory(cached.byCategory)
        setPhase('done')
        return
      }
    }
    setPhase('loading')
    try {
      // Load countries in background, streaming results in
      const countryMap = await fetchAllCountryChannels()
      const bc: Record<string, IptvChannel[]> = {}
      countryMap.forEach((chs, code) => { bc[code] = chs })
      setByCountry(bc)
      setPhase('done')

      // Then load category channels for the "By Category" tab
      const bcat: Record<string, IptvChannel[]> = {}
      for (let i = 0; i < IPTV_CATEGORY_PLAYLISTS.length; i++) {
        const cat = IPTV_CATEGORY_PLAYLISTS[i]
        const chs = await fetchCategoryChannels(cat.key, 50000 + i * 1000)
        bcat[cat.key] = chs
        setCatProgress(i + 1)
        setByCategory({ ...bcat })
      }
      saveToSession({ byCountry: bc, byCategory: bcat })
    } catch {
      setPhase('error')
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Flatten all channels for search + "All" tab
  const allChannels = useMemo(() => {
    const seen = new Set<string>()
    const all: IptvChannel[] = []
    Object.values(byCountry).forEach(chs => {
      chs.forEach(ch => {
        if (!seen.has(ch.source_url)) { seen.add(ch.source_url); all.push(ch) }
      })
    })
    return all
  }, [byCountry])

  const totalCount = allChannels.length

  // Build display channels based on tab
  const displayChannels = useMemo(() => {
    const q = search.toLowerCase().trim()

    if (q) {
      // Search across everything
      const pool = [...allChannels, ...Object.values(byCategory).flat()]
      const seen = new Set<string>()
      return pool.filter(ch => {
        if (seen.has(ch.source_url)) return false
        const hit = ch.title.toLowerCase().includes(q) ||
                    (ch.country || '').toLowerCase().includes(q) ||
                    ch.group.toLowerCase().includes(q)
        if (hit) seen.add(ch.source_url)
        return hit
      })
    }

    if (activeTab === 'all') return allChannels
    if (activeTab === 'intl') {
      // channels not from our specific country list
      const countryCodes = new Set(IPTV_COUNTRY_PLAYLISTS.map(c => c.code))
      return allChannels.filter(ch => !ch.country_code || !countryCodes.has(ch.country_code))
    }
    if (activeTab === 'cat') return Object.values(byCategory).flat()

    // Country code tab
    return byCountry[activeTab] || []
  }, [search, activeTab, allChannels, byCountry, byCategory])

  // Group by country for the "All" home view
  const countryGroups = useMemo(() => {
    return IPTV_COUNTRY_PLAYLISTS
      .filter(c => byCountry[c.code]?.length > 0)
      .map(c => ({ ...c, channels: byCountry[c.code] || [] }))
  }, [byCountry])

  // Group by category for the "By Category" view
  const categoryGroups = useMemo(() => {
    return IPTV_CATEGORY_PLAYLISTS
      .filter(c => byCategory[c.key]?.length > 0)
      .map(c => ({ ...c, channels: byCategory[c.key] || [] }))
  }, [byCategory])

  const isFiltering = !!search || (activeTab !== 'all')

  return (
    <div className="pb-6 min-h-screen bg-mesh">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(124,58,237,0.15) 0%, transparent 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full blur-[60px] opacity-20"
            style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-5 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow-sm"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}>
                <Television weight="fill" size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  {phase === 'loading' ? (
                    <span className="flex items-center gap-2">
                      Loading <SpinnerGap weight="bold" className="animate-spin text-primary-light" size={22}/>
                    </span>
                  ) : (
                    <>{totalCount.toLocaleString()}<span className="text-primary-light">+</span></>
                  )}
                </h1>
                <p className="text-sm text-muted font-medium">
                  Live Channels · Powered by IPTV-org
                  {phase === 'done' && <span className="ml-2 text-emerald-400 text-[10px] font-bold">● Live</span>}
                </p>
              </div>
            </div>
            <button onClick={() => load(true)} title="Refresh channels"
              className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-muted hover:text-white transition-all">
              <ArrowClockwise weight="bold" size={16} className={phase === 'loading' ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Country/category tab pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {NAV_TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap"
                style={{
                  background: activeTab === tab.key ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'rgba(45,38,69,0.5)',
                  border: `1px solid ${activeTab === tab.key ? 'rgba(124,58,237,0.5)' : 'rgba(45,38,69,0.8)'}`,
                  color: activeTab === tab.key ? '#fff' : '#7C7A91',
                  boxShadow: activeTab === tab.key ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
                }}>
                {tab.label}
                {tab.key !== 'all' && tab.key !== 'intl' && tab.key !== 'cat' && byCountry[tab.key]?.length > 0 && (
                  <span className="ml-1.5 text-[9px] opacity-70">{byCountry[tab.key].length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 space-y-8">

        {/* Search */}
        <div className="relative">
          <MagnifyingGlass weight="bold" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input type="text" placeholder="Search channels, countries, categories…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-muted focus:outline-none transition-all"
            style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.8)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors">
              <X weight="bold" size={14} />
            </button>
          )}
        </div>

        {/* Loading state */}
        {phase === 'loading' && allChannels.length === 0 && (
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i}>
                <div className="h-5 w-48 rounded-xl skeleton mb-4"/>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {Array.from({length:6}).map((_,j) => (
                    <div key={j} className="rounded-2xl overflow-hidden border border-border animate-pulse">
                      <div className="aspect-video bg-surface-2"/>
                      <div className="p-2 space-y-1">
                        <div className="h-2 skeleton rounded w-3/4"/>
                        <div className="h-2 skeleton rounded w-1/2"/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {phase === 'error' && (
          <div className="rounded-2xl p-8 text-center border border-border bg-surface space-y-3">
            <Warning weight="duotone" size={36} className="text-amber-400 mx-auto" />
            <p className="font-bold text-white">Couldn't load live channels</p>
            <p className="text-sm text-muted">Check your connection and try refreshing.</p>
            <button onClick={() => load(true)}
              className="btn-primary px-5 py-2 rounded-xl text-sm font-bold text-white">
              ↺ Retry
            </button>
          </div>
        )}

        {/* Search results */}
        {search && (
          <div>
            <p className="text-xs text-muted mb-4">
              <span className="text-white font-bold">{displayChannels.length}</span> results for "{search}"
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {displayChannels.map(ch => (
                <ChannelCard key={ch.id} channel={ch} onClick={() => navigate(`/tv/watch/${encodeURIComponent(ch.id)}`, { state: ch })} />
              ))}
              {displayChannels.length === 0 && phase !== 'loading' && (
                <p className="col-span-full text-center text-muted py-8">No channels found for "{search}"</p>
              )}
            </div>
          </div>
        )}

        {/* Filtered by country tab */}
        {!search && isFiltering && activeTab !== 'all' && activeTab !== 'cat' && (
          <div>
            {byCountry[activeTab] ? (
              <>
                <p className="text-xs text-muted mb-4">
                  <span className="text-white font-bold">{displayChannels.length}</span> channels
                  {COUNTRY_INFO[activeTab] && ` · ${COUNTRY_INFO[activeTab].name}`}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {displayChannels.map(ch => (
                    <ChannelCard key={ch.id} channel={ch} onClick={() => navigate(`/tv/watch/${encodeURIComponent(ch.id)}`, { state: ch })} />
                  ))}
                </div>
              </>
            ) : phase === 'loading' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {Array.from({length:12}).map((_,i) => <ChannelSkeleton key={i}/>)}
              </div>
            ) : (
              <p className="text-center text-muted py-8">No channels found for this region</p>
            )}
          </div>
        )}

        {/* By Category tab */}
        {!search && activeTab === 'cat' && (
          <div className="space-y-8">
            {catProgress < IPTV_CATEGORY_PLAYLISTS.length && (
              <div className="flex items-center gap-3 text-sm text-muted">
                <SpinnerGap weight="bold" size={16} className="animate-spin text-primary-light shrink-0"/>
                Loading categories… ({catProgress}/{IPTV_CATEGORY_PLAYLISTS.length})
              </div>
            )}
            {categoryGroups.map(cat => (
              <section key={cat.key}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[15px] font-black text-white flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full" style={{background: cat.color}}/>
                    {cat.label}
                    <span className="text-sm font-semibold text-muted">({cat.channels.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {cat.channels.slice(0, 12).map(ch => (
                    <ChannelCard key={ch.id} channel={ch} onClick={() => navigate(`/tv/watch/${encodeURIComponent(ch.id)}`, { state: ch })} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Default "All" home view — grouped by country */}
        {!search && activeTab === 'all' && phase !== 'error' && (
          <div className="space-y-10">
            {countryGroups.map(group => (
              <section key={group.code}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-white">
                    {group.flag} {group.name}
                    <span className="ml-2 text-sm font-semibold text-muted">({group.channels.length})</span>
                  </h2>
                  <button
                    onClick={() => setActiveTab(group.code)}
                    className="text-xs font-semibold text-primary-light hover:text-white transition-colors">
                    See all →
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {group.channels.slice(0, 12).map(ch => (
                    <ChannelCard
                      key={ch.id}
                      channel={ch}
                      onClick={() => navigate(`/tv/watch/${encodeURIComponent(ch.id)}`, { state: ch })}
                    />
                  ))}
                </div>
              </section>
            ))}

            {/* Show all channels at bottom */}
            {allChannels.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-white">
                    All Channels
                    <span className="ml-2 text-sm font-semibold text-muted">({allChannels.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {allChannels.slice(0, 24).map(ch => (
                    <ChannelCard
                      key={ch.id}
                      channel={ch}
                      onClick={() => navigate(`/tv/watch/${encodeURIComponent(ch.id)}`, { state: ch })}
                    />
                  ))}
                </div>
                {allChannels.length > 24 && (
                  <p className="text-center text-xs text-muted mt-4">
                    Use the country tabs or search to explore all {allChannels.length.toLocaleString()} channels
                  </p>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ChannelCard({ channel, onClick }: { channel: IptvChannel; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <button onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface hover:border-primary/40 transition-all hover:-translate-y-0.5 text-left"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
      <div className="aspect-video relative overflow-hidden">
        {channel.poster_url && !imgErr ? (
          <img src={channel.poster_url} alt={channel.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
            onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-2">
            <Television weight="duotone" size={22} className="text-primary-light opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary shadow-glow-sm flex items-center justify-center">
            <Play weight="fill" size={12} className="text-white translate-x-0.5" />
          </div>
        </div>
        <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
          <span className="w-1 h-1 bg-white rounded-full live-dot" /> LIVE
        </div>
        {channel.quality && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[7px] font-bold px-1 py-0.5 rounded">
            {channel.quality}
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-[10px] font-bold text-white truncate">{channel.title}</p>
        {channel.country && <p className="text-[9px] text-muted mt-0.5 truncate">{channel.country}</p>}
      </div>
    </button>
  )
}

function ChannelSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border animate-pulse">
      <div className="aspect-video bg-surface-2"/>
      <div className="p-2 space-y-1">
        <div className="h-2 skeleton rounded w-3/4"/>
        <div className="h-2 skeleton rounded w-1/2"/>
      </div>
    </div>
  )
}
