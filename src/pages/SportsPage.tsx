import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Hls from 'hls.js'
import {
  SoccerBall, MagnifyingGlass, X, ArrowLeft,
  ArrowClockwise, SpinnerGap, WarningCircle,
  Television, Broadcast, ArrowsOut, Warning,
} from '@phosphor-icons/react'
import { fetchLiveFixtures } from '../lib/sportsApi'
import type { Fixture } from '../data/types'
import staticData from '../data/sports_fixtures.json'

interface SportChannel { id: number; name: string; group: string; logo: string; url: string }
type View = 'fixtures' | 'channels' | 'watch'
type LoadPhase = 'idle' | 'loading' | 'done' | 'error'

const STATUS_TABS = [
  { label: 'All',      value: 'all'      },
  { label: '🔴 Live',  value: 'live'     },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Finished', value: 'finished' },
]

const STATIC = staticData as Fixture[]

function sortFixtures(arr: Fixture[]) {
  const o: Record<string, number> = { IN_PLAY: 0, PAUSED: 1, TIMED: 2, SCHEDULED: 3, FINISHED: 4, CANCELLED: 5 }
  return [...arr].sort((a, b) => {
    const d = (o[a.status] ?? 9) - (o[b.status] ?? 9)
    return d !== 0 ? d : new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime()
  })
}

