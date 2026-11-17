import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { Television, ArrowLeft, ArrowSquareOut, Globe, WarningCircle, SpinnerGap } from '@phosphor-icons/react'
import type { IptvChannel } from '../lib/iptvApi'
import { saveContinueWatching } from '../lib/watchlist'

// ── Helpers ───────────────────────────────────────────────────────
function toYouTubeEmbed(raw: string): string {
  // If it looks like a bare YouTube channel ID (24 chars starting with UC)
  if (/^UC[\w-]{22}$/.test(raw.trim())) {
    return `https://www.youtube-nocookie.com/embed/live_stream?channel=${raw.trim()}&autoplay=1&mute=0&rel=0`
  }
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    let vid = ''
    if (u.hostname === 'youtu.be') vid = u.pathname.slice(1).split('?')[0]
    else if (u.pathname.startsWith('/watch')) vid = u.searchParams.get('v') || ''
    else if (/^\/(live|embed|shorts)\//.test(u.pathname)) vid = u.pathname.split('/')[2]
    // YouTube channel ID in URL
    else if (u.pathname.includes('/channel/')) {
      const chId = u.pathname.split('/channel/')[1]?.split('/')[0]
      if (chId) return `https://www.youtube-nocookie.com/embed/live_stream?channel=${chId}&autoplay=1&mute=0&rel=0`
    }
    if (vid) return `https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&mute=0&playsinline=1&rel=0`
  } catch { /* fall through */ }
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw.trim()))
    return `https://www.youtube-nocookie.com/embed/${raw.trim()}?autoplay=1&mute=0&playsinline=1&rel=0`
  return raw
}

type PlayerState = 'loading' | 'ready' | 'error'

