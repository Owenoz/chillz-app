import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Radio, ArrowLeft, ArrowClockwise, MusicNote,
  Broadcast, MagnifyingGlass, X, SpinnerGap,
  Warning, Headphones, Globe,
} from '@phosphor-icons/react'
import {
  fetchStationsByCountry, fetchTopStations, searchStations,
  recordStationClick, RADIO_COUNTRY_GROUPS,
  type RadioStation,
} from '../lib/radioBrowserApi'

// ── Session cache ──────────────────────────────────────────────
const CACHE_KEY = 'chillz_radio_v2'
const CACHE_META = 'chillz_radio_meta_v2'

function saveCache(data: Record<string, RadioStation[]>) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); sessionStorage.setItem(CACHE_META, Date.now().toString()) } catch { /* ignore */ }
}
function loadCache(): Record<string, RadioStation[]> | null {
  try {
    const meta = sessionStorage.getItem(CACHE_META)
    if (!meta || Date.now() - Number(meta) > 20 * 60 * 1000) return null
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

type LoadPhase = 'idle' | 'loading' | 'done' | 'error'

export default function RadioPage() {
  const [active, setActive]           = useState<RadioStation | null>(null)
  const [playing, setPlaying]         = useState(false)
  const [loadPhase, setLoadPhase]     = useState<LoadPhase>('idle')
  const [byCountry, setByCountry]     = useState<Record<string, RadioStation[]>>({})
  const [activeTab, setActiveTab]     = useState('Uganda')
  const [search, setSearch]           = useState('')
  const [searchResults, setSearchResults] = useState<RadioStation[]>([])
  const [searching, setSearching]     = useState(false)
  const [audioErr, setAudioErr]       = useState(false)
  const audioRef  = useRef<HTMLAudioElement | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  const load = useCallback(async (force = false) => {
    if (!force) {
      const cached = loadCache()
      if (cached) { setByCountry(cached); setLoadPhase('done'); return }
    }
    setLoadPhase('loading')
    try {
      const result: Record<string, RadioStation[]> = {}
      // Fetch priority countries first
      for (let i = 0; i < RADIO_COUNTRY_GROUPS.length; i++) {
        const grp = RADIO_COUNTRY_GROUPS[i]
        const stations = await fetchStationsByCountry(grp.key, 60)
        if (stations.length > 0) result[grp.key] = stations
        setByCountry({ ...result })
      }
      // Also add Global top
      const top = await fetchTopStations(60)
      result['Global'] = top
      setByCountry({ ...result })
      saveCache(result)
      setLoadPhase('done')
    } catch {
      setLoadPhase('error')
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Search debounce
  useEffect(() => {
    clearTimeout(searchTimer.current)
    if (!search.trim()) { setSearchResults([]); return }
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      const res = await searchStations(search.trim(), 40)
      setSearchResults(res)
      setSearching(false)
    }, 400)
    return () => clearTimeout(searchTimer.current)
  }, [search])

  // Audio player
  const playStation = useCallback((station: RadioStation) => {
    setActive(station)
    setAudioErr(false)
    setPlaying(false)
    recordStationClick(station.id)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }

    const audio = new Audio(station.url)
    audio.crossOrigin = 'anonymous'
    audioRef.current = audio
    audio.addEventListener('playing', () => setPlaying(true), { once: false })
    audio.addEventListener('waiting', () => setPlaying(false))
    audio.addEventListener('error', () => { setAudioErr(true); setPlaying(false) })
    audio.play().catch(() => setAudioErr(true))
  }, [])

  const stopStation = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    setPlaying(false)
    setActive(null)
    setAudioErr(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' } }, [])

  const displayStations: RadioStation[] = search.trim()
    ? searchResults
    : (byCountry[activeTab] || [])

  const totalLoaded = Object.values(byCountry).flat().length

  // ── Now-Playing bar ────────────────────────────────────────
  const NowPlayingBar = active ? (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 px-4 py-3"
      style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(45,38,69,0.8)' }}>
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-border"
          style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(19,17,28,0.9))' }}>
          {active.favicon
            ? <img src={active.favicon} alt={active.name} className="w-full h-full object-cover"
                onError={e => (e.currentTarget.style.display = 'none')}/>
            : <Radio weight="duotone" size={20} className="text-primary-light"/>}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white truncate">{active.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-muted truncate">{active.country}</p>
            {active.bitrate > 0 && (
              <span className="text-[9px] font-bold text-primary-light">{active.bitrate}kbps</span>
            )}
            {audioErr && (
              <span className="text-[9px] font-bold text-red-400">Stream error</span>
            )}
          </div>
        </div>

        {/* Live indicator */}
        {playing && !audioErr && (
          <div className="flex items-center gap-1.5 text-xs font-black text-red-400 bg-red-500/15 border border-red-500/25 px-2.5 py-1 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot"/> LIVE
          </div>
        )}
        {!playing && !audioErr && (
          <div className="flex items-center gap-1.5 text-xs font-black text-muted px-2.5 py-1 shrink-0">
            <SpinnerGap weight="bold" size={14} className="animate-spin"/> Connecting…
          </div>
        )}
        {audioErr && (
          <button onClick={() => playStation(active)}
            className="flex items-center gap-1 text-xs font-bold text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
            <ArrowClockwise weight="bold" size={12}/> Retry
          </button>
        )}

        {/* Stop */}
        <button onClick={stopStation}
          className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-muted hover:text-white transition-all shrink-0">
          <X weight="bold" size={16}/>
        </button>
      </div>
    </div>
  ) : null

  return (
    <div className="bg-mesh min-h-screen pb-32">
      {NowPlayingBar}

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/40"
        style={{ background: 'linear-gradient(180deg,rgba(124,58,237,0.15) 0%,transparent 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-15"
            style={{ background: 'radial-gradient(ellipse,#7C3AED,transparent)' }}/>
        </div>
        <div className="max-w-7xl mx-auto px-5 pt-8 pb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow-md"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                <Radio weight="fill" size={26} className="text-white"/>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">World Radio</h1>
                <p className="text-muted text-sm mt-0.5">
                  {loadPhase === 'loading'
                    ? <span className="flex items-center gap-1.5"><SpinnerGap weight="bold" size={12} className="animate-spin"/> Loading stations…</span>
                    : <>{totalLoaded.toLocaleString()} stations · Powered by Radio Browser</>
                  }
                </p>
              </div>
            </div>
            <button onClick={() => load(true)} title="Refresh"
              className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-muted hover:text-white transition-all">
              <ArrowClockwise weight="bold" size={16} className={loadPhase === 'loading' ? 'animate-spin' : ''}/>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <MagnifyingGlass weight="bold" size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"/>
            <input type="text" placeholder="Search radio stations worldwide…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl pl-10 pr-9 py-3 text-sm text-white placeholder-muted focus:outline-none"
              style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.8)' }}/>
            {search && (
              <button onClick={() => { setSearch(''); setSearchResults([]) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                <X weight="bold" size={14}/>
              </button>
            )}
          </div>

          {/* Country tabs */}
          {!search && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {[...RADIO_COUNTRY_GROUPS, { key: 'Global', label: '🌍 Global', flag: '🌍' }].map(grp => (
                <button key={grp.key} onClick={() => setActiveTab(grp.key)}
                  className="shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap"
                  style={{
                    background: activeTab === grp.key ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'rgba(45,38,69,0.5)',
                    border: `1px solid ${activeTab === grp.key ? 'rgba(124,58,237,0.5)' : 'rgba(45,38,69,0.8)'}`,
                    color: activeTab === grp.key ? '#fff' : '#7C7A91',
                    boxShadow: activeTab === grp.key ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
                  }}>
                  {grp.label}
                  {byCountry[grp.key]?.length > 0 && (
                    <span className="ml-1.5 text-[9px] opacity-70">{byCountry[grp.key].length}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-5 mt-6">

        {/* Error */}
        {loadPhase === 'error' && (
          <div className="rounded-2xl p-8 text-center border border-border bg-surface space-y-3">
            <Warning weight="duotone" size={36} className="text-amber-400 mx-auto"/>
            <p className="font-bold text-white">Couldn't load radio stations</p>
            <p className="text-sm text-muted">Check your connection and try refreshing.</p>
            <button onClick={() => load(true)} className="btn-primary px-5 py-2 rounded-xl text-sm font-bold text-white">
              ↺ Retry
            </button>
          </div>
        )}

        {/* Search results */}
        {search.trim() && (
          <div>
            <p className="text-sm text-muted mb-4">
              {searching ? (
                <span className="flex items-center gap-2"><SpinnerGap weight="bold" size={14} className="animate-spin"/> Searching…</span>
              ) : (
                <><span className="text-white font-bold">{searchResults.length}</span> results for "{search}"</>
              )}
            </p>
            {searching ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({length:8}).map((_,i) => <StationSkeleton key={i}/>)}
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-center text-muted py-8">No stations found for "{search}"</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {searchResults.map(st => (
                  <StationCard key={st.id} station={st} isActive={active?.id === st.id} isPlaying={playing && active?.id === st.id}
                    onClick={() => active?.id === st.id && playing ? stopStation() : playStation(st)}/>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Station grid */}
        {!search.trim() && (
          <>
            {loadPhase === 'loading' && displayStations.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({length:12}).map((_,i) => <StationSkeleton key={i}/>)}
              </div>
            ) : displayStations.length === 0 && loadPhase === 'done' ? (
              <p className="text-center text-muted py-8">No stations found for {activeTab}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {displayStations.map(st => (
                  <StationCard key={st.id} station={st} isActive={active?.id === st.id} isPlaying={playing && active?.id === st.id}
                    onClick={() => active?.id === st.id && playing ? stopStation() : playStation(st)}/>
                ))}
              </div>
            )}
          </>
        )}

        <p className="text-center text-[11px] text-muted mt-8 pb-4">
          <Broadcast weight="duotone" size={13} className="inline mr-1 text-primary-light opacity-60"/>
          Powered by <a href="https://www.radio-browser.info/" target="_blank" rel="noopener noreferrer"
            className="text-primary-light hover:underline">Radio Browser</a> · 45,000+ stations worldwide
        </p>
      </div>
    </div>
  )
}

// ── Station Card ──────────────────────────────────────────────
function StationCard({ station, isActive, isPlaying, onClick }: {
  station: RadioStation
  isActive: boolean
  isPlaying: boolean
  onClick: () => void
}) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <button onClick={onClick}
      className="group relative overflow-hidden rounded-2xl p-4 text-center transition-all hover:-translate-y-1"
      style={{
        background: isActive ? 'rgba(124,58,237,0.2)' : 'rgba(19,17,28,0.8)',
        border: `1px solid ${isActive ? 'rgba(124,58,237,0.5)' : 'rgba(45,38,69,0.6)'}`,
        boxShadow: isActive ? '0 0 20px rgba(124,58,237,0.3)' : '0 4px 20px rgba(0,0,0,0.4)',
      }}>

      {/* Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
        style={{ background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.12), transparent 70%)' }}/>

      {/* Logo */}
      <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-3 flex items-center justify-center border border-border"
        style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(19,17,28,0.9))' }}>
        {station.favicon && !imgErr ? (
          <img src={station.favicon} alt={station.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
            onError={() => setImgErr(true)}/>
        ) : (
          <Radio weight="duotone" size={28} className="text-primary-light opacity-60"/>
        )}
      </div>

      <p className="text-xs font-black text-white tracking-tight truncate px-1">{station.name}</p>
      {station.country && (
        <p className="text-[9px] text-muted mt-0.5 flex items-center justify-center gap-1">
          <Globe weight="duotone" size={9}/>{station.country}
        </p>
      )}
      {station.tags.length > 0 && (
        <p className="text-[9px] text-muted mt-0.5 truncate px-1">{station.tags.slice(0,2).join(' · ')}</p>
      )}

      {/* Play state */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold">
        {isPlaying ? (
          <span className="text-red-400 flex items-center gap-1 live-pulse">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot"/> LIVE
          </span>
        ) : isActive ? (
          <span className="text-primary-light flex items-center gap-1">
            <SpinnerGap weight="bold" size={11} className="animate-spin"/> Connecting…
          </span>
        ) : (
          <span className="text-primary-light group-hover:text-white transition-colors flex items-center gap-1">
            <Headphones weight="fill" size={12}/> Listen
          </span>
        )}
      </div>

      {/* Live badge */}
      {isPlaying && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-red-600/80 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
          <MusicNote weight="fill" size={8}/> ON AIR
        </div>
      )}
    </button>
  )
}

function StationSkeleton() {
  return (
    <div className="rounded-2xl p-4 animate-pulse" style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.4)' }}>
      <div className="w-14 h-14 rounded-2xl skeleton mx-auto mb-3"/>
      <div className="h-3 skeleton rounded w-3/4 mx-auto mb-2"/>
      <div className="h-2 skeleton rounded w-1/2 mx-auto"/>
    </div>
  )
}
