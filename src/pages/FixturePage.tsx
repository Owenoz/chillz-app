import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, SpinnerGap, SoccerBall, Television } from '@phosphor-icons/react'
import { fetchMatches, formatMatchTime, type SportscoreMatch } from '../lib/sportscoreApi'
import type { IptvChannel } from '../lib/iptvApi'

function findSportsChannels(): IptvChannel[] {
  try {
    const raw = sessionStorage.getItem('chillz_iptv_channels_v3')
    if (!raw) return []
    const data = JSON.parse(raw) as { byCategory: Record<string, IptvChannel[]> }
    return (data.byCategory?.sports || []).slice(0, 6)
  } catch { return [] }
}

function TeamLogo({ src, name, size = 20 }: { src: string; name: string; size?: number }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className="rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}>
        <span className="font-black text-muted" style={{ fontSize: size * 0.4 }}>
          {name.slice(0, 2).toUpperCase()}
        </span>
      </div>
    )
  }
  return (
    <img src={src} alt={name} className="object-contain shrink-0 drop-shadow-md"
      style={{ width: size, height: size }}
      onError={() => setErr(true)} />
  )
}

export default function FixturePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Match may be passed via route state (from SportsPage click)
  const passedMatch = location.state as SportscoreMatch | null

  const [match, setMatch]     = useState<SportscoreMatch | null>(passedMatch || null)
  const [related, setRelated] = useState<SportscoreMatch[]>([])
  const [loading, setLoading] = useState(!passedMatch)

  useEffect(() => {
    if (passedMatch) {
      // Load related from same competition
      fetchMatches('football', 100).then(all => {
        const rel = all
          .filter(m =>
            m.competition === passedMatch.competition &&
            !(m.home === passedMatch.home && m.away === passedMatch.away)
          )
          .slice(0, 8)
        setRelated(rel)
      }).catch(() => {})
      return
    }
    // No state — try to find by decoded id (home-away slug)
    if (!id) return
    setLoading(true)
    fetchMatches('football', 100).then(all => {
      // id is encoded as "home___away" or just an index
      const decoded = decodeURIComponent(id)
      const found = all.find(m =>
        `${m.home}___${m.away}` === decoded ||
        m.url?.includes(decoded)
      ) || all[0]
      setMatch(found || null)
      if (found) {
        const rel = all
          .filter(m => m.competition === found.competition &&
            !(m.home === found.home && m.away === found.away))
          .slice(0, 8)
        setRelated(rel)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id, passedMatch])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SpinnerGap weight="bold" size={32} className="text-primary animate-spin" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <SoccerBall weight="duotone" size={48} className="text-gray-700" />
        <p className="text-white font-semibold">Match not found</p>
        <button onClick={() => navigate('/sports')}
          className="text-primary-light hover:underline text-sm flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back to sports
        </button>
      </div>
    )
  }

  const isLive     = match.status === 'live'
  const isFinished = match.status === 'finished'
  const hasScore   = match.home_score !== null && match.away_score !== null
  const homeWins   = hasScore && Number(match.home_score) > Number(match.away_score)
  const awayWins   = hasScore && Number(match.away_score) > Number(match.home_score)
  const draw       = hasScore && match.home_score === match.away_score
  const relatedChannels = findSportsChannels()

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-5">
      <button onClick={() => navigate('/sports')}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors group">
        <ArrowLeft weight="bold" size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to sports
      </button>

      {/* Main match card */}
      <div className={`rounded-2xl border p-6 md:p-8 ${
        isLive ? 'bg-red-500/5 border-red-500/20' : 'bg-surface border-white/6'
      }`} style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>

        {/* Top row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {match.competition_logo && (
              <img src={match.competition_logo} alt={match.competition}
                className="w-5 h-5 object-contain"
                onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
            )}
            <span className="text-sm font-bold text-primary-light">{match.competition}</span>
          </div>
          {isLive ? (
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full live-dot" /> {match.status_text}
            </span>
          ) : (
            <span className="text-sm text-muted">{formatMatchTime(match.time)}</span>
          )}
        </div>

        {/* Teams + score */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex flex-col items-center gap-3 text-center">
            <TeamLogo src={match.home_logo} name={match.home} size={80} />
            <h2 className="text-lg md:text-xl font-bold text-white leading-tight">{match.home}</h2>
            {homeWins && (
              <span className="text-[10px] bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">WINNER</span>
            )}
          </div>

          <div className="shrink-0 text-center px-4">
            {isLive || (isFinished && hasScore) ? (
              <div>
                <div className={`text-5xl font-black tabular-nums ${isLive ? 'text-red-400' : 'text-white'}`}>
                  {match.home_score ?? 0}
                  <span className="text-muted mx-2">–</span>
                  {match.away_score ?? 0}
                </div>
                {isFinished && draw && <p className="text-xs text-muted mt-1">Draw</p>}
                {isFinished && !draw && <p className="text-xs text-muted mt-1">Full Time</p>}
              </div>
            ) : (
              <div>
                <div className="text-3xl font-black text-muted">VS</div>
                <p className="text-sm text-white mt-1">{formatMatchTime(match.time)}</p>
                <p className="text-xs font-semibold mt-0.5"
                  style={{ color: match.status_text === 'Postponed' ? '#f59e0b' : '#10b981' }}>
                  {match.status_text}
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center gap-3 text-center">
            <TeamLogo src={match.away_logo} name={match.away} size={80} />
            <h2 className="text-lg md:text-xl font-bold text-white leading-tight">{match.away}</h2>
            {awayWins && (
              <span className="text-[10px] bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">WINNER</span>
            )}
          </div>
        </div>
      </div>

      {/* Watch on these channels */}
      {relatedChannels.length > 0 && (
        <div className="bg-surface border border-white/6 rounded-2xl p-4"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Television weight="duotone" size={15} className="text-primary-light" />
            Watch Live On
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {relatedChannels.map(ch => (
              <button key={ch.id}
                onClick={() => navigate(`/tv/watch/${encodeURIComponent(ch.id)}`, { state: ch })}
                className="flex items-center gap-2 p-2.5 bg-surface-2 rounded-xl hover:border-primary/40 border border-white/6 transition-all text-left group">
                <div className="w-10 h-8 rounded-lg overflow-hidden bg-bg shrink-0">
                  {ch.poster_url
                    ? <img src={ch.poster_url} alt={ch.title} className="w-full h-full object-cover"
                        onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Television weight="duotone" size={14} className="text-gray-700" />
                      </div>}
                </div>
                <span className="text-xs font-semibold text-white truncate group-hover:text-primary-light transition-colors">{ch.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Related fixtures */}
      {related.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-muted mb-3">More in {match.competition}</h3>
          <div className="space-y-2">
            {related.map((m, idx) => {
              const isL = m.status === 'live'
              const isF = m.status === 'finished'
              const hS  = m.home_score !== null && m.away_score !== null
              return (
                <button key={idx}
                  onClick={() => navigate(`/sports/fixture/${encodeURIComponent(`${m.home}___${m.away}`)}`, { state: m })}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface border border-white/6 hover:border-white/14 cursor-pointer transition-all">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <TeamLogo src={m.home_logo} name={m.home} size={20} />
                    <span className="text-xs font-medium text-white truncate">{m.home}</span>
                  </div>
                  <div className="shrink-0 text-xs font-bold text-center w-20">
                    {isL ? <span className="text-red-400">{m.home_score}–{m.away_score}</span>
                         : isF && hS ? <span className="text-gray-300">{m.home_score}–{m.away_score} FT</span>
                         : <span className="text-gray-500">{formatMatchTime(m.time)}</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-xs font-medium text-white truncate text-right">{m.away}</span>
                    <TeamLogo src={m.away_logo} name={m.away} size={20} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