export default function TvWatchPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const videoRef  = useRef<HTMLVideoElement>(null)
  const hlsRef    = useRef<Hls | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [playerState, setPlayerState] = useState<PlayerState>('loading')
  const [errorMsg, setErrorMsg]       = useState('')
  const [retryKey, setRetryKey]       = useState(0)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [sidebarChannels, setSidebarChannels] = useState<IptvChannel[]>([])

  // Channel passed via location.state from TvPage
  const channel = location.state as IptvChannel | null

  // Fallback: if no state, we can't play (send back to TV page)
  const url   = channel?.source_url ?? ''
  const type  = channel?.source_type ?? 'hls'

  // Detect actual type from URL or source_type field
  const isYouTube = type === 'youtube' ||
    /^UC[\w-]{22}$/.test(url.trim()) ||  // bare YouTube channel ID
    url.includes('youtube') || url.includes('youtu.be') || url.includes('youtube-nocookie')
  const isEmbed   = type === 'iframe' && !isYouTube
  const isHls     = !isYouTube && !isEmbed

  // Load sidebar channels from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('chillz_iptv_channels_v3')
      if (raw) {
        const data = JSON.parse(raw) as { byCountry: Record<string, IptvChannel[]>; byCategory: Record<string, IptvChannel[]> }
        const all: IptvChannel[] = []
        const seen = new Set<string>()
        Object.values(data.byCountry).forEach(chs => chs.forEach(ch => {
          if (!seen.has(ch.source_url) && ch.id !== channel?.id) { seen.add(ch.source_url); all.push(ch) }
        }))
        setSidebarChannels(all)
      }
    } catch { /* ignore */ }
  }, [channel?.id])

  // Save to continue watching
  useEffect(() => {
    if (!channel) return
    saveContinueWatching({
      item_id:     channel.id,
      item_type:   'channel',
      item_title:  channel.title,
      item_poster: channel.poster_url || '',
      item_url:    `/tv/watch/${encodeURIComponent(channel.id)}`,
    })
  }, [channel?.id])

  // ── HLS player setup ──────────────────────────────────────────
  const setupHls = useCallback(() => {
    const video = videoRef.current
    if (!channel || !video || !isHls) return

    setPlayerState('loading')
    setErrorMsg('')

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }

    const markReady = () => setPlayerState('ready')
    const markError = (msg = 'Stream unavailable. Please retry or try another channel.') => {
      setPlayerState('error'); setErrorMsg(msg)
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        enableWorker: true,
        maxBufferLength: 30,
        // Send proper browser headers so servers don't block the stream
        xhrSetup: (xhr) => {
          xhr.setRequestHeader('Referer', window.location.origin + '/')
        },
      })
      hls.loadSource(url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); markReady() })
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad()
        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError()
        else markError()
      })
      hlsRef.current = hls
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url
      video.addEventListener('loadeddata', () => markReady(), { once: true })
      video.addEventListener('error', () => markError(), { once: true })
      video.play().catch(() => {})
    } else {
      markError('Your browser cannot play HLS streams. Try Chrome or Firefox.')
    }
  }, [channel, retryKey, isHls, url]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setupHls()
    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null } }
  }, [setupHls])

  // Reset state when channel changes
  useEffect(() => {
    setIframeLoaded(false)
    setPlayerState('loading')
    setErrorMsg('')
    if (channel && !isHls) {
      const timer = setTimeout(() => {
        if (!iframeLoaded) {
          setPlayerState('error')
          setErrorMsg('Channel unavailable. Try another or open in a new tab.')
        }
      }, 14000)
      return () => clearTimeout(timer)
    }
  }, [channel?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredSidebar = sidebarChannels.filter(ch =>
    !sidebarSearch || ch.title.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    (ch.country || '').toLowerCase().includes(sidebarSearch.toLowerCase())
  ).slice(0, 50)

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 gap-3">
        <Television weight="duotone" size={48} className="text-gray-700" />
        <p className="font-semibold text-white">Channel not found</p>
        <p className="text-sm text-muted">Go back to browse live channels.</p>
        <button onClick={() => navigate('/tv')}
          className="btn-primary px-5 py-2 rounded-xl text-sm font-bold text-white mt-2">
          Browse Channels
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 pb-24 md:pb-6">
      {/* Back */}
      <button onClick={() => navigate('/tv')}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-white mb-4 transition-colors group">
        <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform"/> Back to channels
      </button>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {/* ── Player ── */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.7)' }}>

            {/* HLS */}
            {isHls && (
              <>
                <video ref={videoRef} key={retryKey}
                  className="absolute inset-0 w-full h-full" controls autoPlay muted playsInline
                  poster={channel.poster_url || undefined} />
                {playerState === 'loading' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-none gap-3">
                    <SpinnerGap weight="bold" size={32} className="text-primary animate-spin"/>
                    <p className="text-xs text-muted">Loading stream…</p>
                  </div>
                )}
                {playerState === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-6 text-center gap-3">
                    <WarningCircle weight="duotone" size={32} className="text-amber-500"/>
                    <p className="text-sm text-gray-300 max-w-xs">{errorMsg}</p>
                    <button onClick={() => setRetryKey(k => k + 1)}
                      className="px-5 py-2 bg-primary hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors">
                      ↺ Retry
                    </button>
                    <button onClick={() => navigate('/tv')} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                      Browse other channels
                    </button>
                  </div>
                )}
              </>
            )}

            {/* YouTube */}
            {isYouTube && (
              <>
                {playerState === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-6 text-center gap-3 z-20">
                    <WarningCircle weight="duotone" size={32} className="text-amber-500"/>
                    <p className="text-sm text-gray-300 max-w-xs">{errorMsg}</p>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="px-5 py-2 bg-primary hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors">
                      ↗ Open in new tab
                    </a>
                    <button onClick={() => navigate('/tv')} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                      Browse other channels
                    </button>
                  </div>
                )}
                {!iframeLoaded && playerState !== 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-none z-10">
                    <SpinnerGap weight="bold" size={32} className="text-primary animate-spin"/>
                  </div>
                )}
                {playerState !== 'error' && (
                  <iframe key={`yt-${id}-${retryKey}`} ref={iframeRef}
                    src={toYouTubeEmbed(url)} className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture; accelerometer; encrypted-media; gyroscope"
                    allowFullScreen onLoad={() => { setIframeLoaded(true); setPlayerState('ready') }}/>
                )}
              </>
            )}

            {/* Generic embed */}
            {isEmbed && (
              <>
                {playerState === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-6 text-center gap-3 z-20">
                    <WarningCircle weight="duotone" size={32} className="text-amber-500"/>
                    <p className="text-sm text-gray-300 max-w-xs">{errorMsg}</p>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="px-5 py-2 bg-primary hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors">
                      ↗ Open in new tab
                    </a>
                    <button onClick={() => { setPlayerState('loading'); setIframeLoaded(false); setRetryKey(k => k + 1) }}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors">↺ Retry anyway</button>
                  </div>
                )}
                {!iframeLoaded && playerState !== 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-none z-10 gap-3">
                    <SpinnerGap weight="bold" size={32} className="text-primary animate-spin"/>
                    <p className="text-xs text-muted">Loading player…</p>
                  </div>
                )}
                {playerState !== 'error' && (
                  <iframe key={`embed-${id}-${retryKey}`} ref={iframeRef} src={url}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
                    allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                    onLoad={() => { setIframeLoaded(true); setPlayerState('ready') }}/>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => { setIframeLoaded(false); setRetryKey(k => k + 1) }}
              className="px-3 py-1.5 bg-surface border border-border hover:border-primary/50 text-gray-300 text-xs font-semibold rounded-lg transition-colors">
              ↺ Reload
            </button>
            {(isEmbed || isYouTube) && (
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-surface border border-border hover:border-primary/50 text-gray-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1">
                <ArrowSquareOut size={12}/> Open in tab
              </a>
            )}
          </div>

          {/* Channel info */}
          <div className="bg-surface border border-border rounded-xl p-4 flex items-start gap-3">
            {channel.poster_url && (
              <img src={channel.poster_url} alt={channel.title}
                className="w-14 h-14 rounded-lg object-cover shrink-0 bg-surface-2"
                onError={e => (e.currentTarget.style.display = 'none')} />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-base font-bold text-white">{channel.title}</h1>
                <span className="flex items-center gap-1 bg-red-600/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-900/40">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot"/> LIVE
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                {channel.country && (
                  <span className="flex items-center gap-1"><Globe weight="duotone" size={12}/>{channel.country}</span>
                )}
                <span className="uppercase font-medium">{channel.group}</span>
                {channel.quality && <span className="font-bold text-primary-light">{channel.quality}</span>}
              </div>
              {channel.description && (
                <p className="text-xs text-gray-500 mt-1">{channel.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400">More Channels</h2>
            <span className="text-xs text-gray-600">{sidebarChannels.length} loaded</span>
          </div>
          <input type="text" placeholder="Filter channels…" value={sidebarSearch}
            onChange={e => setSidebarSearch(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"/>
          <div className="space-y-1.5 max-h-[65vh] overflow-y-auto pr-0.5">
            {filteredSidebar.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-4">No channels found</p>
            ) : filteredSidebar.map(ch => (
              <button key={ch.id}
                onClick={() => navigate(`/tv/watch/${encodeURIComponent(ch.id)}`, { state: ch })}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-border hover:border-primary/40 hover:bg-surface-2 transition-all text-left group">
                <div className="w-14 h-9 rounded-lg overflow-hidden bg-surface-2 shrink-0">
                  {ch.poster_url ? (
                    <img src={ch.poster_url} alt="" className="w-full h-full object-cover"
                      onError={e => (e.currentTarget.style.display = 'none')}/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Television weight="duotone" size={18} className="text-gray-700"/>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-primary-light transition-colors">
                    {ch.title}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{ch.country || ch.group}</p>
                </div>
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 live-dot"/>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