export default function SportsPage() {
  const [view, setView]           = useState<View>('fixtures')
  const [fixtures, setFixtures]   = useState<Fixture[]>(STATIC)
  const [phase, setPhase]         = useState<LoadPhase>('idle')
  const [liveLoaded, setLiveLoaded] = useState(false)
  const [statusTab, setStatusTab] = useState('all')
  const [compFilter, setCompFilter] = useState('All')
  const [search, setSearch]       = useState('')
  const [channels, setChannels]   = useState<SportChannel[]>([])
  const [chLoading, setChLoading] = useState(false)
  const [activeChannel, setActiveChannel] = useState<SportChannel | null>(null)
  const [chSearch, setChSearch]   = useState('')
  const [chGroup, setChGroup]     = useState('All')

  const load = useCallback(async (force = false) => {
    setPhase('loading')
    try {
      const data = await fetchLiveFixtures(force)
      if (data.length > 0) { setFixtures(sortFixtures(data)); setLiveLoaded(true) }
      setPhase('done')
    } catch { setPhase(liveLoaded ? 'done' : 'error') }
  }, [liveLoaded])

  useEffect(() => {
    load()
    const iv = setInterval(() => load(true), 120000)
    return () => clearInterval(iv)
  }, [load])

  useEffect(() => {
    if (view !== 'channels' && view !== 'watch') return
    if (channels.length > 0) return
    setChLoading(true)
    fetch('/sports-streams.json').then(r => r.json()).then((d: SportChannel[]) => { setChannels(d); setChLoading(false) }).catch(() => setChLoading(false))
  }, [view, channels.length])

  const liveCount = useMemo(() => fixtures.filter(f => f.status === 'IN_PLAY' || f.status === 'PAUSED').length, [fixtures])

  const competitions = useMemo(() =>
    ['All', ...Array.from(new Set(fixtures.map(f => f.competition_name))).sort()],
    [fixtures]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return fixtures.filter(f => {
      const ms = !q || f.home_team_name.toLowerCase().includes(q) || f.away_team_name.toLowerCase().includes(q) || f.competition_name.toLowerCase().includes(q)
      const mc = compFilter === 'All' || f.competition_name === compFilter
      const mt = statusTab === 'all' ||
        (statusTab === 'live'     && (f.status === 'IN_PLAY' || f.status === 'PAUSED')) ||
        (statusTab === 'upcoming' && (f.status === 'SCHEDULED' || f.status === 'TIMED')) ||
        (statusTab === 'finished' && f.status === 'FINISHED')
      return ms && mc && mt
    })
  }, [fixtures, search, compFilter, statusTab])

  const chGroups = useMemo(() => ['All', ...Array.from(new Set(channels.map(c => c.group))).sort()], [channels])
  const filteredCh = useMemo(() => {
    const q = chSearch.toLowerCase()
    return channels.filter(c => (!q || c.name.toLowerCase().includes(q)) && (chGroup === 'All' || c.group === chGroup))
  }, [channels, chSearch, chGroup])

  if (view === 'watch' && activeChannel) {
    return <ChannelPlayer channel={activeChannel} channels={filteredCh} onBack={() => setView('channels')} onSwitch={ch => setActiveChannel(ch)} />
  }

  return (
    <div className="bg-mesh min-h-screen pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="relative h-44 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&auto=format&fit=crop&q=80"
            alt="" className="w-full h-full object-cover opacity-25"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(10,10,15,0.97) 0%,rgba(10,10,15,0.7) 60%,rgba(10,10,15,0.4) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#0A0A0F 0%,transparent 60%)' }} />
          <div className="absolute inset-0 flex flex-col justify-end px-5 pb-5">
            {liveCount > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-red-400 uppercase mb-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 live-dot" /> {liveCount} LIVE NOW
              </span>
            )}
            <h1 className="text-3xl font-black text-white tracking-tight">Live Sports</h1>
            <p className="text-muted text-sm mt-0.5">
              {phase === 'loading' && !liveLoaded ? 'Loading…' : `${fixtures.length} fixtures · Premier League, UCL, La Liga & more`}
            </p>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="px-5 mt-4">
        <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: 'rgba(19,17,28,0.9)', border: '1px solid rgba(45,38,69,0.7)' }}>
          {([
            { key: 'fixtures', label: 'Fixtures',      Icon: SoccerBall },
            { key: 'channels', label: 'Live Channels', Icon: Television },
          ] as { key: View; label: string; Icon: React.ElementType }[]).map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setView(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: view === key ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
                color: view === key ? '#fff' : '#7C7A91',
                boxShadow: view === key ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
              }}>
              <Icon weight="duotone" size={15} />
              {label}
              {key === 'fixtures' && liveCount > 0 && (
                <span className="text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-full">{liveCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 mt-5 space-y-4">

        {/* ══ FIXTURES VIEW ══ */}
        {view === 'fixtures' && (
          <>
            {/* Search + refresh */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MagnifyingGlass weight="bold" size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input type="text" placeholder="Search teams or competitions…" value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-muted focus:outline-none"
                  style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.8)' }} />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"><X weight="bold" size={13} /></button>}
              </div>
              <button onClick={() => load(true)} disabled={phase === 'loading'}
                className="w-10 h-10 rounded-xl border border-border bg-surface-2 flex items-center justify-center text-muted hover:text-white hover:border-primary/40 transition-all disabled:opacity-50">
                {phase === 'loading' ? <SpinnerGap weight="bold" size={15} className="animate-spin" /> : <ArrowClockwise weight="bold" size={15} />}
              </button>
            </div>

            {/* Status tabs */}
            <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
              {STATUS_TABS.map(t => (
                <button key={t.value} onClick={() => setStatusTab(t.value)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                  style={{
                    background: statusTab === t.value ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
                    color: statusTab === t.value ? '#fff' : '#7C7A91',
                    boxShadow: statusTab === t.value ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
                  }}>
                  {t.value === 'live' && liveCount > 0 ? `🔴 Live (${liveCount})` : t.label}
                </button>
              ))}
            </div>

            {/* Competition pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {competitions.slice(0, 20).map(c => (
                <button key={c} onClick={() => setCompFilter(c)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
                  style={{
                    background: compFilter === c ? 'rgba(124,58,237,0.2)' : 'rgba(19,17,28,0.6)',
                    border: `1px solid ${compFilter === c ? 'rgba(124,58,237,0.5)' : 'rgba(45,38,69,0.6)'}`,
                    color: compFilter === c ? '#A78BFA' : '#7C7A91',
                  }}>
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted"><span className="text-white font-bold">{filtered.length}</span> fixtures</p>
              {!liveLoaded && phase === 'loading' && (
                <p className="text-[10px] text-primary-light flex items-center gap-1"><SpinnerGap weight="bold" size={10} className="animate-spin" /> Fetching live data…</p>
              )}
            </div>

            {/* Skeletons */}
            {phase === 'loading' && fixtures === STATIC && (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl animate-pulse h-16" style={{ background: 'rgba(19,17,28,0.7)', border: '1px solid rgba(45,38,69,0.5)' }} />
                ))}
              </div>
            )}

            {/* Error */}
            {phase === 'error' && (
              <div className="rounded-2xl p-8 text-center border border-border bg-surface space-y-3">
                <Warning weight="duotone" size={36} className="text-amber-400 mx-auto" />
                <p className="font-bold text-white">Couldn't load live fixtures</p>
                <button onClick={() => load(true)} className="btn-primary px-5 py-2 rounded-xl text-sm font-bold text-white">↺ Retry</button>
              </div>
            )}

            {/* Empty */}
            {phase === 'done' && filtered.length === 0 && (
              <div className="text-center py-16">
                <SoccerBall weight="duotone" size={40} className="text-muted opacity-40 mx-auto mb-3" />
                <p className="text-muted">No fixtures found</p>
                <button onClick={() => { setSearch(''); setCompFilter('All'); setStatusTab('all') }}
                  className="text-primary-light text-sm mt-2 hover:underline">Clear filters</button>
              </div>
            )}

            {/* Fixture list grouped by competition */}
            {filtered.length > 0 && <FixtureList fixtures={filtered} />}
          </>
        )}

        {/* ══ CHANNELS VIEW ══ */}
        {view === 'channels' && (
          <>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MagnifyingGlass weight="bold" size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input type="text" placeholder="Search sport channels…" value={chSearch}
                  onChange={e => setChSearch(e.target.value)}
                  className="w-full rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-muted focus:outline-none"
                  style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.8)' }} />
                {chSearch && <button onClick={() => setChSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"><X weight="bold" size={13} /></button>}
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {chGroups.map(g => (
                <button key={g} onClick={() => setChGroup(g)}
                  className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
                  style={{
                    background: chGroup === g ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'rgba(19,17,28,0.7)',
                    border: `1px solid ${chGroup === g ? 'rgba(124,58,237,0.5)' : 'rgba(45,38,69,0.6)'}`,
                    color: chGroup === g ? '#fff' : '#7C7A91',
                    boxShadow: chGroup === g ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
                  }}>{g}</button>
              ))}
            </div>
            <p className="text-xs text-muted"><span className="text-white font-bold">{filteredCh.length}</span> channels</p>
            {chLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => <div key={i} className="rounded-2xl skeleton aspect-video" />)}
              </div>
            ) : filteredCh.length === 0 ? (
              <div className="text-center py-16"><Television weight="duotone" size={40} className="text-muted opacity-40 mx-auto mb-3" /><p className="text-muted">No channels found</p></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredCh.map(ch => (
                  <ChannelCard key={ch.id} channel={ch} onClick={() => { setActiveChannel(ch); setView('watch') }} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ── Fixture List grouped by competition ── */
function FixtureList({ fixtures }: { fixtures: Fixture[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, Fixture[]>()
    for (const f of fixtures) {
      if (!map.has(f.competition_name)) map.set(f.competition_name, [])
      map.get(f.competition_name)!.push(f)
    }
    return Array.from(map.entries()).sort(([, a], [, b]) => {
      const al = a.some(f => f.status === 'IN_PLAY' || f.status === 'PAUSED') ? 0 : 1
      const bl = b.some(f => f.status === 'IN_PLAY' || f.status === 'PAUSED') ? 0 : 1
      return al - bl
    })
  }, [fixtures])

  return (
    <div className="space-y-6 pb-4">
      {groups.map(([comp, matches]) => {
        const hasLive = matches.some(f => f.status === 'IN_PLAY' || f.status === 'PAUSED')
        return (
          <div key={comp}>
            <div className="flex items-center gap-3 mb-2.5">
              <SoccerBall weight="duotone" size={14} className="text-primary-light shrink-0" />
              <span className="text-[11px] font-black text-white uppercase tracking-wide truncate">{comp}</span>
              {hasLive && (
                <span className="shrink-0 flex items-center gap-1 text-[8px] font-black text-red-400 bg-red-500/15 border border-red-500/25 px-1.5 py-0.5 rounded-full">
                  <span className="w-1 h-1 bg-red-500 rounded-full live-dot" /> LIVE
                </span>
              )}
              <span className="h-px flex-1 opacity-20" style={{ background: 'rgba(124,58,237,0.6)' }} />
              <span className="text-[9px] text-muted shrink-0">{matches.length}</span>
            </div>
            <div className="space-y-2">
              {matches.map(f => <FixtureRow key={f.id} fixture={f} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Fixture Row ── */
function FixtureRow({ fixture: f }: { fixture: Fixture }) {
  const isLive = f.status === 'IN_PLAY' || f.status === 'PAUSED'
  const isFin  = f.status === 'FINISHED'
  const date   = new Date(f.utc_date)
  const today  = date.toDateString() === new Date().toDateString()

  return (
    <div className="rounded-2xl border transition-all"
      style={{
        background: isLive ? 'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(19,17,28,0.95))' : 'rgba(19,17,28,0.7)',
        border: `1px solid ${isLive ? 'rgba(239,68,68,0.25)' : 'rgba(45,38,69,0.7)'}`,
        boxShadow: isLive ? '0 0 20px rgba(239,68,68,0.08)' : '0 2px 12px rgba(0,0,0,0.3)',
      }}>
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Home */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TeamCrest src={f.home_team_crest} name={f.home_team_name} />
          <span className={`text-sm font-bold truncate ${isFin && f.winner === 'AWAY_TEAM' ? 'text-muted' : 'text-white'}`}>
            {f.home_team_name}
          </span>
        </div>
        {/* Score/Time */}
        <div className="shrink-0 text-center min-w-[80px]">
          {isLive ? (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xl font-black text-red-400 tabular-nums leading-none">{f.home_score ?? 0}–{f.away_score ?? 0}</span>
              <span className="flex items-center gap-1 text-[9px] text-red-400 font-black"><span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot" /> LIVE</span>
            </div>
          ) : isFin && f.home_score !== null ? (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xl font-black text-white tabular-nums leading-none">{f.home_score}–{f.away_score}</span>
              <span className="text-[9px] text-muted font-bold">FT</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-black text-white tabular-nums">
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[9px] text-muted">
                {today ? 'Today' : date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>
        {/* Away */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className={`text-sm font-bold truncate text-right ${isFin && f.winner === 'HOME_TEAM' ? 'text-muted' : 'text-white'}`}>
            {f.away_team_name}
          </span>
          <TeamCrest src={f.away_team_crest} name={f.away_team_name} />
        </div>
      </div>
    </div>
  )
}

function TeamCrest({ src, name }: { src: string; name: string }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className="w-7 h-7 rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0">
        <span className="text-[9px] font-black text-muted">{name.slice(0, 2).toUpperCase()}</span>
      </div>
    )
  }
  return <img src={src} alt={name} className="w-7 h-7 object-contain shrink-0 drop-shadow-md" onError={() => setErr(true)} />
}

/* ── Channel Card ── */
function ChannelCard({ channel: ch, onClick }: { channel: SportChannel; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface hover:border-primary/40 transition-all hover:-translate-y-0.5 w-full text-left">
      <div className="aspect-video relative overflow-hidden bg-surface-2 flex items-center justify-center">
        {ch.logo ? (
          <img src={ch.logo} alt={ch.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
            onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(10,10,15,0.9))' }}>
            <Broadcast weight="duotone" size={28} className="text-primary-light opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-glow-sm" style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}>
            <Television weight="fill" size={16} className="text-white" />
          </div>
        </div>
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
          <span className="w-1 h-1 bg-white rounded-full live-dot" /> LIVE
        </div>
      </div>
      <div className="p-2">
        <p className="text-[11px] font-bold text-white truncate">{ch.name}</p>
        <p className="text-[9px] text-muted mt-0.5">{ch.group}</p>
      </div>
    </button>
  )
}

/* ── HLS Channel Player ── */
function ChannelPlayer({ channel, channels, onBack, onSwitch }: {
  channel: SportChannel; channels: SportChannel[]; onBack: () => void; onSwitch: (ch: SportChannel) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef   = useRef<Hls | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState]       = useState<'loading' | 'playing' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [isFs, setIsFs]         = useState(false)
  const [search, setSearch]     = useState('')

  const sidebar = channels.filter(c => c.id !== channel.id && (!search || c.name.toLowerCase().includes(search.toLowerCase()))).slice(0, 50)

  useEffect(() => {
    const v = videoRef.current; if (!v) return
    setState('loading'); setErrorMsg('')
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    const onErr = (msg = 'Stream unavailable.') => { setState('error'); setErrorMsg(msg) }
    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true, enableWorker: true, maxBufferLength: 30 })
      hls.loadSource(channel.url); hls.attachMedia(v)
      hls.on(Hls.Events.MANIFEST_PARSED, () => { v.play().catch(() => {}); setState('playing') })
      hls.on(Hls.Events.ERROR, (_e, d) => {
        if (!d.fatal) return
        if (d.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad()
        else if (d.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError()
        else onErr()
      })
      hlsRef.current = hls
    } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
      v.src = channel.url
      v.addEventListener('loadeddata', () => setState('playing'), { once: true })
      v.addEventListener('error', () => onErr(), { once: true })
      v.play().catch(() => {})
    } else { onErr('Your browser cannot play HLS.') }
    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null } }
  }, [channel.url, retryKey])

  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  const toggleFs = async () => {
    try { document.fullscreenElement ? await document.exitFullscreen() : await containerRef.current?.requestFullscreen() } catch { /* ignore */ }
  }

  return (
    <div className="bg-mesh min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted hover:text-white mb-4 transition-colors group">
          <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to channels
        </button>
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-black text-white flex-1">{channel.name}</h1>
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/15 border border-red-500/25 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot" /> LIVE
              </span>
            </div>
            <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.7)' }}>
              {state === 'loading' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-4 pointer-events-none">
                  <SpinnerGap weight="bold" size={40} className="text-primary animate-spin" />
                  <p className="text-xs text-muted">Connecting to stream…</p>
                </div>
              )}
              {state === 'error' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/95 gap-4 p-6 text-center">
                  <WarningCircle weight="duotone" size={36} className="text-amber-500" />
                  <p className="text-white font-bold">Stream unavailable</p>
                  <p className="text-muted text-sm max-w-xs">{errorMsg}</p>
                  <button onClick={() => setRetryKey(k => k + 1)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}>↺ Retry</button>
                  <button onClick={onBack} className="text-xs text-muted hover:text-white transition-colors">Browse other channels</button>
                </div>
              )}
              <video ref={videoRef} key={retryKey} className="absolute inset-0 w-full h-full" controls autoPlay muted playsInline poster={channel.logo || undefined} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setRetryKey(k => k + 1)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white transition-all" style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
                <ArrowClockwise weight="bold" size={13} /> Reload
              </button>
              <button onClick={toggleFs} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white transition-all" style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
                <ArrowsOut weight="bold" size={13} /> {isFs ? 'Exit' : 'Fullscreen'}
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Broadcast weight="duotone" size={15} className="text-primary-light" /> More Channels
              <span className="text-xs text-muted ml-auto">{channels.length} total</span>
            </h3>
            <div className="relative">
              <MagnifyingGlass weight="bold" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input type="text" placeholder="Filter…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-muted focus:outline-none"
                style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }} />
            </div>
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-0.5 no-scrollbar">
              {sidebar.map(ch => (
                <button key={ch.id} onClick={() => onSwitch(ch)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group bg-surface border border-border hover:border-primary/30 hover:bg-surface-2">
                  <div className="w-14 h-9 rounded-lg overflow-hidden bg-surface-2 shrink-0 flex items-center justify-center">
                    {ch.logo ? <img src={ch.logo} alt="" className="w-full h-full object-cover" onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} /> : <Broadcast weight="duotone" size={16} className="text-primary-light opacity-50" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-white truncate group-hover:text-primary-light transition-colors">{ch.name}</p>
                    <p className="text-[9px] text-muted mt-0.5">{ch.group}</p>
                  </div>
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
